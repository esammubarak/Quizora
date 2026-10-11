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
    signInWithPopup 
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

const translations = {
    ar: {
        welcomeTitle: "The best way to study.<br>Sign up for free.",
        termsNote: "باستخدامك للتطبيق، أنت توافق على شروط الخدمة و سياسة الخصوصية الخاصة بـ Quizora",
        continueGoogle: "المتابعة بواسطة Google",
        continueEmail: "التسجيل باستخدام البريد الإلكتروني",
        haveAccount: "لديك حساب بالفعل؟",
        logInText: "تسجيل الدخول",
        signupHeader: "إنشاء حساب",
        signupSub: "أدخل بياناتك الأكاديمية للانضمام إلى Quizora",
        fullName: "الاسم الكامل",
        fullNamePh: "أدخل اسمك الكامل",
        academicRole: "الصفة الأكاديمية",
        roleStudent: "طالب",
        roleProf: "أستاذ",
        universityName: "اسم الجامعة",
        uniPh: "مثال: الجامعة الوطنية السودان",
        facultyName: "الكلية / التخصص",
        facultyPh: "مثال: مختبرات طبية",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        alreadyHaveAcc: "لديك حساب بالفعل؟",
        loginLink: "تسجيل الدخول",
        loginHeader: "تسجيل الدخول",
        loginSub: "مرحباً بك مجدداً، أدخل معلوماتك",
        forgotPass: "نسيت كلمة المرور؟",
        noAcc: "ليس لديك حساب؟",
        createAccLink: "إنشاء حساب جديد",
        forgotHeader: "استعادة كلمة المرور",
        forgotSub: "أدخل بريدك الإلكتروني لإرسال رابط الاستعادة",
        sendResetBtn: "إرسال رابط الاستعادة",
        setupSub: "اختر الإعدادات وابدأ الاختبار",
        lectureFile: "ملف المحاضرة (اختياري)",
        numQ: "عدد الأسئلة",
        startQuizBtn: "ابدأ الكويز الآن",
        nextBtn: "السؤال التالي",
        resultHeader: "النتيجة النهائية",
        resultSub: "أحسنت إكمال الكويز بنجاح!",
        newQuizBtn: "اختبار جديد"
    },
    en: {
        welcomeTitle: "The best way to study.<br>Sign up for free.",
        termsNote: "By signing up, you accept Quizora's Terms of service and Privacy policy",
        continueGoogle: "Continue with Google",
        continueEmail: "Sign up with email",
        haveAccount: "Have an account?",
        logInText: "Log in",
        signupHeader: "Create Account",
        signupSub: "Enter your academic details to join Quizora",
        fullName: "Full Name",
        fullNamePh: "Enter your full name",
        academicRole: "Academic Role",
        roleStudent: "Student",
        roleProf: "Professor",
        universityName: "University Name",
        uniPh: "e.g., National University Sudan",
        facultyName: "Faculty / Major",
        facultyPh: "e.g., Medical Laboratory Sciences",
        email: "Email Address",
        password: "Password",
        alreadyHaveAcc: "Already have an account?",
        loginLink: "Log In",
        loginHeader: "Log In",
        loginSub: "Welcome back, please enter your details",
        forgotPass: "Forgot password?",
        noAcc: "Don't have an account?",
        createAccLink: "Sign Up",
        forgotHeader: "Reset Password",
        forgotSub: "Enter your email to receive a recovery link",
        sendResetBtn: "Send Reset Link",
        setupSub: "Choose settings and start quiz",
        lectureFile: "Lecture File (Optional)",
        numQ: "Number of Questions",
        startQuizBtn: "Start Quiz Now",
        nextBtn: "Next Question",
        resultHeader: "Final Result",
        resultSub: "Great job completing the quiz!",
        newQuizBtn: "New Quiz"
    }
};

let currentLang = 'ar';

window.toggleLanguage = function() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    const root = document.getElementById('html-root');
    root.setAttribute('lang', currentLang);
    root.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');

    document.querySelectorAll('.lang-switcher').forEach(btn => {
        btn.textContent = currentLang === 'ar' ? 'English 🌐' : 'العربية 🌐';
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (translations[currentLang][key]) {
            el.setAttribute('placeholder', translations[currentLang][key]);
        }
    });
};

