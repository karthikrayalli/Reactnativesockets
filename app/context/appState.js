import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, createContext } from "react";
import io from "socket.io-client";
// 192.168.0.104
//http://192.168.0.104:8000
//https://chat-app-u2cq.onrender.com
// http://localhost:8000
const hostName = "http://localhost:8000";
var socket = io(hostName);

export const chatContext = createContext();

const ChatState = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({});
  const [receiver, setReceiver] = useState({});
  const [messageList, setMessageList] = useState([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [myChatList, setMyChatList] = useState([]);
  const [originalChatList, setOriginalChatList] = useState([]);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  (async () => {
    const token = await AsyncStorage.getItem("token");
  const user1 = await AsyncStorage.getItem("user") || {}
    setIsAuthenticated(!!token);
    setUser(user1)
  })();
}, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${hostName}/conversation/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": await AsyncStorage.getItem("token"),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data" + (await response.text()));
      }
      const jsonData = await response.json();
      setMyChatList(jsonData);
      setIsLoading(false);
      setOriginalChatList(jsonData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket.on("receiver-online", () => {
      setReceiver((prevReceiver) => ({ ...prevReceiver, isOnline: true }));
    });
  }, []);

  useEffect(() => {
    socket.on("receiver-offline", () => {
      setReceiver((prevReceiver) => ({
        ...prevReceiver,
        isOnline: false,
        lastSeen: new Date().toISOString(),
      }));
    });
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const res = await fetch(`${hostName}/auth/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },
          });
          const data = await res.json();
          setUser(data);
          console.log("user fetched");
          setIsAuthenticated(true);
          socket.emit("setup", await data._id);
        }
      } catch (error) {
        console.log(error);
        setIsAuthenticated(false);
        setUser({});
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
      }
    };

    fetchUser();
    fetchData();
  }, []);

  return (
    <chatContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        receiver,
        setReceiver,
        messageList,
        setMessageList,
        activeChatId,
        setActiveChatId,
        myChatList,
        setMyChatList,
        originalChatList,
        fetchData,
        hostName,
        socket,
        isOtherUserTyping,
        setIsOtherUserTyping,
        isChatLoading,
        setIsChatLoading,
        isLoading,
        setIsLoading,
      }}
    >
      {props.children}
    </chatContext.Provider>
  );
};

export default ChatState;
