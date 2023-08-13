import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

//import App from './App.tsx'
import Konva from './components/konva.tsx'
import EditablePolygonWithGrid from './components/PruebaKonva.tsx'
//import Ruler from './components/Ruler.tsx'

const router = createBrowserRouter([

  {
    path: "/",
    element: <EditablePolygonWithGrid />,
  },
  {
    path: "/konva",
    element: <Konva />,
  },
  

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
//  <React.StrictMode>
<div>
   
    <RouterProvider router={router} />
    </div>
  //</React.StrictMode>,
)
