// ClassLoad service worker: makes the app installable, keeps it opening offline,
// and receives push reminders from Firebase Cloud Messaging.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCVpWSIruixJD3XiZ1jhYa2enBFMdvOuNE",
  authDomain: "claoad.firebaseapp.com",
  projectId: "claoad",
  storageBucket: "claoad.firebasestorage.app",
  messagingSenderId: "269715397183",
  appId: "1:269715397183:web:954956de9c308f37fdf68a"
});
const messaging = firebase.messaging();

// Data-only messages (if any) get shown here; normal reminders are shown by Firebase itself.
messaging.onBackgroundMessage(payload => {
  if (payload.notification) return;
  const d = payload.data || {};
  self.registration.showNotification(d.title || "ClassLoad", {
    body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", tag: d.tag || "classload", data: { link: d.link || "./" }
  });
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const link = (event.notification.data && (event.notification.data.link || (event.notification.data.FCM_MSG && event.notification.data.FCM_MSG.notification && event.notification.data.FCM_MSG.notification.click_action))) || "./";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) { if ("focus" in c) return c.focus(); }
    return clients.openWindow(link);
  }));
});

// Offline: always try the network first so updates show immediately; fall back to the last copy.
const CACHE = "classload-v65";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "logo-mark.png", "logo-full.png", "favicon-64.png", "favicon-96.png", "favicon.ico"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (/\.(mp4|webm)$/i.test(new URL(req.url).pathname)) return; // videos stream straight from the network
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
});
