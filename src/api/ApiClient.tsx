import axios from 'axios';

// Instancia de axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Configurar un interceptor para las solicitudes antes de ser enviadas
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

// Configurar un interceptor de la respuesta de la api
api.interceptors.response.use(
    response => {
        // Si la respuesta es exitosa, devolverla sin cambios
        return response;
    },
    error => {
        // Aqui se manejan los errores de la solicitud
        // Error Unauthorized
        if (error.response.status === 401) {
            console.log("Error 401: No autorizado. Por favor, inicia sesión nuevamente.");
            
        }
        if (error.message === 'Network Error') {
            throw new Error(error);
          }
        // Devolver el error para que pueda ser manejado en el lugar donde se hizo la solicitud
        return Promise.reject(error);
    }
);

export default api