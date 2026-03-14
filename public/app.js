/**
 * Student Study Planner - Frontend Application
 * Features: Multi-language, Session Management, Local Storage, Interactive Checkboxes
 */

// Translations
const translations = {
    en: {
        title: "Student Study Planner - AI-Powered",
        points: "Points",
        level: "Level",
        streak: "Streak",
        badges: "Badges",
        sessions: "Sessions",
        appTitle: "📚 Student Study Planner",
        subtitle: "Upload your study materials and let AI create your perfect study plan",
        deleteSession: "Delete Session",
        dropFiles: "Drop your files here",
        orClick: "or click to browse",
        supports: "Supports: PDF, DOCX, TXT, MD",
        deadline: "Study Deadline",
        dailyHours: "Daily Study Hours",
        generatePlan: "Generate Study Plan",
        generating: "Generating...",
        creating: "Creating your study plan...",
        analyzing: "AI is analyzing your materials",
        yourPlan: "📋 Your Study Plan",
        summary: "🎯 Summary",
        schedule: "📅 Day-by-Day Schedule",
        download: "Download Plan",
        newPlan: "Create New Plan",
        somethingWrong: "Something went wrong",
        tryAgain: "Try Again",
        poweredBy: "Powered by NanoGPT AI • Built for students",
        newSession: "New Session",
        confirmDelete: "Are you sure you want to delete this session?",
        untitledSession: "Untitled Session",
        progress: "Progress",
        completed: "completed",
        resetApp: "Reset App",
        dailyFeedback: "Daily Feedback",
        addFeedback: "Add Feedback",
        voiceNote: "Voice Note",
        photo: "Photo",
        textNote: "Text Note",
        submitFeedback: "Submit Feedback",
        dailyQuiz: "Daily Quiz",
        startQuiz: "Start Quiz",
        checkAnswer: "Check Answer",
        mindMap: "Mind Map",
        generateMindMap: "Generate Mind Map",
        points: "Points",
        level: "Level",
        streak: "Streak",
        gamification: "Study Adventure",
        badges: "Badges",
        badgeFirstDay: "First Step",
        badgeHalfway: "Halfway Hero",
        badgeCompleted: "Study Master",
        badgeStreak3: "3-Day Streak",
        badgeStreak7: "Week Warrior"
    },
    ar: {
        title: "مخطط الدراسة - بالذكاء الاصطناعي",
        points: "نقاط",
        level: "مستوى",
        streak: "سلسلة",
        badges: "شارات",
        sessions: "الجلسات",
        appTitle: "📚 مخطط الدراسة",
        subtitle: "ارفع موادك الدراسية ودع الذكاء الاصطناعي ينشئ خطتك المثالية",
        deleteSession: "حذف الجلسة",
        dropFiles: "أسقط ملفاتك هنا",
        orClick: "أو انقر للتصفح",
        supports: "الصيغ المدعومة: PDF, DOCX, TXT, MD",
        deadline: "موعد الامتحان",
        dailyHours: "ساعات الدراسة اليومية",
        generatePlan: "إنشاء خطة الدراسة",
        generating: "جاري الإنشاء...",
        creating: "جاري إنشاء خطتك...",
        analyzing: "الذكاء الاصطناعي يحلل موادك",
        yourPlan: "📋 خطتك الدراسية",
        summary: "🎯 ملخص",
        schedule: "📅 الجدول اليومي",
        download: "تحميل الخطة",
        newPlan: "إنشاء خطة جديدة",
        somethingWrong: "حدث خطأ ما",
        tryAgain: "حاول مرة أخرى",
        poweredBy: "مدعوم بواسطة NanoGPT AI • مخصص للطلاب",
        newSession: "جلسة جديدة",
        confirmDelete: "هل أنت متأكد من حذف هذه الجلسة؟",
        untitledSession: "جلسة بدون اسم",
        progress: "التقدم",
        completed: "مكتمل",
        resetApp: "إعادة تعيين",
        dailyFeedback: "تقييم اليوم",
        addFeedback: "إضافة تقييم",
        voiceNote: "ملاحظة صوتية",
        photo: "صورة",
        textNote: "ملاحظة نصية",
        submitFeedback: "إرسال التقييم",
        dailyQuiz: "اختبار اليوم",
        startQuiz: "بدء الاختبار",
        checkAnswer: "تحقق من الإجابة",
        mindMap: "خريطة ذهنية",
        generateMindMap: "إنشاء خريطة ذهنية",
        points: "نقاط",
        level: "مستوى",
        streak: "سلسلة أيام",
        gamification: "مغامرة الدراسة",
        badges: "شارات",
        badgeFirstDay: "الخطوة الأولى",
        badgeHalfway: "بطل منتصف الطريق",
        badgeCompleted: "سيد الدراسة",
        badgeStreak3: "سلسلة 3 أيام",
        badgeStreak7: "محارب الأسبوع"
    }
};

// Global state
const state = {
    files: [],
    extractedTexts: [],
    isGenerating: false,
    currentLanguage: localStorage.getItem('studyPlanner_lang') || 'en',
    sessions: [],
    sessionCounter: Number(localStorage.getItem('studyPlanner_sessionCounter') || 0),
    currentSessionId: null,
    studyPlan: null,
    completedTasks: new Set(),
    gamification: {
        points: parseInt(localStorage.getItem('studyPlanner_points') || '0'),
        level: parseInt(localStorage.getItem('studyPlanner_level') || '1'),
        streak: parseInt(localStorage.getItem('studyPlanner_streak') || '0'),
        badges: JSON.parse(localStorage.getItem('studyPlanner_badges') || '[]'),
        lastStudyDate: localStorage.getItem('studyPlanner_lastStudyDate') || null
    }
};

// DOM Elements
let elements = {};

