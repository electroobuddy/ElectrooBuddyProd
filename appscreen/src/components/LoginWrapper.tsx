// Login Wrapper Component - Handles authentication flow

import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/LoginScreen";

interface LoginWrapperProps {
  children: React.ReactNode;
}

export default function LoginWrapper({ children }: LoginWrapperProps) {
  const { user, isAdmin, isTechnician, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show login screen if user is not authenticated or not admin/technician
  if (!user || (!isAdmin && !isTechnician)) {
    return <LoginScreen onLogin={() => {}} />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f1a",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
});
