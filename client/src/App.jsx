import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import LoginSuccess from './pages/LoginSuccess';
import Dashboard from './pages/Dashboard';
import VehicleList from './pages/VehicleList';
import VehicleRegister from './pages/VehicleRegister';
import VehicleDetail from './pages/VehicleDetail';
import LaunchMaintenance from './pages/LaunchMaintenance';
import Employees from './pages/Employees';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login/sucesso" element={<LoginSuccess />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/veiculos"
        element={
          <PrivateRoute>
            <VehicleList />
          </PrivateRoute>
        }
      />
      <Route
        path="/veiculos/novo"
        element={
          <PrivateRoute>
            <VehicleRegister />
          </PrivateRoute>
        }
      />
      <Route
        path="/veiculos/:id"
        element={
          <PrivateRoute>
            <VehicleDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/lancar"
        element={
          <PrivateRoute>
            <LaunchMaintenance />
          </PrivateRoute>
        }
      />
      <Route
        path="/funcionarios"
        element={
          <PrivateRoute>
            <Employees />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
