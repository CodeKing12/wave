import React from 'react';
import Alert from './Alert';
import { useAlert } from '@/pages/AlertContext';

function Alerts() {
  const { alerts, removeAlert } = useAlert();

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2.5 fixed top-0 pt-3 left-1/2 -translate-x-1/2 h-fit duration-500 ease-in-out z-[9999]">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          id={alert.id}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onRemove={removeAlert}
        />
      ))}
    </div>
  );
}

export default Alerts;
