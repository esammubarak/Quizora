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

window.showScreen = function(screenId) {
    const screens = ['welcome-screen', 'signup-screen', 'login-screen', 'forgot-screen', 'dashboard-screen', 'profile-screen', 'setup-screen', 'quiz-screen', 'result-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if(target) target.classList.remove('hidden');

    if(screenId === 'profile-screen') {
        loadUserProfile();
    }
};

window.handleSignUp = function() {
    const username = document.getElementById('signup-username').value.trim();
    const name = document.getElementById('signup-name').value;
    const role = document.getElementById('signup-role').value;
    const university = document.getElementById('signup-university').value;
    const faculty = document.getElementById('signup-faculty').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if(!username || !name || !university || !faculty || !email || !password) {
        alert("Please fill in all required fields including Username");
        return;
    }

    // التحقق من أن اليوزر فريد وغير مستخدم من قبل
    let registeredUsers = JSON.parse(localStorage.getItem('quizora_usernames') || '{}');
    if(registeredUsers[username]) {
        alert("This username is already taken. Please choose another one.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // حفظ اليوزر في النظام ليكون فريداً
            registeredUsers[username] = user.uid;
            localStorage.setItem('quizora_usernames', JSON.stringify(registeredUsers));

            updateProfile(user, { displayName: name }).then(() => {
                localStorage.setItem('user_username_' + user.uid, username);
                localStorage.setItem('user_university', university);
                localStorage.setItem('user_faculty', faculty);
                localStorage.setItem('user_role', role);
            });

            sendEmailVerification(user).then(() => {
                alert("Account created successfully! Verification email sent.");
                showScreen('login-screen');
            });
        })
        .catch((error) => alert("Error: " + error.message));
};

window.handleLogin = function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if(!email || !password) {
        alert("Please enter email and password");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            showScreen('dashboard-screen');
        })
        .catch((error) => alert("Error: " + error.message));
};

window.handleGoogleLogin = function() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then((result) => {
        const user = result.user;
        if(!localStorage.getItem('user_username_' + user.uid)) {
            const defaultUser = user.email.split('@')[0];
            localStorage.setItem('user_username_' + user.uid, '@' + defaultUser);
            localStorage.setItem('user_university', 'National University Sudan');
            localStorage.setItem('user_faculty', 'Medical Laboratory Sciences');
            localStorage.setItem('user_role', 'Student');
        }
        showScreen('dashboard-screen');
    }).catch((error) => alert("Google Sign-in Error: " + error.message));
};

window.handleLogout = function() {
    signOut(auth).then(() => showScreen('welcome-screen'));
};

window.handleChangePassword = function() {
    const user = auth.currentUser;
    if(user && user.email) {
        sendPasswordResetEmail(auth, user.email).then(() => {
            alert("A password reset link has been sent to your email.");
        }).catch((error) => {
            alert("Error: " + error.message);
        });
    } else {
        alert("No active user found.");
    }
};

window.handleForgotPassword = function() {
    const email = document.getElementById('forgot-email').value;
    if(!email) return alert("Please enter your email");
    sendPasswordResetEmail(auth, email).then(() => {
        alert("Password reset link sent to your email.");
        showScreen('login-screen');
    });
};

function loadUserProfile() {
    const user = auth.currentUser;
    if(user) {
        document.getElementById('profile-name').textContent = user.displayName || "Essam Mubarak";
        document.getElementById('profile-username').textContent = localStorage.getItem('user_username_' + user.uid) || "@esam_user";
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-university').textContent = localStorage.getItem('user_university') || "National University Sudan";
        document.getElementById('profile-faculty').textContent = localStorage.getItem('user_faculty') || "Medical Laboratory Sciences";
        document.getElementById('profile-role').textContent = localStorage.getItem('user_role') || "Student";

        document.getElementById('stat-quizzes').textContent = localStorage.getItem('total_quizzes') || '0';
    }
}

// University English Questions
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

window.startQuiz = function() {
    const limit = parseInt(document.getElementById('num-questions').value || 5);
    questions = [
        { q: "What is the primary function of hemoglobin in human blood?", options: ["Carrying oxygen", "Fighting infection", "Blood clotting", "Regulating pH"], answer: 0 },
        { q: "Which of the following is an anticoagulant commonly used in blood collection tubes?", options: ["EDTA", "Sodium chloride", "Glucose", "Distilled water"], answer: 0 },
        { q: "What is the normal physiological pH range for human arterial blood?", options: ["7.00 - 7.05", "7.35 - 7.45", "7.50 - 7.60", "6.80 - 7.00"], answer: 1 },
        { q: "Where are red blood cells primarily produced in healthy adults?", options: ["Liver", "Spleen", "Bone marrow", "Kidneys"], answer: 2 },
        { q: "Which white blood cell type is primarily responsible for adaptive immunity and antibody production?", options: ["Neutrophil", "Lymphocyte", "Eosinophil", "Basophil"], answer: 1 }
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
    document.getElementById('question-counter').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
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
    if (percentage >= 80) msg.textContent = "Excellent performance! Outstanding academic level.";
    else if (percentage >= 50) msg.textContent = "Good job, review more to improve your score.";
    else msg.textContent = "Keep practicing and review your lecture materials!";
}
