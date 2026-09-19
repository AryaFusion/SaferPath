import { useContext } from 'react';
import { SafetyContext } from './SafetyContext';

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};
export default useSafety;
