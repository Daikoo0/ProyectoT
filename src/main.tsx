import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
//import App from './App.tsx'
//import Line from './components/LineTest.tsx'
import Editor from './components/Editor.tsx'
//import Socket from './components/Socket.tsx'
//import Example from './components/example.tsx'
//import Ruler from './components/Ruler.tsx'
import Login from './components/Login.tsx'
import Register from './components/Register.tsx'
import Home from './components/Home.tsx'
import A from './components/ea.tsx'

const router = createBrowserRouter([

  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/editor/:project",
    element: <Editor />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/Home",
    element: <Home />,
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
