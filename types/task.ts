export interface Task {
  id: string | number;
  title: string;
  description: string;
  status: string;
  order?: number;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface TaskBoardProps {
  columns: Column[];
  loading?: boolean;
  error?: string | null;
  editable?: boolean;
  theme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
}

export interface DragState {
  source: {
    columnId: string;
    taskId: string | number;
    index: number;
  } | null;
  target: {
    columnId: string;
    index: number;
  } | null;
}

export type TaskMoveEvent = {
  taskId: string | number;
  fromColumnId: string;
  toColumnId: string;
  newIndex: number;
};

export type TaskUpdateEvent = {
  task: Task;
  columnId: string;
};