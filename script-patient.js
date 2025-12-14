document.addEventListener("DOMContentLoaded", () => {
  // === Configuration Firebase ===
  // firebase-config.js
// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDaituJimoLNpkMYvr1u4KJC8XEJgbrGZA",
  authDomain: "clinique-9f351.firebaseapp.com",
  databaseURL: "https://clinique-9f351-default-rtdb.firebaseio.com",
  projectId: "clinique-9f351",
  storageBucket: "clinique-9f351.appspot.com",
  messagingSenderId: "537502134144",
  appId: "1:537502134144:web:a7d0ba7fb48f97b2775b65"
};
  // === Initialisation Firebase ===
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const refRdv = db.ref("rendezvous");

  // === Sélection des éléments ===
  const btnReserve = document.getElementById("btnReserve");
  const nomInput = document.getElementById("nom");
  const telInput = document.getElementById("tel");
  const infoReservation = document.getElementById("infoReservation");

  // === Lors du clic sur "Réserver" ===
  btnReserve.addEventListener("click", () => {
    const nom = nomInput.value.trim();
    const tel = telInput.value.trim();

    if (!nom || !tel) {
      infoReservation.textContent = "⚠️ Veuillez remplir tous les champs.";
      infoReservation.style.color = "red";
      return;
    }

    // Lecture des rendez-vous existants
    refRdv.once("value").then(snapshot => {
      const data = snapshot.val() || {};

      // Calcul du nombre total et du nombre non traités
      const total = Object.keys(data).length;
      const nonTraites = Object.values(data).filter(p => !p.checked).length;

      // Création du nouveau rendez-vous
      const numero = total + 1;
      const date = new Date().toLocaleDateString("fr-FR");

      refRdv.push({ nom, tel, numero, date, checked: false });

      // Affichage du message clair dans la page
      infoReservation.style.color = "green";
      infoReservation.style.marginTop = "15px";
      infoReservation.style.fontWeight = "bold";
      infoReservation.innerHTML = `
        ✅ Votre numéro est <strong>${numero}</strong>.<br>
        👥 Il reste <strong>${nonTraites}</strong> patient(s) avant vous.
      `;

      // Réinitialiser les champs
      nomInput.value = "";
      telInput.value = "";
    });
  });
});

