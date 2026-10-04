// Service worker: muestra los avisos que manda el Worker de Cloudflare (push/worker.js).

self.addEventListener("push", event => {
  const data = event.data?.json() ?? { title: "Server de Minecraft" };
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: "mc-server",   // un aviso nuevo sustituye al anterior en vez de amontonarse
    renotify: true,
  }));
});

// Al tocar el aviso, abre la web (o la trae al frente si ya está abierta)
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async () => {
    const tabs = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const tab = tabs.find(t => t.url.startsWith(self.registration.scope));
    return tab ? tab.focus() : clients.openWindow("./");
  })());
});
