import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = params.get('token');

    async function run() {
      if (!token) {
        navigate('/login');
        return;
      }
      await loginWithToken(token);
      navigate('/');
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Entrando...
    </div>
  );
}
