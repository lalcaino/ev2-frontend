import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Componentes estáticos
import Navbar from './components/interfaz/Navbar';
import Footer from './components/interfaz/Footer';

// Páginas
import Inicio from './pages/Inicio';
import ProductoDetalle from './pages/ProductoDetalle';
import Carrito from './pages/Carrito';
import CatalogoCategoria from './pages/CatalogoCategoria';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Registro from './pages/Registro';
import DetallePedido from './pages/DetallePedido';
import MisPedidos from './pages/MisPedidos'; 
import Dashboard from './pages/Dashboard_1';

// Contextos
import { CarritoProvider } from './context/CarritoContext';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Inicio />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/mouses" element={<CatalogoCategoria categoria="Mouse" />} />
        <Route path="/teclados" element={<CatalogoCategoria categoria="Teclado" />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/mis-pedidos/:id" element={<DetallePedido />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const location = useLocation();
  const esDashboard = location.pathname.startsWith('/dashboard');

  return (
    <CarritoProvider>
      <div className="flex flex-col min-h-screen bg-transparent">
        {!esDashboard && <Navbar />}
        <main className="flex-grow flex flex-col relative">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Dashboard — sin Navbar ni Footer */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Resto de páginas — con Navbar y Footer */}
              <Route path="/*" element={<AnimatedRoutes />} />
            </Routes>
          </AnimatePresence>
        </main>
        {!esDashboard && <Footer />}
      </div>
    </CarritoProvider>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
