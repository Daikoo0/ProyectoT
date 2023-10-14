import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect, Shape } from 'react-konva';
import { useParams } from 'react-router-dom';

//import ShapeComponent from './shape';
//import Konva from './konva';
import Json from '../lithologic.json';
import Polygon from './Polygon';
import Grid from './Grids';
import './Editor.css';

const CoordinateInputs: React.FC = () => { 

  // RECORDATORIO
  // NECESITO UNA FUNCION DEL BACKEND PARA ACTUALIZAR SOLO EL TEXT DE CADA SHAPE DESDE EL FRONTEND 
  // NECESITO SHAPE.Y1 Y SHAPE.Y2 DESDE EL BACK

  //---------------// POLIGONOS //---------------//
    //Figuras / Poligonos 
    const [shapes, setShapes] = useState([]); 
  
    // Index / ID de la Figura / Poligono
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(null); // 0,1,2,3...
    const [selectedShapeID, setSelectedShapeID] = useState(null); 

    // Ultima posicion Poligono // ARREGLAR 
    const [lastPositionSI, setLastPositionSI] = useState({ x: 100, y:100 });
    const [lastPositionID, setLastPositionID] = useState({ x: 200, y:200 });

  //---------------// CAPAS Y GRID //---------------//
    // Alto de la capa
    const [initialHeight] = useState(100);
    const [height, setHeight] = useState<number>(initialHeight);

    // contenido inicial de las columnas
    const [initialTexts] = useState({
      'Arcilla' :   { content: "vacío", optional : false, vertical : false, enabled : true},
      'Limo' :      { content: "vacío", optional : false, vertical : false, enabled : true},
      'Arena' :     { content: "vacío", optional : false, vertical : false, enabled : true},
      'Grava' :     { content: "vacío", optional : false, vertical : false, enabled : true},
      'Sistema' :   { content: "vacío", optional : true, vertical : true, enabled : true},
      'Edad' :      { content: "vacío", optional : true, vertical : true, enabled : true},
      'Formación' : { content: "vacío", optional : true, vertical : true, enabled : true},
      'Miembro' :   { content: "vacío", optional : true, vertical : true, enabled : true},
      'Estructuras y/o fósiles': { content: "vacío", optional : true, vertical : false, enabled : true},
      'Facie' :     { content: "vacío", optional : true, vertical : false, enabled : true},
      'Ambiente depositacional': { content: "vacío", optional : true, vertical : false, enabled : true},
      'Descripción':{ content: "vacío", optional : true, vertical : false, enabled : true}
    });


  //---------------// PATRONES Y EDICION //---------------//

    // Seleccion de patron / Pattern
    const [selectedOption, setSelectedOption] = useState<string>(Object.keys(Json)[0]);

    // Colores Base 
    const [initialColorFill] = useState('#ffffff'); 
    const [initialColorStroke] = useState('#000000');

    // Cambio de Colores de los poligonos 
    const [ColorFill, setColorFill] = useState(initialColorFill); // Relleno 
    const [ColorStroke, setColorStroke] = useState(initialColorStroke); // Trazo 

    // Slider barras
    const [sliderZoom, setSliderZoom] = useState(100); // Zoom
    const [sliderRotation, setSliderRotation] = useState(0); // Rotacion
    const [sliderTension, setSliderTension] = useState(1); // Tension de lineas

    // websocket instanciacion
    const { project } = useParams();
   
    const [socket, setSocket] = useState<WebSocket | null>(null);

  // Instancia del socket cuando se monta el componente
  useEffect(() => {
    const newSocket = new WebSocket(`ws://localhost:3001/ws/${project}`);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [project]);

  useEffect(() => {
    if (socket) { 
      // Recibe la información del socket
      socket.onmessage = (event) => {
        console.log(event.data);
        const shapeN = JSON.parse(event.data);

        if(shapeN.action !== "delete"){
          setShapes(currentShapes => {
            const existingShapeIndex = currentShapes.findIndex(s => s.id === shapeN.id);
            if (existingShapeIndex > -1) {
              // Si el cuadrado ya existe, actualizamos su posición en lugar de agregar un nuevo cuadrado
              const updatedSquares = [...currentShapes];
              updatedSquares[existingShapeIndex] = shapeN;
              return updatedSquares;
            } else {
              // Si el cuadrado no existe, lo agregamos
              return [...currentShapes, shapeN];
            }
          });

        }else{
          // Eliminar la figura
          setShapes((currentShapes) => {
            // Elimina el polígono seleccionado
            const remainingShapes = currentShapes.filter((s) => s.id !== shapeN.id);

            console.log(shapes[selectedShapeIndex].y1)
            console.log(shapeN.y1, shapeN.y2)

            const shapeHeight = shapeN.y2 - shapeN.y1;
            
            const adjustedShapes = remainingShapes.map((shape) => {
              if (shape.y1 > shapeN.y1) {
                shape.y1 -= shapeHeight;
              }
              if (shape.y2 > shapeN.y1) {
                shape.y2 -= shapeHeight;
              }
              return shape;
            });
        
            return adjustedShapes;
          });
          
        }
      };
      //use efect mio detecta si se presiona el control Z
      const handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === "z") {
          HandleUndo();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      // Limpiar la conexión WebSocket cuando el componente se desmonta
      return () => {
        socket.close() , document.removeEventListener("keydown", handleKeyDown);

      };
    }
  }, [socket]);

    useEffect(() => {

      if(shapes.length>0){

        const coordA = shapes.reduce((maxCoords, objeto) => {
          return {
            x1: Math.max(maxCoords.x1, objeto.x1),
            x2: Math.max(maxCoords.x2, objeto.x2),
            y1: Math.max(maxCoords.y1, objeto.y1),
            y2: Math.max(maxCoords.y2, objeto.y2),
          };
        }, { x1: -Infinity, x2: -Infinity, y1: -Infinity, y2: -Infinity });

    //    console.log('Useeffedd',coordA)
        
        //const lastPolygon = shapes[shapes.length-1];  
        //const lastPolygon = shapes.find(objeto => objeto.y2 === coordA.y2);
        setLastPositionSI({ x: coordA.x1, y: coordA.y2  }) //arreglar
        setLastPositionID({ x: coordA.x2, y: coordA.y2 + 100 })
      }
      
    },[shapes]);
  
    //---------------// EVENTOS //---------------//
    //---------// SLIDER //---------//
    // Evento del slider de zoom 
    const handleSliderZoom = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliderZoom(Number(event.target.value));
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].zoom = Number(event.target.value);
          //socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
          setShapes(updatedShapes);
        }
    };

    // Evento mio sjdjsjda es pal control Z
    const HandleUndo = () => {
      console.log("deshacer")
      socket.send(JSON.stringify({action:"undo"}));  
    };

    // Evento mio sjdjsjda es para guardar los cambios
    const HandleSave = () => {
      console.log("guardando..")
      socket.send(JSON.stringify({action:"save"}));
      //socket.send(JSON.stringify({action:"delete", id: selectedShapeID}));
    };

    // Evento para eliminar
    const HandleDelete = () => {
      socket.send(JSON.stringify({action:"delete", id: selectedShapeID, y1: shapes[selectedShapeIndex].y1, y2: shapes[selectedShapeIndex].y2} ));
  
    }

    // Evento de slider de rotacion
    const handleSliderRotation = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliderRotation(Number(event.target.value));
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].rotation = Number(event.target.value);
          //socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
          setShapes(updatedShapes);
        }
    };

    // Evento de slider de tension
    const handleSliderTension = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSliderTension(Number(event.target.value));
      if (selectedShapeIndex !== null) {
        const updatedShapes = [...shapes];
        updatedShapes[selectedShapeIndex].tension = Number(event.target.value);
        //socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
        setShapes(updatedShapes);
      }
    }

    // Evento de seleccion de patron
    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].file = Json[event.target.value];
          updatedShapes[selectedShapeIndex].fileOption = event.target.value;
          socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
          //setShapes(updatedShapes);
        }
    };

    // Evento de cambio color de relleno
    const handleColorChangeFill = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColorFill(event.target.value);
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].colorfill = event.target.value;
          socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
          //setShapes(updatedShapes);
        }
    };

    // Evento de cambio color de trazo 
    const handleColorChangeStroke = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColorStroke(event.target.value);
        if (selectedShapeIndex !== null) {
          const updatedShapes = [...shapes];
          updatedShapes[selectedShapeIndex].colorstroke = event.target.value;
          socket.send(JSON.stringify(updatedShapes[selectedShapeIndex]));
          //setShapes(updatedShapes);
        }
    };

    // Crea los circulos de los poligonos
    const setCircles = (index, circles, send, socket) => {
      const updatedShapes = [...shapes];
      updatedShapes[index].circles = circles;
      setShapes(updatedShapes);
      if(send){
        console.log("Send: Circulos")
        socket.send(JSON.stringify(updatedShapes[index]));
      }
    }

     // Crea los textos de los poligonos
     const setText = (index, text, send, socket) => {
      const updatedShapes = [...shapes];
      updatedShapes[index].text = text;
      setShapes(updatedShapes);
      if(send){
        console.log("Send: text")
        socket.send(JSON.stringify(updatedShapes[index]));
      }
    }

    // Envía la información al soltar el control deslizante
    const SliderDrop = () => {
      if (selectedShapeIndex !== null) {
        socket.send(JSON.stringify(shapes[selectedShapeIndex]));
      }
    };

    // Evento del cambio del tamaño del poligono
    const handleChangeHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
      setHeight(Number(event.target.value));
      const newHeight = Number(event.target.value);

      if (selectedShapeIndex !== null) {
        const selectedShapeId = shapes[selectedShapeIndex].id;
    
        const deltaY = newHeight - (shapes[selectedShapeIndex].y2 - shapes[selectedShapeIndex].y1);
    
        const updatedShapes = shapes.map((shape) => {
          // Cambio de la altura del polígono seleccionado
          if (shape.id === selectedShapeId) {
            const newY2 = shape.y1 + newHeight;
    
            if (newY2 < shape.y2) {

              const filteredCircles = shape.circles.filter((circle, index) => {
                return index < 2 || index >= shape.circles.length - 2 || circle.y <= newY2;
              });
    
              return {
                ...shape,
                y2: newY2,
                circles: filteredCircles,
              };
            } else {
              return {
                ...shape,
                y2: newY2,
              };
            }
          } else if (shape.y1 >= shapes[selectedShapeIndex].y2) {
            // Cambio de posición del resto de figuras por debajo
            return {
              ...shape,
              y1: shape.y1 + deltaY,
              y2: shape.y2 + deltaY,
            };
          }
    
          return shape;
        });
    
        setShapes(updatedShapes);
      }
    };


    //////////////-----------MODIFICADO-----------------//////////////
    // Generacion de figuras, envio a backend 
    const handleAddShape = () => {

      const NewShape =
            {   
                //id: uuidv4(),
                action: "añadir",
                id: shapes.length,
                x1: lastPositionSI.x, y1: lastPositionSI.y, 
                x2: lastPositionID.x, y2: lastPositionID.y,  
                colorfill: initialColorFill, 
                colorstroke: initialColorStroke, 
                zoom: sliderZoom,
                rotation: sliderRotation,
                tension: sliderTension,
                file: 0, 
                fileOption: 0,
                height : initialHeight,
                circles : [
                  { x: lastPositionSI.x, y: lastPositionSI.y, radius: 5, movable: false},
                  { x: lastPositionID.x, y: lastPositionSI.y, radius: 5, movable: true },
                  { x: lastPositionID.x, y: lastPositionID.y, radius: 5, movable: true },
                  { x: lastPositionSI.x, y: lastPositionID.y, radius: 5, movable: false},
              ],
                text : initialTexts
            }

      socket.send(JSON.stringify(NewShape));
            
    };
    
    // Cambia en el editor las configuraciones del poligno seleccionado 
    const handleShapeClick = (index) => {
        //console.log(shapes)
        setSelectedShapeIndex(index);
        setSelectedShapeID(shapes[index].id)
        setColorFill(shapes[index].colorfill);
        setColorStroke(shapes[index].colorstroke);
        setSelectedOption(shapes[index].fileOption);
        setHeight(shapes[index].y2 - shapes[index].y1);
        setSliderZoom(shapes[index].zoom);
        setSliderRotation(shapes[index].rotation);
    };

