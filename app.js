import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBUxXXW1F_wCzsn6dBUOtYOAxwPrWOF-Bk",
    authDomain: "quizora-app-sd.firebaseapp.com",
    projectId: "quizora-app-sd",
    storageBucket: "quizora-app-sd.firebasestorage.app",
    messagingSenderId: "489578479858",
    appId: "1:489578479858:web:c08cb68ec7b95d058f906b",
    measurementId: "G-BJW8K14Z3E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// إدارة التنقل بين الشاشات
window.showScreen = function(screenId) {
    const screens = ['welcome-screen', 'signup-screen', 'login-screen', 'forgot-screen', 'dashboard-screen', 'profile-screen', 'create-set-screen', 'flashcard-screen', 'setup-screen', 'quiz-screen', 'result-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if(target) target.classList.remove('hidden');

    if(screenId === 'profile-screen') {
        loadUserProfile();
    }
    if(screenId === 'dashboard-screen') {
        loadUserSets();
    }
};

// المصادقة
window.handleSignUp = function() {
    const name = document.getElementById('signup-name').value;
    const role = document.getElementById('signup-role').value;
    const university = document.getElementById('signup-university').value;
    const faculty = document.getElementById('signup-faculty').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if(!name || !university || !faculty || !email || !password) {
        alert("الرجاء إكمال جميع الحقول المطلوبة");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            updateProfile(user, { displayName: name }).then(() => {
                localStorage.setItem('user_university', university);
                localStorage.setItem('user_faculty', faculty);
                localStorage.setItem('user_role', role);
            });

            sendEmailVerification(user).then(() => {
                alert("تم إنشاء الحساب بنجاح! تم إرسال رسالة تحقق إلى بريدك الإلكتروني.");
                showScreen('login-screen');
            });
        })
        .catch((error) => alert("Error: " + error.message));
};

window.handleLogin = function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if(!email || !password) {
        alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            showScreen('dashboard-screen');
        })
        .catch((error) => alert("Error: " + error.message));
};

window.handleGoogleLogin = function() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(() => {
        // افتراضي للغوغل
        if(!localStorage.getItem('user_university')) {
            localStorage.setItem('user_university', 'جامعة غير مسجلة');
            localStorage.setItem('user_faculty', 'تخصص عام');
            localStorage.setItem('user_role', 'طالب');
        }
        showScreen('dashboard-screen');
    }).catch((error) => alert("Error: " + error.message));
};

window.handleLogout = function() {
    signOut(auth).then(() => showScreen('welcome-screen'));
};

window.handleForgotPassword = function() {
    const email = document.getElementById('forgot-email').value;
    if(!email) return alert("أدخل بريدك الإلكتروني");
    sendPasswordResetEmail(auth, email).then(() => {
        alert("تم إرسال رابط الاستعادة إلى بريدك.");
        showScreen('login-screen');
    });
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        // إذا كان مسجلاً مسبقاً يفتح لوحة التحكم مباشرة
        // showScreen('dashboard-screen');
    }
});

// تحميل بيانات الملف الشخصي
function loadUserProfile() {
    const user = auth.currentUser;
    if(user) {
        document.getElementById('profile-name').textContent = user.displayName || "مستخدم Quizora";
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-university').textContent = localStorage.getItem('user_university') || "الجامعة الوطنية";
        document.getElementById('profile-faculty').textContent = localStorage.getItem('user_faculty') || "مختبرات طبية";
        document.getElementById('profile-role').textContent = localStorage.getItem('user_role') || "طالب";

        const sets = JSON.parse(localStorage.getItem('user_sets') || '[]');
        document.getElementById('stat-sets').textContent = sets.length;
        document.getElementById('stat-quizzes').textContent = localStorage.getItem('total_quizzes') || '0';
    }
}

// نظام المجموعات والبطاقات (Study Sets & Flashcards)
window.addCardRow = function() {
    const container = document.getElementById('cards-inputs-container');
    const row = document.createElement('div');
    row.className = 'card-input-row';
    row.innerHTML = `
        <input type="text" class="term-input" placeholder="المصطلح (Term)">
        <input type="text" class="def-input" placeholder="التعريف (Definition)">
    `;
    container.appendChild(row);
};

window.saveStudySet = function() {
    const title = document.getElementById('set-title').value;
    if(!title) return alert("أدخل عنوان المجموعات");

    const terms = document.querySelectorAll('.term-input');
    const defs = document.querySelectorAll('.def-input');
    let cards = [];

    for(let i=0; i<terms.length; i++) {
        if(terms[i].value && defs[i].value) {
            cards.push({ term: terms[i].value, def: defs[i].value });
        }
    }

    if(cards.length === 0) return alert("أضف بطاقة واحدة على الأقل");

    let sets = JSON.parse(localStorage.getItem('user_sets') || '[]');
    sets.push({ title, cards });
    localStorage.setItem('user_sets', JSON.stringify(sets));

    alert("تم حفظ مجموعة البطاقات بنجاح!");
    showScreen('dashboard-screen');
};

