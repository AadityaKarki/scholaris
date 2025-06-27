import { useState, useContext } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import app from "../firebase";
import { UserContext } from "../UserContext";
import Padlock from "../components/padlock";
import Fingerprint from "../components/fingerprint";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterOrLogin, setIsRegisterOrLogin] = useState("register");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { username, setUsername, id, setId } = useContext(UserContext);
  const auth = getAuth(app);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegisterOrLogin === "register") {
        // Registration logic
        const usercredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Set display name to email username (part before @)
        const displayName = email.split("@")[0];
        setUsername(displayName);
        setId(usercredential.user.uid);
        const res = await axios.post(
          "http://localhost:5000/start-learning/register",
          {
            username: username,
            userId: id,
          }
        );
        navigate(`/learnsession/${id}`);
      } else {
        // Login logic
        const usercredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUsername(usercredential.user.email.split("@")[0]);
        setId(usercredential.user.uid);
        navigate(`/learnsession/${usercredential.user.uid.toString()}`);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen md:flex">
      <div className="relative overflow-hidden md:flex w-2/3 bg-gradient-to-tr from-blue-900 to-blue-950 i justify-around items-center hidden z-40">
        <div>
          <h1 className="text-white font-bold text-6xl font-sans">Scholaris</h1>
          <p className="text-white mt-1">The best way to learn.</p>
        </div>
        <div className="absolute -bottom-32 -left-40 w-80 h-80 border-4 rounded-full border-opacity-30 border-t-8"></div>
        <div className="absolute -bottom-40 -left-20 w-80 h-80 border-4 rounded-full border-opacity-30 border-t-8"></div>
        <div className="absolute -top-40 -right-0 w-80 h-80 border-4 rounded-full border-opacity-30 border-t-8"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 border-4 rounded-full border-opacity-30 border-t-8"></div>
      </div>
      <div className="flex md:w-1/2 justify-center py-10 items-center bg-white">
        <div className="flex-col p-10 w-1/2">
          <form className="bg-white" onSubmit={handleSubmit}>
            <div className="flex items-center border-2 py-2 px-3 rounded-2xl mb-4">
              <Fingerprint />
              <input
                className="pl-2 outline-none border-none"
                type="email" // Changed to email type
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="Email" // Changed from Username to Email
                required
              />
            </div>

            <div className="flex items-center border-2 py-2 px-3 rounded-2xl">
              <Padlock />
              <input
                className="pl-2 outline-none border-none"
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="Password"
                required
              />
            </div>

            {isRegisterOrLogin === "register" ? (
              <button
                type="submit"
                className="block w-full bg-indigo-600 mt-4 py-2 rounded-2xl text-white font-semibold mb-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            ) : (
              <button
                type="submit"
                className="block w-full bg-indigo-600 mt-4 py-2 rounded-2xl text-white font-semibold mb-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            )}
          </form>
          <div className="text-center">
            {isRegisterOrLogin === "register" ? (
              <span className="text-sm ml-2 items-center">
                Already a member?{" "}
                <button
                  className="hover:text-blue-500 cursor-pointer"
                  onClick={() => {
                    setIsRegisterOrLogin("login");
                    setEmail("");
                    setPassword("");
                    setError(null);
                  }}
                >
                  Log In
                </button>
              </span>
            ) : (
              <span className="text-sm ml-2">
                Not a member?{" "}
                <button
                  className="hover:text-blue-500 cursor-pointer items-center"
                  onClick={() => {
                    setIsRegisterOrLogin("register");
                    setEmail("");
                    setPassword("");
                    setError(null);
                  }}
                >
                  Register
                </button>
              </span>
            )}
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2 text-wrap text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
