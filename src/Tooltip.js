import React from "react";
import styled from "styled-components";

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

  &::after {
    // content: "";
    // position: absolute;
    // width: 0;
    // height: 0;
    // border-width: 10px;
    // border-style: solid;
    // border-color: transparent #34494b transparent transparent;
    // top: 0;
    // left: -20px;
  }
`;

const TooltipHeader = styled.h2`
  display: inline-block;
  font-size: 16px;
  word-wrap: break-word;
`;

const RankingsItemBadge = styled.span`
  display: inline-block;
  margin-left: 10px;
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

const TooltipComp = ({ metric, region }) => {
  return (
    <Tooltip id="tooltip">
      <TooltipHeader id="tooltip-header">Donald Trump</TooltipHeader>
      <RankingsItemBadge type="1" id="tooltip-badge" />
      <TooltipPara>
        <span id="tooltip-value">1131</span>{" "}
        {metric.charAt(0).toUpperCase() + metric.slice(1)} for{" "}
        {region.charAt(0).toUpperCase() + region.slice(1)} between 19th November
        2019 and 23rd November 2019.
      </TooltipPara>
    </Tooltip>
  );
};

export default TooltipComp;
