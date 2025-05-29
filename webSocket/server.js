
// server.js
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server is running');
});

const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', ws => {
    console.log('Нове WebSocket-з\'єднання встановлено.');
    clients.add(ws);

    ws.on('message', message => {
        console.log(`Отримано повідомлення: ${message}`);

        try {
            const parsedMessage = JSON.parse(message);

            if (parsedMessage.username && parsedMessage.message && parsedMessage.type) {
                // --- ЗМІНА ТУТ ---
                // Пересилаємо повідомлення всім підключеним клієнтам, КРІМ ВІДПРАВНИКА
                clients.forEach(client => {
                    // Якщо клієнт не є відправником і його з'єднання відкрите
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(parsedMessage));
                    }
                });
                // --- КІНЕЦЬ ЗМІНИ ---
            } else {
                console.warn('Отримано неповне або неправильно відформатоване повідомлення:', parsedMessage);
            }
        } catch (e) {
            console.error('Помилка парсингу JSON-повідомлення:', e);
            console.error('Отримані дані:', message.toString());
        }
    });

    ws.on('close', () => {
        console.log('WebSocket-з\'єднання закрито.');
        clients.delete(ws);
        console.log(`Кількість активних клієнтів: ${clients.size}`);
    });

    ws.on('error', error => {
        console.error('Помилка WebSocket:', error);
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
    console.log(`Відкрийте http://localhost:${PORT} у вашому браузері (хоча це лише для WebSocket)`);
});