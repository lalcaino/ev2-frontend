import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// 1. Importamos el hook de Embla
import useEmblaCarousel from 'embla-carousel-react';
import '../App.css';

// IMPORTANTE: Importamos nuestro envoltorio animado
import AnimatedPage from '../components/interfaz/AnimatedPage';

function Inicio() {
  const [ultimosProductos, setUltimosProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // 2. Inicializamos Embla. Le ponemos { loop: true } para que sea infinito.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    // DEFINIMOS LA URL DESDE EL ENV
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    axios.get(`${API_BASE_URL}/api/productos/`)
      .then(respuesta => {
        // Ordenamos por ID descendente para mostrar lo más nuevo
        const productosOrdenados = respuesta.data.sort((a, b) => b.id - a.id);
        const top3 = productosOrdenados.slice(0, 3);
        setUltimosProductos(top3);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error al cargar los últimos productos:", error);
        setCargando(false);
      });
  }, []);

  // 3. Funciones de navegación nativas de Embla
  const irAnterior = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const irSiguiente = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <AnimatedPage>
      <div className="bg-transparent pb-5">
        
        {/* --- INICIO DEL CARRUSEL EMBLA --- */}
        {!cargando && ultimosProductos.length > 0 && (
          <div className="container mt-5 pt-4 mb-5">
            <div className="row justify-content-center">
              <div className="col-12 col-md-10 col-lg-8 position-relative">
                
                {/* 4. Estructura Embla: Viewport (ref) -> Container (flex) -> Slide */}
                <div className="embla overflow-hidden shadow-lg rounded-4" ref={emblaRef}>
                  <div className="embla__container d-flex">
                    
                    {ultimosProductos.map((producto) => (
                      <div key={producto.id} className="embla__slide position-relative" style={{ flex: '0 0 100%' }}>
                        <Link to={`/producto/${producto.id}`} className="d-block position-relative no-underline">
                          
                          {producto.imagen_principal ? (
                            <img 
                              src={producto.imagen_principal} 
                              className="d-block w-100 carousel-imagen-mediana object-fit-cover" 
                              style={{ height: '400px' }} // Altura fija sugerida para carrusel
                              alt={producto.nombre} 
                            />
                          ) : (
                            <img 
                              src={`https://dummyimage.com/1200x600/222/aaa&text=${encodeURIComponent(producto.nombre)}`} 
                              className="d-block w-100 carousel-imagen-mediana" 
                              alt="Sin imagen" 
                            />
                          )}
                          
                          <div className="carousel-overlay"></div>
                          <div className="carousel-caption-custom position-absolute bottom-0 start-50 translate-middle-x mb-4 z-3 text-center w-100">
                            <h3 className="fw-medium m-0 tracking-wide text-white fs-4">{producto.nombre}</h3>
                          </div>

                        </Link>
                      </div>
                    ))}

                  </div>
                </div>

                {/* 5. Flechas: Navegación manual */}
                <button 
                  className="carousel-control-prev" 
                  type="button" 
                  onClick={irAnterior}
                  style={{ zIndex: 10, background: 'transparent', border: 'none' }}
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Anterior</span>
                </button>
                
                <button 
                  className="carousel-control-next" 
                  type="button" 
                  onClick={irSiguiente}
                  style={{ zIndex: 10, background: 'transparent', border: 'none' }}
                >
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Siguiente</span>
                </button>

              </div>
            </div>
          </div>
        )}

        {/* --- CONTENIDO DE BIENVENIDA --- */}
        <div className="container text-center mt-4 pt-4 pb-5">
          <h1 className="fw-bold display-4 mb-4 text-white">
            Bienvenido a <span className="text-primary">Papulandia</span>
          </h1>
          <p className="text-white-50 fs-4 mb-5">
            Los mejores periféricos para e-sports.
          </p>
        </div>

      </div>
    </AnimatedPage>
  )
}

export default Inicio;