import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ROLE_LABELS = { oleo: 'Óleo / Graxa', peca: 'Peças', admin: 'Administrador' };

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', role: 'oleo' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await api.get('/funcionarios');
    setEmployees(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/funcionarios', form);
      setForm({ email: '', role: 'oleo' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar funcionário');
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(id, role) {
    await api.put(`/funcionarios/${id}`, { role });
    load();
  }

  async function handleRemove(id) {
    if (!confirm('Remover o acesso dessa pessoa ao sistema?')) return;
    await api.delete(`/funcionarios/${id}`);
    load();
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center text-gray-500 mt-10">Só o administrador pode acessar essa página.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[95%] sm:max-w-[80%] mx-auto px-4 py-6 sm:py-8 space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">Funcionários</h1>
        <p className="text-sm text-gray-500 -mt-6">
          Cadastre aqui o e-mail Google de cada pessoa e o que ela pode fazer no sistema. Só quem está nessa lista
          consegue entrar.
        </p>

        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow p-6 flex flex-wrap gap-3 items-end">
          {error && (
            <p className="w-full text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">E-mail do Google</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="pessoa@gmail.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Papel</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="oleo">Óleo / Graxa</option>
              <option value="peca">Peças</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button
            disabled={saving}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            {saving ? 'Adicionando...' : '+ Adicionar'}
          </button>
        </form>

        {loading && <p className="text-gray-500">Carregando...</p>}

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-3 sm:px-4 py-3">Nome</th>
                  <th className="px-4 py-3 hidden md:table-cell">E-mail</th>
                  <th className="px-3 sm:px-4 py-3">Papel</th>
                  <th className="px-3 sm:px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td className="px-3 sm:px-4 py-3 text-gray-700">
                      <p>{emp.name || '—'}</p>
                      <p className="text-gray-500 text-xs break-all md:hidden">{emp.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{emp.email}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <select
                        value={emp.role}
                        onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-sm max-w-[120px] sm:max-w-none"
                      >
                        <option value="oleo">Óleo / Graxa</option>
                        <option value="peca">Peças</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemove(emp._id)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
