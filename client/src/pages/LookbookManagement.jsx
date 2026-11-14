import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Image, Tag, X, Sparkles, Wand2, 
  Layers, CheckCircle2, AlertCircle, Copy, Check, ChevronDown,
  Star, Upload, MoveLeft, MoveRight
} from 'lucide-react';
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

  // Multiple images state (supports base64, objects, or remote URLs)
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  // AI Assistant States
  const [selectedProductForAi, setSelectedProductForAi] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('1 Cardigan Styled 3 Ways');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [polishingIndex, setPolishingIndex] = useState(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

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
    setImages([]);
    setSelectedProductForAi('');
    setAiSuccessMessage('');
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

    // Populate images array: check lb.images first, fallback to lb.imageUrl
    if (lb.images && Array.isArray(lb.images) && lb.images.length > 0) {
      setImages(lb.images.map((img) => (typeof img === 'string' ? img : img.url)));
    } else if (lb.imageUrl) {
      setImages([lb.imageUrl]);
    } else {
      setImages([]);
    }

    setSelectedProductForAi('');
    setAiSuccessMessage('');
    setShowForm(true);
  };

  // Multiple image upload handler
  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const base64List = await Promise.all(files.map((file) => convertToBase64(file)));
      setImages((prev) => [...prev, ...base64List]);
      setAiSuccessMessage(`✨ Added ${files.length} photo(s) to story gallery!`);
    } catch (err) {
      console.error('Image process error:', err);
      alert('Failed to process one or more images.');
    }
  };

  const removePhoto = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setAsCoverPhoto = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [target] = copy.splice(index, 1);
      return [target, ...copy];
    });
  };

  const handlePolishPhoto = async (index) => {
    setPolishingIndex(index);
    try {
      const res = await productAPI.aiEnhanceImage(images[index]);
      if (res.data.data?.url) {
        setImages((prev) => {
          const copy = [...prev];
          copy[index] = res.data.data.url;
          return copy;
        });
        setAiSuccessMessage('✨ Photo lighting and contrast polished successfully!');
      }
    } catch (err) {
      console.error('Image polish error:', err);
      alert('Failed to polish photo.');
    } finally {
      setPolishingIndex(null);
    }
  };

  const handleUseAllProductImages = (prod) => {
    if (prod?.images?.length) {
      const prodUrls = prod.images.map((img) => img.url).filter(Boolean);
      setImages((prev) => {
        // avoid duplicating existing urls
        const existing = new Set(prev);
        const newOnes = prodUrls.filter((u) => !existing.has(u));
        return [...prev, ...newOnes];
      });
      setAiSuccessMessage(`✨ Imported ${prod.images.length} photos from "${prod.name}"!`);
    }
  };

  // Auto-generate story using Gemini / Smart Heuristic
  const handleAutoGenerateStory = async () => {
    setIsGeneratingStory(true);
    setAiSuccessMessage('');

    try {
      const selectedProd = products.find((p) => p._id === selectedProductForAi);
      const prodName = selectedProd ? selectedProd.name : '';
      const prodCategory = selectedProd ? (selectedProd.category || 'Cardigan') : 'Cardigan';
      const prodGauge = selectedProd ? (selectedProd.knitGauge || '') : '';

      const sampleImg = images[0] || (selectedProd?.images?.[0]?.url) || '';

      const res = await lookbookAPI.aiSuggestStory({
        productName: prodName,
        category: prodCategory,
        knitGauge: prodGauge,
        occasion: selectedOccasion,
        imageBase64: sampleImg.startsWith('data:image') ? sampleImg : undefined,
      });

      const story = res.data.data;
      if (story) {
        setFormData((prev) => {
          const updatedTagged = selectedProductForAi && !prev.taggedProducts.includes(selectedProductForAi)
            ? [...prev.taggedProducts, selectedProductForAi]
            : prev.taggedProducts;

          return {
            ...prev,
            title: story.title || prev.title,
            description: story.description || prev.description,
            stylingTips: (story.stylingTips && story.stylingTips.length > 0) ? story.stylingTips : prev.stylingTips,
            taggedProducts: updatedTagged,
          };
        });

        // Automatically populate photos from product if none uploaded yet
        if (images.length === 0 && selectedProd?.images?.length) {
          const prodUrls = selectedProd.images.map((img) => img.url).filter(Boolean);
          setImages(prodUrls);
        }

        setAiSuccessMessage(
          story.source === 'gemini'
            ? '✨ Story, mood, and outfit breakdowns generated using Gemini AI!'
            : '✨ Editorial story & outfit combinations generated! Review and personalize below.'
        );
      }
    } catch (err) {
      console.error('AI story error:', err);
      alert('Could not auto-generate story: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const toggleProduct = (id) => {
    setFormData((prev) => ({
      ...prev,
      taggedProducts: prev.taggedProducts.includes(id)
        ? prev.taggedProducts.filter((p) => p !== id)
        : [...prev.taggedProducts, id],
    }));
  };

  const updateTip = (index, value) => {
    setFormData((prev) => {
      const tips = [...prev.stylingTips];
      tips[index] = value;
      return { ...prev, stylingTips: tips };
    });
  };

  const addTip = () => setFormData((prev) => ({ ...prev, stylingTips: [...prev.stylingTips, ''] }));
  const removeTip = (index) => setFormData((prev) => ({ ...prev, stylingTips: prev.stylingTips.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Please add at least one photo for this lookbook story.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        stylingTips: formData.stylingTips.filter((t) => t.trim()),
        images: images,
        imageUrl: images[0] || '',
      };

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
      setLookbooks((prev) => prev.filter((lb) => lb._id !== id));
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const getSuggestedAiPrompt = () => {
    const selectedProd = products.find((p) => p._id === selectedProductForAi);
    const name = selectedProd ? selectedProd.name : 'hand-knitted artisanal cardigan';
    return `Editorial fashion photography, an elegant Nigerian model wearing a ${name}, styled in a sun-drenched minimalist living room with warm wooden textures, soft cinematic lighting, 8k resolution, Vogue editorial aesthetic`;
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(getSuggestedAiPrompt());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  if (loading) return <div className="text-center py-8 text-neutral-500">Loading lookbooks...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Artisanal Storytelling</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Lookbook Management</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create high-fashion multi-photo editorial stories showing customers how to style cardigans in real life.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition text-sm font-semibold shadow-sm"
        >
          <Plus size={18} /> New Editorial Story
        </button>
      </div>

      {/* Lookbook Grid */}
      {lookbooks.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
          <div className="text-4xl mb-3">📸</div>
          <h3 className="text-lg font-bold text-neutral-800 mb-1">No lookbook stories published yet</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
            Inspire shoppers with styled outfit stories, Harmattan warmth capsules, and &quot;1 Cardigan 3 Ways&quot; editorial guides.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition text-sm font-semibold shadow-sm"
          >
            <Plus size={16} /> Create First Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lookbooks.map((lb) => {
            const photoCount = lb.images?.length || (lb.imageUrl ? 1 : 0);
            return (
              <div key={lb._id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition">
                <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                  {lb.imageUrl ? (
                    <img
                      src={lb.imageUrl}
                      alt={lb.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={36} className="text-neutral-300" />
                    </div>
                  )}
                  {photoCount > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 shadow-sm">
                      <Layers size={12} />
                      <span>{photoCount} Photos</span>
                    </div>
                  )}
                  {lb.stylingTips?.length > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-medium">
                      {lb.stylingTips.length} Styling Looks
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900 text-base">{lb.title}</h3>
                  {lb.description && (
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                      {lb.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
                    <Tag size={13} className="text-primary" />
                    <span>{lb.taggedProducts?.length || 0} products tagged</span>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-100">
                    <button
                      onClick={() => openEdit(lb)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:border-primary hover:text-primary transition"
                    >
                      <Edit size={14} /> Edit Story
                    </button>
                    <button
                      onClick={() => handleDelete(lb._id)}
                      className="flex items-center justify-center py-2 px-3 border border-red-200 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                      title="Delete story"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl border border-neutral-100 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Lookbook Studio CMS</span>
                <h2 className="text-lg font-bold text-neutral-900">
                  {editingLookbook ? 'Edit Multi-Photo Editorial Story' : 'Create New Multi-Photo Editorial Story'}
                </h2>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* ✨ AI STORY AUTO-GENERATOR BANNER */}
              <div className="bg-gradient-to-r from-amber-50 via-rose-50/40 to-amber-50/50 p-4 rounded-xl border border-amber-200/70 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center">
                    <Sparkles size={14} />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Auto-Generate Story with AI (From Any Cardigan)
                  </h4>
                </div>
                <p className="text-xs text-neutral-600">
                  Select a cardigan and occasion to instantly generate a magazine headline, tactile narrative story, and 3 distinct outfit combinations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Choose Cardigan / Sweater:
                    </label>
                    <select
                      value={selectedProductForAi}
                      onChange={(e) => setSelectedProductForAi(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select a cardigan from catalog...</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} {p.knitGauge ? `(${p.knitGauge})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Styling Mood / Occasion:
                    </label>
                    <select
                      value={selectedOccasion}
                      onChange={(e) => setSelectedOccasion(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="1 Cardigan Styled 3 Ways">1 Cardigan Styled 3 Ways (Versatility)</option>
                      <option value="Harmattan Chill & Heavy Knit Warmth">Harmattan Chill & Heavy Knit Warmth</option>
                      <option value="Executive Office AC Layering">Executive Office AC Layering</option>
                      <option value="Sunday Brunch & Easy Weekend">Sunday Brunch & Easy Weekend</option>
                      <option value="Evening Silk Slip Dress Layer">Evening Silk Slip Dress Layer</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex gap-2">
                    {selectedProductForAi && (
                      <button
                        type="button"
                        onClick={() => {
                          const prod = products.find((p) => p._id === selectedProductForAi);
                          handleUseAllProductImages(prod);
                        }}
                        className="text-[11px] font-medium text-neutral-700 hover:text-primary underline flex items-center gap-1"
                      >
                        <Layers size={12} /> Import all photos from this cardigan
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoGenerateStory}
                    disabled={isGeneratingStory}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    {isGeneratingStory ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Crafting Story...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={13} className="text-amber-300" />
                        <span>✨ Generate Lookbook Story</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Notification Banner */}
              {aiSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{aiSuccessMessage}</span>
                  </div>
                  <button onClick={() => setAiSuccessMessage('')} className="text-emerald-600 hover:text-emerald-900">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Form Content */}
              <form id="lookbook-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* MULTI-PHOTO GALLERY UPLOAD */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                        Story Editorial Photos ({images.length}) *
                      </label>
                      <p className="text-[11px] text-neutral-400">
                        Upload multiple photos (front, back, outfit styling variations, and detail close-ups). First photo is the Cover.
                      </p>
                    </div>
                  </div>

                  {/* Upload Box */}
                  <div
                    className="border-2 border-dashed border-neutral-300 rounded-xl p-5 text-center cursor-pointer hover:border-primary transition bg-neutral-50/50"
                    onClick={() => document.getElementById('lb-multi-images-input').click()}
                  >
                    <Upload size={28} className="mx-auto text-neutral-400 mb-1.5" />
                    <p className="text-xs font-semibold text-neutral-700">
                      Click to Select Multiple Editorial Photos
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Supports JPG, PNG, WEBP. You can upload several images at once.
                    </p>
                    <input
                      id="lb-multi-images-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImagesUpload}
                    />
                  </div>

                  {/* Multi-photo Thumbnail Grid */}
                  {images.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                          Photos in this Story:
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          Click &quot;Make Cover&quot; to set the primary card image
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            className={`relative group aspect-[3/4] rounded-xl overflow-hidden border-2 bg-neutral-100 flex flex-col shadow-sm transition ${
                              idx === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-neutral-200'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Lookbook photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Badge */}
                            {idx === 0 ? (
                              <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 z-10">
                                <Star size={10} fill="white" />
                                <span>Cover Photo</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAsCoverPhoto(idx)}
                                className="absolute top-2 left-2 bg-black/70 hover:bg-neutral-900 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition z-10"
                                title="Set as primary story cover"
                              >
                                Set Cover
                              </button>
                            )}

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full transition z-10"
                              title="Remove photo"
                            >
                              <X size={12} />
                            </button>

                            {/* AI Polish button on bottom overlay */}
                            <button
                              type="button"
                              onClick={() => handlePolishPhoto(idx)}
                              disabled={polishingIndex === idx}
                              className="absolute bottom-2 left-2 right-2 bg-neutral-900/80 hover:bg-neutral-900 text-white text-[10px] font-semibold py-1 rounded flex items-center justify-center gap-1 backdrop-blur-sm transition"
                              title="AI balances lighting and contrast"
                            >
                              {polishingIndex === idx ? (
                                <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Wand2 size={10} className="text-amber-300" />
                              )}
                              <span>{polishingIndex === idx ? 'Polishing...' : '✨ Polish'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Story Headline / Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Harmattan Sanctuary: Heavyweight Warmth Styled 3 Ways"
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Editorial Narrative / Atmosphere
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Set the mood: Describe the weather, occasion, and tactile experience of this knitwear piece..."
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>

                {/* Styling Tips / Outfit Breakdown */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                      Outfit Transformations &amp; Styling Looks
                    </label>
                    <span className="text-[11px] text-neutral-400">Shows customers how to wear it</span>
                  </div>

                  <div className="space-y-2">
                    {formData.stylingTips.map((tip, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-2">
                          {i + 1}
                        </span>
                        <input
                          type="text"
                          value={tip}
                          onChange={(e) => updateTip(i, e.target.value)}
                          placeholder={`Look ${i + 1}: e.g. The Off-Shoulder Slip: Undo top two buttons over a satin slip dress...`}
                          className="flex-1 px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs"
                        />
                        {formData.stylingTips.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTip(i)}
                            className="text-neutral-400 hover:text-red-600 transition p-1.5 mt-1"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTip}
                      className="text-primary text-xs font-semibold hover:underline flex items-center gap-1 mt-2"
                    >
                      <Plus size={14} /> Add another styled outfit look
                    </button>
                  </div>
                </div>

                {/* Tagged Products */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                      Tag Products in this Look (&quot;Shop the Look&quot; Modal)
                    </label>
                    <span className="text-[11px] text-neutral-500">
                      {formData.taggedProducts.length} selected
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-xl p-2 space-y-1 bg-neutral-50/50">
                    {products.map((p) => (
                      <label
                        key={p._id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                          formData.taggedProducts.includes(p._id)
                            ? 'bg-amber-50/80 border border-amber-200'
                            : 'hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.taggedProducts.includes(p._id)}
                          onChange={() => toggleProduct(p._id)}
                          className="w-4 h-4 text-primary focus:ring-primary rounded"
                        />
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0].url}
                              alt=""
                              className="w-8 h-8 object-cover rounded-md flex-shrink-0 border border-neutral-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-neutral-200 flex items-center justify-center shrink-0">
                              <Image size={14} className="text-neutral-400" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-neutral-800 truncate">{p.name}</span>
                            <span className="text-[11px] text-neutral-500">
                              {p.knitGauge || p.category}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                    {products.length === 0 && (
                      <p className="text-xs text-neutral-400 text-center py-4">No products found in catalog.</p>
                    )}
                  </div>
                </div>

                {/* Generative Visual Prompt Helper */}
                <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-600" />
                      Google Imagen / Veo Prompt Generator
                    </span>
                    <button
                      type="button"
                      onClick={copyPromptToClipboard}
                      className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                    >
                      {copiedPrompt ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy Prompt'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed font-mono bg-white p-2 rounded border border-neutral-200">
                    &quot;{getSuggestedAiPrompt()}&quot;
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    Paste this into Google ImageFX or Google Veo to generate luxury lifestyle photos and 5-second movement video clips!
                  </p>
                </div>
              </form>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/70 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="lookbook-form"
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition disabled:opacity-60 shadow-sm"
              >
                {saving ? 'Publishing Story...' : editingLookbook ? 'Save Changes' : 'Publish Lookbook Story'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LookbookManagement;
