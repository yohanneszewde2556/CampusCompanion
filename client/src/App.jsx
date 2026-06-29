import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LostFoundFeed from './pages/LostFoundFeed';
import ReportItem from './pages/ReportItem';
import ItemDetail from './pages/ItemDetail';
import ModeratorClaims from './pages/ModeratorClaims';
import AIAssistant from './pages/AIAssistant';
import Marketplace from './pages/Marketplace';
import StudyGroups from './pages/StudyGroups';
import Announcements from './pages/Announcements';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans antialiased">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/lost-found" element={<LostFoundFeed />} />
            <Route path="/lost-found/:id" element={<ItemDetail />} />
            <Route path="/claims-review" element={<ModeratorClaims />} />
            <Route path="/report-item" element={<ReportItem />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/study-groups" element={<StudyGroups />} />
            <Route path="/announcements" element={<Announcements />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
