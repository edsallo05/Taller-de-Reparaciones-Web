# Taller de reparaciones

Aplicación web para que el personal del taller registre clientes, reciba equipos, consulte las órdenes, prepare presupuestos y mantenga un historial de cada cambio de etapa. El frontend se desarrolla con React y Vite; PocketBase almacena los datos y aplica las reglas del proceso.

La aplicación no tiene autenticación, usuarios ni roles. Las reglas de negocio se validan en PocketBase para que también se cumplan cuando una petición no provenga de la interfaz.

## Requisitos

- Windows de 64 bits.
- Node.js 20.19+ o 22.12+, con npm.
- El ejecutable de PocketBase para Windows. El proyecto se desarrolló y verificó con PocketBase 0.41.1.

Vite publica sus requisitos actuales de Node.js en la [guía oficial de instalación](https://vite.dev/guide/). PocketBase ofrece el ejecutable oficial y la guía de inicio en su [documentación](https://pocketbase.io/docs/).

## Preparación de PocketBase

1. Descarga el ejecutable de PocketBase para Windows desde la documentación oficial.
2. Coloca `pocketbase.exe` dentro de la carpeta `pocketbase/` de este proyecto.
3. Abre una terminal en esa carpeta y ejecuta:

   ```powershell
   .\pocketbase.exe serve --http 127.0.0.1:8090
   ```

4. PocketBase aplicará las migraciones pendientes al iniciar. Las colecciones están en `pocketbase/pb_migrations/` y las validaciones en `pocketbase/pb_hooks/`.

La primera ejecución puede mostrar un enlace para configurar el panel de administración de PocketBase. Ese panel es independiente de la aplicación; el personal usa el frontend sin iniciar sesión.

La carpeta `pocketbase/pb_data/` se crea al iniciar PocketBase y guarda la base local y los archivos subidos. No se incluye en Git.

## Instalar y ejecutar el frontend

Abre otra terminal en `frontend/` y ejecuta:

```powershell
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://127.0.0.1:5173/`. La configuración de desarrollo reenvía las peticiones `/api` a PocketBase en `127.0.0.1:8090`; por eso, ambos procesos deben estar activos mientras se usa la aplicación.

Para comprobar la compilación de producción:

```powershell
npm run build
```

No abras `frontend/index.html` directamente desde el explorador de archivos. React y JSX deben servirse mediante Vite.

## Datos de demostración

La migración `1794787202_demo_data.js` agrega automáticamente estos datos en una base nueva:

- Dos clientes: Ana Pérez y Luis Gómez.
- Una orden solicitada para un teléfono móvil.
- Una orden en diagnóstico para una laptop.
- Una orden presupuestada para un televisor, con diagnóstico, mano de obra y una pieza.
- Eventos de historial para las órdenes que ya avanzaron de etapa.

El total del presupuesto se calcula en la interfaz sumando la mano de obra y el importe de cada pieza; no se almacena como campo.

## Rutas principales

- `/`: listado de órdenes y recuentos por etapa.
- `/clientes`: directorio de clientes registrados.
- `/ordenes/nueva`: recepción de un equipo y hasta tres fotos.
- `/ordenes/:ordenId`: información, presupuesto, acciones permitidas e historial de una orden.
- `/clientes/nuevo`: registro de un cliente.
- Cualquier otra dirección muestra la página 404.

## Reglas del taller

Las etapas válidas son `solicitada`, `en_diagnostico`, `presupuestada`, `aprobada`, `en_reparacion`, `lista` y `entregada`. También existen las salidas `rechazada` y `cancelada`.

PocketBase impide saltar etapas, cancelar una orden después de iniciar el diagnóstico, cambiar órdenes cerradas, editar el presupuesto después de registrarlo y editar o borrar eventos. Cada cambio de etapa y su evento histórico se guardan dentro de una transacción. La colección limita las fotos a tres imágenes por orden.

Los formularios también verifican los datos en el servidor: el nombre admite letras y separadores habituales, el teléfono requiere ocho cifras y las descripciones, diagnósticos e importes deben cumplir longitudes y rangos razonables. La lista de clientes permite consultar los contactos guardados. El selector de tema claro/oscuro conserva la preferencia en el navegador.

## Estructura

```text
frontend/                 Interfaz React y llamadas fetch
pocketbase/pb_migrations/ Esquema y datos de demostración
pocketbase/pb_hooks/      Validaciones e historial de las órdenes
```