function loadUserSets() {
    const container = document.getElementById('sets-list');
    container.innerHTML = '';
    const sets = JSON.parse(localStorage.getItem('user_sets') || '[]');

    if(sets.length === 0) {
        container.innerHTML = '<p style="color: var(--ios-text-secondary); text-align: center; font-size: 13px;">لا توجد مجموعات حالياً. أنشئ مجموعتك الأولى!</p>';
        return;
    }

    sets.forEach((set, index) => {
        const div = document.createElement('div');
        div.className = 'set-item-card';
        div.innerHTML = `
            <div>
                <strong>${set.title}</strong>
                <p style="font-size: 12px; color: var(--ios-text-secondary);">${set.cards.length} بطاقات</p>
            </div>
            <span style="color: var(--ios-blue);">مراجعة ➔</span>
        `;
        div.onclick = () => openFlashcards(index);
        container.appendChild(div);
    });
}

// عرض Flashcards
let currentSetCards = [];
let currentCardIdx = 0;

function openFlashcards(setIndex) {
    const sets = JSON.parse(localStorage.getItem('user_sets') || '[]');
    const set = sets[setIndex];
    currentSetCards = set.cards;
    currentCardIdx = 0;

    document.getElementById('flashcard-set-title').textContent = set.title;
    showScreen('flashcard-screen');
    renderCard();
}

function renderCard() {
    if(currentSetCards.length === 0) return;
    const card = currentSetCards[currentCardIdx];
    document.getElementById('fc-term').textContent = card.term;
    document.getElementById('fc-def').textContent = card.def;
    document.getElementById('flashcard-inner').classList.remove('flipped');
}

window.flipCard = function() {
    document.getElementById('flashcard-inner').classList.toggle('flipped');
};

window.nextCard = function() {
    if(currentCardIdx < currentSetCards.length - 1) {
        currentCardIdx++;
        renderCard();
    } else {
        currentCardIdx = 0;
        renderCard();
    }
};

window.prevCard = function() {
    if(currentCardIdx > 0) {
        currentCardIdx--;
        renderCard();
    }
};

// نظام الكويز التفاعلي
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

window.startQuiz = function() {
    const limit = parseInt(document.getElementById('num-questions').value);
    questions = [
        { q: "ما هي الوحدة الأساسية لبناء الكائن الحي؟", options: ["الخلية", "النسيج", "العضو", "الجهاز"], answer: 0 },
        { q: "أي من الآتي يعتبر من أنواع خلايا الدم البيضاء؟", options: ["الكريات الحمراء", "الخلايا الليمفاوية", "الصفائح الدموية", "البلازما"], answer: 1 },
        { q: "ما هو الجزيء المسؤول عن حمل الأكسجين في الدم؟", options: ["الجلوكوز", "الهيموجلوبين", "الألبومين", "الكوليسترول"], answer: 1 },
        { q: "في أي عضو يتم إنتاج كرات الدم الحمراء في البالغين؟", options: ["الكبد", "الطحال", "نخاع العظم", "الكليتين"], answer: 2 },
        { q: "ما هو الرقم الهيدروجيني (pH) الطبيعي للدم البشري؟", options: ["7.0", "7.4", "6.8", "8.0"], answer: 1 }
    ].slice(0, limit);

    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(questions.length).fill(null);

    showScreen('quiz-screen');
    loadQuestion();
};

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('question-text').textContent = q.q;
    document.getElementById('question-counter').textContent = `السؤال ${currentQuestionIndex + 1} من ${questions.length}`;
    document.getElementById('progress-fill').style.width = `${((currentQuestionIndex) / questions.length) * 100}%`;

    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';

    q.options.forEach((opt, index) => {
        const li = document.createElement('li');
        li.className = 'option-item';
        if(userAnswers[currentQuestionIndex] === index) li.classList.add('selected');
        li.textContent = opt;
        li.onclick = () => {
            userAnswers[currentQuestionIndex] = index;
            loadQuestion();
            document.getElementById('next-btn').disabled = false;
            document.getElementById('next-btn').style.opacity = '1';
        };
        optionsList.appendChild(li);
    });

    const nextBtn = document.getElementById('next-btn');
    if(userAnswers[currentQuestionIndex] !== null) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
    } else {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.4';
    }
}

window.nextQuestion = function() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
};

function showResults() {
    showScreen('result-screen');
    score = 0;
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === questions[i].answer) score++;
    }

    document.getElementById('final-score').textContent = `${score} / ${questions.length}`;
    
    let totalQ = parseInt(localStorage.getItem('total_quizzes') || '0') + 1;
    localStorage.setItem('total_quizzes', totalQ);

    const msg = document.getElementById('result-message');
    let percentage = (score / questions.length) * 100;
    if (percentage >= 80) msg.textContent = "ممتاز جداً! أداء استثنائي ومستوى رائع.";
    else if (percentage >= 50) msg.textContent = "جيد، يمكنك المراجعة أكثر لتحسين نتيجتك.";
    else msg.textContent = "حاول مرة أخرى وركز في المحاضرة!";
}
