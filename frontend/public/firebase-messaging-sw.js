// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// importScripts('https://www.gstatic.com/firebasejs/9.24.0/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/9.24.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBFqDm1tctixMmmUBoAnszZ-vckiLX21M4",
  authDomain: "foodever21-7618e.firebaseapp.com",
  databaseURL: "https://foodever21-7618e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "foodever21-7618e",
  storageBucket: "foodever21-7618e.firebasestorage.app",
  messagingSenderId: "396895111065",
  appId: "1:396895111065:web:11a4ba9614c8c337b73508",
  measurementId: "G-1G8EL43NMD"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message: ', payload);
  // const notificationTitle = payload.notification.title;
  // const notificationOptions = {
  //   body: payload.notification.body,
  //   icon: payload.notification.icon,
  // };

  // self.registration.showNotification(notificationTitle, notificationOptions);
});
