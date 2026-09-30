const STYLES = {
  ok: 'bg-green-100 text-green-700 border-green-200',
  atencao: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  vencido: 'bg-red-100 text-red-700 border-red-200',
  sem_registro: 'bg-gray-100 text-gray-600 border-gray-200',
};

const LABELS = {
  ok: 'Em dia',
  atencao: 'Atenção',
  vencido: 'Vencido',
  sem_registro: 'Sem registro',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center text-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border ${STYLES[status]} `}
    >
      {LABELS[status]}
    </span>
  );
}
