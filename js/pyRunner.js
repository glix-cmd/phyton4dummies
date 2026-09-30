let pyodide = null, pyodideReady = false;

async function initPyodide(){
  const status = document.getElementById('pyStatus');
  try{
    pyodide = await loadPyodide();
    pyodideReady = true;
    status.textContent = '✓ Python listo';
    status.style.color = 'var(--ok)';
  }catch(e){
    status.textContent = '⚠ No se pudo cargar Python (revisa tu conexión). Copia el código y pruébalo en Google Colab.';
    status.style.color = 'var(--warn)';
  }
}

async function runCode(id){
  const ta = document.getElementById('ta-'+id);
  const out = document.getElementById('out-'+id);
  const btn = document.getElementById('run-'+id);
  if(!pyodideReady){ out.textContent = 'Python todavía se está cargando, espera unos segundos…'; out.className='output'; return; }
  btn.disabled = true; btn.textContent = 'Ejecutando…';
  out.className = 'output'; out.textContent = '';
  try{
    pyodide.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = sys.stdout
`);
    await pyodide.runPythonAsync(ta.value);
    const printed = pyodide.runPython('sys.stdout.getvalue()');
    out.textContent = printed || '(sin salida — usa print() para ver resultados)';
  }catch(e){
    out.className = 'output err';
    out.textContent = e.message.split('\n').slice(-6).join('\n');
  }
  btn.disabled = false; btn.textContent = '▶ Ejecutar';
}

function resetCode(id, original){
  document.getElementById('ta-'+id).value = original;
  document.getElementById('out-'+id).textContent = '';
}
