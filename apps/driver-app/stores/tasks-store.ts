'use client';

import { create } from 'zustand';
import {
  fetchDeliveryTask,
  fetchDeliveryTasks,
  type DeliveryTask,
  type DeliveryTaskDetails,
} from '@/lib/api';
import type { TaskFilterTab } from '@/lib/delivery-status';

type TasksState = {
  tasks: DeliveryTask[];
  filter: TaskFilterTab;
  loading: boolean;
  error: string | null;
  loadTasks: () => Promise<void>;
  setFilter: (filter: TaskFilterTab) => void;
  upsertTask: (task: DeliveryTask) => void;
  removeTask: (taskId: string) => void;
  getFilteredTasks: () => DeliveryTask[];
};

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  filter: 'all',
  loading: false,
  error: null,

  setFilter: (filter) => set({ filter }),

  loadTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await fetchDeliveryTasks();
      set({ tasks, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load tasks',
      });
    }
  },

  upsertTask: (task) => {
    set((state) => {
      const index = state.tasks.findIndex((t) => t.id === task.id);
      if (index === -1) {
        return { tasks: [task, ...state.tasks] };
      }
      const tasks = [...state.tasks];
      tasks[index] = task;
      return { tasks };
    });
  },

  removeTask: (taskId) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) }));
  },

  getFilteredTasks: () => {
    const { tasks, filter } = get();
    if (filter === 'all') return tasks;
    return tasks.filter((t) => t.status === filter);
  },
}));

export async function loadTaskDetails(taskId: string): Promise<DeliveryTaskDetails> {
  return fetchDeliveryTask(taskId);
}
