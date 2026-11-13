import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image, Tag, X } from 'lucide-react';
import { lookbookAPI, productAPI, convertToBase64 } from '../services/api';

const LookbookManagement = () => {
  const [lookbooks, setLookbooks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLookbook, setEditingLookbook] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taggedProducts: [],
    stylingTips: [''],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lbRes, prodRes] = await Promise.all([
        lookbookAPI.getAll(),
        productAPI.getAll(),
      ]);
      setLookbooks(lbRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      console.error('Error fetching lookbook data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingLookbook(null);
    setFormData({ title: '', description: '', taggedProducts: [], stylingTips: [''] });
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (lb) => {
    setEditingLookbook(lb);
    setFormData({
      title: lb.title || '',
      description: lb.description || '',
      taggedProducts: lb.taggedProducts || [],
      stylingTips: lb.stylingTips?.length ? lb.stylingTips : [''],
    });
    setImagePreview(lb.imageUrl || '');
    setImageFile(null);
    setShowForm(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const base64 = await convertToBase64(file);
    setImagePreview(base64);
  };

  const toggleProduct = (id) => {
    setFormData(prev => ({
      ...prev,
      taggedProducts: prev.taggedProducts.includes(id)
        ? prev.taggedProducts.filter(p => p !== id)
        : [...prev.taggedProducts, id],
    }));
  };

  const updateTip = (index, value) => {
    setFormData(prev => {
      const tips = [...prev.stylingTips];
      tips[index] = value;
      return { ...prev, stylingTips: tips };
    });
  };

  const addTip = () => setFormData(prev => ({ ...prev, stylingTips: [...prev.stylingTips, ''] }));
  const removeTip = (index) => setFormData(prev => ({ ...prev, stylingTips: prev.stylingTips.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        stylingTips: formData.stylingTips.filter(t => t.trim()),
      };
      if (imageFile) {
        payload.imageBase64 = await convertToBase64(imageFile);
      }
      if (editingLookbook) {
        await lookbookAPI.update(editingLookbook._id, payload);
      } else {
        await lookbookAPI.create(payload);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Error saving lookbook: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lookbook entry? This cannot be undone.')) return;
    try {
      await lookbookAPI.delete(id);
      setLookbooks(prev => prev.filter(lb => lb._id !== id));
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading lookbooks...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lookbook Management</h1>
          <p className="text-gray-500 mt-1">Create editorial stories to showcase your cardigans</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl hover:bg-primary/90 transition font-semibold"
        >
          <Plus size={20} /> New Story
        </button>
      </div>

      {/* Lookbook Grid */}
      {lookbooks.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-2xl">
          <div className="text-5xl mb-4">📸</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No lookbook stories yet</h3>
          <p className="text-gray-500 mb-6">Create your first editorial to show customers how to style your pieces.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition">
            <Plus size={18} /> Create First Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lookbooks.map(lb => (
            <div key={lb._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group">
              <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                {lb.imageUrl ? (
                  <img src={lb.imageUrl} alt={lb.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={40} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg">{lb.title}</h3>
                {lb.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lb.description}</p>}
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <Tag size={14} />
                  <span>{lb.taggedProducts?.length || 0} products tagged</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEdit(lb)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lb._id)}
                    className="flex items-center justify-center gap-2 py-2 px-3 border border-red-200 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLookbook ? 'Edit Lookbook Story' : 'New Lookbook Story'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 transition">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary transition relative"
                  onClick={() => document.getElementById('lb-image-input').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="py-6">
                      <Image size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload editorial photo</p>
                    </div>
                  )}
                  <input
                    id="lb-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. The Duster Moment"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the styling story or mood..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none resize-none"
                />
              </div>

              {/* Styling Tips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Styling Tips</label>
                <div className="space-y-2">
                  {formData.stylingTips.map((tip, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={tip}
                        onChange={e => updateTip(i, e.target.value)}
                        placeholder={`Tip ${i + 1}: e.g. Wear buttoned as a top over high-waist trousers`}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm"
                      />
                      {formData.stylingTips.length > 1 && (
                        <button type="button" onClick={() => removeTip(i)} className="text-red-400 hover:text-red-600 transition p-1">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addTip} className="text-primary text-sm font-medium hover:underline flex items-center gap-1 mt-1">
                    <Plus size={15} /> Add another tip
                  </button>
                </div>
              </div>

              {/* Tagged Products */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag Products in this Look</label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                  {products.map(p => (
                    <label key={p._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.taggedProducts.includes(p._id)}
                        onChange={() => toggleProduct(p._id)}
                        className="w-4 h-4 accent-primary"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {p.images?.[0] && (
                          <img src={p.images[0].url} alt="" className="w-8 h-8 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-700 truncate">{p.name}</span>
                      </div>
                    </label>
                  ))}
                  {products.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No products found. Add products first.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingLookbook ? 'Save Changes' : 'Create Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LookbookManagement;

