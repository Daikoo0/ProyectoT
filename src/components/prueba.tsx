import React, { useState, useEffect } from "react";
import { Stage, Layer, Group, Rect, Text, Circle } from "react-konva";
import { Html } from "react-konva-utils";


interface StickyNoteProps {
  colour: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
  onTextChange: (text: string) => void;
  selected: boolean;
  onTextClick: (isEditing: boolean) => void;
}

const RETURN_KEY = 13; // enter
const ESCAPE_KEY = 27;  // ESC

const StickyNote: React.FC<StickyNoteProps> = (props) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!props.selected && isEditing) {
      setIsEditing(false);
    }
  }, [props.selected, isEditing]);

  function toggleEdit() {
    setIsEditing(!isEditing);
    props.onTextClick(!isEditing);
  }

  const textComponent = isEditing ? (
    <Html
      groupProps={{ x: 300, y: 400 }}
      divProps={{
        style: {
          width: props.width,
          height: props.height,
          overflow: 'hidden',
          background: 'none',
          outline: 'none',
          border: 'none',
          padding: '0px',
          margin: '0px',
        },
      }}
    >
      <textarea
        style={{
          width: '100%',
          height: '100%',
          background: 'none',
          border: 'none',
          padding: '0px',
          margin: '0px',
          outline: 'none',
          overflow: 'auto',
          fontSize: '24px',
          fontFamily: 'sans-serif',
          color: 'black',
        }}
        value={props.text}
        onChange={(e) => props.onTextChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.keyCode === RETURN_KEY && !e.shiftKey) || e.keyCode === ESCAPE_KEY) {
            toggleEdit();
          }
        }}
      />
    </Html>
  ) : (
    <Text
      x={300}
      y={400}
      text={props.text}
      fill="black"
      fontFamily="sans-serif"
      fontSize={24}
      width={props.width}
      height={props.height}
      onClick={toggleEdit} 
      onDblClick={toggleEdit} 
    />
  );

  return (
    <Group x={props.x} y={props.y}>
      <Circle x={props.x} y={props.y} radius={10} fill="green" />
      <Rect
        x={300}
        y={400}
        width={props.width}
        height={props.height}
        fill={props.colour}
        onClick={props.onClick}
        onTap={props.onClick}
      />
      {textComponent}
    </Group>
  );
};

const Prueba = () => {
  const [text, setText] = useState("Haz clic para editar.");
  const [selected, setSelected] = useState(false);

  return (
    <div>
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onClick={(e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
          setSelected(false);
        }
      }}
    >
      <Layer>
        <StickyNote
          x={100}
          y={100}
          width={300}
          height={400}
          colour="#FFDAE1"
          text={text}
          selected={selected}
          onClick={() => setSelected(true)}
          onTextClick={(newSelected) => setSelected(newSelected)}
          onTextChange={(newText) => setText(newText)}
        />
        <StickyNote
          x={-200}
          y={100}
          width={200}
          height={200}
          colour="#FFDAE1"
          text={text}
          selected={selected}
          onClick={() => setSelected(true)}
          onTextClick={(newSelected) => setSelected(newSelected)}
          onTextChange={(newText) => setText(newText)}
        />
      </Layer>
    </Stage>
    </div>
  );
};

export default Prueba;
