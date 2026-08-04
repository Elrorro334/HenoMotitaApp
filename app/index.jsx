import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, Linking, TouchableOpacity, Dimensions } from 'react-native';
import { TextInput, Button, Text, Card, Chip, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { activateStudent } from '../services/api';
import { getRandomPhrase } from '../services/timePhrases';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [showInfo, setShowInfo] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0); // 0 | 1 | 2
  const [mode, setMode] = useState('login'); // 'login' | 'activate'
  const [preLoginPhrase, setPreLoginPhrase] = useState('');
  
  useEffect(() => {
    setPreLoginPhrase(getRandomPhrase('pre-login'));
  }, []);

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
      setLoginError(error.message || 'Contrasena incorrecta o cuenta no registrada.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!activationCode.trim() || !email.trim() || !password || !studentName.trim()) {
      Alert.alert('Datos Incompletos', 'Por favor llena todos los campos obligatorios para activar tu cuenta.');
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
        'Cuenta Activada',
        'Tu cuenta ha sido registrada exitosamente. Ya puedes iniciar sesion.',
        [{ text: 'Entendido', onPress: () => setMode('login') }]
      );
    } catch (error) {
      Alert.alert('Error de Activación', error.message || 'Codigo de activacion invalido o ya utilizado.');
    } finally {
      setActivateLoading(false);
    }
  };

  const openMoreInfo = () => {
    Linking.openURL('http://www.henomotita.mx/').catch((err) =>
      Alert.alert('Error', 'No se pudo abrir el enlace: ' + err.message)
    );
  };

  const nextSlide = () => {
    if (slideIndex < 2) {
      setSlideIndex(slideIndex + 1);
    } else {
      setShowInfo(false);
    }
  };

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  if (showInfo) {
    return (
      <View style={styles.infoWrapper}>
        {/* Top Gamification Progress Indicator */}
        <View style={styles.progressBarWrapper}>
          <ProgressBar progress={(slideIndex + 1) / 3} color="#176B52" style={styles.progressBar} />
          <View style={styles.slideCounterRow}>
            <Text style={styles.slideCounterText}>Paso {slideIndex + 1} de 3</Text>
            <View style={styles.dotsRow}>
              {[0, 1, 2].map((idx) => (
                <View 
                  key={idx} 
                  style={[
                    styles.dot, 
                    idx === slideIndex ? styles.activeDot : styles.inactiveDot
                  ]} 
                />
              ))}
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.infoScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoContainer}>
            
            {/* Slide 0: What is it? */}
            {slideIndex === 0 && (
              <View style={styles.slideContent}>
                <View style={styles.infoHeader}>
                  <View style={styles.infoIconCircle}>
                    <MaterialCommunityIcons name="dna" size={40} color="#FFFFFF" />
                  </View>
                  <Text variant="headlineMedium" style={styles.infoTitle}>Conoce al Heno Motita</Text>
                  <Text variant="bodyMedium" style={styles.infoSubtitle}>
                    Identificacion y características biológicas básicas
                  </Text>
                </View>

                <View style={styles.badgeRow}>
                  <Chip style={styles.infoChip} textStyle={styles.infoChipText}>
                    Tillandsia recurvata
                  </Chip>
                  <Chip style={styles.infoChip} textStyle={styles.infoChipText}>
                    Planta epifita aerea
                  </Chip>
                </View>

                <Image
                  source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpEIsmlNJPokb8Zil3THhewQYfmoaAlmeeA83-TZ2RiSJayc7KEi6ijn8&s=10' }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />

                <Card style={styles.infoCard}>
                  <Card.Content>
                    <Text style={styles.cardHeader}>Que es?</Text>
                    <Text style={styles.cardBody}>
                      Es una pequeña planta grisácea que vive sobre las ramas de los árboles y cables públicos. Aunque no es un parásito y no absorbe la savia del árbol, se comporta como una plaga peligrosa cuando se multiplica sin control.
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            )}

            {/* Slide 1: The Threat */}
            {slideIndex === 1 && (
              <View style={styles.slideContent}>
                <View style={styles.infoHeader}>
                  <View style={[styles.infoIconCircle, { backgroundColor: '#C75B52' }]}>
                    <Ionicons name="alert-circle" size={40} color="#FFFFFF" />
                  </View>
                  <Text variant="headlineMedium" style={[styles.infoTitle, { color: '#C75B52' }]}>El Peligro Latente</Text>
                  <Text variant="bodyMedium" style={styles.infoSubtitle}>
                    Por que representa una amenaza letal para los arboles
                  </Text>
                </View>

                <Image
                  source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjjwCR90zb1Ju2jP8BplzAINJ8x-h7EoIKIv1YqCjcTQ&s=10' }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />

                <Card style={[styles.infoCard, styles.dangerCard]}>
                  <Card.Content>
                    <Text style={[styles.cardHeader, { color: '#C75B52' }]}>Por que es un peligro?</Text>
                    
                    <View style={styles.bulletRow}>
                      <Ionicons name="close-circle" size={20} color="#C75B52" style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Bloquea el sol</Text>
                        <Text style={styles.cardBody}>Cubre por completo las hojas, impidiendo la fotosíntesis del árbol.</Text>
                      </View>
                    </View>

                    <View style={styles.bulletRow}>
                      <Ionicons name="close-circle" size={20} color="#C75B52" style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Seca las ramas</Text>
                        <Text style={styles.cardBody}>Al no recibir luz ni aire, las ramas se debilitan, se secan y mueren.</Text>
                      </View>
                    </View>

                    <View style={styles.bulletRow}>
                      <Ionicons name="close-circle" size={20} color="#C75B52" style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Se contagia rápido</Text>
                        <Text style={styles.cardBody}>El viento transporta sus semillas flotantes con mucha facilidad hacia otros árboles sanos.</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            )}

            {/* Slide 2: Solutions */}
            {slideIndex === 2 && (
              <View style={styles.slideContent}>
                <View style={styles.infoHeader}>
                  <View style={[styles.infoIconCircle, { backgroundColor: '#176B52' }]}>
                    <Ionicons name="checkmark-circle" size={40} color="#FFFFFF" />
                  </View>
                  <Text variant="headlineMedium" style={[styles.infoTitle, { color: '#176B52' }]}>Solucion Activa</Text>
                  <Text variant="bodyMedium" style={styles.infoSubtitle}>
                    Metodos eficientes para erradicar y prevenir la plaga
                  </Text>
                </View>

                <Card style={[styles.infoCard, styles.solutionCard]}>
                  <Card.Content>
                    <Text style={[styles.cardHeader, { color: '#176B52' }]}>Como solucionarlo?</Text>

                    <View style={styles.bulletRow}>
                      <Ionicons name="checkmark-circle" size={20} color="#176B52" style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Limpieza manual</Text>
                        <Text style={styles.cardBody}>Despréndela con cuidado de las ramas usando tus manos o varas largas.</Text>
                      </View>
                    </View>

                    <View style={styles.bulletRow}>
                      <Ionicons name="checkmark-circle" size={20} color="#176B52" style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Desecho seguro</Text>
                        <Text style={styles.cardBody}>Guarda los restos en bolsas cerradas para que el viento no disperse sus semillas.</Text>
                      </View>
                    </View>

                    <View style={styles.bulletRow}>
                      <Ionicons name="checkmark-circle" size={20} color="#176B52" style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Remedio casero</Text>
                        <Text style={styles.cardBody}>Fumiga la zona limpia con agua y bicarbonato de sodio para evitar que regrese.</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>

                {/* Saber Más Link */}
                <TouchableOpacity onPress={openMoreInfo} style={styles.linkContainer}>
                  <Ionicons name="globe-outline" size={20} color="#176B52" />
                  <Text style={styles.linkText}>Saber mas en henomotita.mx</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>

        {/* Footer Navigation Buttons */}
        <View style={styles.navigationFooter}>
          {slideIndex > 0 ? (
            <Button
              mode="outlined"
              onPress={prevSlide}
              textColor="#176B52"
              style={styles.navButton}
              icon={() => <Ionicons name="arrow-back" size={18} color="#176B52" />}
            >
              Atras
            </Button>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <Button
            mode="contained"
            onPress={nextSlide}
            buttonColor="#176B52"
            textColor="#FFFFFF"
            style={styles.navButton}
            contentStyle={{ flexDirection: 'row-reverse' }}
            icon={() => <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          >
            {slideIndex === 2 ? 'Comenzar' : 'Siguiente'}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: '#F4F8F5' }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Modern Elegant Header */}
        <View style={styles.headerBlock}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.institutionCode}>UTTT • VALLE DEL MEZQUITAL</Text>
          <Text style={styles.title}>HenoTrack</Text>
          <Text style={styles.subtitle}>Monitoreo y Conservacion Ambiental</Text>
        </View>

        {/* Custom Segmented Pill Tab Toggle */}
        <View style={styles.segmentedToggleContainer}>
          <TouchableOpacity 
            style={[styles.segmentedTab, mode === 'login' && styles.segmentedTabActive]} 
            onPress={() => setMode('login')}
          >
            <Text style={[styles.segmentedTabText, mode === 'login' && styles.segmentedTabTextActive]}>
              Iniciar Sesion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentedTab, mode === 'activate' && styles.segmentedTabActive]} 
            onPress={() => setMode('activate')}
          >
            <Text style={[styles.segmentedTabText, mode === 'activate' && styles.segmentedTabTextActive]}>
              Activar Cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Premium Form Card */}
        <View style={styles.cardForm}>
          {preLoginPhrase ? (
            <View style={styles.phraseBubble}>
              <Ionicons name="sunny-outline" size={16} color="#176B52" style={{ marginRight: 6 }} />
              <Text style={styles.phraseText}>{preLoginPhrase}</Text>
            </View>
          ) : null}

          {mode === 'login' ? (

            <>
              <Text style={styles.formLegend}>Te damos la bienvenida</Text>

              {loginError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color="#C75B52" style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{loginError}</Text>
                </View>
              ) : null}

              <TextInput
                label="Correo Institucional"
                placeholder="usuario@uttt.edu.mx"
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
                placeholder="Tu contrasena"
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
                contentStyle={{ paddingVertical: 10 }}
                icon={() => <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />}
              >
                Iniciar Sesion
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.formLegend}>Registro de Estudiante</Text>

              <TextInput
                label="Codigo de Activacion *"
                placeholder="Codigo entregado por tu encargado"
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
                label="Nombre Completo *"
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
                label="Matricula *"
                placeholder="Tu matricula institucional"
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
                placeholder="Crea una contrasena"
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
                contentStyle={{ paddingVertical: 10 }}
                icon={() => <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />}
              >
                Activar Cuenta
              </Button>
            </>
          )}

          {/* Quick link back to info onboarding */}
          <TouchableOpacity 
            onPress={() => { setShowInfo(true); setSlideIndex(0); }} 
            style={styles.backInfoBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={18} color="#176B52" style={{ marginRight: 6 }} />
            <Text style={styles.backInfoText}>Ver informacion del Heno Motita</Text>
          </TouchableOpacity>
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
    paddingVertical: 40,
    alignItems: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#176B52',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#103F32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  institutionCode: {
    color: '#687A74',
    fontWeight: '800',
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: 6,
  },
  title: {
    fontWeight: '900',
    textAlign: 'center',
    color: '#163029',
    fontSize: 34,
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: 'center',
    color: '#687A74',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 4,
  },
  segmentedToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2ECE7',
    borderRadius: 30,
    padding: 4,
    width: '100%',
    maxWidth: 380,
    marginBottom: 20,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 26,
  },
  segmentedTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#103F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#687A74',
  },
  segmentedTabTextActive: {
    color: '#176B52',
    fontWeight: '800',
  },
  cardForm: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#103F32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2EBE6',
  },
  formLegend: {
    fontSize: 18,
    fontWeight: '800',
    color: '#163029',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FFF0EE',
    padding: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#C75B52',
  },
  errorText: {
    color: '#C75B52',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#F7FAF8',
    fontSize: 14,
  },
  inputOutline: {
    borderRadius: 14,
    borderColor: '#E2EBE6',
  },
  button: {
    borderRadius: 14,
    marginTop: 10,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Interactive Onboarding Layout
  infoWrapper: {
    flex: 1,
    backgroundColor: '#F4F8F5',
  },
  progressBarWrapper: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#DCE7E1',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  slideCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  slideCounterText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#176B52',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#176B52',
    width: 20,
  },
  inactiveDot: {
    backgroundColor: '#DCE7E1',
  },
  infoScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  infoContainer: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  slideContent: {
    width: '100%',
  },
  infoHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#176B52',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  infoTitle: {
    fontWeight: '900',
    textAlign: 'center',
    color: '#163029',
    fontSize: 26,
  },
  infoSubtitle: {
    textAlign: 'center',
    color: '#687A74',
    fontWeight: '600',
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoChip: {
    backgroundColor: '#E2ECE7',
  },
  infoChipText: {
    color: '#163029',
    fontSize: 12,
    fontWeight: '700',
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DCE7E1',
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE7E1',
    backgroundColor: '#FFFFFF',
    elevation: 1,
    paddingVertical: 4,
  },
  dangerCard: {
    borderColor: '#F9DCDA',
    backgroundColor: '#FFF8F7',
  },
  solutionCard: {
    borderColor: '#DCECE4',
    backgroundColor: '#F4FAF7',
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#163029',
    marginBottom: 12,
  },
  cardBody: {
    fontSize: 14,
    color: '#4B5B56',
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bulletIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  bulletTextWrapper: {
    flex: 1,
  },
  bulletTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#163029',
    marginBottom: 2,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 8,
  },
  linkText: {
    color: '#176B52',
    fontWeight: '800',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  navigationFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#DCE7E1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navButton: {
    borderRadius: 14,
    flex: 1,
    marginHorizontal: 6,
  },
  backInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  backInfoText: {
    color: '#176B52',
    fontWeight: '800',
    fontSize: 13,
  },
  phraseBubble: {
    backgroundColor: '#EDF6F1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: '#176B52',
  },
  phraseText: {
    color: '#163029',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
});

