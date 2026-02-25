import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useSocket(serverUrl) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(serverUrl);
    socketRef.current = s;
    setSocket(s);

    return () => {
        s.close();
        socketRef.current = null;
    };
  }, [serverUrl]);

  return socketRef;
}
