import React from "react";
import styled from "styled-components";

import Title from "./Title";
import ControlGroup from "./ControlGroup";
import Rankings from "./Rankings";

const Panel = styled.div`
  width: 40vw;
  display: flex;
  flex-direction: column;
  padding: 60px 80px;
  //   border: 5px solid green;

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
      <Rankings data={data} metric={metric} region={region} />
    </Panel>
  );
};

export default PanelComp;
