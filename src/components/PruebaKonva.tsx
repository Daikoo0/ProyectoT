// import React, { useState, useEffect } from 'react';
// import { Stage, Layer, Line, Circle, Rect } from 'react-konva';
// import { DndProvider, useDrag } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// //import myPatternImage from '../assets/601.png'
// //import Ruler from './Ruler.tsx'
// import Json from '../lithologic.json';
// //import useImage from 'use-image';
// //import Konva from 'konva';
// import Polygon from './Polygon.tsx';

// interface Point {
//   x: number;
//   y: number;
//   radius : number;
//   movable : boolean;
// }

// const initialPoints: Point[] = [
//   { x: 100, y: 100 , radius: 5, movable: false}, // S. Izquieda
//   { x: 200, y: 100 , radius: 5, movable: false}, // S. Derecha
//   { x: 200, y: 200 , radius: 5, movable: false}, // I. Derecha
//   { x: 100, y: 200 , radius: 5, movable: false}, // I. Izquierda
// ];

// const EditablePolygon: React.FC = () => {
  
//   //const [stageWidth, setStageWidth] = useState(window.innerWidth);
//   //const [stageHeight, setStageHeight] = useState(window.innerHeight / 2);
//   const [selectedPolygonIndex, setSelectedPolygonIndex] = useState<number | null>(null);
//   const [selectedFileName,setSelectedFileName] = useState< string | null>(null);
  
//   //const [image,setImage] = useState(new window.Image());
//   //image.src = myPatternImage;
//   const blockSnapSize =  initialPoints[2].y - initialPoints[0].y;
//  /* const [polygons, setPolygons] = useState<{ points: Point[]; image: HTMLImageElement }[]>([
//     { points: initialPoints, image : null },
//   ]);*/

//   const [polygons, setPolygons] = useState([]);

//   const [lastPositionY, setLastPositionY] = useState(0);
//   const [isConnected, setIsConnected] = useState(false);
//   const opcionesArray = Object.keys(Json).map((key) => ({ value: key, label: Json[key] }));

// /*
//   useEffect(() => {
//     image.onload = () => {
//       setImage(image); };

//     image.src = myPatternImage;
    
//     // Redimencionado de la pantalla al cambio en la ventana del navegador 
//     const calculateStageSize = () => {
//       let maxX = 0;
//       let maxY = 0;
//       for (const points of polygons) {
//         for (const point of points.points) {
//           maxX = Math.max(maxX, point.x);
//           maxY = Math.max(maxY, point.y);
//         }
//       }
//       setStageWidth(maxX + 100); 
//       setStageHeight(maxY + 100);
//     };

//     calculateStageSize();
//     window.addEventListener('resize', calculateStageSize);
//     return () => window.removeEventListener('resize', calculateStageSize);
//   }, [polygons,image.src]);*/

//  /* useEffect(() => {
//     const imageObj = new window.Image();
//     imageObj.onload = () => {
//       setImage(imageObj);
//     };
//     imageObj.src = myPatternImage;
//   }, []);*/

//   // Solo para mover los puntos del poligono, movable == True
//   const handleDragEnd = (polygonIndex: number, pointIndex: number, e: any) => {
    
//       const updatedPolygons = polygons.map((polygon, index) => {
//         if (index !== polygonIndex) return polygon;
//         const updatedPoints = [...polygon.points];
//         updatedPoints[pointIndex] = { x: e.target.x(), y: polygon.points[pointIndex].y, radius:5, movable : true }; 
//         return { ...polygon, points: updatedPoints };
//       });
      
//       setPolygons(updatedPolygons);
    
//   };
  
//   // CAMBIO PROXIMO, Seleccion del indice de la figura
//   const handlePolygonClick = (polygonIndex: number) => {
//     setSelectedPolygonIndex(polygonIndex);
//   };

//   //const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   //const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

//   // Añade los nuevos puntos para un nuevo poligono.
//   const handleAddPolygon = () => {
//     const lastPolygon = polygons[polygons.length - 1] || { points: initialPoints };
//     const verticalSpacing = lastPolygon.points[3].y - lastPolygon.points[0].y;
//     const newPolygon = {
//       x2 : 200,
//       y1 : 100, 
//       y2 : 200, 
//       ColorFill : "red", 
//       ColorStroke : "black", 
//       File : null,  
//       onClick : null, 
//       onDrag : null};

//    /* const newPolygon: Point[] = [
//       { x: 100, y: lastPolygon.points[0].y + verticalSpacing , radius: 5, movable: false},
//       { x: 200, y: lastPolygon.points[0].y + verticalSpacing , radius: 5, movable: false},
//       { x: 200, y: lastPolygon.points[0].y + verticalSpacing + 100 , radius: 5, movable: false},
//       { x: 100, y: lastPolygon.points[0].y + verticalSpacing + 100 , radius: 5, movable: false},
//     ];
//     const updatedPolygons = [
//       ...polygons,
//       { points: newPolygon, image: null },
//     ];*/

