import React from "react";
import styled from "styled-components";

const Legend = styled.ul`
  position: absolute;
  right: 0;
  bottom: 0;
  font-family: var(--font-primary), monospace;
  font-size: 16px;
  color: var(--color-text);
  margin-top: auto;
  //   border: 5px solid green;
`;

const LegendItem = styled.li`
  //   display: inline;
`;

const RankingsItemBadge = styled.span`
  display: inline-block;
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

const LegendComp = () => {
  return (
    <Legend>
      <LegendItem>
        <span>General Entertainment</span>{" "}
        <RankingsItemBadge type="1"></RankingsItemBadge>
      </LegendItem>
      <LegendItem>
        People & Blogs <RankingsItemBadge type="2"></RankingsItemBadge>
      </LegendItem>
      <LegendItem>
        News & Politics <RankingsItemBadge type="3"></RankingsItemBadge>
      </LegendItem>
    </Legend>
  );
};

export default LegendComp;
