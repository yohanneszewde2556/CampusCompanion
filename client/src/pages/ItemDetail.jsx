import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { CATEGORY_LABELS } from '../constants/categories';

const ItemDetail = () => {
  const { id } = useParams();
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimError, setClaimError] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = item?.reporterId?._id === userInfo?._id;
  const isModerator = ['moderator', 'admin'].includes(userInfo?.role);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/lost-found/${id}`);
        setItem(data.item);
        setClaims(data.claims || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleResolve = async () => {
    try {
      const { data } = await api.put(`/lost-found/${id}/resolve`);
      setItem(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve item');
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setClaimError(null);
    try {
      await api.post(`/lost-found/${id}/claim`, { message: claimMessage });
      setClaimSuccess(true);
      setClaimMessage('');
      const { data } = await api.get(`/lost-found/${id}`);
      setClaims(data.claims || []);
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewClaim = async (claimId, status) => {
    try {
      await api.put(`/lost-found/claims/${claimId}`, { status });
      const { data } = await api.get(`/lost-found/${id}`);
      setItem(data.item);
      setClaims(data.claims || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review claim');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p className="text-red-600">{error || 'Item not found'}</p>
        <Link to="/lost-found" className="mt-4 text-blue-600 hover:underline">Back to feed</Link>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-blue-100 text-blue-700',
    matched: 'bg-amber-100 text-amber-700',
    resolved: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link to="/lost-found" className="mb-6 inline-flex items-center text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
        ← Back to Lost & Found
      </Link>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {item.images?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 p-4 md:grid-cols-3">
            {item.images.map((url, i) => (
              <img key={i} src={url} alt={item.title} className="h-48 w-full rounded-xl object-cover" />
            ))}
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{item.title}</h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Reported by {item.reporterId?.firstName} {item.reporterId?.lastName} •{' '}
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-md px-3 py-1 text-xs font-bold uppercase ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {item.type}
              </span>
              <span className={`rounded-md px-3 py-1 text-xs font-bold uppercase ${statusColors[item.status]}`}>
                {item.status}
              </span>
              <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {CATEGORY_LABELS[item.category] || item.category}
              </span>
            </div>
          </div>

          <p className="mt-6 leading-relaxed text-gray-700 dark:text-gray-300">{item.description}</p>

          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {item.locationDescription}
          </div>

          {(isOwner || isModerator) && item.status !== 'resolved' && (
            <button
              type="button"
              onClick={handleResolve}
              className="mt-6 rounded-xl bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 dark:bg-gray-700"
            >
              Mark as Resolved
            </button>
          )}
        </div>
      </div>

      {item.matchedItems?.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">AI Matches</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {item.matchedItems.map((match) => {
              const matched = match.itemId;
              if (!matched) return null;
              return (
                <Link
                  key={matched._id}
                  to={`/lost-found/${matched._id}`}
                  className="rounded-xl border border-amber-200 bg-amber-50 p-4 transition hover:shadow-md dark:border-amber-800 dark:bg-amber-900/20"
                >
                  <div className="flex justify-between">
                    <p className="font-bold text-gray-900 dark:text-white">{matched.title}</p>
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      {Math.round(match.confidenceScore * 100)}% match
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{matched.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!isOwner && item.status !== 'resolved' && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Claim this item</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Think this is yours? Describe why and a moderator will verify your claim.
          </p>

          {claimSuccess && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Claim submitted successfully!
            </div>
          )}
          {claimError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{claimError}</div>
          )}

          <form onSubmit={handleClaim} className="mt-4 space-y-4">
            <textarea
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              rows="3"
              placeholder="Describe identifying features that prove this item belongs to you..."
              className="w-full rounded-xl border border-gray-300 p-3 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </form>
        </div>
      )}

      {(isOwner || isModerator) && claims.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Claims</h2>
          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {claim.claimerId?.firstName} {claim.claimerId?.lastName}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{claim.message}</p>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase ${
                    claim.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    claim.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {claim.status}
                  </span>
                </div>
                {isModerator && claim.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleReviewClaim(claim._id, 'approved')}
                      className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewClaim(claim._id, 'rejected')}
                      className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
