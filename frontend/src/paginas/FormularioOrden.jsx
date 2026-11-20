import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { crearOrden, obtenerClientes } from '../peticiones/ordenes.js';

// Registra un equipo, su problema y hasta tres fotos.
function FormularioOrden() {
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const [clientes, setClientes] = useState([]);
  const [datosOrden, setDatosOrden] = useState({
    cliente: '',
    equipo: '',
    problema: '',
    fotos: [],
  });
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controlador = new AbortController();

    // Carga los clientes para permitir asociarlos a la orden.
    async function cargarClientes() {
      try {
        const registros = await obtenerClientes(controlador.signal);
        setClientes(registros);
        if (registros.length > 0) {
          setDatosOrden((datosAnteriores) => ({
            ...datosAnteriores,
            cliente: registros.some((cliente) => cliente.id === parametros.get('cliente'))
              ? parametros.get('cliente')
              : registros[0].id,
          }));
        }
      } catch (errorCarga) {
        if (!controlador.signal.aborted) {
          setError(errorCarga.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargandoClientes(false);
        }
      }
    }

    cargarClientes();
    return () => controlador.abort();
  }, []);

  // Actualiza un campo de texto o selección del formulario.
  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosOrden((datosAnteriores) => ({ ...datosAnteriores, [name]: value }));
  }

  // Conserva como máximo tres archivos de imagen seleccionados.
  function manejarFotos(evento) {
    const fotosSeleccionadas = Array.from(evento.target.files || []);

    if (fotosSeleccionadas.length > 3) {
      setError('Puedes adjuntar como máximo tres imágenes.');
      evento.target.value = '';
      return;
    }

    setError('');
    setDatosOrden((datosAnteriores) => ({ ...datosAnteriores, fotos: fotosSeleccionadas }));
  }

  // Guarda la orden y abre su página de detalle.
  async function manejarEnvio(evento) {
    evento.preventDefault();
    const equipo = datosOrden.equipo.trim();
    const problema = datosOrden.problema.trim();

    if (equipo.length < 2 || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(equipo)) {
      setError('Escribe un tipo de equipo válido, como teléfono, laptop o televisor.');
      return;
    }

    if (problema.length < 10 || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(problema)) {
      setError('Describe el problema con al menos diez caracteres y letras.');
      return;
    }

    setGuardando(true);
    setError('');

    try {
      const orden = await crearOrden({ ...datosOrden, equipo, problema });
      navegar(`/ordenes/${orden.id}`);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="formulario-pagina">
      <Link className="enlace-volver" to="/">← Volver a las órdenes</Link>
      <div className="encabezado-pagina">
        <div>
          <p className="etiqueta">Recepción de equipo</p>
          <h1>Registrar orden</h1>
          <p className="texto-secundario">La orden comenzará en la etapa solicitada.</p>
        </div>
      </div>

      {clientes.length === 0 && !cargandoClientes && !error && (
        <div className="mensaje-panel">
          <p>Registra un cliente antes de crear una orden.</p>
          <Link className="boton-principal boton-enlace" to="/clientes/nuevo">Registrar cliente</Link>
        </div>
      )}

      {(clientes.length > 0 || cargandoClientes || error) && (
        <form className="formulario tarjeta" onSubmit={manejarEnvio}>
          {cargandoClientes && <p className="texto-secundario">Cargando clientes…</p>}
          {!cargandoClientes && clientes.length > 0 && (
            <>
              <label>
                Cliente
                <select
                  name="cliente"
                  onChange={manejarCambio}
                  required
                  value={datosOrden.cliente}
                >
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                  ))}
                </select>
              </label>
              <label>
                Equipo
                <input
                  name="equipo"
                  maxLength={80}
                  minLength={2}
                  onChange={manejarCambio}
                  placeholder="Ej.: teléfono, laptop, televisor"
                  required
                  title="Indica el tipo de equipo con al menos dos caracteres."
                  value={datosOrden.equipo}
                />
              </label>
              <label>
                Problema reportado
                <textarea
                  name="problema"
                  maxLength={500}
                  minLength={10}
                  onChange={manejarCambio}
                  required
                  rows="4"
                  title="Describe el problema con al menos diez caracteres."
                  value={datosOrden.problema}
                />
              </label>
              <label>
                Fotos del equipo
                <input
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={manejarFotos}
                  type="file"
                />
                <span className="ayuda-campo">Máximo tres imágenes. {datosOrden.fotos.length} seleccionadas.</span>
              </label>
            </>
          )}
          {error && <p className="mensaje-formulario mensaje-error">{error}</p>}
          {clientes.length > 0 && !cargandoClientes && (
            <div className="acciones-formulario">
              <button className="boton-principal" disabled={guardando} type="submit">
                {guardando ? 'Guardando…' : 'Crear orden solicitada'}
              </button>
              <Link className="enlace-secundario" to="/clientes/nuevo">Registrar otro cliente</Link>
            </div>
          )}
        </form>
      )}
    </section>
  );
}

export default FormularioOrden;
