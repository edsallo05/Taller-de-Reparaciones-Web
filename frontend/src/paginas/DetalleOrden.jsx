import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { actualizarOrden, obtenerEventos, obtenerOrden } from '../peticiones/ordenes.js';

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

// Calcula el importe visible del presupuesto sin guardarlo en PocketBase.
function calcularTotalPresupuesto(orden) {
  const totalPiezas = (orden.piezas || []).reduce((total, pieza) => {
    return total + pieza.cantidad * pieza.precio;
  }, 0);

  return (orden.manoObra || 0) + totalPiezas;
}

// Carga el detalle, el historial y las acciones que corresponden a la etapa.
function DetalleOrden() {
  const { ordenId } = useParams();
  const [orden, setOrden] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [datosPresupuesto, setDatosPresupuesto] = useState({
    diagnostico: '',
    manoObra: '0',
    piezas: [],
  });
  const [piezaNueva, setPiezaNueva] = useState({ descripcion: '', cantidad: '1', precio: '0' });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const controlador = new AbortController();

    // Solicita el registro y su historial desde PocketBase.
    async function cargarDetalle() {
      setCargando(true);
      setError('');

      try {
        const [registroOrden, registrosEventos] = await Promise.all([
          obtenerOrden(ordenId, controlador.signal),
          obtenerEventos(ordenId, controlador.signal),
        ]);
        setOrden(registroOrden);
        setEventos(registrosEventos);
        setDatosPresupuesto({
          diagnostico: registroOrden.diagnostico || '',
          manoObra: String(registroOrden.manoObra || 0),
          piezas: registroOrden.piezas || [],
        });
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

    cargarDetalle();
    return () => controlador.abort();
  }, [ordenId]);

  // Guarda un cambio y vuelve a leer los datos que quedaron en el servidor.
  async function guardarCambios(cambios, mensajeExito) {
    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      await actualizarOrden(ordenId, cambios);
      const [registroOrden, registrosEventos] = await Promise.all([
        obtenerOrden(ordenId),
        obtenerEventos(ordenId),
      ]);
      setOrden(registroOrden);
      setEventos(registrosEventos);
      setDatosPresupuesto({
        diagnostico: registroOrden.diagnostico || '',
        manoObra: String(registroOrden.manoObra || 0),
        piezas: registroOrden.piezas || [],
      });
      setMensaje(mensajeExito);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  // Añade una pieza al presupuesto que todavía está en preparación.
  function agregarPieza(evento) {
    evento.preventDefault();
    const cantidad = Number(piezaNueva.cantidad);
    const precio = Number(piezaNueva.precio);

    const descripcion = piezaNueva.descripcion.trim();

    if (descripcion.length < 2 || descripcion.length > 100 || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(descripcion)
      || piezaNueva.cantidad.trim() === '' || piezaNueva.precio.trim() === ''
      || !Number.isFinite(cantidad) || cantidad <= 0 || cantidad > 10000
      || !Number.isFinite(precio) || precio < 0 || precio > 100000000) {
      setError('Completa la descripción y usa una cantidad y un precio válidos.');
      return;
    }

    setDatosPresupuesto((datosAnteriores) => ({
      ...datosAnteriores,
      piezas: [...datosAnteriores.piezas, {
        descripcion,
        cantidad,
        precio,
      }],
    }));
    setPiezaNueva({ descripcion: '', cantidad: '1', precio: '0' });
    setError('');
  }

  // Registra el diagnóstico y el presupuesto antes de avanzar de etapa.
  function manejarEnvioPresupuesto(evento) {
    evento.preventDefault();
    const diagnostico = datosPresupuesto.diagnostico.trim();
    const manoObra = Number(datosPresupuesto.manoObra);

    if (diagnostico.length < 10 || diagnostico.length > 1000 || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(diagnostico)) {
      setError('Escribe un diagnóstico descriptivo de al menos diez caracteres.');
      return;
    }

    if (!Number.isFinite(manoObra) || manoObra < 0 || manoObra > 100000000) {
      setError('La mano de obra debe ser un importe válido entre cero y 100 000 000.');
      return;
    }

    guardarCambios({
      estado: 'presupuestada',
      diagnostico,
      manoObra,
      piezas: datosPresupuesto.piezas,
    }, 'El presupuesto quedó registrado.');
  }

  if (cargando) {
    return <p className="mensaje-panel">Cargando orden…</p>;
  }

  if (error && !orden) {
    return (
      <div className="mensaje-panel mensaje-error">
        <p>{error}</p>
        <Link to="/">Volver a las órdenes</Link>
      </div>
    );
  }

  if (!orden) {
    return <p className="mensaje-panel">No se encontró la orden solicitada.</p>;
  }

  const presupuestoEditable = orden.estado === 'en_diagnostico';
  const fotos = orden.fotos || [];

  return (
    <section>
      <Link className="enlace-volver" to="/">← Volver a las órdenes</Link>
      <div className="encabezado-pagina encabezado-detalle">
        <div>
          <p className="etiqueta">Detalle de orden</p>
          <h1>{orden.equipo}</h1>
          <p className="texto-secundario">{orden.problema}</p>
        </div>
        <span className={`insignia-estado estado-${orden.estado}`}>
          {NOMBRES_ESTADOS[orden.estado] || orden.estado}
        </span>
      </div>

      {error && <p className="mensaje-formulario mensaje-error">{error}</p>}
      {mensaje && <p className="mensaje-formulario mensaje-exito">{mensaje}</p>}

      <div className="rejilla-detalle">
        <section className="tarjeta">
          <h2>Información del equipo</h2>
          <dl className="lista-datos">
            <div><dt>Cliente</dt><dd>{orden.expand?.cliente?.nombre || 'Cliente'}</dd></div>
            <div><dt>Teléfono</dt><dd>{orden.expand?.cliente?.telefono || 'Sin teléfono'}</dd></div>
            <div><dt>Problema reportado</dt><dd>{orden.problema}</dd></div>
            <div><dt>Diagnóstico</dt><dd>{orden.diagnostico || 'Pendiente'}</dd></div>
          </dl>
        </section>

        <section className="tarjeta">
          <h2>Presupuesto</h2>
          <dl className="lista-datos">
            <div><dt>Mano de obra</dt><dd>${Number(orden.manoObra || 0).toFixed(2)}</dd></div>
            {(orden.piezas || []).map((pieza, indice) => (
              <div key={`${pieza.descripcion}-${indice}`}>
                <dt>{pieza.descripcion} × {pieza.cantidad}</dt>
                <dd>${(pieza.cantidad * pieza.precio).toFixed(2)}</dd>
              </div>
            ))}
            <div className="fila-total"><dt>Total</dt><dd>${calcularTotalPresupuesto(orden).toFixed(2)}</dd></div>
          </dl>
        </section>
      </div>

      {fotos.length > 0 && (
        <section className="tarjeta tarjeta-fotos">
          <h2>Fotos del equipo</h2>
          <div className="rejilla-fotos">
            {fotos.map((foto) => (
              <img
                alt={`Foto del equipo ${orden.equipo}`}
                key={foto}
                src={`/api/files/${orden.collectionId}/${orden.id}/${encodeURIComponent(foto)}`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="tarjeta tarjeta-acciones">
        <h2>Acciones de la orden</h2>
        {orden.estado === 'solicitada' && (
          <div className="acciones-formulario">
            <button className="boton-principal" disabled={guardando} onClick={() => guardarCambios({ estado: 'en_diagnostico' }, 'La revisión del equipo comenzó.')}>
              Iniciar diagnóstico
            </button>
            <button className="boton-secundario boton-peligro" disabled={guardando} onClick={() => guardarCambios({ estado: 'cancelada' }, 'La orden quedó cancelada.')}>
              Cancelar orden
            </button>
          </div>
        )}

        {presupuestoEditable && (
          <form className="formulario formulario-presupuesto" onSubmit={manejarEnvioPresupuesto}>
            <p className="texto-secundario">
              Completa el diagnóstico y el presupuesto. Al guardarlos, la orden pasará a Presupuestada.
              Añade piezas solo si hacen falta para la reparación.
            </p>
            <label>
              Diagnóstico
              <textarea
                onChange={(evento) => setDatosPresupuesto((datosAnteriores) => ({ ...datosAnteriores, diagnostico: evento.target.value }))}
                maxLength={1000}
                minLength={10}
                required
                rows="3"
                title="Describe el diagnóstico con al menos diez caracteres."
                value={datosPresupuesto.diagnostico}
              />
            </label>
            <label>
              Mano de obra
              <input
                min="0"
                max="100000000"
                onChange={(evento) => setDatosPresupuesto((datosAnteriores) => ({ ...datosAnteriores, manoObra: evento.target.value }))}
                required
                step="0.01"
                type="number"
                value={datosPresupuesto.manoObra}
              />
            </label>
            <div>
              <h3>Piezas</h3>
              {datosPresupuesto.piezas.map((pieza, indice) => (
                <div className="pieza-presupuesto" key={`${pieza.descripcion}-${indice}`}>
                  <span>{pieza.descripcion}: {pieza.cantidad} × ${Number(pieza.precio).toFixed(2)}</span>
                  <button
                    aria-label={`Quitar ${pieza.descripcion}`}
                    className="boton-texto"
                    onClick={() => setDatosPresupuesto((datosAnteriores) => ({
                      ...datosAnteriores,
                      piezas: datosAnteriores.piezas.filter((piezaActual, indiceActual) => indiceActual !== indice),
                    }))}
                    type="button"
                  >
                    Quitar
                  </button>
                </div>
              ))}
              <div className="rejilla-nueva-pieza">
                <label>
                  Descripción
                  <input
                    maxLength={100}
                    minLength={2}
                    onChange={(evento) => setPiezaNueva((piezaAnterior) => ({ ...piezaAnterior, descripcion: evento.target.value }))}
                    value={piezaNueva.descripcion}
                  />
                </label>
                <label>
                  Cantidad
                  <input
                    min="0.01"
                    max="10000"
                    onChange={(evento) => setPiezaNueva((piezaAnterior) => ({ ...piezaAnterior, cantidad: evento.target.value }))}
                    step="0.01"
                    type="number"
                    value={piezaNueva.cantidad}
                  />
                </label>
                <label>
                  Precio
                  <input
                    min="0"
                    max="100000000"
                    onChange={(evento) => setPiezaNueva((piezaAnterior) => ({ ...piezaAnterior, precio: evento.target.value }))}
                    step="0.01"
                    type="number"
                    value={piezaNueva.precio}
                  />
                </label>
                <button className="boton-secundario" onClick={agregarPieza} type="button">Añadir pieza</button>
              </div>
            </div>
            <p className="total-presupuesto">
              Total calculado: ${(Number(datosPresupuesto.manoObra || 0) + datosPresupuesto.piezas.reduce((total, pieza) => total + pieza.cantidad * pieza.precio, 0)).toFixed(2)}
            </p>
            <button className="boton-principal" disabled={guardando} type="submit">
              {guardando ? 'Guardando…' : 'Guardar y pasar a Presupuestada'}
            </button>
          </form>
        )}

        {orden.estado === 'presupuestada' && (
          <div className="acciones-formulario">
            <button className="boton-principal" disabled={guardando} onClick={() => guardarCambios({ estado: 'aprobada' }, 'El cliente aprobó el presupuesto.')}>
              Cliente aprobó
            </button>
            <button className="boton-secundario boton-peligro" disabled={guardando} onClick={() => guardarCambios({ estado: 'rechazada' }, 'El presupuesto fue rechazado.')}>
              Cliente rechazó
            </button>
          </div>
        )}

        {orden.estado === 'aprobada' && (
          <button className="boton-principal" disabled={guardando} onClick={() => guardarCambios({ estado: 'en_reparacion' }, 'La reparación comenzó.')}>
            Iniciar reparación
          </button>
        )}
        {orden.estado === 'en_reparacion' && (
          <button className="boton-principal" disabled={guardando} onClick={() => guardarCambios({ estado: 'lista' }, 'El equipo quedó listo.')}>
            Marcar como lista
          </button>
        )}
        {orden.estado === 'lista' && (
          <button className="boton-principal" disabled={guardando} onClick={() => guardarCambios({ estado: 'entregada' }, 'El equipo fue entregado.')}>
            Registrar entrega
          </button>
        )}
        {(orden.estado === 'rechazada' || orden.estado === 'cancelada' || orden.estado === 'entregada') && (
          <p className="texto-secundario">Esta orden está cerrada y no admite más cambios.</p>
        )}
      </section>

      <section className="tarjeta tarjeta-historial">
        <h2>Historial de la orden</h2>
        {eventos.length === 0 ? (
          <p className="texto-secundario">Aún no hay cambios de etapa registrados.</p>
        ) : (
          <ol className="lista-historial">
            {eventos.map((evento) => (
              <li key={evento.id}>
                <span className="punto-historial" aria-hidden="true" />
                <div>
                  <p>
                    <strong>{NOMBRES_ESTADOS[evento.de] || evento.de}</strong>
                    <span className="flecha-historial" aria-hidden="true">→</span>
                    <strong>{NOMBRES_ESTADOS[evento.a] || evento.a}</strong>
                  </p>
                  <time dateTime={evento.created}>{new Date(evento.created).toLocaleString('es')}</time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}

export default DetalleOrden;