//     /*socket.emit('polygons', {
//             polygons: [...polygons, { points: newPolygon, image : image3 }],
//         })*/

//     setPolygons(updatedPolygons);
// };

//   // al seleccionar patrones:
//   const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedFileName(Json[e.target.value]);
//   /*  const selectedFileName = e.target.value;
//      console.log(selectedFileName);
//     if (selectedPolygonIndex !== null) {
//       const updatedPolygons = polygons.map((polygon, index) => {
//         if (index !== selectedPolygonIndex) return polygon;

//       const image = new window.Image();
//       image.src = `./src/assets/${Json[selectedFileName]}.png`;
//       image.onload = () => {
//         const updatedPolygon = { ...polygon, image: image };
//         const updatedPolygons = [...polygons];
//         updatedPolygons[selectedPolygonIndex] = updatedPolygon;
//         setPolygons(updatedPolygons);
//         console.log(image.src)
//       }
//         image.onerror = () => {
//           console.error(`Error loading image: ${Json[selectedFileName]}.png`);
//         };

//         return polygon;
//       });

//       setPolygons(updatedPolygons);
//     }
//     */
//   };
  
// // Barrita amarilla 
// const handleContainerDrag = (polygonIndex: number, e: any) => {
//   const dragOffsetY = e.target.y() - Math.min(...polygons[polygonIndex].points.map((p) => p.y));
//   const updatedPolygons = [...polygons];

//   // Check for collision with the dragged area
//   const dragMaxY = Math.max(...polygons[polygonIndex].points.map((p) => p.y)) + dragOffsetY;
//   const dragMinY = Math.min(...polygons[polygonIndex].points.map((p) => p.y)) + dragOffsetY;

//   for (let i = 0; i < updatedPolygons.length; i++) {
//     if (i !== polygonIndex) {
//       const minY = Math.min(...updatedPolygons[i].points.map((p) => p.y));
//       const maxY = Math.max(...updatedPolygons[i].points.map((p) => p.y));

//       // Check if polygons are adjacent without any gap
//       if ((maxY >= dragMinY && maxY <= dragMaxY) && (minY >= dragMinY && minY <= dragMaxY)) {
//         const adjustment = dragOffsetY > 0 ? -blockSnapSize : blockSnapSize;
//         updatedPolygons[i].points = updatedPolygons[i].points.map((point) => ({
//           x: point.x,
//           y: point.y + adjustment,
//           radius: 3,
//           movable: true
//         }));
//       }
//     }
//   }

//   updatedPolygons[polygonIndex].points = updatedPolygons[polygonIndex].points.map((point) => ({
//     x: point.x,
//     y: point.y + dragOffsetY,
//     radius: 5,
//     movable : true,
//   }));

//   const adjustedLastPositionY = lastPositionY + dragOffsetY;
//   setLastPositionY(adjustedLastPositionY);
//   setPolygons(updatedPolygons);
// };

// const handleAddPoint = (e, polygonIndex) => {

//   const mousePos = e.target.getStage().getPointerPosition();
//   const x = mousePos.x;
//   const y = mousePos.y;
//   const points = polygons[polygonIndex].points;
//   for (let i = 0; i < points.length / 2; i++) {
//     const s_x = points[i * 2];
//     const s_y = points[i * 2 + 1];
//     const e_x = points[(i * 2 + 2) % points.length];
//     const e_y = points[(i * 2 + 3) % points.length];

//     if (
//       ((s_x <= x && x <= e_x) || (e_x <= x && x <= s_x)) &&
//       ((s_y <= y && y <= e_y) || (e_y <= y && y <= s_y))
//     ) {
//       const point = { x, y, radius: 5, movable: true };
//       const updatedCircles = [...polygons[polygonIndex].points];
//       updatedCircles.splice(i + 1, 0, point);
//       //var circles = updatedCircles.map((circle) => [circle.x, circle.y]).flat();
      
//      const updatedPolygons = polygons.map((polygon, index) => {
//         if (index !== polygonIndex) return polygon;
  
//         return { ...polygon, points: updatedCircles };
//       });
    
//  //     setCircles(updatedCircles);
//    //   setPolygonPoints(circlesToPoints(updatedCircles));
    
//       break;
//     }
//   }
// };
  
//   return (
//     <DndProvider backend={HTML5Backend}>
//       <h2>{isConnected ? 'CONECTADO' : 'NO CONECTADO'}</h2>
      
