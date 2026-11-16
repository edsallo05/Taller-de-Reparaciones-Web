// Carga dos clientes y tres órdenes de ejemplo para iniciar la aplicación.
migrate((app) => {
  const coleccionClientes = app.findCollectionByNameOrId('clientes');
  const coleccionOrdenes = app.findCollectionByNameOrId('ordenes');
  const coleccionEventos = app.findCollectionByNameOrId('eventos');

  const clienteAna = new Record(coleccionClientes);
  clienteAna.set('nombre', 'Ana Pérez');
  clienteAna.set('telefono', '555-0101');
  app.save(clienteAna);

  const clienteLuis = new Record(coleccionClientes);
  clienteLuis.set('nombre', 'Luis Gómez');
  clienteLuis.set('telefono', '555-0102');
  app.save(clienteLuis);

  const ordenSolicitada = new Record(coleccionOrdenes);
  ordenSolicitada.set('cliente', clienteAna.id);
  ordenSolicitada.set('equipo', 'Teléfono móvil');
  ordenSolicitada.set('problema', 'La batería se descarga con rapidez.');
  ordenSolicitada.set('estado', 'solicitada');
  ordenSolicitada.set('diagnostico', '');
  ordenSolicitada.set('manoObra', 0);
  ordenSolicitada.set('piezas', []);
  app.save(ordenSolicitada);

  const ordenEnDiagnostico = new Record(coleccionOrdenes);
  ordenEnDiagnostico.set('cliente', clienteLuis.id);
  ordenEnDiagnostico.set('equipo', 'Laptop');
  ordenEnDiagnostico.set('problema', 'No inicia el sistema operativo.');
  ordenEnDiagnostico.set('estado', 'en_diagnostico');
  ordenEnDiagnostico.set('diagnostico', '');
  ordenEnDiagnostico.set('manoObra', 0);
  ordenEnDiagnostico.set('piezas', []);
  app.save(ordenEnDiagnostico);

  const eventoDiagnostico = new Record(coleccionEventos);
  eventoDiagnostico.set('orden', ordenEnDiagnostico.id);
  eventoDiagnostico.set('de', 'solicitada');
  eventoDiagnostico.set('a', 'en_diagnostico');
  app.save(eventoDiagnostico);

  const ordenPresupuestada = new Record(coleccionOrdenes);
  ordenPresupuestada.set('cliente', clienteAna.id);
  ordenPresupuestada.set('equipo', 'Televisor');
  ordenPresupuestada.set('problema', 'La imagen parpadea al encender.');
  ordenPresupuestada.set('estado', 'presupuestada');
  ordenPresupuestada.set('diagnostico', 'Se debe sustituir un condensador de la fuente.');
  ordenPresupuestada.set('manoObra', 80);
  ordenPresupuestada.set('piezas', [
    { descripcion: 'Condensador', cantidad: 1, precio: 25 },
  ]);
  app.save(ordenPresupuestada);

  const eventoInicioDiagnostico = new Record(coleccionEventos);
  eventoInicioDiagnostico.set('orden', ordenPresupuestada.id);
  eventoInicioDiagnostico.set('de', 'solicitada');
  eventoInicioDiagnostico.set('a', 'en_diagnostico');
  app.save(eventoInicioDiagnostico);

  const eventoPresupuesto = new Record(coleccionEventos);
  eventoPresupuesto.set('orden', ordenPresupuestada.id);
  eventoPresupuesto.set('de', 'en_diagnostico');
  eventoPresupuesto.set('a', 'presupuestada');
  app.save(eventoPresupuesto);
});
