import {jwtDecode} from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<any>(null);

const AuthProvider = ({ children }) => {
    // State to hold the authentication token
    const [token, setToken_] = useState(localStorage.getItem("token"));
    const [user , setUser] = useState({email: "", name : ""});

    // Function to set the authentication token
    const setToken = (newToken: string) => {
        setToken_(newToken);
    };

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            const decoded: any = jwtDecode(token);
            setUser({email: decoded.email, name: decoded.name});
            
        } else {
            localStorage.removeItem("token");
            setUser({email: "", name: ""});
        }
    }, [token]);

 
    // Provide the authentication context to the children components
    return (
        <AuthContext.Provider value={{ token, setToken, user }}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthProvider;