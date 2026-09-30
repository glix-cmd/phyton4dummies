# Aprende Python desde cero — v1.3

Curso interactivo de Python para principiantes, con Python ejecutándose de verdad en el navegador (Pyodide), sin instalar nada.

## Cómo usarlo
1. Descomprime la carpeta completa (no muevas `index.html` fuera de ella: necesita `css/` y `js/`).
2. Abre `index.html` con doble clic, o sírvelo con un servidor local (extensión "Live Server" de VS Code, o `python -m http.server` dentro de la carpeta).
3. La primera vez que ejecutes código, Python tardará unos segundos en cargar (~10 MB, requiere internet). Después funciona con normalidad.

## Estructura
```
aprende-python-v1.3/
├── index.html          → página principal
├── icon.svg            → icono de la pestaña y de la marca
├── README.md
├── css/
│   └── styles.css       → estilos, tema claro/oscuro
└── js/
    ├── data/
    │   └── modules.js    → contenido de los 17 módulos
    ├── pyRunner.js        → ejecución de Python vía Pyodide
    ├── progress.js        → guardado/exportado del progreso
    └── app.js             → navegación, búsqueda, certificado, tema
```

## Novedades v1.3
- Contenido ampliado en los módulos de Bucles, Funciones, Errores y Archivos con ejemplos y ejercicios reales de material de curso: `continue/pass/break`, funciones `lambda`, recursividad (factorial), bloque `finally`, y un patrón más completo de lectura/escritura de archivos.

## Novedades v1.2
- Reorganización en carpetas (antes era un único archivo).
- Tema claro/oscuro.
- Buscador de módulos en el menú lateral, agrupados por Fundamentos / Intermedio / Avanzado.
- Pantalla de bienvenida y certificado final imprimible.
- Exportar/importar tu progreso como archivo `.json` (útil para cambiar de ordenador).
- Navegación con las flechas del teclado (← →).

## Ampliar el curso
Para añadir o editar un módulo, edita `js/data/modules.js`: cada módulo es un objeto `{id, cat, title, body}`. Las funciones auxiliares `codeBlock()`, `tip()`, `warn()`, `note()` y `exercise()` generan el HTML de cada bloque.
