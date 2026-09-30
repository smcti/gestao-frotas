import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import logoIcone from '../assets/images/brasao.png';

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      title={label}
      className={({ isActive }) =>
        `flex items-center gap-2 px-2.5 lg:px-4 py-2.5 rounded-xl text-sm lg:text-base font-semibold transition whitespace-nowrap ${isActive ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="hidden lg:inline">{label}</span>
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const podeLancar = user?.role === 'oleo' || user?.role === 'peca' || user?.role === 'admin';
  const lancarLabel =
    user?.role === 'oleo' ? 'Lançar óleo' : user?.role === 'peca' ? 'Lançar peça' : 'Lançar manutenção';

  return (
    <nav className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2">
      <div className="mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-2 min-w-0">
        <div className="flex items-center">
          <img
            src={logoIcone}
            alt="Prefeitura de Pato Branco"
            className='h-12 sm:h-16'
          />
        </div>

        <div className="flex items-center justify-center gap-0.5 sm:gap-1 overflow-x-auto min-w-0">
          <NavItem to="/" icon="🏠" label="Início" />
          <NavItem to="/veiculos" icon="🚗" label="Veículos" />
          {podeLancar && <NavItem to="/lancar" icon="🔧" label={lancarLabel} />}
          {user?.role === 'admin' && <NavItem to="/funcionarios" icon="👨‍💼" label="Funcionários" />}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-self-end">
          {user?.avatar && <img src={user.avatar} alt={user.name} title={user.name} className="w-8 h-8 rounded-full hidden xs:block" />}

          <div className="text-sm hidden lg:block">
            <p className="text-gray-700 leading-tight">{user?.name}</p>
            <p className="text-gray-400 text-xs leading-tight">{ROLE_LABELS[user?.role]}</p>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium pl-2 sm:pl-4 border-l border-gray-200"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
