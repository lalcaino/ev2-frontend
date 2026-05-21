// =============================================================
// Dashboard.jsx — Panel administrativo Haste (Actualizado)
// =============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import GestorImagenes from '../components/dashboard/GestorImagenes';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
);

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const clp = (n) => '$' + Number(n).toLocaleString('es-CL');
const getToken = () => localStorage.getItem('access_token');
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ── Interceptor: token expirado → limpiar sesión y redirigir al login
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

function KPICard({ label, value, delta, deltaUp }) {
  return (
    <div style={{ background: 'var(--db-surface)', border: '0.5px solid var(--db-border)', borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ fontSize: 12, color: 'var(--db-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--db-text)' }}>{value}</div>
      {delta && (
        <div style={{ fontSize: 11, marginTop: 4, color: deltaUp ? 'var(--db-success)' : 'var(--db-danger)' }}>
          {deltaUp ? '▲' : '▼'} {delta}
        </div>
      )}
    </div>
  );
}

function Badge({ estado }) {
  const map = {
    PAGADA:    { bg: 'var(--db-success-bg)', color: 'var(--db-success)' },
    PENDIENTE: { bg: 'var(--db-warning-bg)', color: 'var(--db-warning)' },
    CANCELADA: { bg: 'var(--db-danger-bg)',  color: 'var(--db-danger)'  },
  };
  const s = map[estado?.toUpperCase()] || map.CANCELADA;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>
      {estado}
    </span>
  );
}

// ---> MODIFICADO: Acepta prop width <---
function Modal({ open, onClose, title, children, width = 420 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--db-surface)', border: '0.5px solid var(--db-border)', borderRadius: 16, padding: 28, width: width, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto', transition: 'width 0.3s ease' }}>
        <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--db-text)', marginBottom: 20 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: 'var(--db-muted)', display: 'block', marginBottom: 4 }}>{label}</label>
      {props.as === 'textarea'
        ? <textarea {...props} as={undefined} style={inputStyle} rows={3} />
        : props.as === 'select'
        ? <select {...props} as={undefined} style={inputStyle}>{props.children}</select>
        : <input {...props} style={inputStyle} />
      }
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 8,
  border: '0.5px solid var(--db-border)', background: 'var(--db-bg)',
  color: 'var(--db-text)', fontSize: 13, outline: 'none',
  fontFamily: 'inherit', resize: 'vertical'
};

