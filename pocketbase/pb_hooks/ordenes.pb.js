// Valida los datos de contacto aunque el cliente use directamente la API.
onRecordCreateRequest((evento) => {
  const nombre = evento.record.get('nombre');
  const telefono = evento.record.get('telefono');
  const patronNombre = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

  if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 80 || !patronNombre.test(nombre.trim())) {
    throw new BadRequestError('Escribe un nombre válido usando letras, espacios, guiones o apóstrofos.');
  }

  if (typeof telefono !== 'string' || !/^\d{8}$/.test(telefono.trim())) {
    throw new BadRequestError('El teléfono debe contener exactamente ocho números.');
  }

  evento.record.set('nombre', nombre.trim());
  evento.record.set('telefono', telefono.trim());
  evento.next();
}, 'clientes');

// Repite las validaciones de contacto al modificar un cliente.
onRecordUpdateRequest((evento) => {
  const nombre = evento.record.get('nombre');
  const telefono = evento.record.get('telefono');
  const patronNombre = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

  if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 80 || !patronNombre.test(nombre.trim())) {
    throw new BadRequestError('Escribe un nombre válido usando letras, espacios, guiones o apóstrofos.');
  }

  if (typeof telefono !== 'string' || !/^\d{8}$/.test(telefono.trim())) {
    throw new BadRequestError('El teléfono debe contener exactamente ocho números.');
  }

  evento.record.set('nombre', nombre.trim());
  evento.record.set('telefono', telefono.trim());
  evento.next();
}, 'clientes');

// Solo permite crear órdenes en estado solicitada y sin presupuesto previo.
onRecordCreateRequest((evento) => {
  // Valida los textos descriptivos de la orden recibida.
  function validarTexto(texto, campo, longitudMinima, longitudMaxima) {
    if (typeof texto !== 'string' || texto.trim().length < longitudMinima || texto.trim().length > longitudMaxima || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(texto.trim())) {
      throw new BadRequestError(campo + ' debe tener texto descriptivo válido.');
    }

    return texto.trim();
  }

  if (evento.record.get('estado') !== 'solicitada') {
    throw new BadRequestError('Una orden nueva debe comenzar en estado solicitada.');
  }

  evento.record.set('diagnostico', '');
  evento.record.set('manoObra', 0);
  evento.record.set('piezas', []);
  evento.record.set('equipo', validarTexto(evento.record.get('equipo'), 'El equipo', 2, 80));
  evento.record.set('problema', validarTexto(evento.record.get('problema'), 'El problema', 10, 500));
  evento.next();
}, 'ordenes');

// Valida las transiciones y registra su historial dentro de una transacción.
onRecordUpdateRequest((evento) => {
  // Valida los textos descriptivos que acompañan a cualquier cambio de orden.
  function validarTexto(texto, campo, longitudMinima, longitudMaxima) {
    if (typeof texto !== 'string' || texto.trim().length < longitudMinima || texto.trim().length > longitudMaxima || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(texto.trim())) {
      throw new BadRequestError(campo + ' debe tener texto descriptivo válido.');
    }

    return texto.trim();
  }

  const aplicacionOriginal = evento.app;

  try {
    evento.app.runInTransaction((aplicacionTransaccional) => {
      evento.app = aplicacionTransaccional;

      const ordenAnterior = evento.app.findRecordById('ordenes', evento.record.id);
      const estadoAnterior = ordenAnterior.get('estado');
      const estadoNuevo = evento.record.get('estado');
      const cambioEstado = estadoAnterior !== estadoNuevo;

      evento.record.set('equipo', validarTexto(evento.record.get('equipo'), 'El equipo', 2, 80));
      evento.record.set('problema', validarTexto(evento.record.get('problema'), 'El problema', 10, 500));

      if (estadoAnterior === 'rechazada' || estadoAnterior === 'cancelada' || estadoAnterior === 'entregada') {
        throw new BadRequestError('Esta orden ya está cerrada y no puede modificarse.');
      }

      const transiciones = {
        solicitada: ['en_diagnostico', 'cancelada'],
        en_diagnostico: ['presupuestada'],
        presupuestada: ['aprobada', 'rechazada'],
        aprobada: ['en_reparacion'],
        en_reparacion: ['lista'],
        lista: ['entregada'],
      };
      const siguientesEstados = transiciones[estadoAnterior] || [];

      if (cambioEstado && siguientesEstados.indexOf(estadoNuevo) === -1) {
        throw new BadRequestError('El cambio de estado solicitado no está permitido.');
      }

      const puedeEditarPresupuesto = estadoAnterior === 'en_diagnostico'
        && (estadoNuevo === 'en_diagnostico' || estadoNuevo === 'presupuestada');
      const camposPresupuesto = ['diagnostico', 'manoObra', 'piezas'];

      if (!puedeEditarPresupuesto) {
        for (const campo of camposPresupuesto) {
          const valorAnterior = JSON.stringify(ordenAnterior.get(campo));
          const valorNuevo = JSON.stringify(evento.record.get(campo));

          if (valorAnterior !== valorNuevo) {
            throw new BadRequestError('El presupuesto no puede modificarse en esta etapa.');
          }
        }
      }

      if (estadoNuevo === 'presupuestada') {
        const diagnostico = validarTexto(evento.record.get('diagnostico'), 'El diagnóstico', 10, 1000);
        evento.record.set('diagnostico', diagnostico);
        const manoObra = evento.record.get('manoObra');
        const piezasJson = evento.record.get('piezas').string();
        const piezas = JSON.parse(piezasJson);

        if (typeof manoObra !== 'number' || !isFinite(manoObra) || manoObra < 0 || manoObra > 100000000) {
          throw new BadRequestError('La mano de obra debe ser un importe igual o mayor que cero.');
        }

        if (!Array.isArray(piezas)) {
          throw new BadRequestError('Las piezas deben enviarse como una lista.');
        }

        for (const pieza of piezas) {
          if (pieza === null || typeof pieza !== 'object') {
            throw new BadRequestError('Cada pieza debe ser un objeto con sus datos.');
          }

          if (typeof pieza.descripcion !== 'string' || pieza.descripcion.trim().length < 2 || pieza.descripcion.trim().length > 100 || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(pieza.descripcion)) {
            throw new BadRequestError('Cada pieza debe tener una descripción válida.');
          }

          if (typeof pieza.cantidad !== 'number' || !isFinite(pieza.cantidad) || pieza.cantidad <= 0 || pieza.cantidad > 10000) {
            throw new BadRequestError('La cantidad de cada pieza debe ser mayor que cero.');
          }

          if (typeof pieza.precio !== 'number' || !isFinite(pieza.precio) || pieza.precio < 0 || pieza.precio > 100000000) {
            throw new BadRequestError('El precio de cada pieza no puede ser negativo.');
          }
        }
      }

      evento.next();

      if (cambioEstado) {
        const coleccionEventos = evento.app.findCollectionByNameOrId('eventos');
        const nuevoEvento = new Record(coleccionEventos);
        nuevoEvento.set('orden', evento.record.id);
        nuevoEvento.set('de', estadoAnterior);
        nuevoEvento.set('a', estadoNuevo);
        evento.app.save(nuevoEvento);
      }
    });
  } finally {
    evento.app = aplicacionOriginal;
  }
}, 'ordenes');
