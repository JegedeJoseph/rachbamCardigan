import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  variants: [variantSchema],
  category: {
    type: String,
    default: 'Cardigan'
  },
  featured: {
    type: Boolean,
    default: false
  },
  totalStock: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total stock from variants
productSchema.pre('save', function(next) {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((sum, variant) => sum + variant.stock, 0);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;

