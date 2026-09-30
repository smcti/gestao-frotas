const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Passo 1: redireciona o usuário para a tela de login do Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Passo 2: callback do Google, gera o JWT e redireciona para o frontend
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?erro=nao_autorizado`,
  }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${process.env.CLIENT_URL}/login/sucesso?token=${token}`);
  }
);

// Retorna os dados do usuário logado (usado pelo frontend para validar a sessão)
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
