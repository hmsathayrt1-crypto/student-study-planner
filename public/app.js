/**
 * Student Study Planner - Frontend Application
 * Handles file uploads, text extraction, and UI interactions
 */

// Global state
const state = {
    files: [],
    extractedTexts: [],
    isGenerating: false
};

// DOM Elements
const elements = {
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
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    newPlanBtn: document.getElementById('newPlanBtn'),
    downloadBtn: document.getElementById('downloadBtn')
};

// Initialize
function init() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    elements.deadlineInput.min = today;
    
    // Event listeners
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    elements.generateBtn.addEventListener('click', generateStudyPlan);
    elements.retryBtn.addEventListener('click', resetApp);
    elements.newPlanBtn.addEventListener('click', resetApp);
    elements.downloadBtn.addEventListener('click', downloadPlan);
}

// Drag and drop handlers
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

// File selection handler
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

// Add files to state
function addFiles(files) {
    const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown'
    ];
    const validExtensions = ['.pdf', '.docx', '.txt', '.md'];
    
    files.forEach(file => {
        const hasValidExtension = validExtensions.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );
        
        if (hasValidExtension || validTypes.includes(file.type)) {
            if (!state.files.find(f => f.name === file.name && f.size === file.size)) {
                state.files.push(file);
            }
        }
    });
    
    renderFileList();
    updateGenerateButton();
}

