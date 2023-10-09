import * as React from 'react';
import { Stage, Layer, Text } from 'react-konva';

export function CanvasComponent() {
  const stageRef = React.useRef<Konva.Stage>(null);
  const textNodeRef = React.useRef<Konva.Text>(null);

  const handleDblClick = () => {
    if (stageRef.current && textNodeRef.current) {
      const textPosition = textNodeRef.current.getAbsolutePosition();
      const stageBox = stageRef.current.container().getBoundingClientRect();
      const areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y,
      };
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.value = textNodeRef.current.text();
      textarea.style.position = 'absolute';
      textarea.style.top = `${areaPosition.y}px`;
      textarea.style.left = `${areaPosition.x}px`;
      textarea.style.width = `${textNodeRef.current.width()}`;
      textarea.focus();
      textarea.addEventListener('keydown', function (e) {
        if (e.keyCode === 13) {
          textNodeRef.current.text(textarea.value);
          document.body.removeChild(textarea);
        }
      });
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
    >
      <Layer>
        <Text
          ref={textNodeRef}
          text="Some text here"
          x={50}
          y={50}
          fontSize={20}
          onDblClick={handleDblClick}
          onDblTap={handleDblClick}
        />
      </Layer>
    </Stage>
  );
}
