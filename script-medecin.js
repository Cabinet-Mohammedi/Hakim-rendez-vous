document.addEventListener("DOMContentLoaded", () => {
  // === Sélection des éléments HTML ===
  const btnLogin = document.getElementById("btnLogin");
  
  // *** يجب التأكد من وجود هذه العناصر في ملف HTML الخاص بك ***
  const emailInput = document.getElementById("emailMedecin"); // حقل إدخال البريد الإلكتروني
  const mdpInput = document.getElementById("mdpMedecin");       // حقل إدخال كلمة المرور
  // --------------------------------------------------------
  
  const loginCard = document.getElementById("loginCard");
  const medContent = document.getElementById("medContent");
  const loginError = document.getElementById("loginError");

  const nomAdd = document.getElementById("nomAdd");
  const telAdd = document.getElementById("telAdd");
  const btnAdd = document.getElementById("btnAdd");
  const rdvTable = document.getElementById("rdvTable").querySelector("tbody");
  const remainingSpan = document.getElementById("remaining");

  // === Initialisation Firebase ===
  // *** تأكد من أن firebaseConfig صحيح ومحدث ***
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const auth = firebase.auth(); // جلب خدمة المصادقة

  // === 1. التحقق من حالة المصادقة عند تحميل الصفحة ===
  // هذا يحدد ما إذا كان يجب عرض شاشة تسجيل الدخول أو المحتوى
  auth.onAuthStateChanged((user) => {
    if (user) {
      // المستخدم مسجل الدخول بنجاح
      loginCard.style.display = "none";
      medContent.style.display = "block";
      afficherRendezVous();
    } else {
      // المستخدم غير مسجل الدخول
      loginCard.style.display = "block";
      medContent.style.display = "none";
    }
  });

  // === 2. Connexion médecin (تسجيل الدخول) ===
  btnLogin.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = mdpInput.value.trim();

    if (!email || !password) {
        loginError.textContent = "الرجاء إدخال البريد الإلكتروني وكلمة المرور.";
        return;
    }

    // استخدام وظيفة Firebase للمصادقة الآمنة (لا توجد كلمة مرور في الكود)
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // تسجيل الدخول ناجح. onAuthStateChanged يتولى التبديل
        loginError.textContent = ""; 
      })
      .catch((error) => {
        // فشل تسجيل الدخول
        console.error("Login Error:", error.code, error.message);
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
             loginError.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        } else {
             loginError.textContent = "حدث خطأ أثناء تسجيل الدخول. حاول مجددًا.";
        }
      });
  });

  // === 3. Ajouter un rendez-vous ===
  btnAdd.addEventListener("click", () => {
    const nom = nomAdd.value.trim();
    const tel = telAdd.value.trim();

    if (!nom || !tel) { alert("Veuillez remplir tous les champs !"); return; }

    const ref = db.ref("rendezvous");
    ref.once("value").then(snapshot => {
      const numero = snapshot.numChildren() + 1;
      ref.push({
        nom,
        tel,
        numero,
        date: new Date().toLocaleDateString("fr-FR"),
        checked: false
      });
      nomAdd.value = "";
      telAdd.value = "";
    });
  });

  // === 4. Afficher les rendez-vous ===
  function afficherRendezVous() {
    const ref = db.ref("rendezvous");
    ref.on("value", snapshot => {
      rdvTable.innerHTML = "";
      let remaining = 0;

      snapshot.forEach(child => {
        const data = child.val();
        if (!data.checked) remaining++;

        const tr = document.createElement("tr");
        tr.style.background = data.checked ? "#f28b82" : "white"; // أحمر فاتح عند تم الكشف

        tr.innerHTML = `
          <td>${data.numero}</td>
          <td>${data.nom}</td>
          <td>${data.tel}</td>
          <td>${data.date}</td>
          <td>
            <button class="btn-check" data-id="${child.key}" style="background:green; color:white; margin-right:5px;">
              ✅
            </button>
            <button class="btn-delete" data-id="${child.key}" style="background:red; color:white;">🗑️</button>
          </td>
        `;
        rdvTable.appendChild(tr);
      });

      remainingSpan.textContent = remaining;

      // === Bouton toggle "tem découverte" ===
      document.querySelectorAll(".btn-check").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.currentTarget.getAttribute("data-id");
          const refPatient = db.ref("rendezvous/" + id);

          refPatient.once("value").then(snap => {
            const current = snap.val().checked;
            refPatient.update({ checked: !current }); // تبديل بين true و false
          });
        });
      });

      // === Bouton supprimer ===
      document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.currentTarget.getAttribute("data-id");
          db.ref("rendezvous/" + id).remove();
        });
      });
    });
  }
});
