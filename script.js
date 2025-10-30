// Configuration
const WEBHOOK_URL = 'https://n8n.couture-services.social/webhook/db55a360-73aa-494a-bdd9-0b93f8116975/chat';
// Generate or retrieve session ID
function getSessionId() {
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chatSessionId', sessionId);
    }
    return sessionId;
}

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const statusElement = document.getElementById('status');

// Session ID
const sessionId = getSessionId();

// Format message content (convert basic markdown to HTML)
function formatMessageContent(content) {
    if (!content) return '';
    
    // Convert markdown to HTML
    let formatted = content
        // Bold text: **text** or __text__
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        // Italic text: *text* or _text_
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Numbered lists: 1. item
        .replace(/^(\d+)\.\s+(.+)$/gm, '<div class="list-item">$1. $2</div>')
        // Bullet points: - item or * item
        .replace(/^[\-\*]\s+(.+)$/gm, '<div class="list-item">• $1</div>');
    
    return formatted;
}

// Add message to chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    // Add SVG icon for bot messages only
    if (!isUser) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12 2L3 7V11C3 16.55 7.84 21.74 12 23C16.16 21.74 21 16.55 21 11V7L12 2Z');
        
        svg.appendChild(path);
        avatar.appendChild(svg);
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Add label
    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = isUser ? 'You' : 'Legal Assistant';
    messageContent.appendChild(label);
    
    const messageBody = document.createElement('div');
    messageBody.className = 'message-body';
    
    // Format the content (convert markdown to HTML for bot messages)
    if (!isUser) {
        messageBody.innerHTML = formatMessageContent(content);
    } else {
        messageBody.textContent = content;
    }
    
    messageContent.appendChild(messageBody);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message bot-message typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    // Add SVG icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 2L3 7V11C3 16.55 7.84 21.74 12 23C16.16 21.74 21 16.55 21 11V7L12 2Z');
    
    svg.appendChild(path);
    avatar.appendChild(svg);
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        messageContent.appendChild(dot);
    }
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(messageContent);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `Error: ${message}`;
    chatMessages.appendChild(errorDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Update status
function updateStatus(status, isOnline = true) {
    statusElement.textContent = status;
    const statusBadge = document.getElementById('statusBadge');
    
    if (!isOnline) {
        statusBadge.style.background = 'rgba(251, 191, 36, 0.2)';
        statusBadge.style.borderColor = 'rgba(251, 191, 36, 0.3)';
    } else {
        statusBadge.style.background = 'rgba(255, 255, 255, 0.1)';
        statusBadge.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
}

// Send message to webhook
async function sendMessage(message) {
    try {
        updateStatus('Sending...', false);
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: sessionId,
                chatInput: message
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateStatus('Online', true);
        
        // Handle response - adjust based on your n8n workflow output
        if (data.output) {
            return data.output;
        } else if (data.response) {
            return data.response;
        } else if (data.message) {
            return data.message;
        } else if (typeof data === 'string') {
            return data;
        } else {
            // If response structure is different, return the whole object as string
            return JSON.stringify(data, null, 2);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        updateStatus('Error', false);
        throw error;
    }
}

// Handle sending message
async function handleSendMessage() {
    const message = userInput.value.trim();
    
    if (!message) {
        return;
    }
    
    // Disable input while sending
    userInput.disabled = true;
    sendButton.disabled = true;
    
    // Add user message
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send message and get response
        const response = await sendMessage(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response
        addMessage(response, false);
    } catch (error) {
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show error
        showError('Failed to get response. Please try again.');
    } finally {
        // Re-enable input
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

// Event listeners
sendButton.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Focus input on load
userInput.focus();

// Log session ID for debugging
console.log('Chat Session ID:', sessionId);
