import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../components/interfaz/AnimatedPage'; 

function Login() {
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const procesarLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      // 1. Login con email — devuelve datos del usuario incluyendo is_superuser
      const respuesta = await axios.post(`${API_BASE_URL}/api/login/`, credenciales);
      const usuario = respuesta.data.usuario;
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // 2. Obtener JWT usando el username que devolvió el login
      //    Necesario para autenticar llamadas al dashboard admin
      const jwt = await axios.post(`${API_BASE_URL}/api/token/`, {
        username: usuario.username,
        password: credenciales.password,
      });
      localStorage.setItem('access_token', jwt.data.access);
      localStorage.setItem('refresh_token', jwt.data.refresh);

      setCargando(false);
      window.location.href = '/';

    } catch (err) {
      console.error('Error de login:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('No se pudo conectar con el servidor. Verifica tu conexión.');
      }
      setCargando(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md bg-gray-900 border !border-white/10 p-8 rounded-2xl shadow-2xl">
          
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-500">
            Iniciar Sesión
          </h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm py-3 px-4 rounded-lg text-center mb-6">
              {error}
            </div>
          )}

          <form onSubmit={procesarLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                name="email" 
                className="w-full bg-black border !border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                value={credenciales.email}
                onChange={handleChange}
                placeholder="tu@correo.com"
                required 
                disabled={cargando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Contraseña
              </label>
              <input 
                type="password" 
                name="password" 
                className="w-full bg-black border !border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                value={credenciales.password}
                onChange={handleChange}
                placeholder="••••••••"
                required 
                disabled={cargando}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 !rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={cargando}
            >
              {cargando ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando...
                </span>
              ) : (
                <>
                  Entrar 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-blue-500 hover:text-blue-400 font-bold transition-colors">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Login;
