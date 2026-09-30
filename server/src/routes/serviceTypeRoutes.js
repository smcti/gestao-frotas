const express = require('express');
const ServiceType = require('../models/ServiceType');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Lista os itens já usados de um tipo (óleo ou peça), pra virar checkbox na tela de lançar
router.get('/', async (req, res) => {
  const { type } = req.query;
  if (!['oleo', 'peca'].includes(type)) {
    return res.status(400).json({ message: 'Informe type=oleo ou type=peca' });
  }
  const items = await ServiceType.find({ type }).sort({ name: 1 });
  res.json(items);
});

module.exports = router;
