import { useRef, useEffect, useState } from 'react';
import Ruler from '@scena/react-ruler';

function RulerComponent() {
  const rulerRef = useRef(null);
  const [rulerHeight, setRulerHeight] = useState(100); 

  useEffect(() => {
    updateRulerHeight(); 

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleResize = () => {
    rulerRef.current.resize();
 
  };

  const handleScroll = () => {
    updateRulerHeight();
  };

  const updateRulerHeight = () => {
    const windowHeight = window.innerHeight;
    const newRulerHeight = (windowHeight + window.scrollY + 50);
    setRulerHeight(newRulerHeight);
  
  };

  // CM zoom = 37.7952 unit = 1
  // Pulgada zoom = 96 unit = 1
  // M zoom = 3779.52 unit = 100

  return (
    <div style={{ float: 'left' }}>
      <Ruler
        type="vertical"
        textFormat={(num) => `${num} in`}
        ref={rulerRef}
        direction = 'start'
        style={{
          width: window.innerWidth,
          height: `${rulerHeight }px`, 
        }}
        zoom={37.7952}
        unit={1}
      />
    </div>
  );
}

export default RulerComponent;
