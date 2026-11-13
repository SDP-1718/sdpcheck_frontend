self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
function notificationPath(payload) {
  const data = payload.data || {};
  const candidate = data.url || data.link || (payload.fcmOptions && payload.fcmOptions.link);
  if (candidate) {
    try {
      const url = new URL(candidate, self.location.origin);
      if (url.origin === self.location.origin && /^\/(home|notices(?:\/[^/]+)?|schedule|mypage)$/.test(url.pathname)) return url.pathname;
    } catch { /* Invalid links fall back to home. */ }
    return '/home';
  }
  return data.noticeId ? '/notices/' + encodeURIComponent(data.noticeId) : '/home';
}
self.addEventListener('notificationclick', event => {
  const payload = event.notification.data && event.notification.data.FCM_MSG;
  const path = payload ? notificationPath(payload) : event.notification.data && event.notification.data.sdpPath;
  if (!path) return;
  event.stopImmediatePropagation();
  event.notification.close();
  const url = new URL(path, self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    const existing = windows.find(client => new URL(client.url).origin === self.location.origin);
    if (existing) { await existing.navigate(url); await existing.focus(); }
    else await self.clients.openWindow(url);
  })());
});
importScripts('https://www.gstatic.com/firebasejs/13.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.3.0/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey: 'AIzaSyDftdylYTDFk3DxE6tTe5ADgZzN9wVyXko',
  authDomain: 'sdp-check.firebaseapp.com',
  projectId: 'sdp-check',
  storageBucket: 'sdp-check.firebasestorage.app',
  messagingSenderId: '495514567691',
  appId: '1:495514567691:web:601e910ee0872f3ba9b30e'
});
firebase.messaging().onBackgroundMessage(payload => {
  // FCM already displays messages containing a notification payload.
  if (payload.notification) return;
  const data = payload.data || {};
  return self.registration.showNotification(data.title || 'SDP-Check', {
    body: data.body || '새 알림이 도착했어요.',
    icon: '/icons/icon-192.png',
    tag: payload.messageId || undefined,
    data: {sdpPath: notificationPath(payload)}
  });
});
