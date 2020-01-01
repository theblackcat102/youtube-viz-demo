import React from "react";
import styled, { keyframes } from "styled-components";

const TitleGroup = styled.div`
  display: inline-block;
  //   border: 1px solid red;
`;

const Title = styled.h1`
  font-family: var(--font-primary), monospace;
  font-weight: 700;
  color: var(--color-text);
`;

const CursorBlink = keyframes`
  0% {
    visibility: visible;
    background-color: var(--color-accent-one);
  }

  16.5% {
    visibility: hidden;
    background-color: transparent;
  }

  33% {
    visibility: visible;
    background-color: var(--color-accent-two);
  }

  49.5% {
    visibility: hidden;
    background-color: transparent;
  }

  66% {
    visibility: visible;
    background-color: var(--color-accent-three);
  }

  82.5% {
    visibility: hidden;
    background-color: transparent;
  }
`;

const Cursor = styled.div`
  display: inline-block;
  width: 15px;
  height: 2px;
  transform: translate(4px, 2px);
  animation: 4s step-end ${CursorBlink} infinite backwards;
`;

const TitleComp = () => {
  return (
    <TitleGroup>
      <Title style={{ color: "var(--color-accent-one)" }}>YouTube</Title>
      <Title style={{ color: "var(--color-accent-two)" }}>Trends</Title>
      <Title
        style={{ color: "var(--color-accent-three)", display: "inline-block" }}
      >
        Visualization
      </Title>
      <Cursor />
    </TitleGroup>
  );
};

export default TitleComp;
