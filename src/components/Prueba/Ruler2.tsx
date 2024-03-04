const Ruler = ({ width, height, isInverted, scale }) => {
  const marks = [];

  for (let i = 0; i <= height; i += 50 * scale) {
    const position = i;
    const text = isInverted ? `${(height - i) / (100 * scale)} m` : `${i / (100 * scale)} m`;

    if (i % (100 * scale) === 0) {
      marks.push(
        <g key={`mark-${i}`}>
          <line x1={width - 20} y1={position} x2={width} y2={position} stroke="black" strokeWidth={2} />
          <text x={width - 45} y={position - 5} fontSize={12} fill="black">{text}</text>
        </g>
      );
    } else {
      marks.push(
        <line key={`mark-${i}`} x1={width - 10} y1={position} x2={width} y2={position} stroke="black" strokeWidth={1} />
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
