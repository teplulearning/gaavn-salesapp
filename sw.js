const CACHE='gaavn-v87';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.add('.')).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.hostname==='script.google.com'||u.hostname==='cdnjs.cloudflare.com')return;
  e.respondWith(caches.match(e.request).then(cached=>{
    const fresh=fetch(e.request).then(r=>{if(r&&r.status===200){const c=r.clone();caches.open(CACHE).then(ch=>ch.put(e.request,c));}return r;}).catch(()=>cached);
    return cached||fresh;
  }));
});