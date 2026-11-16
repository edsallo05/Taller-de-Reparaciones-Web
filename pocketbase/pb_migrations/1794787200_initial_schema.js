// Crea las colecciones principales del taller y define sus reglas de acceso.
migrate((app) => {
  const clientes = new Collection({
    type: 'base',
    name: 'clientes',
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
    fields: [
      {
        type: 'text',
        name: 'nombre',
        required: true,
      },
      {
        type: 'text',
        name: 'telefono',
        required: true,
      },
    ],
  });
  app.save(clientes);

  const ordenes = new Collection({
    type: 'base',
    name: 'ordenes',
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: null,
    fields: [
      {
        type: 'relation',
        name: 'cliente',
        required: true,
        maxSelect: 1,
        collectionId: clientes.id,
        cascadeDelete: false,
      },
      {
        type: 'text',
        name: 'equipo',
        required: true,
      },
      {
        type: 'text',
        name: 'problema',
        required: true,
      },
      {
        type: 'select',
        name: 'estado',
        required: true,
        maxSelect: 1,
        values: [
          'solicitada',
          'en_diagnostico',
          'presupuestada',
          'aprobada',
          'rechazada',
          'en_reparacion',
          'lista',
          'entregada',
          'cancelada',
        ],
      },
      {
        type: 'text',
        name: 'diagnostico',
      },
      {
        type: 'number',
        name: 'manoObra',
        min: 0,
      },
      {
        type: 'json',
        name: 'piezas',
      },
      {
        type: 'file',
        name: 'fotos',
        maxSelect: 3,
      },
    ],
  });
  app.save(ordenes);

  const eventos = new Collection({
    type: 'base',
    name: 'eventos',
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        type: 'relation',
        name: 'orden',
        required: true,
        maxSelect: 1,
        collectionId: ordenes.id,
        cascadeDelete: false,
      },
      {
        type: 'text',
        name: 'de',
        required: true,
      },
      {
        type: 'text',
        name: 'a',
        required: true,
      },
      {
        type: 'autodate',
        name: 'created',
        onCreate: true,
        onUpdate: false,
      },
    ],
  });
  app.save(eventos);
},
// Revierte las colecciones en orden inverso para conservar sus relaciones.
(app) => {
  const eventos = app.findCollectionByNameOrId('eventos');
  app.delete(eventos);

  const ordenes = app.findCollectionByNameOrId('ordenes');
  app.delete(ordenes);

  const clientes = app.findCollectionByNameOrId('clientes');
  app.delete(clientes);
});
