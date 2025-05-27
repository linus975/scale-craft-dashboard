
import React from 'react';
import ComprehensiveMachineStatisticsPage from './ComprehensiveMachineStatisticsPage';

interface MachineStatisticsPageProps {
  machineName?: string;
  onBack?: () => void;
}

const MachineStatisticsPage: React.FC<MachineStatisticsPageProps> = ({ onBack }) => {
  return <ComprehensiveMachineStatisticsPage onBack={onBack || (() => {})} />;
};

export default MachineStatisticsPage;