// Initialize
function init() {
    cacheElements();
    initLanguage();
    initSessions();
    initEventListeners();
    updateGamificationDisplay();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    elements.deadlineInput.min = today;
    
    // Auto-save every 30 seconds
    setInterval(autoSave, 30000);
    
    // Save on page unload
    window.addEventListener('beforeunload', autoSave);
}

// Update gamification display
function updateGamificationDisplay() {
    const pointsDisplay = document.getElementById('pointsDisplay');
    const levelDisplay = document.getElementById('levelDisplay');
    const streakDisplay = document.getElementById('streakDisplay');
    const badgesCount = document.getElementById('badgesCount');
    
    if (pointsDisplay) pointsDisplay.textContent = state.gamification.points;
    if (levelDisplay) levelDisplay.textContent = state.gamification.level;
    if (streakDisplay) streakDisplay.textContent = state.gamification.streak;
    if (badgesCount) badgesCount.textContent = state.gamification.badges.length;
}

// Cache DOM elements
function cacheElements() {
    elements = {
        uploadArea: document.getElementById('uploadArea'),
        fileInput: document.getElementById('fileInput'),
        fileList: document.getElementById('fileList'),
        deadlineInput: document.getElementById('deadlineInput'),
        hoursInput: document.getElementById('hoursInput'),
        generateBtn: document.getElementById('generateBtn'),
        uploadSection: document.getElementById('uploadSection'),
        loadingSection: document.getElementById('loadingSection'),
        resultsSection: document.getElementById('resultsSection'),
        errorSection: document.getElementById('errorSection'),
        timeline: document.getElementById('timeline'),
        summaryContent: document.getElementById('summaryContent'),
        totalDays: document.getElementById('totalDays'),
        totalHours: document.getElementById('totalHours'),
        deadlineDisplay: document.getElementById('deadlineDisplay'),
        progressDisplay: document.getElementById('progressDisplay'),
        errorMessage: document.getElementById('errorMessage'),
        retryBtn: document.getElementById('retryBtn'),
        newPlanBtn: document.getElementById('newPlanBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        sidebar: document.getElementById('sidebar'),
        sessionsList: document.getElementById('sessionsList'),
        menuToggle: document.getElementById('menuToggle'),
        newSessionBtn: document.getElementById('newSessionBtn'),
        currentSessionName: document.getElementById('currentSessionName'),
        deleteSessionBtn: document.getElementById('deleteSessionBtn'),
        sessionInfo: document.getElementById('sessionInfo')
    };
}

// Language management
function initLanguage() {
    document.documentElement.lang = state.currentLanguage;
    document.documentElement.dir = state.currentLanguage === 'ar' ? 'rtl' : 'ltr';
    updateLanguageUI();
}

function updateLanguageUI() {
    const t = translations[state.currentLanguage];
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    // Update lang buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === state.currentLanguage);
    });
}

function setLanguage(lang) {
    state.currentLanguage = lang;
    localStorage.setItem('studyPlanner_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    updateLanguageUI();
}

// Session management
function initSessions() {
    const saved = localStorage.getItem('studyPlanner_sessions');

    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
            state.sessionCounter = Number(parsed.sessionCounter || 0);

            // Keep counter monotonic even if storage was partially reset
            const maxExistingNumber = state.sessions.reduce((max, s) => {
                const match = (s.name || '').match(/\d+/);
                return match ? Math.max(max, parseInt(match[0], 10)) : max;
            }, 0);
            state.sessionCounter = Math.max(state.sessionCounter, maxExistingNumber);

            if (state.sessions.length > 0) {
                const requestedId = parsed.currentSessionId;
                const exists = state.sessions.some(s => s.id === requestedId);
                state.currentSessionId = exists ? requestedId : state.sessions[0].id;
                loadSession(state.currentSessionId);
            } else {
                createNewSession();
            }
        } catch (e) {
            console.error('Failed to load sessions:', e);
            state.sessions = [];
            state.sessionCounter = 0;
            createNewSession();
        }
    } else {
        state.sessions = [];
        state.sessionCounter = Number(localStorage.getItem('studyPlanner_sessionCounter') || 0);
        createNewSession();
    }

    renderSessionsList();
}

function createNewSession() {
    const t = translations[state.currentLanguage];

    if (!Number.isFinite(state.sessionCounter)) {
        state.sessionCounter = 0;
    }
    state.sessionCounter += 1;

    const newSession = {
        id: 'session_' + Date.now(),
        name: `${t.newSession} ${state.sessionCounter}`,
        createdAt: new Date().toISOString(),
        files: [],
        extractedTexts: [],
        deadline: '',
        dailyHours: 3,
        studyPlan: null,
        completedTasks: [],
        dailyFeedback: {}
    };

    state.sessions.unshift(newSession);
    state.currentSessionId = newSession.id;

    resetUI();
    elements.currentSessionName.textContent = newSession.name;
    renderSessionsList();
    saveSessions();

    return newSession;
}

function loadSession(sessionId) {
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return;

    state.currentSessionId = sessionId;
    state.files = session.files || [];
    state.extractedTexts = session.extractedTexts || [];
    state.studyPlan = session.studyPlan || null;
    state.completedTasks = new Set(session.completedTasks || []);

    // Restore UI state
    elements.deadlineInput.value = session.deadline || '';
    elements.hoursInput.value = session.dailyHours || 3;
    elements.currentSessionName.textContent = session.name || translations[state.currentLanguage].untitledSession;

    renderFileList();

    if (state.studyPlan) {
        displayResults(state.studyPlan);
    } else {
        elements.uploadSection.hidden = false;
        elements.loadingSection.hidden = true;
        elements.resultsSection.hidden = true;
        elements.errorSection.hidden = true;
    }

    renderSessionsList();
}

