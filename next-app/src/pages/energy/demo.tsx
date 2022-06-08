import React, { useEffect, useRef, useState } from "react";
import { Chart, registerAnimation } from "@antv/g2";
import { Button } from "antd";
import useInterval from "@/hooks/useInterval";
import { randomIntInRange } from "@/functions/common";
import { useAppSelector } from "@/app/hooks";
import { isThemeLight } from "@/app/features/themeSwitch/themeSwitch";

interface RaceChartData {
  name: string;
  value: number;
  color: string;
  mc_value: number;
}

interface TraceChartData {
  name: string;
  value: number;
  index: number;
  mc_value: number;
}

interface coordinateBar {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

function getCoordinateBar(path: number[][]): coordinateBar {
  // path layout

  // x1            x2
  // 0-------------1  y1
  // 4-------------|
  // |-------------|
  // 3-------------2  y2

  // path element = ['command', X, Y]

  const x1 = path[0][1];
  const x2 = path[1][1];
  const y1 = path[0][2];
  const y2 = path[2][2];
  return { x1: x1, x2: x2, y1: y1, y2: y2 };
}

function getTextWidth(text: string, font: string): number {
  // @ts-ignore
  var canvas: HTMLCanvasElement =
    // @ts-ignore
    getTextWidth.canvas ||
    // @ts-ignore
    (getTextWidth.canvas = document.createElement("canvas"));
  var context = canvas.getContext("2d");
  if (context) {
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  return 0;
}

const EnergyDemo = () => {
  const isLight = useAppSelector(isThemeLight);
  const [raceData, setRaceData] = useState<RaceChartData[]>([]);
  const [traceData, setTraceData] = useState<TraceChartData[][]>([]);
  const [raceChart, setRaceChart] = useState<Chart>();
  const [traceChart, setTraceChart] = useState<Chart>();
  const [isRunning, setIsRunning] = useState(false);
  const counter = useRef(0);

  // create interval
  useInterval(
    () => {
      let newData: RaceChartData[] = [
        {
          name: "MC_1",
          value: randomIntInRange(100, 1),
          color: "lightblue",
          mc_value: 1,
        },
        {
          name: "MC_2",
          value: randomIntInRange(100, 1),
          color: "lightblue",
          mc_value: 2,
        },
        {
          name: "MC_3",
          value: randomIntInRange(100, 1),
          color: "lightblue",
          mc_value: 3,
        },
        {
          name: "MC_4",
          value: randomIntInRange(100, 1),
          color: "lightblue",
          mc_value: 4,
        },
      ];
      newData.sort((a, b) => a.value - b.value);
      newData[newData.length - 1].color = "darkorange";
      // raceChart?.changeData(newData);
      setRaceData(newData);
    },
    2000,
    isRunning
  );

  // register animation
  useEffect(() => {
    registerAnimation("label-enter-appear", (element, animateCfg, cfg) => {
      // @ts-ignore
      const label = element.getChildren()[0];
      const coordinate = cfg.coordinate;
      const startX = coordinate.start.x;
      const finalX = label.attr("x");
      const labelText = label.attr("text");
      const splitLabelText = labelText.split(" ");
      // check initial data ("value" ==> length = 1)
      const labelContent =
        splitLabelText.length > 2
          ? splitLabelText[splitLabelText.length - 2]
          : splitLabelText[0];

      const name = label.cfg.data.name;

      label.attr("x", startX);
      label.attr("text", 0);
      const distance = finalX - startX;
      const finalLabel = `${name} : ${labelContent} kW`;
      const textWidth = getTextWidth(finalLabel, "15px sans-serif");

      label.animate((ratio: any) => {
        var position = startX + distance * ratio;
        const text = `${name} : ${(labelContent * ratio).toFixed(0)} kW`;

        let outBar = false;
        // padding + offset + adjusted
        console.log(labelText);
        console.log(textWidth, position);
        if (textWidth + 50 + 5 + 5 > position) {
          position += textWidth + 3;
          outBar = true;
        }

        const color = outBar ? (isLight ? "black" : "white") : "black";
        console.log(outBar);
        console.log(isLight);
        console.log(color);

        return {
          x: position,
          text,
          fill: color,
        };
      }, animateCfg);
    });
    registerAnimation("label-update", (element, animateCfg, cfg) => {
      const name = element.cfg.data.name;
      const startX = element.attr("x");
      const startY = element.attr("y");
      // @ts-ignore
      const finalX = cfg.toAttrs.x;
      // @ts-ignore
      const finalY = cfg.toAttrs.y;
      const labelText = element.attr("text");
      const splitLabelText = labelText.split(" ");
      const labelContent = splitLabelText[splitLabelText.length - 2];
      // const labelContent = element.cfg.data.value;
      // @ts-ignore
      const finalContent = cfg.toAttrs.text;

      const distanceX = finalX - startX;
      const distanceY = finalY - startY;
      const numberDiff = +finalContent - +labelContent;

      const textWidth = getTextWidth(labelText, "15px sans-serif");

      element.animate((ratio: any) => {
        let positionX = startX + distanceX * ratio;
        const positionY = startY + distanceY * ratio;
        const text = `${name} : ${(+labelContent + numberDiff * ratio).toFixed(
          0
        )} kW`;

        let outBar = false;
        // padding + offset + adjusted
        if (textWidth + 50 + 5 + 5 > positionX) {
          positionX += textWidth + 3;
          outBar = true;
        }

        const color = outBar ? (isLight ? "black" : "white") : "black";
        console.log(outBar, isLight);

        return {
          x: positionX,
          y: positionY,
          text,
          fill: color,
        };
      }, animateCfg);
    });
    registerAnimation("bar-enter-appear", (element, animateCfg, cfg) => {
      const {
        x1: startX1,
        x2: startX2,
        y1: startY1,
        y2: startY2,
      } = getCoordinateBar(element.attr("path"));

      const distanceX = startX2 - startX1;

      const color = element.cfg.element.data.color;

      element.animate((ratio: any) => {
        const X1 = startX1;
        const X2 = startX1 + distanceX * ratio;
        const Y1 = startY1;
        const Y2 = startY2;

        return {
          fill: color,
          path: [
            ["M", X1, Y1],
            ["L", X2, Y1],
            ["L", X2, Y2],
            ["L", X1, Y2],
            ["L", X1, Y1],
            ["Z"],
          ],
        };
      }, animateCfg);
    });
    registerAnimation("bar-update", (element, animateCfg, cfg) => {
      const {
        x1: startX1,
        x2: startX2,
        y1: startY1,
        y2: startY2,
      } = getCoordinateBar(element.attr("path"));
      // @ts-ignore
      const finalPath = cfg.toAttrs.path;
      const {
        x1: finalX1,
        x2: finalX2,
        y1: finalY1,
        y2: finalY2,
      } = getCoordinateBar(finalPath);

      const distanceX2 = finalX2 - startX2;
      const distanceY1 = finalY1 - startY1;
      const distanceY2 = finalY2 - startY2;

      const color = element.cfg.element.data.color;

      element.animate((ratio: any) => {
        const X1 = startX1;
        const X2 = startX2 + distanceX2 * ratio;
        const Y1 = startY1 + distanceY1 * ratio;
        const Y2 = startY2 + distanceY2 * ratio;

        return {
          fill: color,
          path: [
            ["M", X1, Y1],
            ["L", X2, Y1],
            ["L", X2, Y2],
            ["L", X1, Y2],
            ["L", X1, Y1],
            ["Z"],
          ],
        };
      }, animateCfg);
    });
  }, []);

  function createChart() {
    // create race chart const
    if (!raceChart) {
      const raceChart = new Chart({
        container: "energy-demo__chart-container__race-chart",
        autoFit: true,
        padding: [40, 30, 50, 50],
      });
      setRaceChart(raceChart);
    }
    // create trace chart const
    if (!traceChart) {
      const traceChart = new Chart({
        container: "energy-demo__chart-container__trace-chart",
        autoFit: true,
        padding: [40, 10, 30, 50],
      });
      setTraceChart(traceChart);
    }
  }

  // set race chart properties
  useEffect(() => {
    if (raceChart) {
      createRaceChart();
    }
  }, [raceChart]);

  // set trace chart properties
  useEffect(() => {
    if (traceChart) {
      createTraceChart();
    }
  }, [traceChart]);

  // detect theme for set color of chart
  useEffect(() => {
    if (raceChart) {
      raceChart.clear();
      createRaceChart();
    }
    if (traceChart) {
      traceChart.clear();
      createTraceChart();
    }
  }, [isLight]);

  // detect race data for changeData of raceChart
  // and call addTraceChartData of traceChart
  useEffect(() => {
    if (raceData) {
      counter.current++;
      raceChart?.changeData(raceData);
      if (traceChart) {
        addTraceChartData(raceData);
      }
    }
  }, [raceData]);

  // sorting data for changeData of traceChart
  useEffect(() => {
    if (traceChart) {
      const newChangeData: TraceChartData[] = [
        ...traceData.reduce((prev_d, cur_d) => [...prev_d, ...cur_d]),
      ];
      newChangeData.sort((a, b) => a.mc_value - b.mc_value);
      traceChart.changeData(newChangeData);
    }
  }, [traceData]);

  function createRaceChart() {
    if (raceChart) {
      raceChart.coordinate("rect").transpose();
      raceChart
        .legend(false)
        .tooltip(false)
        .axis("name", {
          animateOption: {
            update: {
              duration: 500,
              easing: "easeLinear",
            },
          },
          label: {
            style: {
              fill: isLight ? "black" : "white",
              fontSize: 15,
            },
          },
          title: {
            text: "Machine\n",
            position: "end",
            autoRotate: false,
            offset: -10,
            spacing: 0,
            style: {
              fill: isLight ? "black" : "white",
              fontSize: 15,
              fontWeight: "bold",
              textAlign: "center",
              lineHeight: 20,
            },
          },
        })
        .axis("value", {
          animateOption: {
            update: {
              duration: 500,
              easing: "easeLinear",
            },
          },
          label: {
            style: {
              fill: isLight ? "black" : "white",
              fontSize: 15,
            },
          },
          title: {
            text: "Power consump. (kW)",
            position: "end",
            autoRotate: false,
            offset: 0,
            spacing: 25,
            style: {
              fill: isLight ? "black" : "white",
              fontSize: 15,
              fontWeight: "bold",
              textAlign: "right",
            },
          },
        })
        .interval()
        .position("name*value")
        .label("value*color", (value, color) => {
          return {
            animate: {
              enter: {
                animation: "label-enter-appear",
                delay: 0,
                duration: 500,
                easing: "easeLinear",
              },
              appear: {
                animation: "label-enter-appear",
                delay: 0,
                duration: 500,
                easing: "easeLinear",
              },
              update: {
                animation: "label-update",
                duration: 500,
                easing: "easeLinear",
              },
            },
            offset: -5,
            style: {
              fill: "black",
              fontSize: 15,
              textAlign: "right",
            },
          };
        })
        .animate({
          enter: {
            animation: "bar-enter-appear",
            duration: 500,
            easing: "easeLinear",
          },
          appear: {
            animation: "bar-enter-appear",
            duration: 500,
            easing: "easeLinear",
          },
          update: {
            animation: "bar-update",
            duration: 500,
            easing: "easeLinear",
          },
        }).animateOption;
      raceChart.render();
    }
  }

  function createTraceChart() {
    if (traceChart) {
      traceChart
        .scale("index", {
          type: "linear",
          tickInterval: 1,
        })
        .scale("value", { nice: true })
        .area()
        .adjust("stack")
        .position("index*value")
        .color("name")
        .animate({
          update: {
            duration: 0,
            easing: "easeLinear",
          },
        });
      traceChart.axis("value", {
        label: {
          style: {
            fill: isLight ? "black" : "white",
            fontSize: 15,
          },
        },
        title: {
          text: "Power consump. (kW)\n\n",
          position: "end",
          autoRotate: false,
          offset: 30,
          spacing: 0,
          style: {
            fill: isLight ? "black" : "white",
            fontSize: 15,
            fontWeight: "bold",
            textAlign: "left",
            lineHeight: 20,
          },
        },
      });
      traceChart.axis("index", false);
      traceChart
        .line()
        .adjust("stack")
        .position("index*value")
        .color("name")
        .animate({
          update: {
            duration: 0,
            easing: "easeLinear",
          },
        });
      traceChart.interaction("element-highlight");
      traceChart.legend(false);
      traceChart.legend("name", {
        position: "top-right",
        itemName: {
          style: {
            fill: isLight ? "black" : "white",
            fontSize: 14,
          },
        },
        padding: [10, 10, 10, 0],
      });
      traceChart.tooltip({
        showCrosshairs: true,
        shared: true,
        showTitle: false,
        customItems: (items) => {
          return items.map((item) => {
            return { ...item, value: `${item.value} kW` };
          });
        },
        domStyles: {
          "g2-tooltip": {
            padding: "0.5rem 1rem",
          },
          "g2-tooltip-list": {
            fontSize: "18px",
          },
          "g2-tooltip-value": {
            fontWeight: "bold",
          },
        },
      });
      traceChart.render();
    }
  }

  function addTraceChartData(data: RaceChartData[]) {
    if (data) {
      let newTraceData = [...traceData];
      newTraceData = [
        ...newTraceData,
        data.map((d) => ({
          name: d.name,
          value: d.value,
          index: counter.current,
          mc_value: d.mc_value,
        })),
      ];

      if (newTraceData.length > 10) {
        newTraceData.shift();
      }

      setTraceData(newTraceData);
    }
  }

  function start() {
    createChart();
    setIsRunning(true);
  }

  function stop() {
    setIsRunning(false);
  }

  function reset() {
    // TODO create reset function
    setTraceData([])
    setRaceData([])
  }

  return (
    <div className="energy-demo center-main">
      <div className="energy-demo__operation">
        <h3>Demo </h3>
        <Button type="primary" onClick={() => start()}>
          Start
        </Button>
        <Button type="dashed" danger onClick={() => stop()}>
          Stop
        </Button>
        <Button type="primary" danger onClick={() => reset()}>
          Reset
        </Button>
      </div>
      <div className="energy-demo__real-time">
        <div className="energy-demo__real-time__race-chart">
          <p>Race chart</p>
          <div
            id="energy-demo__chart-container__race-chart"
            className="energy-demo__chart-container race-chart"
          />
        </div>
        <div className="energy-demo__real-time__trace-chart">
          <p>Trace chart</p>
          <div
            id="energy-demo__chart-container__trace-chart"
            className="energy-demo__chart-container trace-chart"
          />
        </div>
      </div>
    </div>
  );
};

export default EnergyDemo;
