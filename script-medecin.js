document.addEventListener("DOMContentLoaded", () => {
  // === Sélection des éléments HTML ===
  
  // عناصر تسجيل الدخول (Login)
  const btnLogin = document.getElementById("btnLogin");
  const emailInput = document.getElementById("emailMedecin");
  const mdpInput = document.getElementById("mdpMedecin");
  const loginCard = document.getElementById("loginCard");
  const loginError = document.getElementById("loginError");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const changePasswordLink = document.getElementById("changePasswordLink");
  
  // عناصر تسجيل الاشتراك (Signup)
  const signupCard = document.getElementById("signupCard");
  const newEmailInput = document.getElementById("newEmail");
  const newPasswordInput = document.getElementById("newPassword");
  const btnSignup = document.getElementById("btnSignup");
  const signupError = document.getElementById("signupError");
  const showSignupBtn = document.getElementById("showSignupBtn");
  const showLoginBtn = document.getElementById("showLoginBtn");

  // العناصر العامة
  const medContent = document.getElementById("medContent");
  const btnLogout = document.getElementById("btnLogout");
  
  // عناصر إدارة المواعيد
  const nomAdd = document.getElementById("nomAdd");
  const telAdd = document.getElementById("telAdd");
  const btnAdd = document.getElementById("btnAdd");
  const rdvTable = document.getElementById("rdvTable").querySelector("tbody");
  const remainingSpan = document.getElementById("remaining");

  // === Initialisation Firebase ===
  // يجب أن يكون firebaseConfig متاحًا كمتغير عام من ملف firebase-config.js
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const auth = firebase.auth(); 

  // === 1. وظائف التبديل بين الشاشات ===
  if (showSignupBtn && showLoginBtn) {
    showSignupBtn.addEventListener("click", () => {
        loginCard.style.display = "none";
        signupCard.style.display = "block";
        loginError.textContent = "";
    });

    showLoginBtn.addEventListener("click", () => {
        signupCard.style.display = "none";
        loginCard.style.display = "block";
        signupError.textContent = "";
    });
  }

  // === 2. التحقق من حالة المصادقة عند تحميل الصفحة (Firebase Auth) ===
  auth.onAuthStateChanged((user) => {
    if (user) {
      // المستخدم مسجل الدخول
      loginCard.style.display = "none";
      signupCard.style.display = "none";
      medContent.style.display = "block";
      afficherRendezVous();
    } else {
      // المستخدم غير مسجل الدخول
      loginCard.style.display = "block";
      signupCard.style.display = "none";
      medContent.style.display = "none";
      rdvTable.innerHTML = "";
    }
  });

  // === 3. Connexion médecin (تسجيل الدخول الآمن) ===
  btnLogin.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = mdpInput.value.trim();

    if (!email || !password) {
        loginError.textContent = "الرجاء إدخال البريد الإلكتروني وكلمة المرور.";
        return;
    }

    // لا توجد كلمة سر مكتوبة بشكل صريح في الكود
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
  });

  // === 4. تسجيل طبيب جديد (Signup) ===
  btnSignup.addEventListener("click", () => {
      const email = newEmailInput.value.trim();
      const password = newPasswordInput.value.trim();

      if (!email || password.length < 6) {
          signupError.textContent = "يجب إدخال بريد إلكتروني وكلمة مرور لا تقل عن 6 أحرف.";
          return;
      }

      auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
              signupError.textContent = "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.";
              newEmailInput.value = "";
              newPasswordInput.value = "";
              showLoginBtn.click(); // العودة لشاشة تسجيل الدخول
          })
          .catch((error) => {
              console.error("Signup Error:", error.code, error.message);
              if (error.code === 'auth/email-already-in-use') {
                  signupError.textContent = "هذا البريد الإلكتروني مستخدم بالفعل.";
              } else {
                  signupError.textContent = "حدث خطأ أثناء إنشاء الحساب. حاول مجددًا.";
              }
          });
  });

  // === 5. وظائف إدارة المصادقة الإضافية (تسجيل الخروج/كلمة السر) ===

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
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();

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

  // ج. تغيير كلمة السر (توجيه)
  if (changePasswordLink) {
    changePasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        alert("لتغيير كلمة السر، يرجى تسجيل الخروج ثم استخدام خيار 'هل نسيت كلمة السر؟' في صفحة تسجيل الدخول.");
    });
  }

  // === 6. Ajouter un rendez-vous (يتطلب تسجيل الدخول) ===
  btnAdd.addEventListener("click", () => {
    // التحقق من تسجيل الدخول باستخدام Firebase Auth
    if (!auth.currentUser) { alert("يجب تسجيل الدخول أولاً لإضافة موعد."); return; }

    const nom = nomAdd.value.trim();
    const tel = telAdd.value.trim();

    if (!nom || !tel) { alert("Veuillez remplir tous les champs !"); return; }

    const ref = db.ref("rendezvous");
    ref.once("value").then(snapshot => {
      const numero = snapshot.numChildren() + 1
