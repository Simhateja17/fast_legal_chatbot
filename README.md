# AI Chatbot Frontend

A simple frontend for an AI chatbot that communicates with an n8n backend via webhook.

## Usage

1. Open `index.html` in your web browser.
2. Type your message in the input field.
3. Click "Send" or press Enter to send the message.
4. The bot's response will appear in the chat.

## Backend

The frontend sends POST requests to the n8n webhook at:
`http://52.137.186.215:5678/webhook/af93febc-c804-4ff8-bb5f-8d4504f73f1c/chat`

Expected payload: `{ "message": "user input" }`
Expected response: `{ "response": "bot reply" }`

## Troubleshooting

- If you encounter CORS errors, ensure the n8n webhook is configured to allow requests from your domain.
- Check the browser console for any JavaScript errors.
- Verify the n8n server is running and accessible.# fast_legal_chatbot
