document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat-button');
    const settingsButton = document.getElementById('settings-button');
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.querySelector('.sidebar');
    const uploadButton = document.getElementById('upload-button');
    const imageInput = document.getElementById('image-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const cancelPreviewButton = document.getElementById('cancel-preview-button');

    let selectedFile = null;
    const INITIAL_GREETING = '안녕하세요. 대전시 행사 챗봇입니다.';

    function resetChat() {
        chatMessages.innerHTML = '';
        appendMessage(INITIAL_GREETING, 'bot');
        hidePreview();
    }

    function hidePreview() {
        selectedFile = null;
        imageInput.value = '';
        imagePreviewContainer.classList.add('hidden');
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

    uploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    cancelPreviewButton.addEventListener('click', hidePreview);

    resetChat();

    function sendMessage() {
        if (selectedFile) {
            uploadImage(selectedFile);
        } else {
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
    }

    function uploadImage(file) {
        appendMessage(imagePreview.src, 'user', true);
        hidePreview();

        const formData = new FormData();
        formData.append('image', file);

        fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Upload successful:', data);
        })
        .catch(error => {
            console.error('Error:', error);
            appendMessage('Sorry, something went wrong while uploading the image.', 'bot');
        });
    }

    function appendMessage(content, sender, isImage = false) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add(`${sender}-message-container`);
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(`${sender}-message`);

        if (isImage) {
            const image = new Image();
            image.src = content;
            messageElement.appendChild(image);
        } else {
            messageElement.textContent = content;
        }

        messageContainer.appendChild(messageElement);
        chatMessages.appendChild(messageContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});