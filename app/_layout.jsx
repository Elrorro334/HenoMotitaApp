import { Stack } from 'expo-router';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32',
    secondary: '#66BB6A',
    error: '#D32F2F',
    background: '#F5F5F0',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ title: 'Evaluación de Daño', headerStyle: { backgroundColor: '#2E7D32' }, headerTintColor: '#fff' }} />
      </Stack>
    </PaperProvider>
  );
}
