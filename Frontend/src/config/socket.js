import { io } from 'socket.io-client';
const apiUrl = import.meta.env.VITE_API_URL;


function getCookie(name) {
    const cookieArr = document.cookie.split(";");

    for (let cookie of cookieArr) {
        const [key, val] = cookie.trim().split("=");
        if (key === name) return val;
    }

    return null;
}


const token = getCookie('token');



export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],

        auth: {
            token: token ? token : null
        },
    };
    return io(apiUrl, options);
};