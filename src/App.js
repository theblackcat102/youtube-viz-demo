import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ky from "ky";
import { format, subWeeks } from "date-fns";

import Defaults from "./Defaults";
import Panel from "./Panel";
import Viz from "./Viz";
import Tooltip from "./Tooltip";

const regionMapping = {
  GB: "Europe",
  CH: "Europe",
  NL: "Europe",
  IE: "Europe",
  DE: "Europe",
  DK: "Europe",
  RU: "Europe",
  IT: "Europe",
  FR: "Europe",
  SK: "Europe",
  GR: "Europe",
  PT: "Europe",
  SG: "Asia",
  HK: "Asia",
  VN: "Asia",
  MY: "Asia",
  IN: "Asia",
  ID: "Asia",
  PH: "Asia",
  KZ: "Asia",
  AE: "Asia",
  TH: "Asia",
  JP: "Asia",
  TW: "Asia",
  US: "North America",
  PR: "North America",
  PA: "North America",
  CA: "North America",
  MX: "North America",
  BR: "South America",
  AR: "South America",
  AU: "Oceania",
  NZ: "Oceania"
};

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
  // border: 1px solid blue;

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

function App() {
  const [data, setData] = useState(null);
  const [metric, setMetric] = useState("views");
  const [region, setRegion] = useState("Global");
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
          `https://api.notify.institute/main?unit=day&region=all&start=${dateFrom}&end=${dateTo}&rw=1&top=10`,
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

        for (const d of fetched.results) {
          switch (regionMapping[d.id]) {
            case "Europe":
              formattedData.children[0].children.push({
                name: d.name,
                children: d.topic.map(t => {
                  return {
                    name: t.tag,
                    type: Math.floor(Math.random() * 3) + 1,
                    popularity: Math.round(Math.random() * 10000),
                    views: Math.round(t.view),
                    likes: Math.round(t.like),
                    comments: Math.round(t.comment)
                  };
                })
              });
              break;
            case "Asia":
              formattedData.children[1].children.push({
                name: d.name,
                children: d.topic.map(t => {
                  return {
                    name: t.tag,
                    type: Math.floor(Math.random() * 3) + 1,
                    popularity: Math.round(Math.random() * 10000),
                    views: Math.round(t.view),
                    likes: Math.round(t.like),
                    comments: Math.round(t.comment)
                  };
                })
              });
              break;
            case "North America":
              formattedData.children[2].children.push({
                name: d.name,
                children: d.topic.map(t => {
                  return {
                    name: t.tag,
                    type: Math.floor(Math.random() * 3) + 1,
                    popularity: Math.round(Math.random() * 10000),
                    views: Math.round(t.view),
                    likes: Math.round(t.like),
                    comments: Math.round(t.comment)
                  };
                })
              });
              break;
            case "South America":
              formattedData.children[3].children.push({
                name: d.name,
                children: d.topic.map(t => {
                  return {
                    name: t.tag,
                    type: Math.floor(Math.random() * 3) + 1,
                    popularity: Math.round(Math.random() * 10000),
                    views: Math.round(t.view),
                    likes: Math.round(t.like),
                    comments: Math.round(t.comment)
                  };
                })
              });
              break;
            case "Oceania":
              formattedData.children[4].children.push({
                name: d.name,
                children: d.topic.map(t => {
                  return {
                    name: t.tag,
                    type: Math.floor(Math.random() * 3) + 1,
                    popularity: Math.round(Math.random() * 10000),
                    views: Math.round(t.view),
                    likes: Math.round(t.like),
                    comments: Math.round(t.comment)
                  };
                })
              });
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

export default App;
