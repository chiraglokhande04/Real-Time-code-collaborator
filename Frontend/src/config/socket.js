import { io } from 'socket.io-client';
const apiUrl = import.meta.env.VITE_API_URL;

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    return io(apiUrl, options);
};