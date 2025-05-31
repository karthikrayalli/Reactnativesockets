import { useContext } from "react";
import { chatContext } from "./appState";

export const useAuth = () => {
  const context = useContext(chatContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};