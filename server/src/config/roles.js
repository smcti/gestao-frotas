const Employee = require('../models/Employee');

/**
 * Descobre o papel (role) de um e-mail.
 * - O e-mail definido em ADMIN_BOOTSTRAP_EMAIL sempre vira admin automaticamente
 *   (garante que sempre tem alguém pra gerenciar os funcionários pelo sistema).
 * - Todos os outros precisam estar cadastrados na tela de Funcionários (pelo admin).
 * - Quem não está cadastrado não consegue entrar no sistema.
 */
async function resolveRole(email) {
  const e = (email || '').toLowerCase();
  const bootstrapEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL || '').toLowerCase();

  if (bootstrapEmail && e === bootstrapEmail) {
    await Employee.findOneAndUpdate(
      { email: e },
      { email: e, role: 'admin' },
      { upsert: true, setDefaultsOnInsert: true }
    );
    return 'admin';
  }

  const employee = await Employee.findOne({ email: e });
  return employee ? employee.role : null;
}

module.exports = { resolveRole };
