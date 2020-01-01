import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ky from "ky";

import Defaults from "./Defaults";
import Panel from "./Panel";
import Viz from "./Viz";
import Tooltip from "./Tooltip";

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
  const [rawData, setRawData] = useState(null);
  const [metric, setMetric] = useState("views");
  const [region, setRegion] = useState("Global");
  const [dateFrom, setDateFrom] = useState("2019-12-01");
  const [dateTo, setDateTo] = useState("2019-12-31");

  useEffect(() => {
    setRawData(null);
    const fetchData = async () => {
      const fetched = await ky
        .get(
          `https://api.notify.institute/main?unit=day&region=all&start=${dateFrom}&end=${dateTo}&rw=1&top=10`,
          { timeout: 60000 }
        )
        .json();

      setRawData(fetched.results);
    };

    fetchData();
  }, [dateTo, dateFrom]);

  return (
    <div className="App">
      <Defaults />
      <AccentBar />
      <Dashboard>
        <Panel
          setMetric={setMetric}
          region={region}
          setRegion={setRegion}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
        {rawData ? (
          <Viz
            rawData={rawData}
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
      <Tooltip metric={metric} region={region} />
    </div>
  );
}

export default App;
