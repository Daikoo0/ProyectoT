import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom"; 
import { ProtectedRoute } from "./ProtectedRouter";
import { useAuth } from "../provider/authProvider";

// Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import About from "../pages/About";
import Home from "../pages/Home";
import CreateProyect from "../pages/create.proyect";
import Editor from "../components/Prueba/Editor";

const Routes = () => {
    const { token } = useAuth();

  // Routes accessible to all users
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

  // Routes accessible only to authenticated users
  const routesForAuthenticatedOnly = [
    {
      path: "/",
      element: <ProtectedRoute />, // Wrap the component in ProtectedRoute
      children: [
        {
          path: "/home",
          element: <Home/>,
        },
        {
          path: "/create",
          element: <CreateProyect/>,
        },
        {
          path: "/editor/:project",
          element: <Editor/>,
        },
        {
          path: "*",
          element: <Navigate to="/home" replace />,
        },
        {
          path: "/",
          element: <Navigate to="/home" replace />,
        }
      ],
    },
  ];

  // Routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [
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
    }
  ];

  // Combine and conditionally routes based on authentication status
  const router = createBrowserRouter([
    ...routesForPublic,
    ...(!token ? routesForNotAuthenticatedOnly : []),
    ...routesForAuthenticatedOnly,
  ]);

  // Provide the router configuration using RouterProvider
  return <RouterProvider router={router} />;
};

export default Routes;
