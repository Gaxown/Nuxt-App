<template>
  <div class="task-board">
    <div class="columns-container">
      <div v-for="column in columns" :key="column.id" class="column">
        <div class="column-header">
          <h3 class="column-title">{{ column.title }}</h3>
          <span class="task-count">{{
            getTasksForColumn(column.id).length
          }}</span>
        </div>

        <div
          class="task-list"
          :class="{ 'drop-active': activeDropZone === column.id }"
          @dragover.prevent="handleDragOver($event, column.id)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, column.id)"
          :data-column-id="column.id"
        >
          <TransitionGroup name="task-move" tag="div" class="task-list-inner">
            <div
              v-for="task in getTasksForColumn(column.id)"
              :key="task.id"
              class="task-item"
              :class="{ 'is-dragging': draggedTask?.id === task.id }"
              draggable="true"
              @dragstart="handleDragStart($event, task, column.id)"
              @dragend="handleDragEnd"
              @touchstart="handleTouchStart($event, task, column.id)"
              @click="editTask(task)"
            >
              <div class="task-content">
                <slot name="task" :task="task" :column="column">
                  <div class="task-header">
                    <h4 class="task-title">{{ task.title }}</h4>
                    <button
                      v-if="editable"
                      class="task-delete-btn"
                      @click.stop="deleteTask(task.id)"
                      aria-label="Delete task"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="icon"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  <p v-if="task.description" class="task-description">
                    {{ task.description }}
                  </p>
                  <div v-if="task.tags && task.tags.length" class="task-tags">
                    <span
                      v-for="tag in task.tags"
                      :key="tag"
                      class="task-tag"
                      :style="{ backgroundColor: getTagColor(tag) }"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </slot>
              </div>
            </div>
          </TransitionGroup>

          <div
            v-if="getTasksForColumn(column.id).length === 0"
            class="empty-column"
          >
            <p>No tasks</p>
          </div>

          <button
            v-if="editable"
            class="add-task-btn"
            @click="addNewTask(column.id)"
            aria-label="Add new task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon"
            >
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            Add Task
          </button>
        </div>
      </div>

      <button
        v-if="editable && canAddColumns"
        class="add-column-btn"
        @click="addNewColumn"
        aria-label="Add new column"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon"
        >
          <path d="M12 5v14"></path>
          <path d="M5 12h14"></path>
        </svg>
        Add Column
      </button>
    </div>

    <!-- Task Edit Modal -->
    <Teleport to="body">
      <div v-if="editingTask" class="modal-backdrop" @click="closeTaskModal">
        <div class="modal-content" @click.stop>
          <h3>{{ isNewTask ? "Add Task" : "Edit Task" }}</h3>
          <div class="form-group">
            <label for="task-title">Title</label>
            <input
              id="task-title"
              v-model="editingTask.title"
              class="form-input"
              placeholder="Task title"
              ref="titleInput"
            />
          </div>
          <div class="form-group">
            <label for="task-description">Description</label>
            <textarea
              id="task-description"
              v-model="editingTask.description"
              class="form-textarea"
              placeholder="Task description"
            ></textarea>
          </div>
          <div class="form-group" v-if="enableTags">
            <label for="task-tags">Tags (comma separated)</label>
            <input
              id="task-tags"
              v-model="taskTagsInput"
              class="form-input"
              placeholder="Enter tags separated by commas"
            />
          </div>
          <div class="form-actions">
            <button class="btn btn-cancel" @click="closeTaskModal">
              Cancel
            </button>
            <button class="btn btn-save" @click="saveTask">Save</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { defineProps, defineEmits, withDefaults } from "vue";

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  tags?: string[];
}

interface Column {
  id: string;
  title: string;
  order: number;
}

// Props
interface Props {
  initialTasks?: Task[];
  initialColumns?: Column[];
  storageKey?: string;
  editable?: boolean;
  canAddColumns?: boolean;
  enableTags?: boolean;
  maxColumns?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialTasks: () => [],
  initialColumns: () => [
    { id: "todo", title: "To Do", order: 0 },
    { id: "inprogress", title: "In Progress", order: 1 },
    { id: "done", title: "Done", order: 2 },
  ],
  storageKey: "vue-task-board",
  editable: true,
  canAddColumns: true,
  enableTags: true,
  maxColumns: 10,
});

