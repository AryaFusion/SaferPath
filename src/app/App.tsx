import { SafetyProvider } from '../context/SafetyContext';
import AppShell from './AppShell';

export default function App() {
  return (
    <SafetyProvider>
      <AppShell />
    </SafetyProvider>
  );
}
