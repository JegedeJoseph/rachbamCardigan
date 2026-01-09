import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { shippingAPI } from '../services/api';
import { NIGERIA_STATES, formatCurrency } from '../utils/nigeriaStates';

const ShippingRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    state: '',
    rate: '',
    estimatedDays: '3-5 business days',
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await shippingAPI.getAll();
      setRates(response.data.data);
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const rate = parseFloat(formData.rate);
    if (isNaN(rate) || rate < 0) {
      alert('Rate must be a valid non-negative number');
      return;
    }

    try {
      const data = {
        ...formData,
        rate,
      };

      if (editingRate) {
        await shippingAPI.update(editingRate._id, data);
      } else {
        await shippingAPI.createOrUpdate(data);
      }

      setShowForm(false);
      setEditingRate(null);
      setFormData({ state: '', rate: '', estimatedDays: '3-5 business days' });
      fetchRates();
    } catch (error) {
      console.error('Error saving shipping rate:', error);
      alert(error.response?.data?.message || 'Failed to save shipping rate');
    }
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      state: rate.state,
      rate: rate.rate,
      estimatedDays: rate.estimatedDays,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipping rate?')) return;

    try {
      await shippingAPI.delete(id);
      setRates(rates.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Error deleting shipping rate:', error);
      alert('Failed to delete shipping rate');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRate(null);
    setFormData({ state: '', rate: '', estimatedDays: '3-5 business days' });
  };

  if (loading) {
    return <div className="text-center py-8">Loading shipping rates...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Shipping Rates</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          <Plus size={20} />
          Add Shipping Rate
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingRate ? 'Edit Shipping Rate' : 'Add New Shipping Rate'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                disabled={!!editingRate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select State</option>
                {NIGERIA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate (₦) *
              </label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Delivery
              </label>
              <input
                type="text"
                name="estimatedDays"
                value={formData.estimatedDays}
                onChange={handleInputChange}
                placeholder="e.g., 3-5 business days"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
              >
                <Save size={16} />
                {editingRate ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shipping Rates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">State</th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">Rate</th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">Estimated Delivery</th>
              <th className="text-right py-3 px-6 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No shipping rates configured yet
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <tr key={rate._id} className="border-t hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium">{rate.state}</td>
                  <td className="py-4 px-6">{formatCurrency(rate.rate)}</td>
                  <td className="py-4 px-6 text-gray-600">{rate.estimatedDays}</td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(rate)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(rate._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShippingRates;