//    Cambia en el editor las configuraciones del poligno seleccionado 
    // const handleShapeonDrag = ( index) => {
    //     setSelectedShapeIndex(index);
    //     setColorFill(shapes[index].colorfill);
    //     setColorStroke(shapes[index].colorstroke);
    //     setSelectedOption(shapes[index].fileOption);
    //     setHeight(shapes[index].y2 - shapes[index].y1);
    //     setSliderZoom(shapes[index].zoom);
    //     setSliderRotation(shapes[index].rotation);

    // };

    const dragItem = useRef(null);
    //const dragOverItem = useRef(null);

    const dragStart = (position) => {
      console.log('start: ',position)
      dragItem.current = position;
      //e.dataTransfer.setData('text/plain', e.target.innerHTML);
    };


   //Movimiento de la barra Drag, poligono
   const handleContainerDrag = (polygonId: number, e: any) => {
    const updatedPolygons = [...shapes];
    const draggedPolygon = updatedPolygons.find(polygon => polygon.id === polygonId);
  
    if (draggedPolygon) {
      const dragOffsetY = e.target.y() - draggedPolygon.y1;
  
      if (dragOffsetY !== 0) {
        for (const targetPolygon of updatedPolygons) {
          if (targetPolygon.id !== polygonId) {
            const heightIndex = draggedPolygon.y2 - draggedPolygon.y1;
            const heightI = targetPolygon.y2 - targetPolygon.y1;
            const adjustment = dragOffsetY > 0 ? -heightIndex : heightIndex;
            const aux = dragOffsetY > 0 ? heightI : -heightI;
  
            // Arriba
            const dragOffsetY2 = e.target.y() - targetPolygon.y1;
            if (dragOffsetY2 < 0 && draggedPolygon.y1 >= targetPolygon.y1) {
              console.log("Cambio", targetPolygon.id);
  
              targetPolygon.y1 += adjustment;
              targetPolygon.y2 += adjustment;
  
              draggedPolygon.y1 += aux;
              draggedPolygon.y2 += aux;
            }
            // Abajo
            else if (dragOffsetY2 > 0 && targetPolygon.y2 >= draggedPolygon.y2) {
              console.log("Cambio", targetPolygon.id);
  
              targetPolygon.y1 += adjustment;
              targetPolygon.y2 += adjustment;
  
              draggedPolygon.y1 += aux;
              draggedPolygon.y2 += aux;
            }
          }
        }
        setShapes(updatedPolygons);
      }
    }
  };

  const handleCheckBox = (e,column) => {

      const copia = [...shapes]
    
      for(var index in copia){
        console.log(copia[index].text[column].enabled);
        if(e.target.checked){
        copia[index].text[column].enabled = true;
      }else{
        copia[index].text[column].enabled = false;
      }
        socket.send(JSON.stringify(copia[index]));  
        // socket.send(JSON.stringify(copia[index].text));  
      }
      
  }

    return (
      <div id="Editor">
         <div id="sidebar">
         <div id="controls">
         <div className='a'>
                <button onClick={HandleSave}>Guardar Cambios</button><br></br>
                <button onClick={handleAddShape}>Agregar Figura</button><br></br>
                <button onClick={HandleUndo}>Deshacer</button><br></br>
                <button onClick={HandleDelete}>Eliminar</button>
        </div>
        <div className='a'>
            <label>Seleccionar opción de Pattern: </label>
            <select value={selectedOption} onChange={handleOptionChange}>
            {Object.keys(Json).map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
            </select>
            <label>Seleccionar color Fill: </label>
            <input type="color" value={ColorFill} onChange={handleColorChangeFill} />
            <label>Seleccionar color Stroke: </label>
            <input type="color" value={ColorStroke} onChange={handleColorChangeStroke} />
        </div>
        
        <div className='a'>
        <p>Tension de lineas: {sliderTension}</p>
          <input
            type="range"
            min={0}
            max={2.5}
            step={0.1}
            value={sliderTension}
            onChange={handleSliderTension}
            onMouseUp={SliderDrop}
          />
         
            <label>Cambiar alto de capa seleccionada: </label>
            <input type="number" value={height} onChange={handleChangeHeight}/>
        </div>
        <div className='a'>
          <p>Valor Zoom: {sliderZoom}</p>
          <input
            type="range"
            min={50}
            max={300}
            value={sliderZoom}
            onChange={handleSliderZoom}
            onMouseUp={SliderDrop}
          />
       
          <p>Valor Rotacion: {sliderRotation}</p>
          <input
            type="range"
            min={0}
            max={180}
            value={sliderRotation}
            onChange={handleSliderRotation}
            onMouseUp={SliderDrop}
          />
        
        </div>
         <div className='a'>
              {
              
              Object.keys(initialTexts).map((key) => {
                if(shapes.length>0)
            {      const item = initialTexts[key];
                  if (item.optional) {
                    return (
                      <div key={key} style={{display:'flex'}}>
                        <label htmlFor={key} style={{ whiteSpace: 'nowrap'}}>{key}</label>
                        <input type="checkbox" id={key} name={key} checked={shapes[0].text.enabled}
                        onChange={(e) => handleCheckBox(e,key)}/>
                      </div>
                    );
                  }
                  return null; // No renderizar el checkbox si optional es false}
            }else{
              const item = initialTexts[key];
              if (item.optional) {
                return (
                  <div key={key} style={{display:'flex'}}>
                    <label htmlFor={key} style={{ whiteSpace: 'nowrap'}}>{key}</label>
                    <input type="checkbox" id={key} name={key} checked={true} />
                  </div>
                );
              }
              return null; 
              
            }
          })}
        </div> 
        </div>
        </div>
    
        <div id="gridContainer">

        <Stage width={2000} height={window.innerHeight}>
            {shapes.map((shape,index) => (
                <Grid
                  key={index} 
                  polygon={shape} 
                  text={shape.text}
                  setText={(text, send) => setText(index, text, send, socket)}
                />
            ))}
        <Layer>
          
            {shapes.map((shape, index) => (
                <Polygon
                  key={index}
                  x1={shape.x1}
                  y1={shape.y1}
                  x2={shape.x2}
                  y2={shape.y2}
                  ColorFill={shape.colorfill}
                  ColorStroke={shape.colorstroke}
                  Zoom={shape.zoom}
                  Rotation={shape.rotation}
                  Tension={shape.tension}
                  File={shape.file}
                  circles={shape.circles}
                  setCircles={(circles, send) => setCircles(index, circles,send, socket)}
                  onClick={() => handleShapeClick(index)}
                  //onDrag={() => {
                  //  handleShapeonDrag(index)
                  //}}
                />
                
            ))} 
            {shapes.map((shape, index) => (
                <Rect
                key={index}
                //x={shape.x1} // lado izquerdo poligono
                //y={shape.y1}
                x={shape.x1}
                y={shape.y1}
                width={80}
                height={shape.y2 - shape.y1}
               // height={shape.x2-shape.x1}
               // fill="yellow"
                opacity={0.5}
                draggable
                onClick = {() => handleShapeClick(index)}
                onDragStart={() => dragStart(shape.id)}
                onDragMove={(e) => {
                    handleContainerDrag(shape.id, e); 
                    e.target.y(shape.y1);
                }}
                // onDragEnd={() => {
                //   if(dragItem.current !== dragOverItem.current)  
                //     {
                //       const copyListItems = [...shapes];
                //       const dragItemContent = copyListItems[dragItem.current];
                //       copyListItems.splice(dragItem.current, 1);
                //       copyListItems.splice(dragOverItem.current, 0, dragItemContent);
                //       setShapes(copyListItems);
                //       dragItem.current = null;
                //       dragOverItem.current = null;
                //     }
                // }}
                dragBoundFunc={(pos) => ({
                    x: 100,
                    y: pos.y, 
                })}
              />
            ))} 
            
           {/* {shapes.map((shape, index) => (
                <ShapeComponent
                  key={index}
                  x={shape.x}
                  y={shape.y}
                  ColorFill={shape.colorfill}
                  ColorStroke={shape.colorstroke}
                  File = {shape.file}
                  onClick={() => handleShapeClick(index)}
                  onDrag={(pos) => {handleShapeonDrag(index, pos)}}
                />
            ))}    */}
           {/* {shapes.map((shape, index) => (
                <Konva
                  key={index}
                  ColorFill={shape.colorfill}
                  ColorStroke={shape.colorstroke}
                  File = {shape.file}
                  onClick={() => handleShapeClick(index)}
                  onDrag={(pos) => {handleShapeonDrag(index, pos)}}
                />
            ))} */}
        </Layer>
        </Stage>
        </div>
        
        </div>
    );
};

export default CoordinateInputs;