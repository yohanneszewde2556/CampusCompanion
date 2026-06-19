import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const userInfo = useSelector((state) => state.auth.userInfo);

  if (userInfo?.accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
