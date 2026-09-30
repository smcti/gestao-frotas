const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['oleo', 'peca'], required: true },
    name: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

serviceTypeSchema.index({ type: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('ServiceType', serviceTypeSchema);
