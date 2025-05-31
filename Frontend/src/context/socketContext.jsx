import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
const apiUrl = import.meta.env.VITE_API_URL;

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketInstance = io(apiUrl, {
            transports: ["websocket"],
            withCredentials: true,
        });

        setSocket(socketInstance); // ✅ Set socket state

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
