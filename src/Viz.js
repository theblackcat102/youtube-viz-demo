import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { select, selectAll, event } from "d3-selection";
import { hierarchy, pack } from "d3-hierarchy";
// Do not delete below import, it is actually used in this file
import { transition } from "d3-transition";

const truncateLabel = (text, nodalLength) => {
  const textLength = text.length * 6.5;
  if (textLength > nodalLength) {
    const charOffset = Math.round((textLength - nodalLength) / 6.5);
    return `${text.slice(0, text.length - 3 - charOffset)}...`;
  } else {
    return text;
  }
};

let width;
let height;
let widthOffset;
let heightOffset;

const Viz = styled.svg`
  width: 60vw;
  height: ${window.innerHeight - 5}px;

  @media (max-width: 768px) {
    margin: 30px 0;
    width: 100vw;
    height: 100vw;
  }
`;

let view;
let calculatedRoot;

function zoomTo(v, region) {
  const k = width / (v.r * 2);

  view = v;

  let packingsCircles = selectAll("circle");
  let packingsLabels = selectAll("text");

  packingsCircles
    .transition()
    .duration(750)
    .attr("cx", d => (d.x - (v.x - v.r)) * k)
    .attr("cy", d => (d.y - (v.y - v.r)) * k)
    .attr("r", d => d.r * k);

  packingsLabels
    .transition()
    .duration(750)
    .text(d => {
      if (d.depth === 3) {
        if (view.depth === 2) {
          return truncateLabel(d.data.name, d.r * k * 2);
        } else {
          return "";
        }
      } else {
        return d.data.name;
      }
    })
    .attr("x", d => (d.x - (v.x - v.r)) * k)
    .attr("y", d => {
      if (d.depth === 3) {
        return (d.y - (v.y - v.r)) * k;
      } else {
        return (d.y - (v.y - v.r)) * k - d.r * k + 20;
      }
    })
    .style("opacity", d => {
      if (d.depth === 3) {
        if (d.parent.data.name !== region) {
          return "0";
        }
      } else if (d.depth > view.depth + 1) {
        return "0";
      }
    });
}

