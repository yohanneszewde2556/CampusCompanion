import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const userInfo = useSelector((state) => state.auth.userInfo);

  const [formData, setFormData] = useState({ title: '', body: '', category: 'university', priorityLevel: 'normal' });

  useEffect(() => {
    fetchAnnouncements();
  }, [categoryFilter]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/announcements?category=${categoryFilter}`);
      setAnnouncements(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', formData);
      setShowModal(false);
      setFormData({ title: '', body: '', category: 'university', priorityLevel: 'normal' });
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
      alert('Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch(err) {
      alert('Failed to delete announcement');
    }
  };

  const categories = ['all', 'university', 'department', 'event', 'emergency', 'general'];
  const canManage = ['admin', 'moderator'].includes(userInfo?.role);

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6 w-full fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold dark:text-white mb-2 flex items-center gap-3">
             <span className="text-4xl hidden sm:block">📢</span> Global Campus Feed
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl">Stay updated with official university news, department bulletins, and critical campus emergency alerts in real time.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => setShowModal(true)}
            className="relative z-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3.5 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap">
            + Post Announcement
          </button>
        )}
      </div>

      <div className="flex bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-x-auto custom-scrollbar">
        {categories.map(cat => (
           <button 
             key={cat}
             onClick={() => setCategoryFilter(cat)}
             className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap capitalize transition-all ${categoryFilter === cat ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
             {cat}
           </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
        ) : announcements.length === 0 ? (
          <div className="text-center p-16 bg-white dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
             <h3 className="text-xl font-bold dark:text-gray-300 text-gray-700 mb-1">Catching up!</h3>
             <p className="text-gray-500 dark:text-gray-400">There are no announcements to display for this filter right now.</p>
          </div>
        ) : (
          announcements.map((ann) => {
            const isEmergency = ann.priorityLevel === 'critical' || ann.category === 'emergency';
            
            return (
              <div key={ann._id} className={`p-6 rounded-3xl border shadow-sm transition-all relative overflow-hidden group ${isEmergency ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60'}`}>
                 {isEmergency && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>}
                 
                 <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3 mb-4">
                       <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg ${isEmergency ? 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                         {ann.category}
                       </span>
                       {ann.priorityLevel === 'high' && !isEmergency && <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">🔥 HIGH PRIORITY</span>}
                    </div>
                    {canManage && (
                      <button onClick={() => handleDelete(ann._id)} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                 </div>

                 <h2 className={`text-2xl font-extrabold mb-3 line-clamp-2 ${isEmergency ? 'text-red-800 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}>{ann.title}</h2>
                 <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-medium mb-6">{ann.body}</p>

                 <div className={`flex items-center pt-4 border-t ${isEmergency ? 'border-red-200 dark:border-red-900/50' : 'border-gray-100 dark:border-gray-700/50'}`}>
                   <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      Posted by {ann.authorId?.firstName} {ann.authorId?.lastName} <span className="opacity-50 mx-1">•</span> {new Date(ann.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                   </p>
                 </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && canManage && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
             <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">Broadcast Announcement</h2>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold text-2xl">&times;</button>
             </div>
             <form onSubmit={handlePost} className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Headline *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none appearance-none font-medium capitalize">
                      {categories.filter(c => c !== 'all').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Priority Level</label>
                    <select value={formData.priorityLevel} onChange={e => setFormData({...formData, priorityLevel: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none appearance-none font-medium">
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical / Emergency</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Message Body *</label>
                  <textarea required value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 min-h-[140px] focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none resize-none" />
                </div>
                <div className="mt-2 pt-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                   <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 w-full transition-transform hover:-translate-y-0.5">Broadcast Now</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
