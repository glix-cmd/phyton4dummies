/* Motor de ejecución: Python real en el navegador con Pyodide.
   - Carga automática de librerías según los import (numpy, pandas, Bio, sklearn...)
   - Editor con resaltado (CodeMirror 5) y numeración de ejecuciones al estilo Jupyter
   - Captura de gráficos de matplotlib/seaborn y archivos de datos del curso en el disco virtual
   - Todas las celdas comparten el mismo espacio de nombres (como en Colab/Jupyter) */
let pyodide = null, pyodideReady = false, currentOut = null, busy = false, execCount = 0;
const EDITORS = {};

const HELPERS_PY = `
import sys, io, base64, builtins, json, warnings, asyncio
import js
warnings.filterwarnings("ignore")

def _input(msg=""):
    r = js.prompt(str(msg))
    r = "" if r is None else str(r)
    print(f"{msg}{r}")
    return r
builtins.input = _input

def mostrar_svg(svg):
    """Muestra un dibujo SVG (por ejemplo, una molécula de RDKit) en la salida."""
    js.__appendHTML(f'<div class="out-img">{svg}</div>')

def mostrar_imagen(img):
    """Muestra una imagen de PIL en la salida."""
    buf = io.BytesIO(); img.save(buf, format="PNG")
    js.__appendHTML('<img class="out-img" src="data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode() + '">')

def mostrar_molecula(mol, ancho=320, alto=220, leyenda=""):
    """Dibuja una molécula de RDKit como SVG."""
    from rdkit.Chem.Draw import rdMolDraw2D
    d = rdMolDraw2D.MolDraw2DSVG(ancho, alto)
    d.DrawMolecule(mol, legend=leyenda); d.FinishDrawing()
    mostrar_svg(d.GetDrawingText())

_ESTADOS = {400: "petición mal formada", 401: "requiere autenticación", 403: "acceso denegado", 404: "no encontrado (¿ID mal escrito?)",
            414: "URL demasiado larga", 429: "demasiadas peticiones: espera unos segundos", 500: "error interno del servidor",
            502: "pasarela caída", 503: "servicio no disponible o en mantenimiento", 504: "tiempo de espera del servidor agotado"}

async def _pedir(url, metodo="GET", datos=None, intentos=3, timeout=25, formulario=None, tolerante=False, cabeceras=None):
    """Petición con reintentos, tiempo máximo y mensajes de error comprensibles."""
    import asyncio
    from pyodide.http import pyfetch
    opciones = {"method": metodo, "headers": {"Accept": "application/json, text/plain, */*"}}
    if datos is not None:
        opciones["body"] = json.dumps(datos)
        opciones["headers"]["Content-Type"] = "application/json"
    if formulario is not None:
        from urllib.parse import urlencode
        opciones["body"] = urlencode(formulario)
        opciones["headers"]["Content-Type"] = "application/x-www-form-urlencoded"
    if cabeceras:
        opciones["headers"].update(cabeceras)
    ultimo = None
    for i in range(intentos):
        try:
            try: opciones["signal"] = js.AbortSignal.timeout(timeout * 1000)
            except Exception: pass
            r = await pyfetch(url, **opciones)
        except Exception as e:
            motivo = str(e).split("\\n")[0][:90]
            ultimo = ConnectionError("No se pudo contactar con el servidor (" + motivo + "). Causas posibles: sin internet, el servicio "
                                     "bloquea peticiones desde el navegador (CORS) o está caído. Prueba await probar_apis() y, "
                                     "si persiste, usa la versión con requests en tu ordenador.")
        else:
            if r.status in (429, 502, 503, 504) and i < intentos - 1:
                await asyncio.sleep(1.5 * (i + 1)); continue
            if not r.ok and not tolerante:
                raise ConnectionError(f"HTTP {r.status} ({_ESTADOS.get(r.status, 'error')}) al consultar {url}")
            return r
        if i < intentos - 1: await asyncio.sleep(1.5 * (i + 1))
    raise ultimo

async def obtener_json(url, metodo="GET", datos=None):
    """Equivalente en el navegador a requests.get(url).json() / requests.post(url, json=datos).json()"""
    r = await _pedir(url, metodo, datos)
    try:
        return await r.json()
    except Exception:
        raise ValueError(f"La respuesta de {url} no es JSON válido (¿falta .json o el formato en la URL?)")

async def obtener_texto(url):
    """Equivalente a requests.get(url).text"""
    r = await _pedir(url)
    return await r.string()

import urllib.parse as _up
_json = json

class Respuesta:
    """Imita a requests.Response: .status_code, .ok, .text, .json(), .raise_for_status()"""
    def __init__(self, status, texto, url):
        self.status_code, self.text, self.url = status, texto, url
        self.ok = 200 <= status < 300
    def json(self):
        try:
            return _json.loads(self.text)
        except Exception:
            raise ValueError(f"La respuesta (HTTP {self.status_code}) no es JSON válido")
    def raise_for_status(self):
        if not self.ok:
            raise ConnectionError(f"HTTP {self.status_code} ({_ESTADOS.get(self.status_code, 'error')}) al consultar {self.url}")
    def __repr__(self):
        return f"<Respuesta [{self.status_code}]>"

class _Web:
    """requests para el navegador (asíncrono): response = await web.get(url, params={...})"""
    async def get(self, url, params=None, headers=None):
        if params:
            url += ("&" if "?" in url else "?") + _up.urlencode(params)
        r = await _pedir(url, tolerante=True, cabeceras=headers)
        return Respuesta(r.status, await r.string(), url)
    async def post(self, url, json=None, data=None, headers=None):
        r = await _pedir(url, "POST", json, formulario=data, tolerante=True, cabeceras=headers)
        return Respuesta(r.status, await r.string(), url)
web = _Web()

async def probar_apis():
    """Comprueba qué servicios responden desde tu navegador y cuánto tardan."""
    import time
    pruebas = [("UniProt", "https://rest.uniprot.org/uniprotkb/P04637.json"),
               ("RCSB PDB (datos)", "https://data.rcsb.org/rest/v1/core/entry/1TUP"),
               ("RCSB PDB (archivos)", "https://files.rcsb.org/header/1TUP.pdb"),
               ("PubChem", "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/aspirin/cids/JSON"),
               ("NCBI Entrez", "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/einfo.fcgi?db=pubmed&retmode=json"),
               ("cBioPortal", "https://www.cbioportal.org/api/studies/brca_tcga"),
               ("ChEMBL", "https://www.ebi.ac.uk/chembl/api/data/molecule/CHEMBL25.json")]
    ok = 0
    for nombre, url in pruebas:
        t = time.time()
        try:
            r = await _pedir(url, intentos=1, timeout=15)
            print(f"✅ {nombre:20s} HTTP {r.status}  {time.time() - t:.1f} s"); ok += 1
        except Exception as e:
            print(f"❌ {nombre:20s} {str(e)[:150]}")
    print(f"\\n{ok}/{len(pruebas)} servicios accesibles.")
    if ok == 0:
        print("Ninguno responde: revisa tu conexión, o abre la web con un servidor local (http://localhost) en vez de doble clic en el archivo.")

# ---------- Deep learning: modelo de clase y pizarra ----------
async def cargar_modelo_clase(ruta="modelo_mnist_convol.h5"):
    """Copia al disco virtual el modelo convolucional entrenado en clase (Keras 2.10, formato .h5)."""
    import base64, os
    if not os.path.exists(ruta):
        await js.__cargarScript("js/data/modelo_mnist.js")
        with open(ruta, "wb") as f:
            f.write(base64.b64decode(str(js.MODELO_MNIST_H5)))
    print(f"Modelo disponible en '{ruta}' ({os.path.getsize(ruta) / 1e6:.1f} MB)")
    return ruta

def centrar_mnist(a):
    """Recorta el trazo, lo encaja en 20x20 y lo centra por su centro de masa en 28x28, como en MNIST."""
    import numpy as np
    from PIL import Image
    ys, xs = np.nonzero(a > 0.1)
    if len(ys) == 0:
        return np.zeros((28, 28), dtype="float32")
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = a.shape
    escala = 20 / max(h, w)
    im = Image.fromarray((a * 255).astype("uint8")).resize((max(1, round(w * escala)), max(1, round(h * escala))), Image.LANCZOS)
    r = np.asarray(im, dtype="float32") / 255
    lienzo = np.zeros((28, 28), dtype="float32")
    y0, x0 = (28 - r.shape[0]) // 2, (28 - r.shape[1]) // 2
    lienzo[y0:y0 + r.shape[0], x0:x0 + r.shape[1]] = r
    yy, xx = np.indices(lienzo.shape)
    masa = lienzo.sum()
    dy, dx = int(round(14 - (yy * lienzo).sum() / masa)), int(round(14 - (xx * lienzo).sum() / masa))
    return np.roll(np.roll(lienzo, dy, axis=0), dx, axis=1)

def imagen_de_pizarra(data_url=None, centrar=True):
    """Devuelve el dibujo de la pizarra como array 28x28 con valores entre 0 y 1."""
    import base64, io
    import numpy as np
    from PIL import Image
    url = data_url or js.__ultimaPizarra()
    if not url:
        raise ValueError("Primero ejecuta pizarra() y dibuja un dígito")
    im = Image.open(io.BytesIO(base64.b64decode(str(url).split(",")[1]))).convert("L")
    a = np.asarray(im, dtype="float32") / 255
    return centrar_mnist(a) if centrar else np.asarray(im.resize((28, 28)), dtype="float32") / 255

leer_pizarra = imagen_de_pizarra
_pizarras = {"n": 0}

def pizarra(al_dibujar=None):
    """Muestra una pizarra para dibujar. Si se pasa al_dibujar(img28) se llama al terminar cada trazo y su texto/HTML se muestra al lado."""
    from pyodide.ffi import create_proxy
    _pizarras["n"] += 1
    pid = "pizarra" + str(_pizarras["n"])
    js.__appendHTML('<div class="pizarra" id="' + pid + '"></div>')
    cb = None
    if al_dibujar is not None:
        def _cb(url):
            try:
                return str(al_dibujar(imagen_de_pizarra(url)))
            except Exception as e:
                return "<span class='err'>" + type(e).__name__ + ": " + str(e) + "</span>"
        cb = create_proxy(_cb)
    js.__iniciarPizarra(pid, cb)

def _capturar_figuras():
    if "matplotlib.pyplot" not in sys.modules: return
    import matplotlib.pyplot as plt
    for n in plt.get_fignums():
        fig = plt.figure(n); buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=90, bbox_inches="tight")
        js.__appendHTML('<img class="out-img" src="data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode() + '">')
    plt.close("all")
`;

