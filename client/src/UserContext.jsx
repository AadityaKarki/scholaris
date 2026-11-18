import { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [learnSessionId, setLearnSessionId] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.email.split("@")[0]);
        setId(user.uid);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        id,
        setId,
        learnSessionId,
        setLearnSessionId,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
