const STORAGE_KEY = 'py101_progress_v2';
const LAST_KEY = 'py101_last_v2';
const NAME_KEY = 'py101_name_v2';

function getProgress(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }catch(e){ return {}; } }
function setDone(modId, done){
  const p = getProgress(); p[modId] = done;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  renderNav(); updateProgressBar();
}
function countDone(){ const p = getProgress(); return MODULES.filter(m => p[m.id]).length; }
function updateProgressBar(){
  const done = countDone();
  document.getElementById('progressText').textContent = `${done} / ${MODULES.length} módulos`;
  document.getElementById('progressFill').style.width = (done/MODULES.length*100)+'%';
}

function exportProgress(){
  const data = { progress: getProgress(), name: localStorage.getItem(NAME_KEY) || '', exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'progreso-python.json';
  a.click();
}

function importProgress(file){
  const reader = new FileReader();
  reader.onload = e => {
    try{
      const data = JSON.parse(e.target.result);
      if(data.progress) localStorage.setItem(STORAGE_KEY, JSON.stringify(data.progress));
      if(data.name) localStorage.setItem(NAME_KEY, data.name);
      renderNav(); updateProgressBar(); renderMain();
    }catch(err){ alert('El archivo no es un progreso válido.'); }
  };
  reader.readAsText(file);
}
