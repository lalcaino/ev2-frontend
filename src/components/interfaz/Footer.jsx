import { Link } from 'react-router-dom';

function Footer() {
  return (
    // mt-auto empuja el footer hacia abajo, y el borde superior le da el estilo de la tienda
    <footer className="bg-haste border-top border-primary pt-5 pb-4 mt-auto">
      <div className="container text-center text-md-start">
        <div className="row text-center text-md-start">
          
          {/* --- Columna 1: Logo y descripción --- */}
          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 fw-bold text-primary">Haste</h5>
            <p className="text-white-50">
              Tu tienda definitiva para periféricos y tecnología gamer. Equipando tus victorias con la mejor calidad al mejor precio.
            </p>
          </div>

          {/* --- Columna 2: Redirecciones rápidas --- */}
          <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 fw-bold text-white">Secciones</h5>
            <p>
              <Link to="/" className="text-white-50 text-decoration-none hover-blue">Inicio</Link>
            </p>
            <p>
              <Link to="/teclados" className="text-white-50 text-decoration-none hover-blue">Teclados</Link>
            </p>
            <p>
              <Link to="/mouses" className="text-white-50 text-decoration-none hover-blue">Mouses</Link>
            </p>
          </div>

          {/* --- Columna 3: Contacto --- */}
          <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3 text-white-50">
            <h5 className="text-uppercase mb-4 fw-bold text-white">Contacto</h5>
            <p><i className="fa-solid fa-house me-3"></i> Santiago, Region Metropolitana, Chile</p>
            <p><i className="fa-solid fa-envelope me-3"></i> soporte@haste.cl</p>
            <p><i className="fa-solid fa-phone me-3"></i> +56 9 1234 5678</p>
          </div>
        </div>

        <hr className="mb-4 text-secondary" />

        {/* --- Fila inferior: Redes Sociales y Copyright --- */}
        <div className="row align-items-center">
          {/* Copyright */}
          <div className="col-md-7 col-lg-8 mb-3 mb-md-0">
            <p className="text-white-50 m-0">
              © {new Date().getFullYear()} Copyright: 
              <span className="text-primary fw-bold ms-1">Haste</span>
            </p>
          </div>

          {/* Redes Sociales (Iconos de FontAwesome) */}
          <div className="col-md-5 col-lg-4">
            <div className="text-center text-md-end">
              <ul className="list-unstyled list-inline m-0">
                <li className="list-inline-item">
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-floating rounded-circle text-white-50 d-inline-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="fa-brands fa-instagram fs-5"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-floating rounded-circle text-white-50 d-inline-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="fa-brands fa-x-twitter fs-5"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-floating rounded-circle text-white-50 d-inline-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="fa-brands fa-tiktok fs-5"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="https://discord.com" target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-floating rounded-circle text-white-50 d-inline-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="fa-brands fa-discord fs-5"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;