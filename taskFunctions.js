import { supabase } from './supabase';

// Function to fetch all tasks
export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
  return data;
}

// Function to add a new task
export async function addTask(title, description, dueDate) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      { title, description, due_date: dueDate, is_completed: false },
    ])
    .select();

  if (error) {
    console.error('Error adding task:', error);
    return null;
  }
  return data[0];
}

// Function to update a task
export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }
  return data[0];
}

// Function to delete a task
export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  return true;
}

// Function to toggle task completion status
export async function toggleTaskCompletion(id, currentStatus) {
  return updateTask(id, { is_completed: !currentStatus });
}