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

function showSubjectWise() {
    const subjects = appData.classes[currentClass]?.subjects || {};
    const names = Object.keys(subjects);
    if (names.length === 0) { alert('No subjects available'); return; }
    let msg = 'Select a subject:\n';
    names.forEach((s, i) => msg += `${i+1}. ${s}\n`);
    const choice = prompt(msg);
    if (choice) {
        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < names.length) {
            const questions = questionBank.map((q, i) => ({ ...q, id: i }));
            startTest(questions, `${names[idx]} Test`);
        }
    }
}

function showChapterWise() {
    const subjects = appData.classes[currentClass]?.subjects || {};
    const names = Object.keys(subjects);
    if (names.length === 0) { alert('No subjects available'); return; }
    let msg = 'Select Subject:\n';
    names.forEach((s, i) => msg += `${i+1}. ${s}\n`);
    const choice = prompt(msg);
    if (choice) {
        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < names.length) {
            const chapters = subjects[names[idx]];
            let msg2 = 'Select Chapter:\n';
            chapters.forEach((c, i) => msg2 += `${i+1}. ${c}\n`);
            const ch = prompt(msg2);
            if (ch) {
                const questions = questionBank.map((q, i) => ({ ...q, id: i }));
                startTest(questions, `${names[idx]} - ${chapters[parseInt(ch)-1] || 'Chapter'}`);
            }
        }
    }
}

function startTest(questions, title) {
    currentQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    testStartTime = Date.now();
    document.getElementById('testTitle').textContent = title;
    navigateTo('test');
    renderQuestion();
}

function renderQuestion() {
    const container = document.getElementById('testContent');
    const q = currentQuestions[currentQuestionIndex];
    if (!q) { submitTest(); return; }
    const total = currentQuestions.length;
    let html = `<div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
            <span style="font-weight:700;">Question ${currentQuestionIndex+1}/${total}</span>
            <span style="color:#667eea;">⏱ ${Math.floor((Date.now()-testStartTime)/1000)}s</span>
        </div>
        <h3 style="margin-bottom:20px;">${q.q}</h3>`;
    q.options.forEach((opt, i) => {
        const checked = userAnswers[currentQuestionIndex] === i ? 'checked' : '';
        html += `<label style="display:block;padding:12px 16px;margin-bottom:10px;background:#f8f9fa;border-radius:12px;cursor:pointer;border:2px solid ${userAnswers[currentQuestionIndex]===i?'#667eea':'transparent'};">
            <input type="radio" name="q" value="${i}" ${checked} onchange="selectAnswer(${i})" style="margin-right:12px;">
            ${opt}
        </label>`;
    });
    html += `<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
        <button onclick="prevQuestion()" class="btn-secondary" style="flex:1;" ${currentQuestionIndex===0?'disabled':''}>← Previous</button>
        <button onclick="nextQuestion()" class="btn-primary" style="flex:1;">${currentQuestionIndex===total-1?'Submit ✓':'Next →'}</button>
    </div></div>`;
    container.innerHTML = html;
    // Dark theme support
    if (document.body.classList.contains('dark')) {
        container.querySelectorAll('div, label, h3').forEach(el => el.style.background = '#2a2a3e');
    }
}

function selectAnswer(index) {
    userAnswers[currentQuestionIndex] = index;
}

function nextQuestion() {
    if (userAnswers[currentQuestionIndex] === null) {
        alert('Please select an answer before proceeding.');
        return;
    }
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        submitTest();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function closeTest() {
    if (confirm('Are you sure you want to exit the test? Progress will be lost.')) {
        navigateTo('tests');
    }
}

function submitTest() {
    if (!confirm('Submit your test? You cannot change answers after submission.')) return;
    let correct = 0;
    currentQuestions.forEach((q, i) => {
        if (userAnswers[i] === q.correct) correct++;
    });
    const total = currentQuestions.length;
    const score = Math.round((correct / total) * 100);
    const xpEarned = correct * 10;
    userXP += xpEarned;
    // Save result
    const result = {
        title: document.getElementById('testTitle').textContent,
        date: new Date().toISOString(),
        total, correct, wrong: total - correct, score, xpEarned,
        answers: userAnswers,
        questions: currentQuestions,
        timeTaken: Math.floor((Date.now() - testStartTime) / 1000)
    };
    // Update user
    const users = JSON.parse(localStorage.getItem('notesWallahUsers') || '[]');
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) {
        users[idx].xp = userXP;
        if (!users[idx].tests) users[idx].tests = [];
        users[idx].tests.push(result);
        localStorage.setItem('notesWallahUsers', JSON.stringify(users));
        currentUser = users[idx];
        localStorage.setItem('notesWallahSession', JSON.stringify(currentUser));
    }
    showResult(result);
}

