import { Stack } from 'expo-router';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';

// HenoTrack Design System Color Tokens from Prototipo Web Heno_Motita
const theme = {
  ...DefaultTheme,
  roundness: 16,
  colors: {
    ...DefaultTheme.colors,
    primary: '#176B52', // Verde HenoTrack
    primaryContainer: '#EDF6F1',
    secondary: '#70AA46',
    secondaryContainer: '#DCECE4',
    error: '#C75B52',
    errorContainer: '#FFF0EE',
    warning: '#D99A28',
    warningContainer: '#FFF5DF',
    background: '#F4F8F5',
    surface: '#FFFFFF',
    surfaceVariant: '#EDF6F1',
    onPrimary: '#FFFFFF',
    onSurface: '#163029',
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#103F32', // Dark Emerald HenoTrack
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '800',
              fontSize: 18,
            },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: '#F4F8F5' },
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
              headerStyle: { backgroundColor: '#103F32' }, 
              headerTintColor: '#FFFFFF',
            }} 
          />
        </Stack>
      </PaperProvider>
    </AuthProvider>
  );
}
