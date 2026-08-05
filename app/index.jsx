import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, Linking, TouchableOpacity, useWindowDimensions } from 'react-native';
import { TextInput, Button, Text, Card, Chip, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { activateStudent } from '../services/api';
import { getRandomPhrase } from '../services/timePhrases';
import { colors, fonts, spacing, borderRadius, layout, shadows } from '../constants/theme';

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= layout.breakpoint;

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
      setLoginError(error.message || 'Contraseña incorrecta o cuenta no registrada.');
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
        'Tu cuenta ha sido registrada exitosamente. Ya puedes iniciar sesión.',
        [{ text: 'Entendido', onPress: () => setMode('login') }]
      );
    } catch (error) {
      Alert.alert('Error de Activación', error.message || 'Código de activación inválido o ya utilizado.');
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

  // -------------------------------------------------------------
  // ONBOARDING INFO VIEW
  // -------------------------------------------------------------
  if (showInfo) {
    return (
      <View style={styles.infoWrapper}>
        {/* Top Progress Indicator */}
        <View style={styles.progressBarWrapper}>
          <ProgressBar progress={(slideIndex + 1) / 3} color={colors.primary} style={styles.progressBar} />
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
          <View style={[styles.infoContainer, { maxWidth: layout.contentMaxWidthUnauth }]}>
            
            {/* Slide 0: What is it? */}
            {slideIndex === 0 && (
              <View style={styles.slideContent}>
                <View style={styles.infoHeader}>
                  <View style={styles.infoIconCircle}>
                    <MaterialCommunityIcons name="dna" size={38} color={colors.mainSurface} />
                  </View>
                  <Text style={styles.infoTitle}>Conoce al Heno Motita</Text>
                  <Text style={styles.infoSubtitle}>
                    Identificación y características biológicas básicas
                  </Text>
                </View>

                <View style={styles.badgeRow}>
                  <Chip style={styles.infoChip} textStyle={styles.infoChipText}>
                    Tillandsia recurvata
                  </Chip>
                  <Chip style={styles.infoChip} textStyle={styles.infoChipText}>
                    Planta epífita aérea
                  </Chip>
                </View>

                <Image
                  source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpEIsmlNJPokb8Zil3THhewQYfmoaAlmeeA83-TZ2RiSJayc7KEi6ijn8&s=10' }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />

                <Card style={styles.infoCard}>
                  <Card.Content>
                    <Text style={styles.cardHeader}>¿Qué es?</Text>
                    <Text style={styles.cardBody}>
                      Es una pequeña planta grisácea que vive sobre las ramas de los árboles y cables públicos. Aunque no es un parásito directo y no absorbe la savia del árbol, se comporta como una plaga peligrosa cuando se multiplica sin control.
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            )}

            {/* Slide 1: The Threat */}
            {slideIndex === 1 && (
              <View style={styles.slideContent}>
                <View style={styles.infoHeader}>
                  <View style={[styles.infoIconCircle, { backgroundColor: colors.errorBorder }]}>
                    <Ionicons name="alert-circle" size={38} color={colors.mainSurface} />
                  </View>
                  <Text style={[styles.infoTitle, { color: colors.errorBorder }]}>El Peligro Latente</Text>
                  <Text style={styles.infoSubtitle}>
                    Por qué representa una amenaza letal para los árboles
                  </Text>
                </View>

                <Image
                  source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjjwCR90zb1Ju2jP8BplzAINJ8x-h7EoIKIv1YqCjcTQ&s=10' }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />

                <Card style={[styles.infoCard, styles.dangerCard]}>
                  <Card.Content>
                    <Text style={[styles.cardHeader, { color: colors.errorText }]}>¿Por qué es un peligro?</Text>
                    
                    <View style={styles.bulletRow}>
                      <Ionicons name="close-circle" size={20} color={colors.errorBorder} style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Bloquea el sol</Text>
                        <Text style={styles.cardBody}>Cubre por completo las hojas, impidiendo la fotosíntesis del árbol.</Text>
                      </View>
                    </View>

                    <View style={styles.bulletRow}>
                      <Ionicons name="close-circle" size={20} color={colors.errorBorder} style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Seca las ramas</Text>
                        <Text style={styles.cardBody}>Al no recibir luz ni aire, las ramas se debilitan, se secan y mueren.</Text>
                      </View>
                    </View>

                    <View style={styles.bulletRow}>
                      <Ionicons name="close-circle" size={20} color={colors.errorBorder} style={styles.bulletIcon} />
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
                  <View style={[styles.infoIconCircle, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark-circle" size={38} color={colors.mainSurface} />
                  </View>
                  <Text style={[styles.infoTitle, { color: colors.headerGreen }]}>Solución Activa</Text>
                  <Text style={styles.infoSubtitle}>
                    Métodos eficientes para erradicar y prevenir la plaga
                  </Text>
                </View>

                <Card style={[styles.infoCard, styles.solutionCard]}>
                  <Card.Content>
                    <Text style={[styles.cardHeader, { color: colors.primary }]}>¿Cómo solucionarlo?</Text>

                    <View style={styles.bulletRow}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Limpieza manual</Text>
                        <Text style={styles.cardBody}>Despréndela con cuidado de las ramas usando tus manos o varas largas.</Text>
                      </View>
                    </View>

                    <View style={styles.bulletRow}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Desecho seguro</Text>
                        <Text style={styles.cardBody}>Guarda los restos en bolsas cerradas para que el viento no disperse sus semillas.</Text>
                      </View>
                    </View>

                    <View style={styles.bulletRow}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.bulletIcon} />
                      <View style={styles.bulletTextWrapper}>
                        <Text style={styles.bulletTitle}>Remedio casero</Text>
                        <Text style={styles.cardBody}>Fumiga la zona limpia con agua y bicarbonato de sodio para evitar que regrese.</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>

                {/* Saber Más Link */}
                <TouchableOpacity onPress={openMoreInfo} style={styles.linkContainer}>
                  <Ionicons name="globe-outline" size={20} color={colors.primary} />
                  <Text style={styles.linkText}>Saber más en henomotita.mx</Text>
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
              textColor={colors.primary}
              style={styles.navButton}
              icon={() => <Ionicons name="arrow-back" size={18} color={colors.primary} />}
            >
              Atrás
            </Button>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <Button
            mode="contained"
            onPress={nextSlide}
            buttonColor={colors.primary}
            textColor={colors.mainSurface}
            style={styles.navButton}
            contentStyle={{ flexDirection: 'row-reverse' }}
            icon={() => <Ionicons name="arrow-forward" size={18} color={colors.mainSurface} />}
          >
            {slideIndex === 2 ? 'Comenzar' : 'Siguiente'}
          </Button>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATION LOGIN / ACTIVATION VIEW
  // Responsive: Desktop 2-column (>=720px), Mobile 1-column (<720px, panel >=38vh)
  // -------------------------------------------------------------
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainWrapper, isDesktop && styles.desktopMainWrapper]}>

          {/* Brand Header Panel */}
          <View style={[
            styles.headerBlock, 
            isDesktop ? styles.desktopHeaderBlock : { minHeight: Math.max(height * 0.38, 260) }
          ]}>
            <View style={styles.iconCircle}>
              <Ionicons name="leaf" size={44} color={colors.textOnGreen} />
            </View>
            <Text style={styles.institutionCode}>UTTT • VALLE DEL MEZQUITAL</Text>
            <Text style={styles.mainTitle}>HenoTrack</Text>
            <Text style={styles.subtitle}>Monitoreo y Conservación Fitosanitaria</Text>
            
            {isDesktop && (
              <View style={styles.desktopDecorationBox}>
                <Text style={styles.desktopDecorationText}>
                  Sistema de geolocalización, captura y evaluación de Tillandsia recurvata en la red ambiental universitaria.
                </Text>
              </View>
            )}
          </View>

          {/* Form Container Column */}
          <View style={[styles.formColumn, isDesktop && styles.desktopFormColumn]}>
            
            {/* Custom Segmented Pill Tab Toggle */}
            <View style={styles.segmentedToggleContainer}>
              <TouchableOpacity 
                style={[styles.segmentedTab, mode === 'login' && styles.segmentedTabActive]} 
                onPress={() => setMode('login')}
              >
                <Text style={[styles.segmentedTabText, mode === 'login' && styles.segmentedTabTextActive]}>
                  Iniciar Sesión
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

            {/* Form Card */}
            <View style={styles.cardForm}>
              {preLoginPhrase ? (
                <View style={styles.phraseBubble}>
                  <Ionicons name="sunny-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.phraseText}>{preLoginPhrase}</Text>
                </View>
              ) : null}

              {mode === 'login' ? (
                <>
                  <Text style={styles.formLegend}>Te damos la bienvenida</Text>

                  {loginError ? (
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle" size={18} color={colors.errorBorder} style={{ marginRight: 6 }} />
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
                    activeOutlineColor={colors.focusGreen}
                    outlineColor={colors.borderLight}
                    left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />} />}
                  />

                  <TextInput
                    label="Contraseña"
                    placeholder="Tu contraseña"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    outlineStyle={styles.inputOutline}
                    style={styles.input}
                    activeOutlineColor={colors.focusGreen}
                    outlineColor={colors.borderLight}
                    left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />} />}
                  />

                  <Button 
                    mode="contained" 
                    onPress={handleLogin} 
                    loading={loginLoading}
                    disabled={loginLoading || !email.trim() || !password}
                    buttonColor={colors.primary}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                    contentStyle={{ paddingVertical: 10 }}
                    icon={() => <Ionicons name="log-in-outline" size={20} color={colors.mainSurface} />}
                  >
                    Iniciar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Text style={styles.formLegend}>Registro de Estudiante</Text>

                  <TextInput
                    label="Código de Activación *"
                    placeholder="Código entregado por tu encargado"
                    value={activationCode}
                    onChangeText={setActivationCode}
                    mode="outlined"
                    autoCapitalize="characters"
                    outlineStyle={styles.inputOutline}
                    style={styles.input}
                    activeOutlineColor={colors.focusGreen}
                    outlineColor={colors.borderLight}
                    left={<TextInput.Icon icon={() => <Ionicons name="key-outline" size={20} color={colors.textSecondary} />} />}
                  />

                  <TextInput
                    label="Nombre Completo *"
                    placeholder="Nombre(s) y Apellidos"
                    value={studentName}
                    onChangeText={setStudentName}
                    mode="outlined"
                    outlineStyle={styles.inputOutline}
                    style={styles.input}
                    activeOutlineColor={colors.focusGreen}
                    outlineColor={colors.borderLight}
                    left={<TextInput.Icon icon={() => <Ionicons name="person-outline" size={20} color={colors.textSecondary} />} />}
                  />

                  <TextInput
                    label="Matrícula *"
                    placeholder="Tu matrícula institucional"
                    value={enrollment}
                    onChangeText={setEnrollment}
                    mode="outlined"
                    outlineStyle={styles.inputOutline}
                    style={styles.input}
                    activeOutlineColor={colors.focusGreen}
                    outlineColor={colors.borderLight}
                    left={<TextInput.Icon icon={() => <Ionicons name="card-outline" size={20} color={colors.textSecondary} />} />}
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
                    activeOutlineColor={colors.focusGreen}
                    outlineColor={colors.borderLight}
                    left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />} />}
                  />

                  <TextInput
                    label="Contraseña *"
                    placeholder="Crea una contraseña"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    outlineStyle={styles.inputOutline}
                    style={styles.input}
                    activeOutlineColor={colors.focusGreen}
                    outlineColor={colors.borderLight}
                    left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />} />}
                  />

                  <Button 
                    mode="contained" 
                    onPress={handleActivate} 
                    loading={activateLoading}
                    disabled={activateLoading || !activationCode.trim()}
                    buttonColor={colors.primary}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                    contentStyle={{ paddingVertical: 10 }}
                    icon={() => <Ionicons name="checkmark-circle-outline" size={20} color={colors.mainSurface} />}
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
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.backInfoText}>Ver información del Heno Motita</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: layout.contentMaxWidthUnauth,
    alignItems: 'center',
  },
  desktopMainWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: spacing.xxxl,
  },
  headerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    width: '100%',
  },
  desktopHeaderBlock: {
    flex: 1,
    minWidth: layout?.desktopLoginMinCols?.left || 320,
    backgroundColor: colors.headerGreen,
    borderRadius: borderRadius.modal,
    padding: spacing.xxxl,
    alignItems: 'flex-start',
    justifyContent: 'center',
    shadowColor: colors.headerGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.headerGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  institutionCode: {
    fontFamily: fonts.base,
    color: colors.textSecondaryAlt,
    fontWeight: '650',
    letterSpacing: 1.5,
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  mainTitle: {
    fontFamily: fonts.display,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.headerGreen,
    fontSize: 44, // clamp fallback
    letterSpacing: -1.2, // -.06em
    lineHeight: 44 * 0.95,
  },
  subtitle: {
    fontFamily: fonts.base,
    textAlign: 'center',
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 14,
    marginTop: spacing.xs,
  },
  desktopDecorationBox: {
    marginTop: spacing.xxxl,
    backgroundColor: colors.primaryHover,
    padding: spacing.lg,
    borderRadius: borderRadius.input,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentGreen,
  },
  desktopDecorationText: {
    fontFamily: fonts.base,
    fontSize: 13,
    color: colors.textOnGreen,
    lineHeight: 20,
  },
  formColumn: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  desktopFormColumn: {
    flex: 1,
    minWidth: layout?.desktopLoginMinCols?.right || 280,
  },
  segmentedToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryButton,
    borderRadius: borderRadius.pill,
    padding: 4,
    width: '100%',
    marginBottom: spacing.lg,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.pill,
  },
  segmentedTabActive: {
    backgroundColor: colors.mainSurface,
    shadowColor: colors.headerGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedTabText: {
    fontFamily: fonts.base,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentedTabTextActive: {
    color: colors.primary,
    fontWeight: '650',
  },
  cardForm: {
    width: '100%',
    backgroundColor: colors.mainSurface,
    borderRadius: borderRadius.modal,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
    shadowColor: colors.headerGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: layout.panelAccentBorderWidth,
    borderLeftColor: colors.accentGreen,
  },
  formLegend: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '600',
    color: colors.headerGreen,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    padding: spacing.md,
    borderRadius: borderRadius.input,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderLeftWidth: layout.panelAccentBorderWidth,
    borderLeftColor: colors.errorBorder,
  },
  errorText: {
    fontFamily: fonts.base,
    color: colors.errorText,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    marginBottom: spacing.lg,
    backgroundColor: colors.panelSurface,
    fontSize: 14,
    fontFamily: fonts.base,
  },
  inputOutline: {
    borderRadius: borderRadius.input,
    borderColor: colors.borderLight,
  },
  button: {
    borderRadius: borderRadius.button,
    marginTop: spacing.sm,
  },
  buttonLabel: {
    fontFamily: fonts.base,
    fontSize: 15,
    fontWeight: '650',
    color: colors.mainSurface,
  },

  // Interactive Onboarding Layout
  infoWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBarWrapper: {
    paddingHorizontal: spacing.xxl,
    paddingTop: 48,
    paddingBottom: spacing.sm,
    backgroundColor: colors.mainSurface,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  slideCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  slideCounterText: {
    fontFamily: fonts.base,
    fontSize: 12.5,
    fontWeight: '650',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
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
    backgroundColor: colors.primary,
    width: 20,
  },
  inactiveDot: {
    backgroundColor: colors.borderLight,
  },
  infoScrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  infoContainer: {
    alignSelf: 'center',
    width: '100%',
  },
  slideContent: {
    width: '100%',
  },
  infoHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  infoIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.headerGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  infoTitle: {
    fontFamily: fonts.display,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.headerGreen,
    fontSize: 28,
  },
  infoSubtitle: {
    fontFamily: fonts.base,
    textAlign: 'center',
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoChip: {
    backgroundColor: colors.secondaryButton,
  },
  infoChipText: {
    fontFamily: fonts.base,
    color: colors.highlightText,
    fontSize: 12,
    fontWeight: '650',
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.modal,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  infoCard: {
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: layout.panelAccentBorderWidth,
    borderLeftColor: colors.accentGreen,
    backgroundColor: colors.mainSurface,
    elevation: 1,
    paddingVertical: spacing.xs,
  },
  dangerCard: {
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorBg,
    borderLeftColor: colors.errorBorder,
  },
  solutionCard: {
    borderColor: colors.borderLight,
    backgroundColor: colors.panelSurface,
    borderLeftColor: colors.accentGreen,
  },
  cardHeader: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '600',
    color: colors.headerGreen,
    marginBottom: spacing.md,
  },
  cardBody: {
    fontFamily: fonts.base,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bulletIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  bulletTextWrapper: {
    flex: 1,
  },
  bulletTitle: {
    fontFamily: fonts.base,
    fontSize: 14,
    fontWeight: '650',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  linkText: {
    fontFamily: fonts.base,
    color: colors.primary,
    fontWeight: '650',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  navigationFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: colors.mainSurface,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  navButton: {
    borderRadius: borderRadius.button,
    flex: 1,
    marginHorizontal: 6,
  },
  backInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  backInfoText: {
    fontFamily: fonts.base,
    color: colors.primary,
    fontWeight: '650',
    fontSize: 13,
  },
  phraseBubble: {
    backgroundColor: colors.secondaryButton,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.input,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderLeftWidth: layout.panelAccentBorderWidth,
    borderLeftColor: colors.primary,
  },
  phraseText: {
    fontFamily: fonts.base,
    color: colors.highlightText,
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
});
