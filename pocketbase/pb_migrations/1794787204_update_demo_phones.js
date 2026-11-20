// Ajusta los teléfonos de demostración existentes a la validación de ocho cifras.
migrate((app) => {
  const clientes = app.findRecordsByFilter('clientes', 'telefono = "555-0101" || telefono = "555-0102"', '', 100, 0);

  for (const cliente of clientes) {
    if (cliente.get('telefono') === '555-0101') {
      cliente.set('telefono', '55550101');
    } else if (cliente.get('telefono') === '555-0102') {
      cliente.set('telefono', '55550102');
    }

    app.save(cliente);
  }
}, (app) => {
  const clientes = app.findRecordsByFilter('clientes', 'telefono = "55550101" || telefono = "55550102"', '', 100, 0);

  for (const cliente of clientes) {
    if (cliente.get('telefono') === '55550101') {
      cliente.set('telefono', '555-0101');
    } else if (cliente.get('telefono') === '55550102') {
      cliente.set('telefono', '555-0102');
    }

    app.save(cliente);
  }
});
