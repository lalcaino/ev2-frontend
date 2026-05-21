import { useContext, useState, useEffect } from 'react';
// 1. Cambiamos Link por useNavigate
import { useNavigate } from 'react-router-dom'; 
import { CarritoContext } from '../context/CarritoContext';
import AnimatedPage from '../components/interfaz/AnimatedPage';

function Carrito() {
  const { items, cambiarCantidad, eliminarItem, total } = useContext(CarritoContext);
  const [cargando, setCargando] = useState(true);
  
  // 2. Inicializamos el hook de navegación
  const navigate = useNavigate(); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setCargando(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  if (cargando) {
    return (
      <AnimatedPage>
        <div className="flex flex-col items-center justify-center min-h-[60vh]"></div>
      </AnimatedPage>
    );
  }

  if (items.length === 0) {
    return (
      <AnimatedPage>
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center text-white">
          <i className="fa-solid fa-cart-shopping fa-5x mb-4"></i>
          <h2 className="fw-bold">Tu carrito está vacío</h2>
          <p className="opacity-50">No has añadido productos todavía.</p>
          {/* 3. También aplicamos navigate(-1) aquí para el estado vacío si prefieres */}
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-light rounded-pill mt-3 px-4 py-2"
          >
            Volver atrás
          </button>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="container-fluid min-vh-100 text-white py-5 bg-transparent">
        <div className="container">
          <h1 className="fw-bold mb-5 text-center text-md-start">
            <i className="fa-solid fa-cart-shopping me-3 text-primary"></i>Tu Carrito
          </h1>
          
          <div className="row g-4">
            <div className="col-lg-8">
              {items.map((item) => (
                <div key={item.id} className="card mb-3 bg-transparent border !border-white/10 shadow-sm overflow-hidden text-white rounded-4" >
                  {/* ... resto del contenido del item (sin cambios) ... */}
                  <div className="row g-0 align-items-center">
                    <div className="col-4 col-md-3 d-flex align-items-center justify-content-center" style={{ minHeight: '120px' }}>
                      <img src={item.imagen} className="img-fluid p-2" alt={item.nombre} style={{ maxHeight: '110px', objectFit: 'contain' }} />
                    </div>
                    <div className="col-8 col-md-4">
                      <div className="card-body">
                        <h5 className="card-title fw-bold mb-1">{item.nombre}</h5>
                        <p className="text-primary fw-bold fs-5 mb-0">${item.precio.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="col-7 col-md-3">
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <button className="btn btn-sm btn-outline-primary !border-white/10 text-white fw-bold" onClick={() => cambiarCantidad(item.id, -1)}>-</button>
                        <span className="fw-bold fs-5">{item.cantidad}</span>
                        <button className="btn btn-sm btn-outline-primary !border-white/10 text-white fw-bold" onClick={() => cambiarCantidad(item.id, 1)}>+</button>
                      </div>
                    </div>
                    <div className="col-5 col-md-2 text-center text-md-end pe-md-4">
                      <button className="btn btn-link text-danger p-0" onClick={() => eliminarItem(item.id)}>
                        <i className="fa-solid fa-trash-can fa-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-4">
              <div className="card bg-transparent !border-white/10 shadow-lg text-white rounded-4">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-4 border-bottom !border-white/10 pb-3">Resumen de compra</h4>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="opacity-75">Subtotal:</span>
                    <span className="fw-bold">${total.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="opacity-75">Envío:</span>
                    <span className="text-success fw-bold">Gratis</span>
                  </div>
                  <div className="d-flex justify-content-between mb-4 border-top !border-white/10 pt-3">
                    <span className="fs-4 fw-bold">Total:</span>
                    <span className="fs-4 fw-bold text-primary">${total.toLocaleString()}</span>
                  </div>
                  
                  {/* Botón de Pago (Se queda igual) */}
                  <button 
                    onClick={() => navigate('/checkout')} 
                    className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm py-3 mb-3"
                  >
                    Continuar al Pago <i className="fa-solid fa-arrow-right ms-2"></i>
                  </button>

                  {/* 4. CAMBIO AQUÍ: Botón Seguir comprando con navigate(-1) */}
                  <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-outline-secondary text-white w-100 rounded-pill !border-white/10 shadow-sm"
                  >
                    <i className="fa-solid fa-arrow-left me-2"></i> Seguir comprando
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Carrito;