import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'

import Editor from './components/Editor.tsx'
import Login from './components/Login.tsx'
import Register from './components/Register.tsx'
import Home from './components/Home.tsx'
import Shape from './components/shape.tsx'

import AddUserToRoom from "./components/Invite.user.tsx"
import ParticipantForm from "./components/create.proyect.tsx"
import UserProjects from "./components/proyects.tsx"
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
  {
    path: "/invite",
    element: <AddUserToRoom />,
  },
  {
    path: "/create",
    element: <ParticipantForm />,
  },
  {
    path: "/proyects",
    element: <UserProjects />,
  },
  {
    path: "/image",
    element: <Shape />,
  }
 
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
