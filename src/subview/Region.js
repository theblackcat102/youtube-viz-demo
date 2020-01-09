import React, { Component } from "react";
import {Helmet} from "react-helmet";
import { MAIN_URL } from "../Constant";
import { dayInt2Date, formatDate } from "../components/Utils";
import TitleComp from "../Title";
import Loading from "../components/Loading";
import * as d3 from "d3";
import '../styles/race.scss';
import '../styles/fontawesome.css';
import '../styles/region.scss';
import '../styles/style.scss';

const MAX_HEIGHT = 600;
const BreakException = {};

const halo = function(text, strokeWidth) {
    text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
    .style('fill', '#ffffff')
    .style( 'stroke','#ffffff')
    .style('stroke-width', strokeWidth)
    .style('stroke-linejoin', 'round')
    .style('opacity', 1);
}


class Region extends Component {
    constructor({match, ...props}) {
        super(props);
        this.state = {
            id: null,
            topic: [],
            name: null,
            order_max: false,
            maxValue: 100,
        };
        if (match.params.regionId) {
            this.state.id = match.params.regionId;
        }
    }

    async loadData() {
        const cachevalue = 'region_'+this.state.id;
        let startDate = new Date();
        let endDate = startDate.getTime() - (1000 * 60 * 60 * 24 * 12);
        endDate = formatDate(new Date(endDate));
        startDate = formatDate(startDate);
        // sorry I gonna make this sad param name
        return fetch(MAIN_URL+'/'+this.state.id+'?start='+endDate+'&end='+startDate)
        .then((response) => response.json())
        .then((responseJson) => {
            if ('topic' in responseJson) {
                this.setState((state)=>{
                    return { topic: responseJson.topic,
                        name: responseJson.name, }
                });
            }
            localStorage.setItem(cachevalue, JSON.stringify(responseJson));
            return responseJson;
        }).catch((err)=>{
            const cachedHits = localStorage.getItem(cachevalue);
            if (cachedHits) {
                const parsedResult = JSON.parse(cachedHits);
                const cachedResult = { 
                    topic: parsedResult.topic,
                    name: parsedResult.name };
                this.setState(()=>{ return cachedResult; });
            }
        });
    }

    handlerRefresh(self) {
        return (resolve, reject)=> {
          return self.loadData().then((res)=>{
            resolve();
          }).catch(msg => {
            reject();
          });
        }
    }

    async componentDidMount() {
        this.loadData().then((res)=>{
            this.initData().then((trending_data)=>{
                console.log(trending_data);
                this.drawRaceChart(trending_data);
            });
        });
    }

    async initData() {
        let data = this.state.topic;
        let order_max = this.state.order_max;
        const maxValue = this.state.maxValue;
        const defaultValue = order_max ? 0 : maxValue;
        if (data.length === 0) {
            return [];
        }
        let cluster = {};
        let datemap = {};
        data.forEach(d=>{
            d.value = d.rank;
            try{
                const date_str = d.date.split('T')[0].split('-');
                d.date = new Date(date_str[0], date_str[1]-1, date_str[2]);
                d.name = d.tag;
                if (!(d.date in cluster)) {
                    cluster[d.date] = {};
                    datemap[d.date] = {};
                }
                if (!(d.rank in cluster[d.date])) {
                    cluster[d.date][d.rank] = [];
                    datemap[d.date][d.rank] = {};
                }
                cluster[d.date][d.rank].push(d.name);
                datemap[d.date][d.name] = d.rank;
            } catch(e) {
                console.log(d);
                throw BreakException;
            }
        });
        var nameColor = {};
        let trending_data = [];
        for (let date in cluster) {
            for (let rank in cluster[date]) {
                const current_date = new Date(date);
                var yesterday = current_date.getTime() - 1000 * 60 * 60 * 24;   // current date's milliseconds - 1,000 ms * 60 s * 60 mins * 24 hrs * (# of days beyond one to go back)
                yesterday = new Date(yesterday);
                const name = cluster[date][rank][0];
                let previousRank = defaultValue;
                if ( (yesterday in datemap) && (name in datemap[yesterday]) ) {
                    previousRank = datemap[yesterday][name];
                }
                if (!(name in nameColor)) {
                    nameColor[name] = d3.hsl(Math.random()*360,0.75,0.75);
                }
                let value = isNaN(parseFloat(rank)) ? defaultValue : parseFloat(rank);
                if (!order_max) { // invert value such that smallest is largest
                    value = maxValue - value;
                }
                previousRank = isNaN(parseFloat(previousRank)) ? defaultValue : parseFloat(previousRank);
                if (!order_max) {
                    previousRank = maxValue - previousRank;
                }
                // inverted rank
                trending_data.push({
                    name: name,
                    value: value,
                    lastValue: previousRank,
                    date: current_date,
                    day: Math.floor(current_date.getTime() / (1000*60*60*24)),
                    color: nameColor[name]
                })
            }
        }
        console.log('Trend data size', trending_data.length);
        trending_data = trending_data.sort((a, b)=>{
            return a.date > b.date;
        });
        return trending_data;
    }


