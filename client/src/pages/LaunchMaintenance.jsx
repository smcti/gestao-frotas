import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PlateSearchSelect from '../components/PlateSearchSelect';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LaunchMaintenance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const veiculoParam = searchParams.get('veiculo');
  const tipoParam = searchParams.get('tipo');
  const itemParam = searchParams.get('item');
  const preselecionouRef = useRef(false);

  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [type, setType] = useState(
    user?.role === 'admin' ? (tipoParam === 'peca' ? 'peca' : 'oleo') : user?.role
  );
  const [usageAtMaintenance, setUsageAtMaintenance] = useState('');
  const [description, setDescription] = useState('');

  const [catalog, setCatalog] = useState([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [selected, setSelected] = useState({}); // { [itemName]: { nextDueDate, nextDueUsage, temPrazo } }
  const [newItemName, setNewItemName] = useState('');

  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false); // vira true quando a pessoa tenta enviar sem preencher tudo

  useEffect(() => {
    api.get('/vehicles').then(({ data }) => {
      setVehicles(data);
      if (veiculoParam) {
        setVehicleId(veiculoParam);
        const v = data.find((x) => x._id === veiculoParam);
        if (v) setUsageAtMaintenance(String(v.currentUsage));
      }
    });
  }, []);

  useEffect(() => {
    setSelected({});
    setCatalogLoaded(false);
    api.get(`/servicos?type=${type}`).then(({ data }) => {
      setCatalog(data.map((s) => s.name));
      setCatalogLoaded(true);
    });
  }, [type]);

  useEffect(() => {
    if (!itemParam || !catalogLoaded || vehicles.length === 0 || preselecionouRef.current) return;
    setCatalog((prev) => (prev.includes(itemParam) ? prev : [...prev, itemParam]));
    setSelected((prev) => ({ ...prev, [itemParam]: defaultsFor(type) }));
    preselecionouRef.current = true;
  }, [catalogLoaded, vehicles]);

  const vehicle = vehicles.find((v) => v._id === vehicleId);
  const unitLabel = vehicle?.unit === 'horas' ? 'horas' : 'km';

  function defaultsFor(itemType) {
    // Óleo/graxa já vem com um padrão sugerido (6 meses / 10.000km — ou 500 horas se for veículo por horímetro)
    // que a pessoa pode mudar. Peça não tem padrão — cada peça dura uma coisa diferente.
    if (itemType !== 'oleo') return { kmDelta: '', monthsDelta: '' };
    const kmPadrao = vehicle?.unit === 'horas' ? '500' : '10000';
    return { kmDelta: kmPadrao, monthsDelta: '6' };
  }

  function toggleItem(name) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      } else {
        next[name] = defaultsFor(type);
      }
      return next;
    });
  }

  function updateItem(name, field, value) {
    setSelected((prev) => ({ ...prev, [name]: { ...prev[name], [field]: value } }));
  }

  function addNewItem() {
    const name = newItemName.trim();
    if (!name) return;
    if (!catalog.includes(name)) setCatalog((prev) => [...prev, name]);
    setSelected((prev) => ({ ...prev, [name]: defaultsFor(type) }));
    setNewItemName('');
  }

  function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + Number(months));
    return d;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setOk(false);

    const items = Object.entries(selected).map(([name, cfg]) => {
      const nextDueDate = cfg.monthsDelta ? addMonths(new Date(), cfg.monthsDelta).toISOString().slice(0, 10) : null;
      const nextDueUsage = cfg.kmDelta ? Number(usageAtMaintenance) + Number(cfg.kmDelta) : null;
      return { name, nextDueDate, nextDueUsage };
    });

    if (items.length === 0) {
      setError('Marque ou adicione pelo menos um item');
      return;
    }
    if (type === 'peca' && items.some((i) => !i.nextDueDate && !i.nextDueUsage)) {
      setTentouEnviar(true); // acende a borda vermelha nos itens sem prazo preenchido
      setError('Preencha o prazo (em meses ou em km) de cada peça marcada em vermelho abaixo');
      return;
    }

    setSaving(true);
    try {
      await api.post(`/vehicles/${vehicleId}/manutencoes`, {
        type,
        usageAtMaintenance,
        description,
        items,
      });
      setOk(true);
      setTentouEnviar(false);
      setUsageAtMaintenance('');
      setDescription('');
      setSelected({});
      setTimeout(() => navigate(`/veiculos/${vehicleId}`), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao lançar manutenção');
    } finally {
      setSaving(false);
    }
  }

  if (!['oleo', 'peca', 'admin'].includes(user?.role)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center text-gray-500 mt-10">Seu usuário não tem permissão para lançar manutenções.</p>
      </div>
    );
  }

  const selectedNames = Object.keys(selected);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[95%] sm:max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Lançar manutenção</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-4 sm:p-8 space-y-6">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          {ok && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              Manutenção lançada com sucesso!
            </p>
          )}

          {user.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de manutenção</label>
              <div className="flex gap-2">
                {[
                  { value: 'oleo', label: '🛢️ Óleo / Graxa' },
                  { value: 'peca', label: '⚙️ Peça' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-semibold ${type === opt.value
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-600 border-gray-300'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placa do veículo</label>
            <PlateSearchSelect vehicles={vehicles} value={vehicleId} onChange={setVehicleId} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {vehicle ? `${unitLabel === 'horas' ? 'Horas' : 'Km'} atual` : 'Km/hora atual'}
            </label>
            <input
              type="number"
              value={usageAtMaintenance}
              onChange={(e) => setUsageAtMaintenance(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base"
            />
          </div>

          {/* Catálogo de itens, cresce sozinho conforme usam */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O que foi feito (marque quantos precisar)
            </label>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mb-3">
              {catalog.map((name) => (
                <label
                  key={name}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer ${selected[name] ? 'bg-brand-50 border-brand-400' : 'bg-white border-gray-300'
                    }`}
                >
                  <input type="checkbox" checked={!!selected[name]} onChange={() => toggleItem(name)} />
                  {name}
                </label>
              ))}
              {catalog.length === 0 && (
                <p className="col-span-2 text-sm text-gray-400">Nenhum item cadastrado ainda — adicione um abaixo.</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0.5">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={type === 'peca' ? 'Nova peça (ex: Correia dentada)' : 'Novo item (ex: Filtro de ar)'}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addNewItem}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg"
              >
                + Adicionar
              </button>
            </div>
          </div>

          {selectedNames.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Prazo de cada item {type === 'oleo' && '— já vem com um padrão sugerido, pode mudar se quiser'}
              </label>
              {selectedNames.map((name) => {
                const cfg = selected[name];
                const dataCalculada = cfg.monthsDelta ? addMonths(new Date(), cfg.monthsDelta) : null;
                const kmCalculado =
                  cfg.kmDelta && usageAtMaintenance ? Number(usageAtMaintenance) + Number(cfg.kmDelta) : null;

                // Peça sem meses e sem km preenchido, depois que a pessoa já tentou enviar: acende vermelho
                const faltaPreencher = type === 'peca' && !cfg.monthsDelta && !cfg.kmDelta && tentouEnviar;
                const inputClass = `w-full rounded-lg border px-3 py-2 text-sm ${faltaPreencher ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`;

                return (
                  <div key={name} className="bg-gray-50 rounded-xl p-4">
                    <span className="text-md font-semibold text-gray-800 block mb-2">{name}</span>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Daqui quantos meses</label>
                        <input
                          type="number"
                          min="0"
                          value={cfg.monthsDelta}
                          onChange={(e) => updateItem(name, 'monthsDelta', e.target.value)}
                          className={inputClass}
                        />
                        {dataCalculada && (
                          <p className="text-sm text-gray-500 mt-1">
                            vence em {dataCalculada.toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">
                          Daqui quantos {unitLabel === 'horas' ? 'horas' : 'km'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={cfg.kmDelta}
                          onChange={(e) => updateItem(name, 'kmDelta', e.target.value)}
                          className={inputClass}
                        />
                        {kmCalculado != null && (
                          <p className="text-sm text-gray-500 mt-1">
                            vence com {kmCalculado.toLocaleString('pt-BR')} {unitLabel}
                          </p>
                        )}
                      </div>
                    </div>

                    {faltaPreencher && (
                      <p className="text-sm text-red-600 font-medium mt-2">⚠ Falta preencher o prazo dessa peça.</p>
                    )}
                    {!faltaPreencher && type === 'peca' && !cfg.monthsDelta && !cfg.kmDelta && (
                      <p className="text-sm text-red-600 mt-2">Preencha pelo menos um dos dois campos.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !vehicleId}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
          >
            {saving ? 'Salvando...' : 'Lançar manutenção'}
          </button>
        </form>
      </div>
    </div>
  );
}
