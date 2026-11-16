// Garantiza una fecha automática en cada evento del historial.
migrate((app) => {
  const eventos = app.findCollectionByNameOrId('eventos');
  let campoFecha = eventos.fields.getByName('created');

  if (!campoFecha) {
    eventos.fields.add(new AutodateField({
      name: 'created',
      onCreate: true,
      onUpdate: false,
    }));
    app.save(eventos);
  }

  app.db().newQuery(
    "UPDATE \"eventos\" SET \"created\" = strftime('%Y-%m-%d %H:%M:%fZ') WHERE \"created\" = '' OR \"created\" IS NULL",
  ).execute();
});
