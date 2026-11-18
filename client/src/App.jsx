import "./App.css";
import Login from "./pages/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserContextProvider } from "./UserContext";
import User from "./pages/User";
import Study from "./pages/Study";

const App = () => {
  return (
    <UserContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/user" element={<User />} />
          <Route path="/learnsession/:id" element={<Study />} />
        </Routes>
      </Router>
    </UserContextProvider>
  );
};

export default App;
