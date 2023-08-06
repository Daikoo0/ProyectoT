import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'

//import App from './App.tsx'
import Konva from './components/konva.tsx'
import EditablePolygon from './components/PruebaKonva.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <EditablePolygon />,
  },
  {
    path: "/konva",
    element: <Konva />,
  },
  
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
