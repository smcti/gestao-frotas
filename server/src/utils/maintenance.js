const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Regra padrão da frota, usada quando o registro não define um prazo próprio.
// Pode ajustar aqui sem mexer no resto do código.
const DEFAULT_RULES = {
  km: { interval: 10000, alertThreshold: 1000 }, // avisa faltando 1000km ou menos
  horas: { interval: 500, alertThreshold: 50 }, // avisa faltando 50h ou menos
  dias: { interval: 180, alertThreshold: 15 }, // avisa faltando 15 dias ou menos
};

/**
 * Calcula o status de UM item (óleo, ou uma peça específica) a partir do último
 * registro daquele item. Usa o prazo específico do registro quando informado,
 * senão cai na regra padrão da frota (por km/hora e por dia).
 */
function computeItemStatus(record, unit) {
  const rule = DEFAULT_RULES[unit];

  const baseDate = new Date(record.date);
  const nextDueDate = record.nextDueDate
    ? new Date(record.nextDueDate)
    : new Date(baseDate.getTime() + DEFAULT_RULES.dias.interval * MS_PER_DAY);

  const nextDueUsage =
    record.nextDueUsage != null ? record.nextDueUsage : record.usageAtMaintenance + rule.interval;

  const now = new Date();
  const daysRemaining = Math.ceil((nextDueDate.getTime() - now.getTime()) / MS_PER_DAY);

  return { nextDueDate, nextDueUsage, daysRemaining, rule };
}

/**
 * Recebe o veículo e a lista de registros dele (do mais novo pro mais velho não importa a ordem)
 * e monta o resumo de manutenção: um item pra óleo (se já houver lançamento) e um item por peça
 * distinta já registrada, cada um com seu próprio status.
 */
function buildMaintenanceSummary(vehicle, records) {
  const latestByItem = new Map();

  for (const r of records) {
    const name = (r.itemName || 'Item sem nome').trim().toLowerCase();
    const key = `${r.type}::${name}`;
    const current = latestByItem.get(key);
    if (!current || new Date(r.date) > new Date(current.date)) {
      latestByItem.set(key, r);
    }
  }

  const items = [...latestByItem.values()].map((r) => buildItem(r.itemName || 'Item sem nome', r, vehicle));

  const overallStatus = items.some((i) => i.status === 'vencido')
    ? 'vencido'
    : items.some((i) => i.status === 'atencao')
    ? 'atencao'
    : items.length > 0
    ? 'ok'
    : 'sem_registro';

  // Itens mais urgentes primeiro
  items.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return { items, overallStatus };
}

function buildItem(label, record, vehicle) {
  const { nextDueDate, nextDueUsage, daysRemaining, rule } = computeItemStatus(record, vehicle.unit);
  const usageRemaining = nextDueUsage - vehicle.currentUsage;

  let status = 'ok';
  if (daysRemaining <= 0 || usageRemaining <= 0) {
    status = 'vencido';
  } else if (daysRemaining <= DEFAULT_RULES.dias.alertThreshold || usageRemaining <= rule.alertThreshold) {
    status = 'atencao';
  }

  return {
    label,
    type: record.type,
    lastDate: record.date,
    lastUsage: record.usageAtMaintenance,
    nextDueDate,
    nextDueUsage,
    daysRemaining,
    usageRemaining,
    status,
  };
}

module.exports = { buildMaintenanceSummary, DEFAULT_RULES };
