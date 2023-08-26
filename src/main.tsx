import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
//import App from './App.tsx'
import EditablePolygon from './components/PruebaKonva.tsx'
import Editor from './components/Editor.tsx'
//import Example from './components/example.tsx'
//import Ruler from './components/Ruler.tsx'

const router = createBrowserRouter([

  
  {
    path: "/editor",
    element: <Editor />,
  },
  /*{
    path: "/example",
    element: <Example />,
  }*/

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
//  <React.StrictMode>
<div>
   
    <RouterProvider router={router} />
    </div>
  //</React.StrictMode>,
)
