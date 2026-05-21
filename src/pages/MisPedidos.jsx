import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../components/interfaz/AnimatedPage'; 

function MisPedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  useEffect(() => {
    // 1. Verificación de seguridad inicial
    if (!usuario || !usuario.id) {
      navigate('/login');
      return;
    }

    // 2. Definimos la URL base desde el ENV
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchPedidos = async () => {
      try {
        // Usamos la URL dinámica y el ID del usuario
        const respuesta = await axios.get(`${API_BASE_URL}/api/ordenes/usuario/${usuario.id}/`);
        setPedidos(respuesta.data);
        setCargando(false);
      } catch (err) {
        console.error("Error al cargar pedidos:", err);
        setError("No pudimos cargar tu historial de pedidos. Verifica la conexión con el servidor.");
        setCargando(false);
      }
    };

    fetchPedidos();
    // Dependencias limpias: solo id y navigate
  }, [usuario?.id, navigate]);

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "Fecha no disponible";
    const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  };

  const getColorEstado = (estado) => {
    switch(estado?.toUpperCase()) {
      case 'PAGADA': 
        return 'text-success border-success bg-success bg-opacity-10';
      case 'PENDIENTE': 
        return 'text-warning border-warning bg-warning bg-opacity-10';
      case 'CANCELADA': 
        return 'text-danger border-danger bg-danger bg-opacity-10';
      default: 
        return 'text-secondary border-secondary bg-secondary bg-opacity-10';
    }
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-12 text-white" style={{ minHeight: '70vh', maxWidth: '900px' }}>
        
        {/* Header */}
        <div className="mb-4 border-bottom border-secondary pb-4 mt-5">
          <Link to="/" className="text-decoration-none text-white-50 mb-3 d-inline-block transition-all hover:text-white">
            <i className="fa-solid fa-chevron-left me-2"></i> Volver a la tienda
          </Link>
          <h1 className="fw-bold d-flex align-items-center gap-3 mb-0">
            <i className="fa-solid fa-box-open text-primary"></i> Mis Pedidos
          </h1>
          <p className="text-white-50 mt-2">Revisa el historial y estado de tus compras, <span className="text-white fw-bold">{usuario?.username || 'Usuario'}</span>.</p>
        </div>

        {cargando && (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 text-white-50">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="fs-5">Buscando tus pedidos...</p>
          </div>
        )}

        {error && !cargando && (
          <div className="alert alert-danger border border-danger bg-transparent text-danger text-center shadow-lg" role="alert">
            <i className="fa-solid fa-circle-exclamation fs-1 mb-3"></i>
            <h5 className="fw-bold">Error de sincronización</h5>
            <p className="mb-0">{error}</p>
          </div>
        )}

        {!cargando && !error && pedidos.length === 0 && (
          <div className="text-center py-5 bg-dark rounded-4 border border-white/10 shadow-sm mt-4">
            <i className="fa-solid fa-cart-arrow-down text-white-50 mb-4" style={{ fontSize: '4rem' }}></i>
            <h3 className="fw-bold">Aún no tienes pedidos</h3>
            <p className="text-white-50 mb-4">Parece que todavía no has realizado ninguna compra en HasteStore.</p>
            <Link to="/" className="btn btn-primary px-4 py-2 rounded-pill fw-bold">
              Explorar Productos
            </Link>
          </div>
        )}

        {/* Lista de Pedidos */}
        {!cargando && !error && pedidos.length > 0 && (
          <div className="d-flex flex-column gap-4 mt-4">
            {pedidos.map((pedido) => (
              <Link 
                to={`/mis-pedidos/${pedido.id}`} 
                key={pedido.id} 
                className="text-decoration-none d-block" 
              >
                <div 
                  className="card border-secondary text-white shadow-sm overflow-hidden" 
                  style={{ 
                    backgroundColor: '#1e1e1e',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#0d6efd'; 
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; 
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  
                  {/* Cabecera del pedido */}
                  <div className="card-header border-white/10 d-flex flex-column flex-md-row justify-content-between align-items-md-center py-3" style={{ backgroundColor: '#151515' }}>
                    <div>
                      <span className="text-white-50 small d-block">Pedido #{pedido.id}</span>
                      <span className="fw-bold text-white">{formatearFecha(pedido.fecha_creacion)}</span>
                    </div>
                    <div className="mt-2 mt-md-0 d-flex align-items-center gap-3">
                      <span className={`badge border px-3 py-2 rounded-pill ${getColorEstado(pedido.estado)}`}>
                        {pedido.estado}
                      </span>
                      <i className="fa-solid fa-chevron-right text-white-50 d-none d-md-block"></i>
                    </div>
                  </div>

                  {/* Cuerpo del pedido (Productos) */}
                  <div className="card-body p-0">
                    <ul className="list-group list-group-flush">
                      {pedido.items?.slice(0, 2).map((item, index) => (
                        <li key={index} className="list-group-item bg-transparent text-white border-white/10 d-flex align-items-center p-3 gap-3">
                          <div className="bg-dark rounded p-1 d-flex align-items-center justify-content-center border border-white/10" style={{ width: '60px', height: '60px' }}>
                            <img 
                              src={item.producto?.imagen || 'https://dummyimage.com/60x60/444/fff&text=Item'} 
                              alt={item.producto?.nombre} 
                              className="w-100 h-100 object-fit-contain rounded"
                            />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-0 fw-bold">{item.producto?.nombre || 'Producto no disponible'}</h6>
                            <small className="text-white-50">
                              {item.cantidad} x ${Number(item.precio_unitario).toLocaleString('es-CL')}
                            </small>
                          </div>
                        </li>
                      ))}
                      {pedido.items?.length > 2 && (
                        <li className="list-group-item bg-transparent text-white-50 border-white/10 text-center py-2 small italic">
                          + {pedido.items.length - 2} producto(s) adicional(es)
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Pie del pedido */}
                  <div className="card-footer border-white/10 py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#151515' }}>
                    <span className="text-white-50">Total de la compra:</span>
                    <span className="fs-5 fw-bold text-primary">${Number(pedido.total_clp).toLocaleString('es-CL')}</span>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </AnimatedPage>
  );
}

export default MisPedidos;