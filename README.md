# Aprende Python desde cero — v2.8

Curso interactivo de **49 módulos** que va desde el primer `print()` hasta el análisis de secuencias, estructuras de proteínas y fármacos. Python se ejecuta de verdad en el navegador gracias a [Pyodide](https://pyodide.org): NumPy, pandas, SciPy, Matplotlib, Seaborn, Biopython y scikit-learn sin instalar nada, incluido un bloque completo de machine learning. TensorFlow/Keras y PyTorch no existen para el navegador: el bloque de deep learning hace en la web todo lo posible (incluido usar el modelo convolucional entrenado en clase) y trae cuadernos de Colab con el código de Keras y PyTorch. **Excepción: RDKit** (módulos 36, 37 y el Proyecto C del 38) no existe para el navegador; para esos módulos hay cuadernos de Colab en `notebooks/`.

## Cómo usarlo
1. Descomprime la carpeta completa (no saques `index.html`: necesita `css/` y `js/`).
2. Abre `index.html` en el navegador, o mejor sírvelo en local (extensión *Live Server* de VS Code, o `python -m http.server` dentro de la carpeta y abre `http://localhost:8000`). Con doble clic (`file://`) algunas APIs pueden rechazar las peticiones.
3. Necesitas internet la primera vez: Python (~10 MB) y cada librería se descargan al usarlas por primera vez.

## Temario
| Bloque | Módulos |
|---|---|
| 🌱 Fundamentos | 1 Qué es Python · 2 print y sintaxis · 3 Variables, tipos y booleanos · 4 Operadores · 5 Entrada/salida · 6 Condicionales · 7 Bucles · 8 Funciones, lambda y recursividad |
| ⚙️ Intermedio | 9 Funciones nativas · 10 Colecciones · 11 Cadenas · 12 Expresiones regulares · 13 math, random y os · 14 Excepciones · 15 Archivos |
| 🚀 Avanzado | 16 POO y herencia · 17 Comprensiones y generadores · 18 Depuración y complejidad · 19 Proyectos |
| 📊 Ciencia de datos | 20 NumPy I · 21 NumPy II (biología) · 22 SciPy · 23 pandas I · 24 pandas II (+ PyArrow/Polars) · 25 Matplotlib · 26 Seaborn (+ comparación) · 27 PIL |
| 🧬 Bioinformática | 28 Biopython: Seq y SeqUtils · 29 FASTA/FASTQ · 30 Alineamientos · 31 Estructuras PDB/mmCIF · 32 APIs I: UniProt · 33 APIs II: RCSB PDB, descargas y mapeo de IDs · 34 APIs III: PubChem, ChEMBL y ChEBI · 35 APIs IV: Entrez y cBioPortal · 36 RDKit I · 37 RDKit II · 38 Proyectos de repaso |
| 🤖 Machine learning | 39 Flujo de trabajo y regresión lineal · 40 Regresión polinómica y sobreajuste · 41 Clasificación y fronteras de decisión · 42 Evaluar clasificadores (pingüinos) · 43 Texto y redes neuronales (opiniones de Amazon y dígitos) · 44 Clustering (K-means y DBSCAN) |
| 🧠 Deep learning | 45 Redes neuronales con Keras (cáncer de mama) · 46 Redes convolucionales y el modelo de clase (con pizarra para dibujar dígitos) · 47 API funcional y HOG · 48 Imágenes propias, aumento de datos y webcam · 49 PyTorch y el bucle de entrenamiento |

## Portada y herramientas de estudio
La portada muestra los 7 bloques en pirámide (Fundamentos arriba; después Intermedio, Avanzado y Ciencia de datos; abajo Bioinformática, Machine learning y Deep learning). Cada bloque tiene su página con cinco pestañas:
- **Mapa mental**: el bloque en el centro, sus módulos y las ideas clave de cada uno; los módulos son enlaces y los completados se marcan.
- **Apuntes**: el resumen teórico de todos los módulos, sus ideas clave y sus errores habituales, imprimible o exportable a PDF.
- **Conceptos clave**: glosario con las definiciones del bloque (las de los módulos más un glosario básico) y un buscador.
- **Autoevaluación**: 10 preguntas al azar del banco del bloque, con puntuación.
- **Módulos**: la lista con tu progreso.
Cada módulo empieza con sus ideas clave y un acceso al mapa y los apuntes de su bloque.

## Atajos
`Ctrl+Enter` (o `Shift+Enter`) ejecuta la celda · `Ctrl+K` o `/` abre la búsqueda de módulos · `Alt+←` / `Alt+→` cambian de módulo · `Esc` cierra la búsqueda.

## Qué incluye cada módulo
Explicación breve · celdas editables (`Ctrl+Enter` ejecuta, `Tab` indenta) · conceptos clave · errores habituales · ejercicios con **autocorrección** (✔ Comprobar) y solución explicada con código · preguntas tipo test · resumen.

## Estructura
```
├── index.html
├── icon.svg, favicon-32.png, apple-touch-icon.png   → icono de la web
├── README.md
├── notebooks/                 → cuadernos de Colab: RDKit (36-38) y deep learning con Keras y PyTorch (45-49)
├── css/styles.css             → estilos, tema claro/oscuro
└── js/
    ├── data/
    │   ├── datasets.js         → archivos de datos del curso (disco virtual de Python)
    │   ├── modules.js          → helpers de contenido + módulos 1-18
    │   ├── modules-ciencia.js  → módulos 19-22
    │   ├── modules-bio.js      → bioinformática
    │   ├── modules-ml.js       → machine learning
    │   ├── modules-dl.js       → deep learning
    │   ├── modelo_mnist.js     → modelo convolucional de clase (se carga solo al usarlo)
    │   └── mapas.js            → ideas clave, introducciones de bloque y glosario básico
    ├── pyRunner.js             → motor Pyodide: librerías, gráficos, APIs, autocorrección
    ├── progress.js             → progreso (localStorage, exportar/importar)
    ├── estudio.js              → portada en pirámide y páginas de bloque (mapa, apuntes, glosario, test)
    └── app.js                  → navegación, búsqueda, bienvenida, certificado, tema
```

## RDKit: cuadernos de Colab
1. Entra en https://colab.research.google.com → *Archivo → Subir cuaderno* y elige uno de `notebooks/`.
2. Ejecuta todas las celdas (*Entorno de ejecución → Ejecutar todo*). La primera instala RDKit y la segunda crea los archivos de datos.
3. Cada ejercicio trae su celda de comprobación (✅ si lo has resuelto) y la solución explicada.
Funcionan igual en tu ordenador con Jupyter (`pip install rdkit seaborn`).

## Funciones de ayuda disponibles en las celdas
- `await web.get(url, params=...)` y `await web.post(url, json=... | data=...)`: sustituto de `requests` para el navegador (misma interfaz: `.status_code`, `.json()`, `.text`, `.raise_for_status()`).
- `await obtener_json(url)` y `await obtener_texto(url)`: atajos que devuelven directamente el JSON o el texto (con reintentos y errores explicados).
- `await probar_apis()`: comprueba qué servicios responden desde tu navegador.
- `await cargar_modelo_clase()`: copia al disco virtual `modelo_mnist_convol.h5` (la red convolucional entrenada en clase).
- `pizarra(al_dibujar=f)` y `leer_pizarra()`: una pizarra para dibujar dígitos; el dibujo se centra como en MNIST y se devuelve como array 28×28.
- `mostrar_molecula(mol)`, `mostrar_svg(svg)`, `mostrar_imagen(img_pil)`: visualización.
- Los gráficos de Matplotlib/Seaborn se muestran automáticamente; `input()` abre una ventana del navegador.

## Datos incluidos
`P04637.fasta` (p53), `citocromo_c.fasta`, `ejemplo2.fasta`, `ejemplo.fastq` (30 lecturas nanopore 18S), `1TUP_cadenaB.pdb` (p53-ADN, cadena B), `aspirin.mol`, `Planetas.txt`, `housing.csv` (muestra de 2000 viviendas) `heteromoleculas.csv`, `archivo.txt` (separado por `;`), `ciudades.tsv` y los datasets de seaborn `iris.csv`, `tips.csv` y `titanic.csv`.

## Limitaciones
- Las celdas con APIs necesitan conexión; si un servicio bloquea peticiones desde el navegador (CORS), usa la versión con `requests` indicada en el módulo.
- Polars, PyArrow, ChEMBL/ChEBI clients, Entrez de Biopython y Clustal se muestran como código para ejecutar en tu ordenador.

## Ampliar el curso
Cada módulo es un objeto `{id, cat, title, body}` en `js/data/`. Helpers: `codeBlock`, `staticCode`, `exercise(título, enunciado, inicial, explicación, test, solución)`, `quiz`, `tip`, `warn`, `concepto`, `resumen`, `origen`.

## Historial
- **v2.8** — Nueva portada con los 7 bloques en pirámide y una página por bloque con mapa mental (SVG generado a partir de las ideas clave de cada módulo), apuntes imprimibles, glosario con buscador, autoevaluación con puntuación y lista de módulos. Ideas clave al principio de cada módulo. Glosario básico de 24 términos para los bloques iniciales. La web arranca siempre en la portada, con un botón para continuar donde lo dejaste. Los bloques también se pueden buscar con Ctrl+K y recorrer con Alt+flechas.
- **v2.7** — Deep learning (clases 13 y 14). Nuevo bloque de 5 módulos (45-49): redes neuronales con Keras sobre cáncer de mama (con la red equivalente entrenada en el navegador), redes convolucionales con el **modelo `modelo_mnist_convol.h5` de clase** leído con h5py e implementado en NumPy (resultados idénticos a Keras, diferencia máxima 3·10⁻⁷), filtros y mapas de activación, **pizarra para dibujar dígitos** y verlos reconocer en directo, API funcional con HOG, lectura de imágenes desde ZIP y carpetas, aumento de datos, uso de modelos con la webcam y un bucle de entrenamiento de PyTorch escrito en NumPy. Cuadernos de Colab para Keras y PyTorch; el código de Keras se ha ejecutado con TensorFlow 2.17. Errores de los scripts explicados: escalado antes de separar, `np.random.seed` que no fija TensorFlow, evaluación del modelo equivocado y forma (784, 1) en el cuaderno de TensorBoard, etiqueta con `file[-5]`, ruta del ZIP sobrescrita, volteos verticales en el aumento de datos, `waitKey` doble en la webcam, capas compartidas en la API funcional, `testloader` sin usar y `train_test_split` sobre un Dataset de PyTorch.
- **v2.6** — Repaso de la clase 8 y machine learning. Módulo 31: el script de interacciones (Script5), con lo que detecta de verdad un umbral de 3,7 Å entre Cα y una alternativa con contactos no locales. Módulo 35: cBioPortal paso a paso (estudio, muestras, datos clínicos de paciente en formato ancho) y pybioportal. Módulo 38: proyectos E (PDB → UniProt → PubChem, Script1) y F (proteínas de neurodegeneración con pI y peso, Script2). Nuevo bloque de machine learning (módulos 39-44) con los scripts de regresión lineal (diabetes), regresión polinómica (California), el cuaderno de métodos supervisados (fronteras de decisión), pingüinos, opiniones de Amazon, redes neuronales con dígitos y clustering con K-means y DBSCAN. Datos añadidos: `penguins.csv` y una muestra de 3000 reseñas de `amazon_baby.csv`. Errores de los scripts explicados: listas de error de entrenamiento y prueba cruzadas, pipeline ajustado antes de separar, red neuronal con `activation='identity'` (lineal), `fit_transform` sobre datos nuevos, regresión lineal usada como clasificador, stopwords eliminadas antes de pasar a minúsculas (y la eliminación de 'not'), ejes de latitud y longitud intercambiados, rutas de archivo pegadas, `entryType` siempre verdadero, comillas anidadas en f-strings (solo válidas desde Python 3.12). Nuevo icono de la web (doble hélice) como favicon y en la barra superior.
- **v2.5** — Biopython de la clase 6 integrado (BIOPYTHON_1 a 4): validación de secuencias y `count_overlap`, GC calculado por error sobre una proteína, buscador de ORFs con la secuencia original completa y ejercicio de ORFs en las dos hebras, descarga de FASTA desde UniProt, probabilidad de error media frente a errores esperados por lectura, control de calidad tipo FastQC con 400 lecturas, árboles de distancias con `Bio.Phylo`, secuencias reales de hemoglobina e insulina desde UniProt, alineamiento múltiple real con Clustal Omega (API del EBI) y análisis completo de 1TUP (cadenas, `_mmcif_dict` frente a `MMCIF2Dict`, heteromoléculas a CSV). `1TUP.pdb`, `1TUP.cif` y `ejemplo_qc.fastq` añadidos al disco virtual. Rediseño completo con estética de IDE: explorador de archivos, pestaña, celdas con resaltado de sintaxis y numeración `In [n]` (CodeMirror), barra de estado del intérprete, paleta de comandos (Ctrl+K) que busca también dentro del contenido, portada con cromatograma de TP53, ejercicios superados que se recuerdan, tipografía IBM Plex + JetBrains Mono, paleta basada en los canales de un cromatograma y tema claro/oscuro.
- **v2.4** — Integración completa de los scripts de `clase_5` (APIs). El antiguo módulo de APIs se divide en cuatro: 32 UniProt (códigos de estado, parámetros, búsquedas y encadenado de consultas), 33 RCSB PDB (datos, búsqueda por secuencia, texto y similitud estructural, descarga de PDB/CIF al disco virtual y mapeo PDB→UniProt con sondeo del trabajo asíncrono), 34 PubChem + ChEMBL + ChEBI (los equivalentes REST de `pubchempy` y `chembl_webresource_client`) y 35 Entrez + cBioPortal. Nuevo objeto `web` (requests asíncrono con `params`, POST JSON/formulario y códigos de estado sin excepción) y ChEMBL en el diagnóstico. RDKit pasa a los módulos 36-38 y sus cuadernos se renombran. Errores de los scripts originales explicados: IDs de relleno que detienen la descarga, resultados de idmapping pedidos antes de que termine el trabajo, `CHEMBL113` etiquetado como aspirina (es cafeína), `CHEBI:17597` descrito como glucosa (es `CHEBI:17234`), consulta de Tourette con nombre y comentario de glioblastoma, SMILES sin escapar en la URL, `substance_id` que contenía un CID y mensaje copiado de otra consulta.
- **v2.3** — RDKit no existe para Python en el navegador (ni en Pyodide, ni como rueda WebAssembly), así que los módulos 33, 34 y el Proyecto C del 35 pasan a mostrar el código para Colab/tu ordenador, con un aviso claro. Se añaden 3 cuadernos `.ipynb` (instalación, datos, ejercicios con comprobación y soluciones) validados con RDKit real. Se retira la promesa de "RDKit sin instalar nada".
- **v2.2** — Capa de red más robusta para las APIs: reintentos automáticos (429/502/503/504), tiempo máximo de 25 s, mensajes de error en español que distinguen "sin conexión / CORS" de errores HTTP (404, 403...) y de respuestas que no son JSON. Nueva celda de diagnóstico `await probar_apis()` al inicio del módulo 32 que comprueba UniProt, RCSB, PubChem, Entrez y cBioPortal. PubChem: la búsqueda por fórmula ahora gestiona la respuesta "Waiting".
- **v2.1** — clase_3 y clase_4 integradas al completo. Nuevo módulo 12 de expresiones regulares (grupos, `\b`, correos, parseo de PDB con regex y gráfico 3D de la proteína). Módulo 13 ampliado (`choices` vs `sample`, `randrange`, `uniform`, gestión de archivos con `os`, media geométrica). El bloque de Ciencia de datos pasa de 4 a 8 módulos: NumPy I y II, SciPy, pandas I y II (merge, groupby, delimitadores, referencia vs copia, PyArrow y Polars), Matplotlib, Seaborn con Matplotlib vs Seaborn, y PIL con análisis de imagen como array. Datasets reales de seaborn incluidos en el disco virtual. Errores de los scripts originales explicados: `reshape` usado como trasposición, `replace=False` con más elementos de los disponibles, `plt.title` tras `pairplot`, `how='outer'` en Polars ≥ 1.0, `palette` sin `hue` en seaborn 0.13, coordenadas PDB con `split()`, variables no definidas (`current_directory`, `eleccion_con_reemplazo`).
- **v2.0** — Integración completa del material de clase (scripts 1-19, clase_3, clase_4, clase_5, Biopython clases 6-7, clase_8 repaso y clase_9 RDKit): 12 módulos nuevos (19-30) y módulos 1-18 ampliados (regex, math/random/os, herencia, complejidad algorítmica). Motor nuevo con carga automática de librerías, gráficos, `input()` real, disco virtual con datos, APIs y autocorrección. Quizzes y resúmenes en todos los módulos. Corregidos errores de los scripts originales (búsqueda binaria que llamaba a la lineal, `.c()` en RDKit, `squared=False` en scikit-learn, escalado antes del split, `%` en `ajustar_actividad`) y el botón "reiniciar" con código que contenía comillas.
- **v1.3** — Primeros refuerzos de bucles, funciones, errores y archivos; nuevo módulo de funciones nativas.
- **v1.2** — Estructura por carpetas, tema claro/oscuro, buscador, certificado, exportar/importar progreso.

Material base de los ejemplos: scripts del curso de Python del máster (profesor C. Hinojosa), adaptados y corregidos para uso educativo personal.
