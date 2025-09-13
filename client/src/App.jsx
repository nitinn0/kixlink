import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArenasPage from "./pages/Arenas";
import PlayersPage from "./pages/Players";
import MatchesPage from "./pages/Matches";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/arena" element={<ArenasPage />} />
        <Route path="/matches" element={<MatchesPage />} /> 
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
