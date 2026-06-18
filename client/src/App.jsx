import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans antialiased">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<div className="flex h-screen items-center justify-center p-4"><h1 className="text-3xl font-bold">Welcome to Campus Companion</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
