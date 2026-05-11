import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import BookingDetailsScreen from './src/screens/BookingDetailsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// Services
import { notificationService } from './src/services/NotificationService';

// ============ CONFIGURATION ============
const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID'; // Replace with your OneSignal App ID
const ADMIN_USER_ID = '78a311b1-168c-4676-b1c1-c6445fefd201'; // Replace with your admin user ID

// ============ TYPES ============
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  BookingDetails: { booking: any };
  Notifications: undefined;
};

// ============ NAVIGATION ============
const Stack = createNativeStackNavigator<RootStackParamList>();

// ============ HEADER COMPONENT ============
function HeaderRight({ navigation }: { navigation: any }) {
  return (
    <View style={headerStyles.container}>
      <TouchableOpacity
        style={headerStyles.iconButton}
        onPress={() => navigation.navigate('Notifications')}
      >
        <Text style={headerStyles.icon}>🔔</Text>
      </TouchableOpacity>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    fontSize: 22,
  },
});

// ============ APP ============
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn && !initialized) {
      initApp();
    }
  }, [isLoggedIn]);

  const checkAuth = async () => {
    try {
      const adminId = await AsyncStorage.getItem('admin_id');
      if (adminId) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const initApp = async () => {
    try {
      // Initialize notification services
      await notificationService.initialize();
      setInitialized(true);
    } catch (error) {
      console.error('App initialization error:', error);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('admin_id');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#2563eb',
            background: '#0f0f1a',
            card: '#1a1a2e',
            text: '#ffffff',
            border: '#374151',
            notification: '#ef4444',
          },
        }}
      >
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackTitleVisible: false,
          }}
        >
          {!isLoggedIn ? (
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
            >
              {() => <LoginScreen onLogin={handleLogin} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="Dashboard"
                options={({ navigation }) => ({
                  title: '📋 Bookings',
                  headerRight: () => <HeaderRight navigation={navigation} />,
                })}
              >
                {(props) => <DashboardScreen {...props} />}
              </Stack.Screen>
              <Stack.Screen
                name="BookingDetails"
                options={{ title: '📄 Booking Details' }}
              >
                {(props) => <BookingDetailsScreen {...props} />}
              </Stack.Screen>
              <Stack.Screen
                name="Notifications"
                options={{ title: '🔔 Notifications' }}
              >
                {() => <NotificationsScreen />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});
