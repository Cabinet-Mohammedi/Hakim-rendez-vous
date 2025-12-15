document.addEventListener("DOMContentLoaded", () => {
    
    // === 1. Configuration Firebase (يجب أن تتطابق مع مشروعك) ===
    const firebaseConfig = {
        apiKey: "AIzaSyDaituJimoLNpkMYvr1u4KJC8XEJgbrGZA",
        authDomain: "clinique-9f351.firebaseapp.com",
        databaseURL: "https://clinique-9f351-default-rtdb.firebaseio.com",
        projectId: "clinique-9f351",
        storageBucket: "clinique-9f351.appspot.com",
        messagingSenderId: "537502134144",
        appId: "1:537502134144:web:a7d0ba7fb48f97b2775b65"
    };

    // === 2. Initialisation Firebase ===
    // يتم تهيئة Firebase باستخدام 'compat' API
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();
    const refRdv = db.ref("rendezvous");

    // === 3. Sélection des éléments HTML ===
    const btnReserve = document.getElementById("btnReserve");
    const nomInput = document.getElementById("nom");
    const telInput = document.getElementById("tel");
    const infoReservation = document.getElementById("infoReservation");

    // === 4. وظيفة حجز موعد (عند النقر على "Réserver") ===
    if (btnReserve) {
        btnReserve.addEventListener("click", () => {
            const nom = nomInput.value.trim();
            const tel = telInput.value.trim();

            if (!nom || !tel) {
                infoReservation.textContent = "⚠️ Veuillez remplir tous les champs.";
                infoReservation.style.color = "red";
                return;
            }

            // 🚀 الكتابة المباشرة (push)
            // هذه العملية لا تتطلب إذن قراءة وتتوافق مع قواعد الأمان
            refRdv.push({ 
                nom, 
                tel, 
                // لا يمكننا حساب 'numero' هنا، يجب أن يُحسب عند العرض من قبل الطبيب
                date: new Date().toLocaleDateString("fr-FR"), 
                checked: false 
            })
            .then(() => {
                // نجاح الحجز
                infoReservation.style.color = "green";
                infoReservation.style.marginTop = "15px";
                infoReservation.style.fontWeight = "bold";
                // نستخدم رسالة تأكيد بسيطة لأننا لا نستطيع قراءة عدد المرضى
                infoReservation.innerHTML = `✅ تم حجز موعدك بنجاح. سيتم الاتصال بك قريباً.`; 

                // Réinitialiser les champs
                nomInput.value = "";
                telInput.value = "";
            })
            .catch((error) => {
                // فشل الحجز بسبب قواعد الأمان أو الاتصال
                infoReservation.textContent = "فشل الحجز. الرجاء التأكد من الاتصال أو محاولة الاتصال بالعيادة.";
                infoReservation.style.color = "red";
                console.error("Firebase Push Error:", error);
            });
        });
    }
});
