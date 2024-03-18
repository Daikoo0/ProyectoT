import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/ApiClient';

// Componente de middleware para verificar la autenticación
const AuthMiddleware = ({ children }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    async function Auth() {
        try {
            const response = await api.get('users/auth', {
              withCredentials: true,
            });

            console.log(response.status)

            if (response.status !== 200) {
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
