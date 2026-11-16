import { BrowserRouter, Link, NavLink, Outlet, Route, Routes } from 'react-router';
import DetalleOrden from './paginas/DetalleOrden.jsx';
import FormularioCliente from './paginas/FormularioCliente.jsx';
import FormularioOrden from './paginas/FormularioOrden.jsx';
import ListaOrdenes from './paginas/ListaOrdenes.jsx';
import NoEncontrada from './paginas/NoEncontrada.jsx';

// Presenta la navegación común a las páginas del taller.
function DisenoPrincipal() {
  return (
    <div className="aplicacion">
      <header className="barra-superior">
        <Link className="marca" to="/">
          <span className="marca-icono" aria-hidden="true">T</span>
          <span>Taller de reparaciones</span>
        </Link>
        <nav className="navegacion">
          <NavLink className="enlace-navegacion" to="/">Órdenes</NavLink>
          <NavLink className="enlace-navegacion" to="/clientes/nuevo">Nuevo cliente</NavLink>
          <NavLink className="boton-principal boton-enlace" to="/ordenes/nueva">Nueva orden</NavLink>
        </nav>
      </header>
      <main className="contenido-principal">
        <Outlet />
      </main>
    </div>
  );
}

// Declara las rutas principales, las páginas anidadas y la ruta no encontrada.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DisenoPrincipal />}>
          <Route index element={<ListaOrdenes />} />
          <Route path="clientes/nuevo" element={<FormularioCliente />} />
          <Route path="ordenes/nueva" element={<FormularioOrden />} />
          <Route path="ordenes/:ordenId" element={<DetalleOrden />} />
        </Route>
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
