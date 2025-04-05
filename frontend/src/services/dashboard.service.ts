import { supabase } from './supabase/client';

export interface DashboardData {
  totalProperties: number;
  totalUnits: number;
  activeLeases: number;
  activeMaintenance: number;
  propertyTrend: number;
  unitTrend: number;
  leaseTrend: number;
  maintenanceTrend: number;
}

export interface UserTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
}

// Function to update a task's status to completed
export const completeTask = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId);
    
    if (error) {
      console.error('Error completing task:', error);
      return false;
    }
    
    console.log('Task marked as completed:', taskId);
    return true;
  } catch (error) {
    console.error('Error in completeTask:', error);
    return false;
  }
};

// Fallback data in case of errors
const fallbackData: DashboardData = {
  totalProperties: 0,
  totalUnits: 0,
  activeLeases: 0,
  activeMaintenance: 0,
  propertyTrend: 0,
  unitTrend: 0,
  leaseTrend: 0,
  maintenanceTrend: 0
};

// Function to get tasks assigned to the current user
export const getUserTasks = async (): Promise<UserTask[]> => {
  try {
    // Get user's session to ensure they're logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found');
      return [];
    }

    const userId = session.user.id;
    console.log('Fetching tasks for user ID:', userId);

    // First get the task IDs assigned to the user from the join table
    const { data: assignedTasks, error: assignmentError } = await supabase
      .from('task_assignees')
      .select('task_id')
      .eq('user_id', userId);

    if (assignmentError) {
      console.error('Error fetching task assignments:', assignmentError);
      return [];
    }

    if (!assignedTasks || assignedTasks.length === 0) {
      console.log('No tasks assigned to user');
      return [];
    }

    // Extract task IDs from the assignments
    const taskIds = assignedTasks.map(assignment => assignment.task_id);
    console.log(`Found ${taskIds.length} task assignments for user`);

    // Then fetch the actual task details
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, description, status, priority, due_date, created_at')
      .in('id', taskIds);

    if (tasksError) {
      console.error('Error fetching task details:', tasksError);
      return [];
    }

    if (!tasks) {
      return [];
    }

    // Sort tasks by due date (nulls last)
    const sortedTasks = [...tasks].sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    console.log('User tasks retrieved:', sortedTasks.length);
    return sortedTasks;
  } catch (error) {
    console.error('Error in getUserTasks:', error);
    return [];
  }
};

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    // Get user's session to ensure they're logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found');
      return fallbackData;
    }

    console.log('Session user ID:', session.user.id);

    // Get user's organization ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return fallbackData;
    }

    const organizationId = userProfile?.organization_id;
    if (!organizationId) {
      console.error('No organization ID found for user');
      return fallbackData;
    }

    console.log('User organization ID:', organizationId);

    // Get active properties count
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return fallbackData;
    }

    console.log('Active properties found:', properties.length);
    const totalProperties = properties.length;

    // Get total units from units table for the same organization
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('id')
      .eq('organization_id', organizationId);

    if (unitsError) {
      console.error('Error fetching units:', unitsError);
      return { ...fallbackData, totalProperties };
    }

    const totalUnits = units ? units.length : 0;
    console.log('Total units from units table:', totalUnits);

    // Get trend data by comparing with properties created before last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const { data: propertiesLastMonth, error: propertiesLastMonthError } = await supabase
      .from('properties')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .lt('created_at', lastMonth.toISOString());

    if (propertiesLastMonthError) {
      console.error('Error fetching previous month properties:', propertiesLastMonthError);
      return { ...fallbackData, totalProperties, totalUnits };
    }

    const totalPropertiesLastMonth = propertiesLastMonth.length;

    // Get units count from last month for trend calculation
    const { data: unitsLastMonth, error: unitsLastMonthError } = await supabase
      .from('units')
      .select('id')
      .eq('organization_id', organizationId)
      .lt('created_at', lastMonth.toISOString());

    if (unitsLastMonthError) {
      console.error('Error fetching previous month units:', unitsLastMonthError);
      return { ...fallbackData, totalProperties, totalUnits };
    }

    const totalUnitsLastMonth = unitsLastMonth ? unitsLastMonth.length : 0;

    // Calculate property and unit trends
    const propertyTrend = totalPropertiesLastMonth > 0
      ? ((totalProperties - totalPropertiesLastMonth) / totalPropertiesLastMonth) * 100
      : 0;

    const unitTrend = totalUnitsLastMonth > 0
      ? ((totalUnits - totalUnitsLastMonth) / totalUnitsLastMonth) * 100
      : 0;

    // Get active leases
    const { data: leases, error: leasesError } = await supabase
      .from('leases')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'Active');

    if (leasesError) {
      console.error('Error fetching leases:', leasesError);
      return { 
        ...fallbackData, 
        totalProperties, 
        totalUnits, 
        propertyTrend, 
        unitTrend 
      };
    }

    console.log('Active leases found:', leases ? leases.length : 0);
    const activeLeases = leases ? leases.length : 0;

    // Get previous month's active leases for trend calculation
    const { data: leasesLastMonth, error: leasesLastMonthError } = await supabase
      .from('leases')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'Active')
      .lt('created_at', lastMonth.toISOString());

    if (leasesLastMonthError) {
      console.error('Error fetching previous month leases:', leasesLastMonthError);
      return { 
        ...fallbackData, 
        totalProperties, 
        totalUnits, 
        activeLeases,
        propertyTrend, 
        unitTrend 
      };
    }

    const activeLeasesLastMonth = leasesLastMonth ? leasesLastMonth.length : 0;
    const leaseTrend = activeLeasesLastMonth > 0
      ? ((activeLeases - activeLeasesLastMonth) / activeLeasesLastMonth) * 100
      : 0;

    // Get active maintenance tickets from the tasks table
    // Using the correct status values from the table constraints: 'new' and 'paused'
    console.log('Fetching maintenance tickets with status: new, paused');
    
    const { data: maintenanceTasks, error: maintenanceError } = await supabase
      .from('tasks')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('type', 'ticket')
      .in('status', ['new', 'paused']);
    
    if (maintenanceError) {
      console.error('Error fetching maintenance tasks:', maintenanceError);
      return { 
        ...fallbackData, 
        totalProperties, 
        totalUnits, 
        activeLeases,
        propertyTrend, 
        unitTrend,
        leaseTrend 
      };
    }

    const activeMaintenance = maintenanceTasks ? maintenanceTasks.length : 0;
    console.log('Active maintenance tickets (new & paused):', activeMaintenance);

    // Get previous month's active maintenance tasks for trend calculation
    const { data: maintenanceLastMonth, error: maintenanceLastMonthError } = await supabase
      .from('tasks')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('type', 'ticket')
      .in('status', ['new', 'paused'])
      .lt('created_at', lastMonth.toISOString());

    if (maintenanceLastMonthError) {
      console.error('Error fetching previous month maintenance tasks:', maintenanceLastMonthError);
      return { 
        ...fallbackData, 
        totalProperties, 
        totalUnits, 
        activeLeases,
        activeMaintenance,
        propertyTrend, 
        unitTrend,
        leaseTrend 
      };
    }

    const activeMaintenanceLastMonth = maintenanceLastMonth ? maintenanceLastMonth.length : 0;
    const maintenanceTrend = activeMaintenanceLastMonth > 0
      ? ((activeMaintenance - activeMaintenanceLastMonth) / activeMaintenanceLastMonth) * -100
      : 0;

    // Log the final data
    console.log('Dashboard data:', {
      totalProperties,
      totalUnits,
      activeLeases,
      activeMaintenance,
      propertyTrend,
      unitTrend,
      leaseTrend,
      maintenanceTrend
    });

    // Return complete dashboard data
    return {
      totalProperties,
      totalUnits,
      activeLeases,
      activeMaintenance,
      propertyTrend,
      unitTrend,
      leaseTrend,
      maintenanceTrend
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return fallbackData;
  }
}; 