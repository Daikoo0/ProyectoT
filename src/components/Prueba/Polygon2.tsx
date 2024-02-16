import React from 'react';

const SinWave = () => {
  const width = 200;
  const height = 100; 

  const amplitude = 50; // A
  const frequency = 2 * Math.PI / width; // B, ajustado para que el período encaje en el ancho
  const points = [];

  for (let x = 0; x <= width; x++) {
    const y = height / 2 + amplitude * Math.sin(frequency * x);
    points.push(`${x},${y}`);
  }

  const pathData = `M ${points.join(' L ')}`;

  

  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <path d={pathData} stroke="black" strokeWidth="2" fill="none" />
    </svg>
  );
};

export default SinWave;
