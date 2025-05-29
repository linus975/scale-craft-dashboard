
import { useState } from 'react';

export const useAutomationSettings = () => {
  const [automationSettings, setAutomationSettings] = useState({
    autoCreateJobs: true,
    parameterMapping: true,
    orderNotifications: false
  });

  const handleAutomationToggle = (setting: string) => {
    setAutomationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  return {
    automationSettings,
    handleAutomationToggle
  };
};
