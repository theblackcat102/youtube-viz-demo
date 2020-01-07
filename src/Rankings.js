import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { hierarchy } from "d3-hierarchy";

const Rankings = styled.ul`
  font-family: var(--font-primary), monospace;
  font-size: 16px;
  color: var(--color-text);

  @media (max-width: 1100px) {
    margin-top: 30px;
  }
`;

const RankingsItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RankingsItemBadge = styled.span`
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

const RankingsComp = ({ data, metric, region }) => {
  const [rankings, setRankings] = useState(null);

  useEffect(() => {
    const processedRoot = hierarchy(data)
      .sum(d => d[metric])
      .sort(function(a, b) {
        return b.value - a.value;
      });

    const processedRankings = processedRoot
      .descendants()
      .find(des => des.data.name === region)
      .leaves()
      .slice(0, 10);

    setRankings(processedRankings);
  }, [data, metric, region]);

  return (
    <Rankings>
      {rankings &&
        rankings.map((rank, idx) => {
          return (
            <RankingsItem key={idx}>
              <a href={'/tag/'+rank.data.name} >
              {idx + 1}. {rank.data.name}
              <RankingsItemBadge type={rank.data.type} />
              </a>
            </RankingsItem>
          );
        })}
    </Rankings>
  );
};

export default RankingsComp;
