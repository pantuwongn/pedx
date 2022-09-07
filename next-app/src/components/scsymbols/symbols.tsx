import { Tooltip } from "antd";

export function getSymbol(
  character: string,
  shape: string,
  remark: string,
  index: number
): JSX.Element {
  return (
    <Tooltip key={index} title={remark}>
      {symbol(character, shape, remark)}
    </Tooltip>
  );
}

function symbol(character: string, shape: string, remark: string) {
  if (shape === "diamond") {
    return (
      <svg className={remark} viewBox="0 0 120 120" width={120} height={120}>
        <rect
          width={78}
          height={78}
          x={"36.06%"}
          y={"-33.23%"}
          transform={"rotate(45)"}
          strokeWidth={4}
          stroke={"rgb(0, 0, 0)"}
          fill={"rgb(220, 0, 50)"}
          fillOpacity={"90%"}
        />
        <text
          x="50%"
          y="54%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={60}
          fontWeight={400}
          stroke={"rgb(0, 0, 0)"}
          fill={"rgb(0, 0, 0)"}
        >
          {character}
        </text>
      </svg>
    );
  } else if (shape === "circle") {
    return (
      <svg className={remark} viewBox="0 0 140 140" width={120} height={120}>
        <circle
          width={118}
          height={118}
          cx={"50%"}
          cy={"50%"}
          r={65}
          strokeWidth={4}
          stroke={"rgb(0, 0, 0)"}
          fill={"rgb(220, 0, 50)"}
          fillOpacity={"90%"}
        />
        <text
          x="50%"
          y="54%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={60}
          fontWeight={400}
          stroke={"rgb(0, 0, 0)"}
          fill={"rgb(0, 0, 0)"}
        >
          {character}
        </text>
      </svg>
    );
  } else if (shape === "triangle") {
    return (
      <svg className={remark} viewBox="0 0 120 120" width={120} height={110}>
        <polygon
          points="60,2 2,108 118,108"
          strokeWidth={4}
          stroke={"rgb(0, 0, 0)"}
          fill={"rgb(220, 0, 50)"}
          fillOpacity={"90%"}
        />
        <text
          x="50%"
          y="70%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={60}
          fontWeight={400}
          stroke={"rgb(0, 0, 0)"}
          fill={"rgb(0, 0, 0)"}
        >
          {character}
        </text>
      </svg>
    );
  }
  return (
    <svg className={remark} viewBox="0 0 140 120" width={140} height={120}>
      <text
        x="50%"
        y="60%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={100}
        fontWeight={650}
        stroke={"rgb(230,230,230)"}
        fill={"rgb(0, 0, 0)"}
      >
        {character}
      </text>
    </svg>
  );
}
