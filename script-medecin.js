document.addEventListener("DOMContentLoaded", () => {
  // === Sélection des éléments HTML ===
  
  // عناصر تسجيل الدخول (Login)
  const btnLogin = document.getElementById("btnLogin");
  const emailInput = document.getElementById("emailMedecin");
  const mdpInput = document.getElementById("mdpMedecin");
  const loginCard = document.getElementById("loginCard");
  const loginError = document.getElementById("loginError");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  // const changePasswordLink = document.getElementById("changePasswordLink"); // تم إزالتها لتجنب الأخطاء

  // العناصر العامة
  const medContent = document.getElementById("medContent");
  const btnLogout = document.getElementById("btnLogout");
  
  // عناصر إدارة المواعيد
  const nomAdd = document.getElementById("nomAdd");
  const telAdd = document.getElementById("telAdd");
  const btnAdd = document.getElementById("btnAdd");
  const rdvTableBody = document.getElementById("rdvTable") ? document.getElementById("rdvTable").querySelector("tbody") : null;
  const remainingSpan = document.getElementById("remaining");

  // === Initialisation Firebase ===
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const auth = firebase.auth(); 

  // === 1. التحقق من حالة المصادقة عند تحميل الصفحة (Firebase Auth) ===
  auth.onAuthStateChanged((user) => {
    // التحقق من وجود العناصر قبل محاولة الوصول إلى خاصية style (خطأ السطر 51)
    if (loginCard && medContent) {
        if (user) {
            // المستخدم مسجل الدخول
            loginCard.style.display = "none";
            medContent.style.display = "block";
            afficherRendezVous();
        } else {
            // المستخدم غير مسجل الدخول
            loginCard.style.display = "block";
            medContent.style.display = "none";
            if (rdvTableBody) {
                rdvTableBody.innerHTML = "";
            }
        }
    }
  });

  // === 2. Connexion médecin (تسجيل الدخول الآمن) ===
  if (btnLogin) { // فحص أمان للزر
      btnLogin.addEventListener("click", () => {
          const email = emailInput.value.trim();
          const password = mdpInput.value.trim();

          if (!email || !password) {
              loginError.textContent = "الرجاء إدخال البريد الإلكتروني وكلمة المرور.";
              return;
          }

          auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
              loginError.textContent = ""; 
            })
            .catch((error) => {
              console.error("Login Error:", error.code, error.message);
              
              if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                   loginError.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
              } else {
                   loginError.textContent = "حدث خطأ أثناء تسجيل الدخول. حاول مجددًا.";
              }
            });
      }); // نهاية btnLogin.addEventListener
  }

  // === 3. وظائف إدارة المصادقة الإضافية (تسجيل الخروج/كلمة السر) ===

  // أ. تسجيل الخروج
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        auth.signOut().then(() => {
            alert("تم تسجيل الخروج بنجاح.");
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    });
  }

  // ب. نسيت كلمة السر
  if (forgotPasswordLink) { // فحص أمان للرابط (خطأ السطر 88 المحتمل)
    forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        // نستخدم حقل إدخال البريد الإلكتروني لتحديد البريد
        const email = emailInput ? emailInput.value.trim() : ''; 

        if (!email) {
            alert("الرجاء إدخال البريد الإلكتروني أولاً في حقل تسجيل الدخول.");
            return;
        }

        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert(`تم إرسال رابط إعادة تعيين كلمة السر إلى بريد ${email}.`);
            })
            .catch((error) => {
                console.error("Forgot Password Error:", error);
                alert("حدث خطأ. تأكد من أن البريد الإلكتروني صحيح ومسجل.");
            });
    });
  }

  // === 4. Ajouter un rendez-vous (يتطلب تسجيل الدخول) ===
  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      if (!auth.currentUser) { alert("يجب تسجيل الدخول أولاً لإضافة موعد."); return; }

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
  }

  // === 5. Afficher les rendez-vous ===
  function afficherRendezVous() {
    if (!rdvTableBody) return; // فحص أمان للجدول

    const ref = db.ref("rendezvous");
    ref.on("value", snapshot => {
      rdvTableBody.innerHTML = "";
      let remaining = 0;

      // ... (باقي منطق عرض البيانات والأزرار)

      snapshot.forEach(child => {
        const data = child.val();
        if (!data.checked) remaining++;

        const tr = document.createElement("tr");
        tr.style.background = data.checked ? "#f28b82" : "white";

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
        rdvTableBody.appendChild(tr);
      });

      if(remainingSpan) {
        remainingSpan.textContent = remaining;
      }

      // === Bouton toggle "tem découverte" ===
      document.querySelectorAll(".btn-check").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.currentTarget.getAttribute("data-id");
          const refPatient = db.ref("rendezvous/" + id);

          refPatient.once("value").then(snap => {
            const current = snap.val().checked;
            refPatient.update({ checked: !current }); 
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
