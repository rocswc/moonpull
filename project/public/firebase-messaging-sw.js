importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAef74zQ50pMzYEPnjFb7QacrCFa_Z1_lg",
  authDomain: "moonpool-b2fc6.firebaseapp.com",
  projectId: "moonpool-b2fc6",
  storageBucket: "moonpool-b2fc6.appspot.com",
  messagingSenderId: "192091954185",
  appId: "1:192091954185:web:330c6b051ba21a049facd8",
});

const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log("📩 백그라운드 메시지:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});
