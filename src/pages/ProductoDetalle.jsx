import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CarritoContext } from '../context/CarritoContext';
import useEmblaCarousel from 'embla-carousel-react';
import AnimatedPage from '../components/interfaz/AnimatedPage';

function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  
  const [producto, setProducto ] = useState(null);
  const [cargando, setCargando ] = useState(true);
  const [error, setError ] = useState(null);
  const [cantidad, setCantidad ] = useState(1);
  
  const [indiceImagen, setIndiceImagen ] = useState(0);
  
  const { agregarAlCarrito } = useContext(CarritoContext);
  const [mostrarToast, setMostrarToast ] = useState(false);

  const [emblaRef, emblaApi ] = useEmblaCarousel({ loop: true });

  // DEFINIMOS LA URL DESDE EL ENV
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/productos/${id}/`)
      .then(respuesta => {
        setProducto(respuesta.data);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error al cargar producto:", err);
        setError("No se pudo cargar el detalle del producto.");
        setCargando(false);
      });
  }, [id, API_BASE_URL]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndiceImagen(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(); 
    emblaApi.on('select', onSelect); 
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const irAnterior = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const irSiguiente = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const irAImagen = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const handleAgregarAlCarrito = () => {
    if (!producto || producto.stock === 0) return; 

    agregarAlCarrito(producto, cantidad); 
    setMostrarToast(true);
    setTimeout(() => setMostrarToast(false), 3000);
  };

  const sumarCantidad = () => {
    if (cantidad < producto.stock) setCantidad(prev => prev + 1);
  };
  
  const restarCantidad = () => {
    if (cantidad > 1) setCantidad(prev => prev - 1);
  };

  if (cargando) {
    return (
      <AnimatedPage>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-center mt-12 text-blue-600 text-2xl font-bold animate-pulse">Cargando detalles...</h2>
        </div>
      </AnimatedPage>
    );
  }

  if (error || !producto) {
    return (
      <AnimatedPage>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-center mt-12 text-red-500 text-2xl font-bold">{error || "Producto no encontrado"}</h2>
          <button onClick={() => navigate('/')} className="mt-4 text-blue-500 underline">Volver al inicio</button>
        </div>
      </AnimatedPage>
    );
  }

  // --- LÓGICA DE GALERÍA CORREGIDA PARA USAR API_BASE_URL ---
  const galeria = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes.map(img => img.imagen.startsWith('/') ? `${API_BASE_URL}${img.imagen}` : img.imagen)
    : [producto.imagen_principal || `https://dummyimage.com/600x600/222/aaa&text=Sin+Imagen`];

  const cantidadMostrada = producto.stock === 0 ? 0 : cantidad;
  
  // --- LÓGICA DE ESPECIFICACIONES ---
  let specsRaw = producto?.especificaciones;
  if (typeof specsRaw === 'string') {
    try {
      specsRaw = JSON.parse(specsRaw);
    } catch (e) {
      specsRaw = null;
    }
  }
  const specs = specsRaw?.specifications || specsRaw;

  return (
    <AnimatedPage>
      <div className="max-w-7xl mx-auto my-12 px-4 relative bg-transparent">
        
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center bg-gray-800 hover:bg-gray-900 text-white mb-6 px-6 py-2.5 !rounded-full font-bold transition-all cursor-pointer border-none shadow-lg"
        >
          <i className="fa-solid fa-arrow-left me-2"></i> Volver al Catálogo
        </button>
          
        <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* GALERÍA */}
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden bg-gray-900/20 text-center relative rounded-xl border  !border-white/5 shadow-2xl">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex items-center">
                  {galeria.map((imgUrl, index) => (
                    <div key={index} className="min-w-full flex-shrink-0">
                      <img 
                        src={imgUrl} 
                        alt={`${producto.nombre} - ${index}`} 
                        className="w-full h-[400px] sm:h-[500px] object-contain p-6" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {galeria.length > 1 && (
                <>
                  <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all z-10" onClick={irAnterior}>
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all z-10" onClick={irSiguiente}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </>
              )}
            </div>

            {/* MINIATURAS */}
            {galeria.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {galeria.map((imgUrl, index) => (
                  <img 
                    key={index} 
                    src={imgUrl} 
                    alt="Miniatura" 
                    onClick={() => irAImagen(index)} 
                    className={`rounded-lg w-20 h-20 object-cover cursor-pointer transition-all flex-shrink-0 border-2
                      ${indiceImagen === index ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* INFORMACIÓN */}
          <div className="flex flex-col">
            {producto.destacado && (
              <span className="self-start mb-3 px-4 py-1 !bg-white/1 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                Destacado
              </span>
            )}
            <h1 className="font-bold text-3xl sm:text-5xl text-white mb-4 leading-tight">
              {producto.nombre}
            </h1>
            
            <p className="text-3xl font-bold text-blue-400 mb-6">
              ${producto.precio_clp?.toLocaleString('es-CL')}
            </p>
            
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {producto.descripcion || "Este periférico de alto rendimiento está diseñado para llevar tu experiencia competitiva al siguiente nivel."}
            </p>

            <div className="mb-8 p-6 rounded-2xl border  !border-white/5">
              <p className="mb-4 text-gray-300 flex items-center gap-2">
                Estado: 
                <span className={`font-bold ${producto.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {producto.stock > 0 ? `Disponible (${producto.stock} unidades)` : 'Agotado'}
                </span>
              </p>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center bg-black/30 rounded-full border border-white/[3%] p-1">
                  <button 
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-30" 
                    onClick={restarCantidad} 
                    disabled={cantidad <= 1 || producto.stock === 0}
                  >-</button>
                  <span className="px-4 font-bold text-lg min-w-[40px] text-center">{cantidadMostrada}</span>
                  <button 
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-30" 
                    onClick={sumarCantidad} 
                    disabled={cantidad >= producto.stock || producto.stock === 0}
                  >+</button>
                </div>

                <button 
                  className={`flex-grow sm:flex-grow-0 px-12 py-3.5 !rounded-full font-bold text-lg transition-all shadow-lg 
                    ${producto.stock === 0 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'}`} 
                  onClick={handleAgregarAlCarrito}
                  disabled={producto.stock === 0}
                >
                  <i className={`fa-solid ${producto.stock === 0 ? 'fa-ban' : 'fa-cart-plus'} me-2`}></i>
                  {producto.stock === 0 ? 'Sin Stock' : 'Añadir al Carrito'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ESPECIFICACIONES TÉCNICAS */}
        {specs && (
          <div className="mt-16 border  !border-white/5 rounded-3xl p-8 backdrop-blur-md">
            <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/[3%] pb-4">
              Especificaciones Técnicas
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
              {Object.entries(specs).map(([key, value]) => {
                // Lógica para no mostrar objetos complejos directamente o manejarlos
                if (typeof value === 'object' && value !== null) return null;
                return (
                  <div key={key} className="flex flex-col pb-2">
                    <span className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">{key}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                );
              })}
              {/* Bloque especial para rendimiento si existe como objeto */}
              {specs.performance && (
                <div className="flex flex-col pb-2">
                  <span className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Rendimiento</span>
                  <span className="text-white font-medium">{specs.performance.maxDpi} DPI / {specs.performance.maxIps} IPS</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOAST */}
        <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${mostrarToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="bg-green-600 text-white px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl border  !border-white/5">
            <i className="fa-solid fa-check-circle text-2xl"></i>
            <div>
              <p className="font-bold">¡Excelente!</p>
              <p className="text-sm opacity-90">Producto añadido correctamente.</p>
            </div>
          </div>
        </div>

      </div>
    </AnimatedPage>
  );
}

export default ProductoDetalle;
