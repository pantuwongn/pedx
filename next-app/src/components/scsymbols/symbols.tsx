import { Tooltip } from "antd";

export function getSymbol(
  character: string,
  shape: string,
  remark: string,
  index: number
): JSX.Element {
  return <Tooltip key={index} title={remark}>{symbol(character, shape)}</Tooltip>;
}

function symbol(character: string, shape: string) {
  if (shape === "diamond") {
    return (
      <svg width={100} height={100}>
        <rect
          width={68}
          height={68}
          x={"36.06%"}
          y={"-33.23%"}
          transform={"rotate(45)"}
          strokeWidth={2}
          fill="none"
        />
        <text
          x="50%"
          y="54%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={60}
        >
          {character}
        </text>
      </svg>
    );
  } else if (shape === "circle") {
    return (
      <svg width={100} height={100}>
        <circle
          width={98}
          height={98}
          cx={"50%"}
          cy={"50%"}
          r={49}
          strokeWidth={2}
          fill="none"
        />
        <text
          x="50%"
          y="54%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={60}
        >
          {character}
        </text>
      </svg>
    );
  } else if (shape === "triangle") {
    <svg width={120} height={90}>
      <polygon points="60,1 1,89 119,89" strokeWidth={2} fill="none" />
      <text
        x="50%"
        y="80%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={60}
      >
        {character}
      </text>
    </svg>;
  }
  return (
    <svg width={100} height={100}>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={60}
      >
        {character}
      </text>
    </svg>
  );
}