function saveSessions() {
    const session = state.sessions.find(s => s.id === state.currentSessionId);
    if (session) {
        session.files = state.files;
        session.extractedTexts = state.extractedTexts;
        session.deadline = elements.deadlineInput.value;
        session.dailyHours = elements.hoursInput.value;
        session.studyPlan = state.studyPlan;
        session.completedTasks = Array.from(state.completedTasks);
        session.name = elements.currentSessionName.textContent;
    }

    localStorage.setItem('studyPlanner_sessionCounter', String(state.sessionCounter || 0));
    localStorage.setItem('studyPlanner_sessions', JSON.stringify({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        sessionCounter: state.sessionCounter || 0
    }));
}

function autoSave() {
    if (state.currentSessionId) {
        saveSessions();
    }
}

function deleteSession(sessionId) {
    const t = translations[state.currentLanguage];
    if (!sessionId) return;
    if (!confirm(t.confirmDelete)) return;

    state.sessions = state.sessions.filter(s => s.id !== sessionId);

    if (state.sessions.length === 0) {
        state.currentSessionId = null;
        createNewSession();
        return;
    }

    if (state.currentSessionId === sessionId) {
        state.currentSessionId = state.sessions[0].id;
        loadSession(state.currentSessionId);
    }

    renderSessionsList();
    saveSessions();
}

function renderSessionsList() {
    const t = translations[state.currentLanguage];
    
    elements.sessionsList.innerHTML = state.sessions.map(session => {
        const date = new Date(session.createdAt).toLocaleDateString(
            state.currentLanguage === 'ar' ? 'ar-SA' : 'en-US'
        );
        const isActive = session.id === state.currentSessionId;
        
        return `
            <div class="session-item ${isActive ? 'active' : ''}" data-session-id="${session.id}">
                <div class="session-info-text">
                    <div class="session-title">${escapeHtml(session.name)}</div>
                    <div class="session-date">${date}</div>
                </div>
                <button class="session-delete" data-session-id="${session.id}" title="${t.deleteSession}">🗑</button>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    elements.sessionsList.querySelectorAll('.session-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('session-delete')) {
                loadSession(item.dataset.sessionId);
            }
        });
    });
    
    elements.sessionsList.querySelectorAll('.session-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteSession(btn.dataset.sessionId);
        });
    });

    updateSessionControls();
}

function resetUI() {
    state.files = [];
    state.extractedTexts = [];
    state.studyPlan = null;
    state.completedTasks = new Set();
    state.isGenerating = false;
    
    elements.fileList.innerHTML = '';
    elements.deadlineInput.value = '';
    elements.hoursInput.value = '3';
    const activeSession = state.sessions.find(s => s.id === state.currentSessionId);
    elements.currentSessionName.textContent = activeSession?.name || translations[state.currentLanguage].untitledSession;
    
    elements.uploadSection.hidden = false;
    elements.loadingSection.hidden = true;
    elements.resultsSection.hidden = true;
    elements.errorSection.hidden = true;
    
    updateGenerateButton();
}

// Event Listeners
function initEventListeners() {
    // File upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    
    // Generate
    elements.generateBtn.addEventListener('click', generateStudyPlan);
    elements.deadlineInput.addEventListener('change', updateGenerateButton);
    
    // Navigation
    elements.retryBtn.addEventListener('click', resetUI);
    elements.newPlanBtn.addEventListener('click', resetUI);
    elements.downloadBtn.addEventListener('click', downloadPlan);
    
    // Reset app button
    const resetAppBtn = document.getElementById('resetAppBtn');
    if (resetAppBtn) {
        resetAppBtn.addEventListener('click', resetApp);
    }
    
    // Sidebar
    elements.menuToggle.addEventListener('click', toggleSidebar);
    elements.newSessionBtn.addEventListener('click', createNewSession);
    elements.deleteSessionBtn.addEventListener('click', () => deleteSession(state.currentSessionId));
    
    // Initialize sidebar close handlers
    initSidebarCloseHandlers();
    
    // Language
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
}

function updateSessionControls() {
    if (!elements.deleteSessionBtn) return;

    const canDelete = state.sessions.length > 1;
    elements.deleteSessionBtn.disabled = !canDelete;
    elements.deleteSessionBtn.style.opacity = canDelete ? '1' : '0.5';
    elements.deleteSessionBtn.style.cursor = canDelete ? 'pointer' : 'not-allowed';
}

function toggleSidebar() {
    elements.sidebar.classList.toggle('open');
}

// Close sidebar when clicking on main wrapper
function initSidebarCloseHandlers() {
    // Close when clicking on main wrapper
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) {
        mainWrapper.addEventListener('click', (e) => {
            if (elements.sidebar.classList.contains('open') && 
                !elements.sidebar.contains(e.target) && 
                !elements.menuToggle.contains(e.target)) {
                elements.sidebar.classList.remove('open');
            }
        });
    }
    
    // Close when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.sidebar.classList.contains('open')) {
            elements.sidebar.classList.remove('open');
        }
    });
}

// Drag and drop
function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

// File management
function addFiles(files) {
    const validTypes = ['.pdf', '.docx', '.txt', '.md'];
    
    files.forEach(file => {
        const hasValidExtension = validTypes.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );
        
        if (hasValidExtension) {
            if (!state.files.find(f => f.name === file.name && f.size === file.size)) {
                // Store file info (not the actual File object for localStorage)
                state.files.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                });
                
                // Extract text
                extractFileText(file);
            }
        }
    });
    
    renderFileList();
    updateGenerateButton();
    autoSave();
}

function renderFileList() {
    elements.fileList.innerHTML = state.files.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <span class="file-icon">${getFileIcon(file.name)}</span>
                <div>
                    <div class="file-name">${escapeHtml(file.name)}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button class="file-remove" data-index="${index}" title="Remove">✕</button>
        </div>
    `).join('');
    
    elements.fileList.querySelectorAll('.file-remove').forEach(btn => {
        btn.addEventListener('click', () => removeFile(parseInt(btn.dataset.index)));
    });
}

function removeFile(index) {
    state.files.splice(index, 1);
    state.extractedTexts.splice(index, 1);
    renderFileList();
    updateGenerateButton();
    autoSave();
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = { pdf: '📕', docx: '📘', txt: '📄', md: '📝' };
    return icons[ext] || '📄';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function safeCssColor(value) {
    if (typeof value !== 'string') return '#6366f1';
    const trimmed = value.trim();
    const hexOk = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed);
    const rgbOk = /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/.test(trimmed);
    const namedOk = /^[a-zA-Z]{3,20}$/.test(trimmed);
    return (hexOk || rgbOk || namedOk) ? trimmed : '#6366f1';
}

function updateGenerateButton() {
    const hasFiles = state.files.length > 0;
    const hasDeadline = elements.deadlineInput.value !== '';
    elements.generateBtn.disabled = !(hasFiles && hasDeadline);
}

// Text extraction
async function extractFileText(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    // File size validation (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const maxSizeMB = (MAX_SIZE / (1024 * 1024)).toFixed(0);
        const errorMsg = state.currentLanguage === 'ar'
            ? `الملف "${file.name}" (${sizeMB} MB) أكبر من الحد المسموح (${maxSizeMB} MB)`
            : `File "${file.name}" (${sizeMB} MB) exceeds maximum size (${maxSizeMB} MB)`;
        alert(errorMsg);
        return;
    }

    try {
        let text = '';

        if (ext === 'txt' || ext === 'md') {
            text = await file.text();
        } else if (ext === 'pdf' || ext === 'docx') {
            text = `[${ext.toUpperCase()} file: ${file.name} - Content will be processed]`;
        }

        state.extractedTexts.push({
            filename: file.name,
            content: text,
            size: file.size
        });

        autoSave();
    } catch (error) {
        console.error(`Error extracting text from ${file.name}:`, error);
        state.extractedTexts.push({
            filename: file.name,
            content: `[Error extracting content from ${file.name}]`
        });
    }
}

