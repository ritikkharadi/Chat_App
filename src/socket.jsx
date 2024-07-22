import { createContext, useMemo, useContext } from "react";
import io from "socket.io-client";

const SocketContext = createContext();
const useSocket = () => useContext(SocketContext); // Renaming to follow custom hook naming conventions

const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io("http://localhost:4000/", { withCredentials: true }), []);
console.log("socket",socket);
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
