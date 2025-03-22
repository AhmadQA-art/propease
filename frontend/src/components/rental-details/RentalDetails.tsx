import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

// ... other imports ...

const DEVELOPMENT_EMAIL = "defensive.bee.phfc@letterguard.net";

export default function RentalDetails() {
  const { userProfile } = useAuth();
  const isDevelopmentUser = userProfile?.email === DEVELOPMENT_EMAIL;

  // Tabs configuration with conditional rendering
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <RentalOverview 
          showAddTask={isDevelopmentUser} // Only show Add Task button for development user
        />
      )
    },
    {
      id: 'units',
      label: 'Units',
      content: <RentalUnits />
    },
    {
      id: 'applications',
      label: 'Applications',
      content: <RentalApplications />
    },
    // Only show Tasks tab for development user
    ...(isDevelopmentUser ? [{
      id: 'tasks',
      label: 'Tasks',
      content: <RentalTasks />
    }] : []),
    // Only show Activities tab for development user
    ...(isDevelopmentUser ? [{
      id: 'activities',
      label: 'Activities',
      content: <RentalActivities />
    }] : []),
    {
      id: 'documents',
      label: 'Documents',
      content: <RentalDocuments />
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* ... rest of your component ... */}
    </div>
  );
}