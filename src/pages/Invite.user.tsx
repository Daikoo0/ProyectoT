import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/ApiClient';
import { useTranslation } from 'react-i18next';

const InvitationHandler: React.FC = () => {
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation("Invitation");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    console.log('Token:', token);

    if (token) {
      api.post('/validate-invitation', { token })
        .then((response) => {
          const data = response.data;
          if (data.status === 'valid') {
            navigate(`/editor/${data.roomID}`);
          } else {
            setStatus('El enlace de invitación no es válido o ha expirado');
          }
        })
        .catch((error) => {
          setStatus(error.response.data.message);

        });
    } else {
      setStatus("No se proporciono un token de invitacion");
    }
  }, [location, history]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-base-200 to-base-300">
      <div className="p-8 bg-white rounded-lg shadow-lg flex">
        {status ? (
          <>
            <div className="flex-shrink-0 h-full">
              <svg className="text-error h-full fill-primary" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24">
                <path d="M21.972 11.517a.527.527 0 0 0-1.034-.105 1.377 1.377 0 0 1-1.324 1.01 1.467 1.467 0 0 1-1.4-1.009.526.526 0 0 0-1.015 0 1.467 1.467 0 0 1-2.737.143l-.049-.204.021-.146V9.369h2.304a2.632 2.632 0 0 0 2.631-2.632 2.678 2.678 0 0 0-2.654-2.632l-.526.022-.13-.369A2.632 2.632 0 0 0 13.579 2c-.461 0-.915.124-1.313.358L12 2.513l-.266-.155A2.603 2.603 0 0 0 10.422 2a2.632 2.632 0 0 0-2.483 1.759l-.13.37-.518-.024a2.681 2.681 0 0 0-2.66 2.632A2.632 2.632 0 0 0 7.264 9.37H9.61v1.887l-.007.09-.028.08a1.328 1.328 0 0 1-1.301.996 1.632 1.632 0 0 1-1.502-1.024.526.526 0 0 0-1.01.013 1.474 1.474 0 0 1-1.404 1.01 1.381 1.381 0 0 1-1.325-1.01.547.547 0 0 0-.569-.382h-.008a.526.526 0 0 0-.456.526v.446a10.012 10.012 0 0 0 10 10 9.904 9.904 0 0 0 7.067-2.94A10.019 10.019 0 0 0 22 11.966l-.028-.449ZM8.316 15.685a1.053 1.053 0 1 1 2.105 0 1.053 1.053 0 0 1-2.105 0Zm1.58 3.684a2.105 2.105 0 0 1 4.21 0h-4.21Zm4.736-2.631a1.052 1.052 0 1 1 0-2.105 1.052 1.052 0 0 1 0 2.105Z" />
              </svg>
            </div>
            <div className="ml-4 flex flex-col justify-center">
              <p className="text-primary text-lg font-semibold">{t(status, {lng: localStorage.getItem("user-lang")})}</p>
              <button
                className="btn mt-4 px-4 py-2 bg-primary text-white rounded"
                onClick={() => navigate('/home')}
              >
                Volver a Inicio
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-blue-500"></span>
            <p className="ml-4 text-blue-500 text-lg font-semibold">Validando el enlace de invitación...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationHandler;