    drawRaceChart(trending_data, day=null) {
        if ( trending_data === undefined || trending_data.length === 0) {
            return;
        }

        let order_max = this.state.order_max;
        const maxValue = this.state.maxValue;
        const tickDuration = 1000,
            top_n = 12,
            height = MAX_HEIGHT,
            dateTextRightMargin = 200,
            dateTextTopMargin = 200,
            regionTextTopMargin = 120,
            buttonRightMargin = 480,
            buttonTopMargin = 250,
            axisWidth = 960;
        
        const width = window.innerWidth;
        var svg = d3.select("svg")
            .attr("width", width)
            .attr("height", MAX_HEIGHT);

        const margin = {
            top: 80,
            right: 0,
            bottom: 5,
            left: 0
        };

        let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);

        if (day === null)
            day = trending_data[0].day;

        const end_day = trending_data[trending_data.length-1].day;

        let daySlice = trending_data.filter(d => d.day == day && !isNaN(d.value))
            .sort((a,b) => b.value - a.value)
            .slice(0, top_n);

        daySlice.forEach((d,i) => d.rank = i);

        let x = d3.scaleLinear()
            .domain([0, d3.max(daySlice, d => d.value)])
            .range([margin.left, axisWidth-margin.right-65]);
        let y = d3.scaleLinear()
            .domain([top_n, 0])
            .range([height-margin.bottom, margin.top]);
        let xAxis = d3.axisTop()
            .scale(x)
            .ticks(width > 500 ? 5:2)
            .tickSize(-(height-margin.top-margin.bottom))
            .tickFormat(d => d3.format(',')(d));
        svg.append('g')
            .attr('class', 'axis xAxis')
            .attr('transform', `translate(0, ${margin.top})`)
            .call(xAxis)
            .selectAll('.tick line')
            .classed('origin', d => d == 0);
        svg.selectAll('rect.bar')
            .data(daySlice, d => d.name)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', x(0)+1)
            .attr('width', d => x(d.value)-x(0)-1)
            .attr('y', d => y(d.rank)+5)
            .style('fill', d => d.color )
            .attr('height', y(1)-y(0)-barPadding)
            .on('click', d=>{
                window.open("/tag/"+d.name);
            });
        svg.selectAll('text.label')
            .data(daySlice, d => d.name)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.value)-8)
            .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
            .style('text-anchor', 'end')
            .html(d => d.name)
            .on('click', (d)=>{
                window.open("/tag/"+d.name);
            });
        svg.selectAll('text.valueLabel')
            .data(daySlice, d => d.name)
            .enter()
            .append('text')
            .attr('class', 'valueLabel')
            .attr('x', d => x(d.value)+5)
            .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
            .text(d => {
                if (order_max)
                    return d3.format(',.0f')(d.value);
                return d3.format(',.0f')( maxValue - d.value);
            });

        let dateText = svg.append('text')
            .attr('class', 'dateText')
            .attr('x', width-dateTextRightMargin)
            .attr('y', dateTextTopMargin)
            .style('text-anchor', 'end')
            .html(formatDate(dayInt2Date(day)))
            .call(halo, 10);
        svg.append('text')
            .attr('class', 'regionText')
            .attr('x', width-dateTextRightMargin)
            .attr('y', regionTextTopMargin)
            .style('text-anchor', 'end')
            .html(this.state.name)
            .call(halo, 10);

        const ticker = d3.interval(e => {
            let prevDaySlice = daySlice;
            daySlice = trending_data.filter(d => d.day == day && !isNaN(d.value))
                .sort((a,b) => b.value - a.value)
                .slice(0, top_n);
            
            daySlice.forEach((d,i) => d.rank = i);
            if (daySlice.length == 0) {
                daySlice = prevDaySlice;
            }

            x.domain([0, d3.max(daySlice, d => d.value)]);
            svg.select('.xAxis')
                .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .call(xAxis);

            let bars = svg.selectAll('.bar').data(daySlice, d => d.name);
            bars.enter()
                .append('rect')
                .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
                .attr('x', x(0)+1)
                .attr('width', d => x(d.value)-x(0)-1)
                .attr('y', d => y(top_n+1)+5)
                .style('fill', d => d.color)
                .attr('height', y(1)-y(0)-barPadding)
                .on('click', d=>{
                    window.open("/tag/"+d.name);
                })
                .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attr('y', d => y(d.rank)+5);

            bars
            .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('width', d=>x(d.value)-x(0)-1)
                .attr('y', d => y(d.rank)+5);
            bars
            .exit()
            .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('width', d=>x(d.value)-x(0)-1)
                .attr('y', d => y(top_n+1)+5)
                .remove();

            let labels = svg.selectAll('.label')
                .data(daySlice, d => d.name);

            labels
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.value)-8)
            .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
            .style('text-anchor', 'end')
            .on('click', (d)=>{
                window.open("/tag/"+d.name);
            })
            .html(d => d.name)
            .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);


            labels
                .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('x', d => x(d.value)-8)
                .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

            labels
                .exit()
                .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('x', d => x(d.value)-8)
                .attr('y', d => y(top_n+1)+5)
                .remove();

            let valueLabels = svg.selectAll('.valueLabel')
                .data(daySlice, d => d.name);

            valueLabels
                .enter()
                .append('text')
                .attr('class', 'valueLabel')
                .attr('x', d => x(d.value)+5)
                .attr('y', d => y(top_n+1)+5)
                .text(d =>  { 
                    if (order_max)
                        return d3.format(',.0f')(d.lastValue);
                    return d3.format(',.0f')(maxValue-d.lastValue);
                })
                .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

            valueLabels
                .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('x', d => x(d.value)+5)
                .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
                .tween("text", function(d) {
                    let i = d3.interpolateRound(d.lastValue, d.value);
                    return function(t) {
                    this.textContent = d3.format(',')(i(t));
                    };
                });


            valueLabels
            .exit()
            .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('x', d => x(d.value)+5)
                .attr('y', d => y(top_n+1)+5)
                .remove();

            dateText.html(formatDate(dayInt2Date(day)));

            if(day == (end_day))
                ticker.stop();
            day = day+1;
        }, tickDuration);

        svg.append('text')
            .attr('x', width-buttonRightMargin+100)
            .attr('y', buttonTopMargin)
            .attr('font-family', 'Space Mono, monospace')
            .text('Restart')
            .on('click',(d)=>{
                console.log('Rstart');
                svg.selectAll("*").remove();
                this.drawRaceChart(trending_data);
            });
        svg.append('text')
            .attr('x', width-buttonRightMargin+60)
            .attr('y', buttonTopMargin)
            .text('/');
        svg.append('text')
            .attr('x', width-buttonRightMargin+170)
            .attr('y', buttonTopMargin)
            .text('/');

        svg.append('text')
            .attr('x', width-buttonRightMargin+200)
            .attr('y', buttonTopMargin)
            .text('Resume')
            .on('click',(d)=>{
                console.log('Resume');
                svg.selectAll("*").remove();
                this.drawRaceChart(trending_data, day=day);
            });
        svg.append('text')
            .attr('x', width-buttonRightMargin)
            .attr('y', buttonTopMargin)
            .text('Stop')
            .on('click', (d)=>{
                console.log('Stop');
                ticker.stop();
            });
    }

    render() {
        // this.drawRaceChart();
        let content = (
            <div className="chart-container">
                <svg></svg>
            </div>
        );

        if (this.state.topic.length === 0) {
            content = (<Loading/>);
        }
        return (
            <div id="region">
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Race Chart in {this.state.id}</title>
                </Helmet>
                <div className="color-bar"></div>
                <navbar>
                    <TitleComp></TitleComp> 
                </navbar>
                {content}
            </div>
        )
    }
}

export default Region;