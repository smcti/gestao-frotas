const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    role: { type: String, enum: ['oleo', 'peca', 'admin'], required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
