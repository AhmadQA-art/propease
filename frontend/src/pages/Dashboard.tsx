import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { Building2, Users, Home, Wrench, Calendar, Clock, CheckCircle } from 'lucide-react';
import { getDashboardData, DashboardData, getUserTasks, UserTask, completeTask } from '../services/dashboard.service';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProperties: 0,
    totalUnits: 0,
    activeLeases: 0,
    activeMaintenance: 0,
    propertyTrend: 0,
    unitTrend: 0,
    leaseTrend: 0,
    maintenanceTrend: 0
  });
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardData();
        console.log('Dashboard received data:', data);
        
        // Ensure activeMaintenance is a number
        if (typeof data.activeMaintenance !== 'number') {
          console.warn('Maintenance count is not a number:', data.activeMaintenance);
          data.activeMaintenance = parseInt(data.activeMaintenance) || 0;
        }
        
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTasks();
    fetchDashboardData();
  }, []);

  const fetchUserTasks = async () => {
    try {
      setTasksLoading(true);
      const tasks = await getUserTasks();
      // Filter out completed tasks
      const incompleteTasks = tasks.filter(task => task.status !== 'completed');
      setUserTasks(incompleteTasks);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setCompletingTaskId(taskId);
      const success = await completeTask(taskId);
      
      if (success) {
        // Refresh the task list after completing a task
        await fetchUserTasks();
        
        // Also refresh dashboard data as completed tasks might affect the count
        const data = await getDashboardData();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setCompletingTaskId(null);
    }
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    // Ensure num is actually a number
    if (typeof num !== 'number') {
      console.warn('Attempting to format non-number:', num);
      num = parseInt(num) || 0;
    }
    return num.toLocaleString('en-US');
  };

  // Format date in a human-readable format
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    
    if (date.getTime() < today.getTime()) {
      return `Overdue: ${date.toLocaleDateString('en-US', dateOptions)}`;
    } else if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', dateOptions);
    }
  };

  // Get priority color class
  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2C3539]">Dashboard</h1>
        <p className="text-[#6B7280] mt-1">Welcome back!</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Properties"
            value={formatNumber(dashboardData.totalProperties)}
            trend={dashboardData.propertyTrend}
            icon={<Building2 className="w-6 h-6 text-[#2C3539]" />}
          />
          <DashboardCard
            title="Total Units"
            value={formatNumber(dashboardData.totalUnits)}
            trend={dashboardData.unitTrend}
            icon={<Home className="w-6 h-6 text-[#2C3539]" />}
          />
          <DashboardCard
            title="Active Leases"
            value={formatNumber(dashboardData.activeLeases)}
            trend={dashboardData.leaseTrend}
            icon={<Users className="w-6 h-6 text-[#2C3539]" />}
          />
          <DashboardCard
            title="Active Maintenance"
            value={formatNumber(dashboardData.activeMaintenance)}
            trend={dashboardData.maintenanceTrend}
            icon={<Wrench className="w-6 h-6 text-[#2C3539]" />}
          />
        </div>
      )}

      {/* User Tasks Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#2C3539] mb-4">Your Tasks</h2>
        
        {tasksLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="p-4 border-b border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : userTasks.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-h-[380px] overflow-y-auto">
            {userTasks.map((task, index) => (
              <div 
                key={task.id} 
                className={`py-3 px-4 hover:bg-gray-50 transition-colors duration-150 ${index !== userTasks.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-[#2C3539] text-sm truncate max-w-[40%]">{task.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {task.status}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)} bg-opacity-10`}>
                      {task.priority}
                    </span>
                    <button
                      className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-md hover:bg-green-100 transition-colors ml-2"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completingTaskId === task.id}
                    >
                      {completingTaskId === task.id ? (
                        <span>...</span>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-gray-500">You are up to date</p>
          </div>
        )}
      </div>
    </>
  );
}