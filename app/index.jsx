import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { activateStudent } from '../services/api';

export default function LoginScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'activate'
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Activation fields
  const [activationCode, setActivationCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [activateLoading, setActivateLoading] = useState(false);

  const router = useRouter();
  const { loginUser } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setLoginError('');
    setLoginLoading(true);

    try {
      await loginUser(email.trim(), password);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('HenoTrack login error:', error);
      setLoginError(error.message || 'Credenciales incorrectas o servidor no disponible.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!activationCode.trim() || !email.trim() || !password || !studentName.trim()) {
      Alert.alert('Datos Incompletos', 'Por favor llena todos los campos obligatorios para activar tu cuenta de alumno.');
      return;
    }

    setActivateLoading(true);
    try {
      await activateStudent({
        activationCode: activationCode.trim(),
        email: email.trim(),
        password,
        name: studentName.trim(),
        enrollment: enrollment.trim(),
      });

      Alert.alert(
        '¡Cuenta Activada!',
        'Tu cuenta de alumno ha sido registrada exitosamente en HenoTrack. Ahora puedes iniciar sesión.',
        [{ text: 'Iniciar Sesión', onPress: () => setMode('login') }]
      );
    } catch (error) {
      Alert.alert('Error de Activación', error.message || 'Código de cuadrilla inválido o ya utilizado.');
    } finally {
      setActivateLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: '#F4F8F5' }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HenoTrack Branding Header */}
        <View style={styles.headerBlock}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={38} color="#FFFFFF" />
          </View>
          <Text variant="labelLarge" style={styles.institutionCode}>UTTT • VALLE DEL MEZQUITAL</Text>
          <Text variant="headlineLarge" style={styles.title}>
            HenoTrack <Text style={{ color: '#176B52' }}>IA</Text>
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Monitoreo Ambiental del Heno Motita en Árboles
          </Text>
        </View>

        {/* Tab Toggle between Login and Student Activation */}
        <View style={styles.tabToggleRow}>
          <Button
            mode={mode === 'login' ? 'contained' : 'outlined'}
            onPress={() => setMode('login')}
            buttonColor={mode === 'login' ? '#176B52' : undefined}
            textColor={mode === 'login' ? '#FFFFFF' : '#176B52'}
            style={styles.tabButton}
            compact
          >
            Iniciar Sesión
          </Button>
          <Button
            mode={mode === 'activate' ? 'contained' : 'outlined'}
            onPress={() => setMode('activate')}
            buttonColor={mode === 'activate' ? '#176B52' : undefined}
            textColor={mode === 'activate' ? '#FFFFFF' : '#176B52'}
            style={styles.tabButton}
            compact
          >
            Activar Alumno
          </Button>
        </View>

        {/* Form Card */}
        <View style={styles.cardForm}>
          {mode === 'login' ? (
            <>
              <Text style={styles.formLegend}>Acceso a Plataforma HenoTrack</Text>

              {loginError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color="#C75B52" style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{loginError}</Text>
                </View>
              ) : null}

              <TextInput
                label="Correo Institucional"
                placeholder="alumno@uttt.edu.mx"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                outlineStyle={styles.inputOutline}
                style={styles.input}
                activeOutlineColor="#176B52"
                left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={20} color="#687A74" />} />}
              />

              <TextInput
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                outlineStyle={styles.inputOutline}
                style={styles.input}
                activeOutlineColor="#176B52"
                left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color="#687A74" />} />}
              />

              <Button 
                mode="contained" 
                onPress={handleLogin} 
                loading={loginLoading}
                disabled={loginLoading || !email.trim() || !password}
                buttonColor="#176B52"
                style={styles.button}
                labelStyle={styles.buttonLabel}
                contentStyle={{ paddingVertical: 8 }}
                icon={() => <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />}
              >
                Ingresar a Servidor HenoTrack
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.formLegend}>Registro / Activación de Alumno</Text>

              <TextInput
                label="Código de Activación de Cuadrilla *"
                placeholder="Ingresa código proporcionado por el encargado"
                value={activationCode}
                onChangeText={setActivationCode}
                mode="outlined"
                autoCapitalize="characters"
                outlineStyle={styles.inputOutline}
                style={styles.input}
                activeOutlineColor="#176B52"
                left={<TextInput.Icon icon={() => <Ionicons name="key-outline" size={20} color="#687A74" />} />}
              />

              <TextInput
                label="Nombre Completo del Alumno *"
                placeholder="Nombre(s) y Apellidos"
                value={studentName}
                onChangeText={setStudentName}
                mode="outlined"
                outlineStyle={styles.inputOutline}
                style={styles.input}
                activeOutlineColor="#176B52"
                left={<TextInput.Icon icon={() => <Ionicons name="person-outline" size={20} color="#687A74" />} />}
              />

              <TextInput
                label="Matrícula *"
                placeholder="Matrícula institucional UTTT"
                value={enrollment}
                onChangeText={setEnrollment}
                mode="outlined"
                outlineStyle={styles.inputOutline}
                style={styles.input}
                activeOutlineColor="#176B52"
                left={<TextInput.Icon icon={() => <Ionicons name="card-outline" size={20} color="#687A74" />} />}
              />

              <TextInput
                label="Correo Institucional *"
                placeholder="correo@uttt.edu.mx"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                outlineStyle={styles.inputOutline}
                style={styles.input}
                activeOutlineColor="#176B52"
                left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={20} color="#687A74" />} />}
              />

              <TextInput
                label="Contraseña *"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                outlineStyle={styles.inputOutline}
                style={styles.input}
                activeOutlineColor="#176B52"
                left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color="#687A74" />} />}
              />

              <Button 
                mode="contained" 
                onPress={handleActivate} 
                loading={activateLoading}
                disabled={activateLoading || !activationCode.trim()}
                buttonColor="#176B52"
                style={styles.button}
                labelStyle={styles.buttonLabel}
                contentStyle={{ paddingVertical: 8 }}
                icon={() => <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />}
              >
                Activar Mi Cuenta de Alumno
              </Button>
            </>
          )}

          <View style={styles.hintContainer}>
            <Ionicons name="cloud-done-outline" size={16} color="#176B52" style={{ marginRight: 6 }} />
            <Text style={styles.demoHint}>
              Conectado a la API: https://heno-motita.onrender.com
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#176B52',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#103F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  institutionCode: {
    color: '#687A74',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: 4,
  },
  title: {
    fontWeight: '900',
    textAlign: 'center',
    color: '#163029',
    fontSize: 32,
  },
  subtitle: {
    textAlign: 'center',
    color: '#687A74',
    fontWeight: '600',
    marginTop: 4,
  },
  tabToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tabButton: {
    borderRadius: 20,
  },
  cardForm: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#103F32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#DCE7E1',
  },
  formLegend: {
    fontSize: 15,
    fontWeight: '800',
    color: '#163029',
    marginBottom: 18,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FFF0EE',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#C75B52',
  },
  errorText: {
    color: '#C75B52',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#F4F8F5',
    fontSize: 14,
  },
  inputOutline: {
    borderRadius: 14,
    borderColor: '#DCE7E1',
  },
  button: {
    borderRadius: 14,
    marginTop: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  demoHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#687A74',
    fontWeight: '500',
  },
});
