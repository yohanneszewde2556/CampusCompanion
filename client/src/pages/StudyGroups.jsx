import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Selection
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  
  // Chat state
  const [messageText, setMessageText] = useState('');
  const chatEndRef = useRef(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Dummy user ID since we are mocking auth globally for now, but usually we map from Redux
  const myUserId = "666666666666666666666666";

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupDetails();
      // In a real app we'd initiate socket.on('new-group-message') here
    }
  }, [selectedGroupId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeGroup?.messages]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/study-groups?search=${search}`);
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const res = await api.get(`/study-groups/${selectedGroupId}`);
      setActiveGroup(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/study-groups', formData);
      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchGroups();
      setSelectedGroupId(res.data._id); // Auto-open new group
    } catch (err) {
      console.error(err);
      alert('Failed to create group');
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/study-groups/${selectedGroupId}/join`);
      fetchGroupDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      const copyMessage = messageText;
      setMessageText('');
      await api.post(`/study-groups/${selectedGroupId}/messages`, { text: copyMessage });
      // Reload details to get new message visually - Socket.io would negate need for this
      fetchGroupDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    }
  };

  const isMember = activeGroup?.members?.some(m => m === myUserId || m._id === myUserId);

  return (
    <div className="flex h-[calc(100vh-4rem)] p-4 max-w-7xl mx-auto gap-6 w-full fade-in">
      
      {/* Left Sidebar: Group List */}
      <div className="w-full md:w-1/3 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold dark:text-white">Study Groups</h2>
             <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full font-bold shadow-lg shadow-blue-500/30 text-xl flex items-center justify-center transition-transform hover:scale-105">+</button>
          </div>
          <input 
            type="text" 
            placeholder="Search groups..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchGroups()}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 shadow-inner dark:text-white"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
             <div className="text-center p-4 text-gray-500">Loading...</div>
          ) : groups.length === 0 ? (
             <div className="text-center p-6 text-gray-400">No groups found. Create one!</div>
          ) : (
            groups.map(g => (
              <button 
                key={g._id}
                onClick={() => setSelectedGroupId(g._id)}
                className={`w-full text-left p-4 rounded-2xl transition-all ${selectedGroupId === g._id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 border shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'}`}>
                <h3 className={`font-bold truncate ${selectedGroupId === g._id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>{g.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{g.description}</p>
                <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1">👥 {g.members?.length || 0} members</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Content: Group View */}
      <div className="hidden md:flex flex-col w-2/3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
        {!activeGroup ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/30 dark:bg-gray-800/30">
              <span className="text-6xl mb-4">📚</span>
              <h3 className="text-2xl font-bold dark:text-gray-300 text-gray-700 mb-2">Select a Study Group</h3>
              <p className="max-w-xs">Join discussions, share notes, and schedule study sessions with your peers.</p>
           </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
               <div>
                 <h2 className="text-2xl font-extrabold dark:text-white text-gray-900">{activeGroup.name}</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeGroup.members?.length} Members • Created {new Date(activeGroup.createdAt).toLocaleDateString()}</p>
               </div>
               {!isMember ? (
                 <button onClick={handleJoin} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-emerald-500/30 transition-transform">Join Group</button>
               ) : (
                 <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold px-4 py-2 rounded-xl">Member</span>
               )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-gray-900/30 flex flex-col gap-4">
               {activeGroup.messages?.length === 0 ? (
                 <div className="m-auto text-center text-gray-400">
                    <span className="text-4xl block mb-2">👋</span>
                    Say hello to the group!
                 </div>
               ) : (
                 activeGroup.messages?.map((msg) => {
                   const isMe = msg.senderId?._id === myUserId;
                   return (
                     <div key={msg._id} className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                       {!isMe && <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1 font-semibold">{msg.senderId?.firstName || 'User'}</span>}
                       <div className={`p-3.5 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 dark:text-gray-200 rounded-tl-none'}`}>
                          {msg.text}
                       </div>
                       <span className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'pr-1' : 'pl-1'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                   );
                 })
               )}
               <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            {isMember ? (
              <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                 <input 
                   type="text" 
                   required
                   placeholder="Type a message..."
                   value={messageText}
                   onChange={e => setMessageText(e.target.value)}
                   className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 dark:text-white"
                 />
                 <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-transform disabled:opacity-50">Send</button>
              </form>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 font-medium">
                 You must join the group to view chat history and participate in the discussion.
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for creating group */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
             <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Study Group</h2>
               <button onClick={() => setShowModal(false)} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold">&times;</button>
             </div>
             <form onSubmit={handleCreateGroup} className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Group Name *</label>
                  <input type="text" required placeholder="e.g. CS101 Midterm Prep" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none transition-all placeholder-gray-400"/>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Description *</label>
                  <textarea required placeholder="What will this group focus on?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 min-h-[100px] focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:outline-none transition-all resize-none placeholder-gray-400" />
                </div>
                <div className="mt-2 pt-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                   <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                   <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30">Create Group</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};
export default StudyGroups;
