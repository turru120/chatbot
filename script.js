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

    let selectedFiles = [];
    const INITIAL_GREETING = '안녕하세요. 대전시 행사 챗봇입니다.';

    function resetChat() {
        chatMessages.innerHTML = '';
        appendMessage(INITIAL_GREETING, 'bot');
        hidePreview();
    }

    function hidePreview() {
        selectedFiles = [];
        imageInput.value = '';
        imagePreviewContainer.innerHTML = '';
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
        const files = event.target.files;
        if (files.length > 0) {
            imagePreviewContainer.classList.remove('hidden');
            for (const file of files) {
                if (selectedFiles.length >= 5) {
                    alert('최대 5개의 이미지만 업로드할 수 있습니다.');
                    break;
                }
                selectedFiles.push(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewWrapper = document.createElement('div');
                    previewWrapper.classList.add('image-preview-wrapper');

                    const image = new Image();
                    image.src = e.target.result;

                    const cancelButton = document.createElement('button');
                    cancelButton.innerHTML = '&times;';
                    cancelButton.classList.add('cancel-preview-button');
                    cancelButton.onclick = () => {
                        const index = selectedFiles.indexOf(file);
                        if (index > -1) {
                            selectedFiles.splice(index, 1);
                        }
                        previewWrapper.remove();
                        if (selectedFiles.length === 0) {
                            hidePreview();
                        }
                    };

                    previewWrapper.appendChild(image);
                    previewWrapper.appendChild(cancelButton);
                    imagePreviewContainer.appendChild(previewWrapper);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    resetChat();

    function sendMessage() {
        if (selectedFiles.length > 0) {
            uploadImages(selectedFiles);
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

    function uploadImages(files) {
        const tempImageUrls = files.map(file => URL.createObjectURL(file));
        appendMessage(tempImageUrls, 'user', true);
        hidePreview();

        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });

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
            appendMessage('Sorry, something went wrong while uploading the images.', 'bot');
        });
    }

    function appendMessage(content, sender, isImage = false) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add(`${sender}-message-container`);
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(`${sender}-message`);

        if (isImage) {
            if (Array.isArray(content)) {
                content.forEach(src => {
                    const image = new Image();
                    image.src = src;
                    messageElement.appendChild(image);
                });
            } else {
                const image = new Image();
                image.src = content;
                messageElement.appendChild(image);
            }
        } else {
            messageElement.textContent = content;
        }

        messageContainer.appendChild(messageElement);
        chatMessages.appendChild(messageContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});