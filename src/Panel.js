import React from "react";
import styled from "styled-components";

import Title from "./Title";
import ControlGroup from "./ControlGroup";
import Rankings from "./Rankings";

const Panel = styled.div`
  width: 40vw;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 0 80px;

  @media (max-width: 1100px) {
    padding: 30px 50px;
  }

  @media (max-width: 768px) {
    width: 100%;
  }

  @media (max-width: 480px) {
    padding: 30px 20px;
  }
`;

const Loading = styled.div`
  margin-top: 30px;
  font-family: var(--font-primary), monospace;
  font-size: 16px;
  color: var(--color-text);
`;

const RankingsItemBadge = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: ${props => {
    if (props.type === 1) {
      return "var(--color-accent-one)";
    } else if (props.type === 2) {
      return "var(--color-accent-two)";
    } else if (props.type === 3) {
      return "var(--color-accent-three)";
    }
  }};
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  font-family: var(--font-primary), monospace;
  font-size: 16px;
  color: var(--color-text);

  @media (max-width: 1100px) {
    margin-top: 30px;
  }
`;

const PanelComp = ({
  data,
  metric,
  setMetric,
  region,
  setRegion,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo
}) => {
  return (
    <Panel>
      <Title />
      <ControlGroup
        setMetric={setMetric}
        region={region}
        setRegion={setRegion}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
      />
      {data ? (
        <Rankings data={data} metric={metric} region={region} />
      ) : (
        <Loading>Loading Rankings...</Loading>
      )}
      <Legend>
        <span>
          <RankingsItemBadge type={1} /> = Entertainment
        </span>
        <span>
          <RankingsItemBadge type={2} /> = People & Blogs
        </span>
        <span>
          <RankingsItemBadge type={3} /> = News & Current Affairs
        </span>
      </Legend>
    </Panel>
  );
};

export default PanelComp;