//       <label htmlFor="opcionesSelect">Selecciona una opción:</label>
//       <select id="opcionesSelect" onChange={handleSelectChange}>
//         {opcionesArray.map((opcion) => (
//           <option key={opcion.value} value={opcion.value}>
//             {opcion.value}
//           </option>
//         ))}
//       </select>
      
//       <button onClick={handleAddPolygon}>Agregar capa</button>
//       <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
//         <Stage width={window.innerWidth} height={window.innerHeight}>
//           <Layer>
//             {polygons.map((polygon, polygonIndex) => (
//               <React.Fragment key={polygonIndex}>
//                 {/* Cuadro contenedor */}
//                 <Rect
//                   x={polygon.points[0].x}
//                   y={polygon.points[0].y}
//                   width={window.innerWidth-200} // Ancho fijo del cuadro contenedor
//                   height={polygon.points[3].y - polygon.points[0].y}
//                   stroke="white"
//                   strokeWidth={1}
//                   opacity={0.5}
//                 />
//               {/* Añade los vértices faltantes para cerrar el cuadro */}
//               <Line
//                 points={[
//                   polygon.points[0].x, polygon.points[0].y,
//                   polygon.points[0].x + window.innerWidth-200, polygon.points[0].y, // Extremo derecho del cuadro fijo
//                   polygon.points[0].x + window.innerWidth-200, polygon.points[3].y,
//                   polygon.points[0].x, polygon.points[3].y,
//                   polygon.points[0].x, polygon.points[0].y
//                 ]}
//                 closed
//                 stroke="white"
//                 strokeWidth={2}
//                 opacity={0.5}
//               />
                
//                 {/* Polígono */}
//                   {/*<Line
//                   points={polygon.points.flatMap((p) => [p.x, p.y])}
//                   closed
//                   fillPatternImage={polygon.image} 
//                   strokeWidth={2}
//                   stroke={polygonIndex === selectedPolygonIndex ? "blue" : "red"} // Cambia el color del trazo
//                   onClick={(e) => {handlePolygonClick(polygonIndex);
//                     handleAddPoint(e, polygonIndex)
//                   }}
//                 />*/}
                
//                <Polygon 
//                   x1={100} 
//                   x2={200} 
//                   y1={100} 
//                   y2={200} 
//                   ColorFill={"red"} 
//                   ColorStroke={"black"} 
//                   File={selectedFileName} 
//                   onClick={null} 
//                   onDrag={null}/>

//               {polygon.points.map((point, pointIndex) => (
//                   <DraggableCircle
//                     key={`${polygonIndex}-${pointIndex}`}
//                     x={point.x}
//                     y={point.y}
//                     radius={6}
//                     fill={point.movable ? 'blue' : 'green'}
//                     onDragEnd={(e) => handleDragEnd(polygonIndex, pointIndex, e)}
//                   />
//                 ))}
//               </React.Fragment>
//             ))}
//           </Layer>
//           <Layer>
//             {polygons.map((polygon, polygonIndex) => (
//               <React.Fragment key={polygonIndex}>
//                 <Rect
//                   x={polygon.points[0].x} // Empieza desde el lado izquierdo del polígono
//                   y={Math.min(...polygon.points.map((p) => p.y))}
//                   width={25}
//                   height={polygon.points[3].y - polygon.points[0].y}
//                   fill="yellow"
//                   opacity={0.5}
//                   draggable
//                   onDragStart={(e) => setLastPositionY(e.target.y())}
//                   onDragMove={(e) => {
//                     const posY = Math.round(e.target.y() / blockSnapSize) * blockSnapSize;
//                     e.target.y(posY);
//                     handleContainerDrag(polygonIndex, e); 
//                   }}
//                   onDragEnd={(e) => handleContainerDrag(polygonIndex, e)}
//                   dragBoundFunc={(pos) => ({
//                     x: 100,
//                     y: pos.y, 
//                   })}
//                 />
//               </React.Fragment>
//             ))}
//           </Layer>
//         </Stage>
        
//       </div>
    
//     </DndProvider>
//   );
  
// };

// interface DraggableCircleProps {
//   x: number;
//   y: number;
//   radius: number;
//   fill: string;
//   onDragEnd: (e: any) => void;
// }

// const DraggableCircle: React.FC<DraggableCircleProps> = ({ x, y, radius, fill, onDragEnd }) => {
//   const [, drag] = useDrag({
//     type: 'circle',
//     item: { index: 0 },
//   });

//   return (
//     <Circle
//       x={x}
//       y={y}
//       radius={radius}
//       fill={fill}
//       draggable={fill === 'blue'} // Solo permitir arrastrar los puntos editables (en azul)
//       onDragEnd={onDragEnd}
//       {...drag}
//     />
//   );
// };

// export default EditablePolygon;