import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LostFoundFeed from './pages/LostFoundFeed';
import ReportItem from './pages/ReportItem';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans antialiased">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/lost-found" element={<LostFoundFeed />} />
          <Route path="/report-item" element={<ReportItem />} />
          <Route path="/" element={<div className="flex flex-col h-screen items-center justify-center p-4">
            <h1 className="text-4xl font-extrabold mb-4">Welcome to Campus Companion</h1>
            <a href="/lost-found" className="text-blue-500 hover:underline">Go to Lost & Found</a>
            </div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
