import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../components/interfaz/AnimatedPage';
import { CarritoContext } from '../context/CarritoContext';

function Checkout() {
  const navigate = useNavigate();
  const { items, total } = useContext(CarritoContext);
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // 1. Agregamos 'metodoEnvio' predefinido en el estado
  const [formData, setFormData] = useState({
    nombre: '', apellidos: '', email: '', telefono: '',
    direccion: '', region: '', comuna: '', codigoPostal: '',
    metodoEnvio: 'BlueExpress standard' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const procesarOrden = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setCargando(true);
    setError(null);

    // USANDO EL ENV: Definimos la URL base
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const ordenData = {
      cliente: formData,
      total: total,
      productos: items.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        nombre: item.nombre,
        precio: item.precio
      }))
    };

    try {
      // Petición usando la URL dinámica del .env
      const res = await axios.post(`${API_BASE_URL}/api/ordenes/`, ordenData);
      
      const urlPago = res.data.init_point || res.data.sandbox_init_point;
      const idRecibido = res.data.id || res.data.preference_id;
      
      if (urlPago) {
        window.location.href = urlPago;
      } else if (idRecibido) {
        window.location.href = `https://www.mercadopago.cl/checkout/v1/redirect?pref_id=${idRecibido}`;
      } else {
        setError("El servidor no devolvió los datos de pago válidos.");
        setCargando(false);
      }
    } catch (err) {
      console.error("Error API:", err);
      setError("No se pudo conectar con el servidor. Revisa tu conexión o el estado del backend.");
      setCargando(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="max-w-6xl mx-auto px-4 py-12 text-white">
        <header className="mb-12">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white mb-2 flex items-center gap-2 text-sm transition-colors">
              <i className="fa-solid fa-chevron-left"></i> Regresar al carrito
            </button>
            <h1 className="text-4xl font-bold tracking-tight">Finalizar Compra</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* FORMULARIO */}
          <div className="lg:col-span-7">
            <form onSubmit={procesarOrden} id="checkout-form" className="space-y-10">
              
              <section className="space-y-6">
                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">1. Datos Personales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required disabled={cargando} className="w-full bg-gray-900 border !border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="text" name="apellidos" placeholder="Apellidos" onChange={handleChange} required disabled={cargando} className="w-full bg-gray-900 border !border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="email" name="email" placeholder="Correo Electrónico" onChange={handleChange} required disabled={cargando} className="w-full md:col-span-2 bg-gray-900 border !border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none disabled:opacity-50" />
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">2. Despacho</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="direccion" placeholder="Dirección completa" onChange={handleChange} required disabled={cargando} className="w-full md:col-span-2 bg-gray-900 border !border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none disabled:opacity-50" />
                  
                  <input type="text" name="region" placeholder="Región" onChange={handleChange} required disabled={cargando} className="w-full bg-gray-900 border !border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="text" name="comuna" placeholder="Comuna" onChange={handleChange} required disabled={cargando} className="w-full bg-gray-900 border !border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none disabled:opacity-50" />
                  
                  <input type="text" name="codigoPostal" placeholder="Código Postal (Opcional)" onChange={handleChange} disabled={cargando} className="w-full bg-gray-900 border !border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none disabled:opacity-50" />
                  <input type="tel" name="telefono" placeholder="Teléfono de contacto" onChange={handleChange} required disabled={cargando} className="w-full bg-gray-900 border !border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none disabled:opacity-50" />
                </div>
              </section>

              {/* 3. MÉTODO DE ENVÍO */}
              <section className="space-y-6">
                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">3. Método de Envío</h3>
                <div className="grid grid-cols-1 gap-4">
                  <label className="flex items-center p-4 border w-full rounded-xl cursor-pointer bg-blue-900/20 border-blue-500 transition-all">
                    <input 
                      type="radio" 
                      name="metodoEnvio" 
                      value="BlueExpress standard" 
                      checked={formData.metodoEnvio === 'BlueExpress standard'}
                      readOnly
                      className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500" 
                    />
                    <div className="ml-4 flex flex-col">
                      <span className="font-semibold text-white">BlueExpress Standard</span>
                      <span className="text-sm text-gray-400">Envío regular a domicilio</span>
                    </div>
                  </label>
                </div>
              </section>

            </form>
          </div>

          {/* RESUMEN Y BOTÓN */}
          <div className="lg:col-span-5">
            <div className="sticky top-40 bg-gray-900/60 border !border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                <h4 className="text-xl font-bold mb-6">Resumen de pedido</h4>
                <div className="space-y-4 mb-8 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">{item.cantidad}x {item.nombre}</span>
                            <span className="font-bold">${(item.precio * item.cantidad).toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-white/10 space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-lg">Total</span>
                        <span className="text-3xl font-black text-blue-500">${total.toLocaleString()}</span>
                    </div>
                    
                    <div className="min-h-[80px] flex flex-col items-center justify-center">
                        <button 
                            type="submit" 
                            form="checkout-form" 
                            disabled={cargando || items.length === 0}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-4 !rounded-full font-black text-lg transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                        >
                            {cargando ? "Redirigiendo a pago..." : "Pagar ahora"}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center mt-4">
                            {error}
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Checkout;