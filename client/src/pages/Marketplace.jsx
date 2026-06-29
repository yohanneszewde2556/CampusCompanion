import { useState, useEffect } from 'react';
import api from '../services/api';

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Form states for creating listing
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: 'books' });

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [category]); // Auto-fetch on category change

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/marketplace?category=${category}&search=${search}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marketplace', formData);
      setShowModal(false);
      setFormData({ title: '', description: '', price: '', category: 'books' });
      fetchItems();
    } catch (err) {
      console.error(err);
      alert('Failed to post item');
    }
  };

  const categories = ['all', 'books', 'electronics', 'furniture', 'clothing', 'other'];

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 w-full fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white">Student Marketplace</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Buy and sell trusted campus goods seamlessly.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-0.5">
          + Sell an Item
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input 
            type="text" 
            placeholder="Search listings..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none shadow-sm transition-all"
          />
          <button type="submit" className="bg-gray-800 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold hover:opacity-90 shadow-sm transition-all">Search</button>
        </form>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 w-full md:w-56 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none shadow-sm appearance-none font-medium">
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
         <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
      ) : items.length === 0 ? (
        <div className="text-center py-32 bg-white dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-2xl font-bold dark:text-white text-gray-700 mb-2">No items found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Try adjusting your search filters or be the first to sell something in this category!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item._id} onClick={() => setSelectedItem(item)} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col cursor-pointer">
              <div className="h-48 bg-gray-100 dark:bg-gray-900 w-full flex items-center justify-center text-gray-400 italic object-cover overflow-hidden relative">
                 {item.images?.length > 0 ? (
                   <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <span className="text-4xl text-gray-300 dark:text-gray-700">📸</span>
                 )}
                 <div className="absolute top-3 right-3 flex gap-2">
                   <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur text-gray-800 dark:text-gray-200 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm capitalize">
                     {item.category}
                   </span>
                 </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-lg dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <span className="bg-green-100 text-green-800 text-sm font-extrabold px-2.5 py-1 rounded-lg dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap border border-green-200 dark:border-green-800/50">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-1 font-medium leading-relaxed">{item.description}</p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white dark:ring-gray-800">
                    {item.sellerId?.firstName?.charAt(0)}{item.sellerId?.lastName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{item.sellerId?.firstName} {item.sellerId?.lastName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
             <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Marketplace Listing</h2>
               <button onClick={() => setShowModal(false)} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold">&times;</button>
             </div>
             <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">What are you selling? *</label>
                  <input type="text" required placeholder="e.g. Intro to Calculus Textbook" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none transition-all placeholder-gray-400"/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Price ($) *</label>
                    <input type="number" required min="0" step="0.01" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none transition-all placeholder-gray-400 font-mono"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Category *</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none transition-all font-medium appearance-none">
                      {categories.filter(c => c !== 'all').map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Description *</label>
                  <textarea required placeholder="Describe condition, pickup locations, etc..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 min-h-[120px] focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none transition-all resize-none placeholder-gray-400" />
                </div>

                <div className="mt-2 pt-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                   <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                   <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-0.5">Post Listing</button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Item View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
             <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{selectedItem.category} Listing</h2>
               <button onClick={() => setSelectedItem(null)} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold">&times;</button>
             </div>
             <div className="p-6 md:p-8 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl md:text-3xl font-extrabold dark:text-white leading-tight">{selectedItem.title}</h1>
                  <span className="bg-green-100 text-green-800 text-lg md:text-xl font-extrabold px-4 py-2 rounded-xl dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap border border-green-200 dark:border-green-800/50">
                    ${parseFloat(selectedItem.price).toFixed(2)}
                  </span>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                   <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedItem.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                       {selectedItem.sellerId?.firstName?.charAt(0)}{selectedItem.sellerId?.lastName?.charAt(0)}
                     </div>
                     <div>
                       <p className="font-bold text-gray-900 dark:text-gray-100">{selectedItem.sellerId?.firstName} {selectedItem.sellerId?.lastName}</p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">Seller</p>
                     </div>
                   </div>
                   <button 
                     onClick={() => window.location.href = `mailto:${selectedItem.sellerId?.email}?subject=Interested in: ${selectedItem.title}`}
                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-0.5">
                     Message Seller
                   </button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default Marketplace;
