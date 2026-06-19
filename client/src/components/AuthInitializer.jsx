import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout } from '../features/auth/authSlice';
import api from '../services/api';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (userInfo?.accessToken) {
        try {
          const { data } = await api.get('/auth/me');
          dispatch(setCredentials({ ...data, accessToken: userInfo.accessToken }));
        } catch {
          dispatch(logout());
        }
      }
      setReady(true);
    };

    validateSession();
  }, [dispatch, userInfo?.accessToken]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return children;
};

export default AuthInitializer;