// Generate study plan
async function generateStudyPlan() {
    if (state.files.length === 0 || !elements.deadlineInput.value) return;
    
    state.isGenerating = true;
    elements.uploadSection.hidden = true;
    elements.loadingSection.hidden = false;
    elements.errorSection.hidden = true;
    
    try {
        const combinedText = state.extractedTexts
            .map(t => `=== ${t.filename} ===\n${t.content}`)
            .join('\n\n');
        
        const requestData = {
            studyMaterials: combinedText.substring(0, 100000),
            deadline: elements.deadlineInput.value,
            dailyHours: parseInt(elements.hoursInput.value, 10) || 3,
            language: state.currentLanguage,
            task: 'plan'
        };
        
        const response = await fetch('/api/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        state.studyPlan = data;
        displayResults(data);
        autoSave();
        
    } catch (error) {
        console.error('Error:', error);
        state.isGenerating = false;
        elements.loadingSection.hidden = true;
        showError(error.message);
    }
}

// Display results
function displayResults(data) {
    const t = translations[state.currentLanguage];
    
    elements.loadingSection.hidden = true;
    elements.resultsSection.hidden = false;
    
    elements.totalDays.textContent = `📅 ${data.totalDays} ${state.currentLanguage === 'ar' ? 'أيام' : 'days'}`;
    elements.totalHours.textContent = `⏰ ${data.totalHours} ${state.currentLanguage === 'ar' ? 'ساعة' : 'hours total'}`;
    elements.deadlineDisplay.textContent = `🎯 ${t.deadline}: ${formatDate(data.deadline)}`;
    
    elements.summaryContent.innerHTML = formatSummary(data.summary);
    
    renderTimeline(data.schedule);
    updateProgress();
}

function renderTimeline(schedule) {
    const t = translations[state.currentLanguage];
    const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
    
    elements.timeline.innerHTML = schedule.map((day, dayIndex) => {
        const dayFeedback = currentSession?.dailyFeedback?.[dayIndex] || {};
        const hasFeedback = dayFeedback.submitted;
        const dayCompleted = day.tasks.every((_, taskIndex) => 
            state.completedTasks.has(`${dayIndex}-${taskIndex}`)
        );
        
        return `
        <div class="day-card ${dayCompleted ? 'day-completed' : ''}" style="animation-delay: ${dayIndex * 0.1}s" data-day-index="${dayIndex}">
            <div class="day-header">
                <span class="day-number">${day.day}</span>
                <span class="day-date">${formatDate(day.date)}</span>
                ${dayCompleted ? '<span class="day-badge">✓</span>' : ''}
            </div>
            <div class="day-topics">
                <h4>${state.currentLanguage === 'ar' ? 'المواضيع' : 'Topics to Cover'}</h4>
                <ul>
                    ${day.topics.map(topic => `<li>${escapeHtml(topic)}</li>`).join('')}
                </ul>
            </div>
            <div class="day-tasks">
                <h4>${state.currentLanguage === 'ar' ? 'المهام' : 'Tasks'}</h4>
                ${day.tasks.map((task, taskIndex) => {
                    const taskId = `${dayIndex}-${taskIndex}`;
                    const isCompleted = state.completedTasks.has(taskId);
                    return `
                        <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-id="${taskId}">
                            <div class="task-checkbox ${isCompleted ? 'checked' : ''}"></div>
                            <div class="task-text">${escapeHtml(task.description)}</div>
                            <div class="task-time">${task.duration} ${state.currentLanguage === 'ar' ? 'د' : 'min'}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <!-- Daily Actions -->
            <div class="day-actions">
                <button class="btn-day-action ${hasFeedback ? 'active' : ''}" data-action="feedback" data-day="${dayIndex}">
                    📝 ${t.dailyFeedback}
                </button>
                <button class="btn-day-action" data-action="quiz" data-day="${dayIndex}">
                    ❓ ${t.dailyQuiz}
                </button>
                <button class="btn-day-action" data-action="mindmap" data-day="${dayIndex}">
                    🧠 ${t.mindMap}
                </button>
            </div>
            
            ${hasFeedback ? `
            <div class="day-feedback-summary">
                <p>✓ ${state.currentLanguage === 'ar' ? 'تم إرسال التقييم' : 'Feedback submitted'}</p>
            </div>
            ` : ''}
        </div>
    `}).join('');
    
    // Add click handlers for checkboxes
    elements.timeline.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', () => toggleTask(item.dataset.taskId));
    });

    // Event delegation for day action buttons
    elements.timeline.querySelectorAll('.btn-day-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const day = Number.parseInt(btn.dataset.day || '0', 10);
            const action = btn.dataset.action;
            if (action === 'feedback') {
                openFeedbackModal(day);
            } else if (action === 'quiz') {
                openQuizModal(day);
            } else if (action === 'mindmap') {
                generateMindMap(day);
            }
        });
    });
}

function toggleTask(taskId) {
    if (state.completedTasks.has(taskId)) {
        state.completedTasks.delete(taskId);
    } else {
        state.completedTasks.add(taskId);
    }
    
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        taskElement.classList.toggle('completed');
        taskElement.querySelector('.task-checkbox').classList.toggle('checked');
    }
    
    updateProgress();
    autoSave();
}

function updateProgress() {
    const t = translations[state.currentLanguage];
    
    if (!state.studyPlan || !state.studyPlan.schedule) return;
    
    let totalTasks = 0;
    state.studyPlan.schedule.forEach(day => {
        totalTasks += day.tasks.length;
    });
    
    const completedCount = state.completedTasks.size;
    const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    
    elements.progressDisplay.textContent = `📊 ${t.progress}: ${percentage}% ${t.completed}`;
}

function formatSummary(summary) {
    return escapeHtml(summary)
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.+)$/gm, '<p>$1</p>');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(state.currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function showError(message) {
    elements.errorSection.hidden = false;
    elements.errorMessage.textContent = message;
}

function downloadPlan() {
    if (!state.studyPlan) return;
    
    const planData = {
        title: 'Study Plan',
        created: new Date().toISOString(),
        completedTasks: Array.from(state.completedTasks),
        ...state.studyPlan
    };
    
    const blob = new Blob([JSON.stringify(planData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-plan-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetApp() {
    if (confirm(state.currentLanguage === 'ar' ? 
        'هل أنت متأكد؟ سيتم حذف جميع الجلسات والبيانات.' : 
        'Are you sure? All sessions and data will be deleted.')) {
        localStorage.removeItem('studyPlanner_sessions');
        localStorage.removeItem('studyPlanner_lang');
        localStorage.removeItem('studyPlanner_points');
        localStorage.removeItem('studyPlanner_level');
        localStorage.removeItem('studyPlanner_streak');
        localStorage.removeItem('studyPlanner_badges');
        localStorage.removeItem('studyPlanner_lastStudyDate');
        localStorage.removeItem('studyPlanner_sessionCounter');
        window.location.reload();
    }
}

// ==================== NEW FEATURES: Feedback, Quiz, Mind Map, Gamification ====================

// Open feedback modal
function openFeedbackModal(dayIndex) {
    const t = translations[state.currentLanguage];
    const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
    const existingFeedback = currentSession?.dailyFeedback?.[dayIndex] || {};

    const safeExistingText = escapeHtml(existingFeedback.text || '');
    const safeExistingVoice = existingFeedback.voice ? escapeHtml(existingFeedback.voice) : '';
    const safeExistingPhoto = existingFeedback.photo ? escapeHtml(existingFeedback.photo) : '';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.dataset.voiceData = existingFeedback.voice || '';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${t.dailyFeedback} - ${state.currentLanguage === 'ar' ? 'اليوم' : 'Day'} ${dayIndex + 1}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="feedback-tabs">
                    <button class="feedback-tab active" data-tab="text">${t.textNote}</button>
                    <button class="feedback-tab" data-tab="voice">${t.voiceNote}</button>
                    <button class="feedback-tab" data-tab="photo">${t.photo}</button>
                </div>

                <div class="feedback-content" id="text-content">
                    <textarea class="feedback-textarea" placeholder="${state.currentLanguage === 'ar' ? 'اكتب ملاحظاتك عن هذا اليوم... ما تعلمته؟ ما الصعوبات التي واجهتك؟' : 'Write your notes about today... What did you learn? What difficulties did you face?'}">${safeExistingText}</textarea>
                </div>

                <div class="feedback-content hidden" id="voice-content">
                    <div class="voice-recorder">
                        <button class="btn-record" id="recordBtn">🎤 ${state.currentLanguage === 'ar' ? 'ابدأ التسجيل' : 'Start Recording'}</button>
                        <div class="recording-status" id="recordingStatus"></div>
                        <audio id="voicePreview" controls ${safeExistingVoice ? '' : 'hidden'} src="${safeExistingVoice}"></audio>
                    </div>
                </div>

                <div class="feedback-content hidden" id="photo-content">
                    <input type="file" accept="image/*" capture="environment" class="feedback-photo-input" id="photoInput">
                    <div class="photo-preview" id="photoPreview">
                        ${safeExistingPhoto ? `<img src="${safeExistingPhoto}" style="max-width: 100%; margin-top: 10px;">` : ''}
                    </div>
                </div>

                <button class="btn-submit-feedback" data-day="${dayIndex}">
                    ${t.submitFeedback}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    let mediaRecorder = null;
    let mediaStream = null;
    let isRecording = false;
    let audioChunks = [];

    const closeModal = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        modal.remove();
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Tab switching
    modal.querySelectorAll('.feedback-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            modal.querySelectorAll('.feedback-tab').forEach(x => x.classList.remove('active'));
            modal.querySelectorAll('.feedback-content').forEach(c => c.classList.add('hidden'));
            tab.classList.add('active');
            modal.querySelector(`#${tab.dataset.tab}-content`).classList.remove('hidden');
        });
    });

    // Photo preview
    const photoInput = modal.querySelector('#photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                modal.querySelector('#photoPreview').innerHTML = `<img src="${ev.target.result}" style="max-width: 100%; margin-top: 10px;">`;
            };
            reader.readAsDataURL(file);
        });
    }

    // Voice recording (real)
    const recordBtn = modal.querySelector('#recordBtn');
    const recordingStatus = modal.querySelector('#recordingStatus');
    const voicePreview = modal.querySelector('#voicePreview');

    if (recordBtn) {
        recordBtn.addEventListener('click', async () => {
            try {
                if (!isRecording) {
                    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(mediaStream);
                    audioChunks = [];

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const dataUrl = reader.result;
                            modal.dataset.voiceData = dataUrl;
                            voicePreview.src = dataUrl;
                            voicePreview.hidden = false;
                        };
                        reader.readAsDataURL(audioBlob);

                        if (mediaStream) {
                            mediaStream.getTracks().forEach(track => track.stop());
                            mediaStream = null;
                        }
                    };

                    mediaRecorder.start();
                    isRecording = true;
                    recordBtn.classList.add('recording');
                    recordBtn.textContent = `⏹ ${state.currentLanguage === 'ar' ? 'إيقاف التسجيل' : 'Stop Recording'}`;
                    recordingStatus.textContent = state.currentLanguage === 'ar' ? 'جاري التسجيل...' : 'Recording...';
                } else {
                    mediaRecorder?.stop();
                    isRecording = false;
                    recordBtn.classList.remove('recording');
                    recordBtn.textContent = `🎤 ${state.currentLanguage === 'ar' ? 'ابدأ التسجيل' : 'Start Recording'}`;
                    recordingStatus.textContent = state.currentLanguage === 'ar' ? 'تم حفظ التسجيل.' : 'Recording saved.';
                }
            } catch (err) {
                recordingStatus.textContent = state.currentLanguage === 'ar'
                    ? 'تعذر الوصول للميكروفون.'
                    : 'Could not access microphone.';
            }
        });
    }

    const submitBtn = modal.querySelector('.btn-submit-feedback');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => submitFeedback(dayIndex));
    }
}

