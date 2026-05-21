import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function GestorImagenes({ productoId }) {
  const [imagenes, setImagenes] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return { 'Authorization': `Bearer ${token}` };
  };

  useEffect(() => {
    if (productoId) obtenerImagenes();
  }, [productoId]);

  const obtenerImagenes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/imagenes-producto/?producto=${productoId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setImagenes(data);
      }
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  };

  const manejarSubida = async (e) => {
    e.preventDefault();
    if (!archivoSeleccionado) return;
    setCargando(true);
    
    const formData = new FormData();
    formData.append('producto', productoId);
    formData.append('imagen', archivoSeleccionado);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/imagenes-producto/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      if (res.ok) {
        setArchivoSeleccionado(null);
        document.getElementById('file-input-gestor').value = ''; 
        obtenerImagenes();
      }
    } catch (error) { console.error(error); }
    setCargando(false);
  };

  const borrarImagen = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) return;
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/imagenes-producto/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) obtenerImagenes();
    } catch (error) { console.error(error); }
    setCargando(false);
  };

  const marcarComoPrincipal = async (id) => {
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/imagenes-producto/${id}/marcar_principal/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) obtenerImagenes();
    } catch (error) { console.error(error); }
    setCargando(false);
  };

  return (
    <div style={{ width: '100%' }}>
      <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--db-text)', marginBottom: 16 }}>
        Galería de Imágenes Adicionales
      </h4>

      {/* Formulario de subida */}
      <form onSubmit={manejarSubida} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <input 
          id="file-input-gestor"
          type="file" 
          accept="image/*"
          onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
          style={{ flex: 1, fontSize: 13, color: 'var(--db-muted)', background: 'var(--db-bg)', border: '0.5px solid var(--db-border)', padding: '6px 10px', borderRadius: 8 }}
        />
        <button 
          type="submit" 
          disabled={!archivoSeleccionado || cargando}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: (!archivoSeleccionado || cargando) ? 'not-allowed' : 'pointer',
            background: (!archivoSeleccionado || cargando) ? 'var(--db-surface)' : '#378ADD',
            color: (!archivoSeleccionado || cargando) ? 'var(--db-muted)' : '#fff',
            border: '0.5px solid var(--db-border)'
          }}
        >
          {cargando ? 'Cargando...' : 'Subir Imagen'}
        </button>
      </form>

      {/* Cuadrícula de imágenes con botones SIEMPRE VISIBLES */}
      {imagenes.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {imagenes.map((img) => (
            <div key={img.id} style={{ border: '0.5px solid var(--db-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--db-surface)', display: 'flex', flexDirection: 'column' }}>
              
              {/* Contenedor de la foto */}
              <div style={{ position: 'relative', height: 140, background: '#0a0a0a' }}>
                <img src={img.imagen} alt="Producto" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                
                {/* Etiqueta de Principal */}
                {img.es_principal && (
                  <span style={{ position: 'absolute', top: 8, left: 8, background: '#FACC15', color: '#000', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    PRINCIPAL
                  </span>
                )}
              </div>

              {/* Barra de acciones inferior */}
              <div style={{ display: 'flex', gap: 6, padding: 8, borderTop: '0.5px solid var(--db-border)' }}>
                {!img.es_principal && (
                  <button 
                    type="button"
                    onClick={() => marcarComoPrincipal(img.id)}
                    disabled={cargando}
                    style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 500, background: '#378ADD', color: '#fff', border: 'none', borderRadius: 4, cursor: cargando ? 'wait' : 'pointer' }}
                  >
                    Hacer Principal
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => borrarImagen(img.id)}
                  disabled={cargando}
                  style={{ flex: img.es_principal ? 1 : 0, padding: '6px 10px', fontSize: 11, fontWeight: 500, background: 'var(--db-danger-bg)', color: 'var(--db-danger)', border: 'none', borderRadius: 4, cursor: cargando ? 'wait' : 'pointer' }}
                >
                  Eliminar
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 0', border: '1px dashed var(--db-border)', borderRadius: 8, color: 'var(--db-muted)' }}>
          <p style={{ fontSize: 13 }}>No hay imágenes adicionales. Sube la primera imagen para este producto.</p>
        </div>
      )}
    </div>
  );
}