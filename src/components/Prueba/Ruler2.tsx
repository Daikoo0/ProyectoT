const Ruler = ({ width, height, isInverted, scale }) => {
  const marks = [];

  for (let i = 0; i <= height; i += 50 * scale) {

    const isLastIteration = (i + 50 * scale > height);

    // Ajusta la posición dependiendo de si es invertido o no
    const position = isInverted ? height - i: i;

    // Ajusta el texto para que sea correcto en ambas direcciones
    const text = isInverted ? `${Math.round(i / (100 * scale))} m` :  `${Math.round(i / (100 * scale))} m`;

    if (i % (100 * scale) === 0) {
      marks.push(
        <g key={`mark-${i}`}>
          <line className="stroke-base-content" x1={width - 20} y1={position} x2={width} y2={position} strokeWidth={2} />
          <text className="fill-base-content" x={width - 45} y={position} fontSize={12} >
            {(i === 0) ? (isInverted?<tspan dy="-10">{text}</tspan>:<tspan dy="15">{text}</tspan>) : null}
            {((i !== 0)&&(!isLastIteration))? text: null}
            {(isLastIteration) ? (isInverted?<tspan dy="15">{text}</tspan>:<tspan dy="-10">{text}</tspan>) : null}
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
    <svg id="rulerSvg" height={height<153? height: ''} className="h-full max-h-full"
     width={width} overflow={'hidden'}>
      {marks}
    </svg>
  );
};

export default Ruler;
