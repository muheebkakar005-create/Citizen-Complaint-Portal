import React from 'react';
import { OfficerDashboard } from './OfficerDashboard';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

// The Admin console shares the same complaint-oversight data, filters and AI
// briefing as the Officer console (admins have full officer-level access),
// but is served from its own route/login destination and its own labeling.
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  return <OfficerDashboard navigate={navigate} portalRole="admin" />;
};
