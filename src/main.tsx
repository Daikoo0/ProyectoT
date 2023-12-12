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
import Prueba from './components/Prueba/prueba.tsx'
import AddUserToRoom from "./pages/Invite.user.tsx"
import ParticipantForm from "./pages/create.proyect.tsx"

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
    path: "/invite/:project",
    element: <AddUserToRoom />,
  },
  {
    path: "/create",
    element: <ParticipantForm />,
  },
  {
    path: "/image",
    element: <Shape />,
  },
  {
    path: "/app",
    element: <App />,
  },
  {
    path: "/prueba",
    element: <Prueba />,
  }

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <div>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </div>
)
