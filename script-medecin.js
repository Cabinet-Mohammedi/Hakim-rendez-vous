    document.addEventListener("DOMContentLoaded", () => {
  // === Sélection des éléments HTML ===
  const btnLogin = document.getElementById("btnLogin");
  
  // عناصر المصادقة الجديدة والقديمة
  const emailInput = document.getElementById("emailMedecin");
  const mdpInput = document.getElementById("mdpMedecin");
  const loginError = document.getElementById("loginError");
  
  // الروابط الجديدة
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const changePasswordLink = document.getElementById("changePasswordLink");
  const btnLogout = document.getElementById("btnLogout"); // زر تسجيل الخروج (مضاف في medecin.html)

  // العناصر المرئية
  const loginCard = document.getElementById("loginCard");
  const medContent = document.getElementById("medContent");

  // عناصر إدارة المواعيد
  const nomAdd = document.getElementById("nomAdd");
  const telAdd = document.getElementById("telAdd");
  const btnAdd = document.getElementById("btnAdd");
  const rdvTable = document.getElementById("rdvTable").querySelector("tbody");
  const remainingSpan = document.getElementById("remaining");

  // === Initialisation Firebase ===
  // تأكد أن firebase-config.js يحتوي على التكوين الصحيح (firebaseConfig)
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const auth = firebase.auth(); // جلب خدمة المصادقة

  // === 1. التحقق من حالة المصادقة عند تحميل الصفحة (التحقق الآمن) ===
  // يتم التحقق من حالة تسجيل الدخول عبر Firebase Auth بدلاً من localStorage
  auth.onAuthStateChanged((user) => {
    if (user) {
      // المستخدم مسجل الدخول
      loginCard.style.display = "none";
      medContent.style.display = "block";
      afficherRendezVous();
    } else {
      // المستخدم غير مسجل الدخول
      loginCard.style.display = "block";
      medContent.style.display = "none";
      rdvTable.innerHTML = ""; // مسح الجدول عند تسجيل الخروج
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

    // *** لا توجد كلمة سر مكتوبة بشكل صريح في الكود الآن ***
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        loginError.textContent = ""; 
        // auth.onAuthStateChanged يتولى مهمة عرض المحتوى
      })
      .catch((error) => {
        console.error("Login Error:", error.code, error.message);
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
             loginError.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        } else {
             loginError.textContent = "حدث خطأ أثناء تسجيل الدخول. حاول مجددًا.";
        }
      });
  });

  // === 3. وظائف إدارة المصادقة الإضافية ===

  // أ. تسجيل الخروج
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        auth.signOut().then(() => {
            alert("تم تسجيل الخروج بنجاح.");
            // auth.onAuthStateChanged يتولى التبديل
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    });
  }

  // ب. نسيت كلمة السر (إرسال رابط إعادة تعيين)
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();

        if (!email) {
            alert("الرجاء إدخال البريد الإلكتروني في حقل الإدخال أعلاه أولاً.");
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

  // ج. تغيير كلمة السر (توجيه المستخدم)
  if (changePasswordLink) {
    changePasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        alert("لتغيير كلمة السر، يرجى تسجيل الخروج ثم استخدام خيار 'هل نسيت كلمة السر؟' في صفحة تسجيل الدخول.");
    });
  }

  // === 4. Ajouter un rendez-vous ===
  btnAdd.addEventListener("click", () => {
    // يجب التحقق من تسجيل الدخول قبل إضافة البيانات
    if (!auth.currentUser) { alert("يجب تسجيل الدخول أولاً."); return; }

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

  // === 5. Afficher les rendez-vous ===
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