// Emits
const emit = defineEmits<{
  (e: "update:tasks", tasks: Task[]): void;
  (e: "update:columns", columns: Column[]): void;
  (e: "task-moved", task: Task, fromColumnId: string, toColumnId: string): void;
  (e: "task-added", task: Task): void;
  (e: "task-updated", task: Task): void;
  (e: "task-deleted", taskId: string): void;
  (e: "column-added", column: Column): void;
}>();

// State
const columns = useStorage<Column[]>(`${props.storageKey}-columns`, [
  ...props.initialColumns,
]);
const tasks = useStorage<Task[]>(`${props.storageKey}-tasks`, [
  ...props.initialTasks,
]);

const draggedTask = ref<Task | null>(null);
const sourceColumnId = ref<string | null>(null);
const activeDropZone = ref<string | null>(null);
const editingTask = ref<Task | null>(null);
const isNewTask = ref(false);
const taskTagsInput = ref("");
const titleInput = ref<HTMLInputElement | null>(null);

// Computed
const getTasksForColumn = (columnId: string) => {
  return tasks.value
    .filter((task) => task.columnId === columnId)
    .sort((a, b) => a.order - b.order);
};

// Tag colors - generate consistent colors based on tag name
const getTagColor = (tag: string) => {
  // Simple hash function to generate a color
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to HSL with fixed saturation and lightness for readability
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 65%)`;
};

// Methods
const handleDragStart = (event: DragEvent, task: Task, columnId: string) => {
  if (!event.dataTransfer) return;

  draggedTask.value = task;
  sourceColumnId.value = columnId;

  // Set data for drag operation
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", task.id);

  // Add a delay to apply the dragging class for visual effect
  setTimeout(() => {
    if (event.target instanceof HTMLElement) {
      event.target.classList.add("is-dragging");
    }
  }, 0);
};

const handleDragOver = (event: DragEvent, columnId: string) => {
  if (!event.dataTransfer) return;

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  activeDropZone.value = columnId;
};

const handleDragLeave = () => {
  activeDropZone.value = null;
};

const handleDragEnd = () => {
  draggedTask.value = null;
  sourceColumnId.value = null;
  activeDropZone.value = null;
};

const handleDrop = (event: DragEvent, targetColumnId: string) => {
  event.preventDefault();

  if (!draggedTask.value || !sourceColumnId.value) return;

  const taskId = event.dataTransfer?.getData("text/plain");
  if (!taskId) return;

  // Find the task and update its column
  const taskIndex = tasks.value.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return;

  const fromColumnId = tasks.value[taskIndex].columnId;

  // Update task's column and order
  tasks.value[taskIndex].columnId = targetColumnId;

  // Reorder tasks in the target column
  const tasksInTargetColumn = getTasksForColumn(targetColumnId);
  for (let i = 0; i < tasksInTargetColumn.length; i++) {
    tasksInTargetColumn[i].order = i;
  }

  // Reset drag state
  handleDragEnd();

  // Emit update events
  emit("update:tasks", [...tasks.value]);
  emit("task-moved", tasks.value[taskIndex], fromColumnId, targetColumnId);
};

// Touch support for mobile
const handleTouchStart = (event: TouchEvent, task: Task, columnId: string) => {
  // This is a simplified implementation
  // For a full touch implementation, you would need to track touch move events
  // and implement custom drag logic
  draggedTask.value = task;
  sourceColumnId.value = columnId;
};

// Task editing
const addNewTask = (columnId: string) => {
  const tasksInColumn = getTasksForColumn(columnId);
  const newOrder = tasksInColumn.length;

  editingTask.value = {
    id: uuidv4(),
    title: "",
    description: "",
    columnId,
    order: newOrder,
    tags: [],
  };

  isNewTask.value = true;
  taskTagsInput.value = "";

  // Focus the title input on next tick
  nextTick(() => {
    if (titleInput.value) {
      titleInput.value.focus();
    }
  });
};

const editTask = (task: Task) => {
  if (!props.editable) return;

  editingTask.value = { ...task };
  isNewTask.value = false;
  taskTagsInput.value = task.tags?.join(", ") || "";

  // Focus the title input on next tick
  nextTick(() => {
    if (titleInput.value) {
      titleInput.value.focus();
    }
  });
};

const saveTask = () => {
  if (!editingTask.value || !editingTask.value.title.trim()) {
    return;
  }

  // Process tags if enabled
  if (props.enableTags) {
    editingTask.value.tags = taskTagsInput.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  if (isNewTask.value) {
    // Add new task
    tasks.value.push(editingTask.value);
    emit("task-added", editingTask.value);
  } else {
    // Update existing task
    const index = tasks.value.findIndex((t) => t.id === editingTask.value!.id);
    if (index !== -1) {
      tasks.value[index] = editingTask.value;
      emit("task-updated", editingTask.value);
    }
  }

  emit("update:tasks", [...tasks.value]);
  closeTaskModal();
};

const closeTaskModal = () => {
  editingTask.value = null;
};

const deleteTask = (taskId: string) => {
  const index = tasks.value.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks.value.splice(index, 1);
    emit("update:tasks", [...tasks.value]);
    emit("task-deleted", taskId);
  }
};

// Column management
const addNewColumn = () => {
  if (columns.value.length >= props.maxColumns) return;

  const newColumn: Column = {
    id: uuidv4(),
    title: `Column ${columns.value.length + 1}`,
    order: columns.value.length,
  };

  columns.value.push(newColumn);
  emit("update:columns", [...columns.value]);
  emit("column-added", newColumn);
};

// Watch for prop changes
watch(
  () => props.initialTasks,
  (newTasks) => {
    if (newTasks.length > 0) {
      tasks.value = [...newTasks];
    }
  },
  { deep: true }
);

watch(
  () => props.initialColumns,
  (newColumns) => {
    if (newColumns.length > 0) {
      columns.value = [...newColumns];
    }
  },
  { deep: true }
);

// Lifecycle hooks
onMounted(() => {
  // Emit initial state
  emit("update:tasks", tasks.value);
  emit("update:columns", columns.value);
});
</script>

<style scoped>
.task-board {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    sans-serif;
}

.columns-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem;
  min-height: 300px;
  width: 100%;
}

.column {
  display: flex;
  flex-direction: column;
  min-width: 280px;
  width: 280px;
  background-color: #f1f5f9;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.column-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #334155;
}

.task-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  height: 1.5rem;
  min-width: 1.5rem;
  padding: 0 0.5rem;
  border-radius: 9999px;
}

.task-list {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: background-color 0.15s ease;
}

.task-list.drop-active {
  background-color: #e2e8f0;
}

.task-list-inner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  background-color: white;
  border-radius: 0.375rem;
  padding: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: grab;
  user-select: none;
  transition: all 0.15s ease-in-out;
  border: 1px solid #e2e8f0;
}

.task-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.task-item.is-dragging {
  opacity: 0.5;
  transform: scale(1.05);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.task-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  word-break: break-word;
}

.task-description {
  margin: 0.5rem 0;
  font-size: 0.75rem;
  color: #64748b;
  word-break: break-word;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.task-tag {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  color: #1e293b;
  font-weight: 500;
}

.task-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.task-delete-btn:hover {
  color: #ef4444;
}

.empty-column {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #94a3b8;
  font-size: 0.875rem;
  border: 2px dashed #e2e8f0;
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;
}

.add-task-btn,
.add-column-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: transparent;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-top: auto;
}

.add-task-btn:hover,
.add-column-btn:hover {
  background-color: #f8fafc;
  color: #334155;
}

.add-column-btn {
  min-width: 200px;
  height: 100px;
  align-self: flex-start;
  margin-top: 2.5rem;
}

.icon {
  flex-shrink: 0;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel {
  background-color: white;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.btn-cancel:hover {
  background-color: #f8fafc;
  color: #334155;
}

.btn-save {
  background-color: #3b82f6;
  color: white;
  border: 1px solid transparent;
}

.btn-save:hover {
  background-color: #2563eb;
}

/* Transition animations */
.task-move {
  transition: transform 0.3s ease;
}
</style>
