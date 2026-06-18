import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const LostFoundFeed = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState(''); // 'lost' or 'found'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const url = filter ? `/lost-found?type=${filter}` : `/lost-found`;
        const { data } = await api.get(url);
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch feed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [filter]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Lost & Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Browse reported items or submit a new missing query.</p>
        </div>
        <Link to="/report-item" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300">
          + Report an Item
        </Link>
      </div>

      <div className="flex gap-4 mb-8 border-b dark:border-gray-700 pb-4">
        <button onClick={() => setFilter('')} className={`px-5 py-2 rounded-full font-medium transition-colors ${!filter ? 'bg-gray-800 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}>All Items</button>
        <button onClick={() => setFilter('lost')} className={`px-5 py-2 rounded-full font-medium transition-colors ${filter === 'lost' ? 'bg-red-600 text-white shadow' : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-gray-800 dark:text-red-400'}`}>Lost</button>
        <button onClick={() => setFilter('found')} className={`px-5 py-2 rounded-full font-medium transition-colors ${filter === 'found' ? 'bg-green-600 text-white shadow' : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-gray-800 dark:text-green-400'}`}>Found</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden dark:bg-gray-800 border dark:border-gray-700 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
              {item.images && item.images[0] ? (
                <img src={item.images[0]} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                   <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              )}
              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate pr-2">{item.title}</h2>
                    <span className={`text-[10px] tracking-wider px-2.5 py-1 rounded-md font-bold uppercase ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{item.type}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                  <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="truncate">{item.locationDescription}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-medium mt-4 border-t pt-3 border-gray-100 dark:border-gray-700">
                  By {item.reporterId?.firstName} {item.reporterId?.lastName} • {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
             <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <p className="text-lg font-medium text-gray-500">No items found for this category.</p> 
          </div>}
        </div>
      )}
    </div>
  );
};
export default LostFoundFeed;