// Submit feedback
function submitFeedback(dayIndex) {
    const modal = document.querySelector('.modal');
    if (!modal) return;

    const text = modal.querySelector('.feedback-textarea')?.value || '';
    const photoPreview = modal.querySelector('#photoPreview img');
    const voiceData = modal.dataset.voiceData || modal.querySelector('#voicePreview')?.src || null;

    const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
    if (!currentSession) return;
    if (!currentSession.dailyFeedback) {
        currentSession.dailyFeedback = {};
    }

    currentSession.dailyFeedback[dayIndex] = {
        text,
        photo: photoPreview ? photoPreview.src : null,
        voice: voiceData,
        submitted: true,
        submittedAt: new Date().toISOString()
    };

    addPoints(10);

    saveSessions();
    if (state.studyPlan?.schedule) {
        renderTimeline(state.studyPlan.schedule);
    }
    modal.remove();

    alert(state.currentLanguage === 'ar' ? 'تم حفظ التقييم بنجاح! +10 نقاط' : 'Feedback saved successfully! +10 points');
}

// Open quiz modal - Generate from API
async function openQuizModal(dayIndex) {
    const t = translations[state.currentLanguage];
    const day = state.studyPlan.schedule[dayIndex];
    
    // Show loading modal
    const loadingModal = document.createElement('div');
    loadingModal.className = 'modal';
    loadingModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-body" style="text-align: center; padding: 3rem;">
                <div class="spinner" style="margin-bottom: 1rem;"></div>
                <p>${state.currentLanguage === 'ar' ? 'جاري توليد الاختبار...' : 'Generating quiz...'}</p>
            </div>
        </div>
    `;
    document.body.appendChild(loadingModal);
    
    try {
        // Prepare content for quiz generation
        const quizContent = `
Day: ${day.day}
Date: ${day.date}
Topics: ${day.topics.join(', ')}
Tasks: ${day.tasks.map(t => t.description).join(', ')}
        `.trim();
        
        // Call API to generate quiz
        const response = await fetch('/api/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studyMaterials: quizContent,
                language: state.currentLanguage,
                task: 'quiz'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate quiz');
        }
        
        const data = await response.json();
        loadingModal.remove();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        const questions = data.questions || [];
        
        const modal = document.createElement('div');
        modal.className = 'modal quiz-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${t.dailyQuiz} - ${day.day}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="quiz-model-info" style="margin-bottom: 1rem; padding: 0.5rem; background: var(--surface-light); border-radius: 8px; font-size: 0.8rem; color: var(--text-muted);">
                        ${state.currentLanguage === 'ar' ? 'مولد بواسطة:' : 'Generated by:'} ${escapeHtml(data.model || '')}
                    </div>
                    <div class="quiz-container">
                        ${questions.map((q, i) => `
                            <div class="quiz-question" data-question="${i}" data-correct="${Number.isInteger(q.correct) ? q.correct : 0}">
                                <p class="question-text">${i + 1}. ${escapeHtml(q.question || '')}</p>
                                <div class="quiz-options">
                                    ${(Array.isArray(q.options) ? q.options : []).map((opt, j) => `
                                        <label class="quiz-option">
                                            <input type="radio" name="q${i}" value="${j}">
                                            <span>${escapeHtml(String(opt))}</span>
                                        </label>
                                    `).join('')}
                                </div>
                                <div class="quiz-result" id="result${i}"></div>
                                <div class="quiz-explanation hidden" id="explanation${i}" style="margin-top: 0.5rem; padding: 0.75rem; background: rgba(99, 102, 241, 0.1); border-radius: 8px; font-size: 0.9rem;">
                                    <strong>${state.currentLanguage === 'ar' ? 'الشرح:' : 'Explanation:'}</strong> ${escapeHtml(q.explanation || '')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-submit-quiz" data-day="${dayIndex}">
                        ${t.checkAnswer}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
    } catch (error) {
        loadingModal.remove();
        console.error('Quiz generation error:', error);
        alert(state.currentLanguage === 'ar' 
            ? 'فشل في توليد الاختبار. جاري استخدام الاختبار الافتراضي...' 
            : 'Failed to generate quiz. Using default quiz...');
        
        // Fallback to simple quiz
        openFallbackQuizModal(day, dayIndex);
    }
}

