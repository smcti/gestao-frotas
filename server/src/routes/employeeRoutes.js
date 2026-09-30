const express = require('express');
const Employee = require('../models/Employee');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

// Lista todos os funcionários cadastrados
router.get('/', async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  res.json(employees);
});

// Cadastra um novo funcionário (email + papel)
router.post('/', async (req, res) => {
  try {
    const { email, role } = req.body;
    const employee = await Employee.create({
      email: email.toLowerCase().trim(),
      role,
      addedBy: req.user.id,
    });
    res.status(201).json(employee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Esse e-mail já está cadastrado' });
    }
    res.status(400).json({ message: err.message });
  }
});

// Muda o papel de um funcionário
router.put('/:id', async (req, res) => {
  const { role } = req.body;
  const employee = await Employee.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!employee) return res.status(404).json({ message: 'Funcionário não encontrado' });
  res.json(employee);
});

// Remove o acesso de um funcionário
router.delete('/:id', async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Funcionário não encontrado' });
  res.json({ message: 'Acesso removido' });
});

module.exports = router;
