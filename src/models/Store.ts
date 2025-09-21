import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStore extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  subdomain: string;
  customDomain?: string;
  whatsappNumber: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  currency: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'grid' | 'list';
  };
  storageUsed: number;
  storageLimit: number;
  productLimit: number;
  monthlyVisits: number;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  totalSales: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
  getPublicUrl(): string;
  canUploadFile(fileSize: number): boolean;
}

const storeSchema = new Schema<IStore>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please enter store name'],
    trim: true,
    maxlength: [50, 'Store name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logo: String,
  banner: String,
  subdomain: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens']
  },
  customDomain: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  whatsappNumber: {
    type: String,
    required: [true, 'Please enter WhatsApp number'],
    match: [/^[0-9]{10,15}$/, 'Please enter a valid WhatsApp number']
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String
  },
  currency: {
    type: String,
    default: 'IDR',
    enum: ['IDR', 'USD', 'EUR', 'MYR', 'SGD']
  },
  theme: {
    primaryColor: { type: String, default: '#007bff' },
    secondaryColor: { type: String, default: '#6c757d' },
    fontFamily: { type: String, default: 'Inter' },
    layout: { type: String, default: 'grid', enum: ['grid', 'list'] }
  },
  storageUsed: {
    type: Number,
    default: 0
  },
  storageLimit: {
    type: Number,
    default: 100 * 1024 * 1024
  },
  productLimit: {
    type: Number,
    default: 50
  },
  monthlyVisits: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

storeSchema.index({ subdomain: 1 });
storeSchema.index({ customDomain: 1 });
storeSchema.index({ owner: 1 });

storeSchema.methods.getPublicUrl = function() {
  if (this.customDomain) {
    return `https://${this.customDomain}`;
  }
  return `https://${this.subdomain}.${process.env.NEXT_PUBLIC_APP_DOMAIN || 'toko-digital.com'}`;
};

storeSchema.methods.canUploadFile = function(fileSize: number) {
  return (this.storageUsed + fileSize) <= this.storageLimit;
};

const Store: Model<IStore> = mongoose.models.Store || mongoose.model<IStore>('Store', storeSchema);

export default Store;