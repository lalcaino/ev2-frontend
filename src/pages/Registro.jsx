import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../components/interfaz/AnimatedPage';

function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    username: '',
    email: '',
    password: '',
    confirmarPassword: ''
  });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // DEFINIMOS LA URL DESDE EL ENV (Vite usa import.meta.env)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const procesarRegistro = (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    const datosAEnviar = {
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      username: formData.username,
      email: formData.email,
      password: formData.password
    };

    // USAMOS LA URL DINÁMICA
    axios.post(`${API_BASE_URL}/api/registro/`, datosAEnviar)
      .then(respuesta => {
        setCargando(false);
        // Podrías usar un Toast aquí también, pero el alert es efectivo para registros exitosos
        alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
        navigate('/login');
      })
      .catch(err => {
        console.error("Error al registrar:", err);
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError("No se pudo conectar con el servidor. Intenta nuevamente más tarde.");
        }
        setCargando(false);
      });
  };

  // Clase reutilizable para los inputs
  const inputClass = "w-full bg-black border !border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50";
  // Clase para los labels
  const labelClass = "block text-sm font-medium text-gray-400 mb-2";

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-gray-900 border !border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl">
          
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-500">
            Crear Cuenta
          </h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm py-3 px-4 rounded-lg text-center mb-6 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={procesarRegistro} className="space-y-6">
            
            {/* Fila 1: Nombre y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={inputClass} placeholder="Ej: Juan" required disabled={cargando} />
              </div>
              <div>
                <label className={labelClass}>Apellidos</label>
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} className={inputClass} placeholder="Ej: Pérez" required disabled={cargando} />
              </div>
            </div>

            {/* Fila 2: Username y Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nombre de Usuario</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className={inputClass} placeholder="juanito123" required disabled={cargando} />
              </div>
              <div>
                <label className={labelClass}>Correo Electrónico</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="tu@correo.com" required disabled={cargando} />
              </div>
            </div>

            {/* Fila 3: Contraseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Contraseña</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••••" required minLength="6" disabled={cargando} />
              </div>
              <div>
                <label className={labelClass}>Confirmar Contraseña</label>
                <input type="password" name="confirmarPassword" value={formData.confirmarPassword} onChange={handleChange} className={inputClass} placeholder="••••••••" required minLength="6" disabled={cargando} />
              </div>
            </div>

            {/* Botón Registrarme */}
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 !rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              disabled={cargando}
            >
              {cargando ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                <>
                  Registrarme
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer del card */}
          <div className="text-center mt-8 pt-6 border-t border-gray-800">
            <p className="text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-400 font-bold transition-colors">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Registro;