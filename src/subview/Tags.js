import React, { Component } from "react";
import {Helmet} from "react-helmet";
import TitleComp from "../Title";
import Loading from "../components/Loading";
import * as d3 from "d3";
import { TAG_URL, category2Name } from "../Constant";
import '../styles/line.scss';
import '../styles/tag.scss';

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function parseDate(date_str) { // parse different format String
    let date;
    if (date_str.indexOf('GMT') !== -1) {
        date = new Date(date_str);
    }
    date_str = date_str.split(' ')[0].split('-');
    date = new Date(date_str[0], date_str[1]-1, date_str[2]);   
    return date;
}


class Tag extends Component {
    constructor({match, ...props}) {
        super(props);
        this.state = {
            id: null,
            results: [],
            similar: [],
            categories: [],
            regions: [],
            videos: null,
        };
        if (match.params.tagId) {
            this.state.id = match.params.tagId;
        }
    }

    async loadData() {
        const cachevalue = 'tag_'+this.state.id;
        return fetch(TAG_URL+'/'+this.state.id+'?start=2019-12-01')
        .then((response) => response.json())
        .then((responseJson)=> {
            return fetch(TAG_URL+'/'+this.state.id+'/similar').then((res)=>{
                return res.json();
            }).then((similar)=> {
                console.log(similar);
                responseJson.similar = similar.results;
                return responseJson;
            });
        })
        .then((responseJson) => {
            console.log('get');
            console.log(responseJson);
            if ('results' in responseJson) {
                this.setState((state)=>{
                    return { results: responseJson.results,
                        similar: responseJson.similar }
                });
            }
            localStorage.setItem(cachevalue, JSON.stringify(responseJson));
            return {
                results: responseJson.results,
                similar: responseJson.similar
            };
        }).catch((err)=>{
            const cachedHits = localStorage.getItem(cachevalue);
            let package_ = JSON.parse(cachedHits);
            if (cachedHits) {
                const cachedResult = { results: package_.results, similar: package_.similar };
                this.setState((state)=>{ 
                    return {results: package_.results, 
                        similar: package_.similar }});
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
    async preprocessData() {
        const data = this.state.results;
        if (data.length === 0) {
            return [];
        }
        const videos = {};
        const categories = {};
        const regions = {};
        const likes = [], views = [], ranks=[], comments=[], dislikes= [];
        data.forEach(d=>{
            d.date = parseDate(d.time);
            d.videos.forEach(vid=>{
                if (!(vid in videos)) {
                    videos[vid] = {
                        start: new Date(),
                        end: d.date,
                    }
                }
                var maxDate = Math.max.apply(null, [d.date, videos[vid].end]);
                var minDate = Math.min.apply(null, [d.date, videos[vid].start]);
                videos[vid].start = new Date(minDate);
                videos[vid].end = new Date(maxDate);
            });
            if (!(d.region in regions)) {
                regions[d.region] = 1;
            }
            d.category.forEach((cat)=>{
                if (!(cat in categories)) {
                    categories[cat] = 1;
                }
            });
            likes.push({
                value: d.stats.like,
                date: d.date
            });
            views.push({
                value: d.stats.view,
                date: d.date,
            })
            ranks.push({
                value: d.stats.rank,
                date: d.date,
            })
            comments.push({
                value: d.stats.comment,
                date: d.date,
            })
            dislikes.push({
                value: d.stats.dislike,
                date: d.date,
            })
        });
        // console.log(data[0]);
        return {
            dislikes: dislikes,
            likes: likes,
            comments: comments,
            ranks: ranks,
            views: views,
            videos: videos,
            categories:categories,
            regions: regions
        }
    }
    async componentDidMount() {
        this.loadData().then((res)=>{
            // console.log(this.state.results);
            this.preprocessData().then((output)=>{
                if (output.length === 0) {
                    return;
                }
                if (this.state.videos !== null) {
                    this.state.videos = output.videos;
                }
                if (this.state.categories.length  === 0){
                    for( var cat in output.categories) {
                        this.state.categories.push(cat);
                    }
                    console.log(this.state.categories);
                    this.state.categories = this.state.categories.filter(onlyUnique);
                }
                if (this.state.regions.length  === 0){
                    for( var cat in output.regions) {
                        this.state.regions.push(cat);
                    }
                    this.state.regions = this.state.regions.filter(onlyUnique);
                    
                }
                this.setState({});
                this.drawTimelineChart(output.videos);
                this.drawTimeSeriesLineChart('Ranks', output.ranks);
                this.drawTimeSeriesLineChart('Views', output.views);
                this.drawTimeSeriesLineChart('Likes', output.likes);
                this.drawTimeSeriesLineChart('Dislike', output.dislikes);
                this.drawTimeSeriesLineChart('Comment', output.comments);
            });
        });
    }

    drawTimelineChart(videos, width=900) {
        const items = [];
        let lane_idx=  0;
        const dates = [], lanes = [];
        for (var key in videos) {
            var end = videos[key].end;
            end = new Date(end.getTime() + (86400000));
            items.push({
                id: key,
                start: videos[key].start,
                end: end,
                lane: lane_idx,
                color: d3.hsl(Math.random()*360,0.75,0.75),
            });
            lanes.push(key);
            dates.push(videos[key].start);
            dates.push(end);
            lane_idx+=1;
        }
        const height = (lane_idx+1)*60;
        console.log(items);
        const margin = {top: 50, right: 100, bottom: 50, left: 100};
        const svg = d3.select(".tag-container").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xScale = d3.scaleTime()
            .domain([d3.min(dates), d3.max(dates)])
            .range([0, width]); 
        var yScale = d3.scaleBand()
            .domain(lanes) 
            .range([height, 0]); 
        svg.append('text')
            .attr('class', 'chartTitle')
            .attr('x', 0)
            .attr('y', -20)
            .html('Video Trending Timeline')
        svg.selectAll(".bar")
            .data(items)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return xScale(d.start); })
            .attr("width", function(d) {return xScale(d.end) - xScale(d.start); } )
            .attr("y", function(d) { return yScale(d.id); })
            .attr("fill", d=>d.color)
            .attr("height", yScale.bandwidth());
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));
        svg.append("g")
            .attr("class", "timeline-y-axis")
            .call(d3.axisLeft(yScale));
        svg.selectAll(".timeline-y-axis .tick").each(function(d,i){        
                d3.select(this)
                  .append('image')
                  .attr('xlink:href', 'https://img.youtube.com/vi/'+d+'/sddefault.jpg')
                  .attr('x',-120)
                  .attr('y',-32)
                  .attr('width', 128)
                  .attr('height',64);
             }).on("click", function(d){
                document.location.href = "https://www.youtube.com/watch?v=" + d;
            });
    }