// Render file list
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
            <button class="file-remove" onclick="removeFile(${index})" title="Remove file">✕</button>
        </div>
    `).join('');
}

// Remove file
function removeFile(index) {
    state.files.splice(index, 1);
    renderFileList();
    updateGenerateButton();
}

// Get file icon
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: '📕',
        docx: '📘',
        txt: '📄',
        md: '📝'
    };
    return icons[ext] || '📄';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update generate button state
function updateGenerateButton() {
    const hasFiles = state.files.length > 0;
    const hasDeadline = elements.deadlineInput.value !== '';
    elements.generateBtn.disabled = !(hasFiles && hasDeadline);
}

// Watch for deadline changes
elements.deadlineInput.addEventListener('change', updateGenerateButton);

// Extract text from files
async function extractTextFromFiles() {
    const texts = [];
    
    for (const file of state.files) {
        const ext = file.name.split('.').pop().toLowerCase();
        
        try {
            if (ext === 'txt' || ext === 'md') {
                const text = await file.text();
                texts.push({
                    filename: file.name,
                    content: text
                });
            } else if (ext === 'pdf') {
                const text = await extractPdfText(file);
                texts.push({
                    filename: file.name,
                    content: text
                });
            } else if (ext === 'docx') {
                const text = await extractDocxText(file);
                texts.push({
                    filename: file.name,
                    content: text
                });
            }
        } catch (error) {
            console.error(`Error extracting text from ${file.name}:`, error);
            texts.push({
                filename: file.name,
                content: `[Error extracting content from ${file.name}]`
            });
        }
    }
    
    return texts;
}

// Extract PDF text using pdf-parse (client-side simple extraction)
async function extractPdfText(file) {
    // For now, read as text and extract printable characters
    // In production, use PDF.js library
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Try to extract text from PDF
    let text = '';
    let inText = false;
    let textBuffer = '';
    
    for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        const char = String.fromCharCode(byte);
        
        // Simple PDF text extraction
        if (byte === 40) { // '(' - start of text string
            inText = true;
            textBuffer = '';
        } else if (byte === 41 && inText) { // ')' - end of text string
            inText = false;
            text += textBuffer + ' ';
        } else if (inText) {
            // Handle escaped characters
            if (byte === 92) { // backslash
                i++;
                if (i < uint8Array.length) {
                    const nextByte = uint8Array[i];
                    if (nextByte === 110) textBuffer += '\n'; // \n
                    else if (nextByte === 114) textBuffer += '\r'; // \r
                    else if (nextByte === 116) textBuffer += '\t'; // \t
                    else if (nextByte === 98) textBuffer += '\b'; // \b
                    else if (nextByte === 102) textBuffer += '\f'; // \f
                    else textBuffer += String.fromCharCode(nextByte);
                }
            } else {
                textBuffer += char;
            }
        }
    }
    
    // If we couldn't extract text, provide a fallback message
    if (!text.trim()) {
        text = `[PDF file: ${file.name} - Content will be processed on server]`;
    }
    
    return text;
}

// Extract DOCX text
async function extractDocxText(file) {
    // Simple DOCX extraction - read XML content
    try {
        const arrayBuffer = await file.arrayBuffer();
        const text = new TextDecoder('utf-8').decode(arrayBuffer);
        
        // Extract text between XML tags
        const textMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
        if (textMatches) {
            return textMatches
                .map(match => match.replace(/<w:t[^>]*>|<\/w:t>/g, ''))
                .join(' ');
        }
    } catch (error) {
        console.error('DOCX extraction error:', error);
    }
    
    return `[DOCX file: ${file.name} - Content will be processed on server]`;
}

// Generate study plan
async function generateStudyPlan() {
    if (state.files.length === 0 || !elements.deadlineInput.value) return;
    
    state.isGenerating = true;
    elements.uploadSection.hidden = true;
    elements.loadingSection.hidden = false;
    
    try {
        // Extract text from all files
        const extractedTexts = await extractTextFromFiles();
        state.extractedTexts = extractedTexts;
        
        // Combine all text
        const combinedText = extractedTexts
            .map(t => `=== ${t.filename} ===\n${t.content}`)
            .join('\n\n');
        
        // Prepare request data
        const requestData = {
            studyMaterials: combinedText,
            deadline: elements.deadlineInput.value,
            dailyHours: parseInt(elements.hoursInput.value) || 3
        };
        
        // Call API
        const response = await fetch('/api/generate-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        displayResults(data);
        
    } catch (error) {
        console.error('Error generating plan:', error);
        showError(error.message || 'Failed to generate study plan. Please try again.');
    }
}

// Display results
function displayResults(data) {
    elements.loadingSection.hidden = true;
    elements.resultsSection.hidden = false;
    
    // Update meta info
    elements.totalDays.textContent = `📅 ${data.totalDays} days`;
    elements.totalHours.textContent = `⏰ ${data.totalHours} hours total`;
    elements.deadlineDisplay.textContent = `🎯 Due: ${formatDate(data.deadline)}`;
    
    // Display summary
    elements.summaryContent.innerHTML = formatSummary(data.summary);
    
    // Display timeline
    elements.timeline.innerHTML = data.schedule.map((day, index) => `
        <div class="day-card" style="animation-delay: ${index * 0.1}s">
            <div class="day-header">
                <span class="day-number">${day.day}</span>
                <span class="day-date">${formatDate(day.date)}</span>
            </div>
            <div class="day-topics">
                <h4>Topics to Cover</h4>
                <ul>
                    ${day.topics.map(topic => `<li>${escapeHtml(topic)}</li>`).join('')}
                </ul>
            </div>
            <div class="day-tasks">
                <h4>Tasks</h4>
                ${day.tasks.map(task => `
                    <div class="task-item">
                        <div class="task-checkbox"></div>
                        <div class="task-text">${escapeHtml(task.description)}</div>
                        <div class="task-time">${task.duration} min</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Format summary text
function formatSummary(summary) {
    // Convert markdown-like content to HTML
    return summary
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n- (.*)/g, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/^(.+)$/gm, '<p>$1</p>');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

// Show error
function showError(message) {
    elements.loadingSection.hidden = true;
    elements.errorSection.hidden = false;
    elements.errorMessage.textContent = message;
}

// Reset app
function resetApp() {
    state.files = [];
    state.extractedTexts = [];
    state.isGenerating = false;
    
    elements.fileList.innerHTML = '';
    elements.deadlineInput.value = '';
    elements.hoursInput.value = '3';
    
    elements.uploadSection.hidden = false;
    elements.loadingSection.hidden = true;
    elements.resultsSection.hidden = true;
    elements.errorSection.hidden = true;
    
    updateGenerateButton();
}

// Download plan
function downloadPlan() {
    const planData = {
        title: 'Study Plan',
        created: new Date().toISOString(),
        schedule: state.lastPlan
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

// Start
init();
