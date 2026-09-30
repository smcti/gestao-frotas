import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function VehicleRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ plate: '', unit: 'km', currentUsage: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/vehicles', form);
      navigate('/veiculos');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar o veículo');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[95%] sm:max-w-lg mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Cadastrar veículo</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-4 sm:p-8 space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
            <input
              type="text"
              name="plate"
              value={form.plate}
              onChange={handleChange}
              required
              className="w-full uppercase rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Esse veículo é controlado por</label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="km">Quilometragem (km)</option>
              <option value="horas">Horas de trabalho (horímetro)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.unit === 'horas' ? 'Horas atuais' : 'Km atual'}
            </label>
            <input
              type="number"
              name="currentUsage"
              value={form.currentUsage}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
          >
            {saving ? 'Salvando...' : 'Cadastrar veículo'}
          </button>
        </form>
      </div>
    </div>
  );
}