// Fallback quiz modal
function openFallbackQuizModal(day, dayIndex) {
    const t = translations[state.currentLanguage];
    const questions = generateFallbackQuizQuestions(day);
    
    const modal = document.createElement('div');
    modal.className = 'modal quiz-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${t.dailyQuiz} - ${day.day}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="quiz-container">
                    ${questions.map((q, i) => `
                        <div class="quiz-question" data-question="${i}" data-correct="${Number.isInteger(q.correct) ? q.correct : 0}">
                            <p class="question-text">${i + 1}. ${escapeHtml(q.question || '')}</p>
                            <div class="quiz-options">
                                ${(Array.isArray(q.options) ? q.options : []).map((opt, j) => `
                                    <label class="quiz-option">
                                        <input type="radio" name="q${i}" value="${j}">
                                        <span>${escapeHtml(String(opt))}</span>
                                    </label>
                                `).join('')}
                            </div>
                            <div class="quiz-result" id="result${i}"></div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-submit-quiz" data-day="${dayIndex}">
                    ${t.checkAnswer}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    const submitQuizBtn = modal.querySelector('.btn-submit-quiz');
    if (submitQuizBtn) {
        submitQuizBtn.addEventListener('click', () => submitQuiz(dayIndex));
    }
}

// Generate fallback quiz questions
function generateFallbackQuizQuestions(day) {
    const topics = day.topics;
    const questions = [];
    
    topics.forEach((topic, index) => {
        if (index < 3) {
            questions.push({
                question: state.currentLanguage === 'ar' 
                    ? `ما هو المفهوم الرئيسي في: ${topic}؟`
                    : `What is the main concept in: ${topic}?`,
                options: state.currentLanguage === 'ar'
                    ? ['المفهوم أ', 'المفهوم ب', 'المفهوم ج', topic]
                    : ['Concept A', 'Concept B', 'Concept C', topic],
                correct: 3
            });
        }
    });
    
    return questions;
}

// Submit quiz
function submitQuiz(dayIndex) {
    const modal = document.querySelector('.quiz-modal');
    const questions = modal.querySelectorAll('.quiz-question');
    let correct = 0;
    
    questions.forEach((q, i) => {
        const selected = q.querySelector('input[type="radio"]:checked');
        const resultDiv = q.querySelector(`#result${i}`);
        const explanationDiv = q.querySelector(`#explanation${i}`);
        
        const correctIndex = Number.parseInt(q.dataset.correct || '0', 10);
        const isCorrect = !!selected && Number.parseInt(selected.value, 10) === correctIndex;

        if (isCorrect) {
            correct++;
            resultDiv.innerHTML = '✅ ' + (state.currentLanguage === 'ar' ? 'صحيح!' : 'Correct!');
            resultDiv.className = 'quiz-result correct';
        } else {
            resultDiv.innerHTML = '❌ ' + (state.currentLanguage === 'ar' ? 'حاول مرة أخرى' : 'Try again');
            resultDiv.className = 'quiz-result incorrect';
        }
        
        // Show explanation if available
        if (explanationDiv) {
            explanationDiv.classList.remove('hidden');
        }
    });
    
    // Award points
    const points = correct * 20;
    addPoints(points);
    
    setTimeout(() => {
        modal.remove();
        alert(state.currentLanguage === 'ar' 
            ? `أجبت على ${correct} من ${questions.length} بشكل صحيح! +${points} نقاط`
            : `You got ${correct}/${questions.length} correct! +${points} points`);
    }, 1500);
}

