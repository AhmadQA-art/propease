# Updated Implementation Plan

This document outlines the plan to implement the features of adding, displaying, and updating team members on the people page by connecting the frontend and backend and integrating them together.

## View Distinctions

### Team Tab View (Unique Design)
The Team tab requires a specialized card-based layout that differs from other tabs due to its collaborative nature and focus on internal organization members:

- **Card-Based Layout**: Team members are displayed in cards rather than tables, showing:
  - Profile image with online status indicator
  - Name and job title
  - Department and role
  - Quick action buttons

- **Additional Features**:
  - Team-specific tasks view (filtered where `type = 'team'`)
  - Activity feed for team members
  - Team hierarchy visualization
  - Quick filters for departments and roles

## 1. Backend Changes

### API Endpoints

1. **Team Members API**:
```typescript
// Team Members CRUD
GET    /api/team-members           // List all team members
POST   /api/team-members           // Create new team member
GET    /api/team-members/:id       // Get specific team member
PUT    /api/team-members/:id       // Update team member
DELETE /api/team-members/:id       // Remove team member

// Team Activities
GET    /api/team-members/activities  // Get activities from activity_logs where activity_type = 'team'

// Team Tasks
GET    /api/tasks?type=team         // Get tasks where type = 'team'
POST   /api/tasks                   // Create new team task
PUT    /api/tasks/:id               // Update team task
DELETE /api/tasks/:id               // Delete team task
```

## 2. Frontend Changes

### Data Interfaces

```typescript
interface TeamMember {
  id: string;
  user_id: string;
  role_id: string;
  job_title: string;
  department: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  assigned_to: string;
  priority: string;
  status: string;
  type: 'team' | 'maintenance';
  organization_id: string;
}

interface ActivityLog {
  id: string;
  organization_id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
}
```

### Components to Update

1. **`frontend/src/components/team/TeamMemberCard.tsx`**
```typescript
interface TeamMemberCardProps {
  member: TeamMember & {
    user: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
    role: {
      name: string;
      permissions: any;
    };
  };
}
```

2. **`frontend/src/components/team/TasksList.tsx`**
```typescript
interface TasksListProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: string) => void;
  onDelete: (taskId: string) => void;
}
```

3. **`frontend/src/components/team/ActivityFeed.tsx`**
```typescript
interface ActivityFeedProps {
  activities: ActivityLog[];
  limit?: number;
}
```

### State Management

```typescript
interface TeamState {
  members: {
    data: TeamMember[];
    loading: boolean;
    error: string | null;
  };
  tasks: {
    data: Task[];
    loading: boolean;
    error: string | null;
  };
  activities: {
    data: ActivityLog[];
    loading: boolean;
    error: string | null;
  };
}
```

## 3. Implementation Steps

1. **Backend**:
   - Utilize auto-generated APIs for CRUD operations
   - Add filtering for team tasks
   - Implement activity logging system

2. **Frontend**:
   - Implement team member card view
   - Create task management components
   - Implement activity feed
   - Implement proper error handling

### Important Implementation Notes

1. **Data Segregation**
   - Team tab: Query `team_members` table

2. **View Switching**
   - Clear data when switching between tabs
   - Load appropriate data type for each tab
   - Maintain separate filter/sort states for each tab

## Design References from UI Reference Pages

### Base UI Elements (from `frontend/src/pages/UIReference.tsx`)
- Use consistent styling variables:
```typescript
// Colors
text-[#2C3539]  // Primary text
text-[#6B7280]  // Secondary text
hover:bg-[#3d474c] // Hover state

// Common component structure
className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
```

### Team View Implementation
References components from multiple UI reference pages:

1. **Team Member Cards**: Use card layout patterns from `frontend/src/pages/ui-reference/Team.tsx`
   - Profile cards with avatars
   - Role indicators
   - Action buttons

2. **Activities Feed**: Follow patterns from `frontend/src/pages/ui-reference/Activities.tsx`
   - Activity timeline
   - User action tracking
   - Timestamp formatting

3. **Tasks Section**: Implementation from `frontend/src/pages/ui-reference/Tasks.tsx`
   - Task cards
   - Status indicators
   - Assignment information

### Shared Components

1. **Search Bar**
```typescript
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
  <input
    type="text"
    placeholder="Search..."
    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full"
  />
</div>
```

2. **Action Buttons**
```typescript
<button
  className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
>
  <Plus className="w-4 h-4 mr-2" />
  Add New
</button>
```

3. **Status Badges**
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
```

### Important Design Notes

1. **Consistency**
   - Use the same border radius (`rounded-xl`)
   - Maintain consistent spacing (`space-y-8`, `p-6`)
   - Use defined color palette (`#2C3539`, `#6B7280`)

2. **Responsive Design**
   - Card grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
   - Table scroll: `overflow-x-auto` on table container

3. **Interactive Elements**
   - Hover states: `hover:border-[#2C3539] transition-colors`
   - Click effects: `active:bg-gray-50`
   - Loading states: Use skeleton loaders matching component shapes
