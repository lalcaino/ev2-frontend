import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// IMPORTANTE: Importamos nuestro envoltorio animado
import AnimatedPage from '../components/interfaz/AnimatedPage';

function CatalogoCategoria({ categoria }) {
  // Aquí guardaremos los productos filtrados
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Definimos la URL base usando variables de entorno
    // En local usará 'http://localhost:8000', en AWS usará la IP de tu .env
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    setCargando(true);

    // 2. Le pedimos los datos a la URL dinámica
    axios.get(`${API_BASE_URL}/api/productos/`)
      .then(respuesta => {
        // 3. Filtrado seguro: verificamos que exista la categoría antes de comparar
        const filtrados = respuesta.data.filter(p => 
          p.categoria && categoria && p.categoria.toLowerCase().includes(categoria.toLowerCase())
        );
        setProductos(filtrados);
        setCargando(false);
      })
      .catch(err => {
        // 4. Si hay error de conexión
        console.error("Error al cargar productos:", err);
        setError("No pudimos conectar con el servidor. Verifica tu conexión o el estado del backend.");
        setCargando(false);
      });
  }, [categoria]); // Se actualiza si cambias de categoría

  // Pantallas condicionales mientras se carga la info
  if (cargando) {
    return (
      <AnimatedPage>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AnimatedPage>
    );
  }

  if (error) {
    return (
      <AnimatedPage>
        <div className="container mx-auto mt-24 text-center">
          <h2 className="text-red-500 text-2xl font-semibold">{error}</h2>
          <p className="text-gray-400 mt-4">Intentando conectar a: {import.meta.env.VITE_API_URL || 'localhost'}</p>
        </div>
      </AnimatedPage>
    );
  }

  // Si no hay productos en esta categoría
  if (productos.length === 0) {
    return (
      <AnimatedPage>
        <div className="container mx-auto mt-24 mb-32 min-h-[50vh] flex flex-col items-center justify-center px-4">
          <h2 className="font-bold text-3xl mb-8 text-white">Aún no hay {categoria}s disponibles.</h2>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="container mx-auto my-12 px-4 max-w-7xl">
        <h1 className="font-bold mb-8 text-center text-white uppercase text-3xl">
          <span className="text-blue-500 mr-2">|</span>{categoria}s
        </h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map(producto => (
            <Link 
              to={`/producto/${producto.id}`}
              key={producto.id}
              className="group flex flex-col h-full bg-transparent text-gray-900 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg !no-underline"
            >
              
              {/* Contenedor de la imagen */}
              <div className="w-full h-64 bg-transparent flex items-center justify-center p-4">
                <img 
                  src={producto.imagen_principal || `https://dummyimage.com/400x400/222/aaa&text=${encodeURIComponent(producto.nombre)}`} 
                  alt={producto.nombre} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Cuerpo de la tarjeta */}
              <div className="py-3 flex flex-col flex-1 bg-transparent">
                <h5 className="text-center font-semibold text-white line-clamp-2 leading-tight m-0 min-h-[2.5rem]">
                  {producto.nombre}
                </h5>
                
                <div className="mt-auto text-center pt-2">
                  <p className="text-gray-500 text-lg font-bold m-0">
                    ${Number(producto.precio_clp).toLocaleString('es-CL')} 
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
}

export default CatalogoCategoria;