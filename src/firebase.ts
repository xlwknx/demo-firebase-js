import firebase from 'firebase';

firebase.initializeApp({
    apiKey: 'AIzaSyAD1fZH36Rgmc25v7RWWp8DxIHVv6EtYkU',
    authDomain: 'js-chat-ff5ca.firebaseapp.com',
    databaseURL: 'https://js-chat-ff5ca.firebaseio.com',
    projectId: 'js-chat-ff5ca',
    storageBucket: 'js-chat-ff5ca.appspot.com',
    messagingSenderId: '1054047202875',
});

firebase.firestore().settings({ timestampsInSnapshots: true })
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)