function showResult(result) {
    document.getElementById('resultContent').innerHTML = `
        <div style="background:white;padding:24px;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:60px;">${result.score >= 70 ? '🎉' : '📊'}</div>
                <h2 style="margin:8px 0;">${result.score}%</h2>
                <p style="color:#666;">${result.title}</p>
                <p>⭐ +${result.xpEarned} XP</p>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center;margin:16px 0;">
                <div style="background:#e8f5e9;padding:12px;border-radius:12px;"><strong>${result.correct}</strong><br>Correct</div>
                <div style="background:#ffebee;padding:12px;border-radius:12px;"><strong>${result.wrong}</strong><br>Wrong</div>
                <div style="background:#e3f2fd;padding:12px;border-radius:12px;"><strong>${result.total}</strong><br>Total</div>
            </div>
            <h4 style="margin:16px 0 8px;">📝 Review Answers</h4>`;
    result.questions.forEach((q, i) => {
        const userAns = result.answers[i];
        const correct = q.correct;
        const isCorrect = userAns === correct;
        document.getElementById('resultContent').innerHTML += `
            <div style="padding:12px;margin-bottom:8px;border-left:4px solid ${isCorrect ? '#4caf50' : '#f44336'};background:#f8f9fa;border-radius:8px;">
                <strong>Q${i+1}:</strong> ${q.q}<br>
                <span style="color:${isCorrect ? '#4caf50' : '#f44336'};">Your answer: ${userAns !== null ? q.options[userAns] : 'Not answered'}</span><br>
                <span style="color:#4caf50;">Correct: ${q.options[correct]}</span><br>
                <small style="color:#666;">💡 ${q.explanation}</small>
            </div>`;
    });
    document.getElementById('resultContent').innerHTML += `
            <button onclick="navigateTo('home')" class="btn-primary" style="margin-top:16px;">🏠 Go Home</button>
            <button onclick="exportResult()" class="btn-secondary" style="margin-top:8px;">📥 Export Result</button>
            <!-- AD PLACEHOLDER - Rewarded Ad -->
            <div class="ad-placeholder" style="margin-top:16px;">🎯 Rewarded Ad Space (Watch for extra XP)</div>
        </div>
    `;
    navigateTo('result');
    updateProgress();
}

// ===== EXPORT =====
function exportResult() {
    alert('📄 Exporting result as text...\n(Full PDF export coming in next update)');
    const content = document.getElementById('resultContent').innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `NotesWallah_Result_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
}

function exportResults() {
    const users = JSON.parse(localStorage.getItem('notesWallahUsers') || '[]');
    const user = users.find(u => u.email === currentUser?.email);
    if (!user || !user.tests || user.tests.length === 0) {
        alert('No results to export');
        return;
    }
    let text = '📚 NOTES WALLAH - Test Results\n';
    text += `Student: ${user.name}\nClass: ${user.class}\nXP: ${user.xp}\n\n`;
    user.tests.forEach((t, i) => {
        text += `--- Test ${i+1}: ${t.title} ---\n`;
        text += `Date: ${new Date(t.date).toLocaleDateString()}\n`;
        text += `Score: ${t.score}% (${t.correct}/${t.total})\n`;
        text += `XP Earned: +${t.xpEarned}\n\n`;
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `NotesWallah_AllResults.txt`;
    a.click();
}

// ===== THEME =====
function loadTheme() {
    const saved = localStorage.getItem('notesWallahTheme');
    if (saved) { currentTheme = saved; document.getElementById('themeSelect').value = saved; applyTheme(saved); }
}
function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    currentTheme = theme;
    localStorage.setItem('notesWallahTheme', theme);
    applyTheme(theme);
}
function applyTheme(theme) {
    if (theme === 'dark') document.body.classList.add('dark');
    else if (theme === 'light') document.body.classList.remove('dark');
    else if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) document.body.classList.add('dark');
        else document.body.classList.remove('dark');
    }
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') applyTheme('system');
});

// ===== PASSWORD =====
function showChangePassword() { document.getElementById('passwordModal').style.display = 'flex'; }
function closeModal() { document.getElementById('passwordModal').style.display = 'none'; }
function changePassword() {
    const current = document.getElementById('currentPass').value;
    const newPass = document.getElementById('newPass').value;
    const confirm = document.getElementById('confirmNewPass').value;
    if (!current || !newPass || !confirm) { alert('Please fill all fields'); return; }
    if (current !== currentUser.password) { alert('Current password is incorrect'); return; }
    if (newPass !== confirm) { alert('New passwords do not match'); return; }
    if (newPass.length < 6) { alert('Password must be at least 6 characters'); return; }
    const users = JSON.parse(localStorage.getItem('notesWallahUsers') || '[]');
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) {
        users[idx].password = newPass;
        localStorage.setItem('notesWallahUsers', JSON.stringify(users));
        currentUser.password = newPass;
        localStorage.setItem('notesWallahSession', JSON.stringify(currentUser));
        alert('Password changed successfully!');
        closeModal();
        document.getElementById('currentPass').value = '';
        document.getElementById('newPass').value = '';
        document.getElementById('confirmNewPass').value = '';
    }
}

// ===== PROGRESS =====
function updateProgress() {
    const users = JSON.parse(localStorage.getItem('notesWallahUsers') || '[]');
    const user = users.find(u => u.email === currentUser?.email);
    if (user) {
        userXP = user.xp || 0;
        document.getElementById('xpDisplay').textContent = userXP;
        document.getElementById('profileXP').textContent = userXP;
        const tests = user.tests || [];
        document.getElementById('testsCompleted').textContent = tests.length;
        if (tests.length > 0) {
            const total = tests.reduce((sum, t) => sum + t.score, 0);
            const avg = Math.round(total / tests.length);
            document.getElementById('avgScore').textContent = avg + '%';
            document.getElementById('progressFill').style.width = avg + '%';
            const level = avg >= 80 ? '🌟 Advanced' : avg >= 50 ? '📈 Intermediate' : '📚 Beginner';
            document.getElementById('userLevel').textContent = level;
        }
    }
}

function updateDashboard() { updateProgress(); }
