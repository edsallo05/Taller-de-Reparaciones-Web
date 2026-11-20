import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { obtenerOrdenes } from '../peticiones/ordenes.js';

const NOMBRES_ESTADOS = {
  solicitada: 'Solicitada',
  en_diagnostico: 'En diagnóstico',
  presupuestada: 'Presupuestada',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  en_reparacion: 'En reparación',
  lista: 'Lista',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

const ESTADOS_ORDEN = Object.keys(NOMBRES_ESTADOS);

// Carga y muestra las órdenes registradas en PocketBase.
function ListaOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const conteosPorEstado = ordenes.reduce((conteos, orden) => {
    conteos[orden.estado] = (conteos[orden.estado] || 0) + 1;
    return conteos;
  }, {});

  useEffect(() => {
    const controlador = new AbortController();

    // Obtiene las órdenes y conserva un mensaje si PocketBase no responde.
    async function cargarOrdenes() {
      try {
        const registros = await obtenerOrdenes(controlador.signal);
        setOrdenes(registros);
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

    cargarOrdenes();
    return () => controlador.abort();
  }, []);

  return (
    <section>
      <div className="encabezado-pagina">
        <div>
          <p className="etiqueta">Panel del taller</p>
          <h1>Órdenes de reparación</h1>
          <p className="texto-secundario">Consulta el estado actual de los equipos recibidos.</p>
          <div className="resumen-ordenes">
            <span className="resumen-numero">{ordenes.length}</span>
            <span>órdenes registradas</span>
          </div>
        </div>
        <Link className="boton-principal boton-enlace" to="/ordenes/nueva">Registrar orden</Link>
      </div>

      <div className="rejilla-estados" aria-label="Cantidad de órdenes por estado">
        {ESTADOS_ORDEN.map((estado) => (
          <div className="tarjeta-estado" key={estado}>
            <span>{NOMBRES_ESTADOS[estado]}</span>
            <strong>{conteosPorEstado[estado] || 0}</strong>
          </div>
        ))}
      </div>

      {cargando && <p className="mensaje-panel">Cargando órdenes…</p>}
      {!cargando && error && <p className="mensaje-panel mensaje-error">{error}</p>}
      {!cargando && !error && ordenes.length === 0 && (
        <p className="mensaje-panel">Todavía no hay órdenes registradas.</p>
      )}

      {!cargando && !error && ordenes.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla-ordenes">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th><span className="solo-lectores">Acción</span></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td>
                    <span className="equipo-nombre">{orden.equipo}</span>
                    <span className="equipo-problema">{orden.problema}</span>
                  </td>
                  <td>{orden.expand?.cliente?.nombre || 'Cliente'}</td>
                  <td>
                    <span className={`insignia-estado estado-${orden.estado}`}>
                      {NOMBRES_ESTADOS[orden.estado] || orden.estado}
                    </span>
                  </td>
                  <td>
                    <Link className="enlace-detalle" to={`/ordenes/${orden.id}`}>
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ListaOrdenes;
