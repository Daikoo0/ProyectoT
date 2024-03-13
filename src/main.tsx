import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Home from './pages/Home.tsx'
import App from './App.tsx'
import { ThemeProvider } from './Context/theme-context.tsx'
import AuthMiddleware from './Context/AuthMiddleware.tsx'
import AddUserToRoom from "./pages/Invite.user.tsx"
import ParticipantForm from "./pages/create.proyect.tsx"
import About from "./pages/About.tsx"
import VariableRowHeight from './components/Prueba/Editor.tsx'

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
    path: "/invite/:project",
    element: <AuthMiddleware> <AddUserToRoom/> </AuthMiddleware>,
  },
  {
    path: "/create",
    element: <AuthMiddleware> <ParticipantForm/> </AuthMiddleware>,
  },
  {
    path: "/app",
    element: <App/>,
  },
  {
    path: "/editor3/:project",
    element: <AuthMiddleware> <VariableRowHeight/>  </AuthMiddleware>,
  },
  
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <div>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </div>
)