window.showScreen = function(screenId) {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('signup-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('forgot-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');

    document.getElementById(screenId).classList.remove('hidden');
};

window.handleSignUp = function() {
    const name = document.getElementById('signup-name').value;
    const role = document.getElementById('signup-role').value;
    const university = document.getElementById('signup-university').value;
    const faculty = document.getElementById('signup-faculty').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if(!name || !university || !faculty || !email || !password) {
        alert(currentLang === 'ar' ? "الرجاء إكمال جميع الحقول المطلوبة" : "Please fill in all required fields");
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

            sendEmailVerification(user)
                .then(() => {
                    alert(currentLang === 'ar' ? "تم إنشاء الحساب بنجاح! تم إرسال رسالة تحقق إلى بريدك الإلكتروني." : "Account created successfully! Verification email sent.");
                    showScreen('login-screen');
                });
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
};

window.handleLogin = function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if(!email || !password) {
        alert(currentLang === 'ar' ? "الرجاء إدخال البريد الإلكتروني وكلمة المرور" : "Please enter email and password");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (!user.emailVerified) {
                alert(currentLang === 'ar' ? "يرجى التحقق من بريدك الإلكتروني أولاً عبر الرابط المرسل إليك." : "Please verify your email first.");
                return;
            }
            showScreen('setup-screen');
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
};

window.handleGoogleLogin = function() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            showScreen('setup-screen');
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
};

window.handleForgotPassword = function() {
    const email = document.getElementById('forgot-email').value;
    if(!email) {
        alert(currentLang === 'ar' ? "الرجاء إدخال البريد الإلكتروني الخاص بك" : "Please enter your email");
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert(currentLang === 'ar' ? "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني." : "Password reset link sent to your email.");
            showScreen('login-screen');
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
};

onAuthStateChanged(auth, (user) => {
    if (user && (user.emailVerified || user.providerData.some(p => p.providerId === 'google.com'))) {
        showScreen('setup-screen');
    }
});

// Quiz Logic
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let selectedLimit = 5;

window.startQuiz = function() {
    selectedLimit = parseInt(document.getElementById('num-questions').value);
    questions = generateDemoQuestions(selectedLimit);
    
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(questions.length).fill(null);

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    loadQuestion();
}

function generateDemoQuestions(limit) {
    let demo = [
        { q: "ما هي الوحدة الأساسية لبناء الكائن الحي؟", options: ["الخلية", "النسيج", "العضو", "الجهاز"], answer: 0 },
        { q: "أي من الآتي يعتبر من أنواع خلايا الدم البيضاء؟", options: ["الكريات الحمراء", "الخلايا الليمفاوية", "الصفائح الدموية", "البلازما"], answer: 1 },
        { q: "ما هو الجزيء المسؤول عن حمل الأكسجين في الدم؟", options: ["الجلوكوز", "الهيموجلوبين", "الألبومين", "الكوليسترول"], answer: 1 },
        { q: "في أي عضو يتم إنتاج كرات الدم الحمراء في البالغين؟", options: ["الكبد", "الطحال", "نخاع العظم", "الكليتين"], answer: 2 },
        { q: "ما هو الرقم الهيدروجيني (pH) الطبيعي للدم البشري؟", options: ["7.0", "7.4", "6.8", "8.0"], answer: 1 },
        { q: "أي من الآتي يُعد مضاد تخثر مستخدم في أنابيب سحب الدم؟", options: ["EDTA", "كلوريد الصوديوم", "الجلوكوز", "الماء المقطر"], answer: 0 },
        { q: "ما هي وظيفة الصفائح الدموية الرئيسية؟", options: ["نقل الأكسجين", "تخثر الدم ووقف النزف", "مقاومة البكتيريا", "تنظيم الحرارة"], answer: 1 },
        { q: "الجهاز المسؤول عن المناعة في الجسم هو:", options: ["الجهاز الهضمي", "الجهاز الليمفاوي", "الجهاز العصبي", "الجهاز البولي"], answer: 1 },
        { q: "أين تقع الغدة الكظرية في جسم الإنسان؟", options: ["فوق الكليتين", "في الدماغ", "تحت المعدة", "في الرقبة"], answer: 0 }
    ];
    demo.sort(() => Math.random() - 0.5);
    return demo.slice(0, limit);
}

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('question-text').textContent = q.q;
    document.getElementById('question-counter').textContent = `السؤال ${currentQuestionIndex + 1} من ${questions.length}`;
    
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;

    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';

    q.options.forEach((opt, index) => {
        const li = document.createElement('li');
        li.className = 'option-item';
        if (userAnswers[currentQuestionIndex] === index) {
            li.classList.add('selected');
        }
        li.textContent = opt;
        li.onclick = () => selectOption(index);
        optionsList.appendChild(li);
    });

    const nextBtn = document.getElementById('next-btn');
    if (userAnswers[currentQuestionIndex] !== null) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
    } else {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.4';
    }
}

window.selectOption = function(index) {
    userAnswers[currentQuestionIndex] = index;
    
    const items = document.querySelectorAll('.option-item');
    items.forEach((item, idx) => {
        if (idx === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    const nextBtn = document.getElementById('next-btn');
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
}

window.nextQuestion = function() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    score = 0;
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === questions[i].answer) {
            score++;
        }
    }

    document.getElementById('final-score').textContent = `${score} / ${questions.length}`;
    
    const msg = document.getElementById('result-message');
    let percentage = (score / questions.length) * 100;
    if (percentage >= 80) {
        msg.textContent = "ممتاز جداً! أداء استثنائي ومستوى رائع.";
    } else if (percentage >= 50) {
        msg.textContent = "جيد، يمكنك المراجعة أكثر لتحسين نتيجتك.";
    } else {
        msg.textContent = "حاول مرة أخرى وركز في المحاضرة!";
    }
}

window.resetToSetup = function() {
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
}
