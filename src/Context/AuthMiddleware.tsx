import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componente de middleware para verificar la autenticación
const AuthMiddleware = ({ children }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    async function Auth() {
        try {
            const response = await fetch("http://192.168.1.20:3001/users/auth", {
                method: "GET",
                credentials: "include",
            });

            console.log(response)

            if (!response.ok) {
                throw new Error(`Authentication failed with status ${response.status}`);
            }
        
        } catch (error) {
          console.error('Authentication Error:', error.message);
          navigate('/login');
        }finally {
            setIsLoading(false);
        }
      };


  useEffect(() => {
    Auth();
    
  }, []);

  return isLoading ? null : <>{children}</>;
};

export default AuthMiddleware;
