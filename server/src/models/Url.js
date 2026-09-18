import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
  {
    numericId: { type: Number, required: true, unique: true, index: true },
    shortKey: { type: String, required: true, unique: true, index: true, minlength: 7, maxlength: 7 },
    longUrl: { type: String, required: true, trim: true },
    clicks: { type: Number, default: 0, min: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Url = mongoose.model('Url', urlSchema);
