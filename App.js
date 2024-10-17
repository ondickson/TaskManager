import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import supabase from './supabaseClient'; // Ensure the path is correct
import { notificationService } from './NotificationService'; 
import * as Notifications from 'expo-notifications';


export default function TaskManager() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Fetch tasks from Supabase on component mount
  useEffect(() => {
    // Configure notification service
    notificationService.configure();

    // Fetch tasks from Supabase on component mount
    const fetchTasks = async () => {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) {
        Alert.alert('Error fetching tasks', error.message);
      } else {
        setTasks(data);
        data.forEach(task => {
          const taskDueDate = new Date(task.due_date);
          scheduleNotification(task.id, task.title, task.description, taskDueDate);
        });
      }
    };

    fetchTasks();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received!', notification);
      Alert.alert(notification.request.content.title, notification.request.content.body);
    });

    return () => subscription.remove();
  }, []);

  // Function to schedule a notification
  const scheduleNotification = (id, title, description, dueDate) => {
    const currentTime = new Date();
    console.log('Scheduling notification for:', title, 'at', dueDate);
  
    if (dueDate > currentTime) {
      notificationService.scheduleNotification(id, title, description, dueDate)
        .then(() => console.log('Notification scheduled:', id))
        .catch(err => console.error('Failed to schedule notification:', err));
    } else {
      console.log('Due date is in the past. Notification not scheduled.');
    }
  };

  // Function to add or update a task
  const saveTask = async () => {
    if (title.trim() === '' || description.trim() === '') {
      Alert.alert('Error', 'Title and description are required.');
      return; // Ensure early return
    }

    // Format dueDate for Supabase (ensure it's in the correct format)
    const formattedDueDate = dueDate.toISOString(); // Convert to ISO string

    const taskData = {
      title,
      description,
      due_date: formattedDueDate,  // Ensure this is in the correct format for Supabase
      is_completed: false, // Or set to the current completed status for editing
    };

    if (editingTaskId) {
      // Update task in Supabase
      const { error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingTaskId);

      if (error) {
        Alert.alert('Error updating task', error.message);
      } else {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === editingTaskId ? { ...task, ...taskData } : task
          )
        );
        setEditingTaskId(null);
      }
    } else {
      // Add new task to Supabase
      const { error } = await supabase
        .from('tasks')
        .insert([{ ...taskData }]);

      if (error) {
        Alert.alert('Error adding task', error.message);
      } else {
        // Add the new task to the state
        const newTaskId = Date.now().toString(); // Generate a unique ID
        setTasks(prevTasks => [
          ...prevTasks,
          {
            id: newTaskId,
            ...taskData,
          },
        ]);
        // Schedule the notification for the new task
        scheduleNotification(newTaskId, title, description, new Date(formattedDueDate)); // Ensure dueDate is a Date object
      }
    }

    // Reset input fields
    setTitle('');
    setDescription('');
    setDueDate(new Date());
  };

  // Function to mark a task as completed
  const toggleCompleteTask = async id => {
    const task = tasks.find(task => task.id === id);
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', id);

    if (error) {
      Alert.alert('Error updating task', error.message);
    } else {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, is_completed: !task.is_completed } : task
        )
      );
    }
  };

  // Function to remove a task
  const removeTask = async id => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      Alert.alert('Error deleting task', error.message);
    } else {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  // Function to edit a task
  const editTask = task => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(new Date(task.due_date)); // Adjusted to use due_date
    setEditingTaskId(task.id);
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity onPress={() => toggleCompleteTask(item.id)}>
        <Text style={item.is_completed ? styles.taskCompleted : styles.taskTitle}>
          {item.title}
        </Text>
      </TouchableOpacity>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <Text style={styles.taskDueDate}>
        Due: {new Date(item.due_date).toLocaleString()} {/* Adjusted to use due_date */}
      </Text>
      <View style={styles.taskActions}>
        <Button title="Edit" onPress={() => editTask(item)} />
        <Button title="Delete" color="#FF3B30" onPress={() => removeTask(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Manager</Text>

      {/* Task Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Task Description"
        value={description}
        onChangeText={setDescription}
      />

      {/* Date Picker */}
      <Button title="Select Due Date" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}

      {/* Time Picker */}
      <Button title="Select Due Time" onPress={() => setShowTimePicker(true)} />
      {showTimePicker && (
        <DateTimePicker
          value={dueDate}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              const currentDate = dueDate;
              currentDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
              setDueDate(currentDate);
            }
          }}
        />
      )}

      <Text style={styles.dueDateText}>
        Due Date and Time: {dueDate.toLocaleString()}
      </Text>

      {/* Add/Update Task Button */}
      <Button
        title={editingTaskId ? 'Update Task' : 'Add Task'}
        onPress={saveTask}
      />

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id.toString()} // Ensure keyExtractor handles id correctly
        style={styles.taskList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  },
  dueDateText: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  taskList: {
    marginTop: 20,
  },
  taskContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 16,
    marginVertical: 5,
  },
  taskDueDate: {
    fontSize: 14,
    color: '#888',
  },
  taskCompleted: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
