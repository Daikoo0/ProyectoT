import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom"; 
import { ProtectedRoute } from "./ProtectedRouter";
import { useAuth } from "../provider/authProvider";
import { Suspense, lazy } from "react";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const About = lazy(() => import("../pages/About"));
const Home = lazy(() => import("../pages/Home"));
const CreateProyect = lazy(() => import("../pages/create.proyect"));
const Editor = lazy(() => import("../components/Prueba/Editor"));
const Profile = lazy(() => import("../pages/perfil"));

const Routes = () => {
  const { token } = useAuth();

  const routesForPublic = [
    {
      path: "/service",
      element: <div>Service Page</div>,
    },
    {
      path: "/about",
      element: <About />,
    },
  ];

  const routesForAuthenticatedOnly = [
    {
      path: "/",
      element: <ProtectedRoute />, 
      children: [
        {
          path: "/home",
          element: <Home />,
        },
        {
          path: "/create",
          element: <CreateProyect />,
        },
        {
          path: "/editor/:project",
          element: <Editor />,
        },
        {
          path: "*",
          element: <Navigate to="/home" />,
        },
        {
          path: "/",
          element: <Navigate to="/home"  />,
        },
        {
          path: "/myProfile",
          element: <Profile />,
        },
      ],
    },
  ];

  const routesForNotAuthenticatedOnly = [
    {
      path: "/",
      element: <About />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    }
  ];

  const router = createBrowserRouter([
    ...routesForPublic,
    ...(!token ? routesForNotAuthenticatedOnly : []),
    ...routesForAuthenticatedOnly,
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default Routes;
