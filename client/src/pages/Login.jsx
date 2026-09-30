import { useSearchParams } from 'react-router-dom';

export default function Login() {
  const [params] = useSearchParams();
  const erro = params.get('erro');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-sm text-center">
        <div className="text-4xl mb-2">🚚</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Controle de Frota</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Gerencie os veículos e acompanhe as manutenções da sua frota.
        </p>

        {erro && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            Sua conta Google não tem permissão para acessar este sistema.
          </p>
        )}

        <a
          href={`${apiUrl}/auth/google`}
          className="flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.3 0 10.2-2 13.9-5.4l-6.4-5.4C29.4 34.9 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.8 39.6 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.4 5.4C40.5 36.5 44 30.9 44 24c0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          Entrar com o Google
        </a>
      </div>
    </div>
  );
}
