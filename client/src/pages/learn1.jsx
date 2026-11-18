import { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import rehypeMathjax from "rehype-mathjax";
import Navbar from "../components/navbar";
import Sidebar from "../components/Sidebar";
import { UserContext } from "../UserContext";
import Form from "../components/Form";
export default function Study1() {
  const [sidebarWidth, setSidebarWidth] = useState("25%");
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
}
