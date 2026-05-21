import { createContext, useState, useEffect } from 'react';

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Cargar del localStorage al inicio
  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    setItems(carritoGuardado);
  }, []);

  // Guardar en localStorage
  const guardarEnStorage = (nuevaLista) => {
    setItems(nuevaLista);
    localStorage.setItem('carrito', JSON.stringify(nuevaLista));
  };

  // --- FUNCIÓN NUEVA: Vaciar el carrito por completo ---
  const vaciarCarrito = () => {
    guardarEnStorage([]); // ¡Esto limpia el estado de React y el localStorage al mismo tiempo!
  };

  const agregarAlCarrito = (producto, cantidadSeleccionada = 1) => {
    const itemExistente = items.find(item => item.id === producto.id);

    if (itemExistente) {
      cambiarCantidad(producto.id, cantidadSeleccionada);
    } else {
      const nuevoItem = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio_clp || producto.precio, 
        imagen: producto.imagen_principal || producto.imagen,
        cantidad: cantidadSeleccionada
      };
      
      const nuevaLista = [...items, nuevoItem];
      guardarEnStorage(nuevaLista);
    }
  };

  const cambiarCantidad = (id, delta) => {
    const nuevaLista = items.map(item => {
      if (item.id === id) {
        const nuevaCant = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: nuevaCant };
      }
      return item;
    });
    guardarEnStorage(nuevaLista);
  };

  const eliminarItem = (id) => {
    const nuevaLista = items.filter(item => item.id !== id);
    guardarEnStorage(nuevaLista);
  };

  const total = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    // ¡Asegúrate de que vaciarCarrito esté aquí abajo!
    <CarritoContext.Provider value={{ items, agregarAlCarrito, cambiarCantidad, eliminarItem, vaciarCarrito, total }}>
      {children}
    </CarritoContext.Provider>
  );
};