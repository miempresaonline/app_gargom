# Historial de Versiones - Gargom ERP

Este archivo registra todos los cambios realizados en el proyecto. 
Sigue el versionado semántico (MAYOR.MENOR.PARCHE):
- **MAYOR**: Cambios muy grandes, rediseños completos o nuevas características masivas.
- **MENOR**: Nuevas funcionalidades o mejoras de tamaño medio.
- **PARCHE**: Pequeñas correcciones de errores, ajustes visuales o cambios menores.

## v1.4.0 (20 Mayo 2026)
* **Accesibilidad y UX (MENOR)**: Mejoras globales en la accesibilidad de la aplicación. Se han añadido estilos de focus-visible, anillos de enfoque (focus rings) al navegar con tabulador, navegación por teclado mejorada y *smooth scrolling*.
* **Transiciones Espaciales (PARCHE)**: Se ha implementado `AnimatePresence` de Framer Motion en el Layout principal para tener transiciones suaves (fade-in, slide) al cambiar de página entre las diferentes vistas.

## v1.3.0 (29 Abril 2026)
* **Funcionalidad (MENOR)**: El "Panel Principal" se ha rediseñado con un Dashboard Analítico interactivo. Ahora incluye un gráfico de barras comparando "Presupuesto vs Gastos" por cada obra y un gráfico circular interactivo para la distribución de los gastos, todo con estilo Glassmorphism (Recharts + Framer Motion).
* **Funcionalidad (MENOR)**: Nuevo botón en Certificaciones para "Generar Documento (PDF)". Crea en un clic un PDF corporativo ultra-premium con cálculos de IVA, firma, marca de agua y diseño limpio listo para enviar al cliente.

## v1.2.0 (29 Abril 2026)
* **Mejora Visual (MENOR)**: Se ha implementado un nuevo diseño con animaciones premium para la lista de gastos y obras. Las tarjetas ahora tienen efectos "hover" tridimensionales, sombras acentuadas ("Liquid Glass") y gradientes.
* **Animación de Escáner IA (PARCHE)**: Se ha sustituido el simple círculo de carga al leer facturas por una animación de "escáner láser" muy moderna con Framer Motion, que da mucho más feedback visual mientras la IA piensa.
* **Fix IA (PARCHE)**: Actualizado el modelo de Groq a `meta-llama/llama-4-scout-17b-16e-instruct` para que vuelva a funcionar la lectura de facturas.

## v1.1.0 (29 Abril 2026)
* **Funcionalidad (MENOR)**: Añadidos buscadores y selectores de ordenación en todas las secciones principales (Personal, Bancos, Proveedores, Usuarios, Obras y Gastos).
* **Funcionalidad (MENOR)**: Añadidos campos detallados de contacto (correo y teléfono) para Cliente, Arquitecto y Aparejador en la sección de Obras.

## v1.0.0
* **Lanzamiento (MAYOR)**: Versión inicial estable del sistema ERP Gargom.
