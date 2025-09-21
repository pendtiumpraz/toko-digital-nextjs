import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'store_owner' | 'customer';
  store?: mongoose.Types.ObjectId;
  subscription?: mongoose.Types.ObjectId;
  trialStartDate: Date;
  trialEndDate: Date;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  isTrialExpired(): boolean;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: true,
    match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['admin', 'store_owner', 'customer'],
    default: 'store_owner'
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  trialStartDate: {
    type: Date,
    default: Date.now
  },
  trialEndDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isTrialExpired = function() {
  return Date.now() > this.trialEndDate.getTime();
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;