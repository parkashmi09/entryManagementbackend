import mongoose, { Schema } from 'mongoose';
import { IEntry } from '../types';

const entrySchema = new Schema<IEntry>({
  srNo: {
    type: String,
    required: [true, 'Serial number is required'],
    trim: true,
    maxlength: [20, 'Serial number cannot be more than 20 characters'],
  },
  vehicleNo: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true,
    uppercase: true,
    maxlength: [20, 'Vehicle number cannot be more than 20 characters'],
  },
  nameDetails: {
    type: String,
    required: [true, 'Name details is required'],
    trim: true,
    maxlength: [100, 'Name details cannot be more than 100 characters'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  netWeight: {
    type: String,
    trim: true,
    maxlength: [20, 'Net weight cannot be more than 20 characters'],
  },
  moisture: {
    type: String,
    trim: true,
    maxlength: [20, 'Moisture cannot be more than 20 characters'],
  },
  gatePassNo: {
    type: String,
    trim: true,
    maxlength: [30, 'Gate pass number cannot be more than 30 characters'],
  },
  mobileNo: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Mobile number must be 10 digits'],
  },
  unload: {
    type: String,
    trim: true,
    maxlength: [50, 'Unload cannot be more than 50 characters'],
  },
  shortage: {
    type: String,
    trim: true,
    maxlength: [50, 'Shortage cannot be more than 50 characters'],
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [200, 'Remarks cannot be more than 200 characters'],
  },
  rate: {
    type: String,
    trim: true,
    maxlength: [20, 'Rate cannot be more than 20 characters'],
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.userId; // Don't expose userId in API responses
      // Format date to match React Native app expectations
      if (ret.date) {
        ret.date = ret.date.toISOString().split('T')[0];
      }
      if (ret.createdAt) {
        ret.createdAt = ret.createdAt.toISOString();
      }
      return ret;
    },
  },
});

// Indexes for better query performance
entrySchema.index({ userId: 1, createdAt: -1 });
entrySchema.index({ srNo: 1, userId: 1 }, { unique: true }); // Unique srNo per user
entrySchema.index({ vehicleNo: 1, userId: 1 });
entrySchema.index({ date: 1, userId: 1 });
entrySchema.index({ nameDetails: 'text', vehicleNo: 'text', remarks: 'text' }); // Text search

// Compound index for efficient pagination and sorting
entrySchema.index({ userId: 1, date: -1, createdAt: -1 });

// Static method to check if srNo exists for a user
entrySchema.statics.checkSrNoExists = function(srNo: string, userId: string, excludeId?: string) {
  const query: any = { srNo, userId };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return this.findOne(query);
};

// Static method for text search
entrySchema.statics.searchEntries = function(userId: string, searchTerm: string, options: any = {}) {
  const searchQuery = {
    userId,
    $or: [
      { srNo: { $regex: searchTerm, $options: 'i' } },
      { vehicleNo: { $regex: searchTerm, $options: 'i' } },
      { nameDetails: { $regex: searchTerm, $options: 'i' } },
      { gatePassNo: { $regex: searchTerm, $options: 'i' } },
      { remarks: { $regex: searchTerm, $options: 'i' } },
    ],
  };

  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  return this.find(searchQuery)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const Entry = mongoose.model<IEntry>('Entry', entrySchema);
export default Entry; 