function appendText(text, isErr=false){
  if(!currentOut) return;
  const span = document.createElement('span');
  if(isErr) span.className = 'err';
  span.textContent = text;
  currentOut.appendChild(span);
}
window.__appendHTML = html => { if(currentOut){ const d = document.createElement('div'); d.innerHTML = html; currentOut.appendChild(d); } };

/* Estado del intérprete en la barra de estado: loading | ready | busy | error */
function setStatus(msg, estado){
  const s = document.getElementById('pyStatus'), dot = document.getElementById('kernelDot');
  if(s) s.textContent = msg;
  if(dot) dot.className = 'dot ' + (estado || 'loading');
}

async function initPyodide(){
  try{
    if(typeof loadPyodide === 'undefined') throw new Error('Pyodide no disponible');
    pyodide = await loadPyodide();
    pyodide.setStdout({batched: s => appendText(s + "\n")});
    pyodide.setStderr({batched: s => appendText(s + "\n", true)});
    for(const [nombre, contenido] of Object.entries(DATASETS)) pyodide.FS.writeFile(nombre, contenido);
    await pyodide.runPythonAsync(HELPERS_PY);
    pyodideReady = true;
    setStatus('Python listo', 'ready');
  }catch(e){
    console.error(e);
    setStatus('Python no se pudo cargar: revisa la conexión y recarga la página', 'error');
  }
}

