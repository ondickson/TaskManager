import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function TaskManager({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());

  // Function to add a task
  const saveTask = () => {
    if (title.trim() === '' || description.trim() === '') {
      Alert.alert('Error', 'Title and description are required.');
      return;
    }

    // Navigate to ActiveTasks screen after saving the task
    navigation.navigate('ActiveTasks', {
      task: { title, description, dueDate },
    });

    setTitle('');
    setDescription('');
    setDueDate(new Date());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Manager</Text>
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
      <Button title="Add Task" onPress={saveTask} />
      <Button title="View Active Tasks" onPress={() => navigation.navigate('ActiveTasks')} />
      <Button title="View Completed Tasks" onPress={() => navigation.navigate('CompletedTasks')} />
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
    marginBottom: 10,
  },
});
