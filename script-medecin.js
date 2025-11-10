import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBIrVOglgZALaaK6IwPwqHMiynBGD4Z3JM",
  authDomain: "mohammedi-cabinet.firebaseapp.com",
  databaseURL: "https://mohammedi-cabinet-default-rtdb.firebaseio.com",
  projectId: "mohammedi-cabinet",
  storageBucket: "mohammedi-cabinet.firebasestorage.app",
  messagingSenderId: "666383356275",
  appId: "1:666383356275:web:09de11f9dfa2451d843506",
  measurementId: "G-VT06BFXNP1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
getAnalytics(app);

// -------------------------------
// عناصر الصفحة
// -------------------------------
const loginCard = document.getElementById("loginCard");
const medContent = document.getElementById("medContent");
const btnLogin = document.getElementById("btnLogin");
const mdpInput = document.getElementById("mdpMedecin");
const loginError = document.getElementById("loginError");
const btnAdd = document.getElementById("btnAdd");
const nomAdd = document.getElementById("nomAdd");
const telAdd = document.getElementById("telAdd");
const rdvTableBody = document.querySelector("#rdvTable tbody");
const compteurBox = document.createElement("div");
compteurBox.className = "card compteur";
document.querySelector("main").prepend(compteurBox);

// -------------------------------
// الدخول بكلمة المرور
// -------------------------------
btnLogin.addEventListener("click", () => {
  if (mdpInput.value === "docteur123") {
    loginCard.style.display = "none";
    medContent.style.display = "block";
    afficherRendezVous();
  } else {
    loginError.textContent = "Mot de passe incorrect !";
  }
});

// -------------------------------
// إضافة موعد جديد
// -------------------------------
btnAdd.addEventListener("click", () => {
  const nom = nomAdd.value.trim();
  const tel = telAdd.value.trim();
  if (!nom || !tel) {
    alert("Veuillez remplir tous les champs !");
    return;
  }

  const newRdv = {
    nom,
    tel,
    done: false,
    date: new Date().toLocaleDateString("fr-FR")
  };

  push(ref(db, "rendezvous"), newRdv)
    .then(() => {
      nomAdd.value = "";
      telAdd.value = "";
    })
    .catch(err => alert("Erreur : " + err));
});

// -------------------------------
// عرض المواعيد
// -------------------------------
function afficherRendezVous() {
  const rdvRef = ref(db, "rendezvous");
  onValue(rdvRef, (snapshot) => {
    rdvTableBody.innerHTML = "";
    let total = 0;
    let restants = 0;

    snapshot.forEach(child => {
      const rdv = child.val();
      const id = child.key;
      total++;

      const row = document.createElement("tr");
      if (rdv.done) row.classList.add("done");

      row.innerHTML = `
        <td>${total}</td>
        <td>${rdv.nom}</td>
        <td>${rdv.tel}</td>
        <td>${rdv.date}</td>
        <td>
          <button class="btnDone">${rdv.done ? "✔" : "👁"}</button>
          <button class="btnDelete">🗑</button>
        </td>
      `;

      // حذف موعد
      row.querySelector(".btnDelete").addEventListener("click", () => {
        if (confirm("Supprimer ce rendez-vous ?")) remove(ref(db, "rendezvous/" + id));
      });

      // تغيير حالة الكشف
      row.querySelector(".btnDone").addEventListener("click", () => {
        update(ref(db, "rendezvous/" + id), { done: !rdv.done });
      });

      if (!rdv.done) restants++;

      rdvTableBody.appendChild(row);
    });

    compteurBox.innerHTML = `<h3>Patients restants : <span>${restants}</span></h3>`;
  });
}
