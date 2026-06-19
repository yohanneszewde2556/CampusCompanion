import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', formData);
      dispatch(setCredentials(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-800">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Campus Companion</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create your student account</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex gap-4">
            <div className="w-1/2">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
              <input
                type="text"
                name="firstName"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900/30"
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900/30"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900/30"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900/30"
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-green-500/30 hover:bg-green-700 disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
            <Link to="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Sign in instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
