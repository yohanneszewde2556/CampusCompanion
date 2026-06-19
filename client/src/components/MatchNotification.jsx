import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../services/socket';

const MatchNotification = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userInfo?._id) return;

    const socket = connectSocket(userInfo._id);

    const onMatch = (data) => {
      setNotifications((prev) => [
        { id: Date.now(), ...data },
        ...prev,
      ].slice(0, 5));
    };

    socket?.on('lostFound:match', onMatch);

    return () => {
      socket?.off('lostFound:match', onMatch);
    };
  }, [userInfo?._id]);

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed right-4 top-20 z-50 flex max-w-sm flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="rounded-xl border border-blue-200 bg-white p-4 shadow-lg dark:border-blue-800 dark:bg-gray-800"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {n.type === 'claim' ? 'New Claim' : n.type === 'claim_review' ? 'Claim Update' : 'Match Found'}
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{n.message}</p>
              {n.itemId && (
                <Link
                  to={`/lost-found/${n.itemId}`}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  View item
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(n.id)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchNotification;