async function prepararLibrerias(code){
  await pyodide.loadPackagesFromImports(code, {messageCallback: m => {}});
  if(/^\s*(import|from)\s+seaborn/m.test(code) && !pyodide.globals.get('__seaborn_ok')){
    appendText('Instalando seaborn (solo la primera vez)…\n');
    await pyodide.loadPackage('micropip');
    await pyodide.runPythonAsync('import micropip\nawait micropip.install("seaborn")\n__seaborn_ok = True');
  }
  if(/pizarra|cargar_modelo_clase|centrar_mnist/.test(code)){
    await pyodide.loadPackage(['numpy', 'pillow', 'h5py']);
  }
  if(/matplotlib|seaborn|\.plot\(|\.hist\(|Phylo\.draw/.test(code)){
    await pyodide.loadPackage('matplotlib');
    pyodide.runPython('import matplotlib\nmatplotlib.use("agg")');
  }
}

function limpiarError(msg){
  const lineas = msg.trim().split('\n');
  const idx = lineas.findIndex(l => l.includes('File "<exec>"'));
  return (idx >= 0 ? lineas.slice(idx) : lineas.slice(-6)).join('\n');
}

async function ejecutar(code, out){
  currentOut = out;
  out.innerHTML = '';
  out.classList.remove('empty');
  const necesitaLibs = /^\s*(import|from)\s+(numpy|pandas|scipy|matplotlib|seaborn|Bio|sklearn|PIL)/m.test(code);
  if(necesitaLibs) appendText('Cargando librerías (la primera vez puede tardar unos segundos)…\n');
  try{
    await prepararLibrerias(code);
    if(necesitaLibs) out.innerHTML = '';
    await pyodide.runPythonAsync(code);
    await pyodide.runPythonAsync('_capturar_figuras()');
    if(!out.hasChildNodes()){ appendText('(sin salida: usa print() para ver resultados)'); out.classList.add('empty'); }
    return true;
  }catch(e){
    appendText(limpiarError(e.message), true);
    return false;
  }
}

/* ---------- Pizarra para dibujar dígitos y carga diferida de recursos ---------- */
window.__ultimaPizarraId = null;
window.__cargarScript = src => new Promise((ok, ko) => {
  if(document.querySelector(`script[data-src="${src}"]`)) return ok(true);
  const s = document.createElement('script'); s.src = src; s.dataset.src = src;
  s.onload = () => ok(true); s.onerror = () => ko(new Error('No se pudo cargar ' + src));
  document.head.appendChild(s);
});
window.__iniciarPizarra = (id, cb) => {
  const cont = document.getElementById(id); if(!cont) return;
  cont.innerHTML = `<div class="pz-area"><canvas width="280" height="280" aria-label="Pizarra para dibujar un dígito"></canvas>
    <div class="pz-res">Dibuja un dígito del 0 al 9 con el ratón o el dedo.</div></div>
    <div class="pz-bar"><button class="btn" data-a="borrar">Borrar</button><span class="pz-hint">Trazo blanco sobre fondo negro, como las imágenes de MNIST</span></div>`;
  const cv = cont.querySelector('canvas'), ctx = cv.getContext('2d'), res = cont.querySelector('.pz-res');
  if(!ctx){ res.textContent = 'Tu navegador no permite dibujar en un canvas.'; return; }
  const limpiar = () => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height); };
  limpiar();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  cv.style.touchAction = 'none';
  let dibujando = false, ultimo = null;
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
  cv.addEventListener('pointerdown', e => {
    dibujando = true; ultimo = pos(e); cv.setPointerCapture(e.pointerId);
    ctx.beginPath(); ctx.arc(ultimo[0], ultimo[1], 10, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  });
  cv.addEventListener('pointermove', e => {
    if(!dibujando) return;
    const p = pos(e); ctx.beginPath(); ctx.moveTo(ultimo[0], ultimo[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); ultimo = p;
  });
  const fin = () => {
    if(!dibujando) return;
    dibujando = false; window.__ultimaPizarraId = id;
    if(cb){ try{ res.innerHTML = cb(cv.toDataURL('image/png')); }catch(err){ res.textContent = 'Error: ' + err.message; } }
  };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => cv.addEventListener(ev, fin));
  cont.querySelector('[data-a=borrar]').addEventListener('click', () => { limpiar(); res.textContent = 'Dibuja un dígito del 0 al 9 con el ratón o el dedo.'; });
  window.__ultimaPizarraId = id;
};
window.__ultimaPizarra = () => {
  const c = window.__ultimaPizarraId && document.querySelector('#' + window.__ultimaPizarraId + ' canvas');
  return c ? c.toDataURL('image/png') : null;
};

/* ---------- Editores ---------- */
function getCode(id){ return EDITORS[id] ? EDITORS[id].getValue() : document.getElementById('ta-'+id).value; }
function setCode(id, v){ if(EDITORS[id]) EDITORS[id].setValue(v); else document.getElementById('ta-'+id).value = v; }

function initEditors(root){
  for(const k of Object.keys(EDITORS)) delete EDITORS[k];
  const conCM = typeof window.CodeMirror === 'function';
  root.querySelectorAll('textarea.code').forEach(ta => {
    if(!conCM) return;
    const id = ta.id.slice(3);
    const ejecutarCelda = () => runCode(id);
    EDITORS[id] = CodeMirror.fromTextArea(ta, {
      mode: 'python', theme: 'genoma', lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false,
      matchBrackets: true, viewportMargin: Infinity, lineWrapping: false,
      extraKeys: {
        'Ctrl-Enter': ejecutarCelda, 'Cmd-Enter': ejecutarCelda, 'Shift-Enter': ejecutarCelda,
        'Tab': cm => cm.somethingSelected() ? cm.indentSelection('add') : cm.replaceSelection('    ', 'end'),
        'Shift-Tab': cm => cm.indentSelection('subtract'),
        'Esc': cm => cm.getInputField().blur(),
      },
    });
  });
  if(conCM && CodeMirror.runMode){
    root.querySelectorAll('pre.hl').forEach(pre => {
      const texto = pre.textContent; pre.textContent = '';
      CodeMirror.runMode(texto, 'python', pre);
      pre.classList.add('cm-s-genoma');
    });
  }
}

function etiquetaEjecucion(id){
  execCount++;
  const lab = document.getElementById('in-'+id);
  if(lab){ lab.textContent = `In [${execCount}]`; lab.classList.add('ran'); }
  const sb = document.getElementById('sbExec');
  if(sb) sb.textContent = `${execCount} ${execCount === 1 ? 'celda ejecutada' : 'celdas ejecutadas'}`;
}

async function runCode(id){
  const out = document.getElementById('out-'+id), btn = document.getElementById('run-'+id);
  const celda = out.closest('.cell');
  if(!pyodideReady){ out.classList.remove('empty'); out.textContent = 'Python todavía se está cargando: espera a que la barra de estado diga "Python listo".'; return; }
  if(busy) return;
  busy = true; celda.classList.add('running'); setStatus('Ejecutando…', 'busy');
  if(btn) btn.disabled = true;
  etiquetaEjecucion(id);
  await ejecutar(getCode(id), out);
  busy = false; celda.classList.remove('running'); setStatus('Python listo', 'ready');
  if(btn) btn.disabled = false;
}

/* Comprobación automática de ejercicios: ejecuta el código del alumno y después unas aserciones */
async function checkExercise(id){
  const out = document.getElementById('out-'+id), res = document.getElementById('chk-'+id);
  if(!pyodideReady || busy){ res.className = 'check-res bad'; res.textContent = 'Espera a que Python esté listo.'; return; }
  busy = true; setStatus('Comprobando…', 'busy');
  etiquetaEjecucion(id);
  const ok = await ejecutar(getCode(id), out);
  if(!ok){
    res.className = 'check-res bad'; res.textContent = 'Tu código da un error: revísalo en la salida.';
  }else{
    try{
      currentOut = null;
      await pyodide.runPythonAsync(CODE_TESTS[id]);
      res.className = 'check-res good'; res.textContent = 'Superado: el ejercicio pasa todas las comprobaciones.';
      if(typeof marcarEjercicio === 'function') marcarEjercicio(out.closest('.exercise'));
    }catch(e){
      const m = e.message.trim().split('\n').pop().replace(/^AssertionError:?\s*/, '');
      res.className = 'check-res bad'; res.textContent = 'Aún no: ' + (m || 'el resultado no es el esperado.');
    }
  }
  busy = false; setStatus('Python listo', 'ready');
}

function resetCode(id){
  setCode(id, CODE_ORIG[id]);
  document.getElementById('out-'+id).innerHTML = '';
  const r = document.getElementById('chk-'+id); if(r){ r.textContent = ''; r.className = 'check-res'; }
}

/* Sin CodeMirror (sin conexión al CDN): Tab inserta 4 espacios y Ctrl/Cmd+Enter ejecuta en el textarea */
document.addEventListener('keydown', e => {
  const t = e.target;
  if(!t.classList || !t.classList.contains('code')) return;
  if(e.key === 'Tab'){ e.preventDefault(); const s = t.selectionStart; t.setRangeText('    ', s, t.selectionEnd, 'end'); }
  if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); runCode(t.id.slice(3)); }
});
