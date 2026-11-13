import { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Upload, Video, Image, Sparkles, 
  Ruler, Info, Layers, CheckCircle2, ChevronRight, AlertCircle 
} from 'lucide-react';
import { productAPI, convertToBase64 } from '../services/api';

const ProductForm = ({ product, onClose }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Cardigan',
    featured: false,
    knitGauge: '',
    warmthLevel: 3,
    fiberComposition: '',
    careInstructions: '',
    measurements: {
      chest: '',
      length: '',
      sleeve: '',
    },
    modelStats: {
      height: '',
      sizeWorn: '',
    },
    stylingTips: [],
    variants: [],
  });

  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    stock: '',
  });

  const [newTip, setNewTip] = useState('');

  // Media states
  const [images, setImages] = useState([]); // Base64 gallery images to upload
  const [newHoverImage, setNewHoverImage] = useState(null); // Base64
  const [hoverImagePreview, setHoverImagePreview] = useState(null);
  const [newVideo, setNewVideo] = useState(null); // Base64
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoFileName, setVideoFileName] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'Cardigan',
        featured: Boolean(product.featured),
        knitGauge: product.knitGauge || '',
        warmthLevel: product.warmthLevel || 3,
        fiberComposition: product.fiberComposition || '',
        careInstructions: product.careInstructions || '',
        measurements: {
          chest: product.measurements?.chest || '',
          length: product.measurements?.length || '',
          sleeve: product.measurements?.sleeve || '',
        },
        modelStats: {
          height: product.modelStats?.height || '',
          sizeWorn: product.modelStats?.sizeWorn || '',
        },
        stylingTips: product.stylingTips || [],
        variants: product.variants || [],
      });

      if (product.hoverImageUrl) {
        setHoverImagePreview(product.hoverImageUrl);
      }
      if (product.videoUrl) {
        setVideoPreview(product.videoUrl);
      }
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNestedChange = (group, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value,
      },
    }));
  };

  // Variants management
  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addVariant = () => {
    if (!newVariant.size || !newVariant.color || !newVariant.stock) {
      alert('Please fill all variant fields (Size, Color, Stock)');
      return;
    }

    const stock = parseInt(newVariant.stock, 10);
    if (isNaN(stock) || stock < 0) {
      alert('Stock must be a valid non-negative number');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant, stock }],
    }));

    setNewVariant({ size: '', color: '', stock: '' });
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Styling Tips
  const addStylingTip = () => {
    if (!newTip.trim()) return;
    setFormData((prev) => ({
      ...prev,
      stylingTips: [...prev.stylingTips, newTip.trim()],
    }));
    setNewTip('');
  };

  const removeStylingTip = (index) => {
    setFormData((prev) => ({
      ...prev,
      stylingTips: prev.stylingTips.filter((_, i) => i !== index),
    }));
  };

  // Media Handlers
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const base64Images = await Promise.all(
        files.map((file) => convertToBase64(file))
      );
      setImages((prev) => [...prev, ...base64Images]);
    } catch (error) {
      console.error('Error converting images:', error);
      alert('Failed to process gallery images');
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHoverImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      setNewHoverImage(base64);
      setHoverImagePreview(base64);
    } catch (err) {
      console.error('Hover image error:', err);
      alert('Failed to process hover image');
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 25MB client check
    if (file.size > 25 * 1024 * 1024) {
      alert('Video file is too large. Please select a video under 25MB.');
      return;
    }

    try {
      setVideoFileName(file.name);
      const base64 = await convertToBase64(file);
      setNewVideo(base64);
      setVideoPreview(URL.createObjectURL(file));
    } catch (err) {
      console.error('Video process error:', err);
      alert('Failed to process video file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.variants.length === 0) {
      setActiveTab('variants');
      setErrorMsg('Please add at least one product variant (Size, Color, Stock).');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setActiveTab('basic');
      setErrorMsg('Price must be a valid positive number.');
      return;
    }

    if (!formData.name.trim()) {
      setActiveTab('basic');
      setErrorMsg('Product name is required.');
      return;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      setActiveTab('basic');
      setErrorMsg('Description must be at least 10 characters.');
      return;
    }

    setSaving(true);
    try {
      // Build clean payload adhering to Zod schema
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        category: formData.category || 'Cardigan',
        featured: Boolean(formData.featured),
        variants: formData.variants,
      };

      if (formData.knitGauge) {
        payload.knitGauge = formData.knitGauge;
      }
      if (formData.warmthLevel) {
        payload.warmthLevel = Number(formData.warmthLevel);
      }
      if (formData.fiberComposition?.trim()) {
        payload.fiberComposition = formData.fiberComposition.trim();
      }
      if (formData.careInstructions?.trim()) {
        payload.careInstructions = formData.careInstructions.trim();
      }

      const measurements = {};
      if (formData.measurements?.chest?.trim()) measurements.chest = formData.measurements.chest.trim();
      if (formData.measurements?.length?.trim()) measurements.length = formData.measurements.length.trim();
      if (formData.measurements?.sleeve?.trim()) measurements.sleeve = formData.measurements.sleeve.trim();
      if (Object.keys(measurements).length > 0) {
        payload.measurements = measurements;
      }

      const modelStats = {};
      if (formData.modelStats?.height?.trim()) modelStats.height = formData.modelStats.height.trim();
      if (formData.modelStats?.sizeWorn?.trim()) modelStats.sizeWorn = formData.modelStats.sizeWorn.trim();
      if (Object.keys(modelStats).length > 0) {
        payload.modelStats = modelStats;
      }

      if (formData.stylingTips?.length > 0) {
        payload.stylingTips = formData.stylingTips.filter((t) => t.trim().length > 0);
      }

      let savedProduct;
      if (product) {
        const response = await productAPI.update(product._id, payload);
        savedProduct = response.data.data;
      } else {
        const response = await productAPI.create(payload);
        savedProduct = response.data.data;
      }

      const productId = savedProduct._id;

      // 1. Upload Gallery images
      if (images.length > 0) {
        await productAPI.uploadImages(productId, images);
      }

      // 2. Upload Hover image
      if (newHoverImage) {
        await productAPI.uploadHoverImage(productId, newHoverImage);
      }

      // 3. Upload Video
      if (newVideo) {
        await productAPI.uploadVideo(productId, newVideo);
      }

      alert('Product saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to save product';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'knitwear', label: 'Knitwear Specs', icon: Layers },
    { id: 'fit', label: 'Fit & Measurements', icon: Ruler },
    { id: 'styling', label: 'Styling Tips', icon: Sparkles },
    { id: 'variants', label: 'Variants & Stock', icon: CheckCircle2 },
    { id: 'media', label: 'Media & Video', icon: Image },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-neutral-100">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Rachbam Studio Admin</span>
            <h2 className="text-xl font-bold text-neutral-900">
              {product ? 'Edit Knitwear Garment' : 'Add New Knitwear Garment'}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-neutral-400 hover:text-neutral-700 p-2 rounded-full hover:bg-neutral-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-white overflow-x-auto scrollbar-none px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. The Oversized Ribbed Cardigan"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                    Price (₦ Naira) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="45000"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="Cardigan">Cardigan</option>
                    <option value="Chunky Knits">Chunky Knits</option>
                    <option value="Cropped Cardigans">Cropped Cardigans</option>
                    <option value="Dusters">Dusters</option>
                    <option value="Cashmere / Merino Essentials">Cashmere / Merino Essentials</option>
                    <option value="Sweater">Sweater</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-semibold text-neutral-800">Featured On Homepage</span>
                      <p className="text-xs text-neutral-500">Highlight in editorial collections & hero strips</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                  Garment Story & Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Detail the hand-feel, craft, drape, and purpose of this knitwear piece..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          )}

          {/* TAB 2: KNITWEAR SPECS */}
          {activeTab === 'knitwear' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                    Knit Gauge / Stitch Density
                  </label>
                  <select
                    name="knitGauge"
                    value={formData.knitGauge}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Select Knit Gauge (Optional)</option>
                    <option value="Fine / Lightweight">Fine / Lightweight (Delicate, breezy, ideal for layering/AC)</option>
                    <option value="Medium / All-Season">Medium / All-Season (Versatile year-round structured knit)</option>
                    <option value="Chunky / Heavyweight">Chunky / Heavyweight (Substantial, warm, harmattan-ready statement)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                    Warmth Level: {formData.warmthLevel} / 5
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({ ...formData, warmthLevel: lvl })}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${
                          formData.warmthLevel >= lvl
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-300'
                        }`}
                      >
                        Level {lvl}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    1 = Airy & Tropical | 3 = Mild AC / Breeze | 5 = Ultra-Cozy Harmattan Protection
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                  Fiber Composition
                </label>
                <input
                  type="text"
                  name="fiberComposition"
                  placeholder="e.g. 70% Superfine Merino Wool, 30% Cashmere"
                  value={formData.fiberComposition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
                <p className="text-xs text-neutral-500 mt-1">Specific fabric percentages build trust and reduce customer inquiries.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                  Care & Preservation Instructions
                </label>
                <textarea
                  name="careInstructions"
                  placeholder="e.g. Hand wash cold with delicate wool wash. Press gently between towels, do not wring. Reshape and lay flat to dry. Use a fabric comb for gentle de-pilling."
                  value={formData.careInstructions}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          )}

          {/* TAB 3: FIT & MEASUREMENTS */}
          {activeTab === 'fit' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3 flex items-center gap-2">
                  <Ruler size={16} className="text-primary" />
                  Garment Flat Measurements (Sample / Medium)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Chest / Pit-to-Pit</label>
                    <input
                      type="text"
                      placeholder="e.g. 56 cm / 22 in"
                      value={formData.measurements.chest}
                      onChange={(e) => handleNestedChange('measurements', 'chest', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Length</label>
                    <input
                      type="text"
                      placeholder="e.g. 70 cm / 27.5 in"
                      value={formData.measurements.length}
                      onChange={(e) => handleNestedChange('measurements', 'length', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Sleeve Length</label>
                    <input
                      type="text"
                      placeholder="e.g. 62 cm / 24.5 in"
                      value={formData.measurements.sleeve}
                      onChange={(e) => handleNestedChange('measurements', 'sleeve', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
                  Model Reference Stats
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Model Height</label>
                    <input
                      type="text"
                      placeholder="e.g. 5'9&quot; / 175 cm"
                      value={formData.modelStats.height}
                      onChange={(e) => handleNestedChange('modelStats', 'height', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Size Worn in Photos</label>
                    <input
                      type="text"
                      placeholder="e.g. Small (S) for relaxed fit"
                      value={formData.modelStats.sizeWorn}
                      onChange={(e) => handleNestedChange('modelStats', 'sizeWorn', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STYLING TIPS */}
          {activeTab === 'styling' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                  Editorial Styling Suggestions
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Wear buttoned-up as a stand-alone knit top with high-waisted linen trousers"
                    value={newTip}
                    onChange={(e) => setNewTip(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addStylingTip();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={addStylingTip}
                    className="flex items-center gap-1.5 bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-neutral-800 transition"
                  >
                    <Plus size={16} /> Add Tip
                  </button>
                </div>
              </div>

              {formData.stylingTips.length > 0 ? (
                <div className="space-y-2">
                  {formData.stylingTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-sm text-neutral-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{tip}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStylingTip(idx)}
                        className="text-neutral-400 hover:text-red-600 transition p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-400 text-xs italic border border-dashed border-neutral-200 rounded-lg">
                  No styling suggestions added yet. Give customers ideas on how to wear this cardigan.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: VARIANTS & STOCK */}
          {activeTab === 'variants' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
                  Add Size & Color Combination *
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    name="size"
                    placeholder="Size (e.g. M / L / XL)"
                    value={newVariant.size}
                    onChange={handleVariantChange}
                    className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
                  />
                  <input
                    type="text"
                    name="color"
                    placeholder="Color (e.g. Oatmeal Heather)"
                    value={newVariant.color}
                    onChange={handleVariantChange}
                    className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
                  />
                  <input
                    type="number"
                    name="stock"
                    placeholder="Stock Qty"
                    value={newVariant.stock}
                    onChange={handleVariantChange}
                    min="0"
                    className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center justify-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
                  >
                    <Plus size={16} /> Add Variant
                  </button>
                </div>
              </div>

              {formData.variants.length > 0 ? (
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-white hover:bg-neutral-50/50 transition"
                    >
                      <div className="flex items-center gap-6 text-sm">
                        <span className="font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded">
                          {v.size}
                        </span>
                        <span className="text-neutral-700">Color: {v.color}</span>
                        <span className="text-neutral-500 text-xs">
                          In Stock: <strong className="text-neutral-900">{v.stock}</strong> units
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-neutral-400 hover:text-red-600 p-1.5 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-400 text-xs italic border border-dashed border-neutral-200 rounded-lg">
                  At least one variant (Size & Color) is required.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MEDIA & VIDEO */}
          {activeTab === 'media' && (
            <div className="space-y-8 animate-fadeIn">
              {/* 1. Main Gallery Images */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2 flex items-center gap-2">
                  <Image size={16} className="text-primary" />
                  Product Gallery Images
                </h4>
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-neutral-400 transition bg-neutral-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-gallery-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="image-gallery-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload size={32} className="text-neutral-400 mb-2" />
                    <span className="text-sm font-medium text-neutral-700">
                      {uploading ? 'Processing files...' : 'Select Main Product Gallery Images'}
                    </span>
                    <span className="text-xs text-neutral-400 mt-1">PNG, JPG, WEBP (Supports multiple selection)</span>
                  </label>
                </div>

                {/* Previews of newly selected images */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-neutral-600 mb-2">New Images to Upload:</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-neutral-200">
                          <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full transition"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Gallery Images */}
                {product?.images?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-neutral-500 mb-2">Current Cloudinary Images:</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {product.images.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                          <img src={img.url} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Secondary / Hover Image */}
              <div className="border-t border-neutral-200 pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                      <Layers size={16} className="text-primary" />
                      PLP Interactive Hover Image
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Displayed when a customer hovers over the product card on the shop page (e.g. back of the garment, texture close-up, or movement shot).
                    </p>
                  </div>
                  {hoverImagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewHoverImage(null);
                        setHoverImagePreview(null);
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Clear Hover Image
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-6 mt-3">
                  {hoverImagePreview && (
                    <div className="w-24 h-32 rounded-lg border border-neutral-200 overflow-hidden shrink-0 bg-neutral-100 shadow-sm">
                      <img src={hoverImagePreview} alt="Hover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="hover-image-upload"
                      onChange={handleHoverImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="hover-image-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer transition"
                    >
                      <Upload size={14} />
                      {hoverImagePreview ? 'Replace Hover Image' : 'Choose Hover Image'}
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. Draping & Motion Video */}
              <div className="border-t border-neutral-200 pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                      <Video size={16} className="text-primary" />
                      Garment Movement Video (PDP Player)
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Short 5–15 second clip showing how the cardigan moves, stretches, and drapes on the body. Hosted via Cloudinary.
                    </p>
                  </div>
                  {videoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewVideo(null);
                        setVideoPreview(null);
                        setVideoFileName('');
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Clear Video
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4 mt-3">
                  {videoPreview && (
                    <div className="w-48 h-32 rounded-lg border border-neutral-200 overflow-hidden bg-black shrink-0">
                      <video src={videoPreview} controls className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      id="video-upload"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="video-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer transition"
                    >
                      <Video size={14} />
                      {videoPreview ? 'Replace Video (.mp4 / .webm)' : 'Select Video (.mp4 / .webm, max 25MB)'}
                    </label>
                    {videoFileName && (
                      <p className="text-xs text-neutral-600">Selected file: {videoFileName}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer inside scrollable */}
          <div className="pt-6 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-xs text-neutral-400">
              {activeTab !== 'media' && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1].id);
                    }
                  }}
                  className="flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  Next Section: {tabs[tabs.findIndex((t) => t.id === activeTab) + 1]?.label}
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>Saving Garment Data...</>
                ) : product ? (
                  'Update Product'
                ) : (
                  'Create Product'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
