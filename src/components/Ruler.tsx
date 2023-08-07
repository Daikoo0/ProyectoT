import { useRef, useEffect } from 'react';
import Ruler from '@scena/react-ruler'

function RulerComponent() {

  const rulerRef = useRef(null);
  
  useEffect(() => {
    rulerRef.current.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResize = () => {
    rulerRef.current.resize();

  };

  //CM zoom = 37.7952 unit = 1
  //Pulgada zoom = 96 unit = 1
  //M zoom = 3779.52 unit = 100

  return (
    <div style={{ float: 'left' }} >
      <Ruler
        type = "vertical"
        textFormat = {(num) => `${num} in`}
        ref={rulerRef}
        style={{
            width: "30px",
            height: "1500px"
        }}
        zoom={37.7952}
        unit={1}
      />
      
    </div>
  );
  
}

export default RulerComponent;