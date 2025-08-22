import React, { useState } from 'react';

interface ActivityTabProps {}

const ActivityTab: React.FC<ActivityTabProps> = () => {
  

  
 

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Mes Activités</h3>
      </div>
    </div>
  );
};

export default ActivityTab;
