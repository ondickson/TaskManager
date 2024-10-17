// NotificationService.js
import * as Notifications from 'expo-notifications';

export const notificationService = {
  configure: async () => {
    // Request permissions for notifications
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }
    }

    // Schedule a notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  },

  scheduleNotification: async (id, title, body, dueDate) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: {
        date: dueDate,
      },
    });
  },

  getAllScheduledNotifications: async () => { // Fixed function definition
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', scheduledNotifications);
    return scheduledNotifications; // Optionally return the scheduled notifications
  },
};
