import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Camera, ImagePlus } from 'lucide-react';

function ProgressPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    try {
      const res = await api.get('/progress/photos');
      setPhotos(res.data.photos || []);
    } catch (err) {
      console.error('Error loading photos:', err);
    } finally {
      setLoadingPhotos(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a photo first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('caption', caption);

      await api.post('/progress/upload-photo', formData);

      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      await loadPhotos();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-8 bg-white rounded-3xl p-8 border">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Camera size={26} /> Progress Photos
      </h2>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="mb-8">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Choose a photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm border rounded-2xl px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100"
            />

            <label className="block text-sm font-medium mb-2 mt-4">Caption (optional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. 3 months in!"
              className="w-full border rounded-2xl px-4 py-3 text-sm"
            />

            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={uploading}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-2xl font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ImagePlus size={18} />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </motion.button>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center border border-dashed rounded-2xl h-52 bg-gray-50 overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <p className="text-gray-400 text-sm">Photo preview will appear here</p>
            )}
          </div>
        </div>
      </form>

      {/* Gallery */}
      {loadingPhotos ? (
        <p className="text-center text-gray-400 py-8">Loading photos...</p>
      ) : photos.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No progress photos yet. Upload your first one above!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
              whileHover={{ scale: 1.03 }}
              className="rounded-2xl overflow-hidden border bg-gray-50 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={photo.image_url}
                alt={photo.caption || 'Progress photo'}
                className="w-full aspect-square object-cover"
              />
              <div className="p-3">
                {photo.caption && (
                  <p className="text-sm font-medium text-gray-900 truncate">{photo.caption}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(photo.logged_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProgressPhotos;