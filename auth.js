// auth.js (GLOBAL, production) — username/password + Rollen
// Läuft lokal (file://), kein ES-Module nötig, CORS-freundlich (text/plain).
(function(){ 
  const API_URL = 'https://script.google.com/macros/s/AKfycbxZumLM06tAzQUJymgvGpT4bAgZzLydWFjv7TMnHpCUe8t2EflCbw8fjI7kdS1oNMgTFQ/exec';
  function setRole(role){ 
    const r=(role||'guest').toLowerCase(); 
    document.documentElement.dataset.role=r; 
    document.dispatchEvent(new CustomEvent('rolechange',{detail:{role:r}}));
  }
  function saveToken(t){ try{ sessionStorage.setItem('auth_token', t); }catch{} }
  function loadToken(){ try{ return sessionStorage.getItem('auth_token'); }catch{ return null; } }
  function clearToken(){ try{ sessionStorage.removeItem('auth_token'); }catch{} }
  async function postPlain(payload){
    const res = await fetch(API_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(payload) });
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { throw new Error('Serverantwort ist kein JSON'); }
  }
  async function login(username, password){
    const data = await postPlain({ action:'login', username, password });
    if (!data.ok) throw new Error(data.error || 'login_failed');
    saveToken(data.token); setRole(data.role);
    return data;
  }
  async function session(){
    const token = loadToken();
    if (!token) { setRole('guest'); return { ok:false, role:'guest' }; }
    const data = await postPlain({ action:'session', token });
    if (data.ok) setRole(data.role); else setRole('guest');
    return data;
  }
  function logout(){ clearToken(); setRole('guest'); }
  window.Auth = { login, session, logout, setRole };
})();