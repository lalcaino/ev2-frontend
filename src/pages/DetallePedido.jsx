import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../components/interfaz/AnimatedPage'; 

function DetallePedido() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  useEffect(() => {
    // 1. Verificación de seguridad
    if (!usuario) {
      navigate('/login');
      return;
    }

    // 2. Definimos la URL base desde el ENV
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchDetallePedido = async () => {
      try {
        // Usamos la URL dinámica del .env
        const respuesta = await axios.get(`${API_BASE_URL}/api/ordenes/${id}/`); 
        setPedido(respuesta.data);
        setCargando(false);
      } catch (err) {
        console.error("Error al cargar detalle del pedido:", err);
        setError("No pudimos cargar los detalles de este pedido. ¿El servidor está activo?");
        setCargando(false);
      }
    };

    fetchDetallePedido();
  }, [id, navigate]); // Eliminamos usuario?.id de dependencias para evitar bucles si no cambia

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "Fecha no disponible";
    const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  };

  const getColorEstadoTW = (estado) => {
    switch(estado?.toUpperCase()) {
      case 'PAGADA': 
        return 'text-green-400 border-green-400 bg-green-400/10';
      case 'PENDIENTE': 
        return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'CANCELADA': 
        return 'text-red-400 border-red-400 bg-red-400/10';
      default: 
        return 'text-gray-400 border-gray-400 bg-gray-400/10';
    }
  };

  if (cargando) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-gray-400">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
       <p className="text-lg">Cargando detalles...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-xl text-center max-w-md w-full shadow-2xl">
        <i className="fa-solid fa-circle-exclamation text-4xl mb-4"></i>
        <h5 className="font-bold text-xl mb-2">Error de Conexión</h5>
        <p className="text-sm opacity-80 mb-4">{error}</p>
        <Link to="/mis-pedidos" className="mt-4 inline-block bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors no-underline font-bold">
          Volver a mis pedidos
        </Link>
      </div>
    </div>
  );

  if (!pedido) return null;

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[70vh]">
        
        {/* Navegación y Título */}
        <div className="mb-8 border-b border-gray-800 pb-6 mt-5">
          <Link to="/mis-pedidos" className="text-gray-400 hover:text-white transition-colors mb-4 inline-flex items-center gap-2 no-underline">
            <i className="fa-solid fa-arrow-left"></i> Volver a mis pedidos
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <h1 className="text-3xl font-bold text-white m-0">
              Detalle del Pedido <span className="text-blue-500">#{pedido.id}</span>
            </h1>
            <span className={`px-4 py-1.5 rounded-full border font-semibold text-sm w-max ${getColorEstadoTW(pedido.estado)}`}>
              {pedido.estado}
            </span>
          </div>
          <p className="text-gray-400 mt-2">Realizado el {formatearFecha(pedido.fecha_creacion)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Lista de Productos */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1e1e1e] rounded-xl border !border-white/10 overflow-hidden shadow-lg">
              <div className="bg-[#151515] px-6 py-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white m-0 flex items-center gap-2">
                  <i className="fa-solid fa-box-open text-blue-500"></i> Productos ({pedido.items?.length || 0})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-800">
                {pedido.items?.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-center p-6 gap-6 hover:bg-white/5 transition-colors">
                    
                    <div className="bg-gray-800 rounded-lg p-2 w-24 h-24 flex-shrink-0 flex items-center justify-center">
                      <img 
                        src={item.producto?.imagen || 'https://dummyimage.com/100x100/444/fff&text=Item'} 
                        alt={item.producto?.nombre} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between h-full w-full sm:w-auto text-center sm:text-left">
                      <div>
                        <h3 className="text-white font-bold text-lg m-0">{item.producto?.nombre || 'Producto no disponible'}</h3>
                        <p className="text-gray-400 text-sm mt-1">Precio un.: ${Number(item.precio_unitario).toLocaleString('es-CL')}</p>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                        <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded text-sm font-semibold">
                          Cant: {item.cantidad}
                        </span>
                      </div>
                    </div>

                    <div className="text-center sm:text-right flex-shrink-0 mt-4 sm:mt-0 w-full sm:w-auto border-t border-gray-800 sm:border-0 pt-4 sm:pt-0">
                      <p className="text-gray-400 text-sm mb-1 hidden sm:block">Subtotal</p>
                      <p className="text-white font-bold text-lg">
                        ${Number(item.cantidad * item.precio_unitario).toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen de Compra y Datos de Envío */}
          <div className="space-y-6">
            
            <div className="bg-[#1e1e1e] rounded-xl border !border-white/10 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-3">Resumen de Compra</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({pedido.items?.reduce((acc, item) => acc + item.cantidad, 0) || 0} items)</span>
                  <span>${Number(pedido.total_clp).toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Envío</span>
                  <span className="text-green-400">Por coordinar</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t border-gray-800 pt-4">
                <span className="text-white font-bold">Total pagado</span>
                <span className="text-2xl font-bold text-blue-500">
                  ${Number(pedido.total_clp).toLocaleString('es-CL')}
                </span>
              </div>
            </div>

            {/* Tarjeta de Datos de Envío y Cliente */}
            <div className="bg-[#1e1e1e] rounded-xl border !border-white/10 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-3 flex items-center gap-2">
                <i className="fa-solid fa-address-card text-blue-500"></i> Datos del Cliente
              </h3>
              
              <div className="space-y-3 text-sm text-gray-300">
                <p><strong className="text-gray-400">Nombre:</strong> <span>{pedido.nombres || "(No proporcionado)"}</span></p>
                <p><strong className="text-gray-400">Email:</strong> <span>{pedido.email || "(No proporcionado)"}</span></p>
                <p><strong className="text-gray-400">Teléfono:</strong> <span>{pedido.telefono || "(No proporcionado)"}</span></p>

                <hr className="border-gray-800 my-3" />

                <p><strong className="text-gray-400">Dirección:</strong> <span>{pedido.direccion || "(No proporcionada)"}</span></p>
                <p><strong className="text-gray-400">Comuna:</strong> <span>{pedido.comuna || "(No proporcionada)"}</span></p>
                <p><strong className="text-gray-400">Región:</strong> <span>{pedido.region || "(No proporcionada)"}</span></p>

                <hr className="border-gray-800 my-3" />

                <p><strong className="text-gray-400">Medio de Pago:</strong> <span className="capitalize">{pedido.medio_pago || "Mercado Pago"}</span></p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AnimatedPage>
  );
}

export default DetallePedido;