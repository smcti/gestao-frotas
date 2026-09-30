const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },

    // Junta vários itens lançados de uma vez só (ex: óleo + engraxamento no mesmo lançamento)
    batchId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    // Quem lança óleo só cria tipo 'oleo', quem lança peça só cria tipo 'peca' (regra aplicada nas rotas)
    type: { type: String, enum: ['oleo', 'peca'], required: true },

    date: { type: Date, required: true, default: Date.now },

    // Km ou horas do veículo no momento da manutenção (conforme a unidade do veículo)
    usageAtMaintenance: { type: Number, required: [true, 'Informe o km/hora no momento da manutenção'] },

    description: { type: String, trim: true },

    // O que foi feito (ex: "Troca de óleo", "Pastilha de freio") — vem do catálogo ou é digitado novo
    itemName: { type: String, required: [true, 'Informe o item feito'], trim: true },

    // Próxima manutenção específica deste item (sobrescreve a regra padrão da frota quando informado)
    nextDueDate: { type: Date, default: null },
    nextDueUsage: { type: Number, default: null },

    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