const btnBase = {
  padding: '7px 14px', borderRadius: 8, fontSize: 13,
  cursor: 'pointer', border: '0.5px solid var(--db-border)',
  background: 'var(--db-surface)', color: 'var(--db-text)',
  fontFamily: 'inherit', transition: 'all .15s'
};
const btnPrimary = { ...btnBase, background: '#378ADD', color: '#fff', border: 'none' };
const btnDanger  = { ...btnBase, background: 'var(--db-danger-bg)', color: 'var(--db-danger)', border: 'none' };
const btnSmall   = { ...btnBase, padding: '4px 10px', fontSize: 12 };

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(128,128,128,.1)' }, ticks: { color: '#888', font: { size: 11 } } },
    y: { grid: { color: 'rgba(128,128,128,.1)' }, ticks: { color: '#888', font: { size: 11 } } }
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState('resumen');
  const [autorizado, setAutorizado] = useState(false);

  const [productos,  setProductos]  = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pedidos,    setPedidos]    = useState([]);
  const [stats,      setStats]      = useState(null);
  const [usuarios,   setUsuarios]   = useState([]);
  const [cargando,   setCargando]   = useState({});

  const [modalProd, setModalProd] = useState(false);
  const [modalCat,  setModalCat]  = useState(false);
  const [editProd,  setEditProd]  = useState(null);
  const [editCat,   setEditCat]   = useState(null);

  const [formProd, setFormProd] = useState({ nombre:'', categoria:'', precio_clp:'', stock:'', descripcion:'', destacado:false, imagen: null });
  const [formCat,  setFormCat]  = useState({ nombre:'', slug:'' });

  const [searchProd,   setSearchProd]   = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // ── Auth check
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    const token   = localStorage.getItem('access_token');
    if (!usuario && !token) {
      navigate('/login', { replace: true });
    } else {
      setAutorizado(true);
    }
  }, [navigate]);

  useEffect(() => { cargarProductos(); cargarCategorias(); }, []);

  useEffect(() => {
    if (seccion === 'pedidos' || seccion === 'resumen') cargarPedidos();
    if (seccion === 'resumen' || seccion === 'estadisticas') cargarStats();
    if (seccion === 'usuarios') cargarUsuarios();
  }, [seccion]);

  const cargarProductos = async () => {
    try {
      const r = await axios.get(`${API}/api/dashboard/productos/`, { headers: authHeaders() });
      const data = Array.isArray(r.data) ? r.data : (r.data.results || []);
      setProductos(data);
    } catch (e) { console.error(e); }
  };

  const cargarCategorias = async () => {
    try {
      const r = await axios.get(`${API}/api/dashboard/categorias/`, { headers: authHeaders() });
      setCategorias(Array.isArray(r.data) ? r.data : (r.data.results || []));
    } catch (e) { console.error(e); }
  };

  const cargarPedidos = async () => {
    try {
      const r = await axios.get(`${API}/api/dashboard/ordenes/`, { headers: authHeaders() });
      setPedidos(Array.isArray(r.data) ? r.data : (r.data.results || []));
    } catch (e) { console.error(e); }
  };

  const cargarStats = async () => {
    try {
      const r = await axios.get(`${API}/api/dashboard/stats/`, { headers: authHeaders() });
      setStats(r.data);
    } catch (e) { console.error(e); }
  };

  const cargarUsuarios = async () => {
    try {
      const r = await axios.get(`${API}/api/dashboard/usuarios/`, { headers: authHeaders() });
      setUsuarios(Array.isArray(r.data) ? r.data : (r.data.results || []));
    } catch (e) { console.error(e); }
  };

  const abrirCrearProd = () => {
    setEditProd(null);
    setFormProd({ nombre:'', categoria: categorias[0]?.id || '', precio_clp:'', stock:'', descripcion:'', destacado:false, imagen: null });
    setModalProd(true);
  };

  const abrirEditarProd = (p) => {
    setEditProd(p);
    setFormProd({
      nombre:     p.nombre,
      categoria:  p.categoria,
      precio_clp: p.precio_clp,
      stock:      p.stock,
      descripcion: p.descripcion || '',
      destacado:  p.destacado,
      imagen:     null
    });
    setModalProd(true);
  };

  const guardarProducto = async () => {
    setCargando(c => ({ ...c, prod: true }));
    try {
      const formData = new FormData();
      formData.append('nombre', formProd.nombre);
      formData.append('categoria', Number(formProd.categoria));
      formData.append('precio_clp', Number(formProd.precio_clp));
      formData.append('stock', Number(formProd.stock));
      formData.append('descripcion', formProd.descripcion || '');
      formData.append('destacado', formProd.destacado ? 'true' : 'false');
      
      if (formProd.imagen) {
        formData.append('imagen_principal', formProd.imagen); 
      }

      if (editProd) {
        await axios.patch(`${API}/api/dashboard/productos/${editProd.id}/`, formData, { headers: authHeaders() });
      } else {
        await axios.post(`${API}/api/dashboard/productos/`, formData, { headers: authHeaders() });
      }
      setModalProd(false);
      cargarProductos();
    } catch (e) { console.error(e); }
    setCargando(c => ({ ...c, prod: false }));
  };

  const eliminarProducto = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await axios.delete(`${API}/api/dashboard/productos/${id}/`, { headers: authHeaders() });
      cargarProductos();
    } catch (e) { console.error(e); }
  };

  const abrirCrearCat = () => {
    setEditCat(null);
    setFormCat({ nombre:'', slug:'' });
    setModalCat(true);
  };

  const abrirEditarCat = (c) => {
    setEditCat(c);
    setFormCat({ nombre: c.nombre, slug: c.slug });
    setModalCat(true);
  };

  const guardarCategoria = async () => {
    setCargando(c => ({ ...c, cat: true }));
    try {
      if (editCat) {
        await axios.patch(`${API}/api/dashboard/categorias/${editCat.id}/`, formCat, { headers: authHeaders() });
      } else {
        await axios.post(`${API}/api/dashboard/categorias/`, formCat, { headers: authHeaders() });
      }
      setModalCat(false);
      cargarCategorias();
    } catch (e) { console.error(e); }
    setCargando(c => ({ ...c, cat: false }));
  };

  const eliminarCategoria = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await axios.delete(`${API}/api/dashboard/categorias/${id}/`, { headers: authHeaders() });
      cargarCategorias();
    } catch (e) { console.error(e); }
  };

  const prodFiltrados    = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchProd.toLowerCase()) ||
    (p.categoria_nombre || p.categoria || '').toString().toLowerCase().includes(searchProd.toLowerCase())
  );
  const pedidosFiltrados = filtroEstado ? pedidos.filter(p => p.estado?.toUpperCase() === filtroEstado) : pedidos;

  const ventasMes      = stats?.resumen?.ventas_mes      ?? pedidos.filter(p => p.estado?.toUpperCase() === 'PAGADA').reduce((s, p) => s + Number(p.total_clp || 0), 0);
  const sinStock       = stats?.resumen?.sin_stock        ?? productos.filter(p => p.stock === 0).length;
  const stockBajo      = stats?.resumen?.stock_bajo       ?? productos.filter(p => p.stock > 0 && p.stock <= 3).length;
  const totalPedidos   = stats?.resumen?.total_pedidos    ?? pedidos.length;
  const pedidosMes     = stats?.resumen?.pedidos_mes      ?? pedidos.length;
  const totalProductos = stats?.resumen?.total_productos  ?? productos.length;

  const ingresosData = {
    labels: stats?.ingresos_mensuales?.map(m => m.mes) || [],
    datasets: [{
      label: 'Ingresos',
      data: stats?.ingresos_mensuales?.map(m => m.total) || [],
      borderColor: '#378ADD', backgroundColor: 'rgba(55,138,221,.08)',
      fill: true, tension: .35, pointRadius: 4, pointBackgroundColor: '#378ADD'
    }]
  };

  const catsData = {
    labels: stats?.ventas_por_categoria?.map(c => c.categoria) || [],
    datasets: [{
      data: stats?.ventas_por_categoria?.map(c => c.total) || [],
      backgroundColor: ['#378ADD','#1D9E75','#EF9F27','#D4537E','#7F77DD'],
      borderWidth: 0
    }]
  };

  const diarioData = {
    labels: stats?.pedidos_por_dia?.map(d => d.dia) || [],
    datasets: [{
      data: stats?.pedidos_por_dia?.map(d => d.cantidad) || [],
      backgroundColor: '#378ADD', borderRadius: 4
    }]
  };

  const top5Data = {
    labels: stats?.top_productos?.map(p => p.nombre) || [],
    datasets: [{
      data: stats?.top_productos?.map(p => p.cantidad) || [],
      backgroundColor: '#378ADD', borderRadius: 4
    }]
  };

  const anioActual  = new Date().getFullYear();
  const compData = {
    labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    datasets: [
      { label: String(anioActual),     data: stats?.comparativo?.[anioActual]     || [], backgroundColor: '#378ADD', borderRadius: 3 },
      { label: String(anioActual - 1), data: stats?.comparativo?.[anioActual - 1] || [], backgroundColor: '#B4B2A9', borderRadius: 3 },
    ]
  };

  const navItems = [
    { id:'resumen',      label:'Resumen',      group:'General'  },
    { id:'productos',    label:'Productos',    group:'Catálogo' },
    { id:'categorias',   label:'Categorías',   group:'Catálogo' },
    { id:'pedidos',      label:'Pedidos',      group:'Ventas'   },
    { id:'estadisticas', label:'Estadísticas', group:'Ventas'   },
    { id:'usuarios',     label:'Clientes',     group:'Usuarios' },
  ];
  const groups = [...new Set(navItems.map(i => i.group))];

  const cssVars = `
    :root {
      --db-bg:         #0f0f0f;
      --db-surface:    #1a1a1a;
      --db-border:     rgba(255,255,255,.08);
      --db-text:       #f0f0f0;
      --db-muted:      #888;
      --db-blue:       #378ADD;
      --db-success:    #1D9E75;
      --db-success-bg: rgba(29,158,117,.12);
      --db-warning:    #BA7517;
      --db-warning-bg: rgba(186,117,23,.12);
      --db-danger:     #E24B4A;
      --db-danger-bg:  rgba(226,75,74,.12);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', system-ui, sans-serif; background: var(--db-bg); }
    input, select, textarea, button { font-family: inherit; }
    .tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
    .tbl th { text-align: left; font-weight: 500; font-size: 11px; color: var(--db-muted); padding: 10px 12px; border-bottom: 0.5px solid var(--db-border); text-transform: uppercase; letter-spacing: .05em; }
    .tbl td { padding: 12px 12px; border-bottom: 0.5px solid var(--db-border); color: var(--db-text); }
    .tbl tbody tr:last-child td { border-bottom: none; }
    .tbl tbody tr:hover td { background: rgba(255,255,255,.02); }
    .sb-item { display: flex; align-items: center; gap: 9px; padding: 8px 18px; cursor: pointer; font-size: 13px; color: var(--db-muted); border-left: 2px solid transparent; transition: all .15s; }
    .sb-item:hover { background: rgba(255,255,255,.04); color: var(--db-text); }
    .sb-item.active { background: rgba(55,138,221,.1); color: var(--db-blue); border-left: 2px solid var(--db-blue); font-weight: 500; }
    .sb-section { padding: 16px 18px 4px; font-size: 10px; font-weight: 500; color: rgba(255,255,255,.25); letter-spacing: .1em; text-transform: uppercase; }
    .card { background: var(--db-surface); border: 0.5px solid var(--db-border); border-radius: 12px; }
    .page-enter { animation: fadeUp .25s ease; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
    .stock-bar { height: 4px; background: rgba(255,255,255,.08); border-radius: 2px; width: 64px; overflow: hidden; display: inline-block; vertical-align: middle; }
    .stock-fill { height: 100%; border-radius: 2px; }
  `;

  if (!autorizado) return null;

  return (
    <>
      <style>{cssVars + `body { background: var(--db-bg) !important; } #root { background: var(--db-bg) !important; }`}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--db-bg)', position: 'fixed', inset: 0, overflow: 'auto', zIndex: 50 }}>

        {/* SIDEBAR */}
        <aside style={{ width: 210, flexShrink: 0, background: 'var(--db-surface)', borderRight: '0.5px solid var(--db-border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
          <div style={{ padding: '20px 18px', borderBottom: '0.5px solid var(--db-border)' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Haste</div>
            <div style={{ fontSize: 11, color: 'var(--db-muted)', marginTop: 2 }}>Panel administrativo</div>
          </div>

          {groups.map(g => (
            <div key={g}>
              <div className="sb-section">{g}</div>
              {navItems.filter(i => i.group === g).map(item => (
                <div key={item.id} className={`sb-item ${seccion === item.id ? 'active' : ''}`} onClick={() => setSeccion(item.id)}>
                  {item.label}
                </div>
              ))}
            </div>
          ))}

          <div style={{ marginTop: 'auto', padding: '16px 18px', borderTop: '0.5px solid var(--db-border)' }}>
            <button style={{ ...btnBase, width: '100%', textAlign: 'left', fontSize: 12, color: 'var(--db-danger)' }} onClick={() => navigate('/')}>
              ← Volver a la tienda
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: 28, overflow: 'auto' }}>

          {/* RESUMEN */}
          {seccion === 'resumen' && (
            <div className="page-enter">
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--db-text)', marginBottom: 4 }}>Resumen general</div>
              <div style={{ fontSize: 13, color: 'var(--db-muted)', marginBottom: 24 }}>Visión general del negocio</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginBottom: 24 }}>
                <KPICard label="Ventas del mes" value={clp(ventasMes)} delta="órdenes pagadas" deltaUp />
                <KPICard label="Pedidos totales" value={totalPedidos} delta={`${pedidosMes} este mes`} deltaUp />
                <KPICard label="Productos activos" value={totalProductos} delta={`${sinStock} sin stock`} deltaUp={false} />
                <KPICard label="Sin stock" value={sinStock} delta={`${stockBajo} stock bajo`} deltaUp={false} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--db-text)', marginBottom: 4 }}>Ingresos mensuales</div>
                  <div style={{ fontSize: 12, color: 'var(--db-muted)', marginBottom: 16 }}>Últimos 6 meses — CLP</div>
                  <div style={{ height: 200 }}>
                    {ingresosData.datasets[0].data.length > 0
                      ? <Line data={ingresosData} options={{ ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, ticks: { color: '#888', font: { size: 11 }, callback: v => '$' + (v/1000000).toFixed(1) + 'M' } } } }} />
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--db-muted)', fontSize: 13 }}>Sin datos</div>
                    }
                  </div>
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--db-text)', marginBottom: 4 }}>Por categoría</div>
                  <div style={{ fontSize: 12, color: 'var(--db-muted)', marginBottom: 16 }}>Ventas este mes</div>
                  <div style={{ height: 200 }}>
                    {catsData.datasets[0].data.length > 0
                      ? <Doughnut data={catsData} options={{ ...chartDefaults, scales: undefined, cutout: '65%' }} />
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--db-muted)', fontSize: 13 }}>Sin ventas este mes</div>
                    }
                  </div>
                </div>
              </div>

              {(sinStock > 0 || stockBajo > 0) && (
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--db-text)', marginBottom: 12 }}>Alertas de inventario</div>
                  {productos.filter(p => p.stock === 0).map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--db-danger-bg)', borderRadius: 8, marginBottom: 8, fontSize: 13, color: 'var(--db-text)' }}>
                      <span style={{ color: 'var(--db-danger)', fontWeight: 500 }}>Sin stock</span>
                      <span>{p.nombre}</span>
                    </div>
                  ))}
                  {productos.filter(p => p.stock > 0 && p.stock <= 3).map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--db-warning-bg)', borderRadius: 8, marginBottom: 8, fontSize: 13, color: 'var(--db-text)' }}>
                      <span style={{ color: 'var(--db-warning)', fontWeight: 500 }}>Stock bajo</span>
                      <span>{p.nombre} — {p.stock} ud.</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PRODUCTOS */}
          {seccion === 'productos' && (
            <div className="page-enter">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--db-text)' }}>Gestión de productos</div>
                  <div style={{ fontSize: 13, color: 'var(--db-muted)' }}>{productos.length} productos en catálogo</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input value={searchProd} onChange={e => setSearchProd(e.target.value)} placeholder="Buscar..." style={{ ...inputStyle, width: 200, background: 'var(--db-surface)' }} />
                  <button style={btnPrimary} onClick={abrirCrearProd}>+ Nuevo producto</button>
                </div>
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                <table className="tbl">
                  <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {prodFiltrados.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {p.imagen_principal && <img src={p.imagen_principal} alt={p.nombre} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, background: 'rgba(255,255,255,.04)' }} />}
                            <div>
                              <div style={{ fontWeight: 500 }}>{p.nombre}</div>
                              {p.destacado && <span style={{ fontSize: 10, color: 'var(--db-blue)', fontWeight: 500 }}>DESTACADO</span>}
                            </div>
                          </div>
                        </td>
                        <td>{p.categoria_nombre || p.categoria}</td>
                        <td>{clp(p.precio_clp)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: p.stock === 0 ? 'var(--db-danger)' : p.stock <= 3 ? 'var(--db-warning)' : 'var(--db-success)' }}>{p.stock}</span>
                            <div className="stock-bar"><div className="stock-fill" style={{ width: `${Math.min(p.stock / 20 * 100, 100)}%`, background: p.stock === 0 ? 'var(--db-danger)' : p.stock <= 3 ? 'var(--db-warning)' : 'var(--db-success)' }} /></div>
                          </div>
                        </td>
                        <td><Badge estado={p.stock > 0 ? 'PAGADA' : 'CANCELADA'} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={btnSmall} onClick={() => abrirEditarProd(p)}>Editar</button>
                            <button style={{ ...btnSmall, ...btnDanger }} onClick={() => eliminarProducto(p.id)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORÍAS */}
          {seccion === 'categorias' && (
            <div className="page-enter">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--db-text)' }}>Gestión de categorías</div>
                  <div style={{ fontSize: 13, color: 'var(--db-muted)' }}>{categorias.length} categorías</div>
                </div>
                <button style={btnPrimary} onClick={abrirCrearCat}>+ Nueva categoría</button>
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                <table className="tbl">
                  <thead><tr><th>Nombre</th><th>Slug</th><th>Productos</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {categorias.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 500 }}>{c.nombre}</td>
                        <td><code style={{ fontSize: 12, background: 'rgba(255,255,255,.06)', padding: '2px 6px', borderRadius: 4 }}>{c.slug}</code></td>
                        <td>{c.productos_count ?? '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={btnSmall} onClick={() => abrirEditarCat(c)}>Editar</button>
                            <button style={{ ...btnSmall, ...btnDanger }} onClick={() => eliminarCategoria(c.id)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PEDIDOS */}
          {seccion === 'pedidos' && (
            <div className="page-enter">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--db-text)' }}>Pedidos y órdenes</div>
                  <div style={{ fontSize: 13, color: 'var(--db-muted)' }}>{pedidos.length} pedidos en total</div>
                </div>
                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={{ ...inputStyle, width: 180, background: 'var(--db-surface)' }}>
                  <option value="">Todos los estados</option>
                  <option value="PAGADA">Pagada</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                <table className="tbl">
                  <thead><tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead>
                  <tbody>
                    {pedidosFiltrados.map(p => (
                      <tr key={p.id}>
                        <td style={{ color: 'var(--db-muted)' }}>#{p.id}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{p.nombres || 'Cliente'}</div>
                          <div style={{ fontSize: 11, color: 'var(--db-muted)' }}>{p.email}</div>
                        </td>
                        <td style={{ color: 'var(--db-muted)' }}>{new Date(p.fecha_creacion).toLocaleDateString('es-CL')}</td>
                        <td style={{ fontWeight: 500 }}>{clp(p.total_clp)}</td>
                        <td><Badge estado={p.estado} /></td>
                        <td><button style={btnSmall} onClick={() => navigate(`/mis-pedidos/${p.id}`)}>Ver</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ESTADÍSTICAS */}
          {seccion === 'estadisticas' && (
            <div className="page-enter">
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--db-text)', marginBottom: 4 }}>Estadísticas de ventas</div>
              <div style={{ fontSize: 13, color: 'var(--db-muted)', marginBottom: 24 }}>Análisis de rendimiento</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12, marginBottom: 24 }}>
                <KPICard label="Ticket promedio" value={clp(stats?.ticket_promedio || 0)} delta="histórico" deltaUp />
                <KPICard label="Total pedidos" value={totalPedidos} delta={`${pedidosMes} este mes`} deltaUp />
                <KPICard label="Más vendido" value={stats?.top_productos?.[0]?.nombre || '—'} delta={`${stats?.top_productos?.[0]?.cantidad || 0} unidades`} deltaUp />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--db-text)', marginBottom: 4 }}>Pedidos por día</div>
                  <div style={{ fontSize: 12, color: 'var(--db-muted)', marginBottom: 16 }}>Últimos 7 días</div>
                  <div style={{ height: 180 }}>
                    {diarioData.datasets[0].data.length > 0
                      ? <Bar data={diarioData} options={chartDefaults} />
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--db-muted)', fontSize: 13 }}>Sin datos</div>
                    }
                  </div>
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--db-text)', marginBottom: 4 }}>Top 5 productos</div>
                  <div style={{ fontSize: 12, color: 'var(--db-muted)', marginBottom: 16 }}>Por unidades vendidas</div>
                  <div style={{ height: 180 }}>
                    {top5Data.datasets[0].data.length > 0
                      ? <Bar data={top5Data} options={{ ...chartDefaults, indexAxis: 'y' }} />
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--db-muted)', fontSize: 13 }}>Sin datos</div>
                    }
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--db-text)', marginBottom: 4 }}>Comparativo anual</div>
                <div style={{ fontSize: 12, color: 'var(--db-muted)', marginBottom: 16 }}>{anioActual - 1} vs {anioActual} por mes</div>
                <div style={{ height: 200 }}>
                  {(compData.datasets[0].data.length > 0 || compData.datasets[1].data.length > 0)
                    ? <Bar data={compData} options={chartDefaults} />
                    : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--db-muted)', fontSize: 13 }}>Sin datos</div>
                  }
                </div>
              </div>
            </div>
          )}

          {/* CLIENTES / USUARIOS */}
          {seccion === 'usuarios' && (
             <div className="page-enter">
               <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--db-text)', marginBottom: 4 }}>Gestión de Clientes</div>
               <div style={{ fontSize: 13, color: 'var(--db-muted)', marginBottom: 24 }}>Lista de usuarios registrados</div>
               <div className="card" style={{ overflow: 'hidden' }}>
                 <table className="tbl">
                   <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Registro</th></tr></thead>
                   <tbody>
                     {usuarios.map(u => (
                       <tr key={u.id}>
                         <td style={{ color: 'var(--db-muted)' }}>#{u.id}</td>
                         <td style={{ fontWeight: 500 }}>{u.first_name} {u.last_name}</td>
                         <td>{u.email}</td>
                         <td style={{ color: 'var(--db-muted)' }}>{new Date(u.date_joined).toLocaleDateString('es-CL')}</td>
                       </tr>
                     ))}
                     {usuarios.length === 0 && (
                       <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No hay usuarios</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {/* ============================================================== */}
          {/* MODALES COMPLETADOS PARA SUBIR ARCHIVOS                          */}
          {/* ============================================================== */}

          {/* ---> MODIFICADO: Agregada prop width dinámica <--- */}
          <Modal open={modalProd} onClose={() => setModalProd(false)} title={editProd ? 'Editar Producto' : 'Nuevo Producto'} width={editProd ? 700 : 420}>
            <FormInput label="Nombre" value={formProd.nombre} onChange={e => setFormProd({...formProd, nombre: e.target.value})} />
            
            <FormInput label="Categoría" as="select" value={formProd.categoria} onChange={e => setFormProd({...formProd, categoria: e.target.value})}>
              <option value="" disabled>Seleccione...</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </FormInput>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <FormInput label="Precio (CLP)" type="number" value={formProd.precio_clp} onChange={e => setFormProd({...formProd, precio_clp: e.target.value})} />
              <FormInput label="Stock" type="number" value={formProd.stock} onChange={e => setFormProd({...formProd, stock: e.target.value})} />
            </div>
            
            <FormInput label="Descripción" as="textarea" value={formProd.descripcion} onChange={e => setFormProd({...formProd, descripcion: e.target.value})} />
            
            <FormInput 
              label="Imagen Principal" 
              type="file" 
              accept="image/*" 
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setFormProd({...formProd, imagen: e.target.files[0]});
                }
              }} 
            />
            {editProd && editProd.imagen_principal && !formProd.imagen && (
               <div style={{ fontSize: 11, color: 'var(--db-muted)', marginTop: -10, marginBottom: 14 }}>
                 Imagen actual guardada. Sube una nueva para reemplazarla.
               </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--db-text)', cursor: 'pointer' }}>
                <input type="checkbox" checked={formProd.destacado} onChange={e => setFormProd({...formProd, destacado: e.target.checked})} />
                Producto Destacado
              </label>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, marginBottom:editProd ? '30px' : 0 }}>
              <button style={btnBase} onClick={() => setModalProd(false)}>Cancelar</button>
              <button style={btnPrimary} onClick={guardarProducto} disabled={cargando.prod}>
                {cargando.prod ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            {editProd && (
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '0.5px solid var(--db-border)' }}>
                <GestorImagenes productoId={editProd.id} />
              </div>
            )}
          </Modal>

          <Modal open={modalCat} onClose={() => setModalCat(false)} title={editCat ? 'Editar Categoría' : 'Nueva Categoría'}>
            <FormInput label="Nombre" value={formCat.nombre} onChange={e => setFormCat({...formCat, nombre: e.target.value})} />
            <FormInput label="Slug" value={formCat.slug} onChange={e => setFormCat({...formCat, slug: e.target.value})} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button style={btnBase} onClick={() => setModalCat(false)}>Cancelar</button>
              <button style={btnPrimary} onClick={guardarCategoria} disabled={cargando.cat}>
                {cargando.cat ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </Modal>

        </main>
      </div>
    </>
  );
}