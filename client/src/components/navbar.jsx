import { useContext } from "react";
import { UserContext } from "../UserContext";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import app from "../firebase";

const auth = getAuth(app);

export default function Navbar() {
  const { username, setUsername, setId } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUsername(null);
      setId(null);
      navigate("/");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-white">Scholaris</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
