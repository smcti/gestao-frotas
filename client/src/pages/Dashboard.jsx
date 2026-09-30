import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [all, alertList] = await Promise.all([
        api.get('/vehicles'),
        api.get('/vehicles/alertas'),
      ]);
      setVehicles(all.data);
      setAlerts(alertList.data);
      setLoading(false);
    }
    load();
  }, []);

  // "Achata" a lista: um card por item pendente (não por veículo), pra dar pra ver peça por peça
  const pendingItems = alerts.flatMap((v) =>
    v.items
      .filter((item) => item.status !== 'ok')
      .map((item) => ({ ...item, plate: v.plate, unit: v.unit, vehicleId: v._id }))
  );
  pendingItems.sort((a, b) => a.daysRemaining - b.daysRemaining);

  const vencidos = pendingItems.filter((i) => i.status === 'vencido').length;
  const atencao = pendingItems.filter((i) => i.status === 'atencao').length;
  const emDia = vehicles.filter((v) => v.overallStatus === 'ok').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[95%] sm:max-w-[80%] mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard label="Veículos em dia" value={emDia} color="text-green-600" bg="bg-green-50" />
          <SummaryCard label="Itens em atenção" value={atencao} color="text-yellow-700" bg="bg-yellow-50" />
          <SummaryCard label="Itens vencidos" value={vencidos} color="text-red-600" bg="bg-red-50" />
        </div>

        {loading && <p className="text-gray-500">Carregando...</p>}

        {!loading && vehicles.length === 0 && (
          <p className="text-gray-500">
            Nenhum veículo cadastrado ainda.{' '}
            <Link to="/veiculos/novo" className="text-brand-600 font-medium hover:underline">
              Cadastre o primeiro
            </Link>
            .
          </p>
        )}

        {!loading && vehicles.length > 0 && pendingItems.length === 0 && (
          <p className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            ✅ Nenhum item precisa de manutenção no momento.
          </p>
        )}

        {pendingItems.map((item, i) => (
          <div
            key={`${item.vehicleId}-${item.label}-${i}`}
            className="bg-white rounded-2xl shadow p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-l-4"
            style={{ borderColor: item.status === 'vencido' ? '#dc2626' : '#eab308' }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono font-bold text-gray-800">{item.plate}</span>
                <span className="text-gray-500 text-base">{item.label}</span>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-base text-gray-500">
                {item.status === 'vencido'
                  ? 'Manutenção vencida'
                  : `Faltam ${Math.max(item.daysRemaining, 0)} dias ou ${Math.max(
                    item.usageRemaining,
                    0
                  ).toLocaleString('pt-BR')} ${item.unit}`}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <Link
                to={`/veiculos/${item.vehicleId}`}
                className="text-sm font-semibold text-brand-600 hover:underline whitespace-nowrap"
              >
                Ver veículo →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, bg }) {
  return (
    <div className={`rounded-2xl p-5 ${bg}`}>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
}
