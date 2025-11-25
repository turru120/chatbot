document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat-button');
    const settingsButton = document.getElementById('settings-button');
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.querySelector('.sidebar');

    const INITIAL_GREETING = '안녕하세요. 대전시 행사 챗봇입니다.';

    function resetChat() {
        chatMessages.innerHTML = '';
        appendMessage(INITIAL_GREETING, 'bot');
    }

    menuIcon.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
    });

    newChatButton.addEventListener('click', resetChat);

    settingsButton.addEventListener('click', () => {
        alert('설정 기능은 현재 준비 중입니다.');
    });

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    resetChat();

    function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText !== '') {
            appendMessage(messageText, 'user');
            userInput.value = '';
            fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: messageText })
            })
            .then(response => response.json())
            .then(data => {
                appendMessage(data.reply, 'bot');
            })
            .catch(error => {
                console.error('Error:', error);
                appendMessage('Sorry, something went wrong.', 'bot');
            });
        }
    }

    function appendMessage(text, sender) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add(`${sender}-message-container`);
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(`${sender}-message`);
        messageElement.textContent = text;

        messageContainer.appendChild(messageElement);
        chatMessages.appendChild(messageContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});