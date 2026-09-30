const express = require('express');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const ServiceType = require('../models/ServiceType');
const { requireAuth, requireRole } = require('../middleware/auth');
const { buildMaintenanceSummary } = require('../utils/maintenance');

const router = express.Router();

router.use(requireAuth);

async function summaryFor(vehicle) {
  const records = await MaintenanceRecord.find({ vehicle: vehicle._id });
  const summary = buildMaintenanceSummary(vehicle, records);
  return { ...vehicle.toObject(), ...summary };
}

// Lista todos os veículos com o resumo de manutenção (usado na tela de Veículos)
router.get('/', async (req, res) => {
  const vehicles = await Vehicle.find().sort({ plate: 1 });
  const withSummary = await Promise.all(vehicles.map(summaryFor));
  res.json(withSummary);
});

// Veículos com algum item em atenção/vencido, ordenados por urgência (usado no Dashboard)
router.get('/alertas', async (req, res) => {
  const vehicles = await Vehicle.find();
  const withSummary = await Promise.all(vehicles.map(summaryFor));
  const alertas = withSummary
    .filter((v) => v.overallStatus === 'atencao' || v.overallStatus === 'vencido')
    .sort((a, b) => a.items[0].daysRemaining - b.items[0].daysRemaining);
  res.json(alertas);
});

// Cadastra um novo veículo (qualquer usuário autorizado pode cadastrar)
router.post('/', async (req, res) => {
  try {
    const { plate, unit, currentUsage } = req.body;
    const vehicle = await Vehicle.create({
      plate,
      unit,
      currentUsage: Number(currentUsage) || 0,
      createdBy: req.user.id,
    });
    res.status(201).json(await summaryFor(vehicle));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Já existe um veículo cadastrado com essa placa' });
    }
    res.status(400).json({ message: err.message });
  }
});

// Edita placa/unidade do veículo
router.put('/:id', async (req, res) => {
  try {
    const { plate, unit } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { plate, unit },
      { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Veículo não encontrado' });
    res.json(await summaryFor(vehicle));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove um veículo e seu histórico (só o admin, pra evitar exclusão sem querer)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Veículo não encontrado' });
  await MaintenanceRecord.deleteMany({ vehicle: vehicle._id });
  res.json({ message: 'Veículo removido com sucesso' });
});

// Detalhe de um veículo (resumo de manutenção)
router.get('/:id', async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Veículo não encontrado' });
  res.json(await summaryFor(vehicle));
});

// Atualiza só o km/hora atual do veículo (sem lançar manutenção) — mantém os avisos em dia
router.put('/:id/km', async (req, res) => {
  try {
    const { currentUsage } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { currentUsage: Number(currentUsage) },
      { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Veículo não encontrado' });
    res.json(await summaryFor(vehicle));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Histórico completo de manutenções do veículo (todo mundo pode ver, óleo e peça juntos)
router.get('/:id/manutencoes', async (req, res) => {
  const records = await MaintenanceRecord.find({ vehicle: req.params.id })
    .populate('registeredBy', 'name')
    .sort({ date: -1 });
  res.json(records);
});

// Lança uma manutenção com um ou mais itens de uma vez (ex: óleo + engraxamento juntos).
// Óleo só lança tipo óleo, peça só lança tipo peça. Admin lança os dois.
router.post('/:id/manutencoes', requireRole('oleo', 'peca', 'admin'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Veículo não encontrado' });

    const { type, usageAtMaintenance, description, items } = req.body;

    if (req.user.role !== 'admin' && type !== req.user.role) {
      return res.status(403).json({ message: 'Você só pode lançar manutenções do seu tipo' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Selecione ou digite pelo menos um item' });
    }

    const batchId = new mongoose.Types.ObjectId();
    const created = [];

    for (const item of items) {
      const name = (item.name || '').trim();
      if (!name) continue;

      const record = await MaintenanceRecord.create({
        vehicle: vehicle._id,
        batchId,
        type,
        usageAtMaintenance: Number(usageAtMaintenance),
        description,
        itemName: name,
        nextDueDate: item.nextDueDate || null,
        nextDueUsage: item.nextDueUsage ? Number(item.nextDueUsage) : null,
        registeredBy: req.user.id,
      });
      created.push(record);

      // Guarda o nome no catálogo pra aparecer pronto da próxima vez (não duplica se já existir)
      await ServiceType.findOneAndUpdate(
        { type, name },
        { type, name, createdBy: req.user.id },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }

    // O km/hora informado no lançamento é a leitura mais atual do veículo
    vehicle.currentUsage = Number(usageAtMaintenance);
    await vehicle.save();

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
