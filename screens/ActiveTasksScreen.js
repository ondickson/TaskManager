import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';

export default function ActiveTasksScreen({ route, navigation }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Get the task passed from TaskManager
    if (route.params?.task) {
      setTasks(prevTasks => [...prevTasks, route.params.task]);
    }
  }, [route.params?.task]);

  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <Text style={styles.taskDueDate}>
        Due: {new Date(item.dueDate).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Tasks</Text>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item, index) => index.toString()}
      />
      <Button title="Go to Completed Tasks" onPress={() => navigation.navigate('CompletedTasks')} />
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
  taskContainer: {
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
});
