import api from "../api/ApiClient";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext<any>(null);

const AuthProvider = ({ children }) => {
    // State to hold the authentication token
    const [token, setToken_] = useState(localStorage.getItem("token"));
    //const [token, setToken_] = useState("ashdga");
    
    // Function to set the authentication token
    const setToken = (newToken: string) => {
    setToken_(newToken);
  };

  useEffect(() => {
    if (token) {
        api.defaults.headers.common["Authorization"] = "Bearer " + token;
        localStorage.setItem("token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token, 
      setToken,
    }),
    [token]
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;