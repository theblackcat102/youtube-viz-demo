import React, { Component } from "react";
import { MAIN_URL } from "../Constant";
import * as d3 from "d3";
import '../styles/race.css';

const MAX_HEIGHT = 600;
const BreakException = {};

function dayInt2Date(day) {
    const date = new Date(day * 1000 * 60 * 60 * 24)
    return date;
}

function formatDate(date) {
    return date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate();
}

function parseDate(date_str) { // parse different format String
    let date;
    if (date_str.indexOf('GMT') !== -1) {
        date = new Date(date_str);
    }
    date_str = date_str.split('T')[0].split('-');
    date = new Date(date_str[0], date_str[1]-1, date_str[2]);   
    return date;
}

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
        };
        if (match.params.regionId) {
            this.state.id = match.params.regionId;
        }
    }

    async loadData() {
        const cachevalue = 'region_'+this.state.id;
        return fetch(MAIN_URL+'/'+this.state.id+'?start=2019-12-20')
        .then((response) => response.json())
        .then((responseJson) => {
            if ('topic' in responseJson) {
                this.setState((state)=>{
                    return { topic: responseJson.topic }
                });
            }
            localStorage.setItem(cachevalue, JSON.stringify(responseJson));
            return responseJson;
        }).catch((err)=>{
            const cachedHits = localStorage.getItem(cachevalue);
            if (cachedHits) {
                const cachedResult = { topic: JSON.parse(cachedHits).topic };
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
            this.drawRaceChart();
        });
    }

    drawRaceChart() {
        let data = this.state.topic;
        let order_max = false;
        const defaultValue = order_max ? 0 : 100;
        const maxValue = 100;
        if (data.length == 0) {
            return;
        }
        var svg = d3.select("body").append("svg")
            .attr("width", 960)
            .attr("height", MAX_HEIGHT);


        var tickDuration = 500;
        var top_n = 12;
        var height = MAX_HEIGHT;
        var width = 960;

        const margin = {
            top: 80,
            right: 0,
            bottom: 5,
            left: 0
        };

        let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);


        console.log('Data size', data.length);
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

        let day = trending_data[0].day;
        const end_day = trending_data[trending_data.length-1].day;
        const start_day = trending_data[0].day;

        console.log(trending_data[0]);

        let daySlice = trending_data.filter(d => d.day == day && !isNaN(d.value))
            .sort((a,b) => b.value - a.value)
            .slice(0, top_n);

        daySlice.forEach((d,i) => d.rank = i);


        let x = d3.scaleLinear()
            .domain([0, d3.max(daySlice, d => d.value)])
            .range([margin.left, width-margin.right-65]);
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
            .attr('height', y(1)-y(0)-barPadding);
        svg.selectAll('text.label')
            .data(daySlice, d => d.name)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.value)-8)
            .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
            .style('text-anchor', 'end')
            .html(d => d.name);
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
            .attr('x', width-margin.right)
            .attr('y', height-10)
            .style('text-anchor', 'end')
            .html(formatDate(dayInt2Date(day)))
            .call(halo, 10);

        let ticker = d3.interval(e => {
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

            let valueLabels = svg.selectAll('.valueLabel').data(daySlice, d => d.name);

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
        },tickDuration);
    }

    render() {
        this.drawRaceChart();

        return (
            <div id="region"></div>
        )
    }
}

export default Region;