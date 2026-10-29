import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  online: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ online }) => {
  return (
    <div className="connection">
      {online ? <Wifi size={14} /> : <WifiOff size={14} />}
      <span>{online ? 'You’re online' : 'Offline mode'}</span>
    </div>
  );
};
