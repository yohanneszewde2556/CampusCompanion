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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', formData);
      dispatch(setCredentials(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Register</h2>
        {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex gap-4">
            <div className="w-1/2">
              <label className="mb-2 block text-sm font-bold text-gray-700">First Name</label>
              <input type="text" name="firstName" className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none" onChange={handleChange} required />
            </div>
            <div className="w-1/2">
              <label className="mb-2 block text-sm font-bold text-gray-700">Last Name</label>
              <input type="text" name="lastName" className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none" onChange={handleChange} required />
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700">Email</label>
            <input type="email" name="email" className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none" onChange={handleChange} required />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">Password</label>
            <input type="password" name="password" className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none" onChange={handleChange} required />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="focus:shadow-outline rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none">Register</button>
            <Link to="/login" className="inline-block align-baseline text-sm font-bold text-blue-500 hover:text-blue-800">Have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
