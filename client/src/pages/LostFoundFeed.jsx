import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ITEM_CATEGORIES, CATEGORY_LABELS } from '../constants/categories';

const LostFoundFeed = () => {
  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [view, setView] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const endpoint = view === 'my' ? '/lost-found/my-items' : '/lost-found';
        const params = new URLSearchParams();
        if (typeFilter) params.set('type', typeFilter);
        if (categoryFilter) params.set('category', categoryFilter);
        const query = params.toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        const { data } = await api.get(url);
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch feed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [typeFilter, categoryFilter, view]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Lost & Found</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Browse reported items or submit a new report.</p>
        </div>
        <Link
          to="/report-item"
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
        >
          + Report an Item
        </Link>
      </div>

      <div className="mb-4 flex gap-2 border-b border-gray-200 pb-4 dark:border-gray-700">
        <button
          onClick={() => setView('all')}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            view === 'all' ? 'bg-gray-800 text-white shadow' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setView('my')}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            view === 'my' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          My Reports
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button onClick={() => setTypeFilter('')} className={`rounded-full px-4 py-1.5 text-sm font-medium ${!typeFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
          All Types
        </button>
        <button onClick={() => setTypeFilter('lost')} className={`rounded-full px-4 py-1.5 text-sm font-medium ${typeFilter === 'lost' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 dark:bg-gray-800 dark:text-red-400'}`}>
          Lost
        </button>
        <button onClick={() => setTypeFilter('found')} className={`rounded-full px-4 py-1.5 text-sm font-medium ${typeFilter === 'found' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 dark:bg-gray-800 dark:text-green-400'}`}>
          Found
        </button>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="">All Categories</option>
          {ITEM_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item._id}
              to={`/lost-found/${item._id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.title} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="flex flex-grow flex-col justify-between p-5">
                <div>
                  <div className="mb-3 flex items-start justify-between">
                    <h2 className="truncate pr-2 text-xl font-bold text-gray-800 dark:text-white">{item.title}</h2>
                    <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="mb-2 text-xs font-medium text-gray-400">{CATEGORY_LABELS[item.category]}</p>
                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.description}</p>
                  <div className="mb-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    <svg className="mr-1.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="truncate">{item.locationDescription}</span>
                  </div>
                  {item.matchedItems?.length > 0 && (
                    <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                      {item.matchedItems.length} match(es)
                    </span>
                  )}
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3 text-xs font-medium text-gray-400 dark:border-gray-700">
                  By {item.reporterId?.firstName} {item.reporterId?.lastName} • {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
          {items.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-lg font-medium text-gray-500">No items found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LostFoundFeed;
