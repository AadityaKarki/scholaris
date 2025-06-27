import { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import rehypeMathjax from "rehype-mathjax";
import Navbar from "../components/navbar";
import Sidebar from "../components/Sidebar";
import { UserContext } from "../UserContext";
import Form from "../components/Form";

export default function Study() {
  const [sidebarWidth, setSidebarWidth] = useState("25%");
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const { id } = useContext(UserContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log(id);
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/start-learning/conversations/${id}`
        );
        setConversations(response.data.conversations);
        console.log(response.data.conversations);
        console.log(conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        // Handle error appropriately
      }
    };

    fetchConversations();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentConversation) return;

    const newMessage = {
      content: inputMessage,
      sender: "user",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Update conversation list with new message
    // setConversations((prev) =>
    //   prev.map((conv) =>
    //     conv.id === currentConversation._id
    //       ? {
    //           ...conv,
    //           lastMessage: inputMessage,
    //           timestamp: new Date().toISOString(),
    //         }
    //       : conv
    //   )
    // );

    try {
      // TODO: Add your API call here to get response from server
      const response = await axios.post("http://localhost:5000/learn/chat", {
        question: inputMessage,
        learningSessionId: currentConversation._id,
      });
      console.log(currentConversation._id);
      console.log(response.data.data.answer);
      const botMessage = {
        content: response.data.data.answer,
        sender: "bot",
        createdAt: new Date().toISOString(),
      };
      console.log(botMessage);
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const startNewConversation = () => {
    setShowModeSelection(true);
  };

  const handleFileChange = (newFile) => {
    setFile(newFile);
  };

  const handleCreateNewConversation = async (mode, e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      if (file) {
        formData.append("pdf", file);
      }
      formData.append("mode", mode);
      formData.append("title", title);
      formData.append("uid", id);
      console.log(title);

      const response = await axios.post(
        "http://localhost:5000/start-learning/initiate-session",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (file) {
        await axios.post("http://localhost:5000/start-learning/extract-pdf", {
          learningSessionId: response.data.sessionId,
          userId: id,
          filename: response.data.file,
        });
      }
      const newConversation = {
        _id: response.data.sessionId,
        title: title || (mode === "ask" ? "New Question" : "New Practice"),
        lastMessage: "",
        timestamp: new Date().toISOString(),
      };
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);
      setShowModeSelection(false);
      setTitle("");
      setFile(null);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation. Please try again.");
    }
  };

  const selectConversation = async (conversation) => {
    setCurrentConversation(conversation);
    setCurrentConversation((prev) => ({ ...prev, mode: "ask" }));
    // TODO: Load messages for this conversation from your backend
    const response = await axios.get(
      `http://localhost:5000/learn/chat/${conversation._id}`
    );
    const msg = response.data.data;
    setMessages(msg);
    setShowModeSelection(false);
  };

  const toggleMode = (mode) => {
    if (!currentConversation) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversation.id ? { ...conv, mode: mode } : conv
      )
    );
    setCurrentConversation((prev) => ({ ...prev, mode: mode }));
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex bg-blue-900 text-white overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          sidebarWidth={sidebarWidth}
          setSidebarWidth={setSidebarWidth}
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={selectConversation}
          onStartNewConversation={startNewConversation}
        />

        {/* Right Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showModeSelection ? (
            <Form
              title={title}
              onChangeTitle={setTitle}
              file={file}
              onChangeFile={handleFileChange}
              onCreateNewConversation={handleCreateNewConversation}
            />
          ) : currentConversation ? (
            <>
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {currentConversation.title}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleMode("ask")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentConversation.mode === "ask"
                        ? "bg-blue-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    Ask Questions
                  </button>
                  <button
                    onClick={() => toggleMode("attempt")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentConversation.mode === "attempt"
                        ? "bg-green-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    Attempt Questions
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {messages
                  .filter(
                    (message) =>
                      (currentConversation.mode === "ask" &&
                        message.type === "rag") ||
                      (currentConversation.mode === "attempt" &&
                        message.type === "ques")
                  )
                  .map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 ${
                        message.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-2xl  max-w-4/5  ${
                          message.sender === "user"
                            ? "bg-blue-600 ml-auto"
                            : "bg-gray-700"
                        }`}
                      >
                        {message.sender === "user" ? (
                          message.content
                        ) : (
                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown rehypePlugins={[rehypeMathjax]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-gray-700 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Type your ${
                      currentConversation.mode === "ask" ? "question" : "answer"
                    }...`}
                    className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation or start a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
