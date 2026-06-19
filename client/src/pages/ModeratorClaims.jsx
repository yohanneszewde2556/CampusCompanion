import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ModeratorClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const { data } = await api.get('/lost-found/claims?status=pending');
        setClaims(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const handleReview = async (claimId, status) => {
    await api.put(`/lost-found/claims/${claimId}`, { status });
    setClaims((prev) => prev.filter((c) => c._id !== claimId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Pending Claims</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">Review and verify item claims.</p>

      <div className="mt-8 space-y-4">
        {claims.map((claim) => (
          <div key={claim._id} className="rounded-xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <Link to={`/lost-found/${claim.itemId?._id}`} className="font-bold text-blue-600 hover:underline dark:text-blue-400">
                  {claim.itemId?.title}
                </Link>
                <p className="mt-1 text-sm text-gray-500">
                  {claim.itemId?.type} • {claim.itemId?.category} • Reporter: {claim.itemId?.reporterId?.firstName} {claim.itemId?.reporterId?.lastName}
                </p>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{claim.claimerId?.firstName} {claim.claimerId?.lastName}:</span> {claim.message}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleReview(claim._id, 'approved')} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                  Approve
                </button>
                <button onClick={() => handleReview(claim._id, 'rejected')} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {claims.length === 0 && (
          <p className="text-center text-gray-500 py-12">No pending claims.</p>
        )}
      </div>
    </div>
  );
};

export default ModeratorClaims;
