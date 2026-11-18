import { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../UserContext";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import app from "../firebase";

const auth = getAuth(app);

export default function User() {
  const {
    username,
    setUsername,
    id,
    setId,
    learnSessionId,
    setLearnSessionId,
  } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState("");
  const [topics, setTopics] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState("25%");
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUsername(null);
      setId(null);
      navigate("/");
      setLoading(false);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    const sidebar = sidebarRef.current;
    let startX, startWidth;

    const handleMouseDown = (e) => {
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
      const width = startWidth + (e.clientX - startX);
      if (width >= 200 && width <= 400) {
        setSidebarWidth(`${width}px`);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const resizeHandle = document.createElement("div");
    resizeHandle.className =
      "absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-700 hover:bg-gray-600";
    resizeHandle.addEventListener("mousedown", handleMouseDown);
    sidebar.appendChild(resizeHandle);

    return () => {
      resizeHandle.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const formData = new FormData();
    if (file) formData.append("pdf", file);
    formData.append("topics", topics.join(","));
    formData.append("userId", id);

    try {
      const res = await axios.post(
        "http://localhost:5000/start-learning",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (file) {
        const pdfres = await axios.post("http://localhost:5000/extract-pdf", {
          filename: res.data.file.filename,
        });
        console.log(pdfres);
      }
      console.log("Learning session started:", res.data);
      setLearnSessionId(res.data.sessionId);

      navigate(`/learnsession/${id}`);
    } catch (error) {
      console.error("Error starting learning session:", error);
      alert("Error starting learning session");
    }
  };
  return (
    <div className="bg-blue-900 text-white h-screen flex flex-row">
      <div
        ref={sidebarRef}
        style={{ width: sidebarWidth }}
        className="bg-gray-900 h-screen overflow-y-auto min-w-[200px] max-w-[400px] relative"
      ></div>
      <div className="flex-1 h-screen">
        Start Learning
        <div>Enter Topics</div>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setTopics((prevTopics) => [...prevTopics, topic.trim()]);
              setTopic(""); // Clear the input after submission
            }
          }}
        />
        {topics && topics.map((topic) => <div key={topic}>{topic}</div>)}
        <input
          type="file"
          id="pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleSubmit}>Start Session</button>
      </div>
    </div>
  );
}
