import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { useParams } from 'react-router-dom';

//import ShapeComponent from './shape';
//import Konva from './konva';
import Json from '../lithologic.json';
import Polygon from './Polygon';
import Grids from './Grids';
import './Editor.css';

const CoordinateInputs: React.FC = () => {
//ola gente soi yo de nuevo me pitie el socket o eso creo
//no se que paso pero andava viendo y como vamos a definir el traslado de la info
//lo que yo tenia puesto eran dos cosas,
//yo estaba compartiendo entre todos los participantes de la room el ultimo mensaje enviado
//creo que modificaron la forma en que llaman eso por que nada funciona
//o sea con eso me refiero a que es el ultimo cuadro editado
//tambien tenia algo que era el historial de cambios y eso era lo que guardaba en la bd
//creo que confundieron esas cosas y por eso se bugeo
//en fin de ahi hablamos eso

//PD: no se como pero me dieron las 6 AM terminando esto, corte FNAF sadasjdjasdjajs
//deje comentarios en varios archivos, no se como pero modifique mas de 20 archivos 💀💀 


//ola soi yo otra vez
//hay que exsorcisar su front, como que convulsiona cuando va a recibir los datos que se han guardado
//probe desde el back y se manda todo piola, creo que no aguanta tantos datos
//modifique los guardados, ahora no son automaticos y para guardar hay que presionar el boton grande que dice guardar
//pude hacer el control Z, toi feliz al fin me salio la wea, todo piola hasta que julio se entere de la forma nefasta de como hice la wea
//y eso, ahi vemos que pasa 💀💀
//PD: muere levano 💀💀 

  //---------------// POLIGONOS //---------------//
    //Figuras / Poligonos 
    const [shapes, setShapes] = useState([]); 
  
    // Index de la Figura / Poligono
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(null); // 0,1,2,3...
    
    // Ultima posicion Poligono // ARREGLAR 
    const [lastPositionSI, setLastPositionSI] = useState({ x: 100, y:100 });
    const [lastPositionID, setLastPositionID] = useState({ x: 200, y:200 });


  //---------------// CAPAS Y GRID //---------------//
    // Alto de la capa
    const [initialHeight] = useState(100);
    const [height, setHeight] = useState<number>(initialHeight);
   
    //const blockSnapSize =  initialPoints[2].y - initialPoints[0].y;



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

    // websocket instanciacion
    const { project } = useParams();
    //console.log(project)
    const [socket, setSocket] = useState<WebSocket | null>(null);

  // Instancia del socket cuando se monta el componente
  useEffect(() => {
    const newSocket = new WebSocket(`ws://localhost:3001/ws/${project}`);
    setSocket(newSocket);
    newSocket.onopen = () => {
      console.log('WebSocket is open');
    };

    newSocket.onclose = () => {
      console.log('WebSocket is closed. Reconnect will be attempted in 1 second.');
      setTimeout(() => {
        setSocket(new WebSocket(`ws://localhost:3001/ws/${project}`));
      }, 1000);
    };

    return () => {

      newSocket.close();
    };
  }, [project]);

  useEffect(() => {
    if (socket) { 
      // Recibe la información del socket
      socket.onmessage = (event) => {
        console.log(event.data);
        const shapes = JSON.parse(event.data);
        setShapes(currentShapes => {
          const existingShapeIndex = currentShapes.findIndex(s => s.id === shapes.id);
          if (existingShapeIndex !== -1) {
            // Si el cuadrado ya existe, actualizamos su posición en lugar de agregar un nuevo cuadrado
            const updatedSquares = [...currentShapes];
            updatedSquares[existingShapeIndex] = shapes;
            return updatedSquares;
          } else {
            // Si el cuadrado no existe, lo agregamos
            return [...currentShapes, shapes];
          }
        });
        
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
        socket.close(), document.removeEventListener("keydown", handleKeyDown);;
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
          socket.send("undo");
          
      };

      // Evento mio sjdjsjda es para guardar los cambios
        const HandleSave = () => {
          console.log("guardando..")
          socket.send("save");
          
      };

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
      console.log('Se ejecuto')
      setHeight(Number(event.target.value));
      const newHeight = Number(event.target.value);
      if (selectedShapeIndex !== null) {
        const selectedShape = shapes[selectedShapeIndex];
        const deltaY = newHeight - (selectedShape.y2 - selectedShape.y1);
    
        const updatedShapes = shapes.map((shape, index) => {
          if (index === selectedShapeIndex) {
            const newY2 = shape.y1 + newHeight;
            if(newY2 < shape.y2){
              
              const filteredCircles = shape.circles.filter((circle, index) => {
                return !(circle.y > newY2 && circle.movable && index > 1);
              });
              
              return {
                ...shape,
                y2: newY2,
                circles : filteredCircles,
              };

            }else{
            return {
              ...shape,
              y2: newY2,
            };}
          } else if (index > selectedShapeIndex) {
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
    }


    //////////////-----------MODIFICADO-----------------//////////////
    // Generacion de figuras, envio a backend 
    const handleAddShape = () => {

      const NewShape =
            {   
                id: shapes.length,
                x1: lastPositionSI.x, y1: lastPositionSI.y, 
                x2: lastPositionID.x, y2: lastPositionID.y,  
                colorfill: initialColorFill, 
                colorstroke: initialColorStroke, 
                zoom: sliderZoom,
                rotation: sliderRotation,
                file: 0, 
                fileOption: 0,
                height : initialHeight,
                circles : [
                  { x: lastPositionSI.x, y: lastPositionSI.y, radius: 5, movable: false},
                  { x: lastPositionID.x, y: lastPositionSI.y, radius: 5, movable: true},
                  { x: lastPositionID.x, y: lastPositionID.y, radius: 5, movable: true},
                  { x: lastPositionSI.x, y: lastPositionID.y, radius: 5, movable: false},
                
              ]
            }
      
      socket.send(JSON.stringify(NewShape));

      //setLastPositionID({ x: lastPositionID.x, y: lastPositionID.y  })
      //setLastPositionSI({ x: lastPositionSI.x, y: lastPositionSI.y  }) //arreglar
            
    };
    
    // Cambia en el editor las configuraciones del poligno seleccionado 
    const handleShapeClick = (index) => {
        //console.log(shapes)
        setSelectedShapeIndex(index);
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
    const dragOverItem = useRef(null);

    const dragStart = (position) => {
      console.log('start: ',position)
      dragItem.current = position;
      //e.dataTransfer.setData('text/plain', e.target.innerHTML);
    };

    //Movimiento de la barra Drag, poligono
    
   const handleContainerDrag = (polygonIndex: number, e: any) => {
      const updatedPolygons = [...shapes];
      const dragOffsetY = e.target.y() - updatedPolygons[polygonIndex].y1;

      if (dragOffsetY !== 0) {
        const draggedPolygon = updatedPolygons[polygonIndex];
        for (let i = 0; i < updatedPolygons.length; i++) {
          
          if (i !== polygonIndex) {
            const targetPolygon = updatedPolygons[i];
           
            const heightIndex = draggedPolygon.y2 - draggedPolygon.y1;
            const heightI = targetPolygon.y2 - targetPolygon.y1;
            const adjustment = dragOffsetY > 0 ? -heightIndex : heightIndex;
            const aux = dragOffsetY > 0 ? heightI : -heightI;
    //arriba
    const dragOffsetY2 = e.target.y() - targetPolygon.y1;
            if (dragOffsetY2 < 0  && 
              draggedPolygon.y1 >= targetPolygon.y1
            ) {
               
          dragOverItem.current = i;
                targetPolygon.y1 += adjustment;
                targetPolygon.y2 += adjustment;

                draggedPolygon.y1 += aux;
                draggedPolygon.y2 += aux;

    //abajo
            } else if (dragOffsetY2 > 0 && 
              targetPolygon.y2 >= draggedPolygon.y2  
           ) {
            
          dragOverItem.current = i;
                targetPolygon.y1 += adjustment;
                targetPolygon.y2 += adjustment;
        
                draggedPolygon.y1 += aux;
                draggedPolygon.y2 += aux;

            }
          }
        }
        setShapes(updatedPolygons);
        
      }
};

    return (
      <div id="Editor">
         <div id="sidebar">
         <div id="controls">
        <div>
            <label>Seleccionar opción de Pattern: </label>
            <select value={selectedOption} onChange={handleOptionChange}>
            {Object.keys(Json).map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
            </select>
        </div>
        <div>
            <label>Seleccionar color Fill: </label>
            <input type="color" value={ColorFill} onChange={handleColorChangeFill} />
        </div>
        <div>
            <label>Seleccionar color Stroke: </label>
            <input type="color" value={ColorStroke} onChange={handleColorChangeStroke} />
        </div>
        <div>
            <button onClick={handleAddShape}>Agregar Figura</button>
        </div>
        <div>
            <label>Cambiar alto de capa seleccionada: </label>
            <input type="number" value={height} onChange={handleChangeHeight}/>
        </div>
        <div>
          <p>Valor Zoom: {sliderZoom}</p>
          <input
            type="range"
            min={50}
            max={300}
            value={sliderZoom}
            onChange={handleSliderZoom}
            onMouseUp={SliderDrop}
          />
        </div>
        <div>
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
        <div>
          <button onClick={HandleUndo}>Deshacer</button>
        </div>
        <div>
          <button onClick={HandleSave}>Guardar Cambios</button>
        </div>

        </div>
        </div>
        <div id="gridContainer">

        <Stage width={window.innerWidth} height={window.innerHeight}>
        <Grids polygons={shapes} />
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
                //   onDragStart={(e) => {setLastPositionID({ x: lastPositionID.x, y: e.target.y() })
                //   setLastPositionSI({ x: lastPositionSI.x, y: e.target.y() })
                // }}
                onDragStart={() => dragStart(index)}
                onDragMove={(e) => {
                    handleContainerDrag(index, e); 
                    e.target.y(shape.y1);
                }}
                onDragEnd={() => {
                  if(dragItem.current !== dragOverItem.current)  
                    {
                      const copyListItems = [...shapes];
                      const dragItemContent = copyListItems[dragItem.current];
                      copyListItems.splice(dragItem.current, 1);
                      copyListItems.splice(dragOverItem.current, 0, dragItemContent);
                      setShapes(copyListItems);
                      dragItem.current = null;
                      dragOverItem.current = null;
                    }
                }}
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