    drawTimeSeriesLineChart(title, data, height=360, width=900) {
        let maxValue=-1, minValue=10000000;
        const dates = [];
        const margin = {top: 50, right: 50, bottom: 50, left: 80}
        const svg = d3.select(".tag-container").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        data.forEach(d=>{
            maxValue = (maxValue < d.value) ? d.value  : maxValue;
            minValue = (minValue > d.value) ? d.value  : minValue;
            dates.push(d.date);
        });
        const sorted_data = data.sort((a, b)=>{
            return a.date - b.date;
        });
        // console.log('sort');
        // console.log(sorted_data[0].date, sorted_data[sorted_data.length-1].date);
        var xScale = d3.scaleTime()
            .domain([d3.min(dates), d3.max(dates)])
            .range([0, width]); 
        let intervals = [minValue, maxValue];
        if (title === 'Ranks') {
            intervals = [maxValue, minValue];
        }
        var yScale = d3.scaleLinear()
            .domain(intervals) 
            .range([height, 0]); 
        
        var line = d3.line()
            .x(function(d, i) { return xScale(d.date); }) // set the x values for the line generator
            .y(function(d) { return yScale(d.value); }) // set the y values for the line generator 
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        svg.append('text')
            .attr('class', 'chartTitle')
            .attr('x', 0)
            .attr('y', -20)
            .html(title)
        // 3. Call the x axis in a group tag
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
        svg.append("path")
            .datum(sorted_data)
            .attr("class", "line")
            .attr("d", line);
        svg.selectAll(".dot")
            .data(sorted_data)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", d=> xScale(d.date) )
            .attr("cy", d => yScale(d.value))
            .attr("r", 5)
    }


    render() {
        const components = [];
        components.push(<h2 class="tag-title">#{this.state.id}</h2>);
        if (this.state.categories.length !== 0) {
            let context = "";
            components.push(<p class="tag-title">
                Category: 
                { this.state.categories.map((cat)=> ( ' '+category2Name[parseInt(cat) ]) ) }
            </p>);
        }
        if (this.state.similar && this.state.similar.length != 0) {
            let context = "";
            components.push(<p class="tag-title">
                Similar Tags: 
                { this.state.similar.slice(1, 10).map((cat)=> ( 
                    <a href={'/tag/'+cat.tag}>{' #'+cat.tag}</a>
                )) }
            </p>);
        }
        let content = (
            <div className="tag-container line-container">
                <div class="title-container">
                    {components}
                </div>
            </div>
        );

        if (this.state.results.length === 0) {
            content = (<Loading/>);
        }
        return (
            <div id="region">
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Tag about #{this.state.id}</title>
                    <description>Statistic about #{this.state.id} from Youtube</description>
                </Helmet>
                <div className="color-bar"></div>
                <navbar>
                    <a href="/">
                    <TitleComp></TitleComp> 
                    </a>
                </navbar>
                {content}
            </div>
        )
    }
}

export default Tag;