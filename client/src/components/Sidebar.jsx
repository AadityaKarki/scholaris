import { useRef, useEffect } from "react";
import PropTypes from "prop-types";

export default function Sidebar({
  sidebarWidth,
  setSidebarWidth,
  conversations,
  currentConversation,
  onSelectConversation,
  onStartNewConversation,
}) {
  const sidebarRef = useRef(null);

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
      if (width >= 300 && width <= 400) {
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
  }, [setSidebarWidth]);

  return (
    <div
      ref={sidebarRef}
      style={{ width: sidebarWidth }}
      className="bg-gray-900 h-full min-w-[300px] max-w-[400px] relative flex flex-col border-r border-gray-700"
    >
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Conversations</h2>
        <button
          onClick={onStartNewConversation}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm"
        >
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation._id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
              currentConversation?._id === conversation._id ? "bg-gray-800" : ""
            }`}
          >
            <div className="font-medium">{conversation.title}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(conversation.createdAt).toLocaleString().split("T")[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  sidebarWidth: PropTypes.string.isRequired,
  setSidebarWidth: PropTypes.func.isRequired,
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      lastMessage: PropTypes.string,
      createdAt: PropTypes.string,
    })
  ).isRequired,
  currentConversation: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    lastMessage: PropTypes.string,
    createdAt: PropTypes.string,
  }),
  onSelectConversation: PropTypes.func.isRequired,
  onStartNewConversation: PropTypes.func.isRequired,
};
