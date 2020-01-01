import React from "react";
import styled from "styled-components";

const Rankings = styled.ul`
  font-family: var(--font-primary), monospace;
  font-size: 16px;
  color: var(--color-text);
  margin-top: 30px;
  //   border: 5px solid green;
`;

const RankingsItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > button {
    cursor: pointer;
  }

  & > button:hover {
    color: ${props => {
      if (props.type === "1") {
        return "var(--color-accent-one)";
      } else if (props.type === "2") {
        return "var(--color-accent-two)";
      } else if (props.type === "3") {
        return "var(--color-accent-three)";
      }
    }};
  }
`;

const RankingsItemBadge = styled.span`
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

const rankingsArr = [
  {
    name: "Donald Trump",
    type: "1"
  },
  {
    name: "G20",
    type: "1"
  },
  {
    name: "Brexit",
    type: "1"
  },
  {
    name: "Ariana Grande",
    type: "2"
  },
  {
    name: "Ethereum",
    type: "3"
  },
  {
    name: "Cybertruck",
    type: "2"
  },
  {
    name: "Elon Musk",
    type: "3"
  },
  {
    name: "Ebola Virus",
    type: "3"
  },
  {
    name: "First Snow",
    type: "1"
  },
  {
    name: "Hong Kong Protests",
    type: "2"
  }
];

const RankingsComp = () => {
  return (
    <Rankings>
      {rankingsArr.map((item, idx) => {
        return (
          <RankingsItem type={item.type} key={item.name}>
            <button style={{ textAlign: "left" }}>
              {idx + 1}. {item.name}
            </button>
            <RankingsItemBadge type={item.type} />
          </RankingsItem>
        );
      })}
    </Rankings>
  );
};

export default RankingsComp;
