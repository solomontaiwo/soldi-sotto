import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEMCP41iugDnlcPgnj377Fgb_VqRS2TlM",
  authDomain: "soldi-sotto.firebaseapp.com",
  projectId: "soldi-sotto",
  storageBucket: "soldi-sotto.appspot.com",
  messagingSenderId: "885892536806",
  appId: "1:885892536806:web:5867dde9e0baa9bf4ede27",
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
