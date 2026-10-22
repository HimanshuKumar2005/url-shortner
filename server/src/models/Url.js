import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
  {
    numericId: { type: Number, required: true, unique: true, index: true },
    shortKey: { type: String, required: true, unique: true, index: true, minlength: 7, maxlength: 7 },
    longUrl: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true, maxlength: 80, default: 'label1' },
    clicks: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    maxClicks: { type: Number, min: 1, default: null },
    disabled: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Url = mongoose.model('Url', urlSchema);
