const URL_COLECCIONES = '/api/collections';

// Lee una respuesta JSON y convierte los errores de PocketBase en mensajes claros.
async function obtenerJson(url, senal) {
  const respuesta = await fetch(url, { signal: senal });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || 'No se pudieron cargar los datos.');
  }

  return datos;
}

// Obtiene las órdenes y los datos del cliente relacionado.
export async function obtenerOrdenes(senal) {
  const parametros = new URLSearchParams({
    expand: 'cliente',
    perPage: '100',
  });
  const datos = await obtenerJson(`${URL_COLECCIONES}/ordenes/records?${parametros}`, senal);
  return datos.items;
}

// Obtiene los clientes disponibles para asociarlos a una orden.
export async function obtenerClientes(senal) {
  const parametros = new URLSearchParams({ sort: 'nombre', perPage: '100' });
  const datos = await obtenerJson(`${URL_COLECCIONES}/clientes/records?${parametros}`, senal);
  return datos.items;
}

// Obtiene la lista de clientes para la pantalla de consulta.
export async function listarClientes(senal) {
  const parametros = new URLSearchParams({ sort: 'nombre', perPage: '100' });
  const datos = await obtenerJson(`${URL_COLECCIONES}/clientes/records?${parametros}`, senal);
  return datos.items;
}

// Registra un cliente nuevo en PocketBase.
export async function crearCliente(datosCliente) {
  return enviarJson(`${URL_COLECCIONES}/clientes/records`, datosCliente);
}

// Registra una orden solicitada y adjunta sus fotos.
export async function crearOrden(datosOrden) {
  const formulario = new FormData();
  formulario.set('cliente', datosOrden.cliente);
  formulario.set('equipo', datosOrden.equipo);
  formulario.set('problema', datosOrden.problema);
  formulario.set('estado', 'solicitada');
  formulario.set('diagnostico', '');
  formulario.set('manoObra', '0');
  formulario.set('piezas', '[]');

  for (const foto of datosOrden.fotos) {
    formulario.append('fotos', foto);
  }

  const respuesta = await fetch(`${URL_COLECCIONES}/ordenes/records`, {
    method: 'POST',
    body: formulario,
  });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || 'No se pudo registrar la orden.');
  }

  return datos;
}

// Envía datos JSON y convierte los errores de PocketBase en mensajes claros.
async function enviarJson(url, datosFormulario, metodo = 'POST') {
  const respuesta = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosFormulario),
  });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || 'No se pudieron guardar los datos.');
  }

  return datos;
}

// Obtiene una orden individual junto con su cliente.
export async function obtenerOrden(ordenId, senal) {
  const parametros = new URLSearchParams({ expand: 'cliente' });
  return obtenerJson(`${URL_COLECCIONES}/ordenes/records/${ordenId}?${parametros}`, senal);
}

// Actualiza una orden y permite que el hook valide el cambio en el servidor.
export async function actualizarOrden(ordenId, cambios) {
  return enviarJson(`${URL_COLECCIONES}/ordenes/records/${ordenId}`, cambios, 'PATCH');
}

// Obtiene el historial ordenado de una orden.
export async function obtenerEventos(ordenId, senal) {
  const parametros = new URLSearchParams({
    filter: `orden = "${ordenId}"`,
    sort: 'created',
    perPage: '100',
  });
  const datos = await obtenerJson(`${URL_COLECCIONES}/eventos/records?${parametros}`, senal);
  return datos.items;
}
