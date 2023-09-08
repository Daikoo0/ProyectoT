import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
//import App from './App.tsx'
import Line from './components/LineTest.tsx'
import Editor from './components/Editor.tsx'
//import Example from './components/example.tsx'
//import Ruler from './components/Ruler.tsx'
import Login from './components/Login.tsx'

const router = createBrowserRouter([

  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/editor",
    element: <Editor />,
  },
  {
    path: "/linetest",
    element: <Line />,
  }

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
//  <React.StrictMode>
<div>
   
    <RouterProvider router={router} />
    </div>
  //</React.StrictMode>,
)
