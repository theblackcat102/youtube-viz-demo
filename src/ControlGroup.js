import React from "react";
import styled from "styled-components";
import { format, subDays } from "date-fns";

const ControlGroup = styled.div`
  font-family: var(--font-primary), monospace;
  font-size: 16px;
  color: var(--color-text);
  //   border: 5px solid green;
  margin-top: 80px;

  @media (max-width: 1100px) {
    margin-top: 50px;
  }
`;

const Control = styled.div`
  display: inline-block;
  position: relative;

  & ::after {
    content: "▼";
    font-family: var(--font-primary);
    font-size: 12px;
    color: var(--color-text);
    position: absolute;
    pointer-events: none;
    right: 0;
    bottom: 4px;
  }
`;

const ControlSelect = styled.select`
  font-family: var(--font-primary), monospace;
  font-size: 16px;
  color: var(--color-text);
  background-color: transparent;
  border: none;
  border-bottom: 1px dashed var(--color-text);
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  padding-right: 15px;

  & * {
    font-family: var(--font-primary), monospace;
    font-size: 16px;
    color: var(--color-text);
  }
`;

const ControlDate = styled.input`
  appearance: none;
  display: inline-block;
  background-color: transparent;
  font-family: var(--font-primary), monospace;
  font-size: 16px;
  color: var(--color-text);
  border: none;
  border-bottom: 1px dashed var(--color-text);

  &::-webkit-clear-button {
    display: none;
  }
`;

const ControlOption = styled.option``;

const ControlGroupComp = ({
  setMetric,
  region,
  setRegion,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo
}) => {
  return (
    <ControlGroup>
      Displaying Top 10{" "}
      <Control>
        <ControlSelect
          name="metric-control"
          id="metric-control"
          onChange={e => setMetric(e.target.value)}
        >
          {/* <ControlOption value="popularity">Most Popular</ControlOption> */}
          <ControlOption value="views">Most Viewed</ControlOption>
          <ControlOption value="likes">Most Liked</ControlOption>
          <ControlOption value="comments">Most Commented</ControlOption>
        </ControlSelect>
      </Control>{" "}
      trends for{" "}
      <Control>
        <ControlSelect
          name="region-control"
          id="region-control"
          value={region}
          onChange={e => setRegion(e.target.value)}
        >
          <ControlOption value="Global">Global</ControlOption>
          <optgroup label="North America">
            <ControlOption value="North America">
              Entire North America
            </ControlOption>
            <ControlOption value="United States">United States</ControlOption>
            <ControlOption value="Canada">Canada</ControlOption>
            <ControlOption value="Mexico">Mexico</ControlOption>
            <ControlOption value="Puerto Rico">Puerto Rico</ControlOption>
            <ControlOption value="Panama">Panama</ControlOption>
          </optgroup>
          <optgroup label="South America">
            <ControlOption value="South America">
              Entire South America
            </ControlOption>
            <ControlOption value="Brazil">Brazil</ControlOption>
            <ControlOption value="Argentina">Argentina</ControlOption>
          </optgroup>
          <optgroup label="Europe">
            <ControlOption value="Europe">Entire Europe</ControlOption>
            <ControlOption value="United Kingdom">United Kingdom</ControlOption>
            <ControlOption value="Switzerland">Switzerland</ControlOption>
            <ControlOption value="Netherlands">Netherlands</ControlOption>
            <ControlOption value="Ireland">Ireland</ControlOption>
            <ControlOption value="Germany">Germany</ControlOption>
            <ControlOption value="Denmark">Denmark</ControlOption>
            <ControlOption value="Russia">Russia</ControlOption>
            <ControlOption value="Italy">Italy</ControlOption>
            <ControlOption value="France">France</ControlOption>
            <ControlOption value="Slovakia">Slovakia</ControlOption>
            <ControlOption value="Greece">Greece</ControlOption>
            <ControlOption value="Portugal">Portugal</ControlOption>
          </optgroup>
          <optgroup label="Asia">
            <ControlOption value="Asia">Entire Asia</ControlOption>
            <ControlOption value="Singapore">Singapore</ControlOption>
            <ControlOption value="Hong Kong">Hong Kong</ControlOption>
            <ControlOption value="Vietnam">Vietnam</ControlOption>
            <ControlOption value="Malaysia">Malaysia</ControlOption>
            <ControlOption value="India">India</ControlOption>
            <ControlOption value="Indonesia">Indonesia</ControlOption>
            <ControlOption value="Philippines">Philippines</ControlOption>
            <ControlOption value="Kazakhstan">Kazakhstan</ControlOption>
            <ControlOption value="United Arab Emirates">
              United Arab Emirates
            </ControlOption>
            <ControlOption value="Thailand">Thailand</ControlOption>
            <ControlOption value="Japan">Japan</ControlOption>
            <ControlOption value="Taiwan">Taiwan</ControlOption>
          </optgroup>
          <optgroup label="Oceania">
            <ControlOption value="Oceania">Entire Oceania</ControlOption>
            <ControlOption value="Australia">Australia</ControlOption>
            <ControlOption value="New Zealand">New Zealand</ControlOption>
          </optgroup>
        </ControlSelect>
      </Control>{" "}
      from{" "}
      <span>
        <label htmlFor="dateFrom"></label>
        <ControlDate
          type="date"
          id="dateFrom"
          name="dateFrom"
          min="2019-11-01"
          max={format(subDays(new Date(), 1), "yyyy-MM-dd")}
          value={dateFrom}
          onChange={e => {
            setDateFrom(e.target.value);
          }}
        />
      </span>{" "}
      to{" "}
      <span>
        <label htmlFor="dateTo"></label>
        <ControlDate
          type="date"
          id="dateTo"
          name="dateTo"
          min="2019-11-02"
          max={format(new Date(), "yyyy-MM-dd")}
          value={dateTo}
          onChange={e => {
            setDateTo(e.target.value);
          }}
        />
      </span>
      :
    </ControlGroup>
  );
};

export default ControlGroupComp;
