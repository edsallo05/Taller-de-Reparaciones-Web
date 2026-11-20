import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { listarClientes } from '../peticiones/ordenes.js';

// Carga y presenta los clientes guardados en PocketBase.
function ListaClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controlador = new AbortController();

    // Solicita clientes y cancela la petición si se abandona la pantalla.
    async function cargarClientes() {
      try {
        const registros = await listarClientes(controlador.signal);
        setClientes(registros);
      } catch (errorCarga) {
        if (!controlador.signal.aborted) {
          setError(errorCarga.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarClientes();
    return () => controlador.abort();
  }, []);

  return (
    <section>
      <div className="encabezado-pagina">
        <div>
          <p className="etiqueta">Directorio del taller</p>
          <h1>Clientes</h1>
          <p className="texto-secundario">Consulta los datos de contacto de tus clientes.</p>
        </div>
        <Link className="boton-principal boton-enlace" to="/clientes/nuevo">Registrar cliente</Link>
      </div>

      {cargando && <p className="mensaje-panel">Cargando clientes…</p>}
      {!cargando && error && <p className="mensaje-panel mensaje-error">{error}</p>}
      {!cargando && !error && clientes.length === 0 && (
        <p className="mensaje-panel">Todavía no hay clientes registrados.</p>
      )}
      {!cargando && !error && clientes.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla-ordenes">
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Acción</th></tr></thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td><span className="equipo-nombre">{cliente.nombre}</span></td>
                  <td>{cliente.telefono}</td>
                  <td><Link className="enlace-detalle" to={`/ordenes/nueva?cliente=${encodeURIComponent(cliente.id)}`}>Registrar orden</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ListaClientes;
