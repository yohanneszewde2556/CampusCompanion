import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ReportItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    locationDescription: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/lost-found', formData);
      navigate('/lost-found');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-bl-full -mr-10 -mt-10"></div>
        
        <h1 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">Report an Item</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Please provide accurate details to help our AI matching engine link it back!</p>
        
        {error && <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Are you reporting a lost or found item?</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${formData.type === 'lost' ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'}`}>
                <input type="radio" name="type" value="lost" checked={formData.type === 'lost'} onChange={handleChange} className="sr-only" />
                <span className="block font-bold text-lg mb-1">I Lost Something</span>
                <span className="text-xs opacity-80">Help me find it</span>
              </label>
              
              <label className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${formData.type === 'found' ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'}`}>
                <input type="radio" name="type" value="found" checked={formData.type === 'found'} onChange={handleChange} className="sr-only" />
                <span className="block font-bold text-lg mb-1">I Found Something</span>
                <span className="text-xs opacity-80">I want to return it</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Item Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Apple AirPods Pro (White)" className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Detailed Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Provide distinguishing markings, serial numbers, case color, scuffs, etc. The more details, the better our AI can find a match." className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all dark:bg-gray-900 dark:border-gray-600 dark:text-white" required></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location Context</label>
            <input type="text" name="locationDescription" value={formData.locationDescription} onChange={handleChange} placeholder="e.g. Left on a table on the 3rd floor of the Library" className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
            <p className="mt-1.5 text-xs text-gray-500">Provide the last known location or the location where it was discovered.</p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={() => navigate('/lost-found')} className="w-1/3 bg-white text-gray-800 border-2 border-gray-200 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="w-2/3 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting to Core...' : `Post as ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ReportItem;
