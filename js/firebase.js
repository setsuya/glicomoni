let firebaseConfig = {
    apiKey: "AIzaSyD_FLnWb1yIySp7HtosRcP-TTOR10focq8",
    authDomain: "glicomoni-b828c.firebaseapp.com",
    databaseURL: "https://glicomoni-b828c.firebaseio.com",
    projectId: "glicomoni-b828c",
    storageBucket: "glicomoni-b828c.appspot.com",
    messagingSenderId: "881547278248",
    appId: "1:881547278248:web:e9aefe9036c71029"
};

firebase.initializeApp(firebaseConfig);

let glicomoni_db = firebase.firestore();

// glicomoni_db.enablePersistence();