import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { unboxingAPI } from '../utils/api';
import { Upload, X, Plus, Heart, Share2, Download } from 'lucide-react';

interface UnboxingPhoto {
  id: number;
  image_url: string;
  caption?: string;
  created_at: string;
  uploaded_by: string;
}

export default function Gallery() {
  const { user } = useAuthStore();
  const [photos, setPhotos] = useState<UnboxingPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<UnboxingPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await unboxingAPI.getAll();
      if (response.success && response.data) {
        setPhotos(response.data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      const response = await unboxingAPI.upload(selectedFile, caption);
      
      if (response.success) {
        setShowUploadModal(false);
        setSelectedFile(null);
        setCaption('');
        fetchPhotos(); // Refresh the gallery
        alert('Photo uploaded successfully!');
      } else {
        alert('Failed to upload photo. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await unboxingAPI.delete(photoId);
      if (response.success) {
        fetchPhotos(); // Refresh the gallery
        alert('Photo deleted successfully!');
      } else {
        alert('Failed to delete photo.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the photo.');
    }
  };

  const handleShare = (photo: UnboxingPhoto) => {
    if (navigator.share) {
      navigator.share({
        title: 'K-pop Unboxing Photo',
        text: photo.caption || 'Check out this K-pop merchandise unboxing!',
        url: photo.image_url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(photo.image_url);
      alert('Image URL copied to clipboard!');
    }
  };

  const handleDownload = async (photo: UnboxingPhoto) => {
    try {
      const response = await fetch(photo.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unboxing-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 rounded-xl aspect-square"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Unboxing Gallery</h1>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Photo
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">📸</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No photos yet</h2>
              <p className="text-gray-600 mb-4">
                {user?.role === 'admin' 
                  ? "Be the first to upload unboxing photos!" 
                  : "Check back soon for amazing K-pop unboxing photos!"}
              </p>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Upload First Photo
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="aspect-square bg-gray-200 cursor-pointer relative group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.image_url}
                    alt={photo.caption || 'Unboxing photo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=K-pop+unboxing+merchandise+placeholder&image_size=square';
                    }}
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(photo);
                        }}
                        className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100"
                      >
                        <Share2 className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(photo);
                        }}
                        className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100"
                      >
                        <Download className="w-4 h-4 text-gray-700" />
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(photo.id);
                          }}
                          className="bg-red-500 bg-opacity-90 p-2 rounded-full hover:bg-opacity-100"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Photo Info */}
                <div className="p-4">
                  {photo.caption && (
                    <p className="text-gray-800 text-sm mb-2 line-clamp-2">{photo.caption}</p>
                  )}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Uploaded by {photo.uploaded_by}</span>
                    <span>{new Date(photo.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl max-h-full overflow-auto">
              <div className="relative">
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.caption || 'Unboxing photo'}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=K-pop+unboxing+merchandise+placeholder&image_size=landscape_16_9';
                  }}
                />
                
                {selectedPhoto.caption && (
                  <div className="p-6">
                    <p className="text-gray-800">{selectedPhoto.caption}</p>
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                      <span>Uploaded by {selectedPhoto.uploaded_by}</span>
                      <span>{new Date(selectedPhoto.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Upload Unboxing Photo</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setCaption('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caption (Optional)
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Share your unboxing experience..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Preview */}
                {selectedFile && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-2">Selected file:</p>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}