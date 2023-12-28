import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Editor from './components/Editor/Editor.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Home from './pages/Home.tsx'
import Shape from './components/Prueba/shape.tsx'
import App from './App.tsx'
import { ThemeProvider } from './Context/theme-context.tsx'
import AuthMiddleware from './Context/AuthMiddleware.tsx'
import Prueba from './components/Prueba/prueba.tsx'
import AddUserToRoom from "./pages/Invite.user.tsx"
import ParticipantForm from "./pages/create.proyect.tsx"
import About from "./pages/About.tsx"
import EditableGrid from './components/Prueba/EditableGrid.tsx'

const router = createBrowserRouter([

  
  {
    path: "/",
    element: <About/>,
  },
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/register",
    element: <Register/>,
  },
  {
    path: "/Home",
    element: <AuthMiddleware> <Home/> </AuthMiddleware>,
  },
  {
    path: "/editor/:project",
    element: <AuthMiddleware> <Editor/> </AuthMiddleware>,
  },
  {
    path: "/invite/:project",
    element: <AuthMiddleware> <AddUserToRoom/> </AuthMiddleware>,
  },
  {
    path: "/prueba/:project",
    element: <AuthMiddleware><Prueba/></AuthMiddleware>,
  },
  {
    path: "/create",
    element: <AuthMiddleware> <ParticipantForm/> </AuthMiddleware>,
  },
  {
    path: "/image",
    element: <Shape/>,
  },
  {
    path: "/app",
    element: <App/>,
  },
  {
    path: "/editablegrid",
    element: <EditableGrid/>,
  },
  
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <div>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </div>
)
