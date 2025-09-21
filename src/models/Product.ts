import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct extends Document {
  store: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  comparePrice?: number;
  cost: number;
  profit: number;
  profitMargin: number;
  sku?: string;
  barcode?: string;
  stock: number;
  trackInventory: boolean;
  lowStockAlert: number;
  weight?: {
    value: number;
    unit: 'g' | 'kg' | 'lb' | 'oz';
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'm' | 'in' | 'ft';
  };
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
    source: 'upload' | 'drive' | 'external';
  }>;
  videos: Array<{
    url: string;
    title?: string;
    source: 'youtube' | 'vimeo' | 'upload';
    thumbnail?: string;
  }>;
  tags: string[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    slug: string;
  };
  visibility: 'visible' | 'hidden' | 'scheduled';
  publishDate: Date;
  views: number;
  sold: number;
  rating: {
    average: number;
    count: number;
  };
  featured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isInStock(): boolean;
  reduceStock(quantity: number): boolean;
}

const productSchema = new Schema<IProduct>({
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Electronics', 'Fashion', 'Food & Beverages', 'Health & Beauty',
      'Home & Living', 'Books & Stationery', 'Sports & Outdoors',
      'Toys & Games', 'Automotive', 'Services', 'Digital Products', 'Other'
    ]
  },
  subCategory: String,
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  profitMargin: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    sparse: true
  },
  barcode: {
    type: String,
    sparse: true
  },
  stock: {
    type: Number,
    required: [true, 'Please enter stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  trackInventory: {
    type: Boolean,
    default: true
  },
  lowStockAlert: {
    type: Number,
    default: 5
  },
  weight: {
    value: { type: Number, min: 0 },
    unit: { type: String, enum: ['g', 'kg', 'lb', 'oz'], default: 'kg' }
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: { type: String, enum: ['cm', 'm', 'in', 'ft'], default: 'cm' }
  },
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false },
    source: { type: String, enum: ['upload', 'drive', 'external'], default: 'upload' }
  }],
  videos: [{
    url: { type: String, required: true },
    title: String,
    source: { type: String, enum: ['youtube', 'vimeo', 'upload'], default: 'youtube' },
    thumbnail: String
  }],
  tags: [String],
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      lowercase: true
    }
  },
  visibility: {
    type: String,
    enum: ['visible', 'hidden', 'scheduled'],
    default: 'visible'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, default: 0 }
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.index({ store: 1, isActive: 1 });
productSchema.index({ category: 1 });
productSchema.index({ 'seo.slug': 1 });
productSchema.index({ name: 'text', description: 'text' });

productSchema.pre('save', function(next) {
  if (this.price && this.cost) {
    this.profit = this.price - this.cost;
    this.profitMargin = this.price > 0 ? ((this.price - this.cost) / this.price) * 100 : 0;
  }

  if (!this.seo?.slug && this.name) {
    this.seo = this.seo || {};
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  next();
});

productSchema.methods.isInStock = function() {
  if (!this.trackInventory) return true;
  return this.stock > 0;
};

productSchema.methods.reduceStock = function(quantity: number) {
  if (!this.trackInventory) return true;

  if (this.stock < quantity) {
    return false;
  }

  this.stock -= quantity;
  this.sold += quantity;
  return true;
};

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;