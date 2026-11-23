const V='chi-bezaram-v5',IM='chi-img-v1',MAXIMG=500;
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==IM).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
async function trim(c){const k=await c.keys();if(k.length>MAXIMG)await Promise.all(k.slice(0,k.length-MAXIMG).map(x=>c.delete(x)));}
self.addEventListener('fetch',e=>{
  const q=e.request;if(q.method!=='GET')return;
  if(q.destination==='image'){
    e.respondWith(caches.open(IM).then(async c=>{const hit=await c.match(q);if(hit)return hit;
      try{const n=await fetch(q);if(n.ok||n.type==='opaque'){c.put(q,n.clone());trim(c);}return n;}catch(_){return Response.error();}}));
    return;
  }
  if(new URL(q.url).origin!==location.origin)return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(q,{ignoreSearch:true});
    const net=fetch(q).then(n=>{if(n.ok)c.put(q,n.clone());return n;}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit;}
    return (await net)||(await c.match('./index.html'))||Response.error();
  }));
});
