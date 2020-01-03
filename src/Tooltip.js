import React from "react";
import styled from "styled-components";
import { format } from "date-fns";

const Tooltip = styled.div`
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  width: 300px;
  border-radius: 5px;
  font-family: var(--font-primary), monospace;
  font-size: 16px;
  color: var(--color-text);
  background-color: #34494b;
  padding: 15px 30px;
`;

const TooltipHeader = styled.h2`
  display: inline-block;
  font-size: 16px;
  word-wrap: break-word;
`;

const RankingsItemBadge = styled.span`
  display: inline-block;
  margin-right: 10px;
  width: 10px;
  height: 10px;
  background-color: ${props => {
    if (props.type === "1") {
      return "var(--color-accent-one)";
    } else if (props.type === "2") {
      return "var(--color-accent-two)";
    } else if (props.type === "3") {
      return "var(--color-accent-three)";
    }
  }};
`;

const TooltipPara = styled.p`
  margin-top: 30px;
`;

const TooltipComp = ({ metric, region, dateFrom, dateTo }) => {
  return (
    <Tooltip id="tooltip">
      <RankingsItemBadge type="1" id="tooltip-badge" />
      <TooltipHeader id="tooltip-header"></TooltipHeader>
      <TooltipPara>
        <span id="tooltip-value">1131</span>{" "}
        {metric.charAt(0).toUpperCase() + metric.slice(1)} for{" "}
        <span id="tooltip-region"></span> between{" "}
        {format(new Date(dateFrom), "do MMMM yyyy")} and{" "}
        {format(new Date(dateTo), "do MMMM yyyy")}.
      </TooltipPara>
    </Tooltip>
  );
};

export default TooltipComp;
