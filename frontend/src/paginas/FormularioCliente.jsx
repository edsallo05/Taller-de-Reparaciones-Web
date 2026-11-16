import { useState } from 'react';
import { Link } from 'react-router';
import { crearCliente } from '../peticiones/ordenes.js';

// Registra los datos de contacto de un cliente del taller.
function FormularioCliente() {
  const [datosCliente, setDatosCliente] = useState({ nombre: '', telefono: '' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Actualiza el campo que cambió en el formulario.
  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosCliente((datosAnteriores) => ({ ...datosAnteriores, [name]: value }));
    setMensaje('');
  }

  // Guarda el cliente y limpia el formulario si la operación termina bien.
  async function manejarEnvio(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      await crearCliente(datosCliente);
      setDatosCliente({ nombre: '', telefono: '' });
      setMensaje('El cliente quedó registrado.');
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
          <p className="etiqueta">Clientes</p>
          <h1>Registrar cliente</h1>
          <p className="texto-secundario">Guarda los datos de contacto para asociarlos a sus equipos.</p>
        </div>
      </div>

      <form className="formulario tarjeta" onSubmit={manejarEnvio}>
        <label>
          Nombre completo
          <input
            autoComplete="name"
            name="nombre"
            onChange={manejarCambio}
            required
            value={datosCliente.nombre}
          />
        </label>
        <label>
          Teléfono
          <input
            autoComplete="tel"
            name="telefono"
            onChange={manejarCambio}
            required
            type="tel"
            value={datosCliente.telefono}
          />
        </label>
        {error && <p className="mensaje-formulario mensaje-error">{error}</p>}
        {mensaje && <p className="mensaje-formulario mensaje-exito">{mensaje}</p>}
        <div className="acciones-formulario">
          <button className="boton-principal" disabled={guardando} type="submit">
            {guardando ? 'Guardando…' : 'Guardar cliente'}
          </button>
          <Link className="enlace-secundario" to="/ordenes/nueva">Registrar una orden</Link>
        </div>
      </form>
    </section>
  );
}

export default FormularioCliente;
