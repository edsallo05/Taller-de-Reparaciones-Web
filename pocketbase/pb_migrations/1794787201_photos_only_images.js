// Limita las fotos de las órdenes a formatos de imagen habituales.
migrate((app) => {
  const ordenes = app.findCollectionByNameOrId('ordenes');
  const campoFotos = ordenes.fields.getByName('fotos');
  campoFotos.mimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  app.save(ordenes);
}, (app) => {
  const ordenes = app.findCollectionByNameOrId('ordenes');
  const campoFotos = ordenes.fields.getByName('fotos');
  campoFotos.mimeTypes = [];
  app.save(ordenes);
});
