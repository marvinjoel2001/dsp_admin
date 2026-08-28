# Documento de Requerimientos Funcionales (FRD)
## Proyecto: `dsp_admin` — Panel Administrativo y de Despacho OpenDSP

---

## 1. Información General y Propósito del Sistema

El proyecto **`dsp_admin`** es una aplicación web de clase empresarial construida sobre **React 18**, **TypeScript**, **Vite** y **Tailwind CSS**. Actúa como la torre de control y centro de operaciones para la gestión logística de despachos de última milla.

### Objetivos Clave:
1. **Monitoreo en tiempo real**: Visualización geográfica de la flota de conductores, pedidos activos y telemetría GPS.
2. **Gestión Operativa B2B**: Control exhaustivo de comercios afiliados (*tenants*), asociaciones de despacho externas (*DSP Partners*) y conductores independientes o flotistas.
3. **Despacho Dinámico y Delegación**: Asignación automatizada o manual de pedidos, con capacidad de transferir o delegar órdenes a asociaciones de mototaxistas externas asociadas.
4. **Auditoría Documental y Cumplimiento**: Validación legal de expedientes de conductores (cédulas de identidad, licencias de conducir, pólizas de SOAT y contratos mercantiles).

---

## 2. Perfiles de Usuario y Matriz de Permisos (RBAC)

La plataforma implementa Control de Acceso Basado en Roles (**RBAC**) adaptativo, cambiando la navegación, acciones e información disponible:

| Característica / Módulo | Rol: `SUPER_ADMIN` (Administrador Central) | Rol: `DSP_EXTERNAL` (Asociación de Motos / Sub-DSP) |
| :--- | :--- | :--- |
| **Alcance de Datos** | Visibilidad global de todos los pedidos, comercios, conductores y asociaciones. | Visibilidad restringida **únicamente** a sus motorizados afiliados y pedidos delegados a su asociación. |
| **Dashboard** | Métricas consolidadas de facturación global, comisiones del sistema y total de comercios. | Métricas operativas exclusivas de su flota (ingresos generados, entregas realizadas, conductores en turno). |
| **Módulo Asociaciones (`/dsp-partners`)** | Acceso total: Crear, editar, suspender asociaciones y configurar tasas de comisión. | **Oculto**. No tiene acceso ni visibilidad de otras asociaciones. |
| **Módulo Órdenes (`/orders`)** | Ver todas las órdenes del sistema, delegar a asociaciones externas y cancelar órdenes. | Ver únicamente las órdenes delegadas a su asociación, aceptarlas y asignarlas a sus conductores. |
| **Módulo Conductores (`/drivers`)** | Ver todos los conductores del ecosistema, validar documentos de cualquier conductor. | Ver solo sus conductores afiliados, dar de alta nuevos conductores para su propia asociación. |
| **Despacho en Vivo (`/dispatch`)** | Mapa global con todos los repartidores y todas las órdenes de la ciudad. | Mapa filtrado que muestra únicamente la ubicación en tiempo real de sus propios motorizados. |

---

## 3. Catálogo Detallado de Pantallas y Funcionalidades

---

