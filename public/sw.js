// LifeTracker service worker: shows push notifications sent via Firebase Cloud Messaging.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch {
        payload = { data: { body: event.data ? event.data.text() : '' } };
    }
    const data = payload.data || payload;

    event.waitUntil(
        self.registration.showNotification(data.title || 'LifeTracker', {
            body: data.body || '',
            icon: '/icons/icon-192.png',
            tag: data.tag || 'lifetracker',
            data: { url: data.url || '/' },
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
            for (const client of windows) {
                if ('focus' in client) return client.focus();
            }
            return self.clients.openWindow(url);
        })
    );
});