const renderViz = (wrapper, metric, region, setRegion, data) => {
  select(".bounds").remove();
  const bounds = wrapper
    .append("g")
    .attr("class", "bounds")
    .attr("width", width)
    .attr("height", height)
    .style(
      "transform",
      `translate(${widthOffset / 2}px, ${heightOffset / 2}px)`
    );

  const root = hierarchy(data)
    .sum(d => d[metric])
    .sort(function(a, b) {
      return b.value - a.value;
    });

  var packGenerator = pack().size([width, height]);
  packGenerator(root);
  calculatedRoot = root;
  view = root;

  var circles = bounds.selectAll("circle").data(root.descendants());
  circles.exit().remove();
  var newCircles = circles.enter().append("circle");
  circles = circles.merge(newCircles);

  var labels = bounds.selectAll("text").data(root.descendants());
  labels.exit().remove();
  var newLabels = labels.enter().append("text");
  labels = labels.merge(newLabels);

  circles
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.r)
    .attr("fill", d => {
      switch (d.depth) {
        case 0:
          return "#2a3a3c";
        case 1:
          return "#3f575a";
        case 2:
          return "#547478";
        default: {
          console.log(d.data.type);
          if (d.data.type === 1) {
            return "var(--color-accent-one)";
          } else if (d.data.type === 2) {
            return "var(--color-accent-two)";
          } else if (d.data.type === 3) {
            return "var(--color-accent-three)";
          }
        }
      }
    })
    .on("click", function(d) {
      if (d.depth !== 3) {
        setRegion(d.data.name);
      } else {
        setRegion(d.parent.data.name);
      }
      // if (d.depth !== 3) {
      //   setRegion(d.data.name);
      // } else {
      //   let packingsCircles = selectAll("circle");
      //   if (!this.classList.contains("highlighted")) {
      //     packingsCircles
      //       .classed("highlighted", e =>
      //         d.data.name === e.data.name ? true : null
      //       )
      //       .attr("stroke", e =>
      //         d.data.name === e.data.name ? "var(--color-text)" : null
      //       )
      //       .attr("stroke-width", e =>
      //         d.data.name === e.data.name ? "5px" : null
      //       )
      //       .style("opacity", e =>
      //         d.data.name !== e.data.name ? "0.4" : null
      //       );
      //   } else {
      //     packingsCircles
      //       .classed("highlighted", false)
      //       .attr("stroke", "none")
      //       .attr("stroke-width", "none")
      //       .style("opacity", "1");
      //   }
      // }
    })
    .on("mouseenter", function(d) {
      event.stopPropagation();
      if (d.depth === 3) {
        let nodalPos = this.getBoundingClientRect();
        let tooltip = document.querySelector("#tooltip");
        let header = document.querySelector("#tooltip-header");
        let badge = document.querySelector("#tooltip-badge");
        let tooltipRegion = document.querySelector("#tooltip-region");
        let value = document.querySelector("#tooltip-value");

        tooltip.style.left = `${nodalPos.right + 10}px`;
        tooltip.style.top = `${nodalPos.y}px`;
        header.innerHTML = d.data.name;
        badge.style.backgroundColor =
          d.data.type === 1
            ? "var(--color-accent-one)"
            : d.data.type === 2
            ? "var(--color-accent-two)"
            : "var(--color-accent-three)";
        tooltipRegion.innerHTML = d.parent.data.name;
        value.innerHTML = d.data[metric];
        tooltip.style.display = "block";

        if (nodalPos.y + tooltip.offsetHeight - window.innerHeight > 0) {
          tooltip.style.top = `${nodalPos.y -
            (nodalPos.y + tooltip.offsetHeight - window.innerHeight) -
            20}px`;
        }
        if (nodalPos.right + 10 + 300 - window.innerWidth > 0) {
          tooltip.style.left = `${nodalPos.left - 300 - 10}px`;
        }
      }
    })
    .on("mouseleave", d => {
      let tooltip = document.querySelector("#tooltip");

      tooltip.style.display = "none";
    });

  labels
    .attr("text-anchor", "middle")
    .text(d => d.data.name)
    .attr("x", d => d.x)
    .attr("y", d => {
      if (d.depth === 3) {
        return d.y;
      } else {
        return d.y - d.r + 20;
      }
    })
    .attr("font-family", "var(--font-primary)")
    .attr("fill", "var(--color-text)")
    .text(d => d.data.name)
    .attr("pointer-events", "none")
    .style("opacity", d => {
      if (d.depth === 3) {
        if (d.parent.data.name !== region) {
          return "0";
        }
      } else if (d.depth > view.depth + 1) {
        return "0";
      }
    });
};

const VizComp = ({ data, metric, region, setRegion }) => {
  const d3Ref = useRef(null);

  const onWindowResize = () => {
    if (window.innerWidth > 768) {
      width =
        window.innerWidth * 0.6 - 100 > window.innerHeight - 100
          ? window.innerHeight - 100
          : window.innerWidth * 0.6 - 100;
      height = width;
      widthOffset = window.innerWidth * 0.6 - width;
      heightOffset = window.innerHeight - height;
    } else {
      width = window.innerWidth - 40;
      height = width;
      widthOffset = 40;
      heightOffset = 0;
    }

    renderViz(select(d3Ref.current), metric, region, setRegion, data);
  };

  useEffect(() => {
    onWindowResize();

    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, [data, metric]);

  useEffect(() => {
    if (calculatedRoot) {
      zoomTo(
        calculatedRoot.descendants().filter(d => d.data.name === region)[0],
        region
      );
    }
  }, [data, metric, region]);

  return <Viz ref={d3Ref}></Viz>;
};

export default VizComp;