### Pantalla 3.1: Inicio de Sesión (`/login`)
- **Ruta**: `/login`
- **Archivo fuente**: [`src/pages/Login.tsx`](file:///c:/Users/marvin/Documents/marvin/dsp/dsp_admin/src/pages/Login.tsx)
- **Propósito**: Autenticar a los operadores del sistema y redirigirlos según su rol asignado.
- **Componentes de Interfaz**:
  - Formulario central con campos: Correo Electrónico (`email`) y Contraseña (`password`).
  - Botón de envío: *"Iniciar Sesión"*.
  - Indicador de estado de carga (*spinner* durante la petición HTTP).
  - Alerta de error en línea en caso de credenciales inválidas.
  - Tarjeta de Credenciales de Prueba Rápidas (*Demo Cards*):
    - Super Admin: `admin` / `admin`
    - Asociación Motos: `motos@dsp.com` / `admin123`
- **Flujo y Acciones del Usuario**:
  1. El usuario ingresa sus credenciales o hace clic en una de las tarjetas de prueba para auto-completar el formulario.
  2. Al presionar *"Iniciar Sesión"*, se envía `POST /v1/auth/login` al backend.
  3. Al recibir un token JWT válido y el objeto `user`:
     - Se almacena el token en `localStorage`.
     - Si el rol es `SUPER_ADMIN`, se redirige a `/`.
     - Si el rol es `DSP_EXTERNAL`, se activa la personalización de interfaz con el badge verde *"Asociación Motos"* y se redirige a `/orders` o `/`.

---

### Pantalla 3.2: Panel Principal / Resumen Operativo (`/`)
- **Ruta**: `/`
- **Archivo fuente**: [`src/pages/Dashboard.tsx`](file:///c:/Users/marvin/Documents/marvin/dsp/dsp_admin/src/pages/Dashboard.tsx)
- **Propósito**: Brindar visibilidad de alto nivel sobre la salud operativa y financiera del sistema.
- **Componentes de Interfaz**:
  - **Banner de Bienvenida con Distintivo de Rol**: Muestra el nombre del operador y su rol (`SUPER_ADMIN` o nombre de la asociación).
  - **Tarjetas KPI Principales**:
    - *Ingresos Totales*: Monto acumulado en Bolivianos (`Bs.`).
    - *Entregas Exitosas*: Total de paquetes entregados y tasa de éxito (%).
    - *Conductores Conectados*: Cantidad de repartidores en línea en ese instante.
    - *Tiempo Promedio de Entrega*: Minutos transcurridos entre despacho y entrega.
  - **Gráfico de Rendimiento Horario**: Curva de volumen de pedidos a lo largo de las horas pico del día.
  - **Tabla de Pedidos Recientes**: Listado rápido con los últimos 5 pedidos, estado visual mediante *chips* de color y acceso directo al detalle.
- **Acciones del Usuario**:
  - Cambiar el selector de rango temporal (Hoy, Últimos 7 días, Mes actual).
  - Hacer clic en una orden para navegar a su ficha completa en `/orders`.

---

### Pantalla 3.3: Torre de Control y Despacho en Vivo (`/dispatch`)
- **Ruta**: `/dispatch`
- **Archivo fuente**: [`src/pages/LiveDispatch.tsx`](file:///c:/Users/marvin/Documents/marvin/dsp/dsp_admin/src/pages/LiveDispatch.tsx)
- **Propósito**: Coordinación táctica en tiempo real de los envíos en tránsito y ubicación satelital de los repartidores.
- **Componentes de Interfaz**:
  - **Mapa Interactivo Central**: Vista satelital/calles (Mapbox GL / Leaflet) centrado en Santa Cruz de la Sierra (-17.7833, -63.1821).
  - **Marcadores de Vehículos en Vivo**:
    - Marcador verde: Conductor libre y disponible.
    - Marcador naranja/azul: Conductor con pedido asignado / en ruta.
    - Marcador gris: Conductor inactivo.
  - **Panel Lateral de Órdenes Pendientes**:
    - Tarjetas de órdenes en estado `SEARCHING_DRIVER` o `CREATED`.
    - Datos clave: Comercio remitente, dirección de entrega, distancia estimada y ganancia.
    - Botón *"Despachar Inmediatamente"* o *"Asignar Manualmente"*.
- **Acciones del Usuario**:
  - Hacer clic sobre un conductor en el mapa para ver su ficha: Nombre, batería, velocidad actual, teléfono y orden que transporta.
  - Arrastrar o seleccionar un pedido pendiente y asignarlo a un conductor cercano que se encuentre libre.

---

### Pantalla 3.4: Gestión y Auditoría de Órdenes (`/orders`)
- **Ruta**: `/orders`
- **Archivo fuente**: [`src/pages/Orders.tsx`](file:///c:/Users/marvin/Documents/marvin/dsp/dsp_admin/src/pages/Orders.tsx)
- **Propósito**: Control del ciclo de vida de los pedidos, reasignaciones y delegación a terceros.
- **Componentes de Interfaz**:
  - **Barra de Herramientas y Filtros**:
    - Búsqueda por ID de orden, referencia de comercio o dirección.
    - Filtro por estado: *Todos, Creado, Asignado, En Recogida, En Tránsito, Entregado, Cancelado*.
    - Selector de asociación delegada (solo visible para `SUPER_ADMIN`).
  - **Tabla de Pedidos**: Columnas con ID, Comercio, Repartidor asignado, Dirección de entrega, Tarifa (Bs.), Estado y Acciones.
  - **Modal de Delegación de Pedido a Asociación Externa**:
    - Desplegable con las Asociaciones DSP registradas (ej. *"Asociación de Motos Santa Cruz"*).
    - Campo opcional de notas de despacho.
    - Botón de confirmación: *"Confirmar Delegación"*.
- **Acciones del Usuario**:
  - **Delegar Orden (`SUPER_ADMIN`)**: Presionar el botón *"Delegar"* en una orden no asignada, seleccionar la asociación receptora y confirmar. Esto actualiza `delegatedDspId` en la base de datos y transfiere la responsabilidad a dicha entidad.
  - **Aceptar Orden Delegada (`DSP_EXTERNAL`)**: La asociación ve el pedido en su bandeja y puede aceptarlo para asignarlo a uno de sus propios conductores.
  - **Cancelar Orden**: Permite anular una orden con motivo documentado.

---

### Pantalla 3.5: Directorio y Auditoría de Conductores (`/drivers`)
- **Ruta**: `/drivers`
- **Archivo fuente**: [`src/pages/Drivers.tsx`](file:///c:/Users/marvin/Documents/marvin/dsp/dsp_admin/src/pages/Drivers.tsx)
- **Propósito**: Gestión del personal de reparto, aprobación de expedientes y registro rápido.
- **Componentes de Interfaz**:
  - **Botón Destacado**: `+ Registrar Conductor`.
  - **Buscador**: Filtrado en tiempo real por nombre, CI, teléfono o placa de vehículo.
  - **Tabla de Repartidores**:
    - Conductor (Avatar, nombre, correo).
    - Teléfono y Cédula (CI).
    - Vehículo y Placa.
    - Asociación afiliada (Badge distintivo).
    - Estado de Conexión (En Línea / Desconectado).
    - Saldo en Billetera (`Bs.`).
    - Estado Documental (`VERIFIED`, `PENDING_REVIEW`, `REJECTED`).
  - **Modal de Auditoría de Documentos**:
    - Muestra miniaturas interactivas de: Cédula de Identidad (anverso/reverso), Licencia de Conducir, SOAT vigente, Foto del Vehículo y Firma de Contrato.
    - Visualizador de imágenes en pantalla completa.
    - Botones de acción: *"Aprobar Expediente"* (pasa a `ACTIVE`) o *"Rechazar"* (con ingreso de motivo).
  - **Modal Flotante de Registro Rápido de Conductor**:
    - Campos: Nombre Completo, Teléfono, Correo Electrónico, Contraseña inicial, Tipo de Vehículo (Moto / Auto / Bici), Número de Placa y Asociación asignada (preseleccionada si es `DSP_EXTERNAL`).
    - Envío vía `POST /v1/drivers/admin-create`.
- **Acciones del Usuario**:
  - Abrir el modal de registro y dar de alta un motorizado en menos de 1 minuto sin que requiera pasar por el onboarding de la app móvil.
  - Auditar y autorizar los documentos subidos por un conductor que se registró desde la app.

---

### Pantalla 3.6: Gestión de Asociaciones DSP y Flotas Externas (`/dsp-partners`)
- **Ruta**: `/dsp-partners`
- **Archivo fuente**: [`src/pages/DspPartners.tsx`](file:///c:/Users/marvin/Documents/marvin/dsp/dsp_admin/src/pages/DspPartners.tsx)
- **Propósito**: Módulo exclusivo para `SUPER_ADMIN` para dar de alta y fiscalizar a empresas de transporte o asociaciones de motos aliadas.
- **Componentes de Interfaz**:
  - **Botón de Acción**: `+ Registrar Nueva Asociación`.
  - **Tarjetas / Tabla de Asociaciones**:
    - Nombre / Razón Social (ej. *"Asociación de Mototaxis El Torno"*).
    - Identificador Fiscal / NIT.
    - Persona de Contacto, Teléfono y Correo de acceso.
    - Conductores Afiliados (Contador en vivo).
    - Pedidos Completados y Comisión de Plataforma (%).
    - Interruptor de Estado (Activa / Suspendida).
  - **Modal de Alta / Edición de Asociación**:
    - Formulario con datos de la empresa y creación del usuario de acceso con rol `DSP_EXTERNAL`.
- **Acciones del Usuario**:
  - Crear una nueva asociación y generar las credenciales para que su líder o despachador ingrese a su panel propio.
  - Ajustar comisiones pactadas y auditar el volumen de órdenes despachadas.

---

## 4. Reglas de Negocio y Flujos Operativos

1. **Aislamiento de Información (Tenancy de Asociación)**:
   - Un usuario con rol `DSP_EXTERNAL` nunca puede ver pedidos, métricas ni conductores que no le hayan sido expresamente asignados o delegados.
2. **Ciclo de Vida de la Delegación**:
   - `SUPER_ADMIN` delega pedido ➔ Estado pasa a `DELEGATED` ➔ `DSP_EXTERNAL` lo recibe en su feed ➔ Lo asigna a un conductor de su asociación ➔ El conductor lo acepta en la app móvil ➔ El pedido concluye su entrega normal.
3. **Validación Previa al Despacho**:
   - Ningún conductor puede ser seleccionado para un pedido si su estado documental no es `VERIFIED` y su cuenta no está `ACTIVE`.

---

## 5. Requisitos No Funcionales y Tecnológicos

- **Framework**: React 18.3, Vite 6, TypeScript 5.
- **Estilos**: Tailwind CSS 3.4 con diseño responsivo para pantallas de escritorio (1080p, 2K) y laptops de despacho.
- **Iconografía**: `lucide-react`.
- **Consumo API**: Axios / Fetch con interceptores para inyección automática del token Bearer JWT y refresco de sesión ante errores 401.
