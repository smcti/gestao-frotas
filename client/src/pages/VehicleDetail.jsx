import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TYPE_LABELS = { oleo: 'Óleo / Graxa', peca: 'Peça' };

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState(null);
  const [quickUsage, setQuickUsage] = useState('');
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickOk, setQuickOk] = useState(false);

  async function load() {
    const [v, r] = await Promise.all([
      api.get(`/vehicles/${id}`),
      api.get(`/vehicles/${id}/manutencoes`),
    ]);
    setVehicle(v.data);
    setEditForm({ plate: v.data.plate, unit: v.data.unit });
    setQuickUsage(v.data.currentUsage);
    setRecords(r.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleSaveEdit(e) {
    e.preventDefault();
    await api.put(`/vehicles/${id}`, editForm);
    load();
  }

  async function handleQuickUsage(e) {
    e.preventDefault();
    setQuickSaving(true);
    setQuickOk(false);
    try {
      await api.put(`/vehicles/${id}/km`, { currentUsage: quickUsage });
      setQuickOk(true);
      load();
    } finally {
      setQuickSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja remover este veículo e todo o histórico dele?')) return;
    await api.delete(`/vehicles/${id}`);
    navigate('/veiculos');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-gray-500 text-center mt-10">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[95%] sm:max-w-[80%] mx-auto px-4 py-6 sm:py-8 space-y-8">
        <div className="flex items-center justify-between">
          {user?.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="bg-red-500 h-10 flex items-center hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              ⛔ Remover veículo
            </button>
          )}

          <div className="flex items-center justify-end ml-auto">
            {(user?.role === 'oleo' || user?.role === 'peca' || user?.role === 'admin') && (
              <Link
                to={`/lancar?veiculo=${vehicle._id}`}
                className="bg-brand-500 h-10 flex items-center hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                🔧 Lançar manutenção
              </Link>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Situação atual</h2>
          {vehicle.items.length === 0 && (
            <p className="text-gray-500 text-sm bg-white rounded-xl shadow p-4">
              Nenhuma manutenção lançada ainda para este veículo.
            </p>
          )}
          <div className="space-y-2">
            {vehicle.items.map((item) => {
              const podeLancarEsse = user?.role === 'admin' || user?.role === item.type;
              const Wrapper = podeLancarEsse ? Link : 'div';
              const wrapperProps = podeLancarEsse
                ? { to: `/lancar?veiculo=${vehicle._id}&tipo=${item.type}&item=${encodeURIComponent(item.label)}` }
                : {};

              return (
                <Wrapper
                  key={item.label}
                  {...wrapperProps}
                  className="bg-white rounded-xl shadow p-4 flex items-center justify-between hover:shadow-md transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.label}</p>
                    <p className="text-sm text-gray-500">
                      {item.status === 'vencido' ? 'Vencido' : `Faltam ${Math.max(item.daysRemaining, 0)} dias`}
                      {' · '}
                      {Math.max(item.usageRemaining, 0).toLocaleString('pt-BR')} {vehicle.unit} restantes
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </Wrapper>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Atualizar {vehicle.unit === 'horas' ? 'horímetro' : 'km'} atual</h2>
          <form onSubmit={handleQuickUsage} className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3 items-end">
            {quickOk && <p className="w-full text-sm text-green-700">Atualizado!</p>}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {vehicle.unit === 'horas' ? 'Horas' : 'Km'} atual
              </label>
              <input
                type="number"
                value={quickUsage}
                onChange={(e) => setQuickUsage(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-40"
              />
            </div>
            <button
              disabled={quickSaving}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              {quickSaving ? 'Salvando...' : 'Atualizar'}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-1">
            Use isso pra manter o {vehicle.unit === 'horas' ? 'horímetro' : 'km'} em dia mesmo sem lançar uma manutenção nova.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Dados do veículo</h2>
          <form onSubmit={handleSaveEdit} className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Placa</label>
              <input
                value={editForm.plate}
                onChange={(e) => setEditForm({ ...editForm, plate: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Unidade</label>
              <select
                value={editForm.unit}
                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="km">Km</option>
                <option value="horas">Horas</option>
              </select>
            </div>
            <button className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Salvar
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Histórico de manutenções</h2>
          {records.length === 0 && <p className="text-gray-500 text-sm">Nenhum registro ainda.</p>}
          <div className="space-y-2">
            {groupByBatch(records).map((batch) => (
              <div key={batch.batchId} className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-semibold px-2 py-0.5 rounded-full ${batch.type === 'oleo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}
                  >
                    {TYPE_LABELS[batch.type]}
                  </span>
                  <span className="text-sm text-gray-400">{new Date(batch.date).toLocaleDateString('pt-BR')}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {batch.items.map((r) => (
                    <span key={r._id} className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                      {r.itemName}
                    </span>
                  ))}
                </div>

                {batch.description && <p className="text-base text-gray-700 mb-1">{batch.description}</p>}
                <p className="text-sm text-gray-400">
                  {batch.usageAtMaintenance.toLocaleString('pt-BR')} {vehicle.unit}
                  {batch.registeredBy ? ` · lançado por ${batch.registeredBy}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
}

// Junta os registros que foram lançados juntos (mesmo batchId) num card só
function groupByBatch(records) {
  const map = new Map();
  for (const r of records) {
    if (!map.has(r.batchId)) {
      map.set(r.batchId, {
        batchId: r.batchId,
        type: r.type,
        date: r.date,
        usageAtMaintenance: r.usageAtMaintenance,
        description: r.description,
        registeredBy: r.registeredBy?.name,
        items: [],
      });
    }
    map.get(r.batchId).items.push(r);
  }
  return [...map.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
}
