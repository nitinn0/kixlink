import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArenasPage from "./pages/Arenas";
import PlayersPage from "./pages/Players";
import MatchesPage from "./pages/Matches";
import EditProfile from "./pages/EditProfile";
import TeamsPage from "./pages/Teams";
import ArenaDetails from "./pages/ArenaDetails";
import ChatPage from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import AddArenaPage from "./pages/admin-flow/Arenas";
import ViewArenas from "./pages/admin-flow/ViewArenas";
import Matches from "./pages/admin-flow/Matches";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/arenas" element={<AddArenaPage />} />
        <Route path="/admin/arenas/view" element={<ViewArenas />} />
        <Route path="/arena" element={<ArenasPage />} />
        <Route path="/arena/:id" element={<ArenaDetails />} />
        <Route path="/arena/:id/addMatch" element={<Matches />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/matches" element={<MatchesPage />} /> 
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
