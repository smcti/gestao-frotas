const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    plate: {
      type: String,
      required: [true, 'A placa é obrigatória'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    unit: { type: String, enum: ['km', 'horas'], default: 'km' },
    currentUsage: { type: Number, required: true, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
