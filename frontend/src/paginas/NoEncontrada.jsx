import { Link } from 'react-router';

// Informa cuando la dirección no corresponde a una página de la aplicación.
function NoEncontrada() {
  return (
    <main className="pagina-no-encontrada">
      <p className="etiqueta">Error 404</p>
      <h1>No encontramos esta página</h1>
      <p>La dirección puede haber cambiado o no existir.</p>
      <Link className="boton-principal" to="/">Ir a las órdenes</Link>
    </main>
  );
}

export default NoEncontrada;
