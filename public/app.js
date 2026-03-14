/**
 * Student Study Planner - Frontend Application
 * Features: Multi-language, Session Management, Local Storage, Interactive Checkboxes
 */

// Translations
const translations = {
    en: {
        title: "Student Study Planner - AI-Powered",
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
        resetApp: "Reset App"
    },
    ar: {
        title: "مخطط الدراسة - بالذكاء الاصطناعي",
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
        resetApp: "إعادة تعيين"
    }
};

// Global state
const state = {
    files: [],
    extractedTexts: [],
    isGenerating: false,
    currentLanguage: localStorage.getItem('studyPlanner_lang') || 'en',
    sessions: [],
    currentSessionId: null,
    studyPlan: null,
    completedTasks: new Set()
};

// DOM Elements
let elements = {};

// Initialize
function init() {
    cacheElements();
    initLanguage();
    initSessions();
    initEventListeners();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    elements.deadlineInput.min = today;
    
    // Auto-save every 30 seconds
    setInterval(autoSave, 30000);
    
    // Save on page unload
    window.addEventListener('beforeunload', autoSave);
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
            state.sessions = parsed.sessions || [];
            state.currentSessionId = parsed.currentSessionId;
            
            // Load current session data
            if (state.currentSessionId) {
                loadSession(state.currentSessionId);
            }
        } catch (e) {
            console.error('Failed to load sessions:', e);
            createNewSession();
        }
    } else {
        createNewSession();
    }
    
    renderSessionsList();
}

function createNewSession() {
    const t = translations[state.currentLanguage];
    const newSession = {
        id: 'session_' + Date.now(),
        name: `${t.newSession} ${state.sessions.length + 1}`,
        createdAt: new Date().toISOString(),
        files: [],
        extractedTexts: [],
        deadline: '',
        dailyHours: 3,
        studyPlan: null,
        completedTasks: []
    };
    
    state.sessions.unshift(newSession);
    state.currentSessionId = newSession.id;
    
    // Reset UI
    resetUI();
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
    elements.currentSessionName.textContent = session.name;
    
    renderFileList();
    
    if (state.studyPlan) {
        displayResults(state.studyPlan);
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
    
    localStorage.setItem('studyPlanner_sessions', JSON.stringify({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId
    }));
}

function autoSave() {
    if (state.currentSessionId) {
        saveSessions();
    }
}

function deleteSession(sessionId) {
    console.log('Deleting session:', sessionId);
    const t = translations[state.currentLanguage];
    if (!confirm(t.confirmDelete)) {
        console.log('Deletion cancelled by user');
        return;
    }
    
    // Remove the session
    state.sessions = state.sessions.filter(s => s.id !== sessionId);
    console.log('Sessions after deletion:', state.sessions.length);
    
    // If we deleted the current session
    if (state.currentSessionId === sessionId) {
        console.log('Deleted current session');
        if (state.sessions.length > 0) {
            // Switch to another session
            console.log('Switching to first available session');
            loadSession(state.sessions[0].id);
        } else {
            // No sessions left - create a new one
            console.log('No sessions left, creating new one');
            state.currentSessionId = null;
            createNewSession();
        }
    } else {
        // Just re-render if we deleted a non-active session
        console.log('Deleted non-active session, just re-rendering');
        renderSessionsList();
        saveSessions();
    }
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
            console.log('Delete button clicked for session:', btn.dataset.sessionId);
            deleteSession(btn.dataset.sessionId);
        });
    });
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
    elements.currentSessionName.textContent = translations[state.currentLanguage].newSession + ' ' + state.sessions.length;
    
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

function updateGenerateButton() {
    const hasFiles = state.files.length > 0;
    const hasDeadline = elements.deadlineInput.value !== '';
    elements.generateBtn.disabled = !(hasFiles && hasDeadline);
}

// Text extraction
async function extractFileText(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    
    try {
        let text = '';
        
        if (ext === 'txt' || ext === 'md') {
            text = await file.text();
        } else if (ext === 'pdf' || ext === 'docx') {
            text = `[${ext.toUpperCase()} file: ${file.name} - Content will be processed]`;
        }
        
        state.extractedTexts.push({
            filename: file.name,
            content: text
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
            dailyHours: parseInt(elements.hoursInput.value) || 3,
            language: state.currentLanguage
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
    
    elements.timeline.innerHTML = schedule.map((day, dayIndex) => `
        <div class="day-card" style="animation-delay: ${dayIndex * 0.1}s">
            <div class="day-header">
                <span class="day-number">${day.day}</span>
                <span class="day-date">${formatDate(day.date)}</span>
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
        </div>
    `).join('');
    
    // Add click handlers for checkboxes
    elements.timeline.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', () => toggleTask(item.dataset.taskId));
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
        window.location.reload();
    }
}

// Start
init();
