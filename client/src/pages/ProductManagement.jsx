import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { productAPI } from '../services/api';
import { formatCurrency } from '../utils/nigeriaStates';
import ProductForm from '../components/ProductForm';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(id);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Product Image */}
            <div className="h-48 bg-gray-200">
              {product.images?.[0] ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <p className="text-xl font-bold text-primary mb-3">
                {formatCurrency(product.price)}
              </p>

              {/* Variants */}
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-1">Variants:</p>
                <div className="flex flex-wrap gap-1">
                  {product.variants?.slice(0, 3).map((variant, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {variant.size} - {variant.color} ({variant.stock})
                    </span>
                  ))}
                  {product.variants?.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{product.variants.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Total Stock: <span className="font-semibold">{product.totalStock}</span>
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default ProductManagement;

