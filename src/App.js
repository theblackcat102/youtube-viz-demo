import React, { useState, useEffect, useRef, Component } from "react";
import {Helmet} from "react-helmet";
import styled from "styled-components";
import ky from "ky";
import { format, subWeeks } from "date-fns";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Defaults from "./Defaults";
import Panel from "./Panel";
import Viz from "./Viz";
import Tooltip from "./Tooltip";
import { regionMapping, categoryMapping, MAIN_URL } from './Constant';
import Tag from "./subview/Tags";
import Region from "./subview/Region";


const AccentBar = styled.div`
  height: 5px;
  background: linear-gradient(
    90deg,
    rgba(129, 5, 216, 1) 0%,
    rgba(237, 12, 239, 1) 50%,
    rgba(28, 174, 176, 1) 100%
  );
`;

const Dashboard = styled.div`
  display: flex;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: var(--font-primary), monospace;
  font-size: 16px;
  color: var(--color-text);
  width: 60vw;
  height: ${window.innerHeight - 5}px;

  @media (max-width: 768px) {
    margin: 30px 0;
    width: 100vw;
    height: 100vw;
  }
`;

function formatRegion(d) {
  return {
    name: d.name,
    id: d.id,
    children: d.topic.map(t => {
      return {
        name: t.tag,
        type: categoryMapping[t.category[0]]
          ? categoryMapping[t.category[0]]
          : Math.floor(Math.random() * 3) + 1,
        views: Math.round(t.view),
        likes: Math.round(t.like),
        comments: Math.round(t.comment)
      };
    })
  };
}

function Main() {
  const [data, setData] = useState(null);
  const [metric, setMetric] = useState("views");
  const [region, setRegion] = useState("Asia");
  const [dateFrom, setDateFrom] = useState(
    format(subWeeks(new Date(), 1), "yyyy-MM-dd")
  );
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const fetchID = useRef(null);

  useEffect(() => {
    setData(null);
    fetchID.current = `${dateFrom}-${dateTo}`;
    const fetchData = async () => {
      const fetched = await ky
        .get(
          MAIN_URL+`?unit=day&region=all&start=${dateFrom}&end=${dateTo}&rw=1&top=10`,
          { timeout: 60000 }
        )
        .json();
      if (fetchID.current === `${dateFrom}-${dateTo}`) {
        const formattedData = {
          name: "Global",
          children: [
            { name: "Europe", children: [] },
            { name: "Asia", children: [] },
            { name: "North America", children: [] },
            { name: "South America", children: [] },
            { name: "Oceania", children: [] }
          ]
        };

        console.log(fetched.results);

        for (const d of fetched.results) {
          switch (regionMapping[d.id]) {
            case "Europe":
              formattedData.children[0].children.push(formatRegion(d));
              break;
            case "Asia":
              formattedData.children[1].children.push(formatRegion(d));
              break;
            case "North America":
              formattedData.children[2].children.push(formatRegion(d));
              break;
            case "South America":
              formattedData.children[3].children.push(formatRegion(d));
              break;
            case "Oceania":
              formattedData.children[4].children.push(formatRegion(d));
              break;
            default:
              break;
          }
        }

        setData(formattedData);
      }
    };
    fetchData();
  }, [dateFrom, dateTo]);

  return (
    <div className="App">
      <Helmet>
          <meta charSet="utf-8" />
          <title>Youtube Trend Visualization</title>
      </Helmet>
      <Defaults />
      <AccentBar />
      <Dashboard>
        <Panel
          data={data}
          metric={metric}
          setMetric={setMetric}
          region={region}
          setRegion={setRegion}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
        {data ? (
          <Viz
            data={data}
            metric={metric}
            region={region}
            setRegion={setRegion}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        ) : (
          <Loading>Loading Visualisation...</Loading>
        )}
      </Dashboard>
      <Tooltip
        metric={metric}
        region={region}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </div>
  );
}

class App extends Component {
  render() {
    return (
      <Router>
        <Route exact path="/" component={Main} />
        <Route path="/tag/:tagId" component={Tag} />
        <Route path="/region/:regionId" component={Region} />

      </Router>
    )
  }
}

export default App;
