import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/vehicles').then(({ data }) => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  const filtered = vehicles.filter((v) => v.plate.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[95%] sm:max-w-[80%] mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Veículos</h1>
          <Link
            to="/veiculos/novo"
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            + Cadastrar veículo
          </Link>
        </div>

        <input
          type="text"
          placeholder="Buscar por placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs mb-6 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {loading && <p className="text-gray-500">Carregando...</p>}
        {!loading && filtered.length === 0 && <p className="text-gray-500">Nenhum veículo encontrado.</p>}

        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-base sm:min-w-[560px]">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Placa</th>
                <th className="px-4 py-3 hidden sm:table-cell">Uso atual</th>
                <th className="px-4 py-3 hidden sm:table-cell">Situação</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3.5 font-mono font-semibold text-gray-800">{v.plate}</td>
                  <td className="px-4 py-3.5 text-gray-600 hidden sm:table-cell">
                    {v.currentUsage.toLocaleString('pt-BR')} {v.unit}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <StatusBadge status={v.overallStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/veiculos/${v._id}`} className="text-brand-600 hover:underline font-medium">
                      Ver histórico
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