// Generate mind map - Generate from API
async function generateMindMap(dayIndex) {
    const t = translations[state.currentLanguage];
    const day = state.studyPlan.schedule[dayIndex];
    
    // Show loading modal
    const loadingModal = document.createElement('div');
    loadingModal.className = 'modal';
    loadingModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-body" style="text-align: center; padding: 3rem;">
                <div class="spinner" style="margin-bottom: 1rem;"></div>
                <p>${state.currentLanguage === 'ar' ? 'جاري توليد الخريطة الذهنية...' : 'Generating mind map...'}</p>
            </div>
        </div>
    `;
    document.body.appendChild(loadingModal);
    
    try {
        // Prepare content for mind map
        const mindMapContent = `
Day: ${day.day}
Topics: ${day.topics.join(', ')}
Tasks: ${day.tasks.map(t => t.description).join('. ')}
        `.trim();
        
        // Call API to generate mind map
        const response = await fetch('/api/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studyMaterials: mindMapContent,
                language: state.currentLanguage,
                task: 'mindmap'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate mind map');
        }
        
        const data = await response.json();
        loadingModal.remove();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        const mindMap = data;
        
        const modal = document.createElement('div');
        modal.className = 'modal mindmap-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>${t.mindMap} - ${day.day}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="mindmap-model-info" style="margin-bottom: 1rem; padding: 0.5rem; background: var(--surface-light); border-radius: 8px; font-size: 0.8rem; color: var(--text-muted);">
                        ${state.currentLanguage === 'ar' ? 'مولد بواسطة:' : 'Generated by:'} ${escapeHtml(mindMap.model || '')}
                    </div>
                    <div class="mindmap-container" style="min-height: 500px;">
                        <div class="mindmap-center">${escapeHtml(mindMap.centralTopic || ((state.currentLanguage === 'ar' ? 'اليوم' : 'Day') + ' ' + (dayIndex + 1)))}</div>
                        ${mindMap.branches ? mindMap.branches.map((branch, i) => `
                            <div class="mindmap-branch" style="--angle: ${(360 / mindMap.branches.length) * i}deg; border-color: ${safeCssColor(branch.color)}">
                                <div class="mindmap-node" style="color: ${safeCssColor(branch.color)}">${escapeHtml(branch.title || '')}</div>
                                ${branch.subBranches ? branch.subBranches.map(sub => `
                                    <div class="mindmap-leaf">${escapeHtml(sub.title || '')}${sub.description ? ': ' + escapeHtml(sub.description) : ''}</div>
                                `).join('') : ''}
                            </div>
                        `).join('') : day.topics.map((topic, i) => `
                            <div class="mindmap-branch" style="--angle: ${(360 / day.topics.length) * i}deg">
                                <div class="mindmap-node">${escapeHtml(topic || '')}</div>
                                ${day.tasks.slice(i * 2, (i + 1) * 2).map(task => `
                                    <div class="mindmap-leaf">${escapeHtml((task.description || '').substring(0, 30))}...</div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-download-mindmap">
                        ${state.currentLanguage === 'ar' ? 'تحميل الخريطة' : 'Download Mind Map'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        modal.querySelector('.btn-download-mindmap').addEventListener('click', downloadMindMap);

        // Award points
        addPoints(15);
        
    } catch (error) {
        loadingModal.remove();
        console.error('Mind map generation error:', error);
        alert(state.currentLanguage === 'ar' 
            ? 'فشل في توليد الخريطة. جاري استخدام الخريطة الافتراضية...' 
            : 'Failed to generate mind map. Using default...');
        
        // Fallback to simple mind map
        openFallbackMindMap(day, dayIndex);
    }
}

// Fallback mind map
function openFallbackMindMap(day, dayIndex) {
    const t = translations[state.currentLanguage];
    
    const modal = document.createElement('div');
    modal.className = 'modal mindmap-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${t.mindMap} - ${day.day}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="mindmap-container">
                    <div class="mindmap-center">${state.currentLanguage === 'ar' ? 'اليوم' : 'Day'} ${dayIndex + 1}</div>
                    ${day.topics.map((topic, i) => `
                        <div class="mindmap-branch" style="--angle: ${(360 / day.topics.length) * i}deg">
                            <div class="mindmap-node">${escapeHtml(topic || '')}</div>
                            ${day.tasks.slice(i * 2, (i + 1) * 2).map(task => `
                                <div class="mindmap-leaf">${escapeHtml((task.description || '').substring(0, 30))}...</div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
                <button class="btn-download-mindmap">
                    ${state.currentLanguage === 'ar' ? 'تحميل الخريطة' : 'Download Mind Map'}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    modal.querySelector('.btn-download-mindmap').addEventListener('click', downloadMindMap);
    
    addPoints(15);
}

// Gamification functions
function addPoints(points) {
    state.gamification.points += points;
    updateGamificationDisplay();
    
    // Check for level up
    const newLevel = Math.floor(state.gamification.points / 100) + 1;
    if (newLevel > state.gamification.level) {
        state.gamification.level = newLevel;
        showLevelUpNotification(newLevel);
    }
    
    // Update streak
    const today = new Date().toDateString();
    if (state.gamification.lastStudyDate !== today) {
        const lastDate = state.gamification.lastStudyDate ? new Date(state.gamification.lastStudyDate) : null;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
            state.gamification.streak++;
        } else {
            state.gamification.streak = 1;
        }
        state.gamification.lastStudyDate = today;
    }
    
    // Check badges
    checkBadges();
    
    // Save gamification data
    localStorage.setItem('studyPlanner_points', state.gamification.points);
    localStorage.setItem('studyPlanner_level', state.gamification.level);
    localStorage.setItem('studyPlanner_streak', state.gamification.streak);
    localStorage.setItem('studyPlanner_badges', JSON.stringify(state.gamification.badges));
    localStorage.setItem('studyPlanner_lastStudyDate', state.gamification.lastStudyDate);
}

function checkBadges() {
    const badges = state.gamification.badges;
    
    // First day badge
    if (state.gamification.streak >= 1 && !badges.includes('firstDay')) {
        badges.push('firstDay');
        showBadgeNotification('badgeFirstDay');
    }
    
    // 3-day streak
    if (state.gamification.streak >= 3 && !badges.includes('streak3')) {
        badges.push('streak3');
        showBadgeNotification('badgeStreak3');
    }
    
    // 7-day streak
    if (state.gamification.streak >= 7 && !badges.includes('streak7')) {
        badges.push('streak7');
        showBadgeNotification('badgeStreak7');
    }
    
    // Study master (1000 points)
    if (state.gamification.points >= 1000 && !badges.includes('master')) {
        badges.push('master');
        showBadgeNotification('badgeCompleted');
    }
}

function showLevelUpNotification(level) {
    const t = translations[state.currentLanguage];
    const notification = document.createElement('div');
    notification.className = 'gamification-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">🎉</div>
            <h3>${state.currentLanguage === 'ar' ? 'تهانينا!' : 'Congratulations!'}</h3>
            <p>${state.currentLanguage === 'ar' ? 'لقد وصلت إلى المستوى' : 'You reached Level'} ${level}!</p>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showBadgeNotification(badgeKey) {
    const t = translations[state.currentLanguage];
    const notification = document.createElement('div');
    notification.className = 'gamification-notification badge-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">🏆</div>
            <h3>${state.currentLanguage === 'ar' ? 'شارة جديدة!' : 'New Badge!'}</h3>
            <p>${t[badgeKey]}</p>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

function downloadMindMap() {
    alert(state.currentLanguage === 'ar' 
        ? 'تم تحميل خريطة ذهنية! +15 نقاط'
        : 'Mind map downloaded! +15 points');
}

// Make functions globally accessible
window.openFeedbackModal = openFeedbackModal;
window.openQuizModal = openQuizModal;
window.generateMindMap = generateMindMap;
window.submitFeedback = submitFeedback;
window.submitQuiz = submitQuiz;
window.downloadMindMap = downloadMindMap;

// Start
init();
