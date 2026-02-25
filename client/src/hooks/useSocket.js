import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useSocket(serverUrl) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log(`[Socket] Tentative de connexion vers: ${serverUrl}`);
    const s = io(serverUrl);
    
    s.on("connect", () => {
        console.log(`[Socket] Connecté avec succès ! ID: ${s.id}`);
    });
    
    s.on("connect_error", (err) => {
        console.error(`[Socket] Erreur de connexion:`, err.message);
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
        s.close();
        socketRef.current = null;
    };
  }, [serverUrl]);

  return socketRef;
}
