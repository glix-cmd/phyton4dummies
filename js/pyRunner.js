/* Motor de ejecución: Python real en el navegador con Pyodide.
   - Carga automática de librerías según los import (numpy, pandas, Bio, rdkit, sklearn...)
   - Captura de gráficos de matplotlib/seaborn
   - Archivos de datos del curso disponibles en el directorio de trabajo
   - Todas las celdas comparten el mismo espacio de nombres (como en Colab/Jupyter) */
let pyodide = null, pyodideReady = false, currentOut = null, busy = false;

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

def _capturar_figuras():
    if "matplotlib.pyplot" not in sys.modules: return
    import matplotlib.pyplot as plt
    for n in plt.get_fignums():
        fig = plt.figure(n); buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=90, bbox_inches="tight")
        js.__appendHTML('<img class="out-img" src="data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode() + '">')
    plt.close("all")
`;

function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function appendText(text, isErr=false){
  if(!currentOut) return;
  const span = document.createElement('span');
  if(isErr) span.className = 'err';
  span.textContent = text;
  currentOut.appendChild(span);
}
window.__appendHTML = html => { if(currentOut){ const d=document.createElement('div'); d.innerHTML=html; currentOut.appendChild(d);} };

function setStatus(msg, color){ const s=document.getElementById('pyStatus'); if(s){ s.textContent=msg; s.style.color=color||'var(--muted)'; } }

async function initPyodide(){
  try{
    pyodide = await loadPyodide();
    pyodide.setStdout({batched: s => appendText(s + "\n")});
    pyodide.setStderr({batched: s => appendText(s + "\n", true)});
    for(const [nombre, contenido] of Object.entries(DATASETS)) pyodide.FS.writeFile(nombre, contenido);
    await pyodide.runPythonAsync(HELPERS_PY);
    pyodideReady = true;
    setStatus('✓ Python listo', 'var(--ok)');
  }catch(e){
    console.error(e);
    setStatus('⚠ No se pudo cargar Python (revisa tu conexión). Copia el código y pruébalo en Google Colab o VS Code.', 'var(--warn)');
  }
}

async function prepararLibrerias(code){
  await pyodide.loadPackagesFromImports(code, {messageCallback: m => {}});
  if(/^\s*(import|from)\s+seaborn/m.test(code) && !pyodide.globals.get('__seaborn_ok')){
    appendText('Instalando seaborn (solo la primera vez)…\n');
    await pyodide.loadPackage('micropip');
    await pyodide.runPythonAsync('import micropip\nawait micropip.install("seaborn")\n__seaborn_ok = True');
  }
  if(/matplotlib|seaborn|\.plot\(|\.hist\(/.test(code)){
    await pyodide.loadPackage('matplotlib');
    pyodide.runPython('import matplotlib\nmatplotlib.use("agg")');
  }
}

function limpiarError(msg){
  const lineas = msg.trim().split('\n');
  // Quitar las líneas internas de Pyodide y quedarse con la parte útil del traceback
  const idx = lineas.findIndex(l => l.includes('File "<exec>"'));
  return (idx >= 0 ? lineas.slice(idx) : lineas.slice(-6)).join('\n');
}

async function ejecutar(code, out){
  currentOut = out;
  out.innerHTML = '';
  out.classList.remove('empty');
  const necesitaLibs = /^\s*(import|from)\s+(numpy|pandas|scipy|matplotlib|seaborn|Bio|rdkit|sklearn|PIL)/m.test(code);
  if(necesitaLibs) appendText('⏳ Cargando librerías (la primera vez puede tardar unos segundos)…\n');
  try{
    await prepararLibrerias(code);
    if(necesitaLibs) out.innerHTML = '';
    await pyodide.runPythonAsync(code);
    await pyodide.runPythonAsync('_capturar_figuras()');
    if(!out.hasChildNodes()) { appendText('(sin salida — usa print() para ver resultados)'); out.classList.add('empty'); }
    return true;
  }catch(e){
    appendText(limpiarError(e.message), true);
    return false;
  }
}

async function runCode(id){
  const ta = document.getElementById('ta-'+id), out = document.getElementById('out-'+id), btn = document.getElementById('run-'+id);
  if(!pyodideReady){ out.textContent = 'Python todavía se está cargando, espera unos segundos…'; return; }
  if(busy) return;
  busy = true; btn.disabled = true; btn.textContent = 'Ejecutando…';
  await ejecutar(ta.value, out);
  busy = false; btn.disabled = false; btn.textContent = '▶ Ejecutar';
}

/* Comprobación automática de ejercicios: ejecuta el código del alumno y después unas aserciones */
async function checkExercise(id){
  const ta = document.getElementById('ta-'+id), out = document.getElementById('out-'+id), res = document.getElementById('chk-'+id);
  if(!pyodideReady || busy){ res.textContent = 'Espera a que Python esté listo…'; return; }
  busy = true;
  const ok = await ejecutar(ta.value, out);
  if(!ok){ res.className='check-res bad'; res.textContent = '❌ Tu código da un error: revísalo en la salida.'; busy=false; return; }
  try{
    currentOut = null;
    await pyodide.runPythonAsync(CODE_TESTS[id]);
    res.className='check-res good'; res.textContent = '✅ ¡Correcto! El ejercicio supera todas las comprobaciones.';
  }catch(e){
    const m = e.message.trim().split('\n').pop().replace(/^AssertionError:?\s*/,'');
    res.className='check-res bad'; res.textContent = '❌ Aún no: ' + (m || 'el resultado no es el esperado.');
  }
  busy = false;
}

function resetCode(id){
  document.getElementById('ta-'+id).value = CODE_ORIG[id];
  document.getElementById('out-'+id).innerHTML = '';
  const r = document.getElementById('chk-'+id); if(r) r.textContent = '';
}

/* Editor: Tab inserta 4 espacios, Ctrl/Cmd+Enter ejecuta la celda */
document.addEventListener('keydown', e => {
  const t = e.target;
  if(!t.classList || !t.classList.contains('code')) return;
  if(e.key === 'Tab'){
    e.preventDefault();
    const s = t.selectionStart; t.setRangeText('    ', s, t.selectionEnd, 'end');
  }
  if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){
    e.preventDefault(); runCode(t.id.slice(3));
  }
});
