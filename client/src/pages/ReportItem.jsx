import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ITEM_CATEGORIES } from '../constants/categories';

const ReportItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'lost',
    category: 'other',
    title: '',
    description: '',
    locationDescription: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImageFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let images = [];

      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        imageFiles.forEach((file) => uploadData.append('images', file));
        const { data } = await api.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        images = data.urls;
      }

      const { data: item } = await api.post('/lost-found', { ...formData, images });
      navigate(`/lost-found/${item._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8">
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800 md:p-10">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-bl-full bg-blue-500 opacity-10" />

        <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">Report an Item</h1>
        <p className="mb-8 font-medium text-gray-500 dark:text-gray-400">
          Provide accurate details to help our AI matching engine find a match.
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 font-medium text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Lost or found?</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${formData.type === 'lost' ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'}`}>
                <input type="radio" name="type" value="lost" checked={formData.type === 'lost'} onChange={handleChange} className="sr-only" />
                <span className="mb-1 block text-lg font-bold">I Lost Something</span>
                <span className="text-xs opacity-80">Help me find it</span>
              </label>
              <label className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${formData.type === 'found' ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'}`}>
                <input type="radio" name="type" value="found" checked={formData.type === 'found'} onChange={handleChange} className="sr-only" />
                <span className="mb-1 block text-lg font-bold">I Found Something</span>
                <span className="text-xs opacity-80">I want to return it</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 p-3.5 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              required
            >
              {ITEM_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Item Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Apple AirPods Pro (White)"
              className="w-full rounded-xl border border-gray-300 p-3.5 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Detailed Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Distinguishing markings, serial numbers, color, scuffs, etc."
              className="w-full rounded-xl border border-gray-300 p-3.5 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Location</label>
            <input
              type="text"
              name="locationDescription"
              value={formData.locationDescription}
              onChange={handleChange}
              placeholder="e.g. 3rd floor of the Library"
              className="w-full rounded-xl border border-gray-300 p-3.5 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Photos (up to 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
            />
            {previews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-20 w-20 rounded-lg object-cover" />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 border-t border-gray-100 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/lost-found')}
              className="w-1/3 rounded-xl border-2 border-gray-200 bg-white py-3.5 font-bold text-gray-800 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : `Post as ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
