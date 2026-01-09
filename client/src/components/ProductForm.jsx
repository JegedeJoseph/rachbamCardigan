import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { productAPI, convertToBase64 } from '../services/api';

const ProductForm = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Cardigan',
    featured: false,
    variants: [],
  });

  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    stock: '',
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category || 'Cardigan',
        featured: product.featured || false,
        variants: product.variants || [],
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant({
      ...newVariant,
      [name]: value,
    });
  };

  const addVariant = () => {
    if (!newVariant.size || !newVariant.color || !newVariant.stock) {
      alert('Please fill all variant fields');
      return;
    }

    const stock = parseInt(newVariant.stock);
    if (isNaN(stock) || stock < 0) {
      alert('Stock must be a valid non-negative number');
      return;
    }

    setFormData({
      ...formData,
      variants: [...formData.variants, { ...newVariant, stock }],
    });

    setNewVariant({ size: '', color: '', stock: '' });
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const base64Images = await Promise.all(
        files.map((file) => convertToBase64(file))
      );
      setImages([...images, ...base64Images]);
    } catch (error) {
      console.error('Error converting images:', error);
      alert('Failed to process images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.variants.length === 0) {
      alert('Please add at least one variant');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      alert('Price must be a valid positive number');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        ...formData,
        price,
      };

      let savedProduct;
      if (product) {
        const response = await productAPI.update(product._id, productData);
        savedProduct = response.data.data;
      } else {
        const response = await productAPI.create(productData);
        savedProduct = response.data.data;
      }

      // Upload images if any
      if (images.length > 0) {
        await productAPI.uploadImages(savedProduct._id, images);
      }

      alert('Product saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="mt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
          </div>

          {/* Variant Management */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Variants *</h3>

            {/* Add Variant Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  name="size"
                  placeholder="Size (e.g., Large)"
                  value={newVariant.size}
                  onChange={handleVariantChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="text"
                  name="color"
                  placeholder="Color (e.g., Burgundy Wool)"
                  value={newVariant.color}
                  onChange={handleVariantChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  value={newVariant.stock}
                  onChange={handleVariantChange}
                  min="0"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>

            {/* Variants List */}
            {formData.variants.length > 0 && (
              <div className="space-y-2">
                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex gap-4">
                      <span className="font-medium">Size: {variant.size}</span>
                      <span className="text-gray-600">Color: {variant.color}</span>
                      <span className="text-gray-600">Stock: {variant.stock}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Images</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload size={48} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload images'}
                </span>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Existing Images */}
            {product?.images?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Existing Images:</p>
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

