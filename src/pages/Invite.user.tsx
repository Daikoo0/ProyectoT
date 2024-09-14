import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/ApiClient'; // Asegúrate de que la ruta sea correcta

const InvitationHandler: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    console.log('Token:', token);

    if (token) {
      api.post('/validate-invitation', { token })
        .then((response) => {
          const data = response.data;
          if (data.status === 'valid') {
            console.log('Datos de la invitación:', data);
            navigate(`/editor/${data.roomID}`);
          } else {
            setStatus('El enlace de invitación no es válido o ha expirado.');
          }
        })
        .catch((error) => {
          console.error('Error al validar el enlace de invitación:', error);
          setStatus('Ocurrió un error al validar el enlace de invitación.');
        });
    } else {
      setStatus('No se proporcionó un token de invitación.');
    }
  }, [location, history]);

  return (
    <div>
      {status ? <p>{status}</p> : <p>Validando el enlace de invitación...</p>}
    </div>
  );
};

export default InvitationHandler;
