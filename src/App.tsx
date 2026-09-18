import { SafetyProvider } from './context/SafetyContext';
import MainDashboard from './pages/MainDashboard';

export default function App() {
  return (
    <SafetyProvider>
      <MainDashboard />
    </SafetyProvider>
  );
}