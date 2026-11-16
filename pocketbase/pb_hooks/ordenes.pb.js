// Solo permite crear órdenes en estado solicitada y sin presupuesto previo.
onRecordCreateRequest((evento) => {
  if (evento.record.get('estado') !== 'solicitada') {
    throw new BadRequestError('Una orden nueva debe comenzar en estado solicitada.');
  }

  evento.record.set('diagnostico', '');
  evento.record.set('manoObra', 0);
  evento.record.set('piezas', []);
  evento.next();
}, 'ordenes');

// Valida las transiciones y registra su historial dentro de una transacción.
onRecordUpdateRequest((evento) => {
  const aplicacionOriginal = evento.app;

  try {
    evento.app.runInTransaction((aplicacionTransaccional) => {
      evento.app = aplicacionTransaccional;

      const ordenAnterior = evento.app.findRecordById('ordenes', evento.record.id);
      const estadoAnterior = ordenAnterior.get('estado');
      const estadoNuevo = evento.record.get('estado');
      const cambioEstado = estadoAnterior !== estadoNuevo;

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
        const diagnostico = evento.record.get('diagnostico');
        const manoObra = evento.record.get('manoObra');
        const piezasJson = evento.record.get('piezas').string();
        const piezas = JSON.parse(piezasJson);

        if (typeof diagnostico !== 'string' || diagnostico.trim() === '') {
          throw new BadRequestError('El diagnóstico es obligatorio al presupuestar.');
        }

        if (typeof manoObra !== 'number' || manoObra < 0) {
          throw new BadRequestError('La mano de obra debe ser un importe igual o mayor que cero.');
        }

        if (!Array.isArray(piezas)) {
          throw new BadRequestError('Las piezas deben enviarse como una lista.');
        }

        for (const pieza of piezas) {
          if (pieza === null || typeof pieza !== 'object') {
            throw new BadRequestError('Cada pieza debe ser un objeto con sus datos.');
          }

          if (typeof pieza.descripcion !== 'string' || pieza.descripcion.trim() === '') {
            throw new BadRequestError('Cada pieza debe tener una descripción.');
          }

          if (typeof pieza.cantidad !== 'number' || pieza.cantidad <= 0) {
            throw new BadRequestError('La cantidad de cada pieza debe ser mayor que cero.');
          }

          if (typeof pieza.precio !== 'number' || pieza.precio < 0) {
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
