// ===== STATE =====
let currentUser = null;
let currentClass = '11';
let userXP = 0;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let testStartTime = null;
let currentTheme = 'light';

// ===== DATA =====
const appData = {
    classes: {
        '9': { subjects: { 'Mathematics': ['Number Systems', 'Polynomials'], 'Science': ['Matter', 'Atoms'] } },
        '10': { subjects: { 'Mathematics': ['Real Numbers', 'Trigonometry'], 'Science': ['Chemical Reactions', 'Light'] } },
        '11': { subjects: { 'Physics': ['Motion', 'Laws of Motion', 'Work Energy'], 'Chemistry': ['Basic Concepts', 'Atomic Structure'], 'Mathematics': ['Sets', 'Trigonometry'] } },
        '12': { subjects: { 'Physics': ['Electrostatics', 'Magnetism'], 'Chemistry': ['Solutions', 'Organic'], 'Mathematics': ['Matrices', 'Calculus'] } }
    }
};

// ===== SAMPLE QUESTIONS =====
const questionBank = [
    { q: 'What is 2+2?', options: ['3', '4', '5', '6'], correct: 1, explanation: '2+2 = 4' },
    { q: 'What is the capital of India?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], correct: 1, explanation: 'Delhi is the capital of India' },
    { q: 'Which planet is known as Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1, explanation: 'Mars is called Red Planet' },
    { q: 'What is 5 x 5?', options: ['20', '25', '30', '35'], correct: 1, explanation: '5 x 5 = 25' },
    { q: 'Which is the largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correct: 2, explanation: 'Pacific is the largest ocean' }
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    checkLoginState();
});

// ===== AUTH =====
function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) { alert('Please fill all fields'); return; }
    const users = JSON.parse(localStorage.getItem('notesWallahUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        currentClass = user.class || '11';
        userXP = user.xp || 0;
        localStorage.setItem('notesWallahSession', JSON.stringify(user));
        showApp();
    } else {
        alert('Invalid email or password');
    }
}

function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirm = document.getElementById('signupConfirm').value.trim();
    const cls = document.getElementById('signupClass').value;
    if (!name || !email || !password || !confirm) { alert('Please fill all fields'); return; }
    if (password !== confirm) { alert('Passwords do not match'); return; }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return; }
    const users = JSON.parse(localStorage.getItem('notesWallahUsers') || '[]');
    if (users.find(u => u.email === email)) { alert('Email already registered'); return; }
    const newUser = { name, email, password, class: cls, xp: 0, tests: [] };
    users.push(newUser);
    localStorage.setItem('notesWallahUsers', JSON.stringify(users));
    currentUser = newUser;
    currentClass = cls;
    userXP = 0;
    localStorage.setItem('notesWallahSession', JSON.stringify(newUser));
    alert('Account created successfully!');
    showApp();
}

function checkLoginState() {
    const session = localStorage.getItem('notesWallahSession');
    if (session) {
        currentUser = JSON.parse(session);
        currentClass = currentUser.class || '11';
        userXP = currentUser.xp || 0;
        showApp();
    }
}

function showApp() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('appScreen').classList.add('active');
    document.getElementById('userName').textContent = currentUser.name || 'Student';
    document.getElementById('userClass').textContent = 'Class ' + currentClass;
    document.getElementById('xpDisplay').textContent = userXP;
    document.getElementById('profileName').textContent = currentUser.name || 'Student';
    document.getElementById('profileEmail').textContent = currentUser.email || 'student@email.com';
    document.getElementById('profileClass').textContent = currentClass;
    document.getElementById('profileXP').textContent = userXP;
    updateProgress();
    navigateTo('home');
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('notesWallahSession');
        currentUser = null;
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('appScreen').classList.remove('active');
    }
}

// ===== NAVIGATION =====
function navigateTo(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const map = { 'home': 'appScreen', 'subjects': 'subjectsScreen', 'tests': 'testsScreen', 'books': 'booksScreen', 'profile': 'profileScreen', 'settings': 'settingsScreen', 'test': 'testScreen', 'result': 'resultScreen' };
    const target = document.getElementById(map[screen]);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navMap = { 'home': 0, 'subjects': 1, 'tests': 2, 'books': 3, 'profile': 4 };
    const items = document.querySelectorAll('.nav-item');
    if (navMap[screen] !== undefined && items[navMap[screen]]) items[navMap[screen]].classList.add('active');
    if (screen === 'subjects') loadSubjects();
    if (screen === 'home') updateDashboard();
}

// ===== SUBJECTS =====
function loadSubjects() {
    const container = document.getElementById('subjectsList');
    container.innerHTML = '';
    const subjects = appData.classes[currentClass]?.subjects || {};
    const names = Object.keys(subjects);
    if (names.length === 0) { container.innerHTML = '<p class="empty-msg">No subjects available</p>'; return; }
    names.forEach(subject => {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.innerHTML = `<h4>${subject}</h4><span>${subjects[subject].length} chapters →</span>`;
        card.onclick = () => alert('📖 Chapters:\n' + subjects[subject].join('\n'));
        container.appendChild(card);
    });
}

// ===== TESTS =====
function startFullTest() {
    const questions = questionBank.map((q, i) => ({ ...q, id: i }));
    startTest(questions, 'Full Syllabus Test');
}

function showSubjectWise
