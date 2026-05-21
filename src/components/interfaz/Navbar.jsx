import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { CarritoContext } from '../../context/CarritoContext';

import logoImg from '../../assets/Logo-Pagina-Haste.png';

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const { items } = useContext(CarritoContext);
  const cantidadTotal = items.reduce((total, item) => total + item.cantidad, 0);

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  
  // DEFINIMOS LA URL DESDE EL ENV
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const cerrarSesion = () => {
      localStorage.removeItem('usuario');
      localStorage.removeItem('access_token');   // ← agregar
      localStorage.removeItem('refresh_token');  // ← agregar
      window.location.href = '/';
    };
    return (
    <nav className="navbar bg-haste border-bottom border-primary py-5 sticky-top">
      <div className="container position-relative d-flex align-items-center justify-content-between">
        
        {/* --- 1. COLUMNA IZQUIERDA --- */}
        <div className="d-flex align-items-center d-none d-lg-flex" style={{ gap: '25px' }}>
          <Link className="nav-link text-white-50 hover-blue fw-medium p-0 text-decoration-none" to="/">Inicio</Link>
          <Link className="nav-link text-white-50 hover-blue fw-medium p-0 text-decoration-none" to="/teclados">Teclados</Link>
          <Link className="nav-link text-white-50 hover-blue fw-medium p-0 text-decoration-none" to="/mouses">Mouses</Link>
        </div>

        {/* --- 2. COLUMNA CENTRAL: Logo --- */}
        <Link to="/" className="navbar-brand m-0 p-0 position-absolute start-50 top-50 translate-middle text-decoration-none" style={{ zIndex: 10, top: '15px'}}>
          <img 
            src={logoImg} 
            alt="HasteStore Logo" 
            style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
            className="d-inline-block align-top"
            onError={(e) => e.target.src = 'https://dummyimage.com/150x50/1a1a1a/aaa&text=HasteStore'} 
          />
        </Link>

        {/* --- 3. COLUMNA DERECHA --- */}
        <div className="d-flex align-items-center gap-2">
          
          {/* USAMOS LA URL DINÁMICA PARA EL ADMIN */}
          {usuario && usuario.is_superuser && (
             <a href={`${API_BASE_URL}/admin/`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-warning rounded-pill px-3 d-flex align-items-center gap-2 fw-bold me-2 text-decoration-none">
               <i className="fa-solid fa-gauge-high"></i>
               <span className="d-none d-md-inline">Panel Django</span>
             </a>
          )}

          {/* --- BOTÓN DE CARRITO --- */}
          <Link to="/carrito" className="btn-secondary px-3 position-relative d-flex align-items-center gap-2 text-decoration-none">
            <i className="fa-solid fa-cart-shopping fs-5 text-white-100"></i>
            {cantidadTotal > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
                {cantidadTotal}
              </span>
            )}
          </Link>

          {/* BOTÓN DE USUARIO */}
          {usuario ? (
            <div 
              className="position-relative ms-2" 
              onMouseLeave={() => setMenuAbierto(false)}
            >
              <button 
                className="btn btn-secondary px-3 d-flex align-items-center gap-2 fw-bold text-white-50" 
                type="button" 
                onClick={() => setMenuAbierto(!menuAbierto)}
                style={{ background: 'transparent', border: 'none' }}
              >
                <i className="fa-solid fa-user-circle fs-5 text-primary"></i>
                <span className="d-none d-md-inline text-white">{usuario.username}</span>
              </button>
              
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  paddingTop: '10px',
                  opacity: menuAbierto ? 1 : 0,
                  visibility: menuAbierto ? 'visible' : 'hidden',
                  transform: menuAbierto ? 'translateY(0)' : 'translateY(-10px)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: menuAbierto ? 'auto' : 'none',
                  zIndex: 1050
                }}
              >
                <ul className="dropdown-menu dropdown-menu-dark bg-haste shadow d-block position-relative m-0">
                  <li>
                    <Link 
                      to="/mis-pedidos" 
                      className="dropdown-item text-white fw-bold d-flex align-items-center text-decoration-none"
                      onClick={() => setMenuAbierto(false)}
                    >
                      <i className="fa-solid fa-box-open me-2" style={{ width: '20px' }}></i> Mis Pedidos
                    </Link>
                  </li>
                  
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  
                  <li>
                    <button className="dropdown-item text-danger fw-bold d-flex align-items-center" onClick={cerrarSesion}>
                      <i className="fa-solid fa-right-from-bracket me-2" style={{ width: '20px' }}></i> Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-secondary ms-2 px-3 d-flex align-items-center gap-2 fw-bold shadow-sm text-decoration-none" style={{ background: 'transparent', border: 'none' }}>
              <i className="fa-solid fa-user-circle fs-5 text-white-50"></i>
            </Link>
          )}
          
          <button className="navbar-toggler d-lg-none border-0 ms-2 p-1" type="button" style={{ fontSize: '1.2rem' }}>
            <i className="fa-solid fa-bars text-white-50"></i>
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;