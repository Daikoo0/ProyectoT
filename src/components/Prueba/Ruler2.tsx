const Ruler = ({ width, height, isInverted, scale }) => {
  const marks = [];

  for (let i = 0; i <= height; i += 50 * scale) {
    const position = i;
    const text = isInverted ? `${(height - i) / (100 * scale)} m` : `${i / (100 * scale)} m`;

    if (i % (100 * scale) === 0) {
      marks.push(
        <g key={`mark-${i}`}>
          <line className="stroke-base-content" x1={width - 20} y1={position} x2={width} y2={position} strokeWidth={2} />
          <text className="fill-base-content" x={width - 45} y={position - 5} fontSize={12} >
          {i === 0 ? <tspan dy="15">{text}</tspan> : text}
            </text>
        </g>
      );
    } else {
      marks.push(
        <line className="stroke-base-content" key={`mark-${i}`} x1={width - 10} y1={position} x2={width} y2={position} strokeWidth={1} />
      );
    }
  }

  return (
     <svg className="h-full max-h-full" width={width} overflow={'visible'}>
      {marks}
     </svg>
  );
};

export default Ruler;
