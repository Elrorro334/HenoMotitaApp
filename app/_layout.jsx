import { Stack } from 'expo-router';
import { PaperProvider, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { paperTheme, colors, fonts } from '../constants/theme';

function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <MaterialCommunityIcons name="leaf" size={100} color={colors.mainSurface} />
        <Text style={styles.splashTitle}>HenoTrack</Text>
        <Text style={styles.splashSubtitle}>Motita Protector</Text>
        <ActivityIndicator animating={true} color={colors.accentGreen} size="large" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.headerGreen,
        },
        headerTintColor: colors.textOnGreen,
        headerTitleStyle: {
          fontFamily: fonts.display,
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ headerShown: false }} />
      <Stack.Screen 
        name="results" 
        options={{ 
          title: 'Nueva Inspección HenoTrack',
          headerBackTitle: 'Atrás',
          headerStyle: { backgroundColor: colors.headerGreen }, 
          headerTintColor: colors.textOnGreen,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.headerGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    fontFamily: fonts.display,
    fontSize: 42,
    fontWeight: '600',
    color: colors.mainSurface,
    marginTop: 20,
    letterSpacing: -0.96, // -.06em equivalent
  },
  splashSubtitle: {
    fontFamily: fonts.base,
    fontSize: 14,
    color: colors.textOnGreen,
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  }
});

