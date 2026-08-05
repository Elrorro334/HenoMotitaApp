import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, Linking, TouchableOpacity, useWindowDimensions } from 'react-native';
import { TextInput, Button, Text, Card, Chip, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getRandomPhrase } from '../services/timePhrases';
import { colors, fonts, spacing, borderRadius, layout, shadows } from '../constants/theme';

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= layout.breakpoint;

  const [showInfo, setShowInfo] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0); // 0 | 1 | 2
  const [preLoginPhrase, setPreLoginPhrase] = useState('');
  
  useEffect(() => {
    setPreLoginPhrase(getRandomPhrase('pre-login'));
  }, []);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

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

  // Activation logic moved to web

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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Top Dark Green Banner */}
        <View style={[styles.headerBanner, isDesktop && styles.desktopHeaderBanner]}>
          <Text style={styles.bannerPreTitle}>MONITOREO AMBIENTAL</Text>
          <Text style={styles.bannerTitle}>Heno Motita</Text>
          <Text style={styles.bannerSubtitle}>Gestión de cuadrillas y observaciones Hawksworth para el monitoreo de líquenes.</Text>
        </View>

        {/* Bottom Form Section */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            <Text style={styles.formPreTitle}>ACCESO DE ALUMNOS</Text>
            <Text style={styles.formTitle}>Inicia tu sesión</Text>
            
            {loginError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.errorBorder} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{loginError}</Text>
              </View>
            ) : null}

            {preLoginPhrase ? (
              <View style={styles.phraseBubble}>
                <Ionicons name="sunny-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.phraseText}>{preLoginPhrase}</Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <TextInput
              placeholder="usuario@uttt.edu.mx"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              outlineStyle={styles.cleanOutline}
              style={styles.cleanInput}
              activeOutlineColor={colors.primary}
              outlineColor={colors.borderLight}
            />

            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              outlineStyle={styles.cleanOutline}
              style={styles.cleanInput}
              activeOutlineColor={colors.primary}
              outlineColor={colors.borderLight}
            />

            <Button 
              mode="contained" 
              onPress={handleLogin} 
              loading={loginLoading}
              disabled={loginLoading || !email.trim() || !password}
              buttonColor={colors.primary}
              style={styles.loginBtn}
              labelStyle={styles.loginBtnLabel}
              contentStyle={{ paddingVertical: 8 }}
            >
              Iniciar Sesión
            </Button>

            <View style={styles.activateRow}>
              <Button
                mode="text"
                onPress={() => Linking.openURL('https://heno-motita-frontend.onrender.com/#alumnos')}
                textColor={colors.focusGreen}
                style={{ margin: 0, padding: 0 }}
                labelStyle={{ fontFamily: fonts.base, fontWeight: '600', fontSize: 14 }}
              >
                Activar cuenta en la Web
              </Button>
            </View>

            <TouchableOpacity 
              onPress={() => { setShowInfo(true); setSlideIndex(0); }} 
              style={styles.infoLinkRow}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.infoLinkText}>Ver información del Heno Motita</Text>
            </TouchableOpacity>

          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mainSurface,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.mainSurface,
  },
  headerBanner: {
    backgroundColor: colors.primaryHover, 
    paddingHorizontal: spacing.xxxl,
    paddingTop: 80,
    paddingBottom: 60,
    width: '100%',
  },
  desktopHeaderBanner: {
    paddingHorizontal: '15%',
    paddingTop: 100,
    paddingBottom: 80,
  },
  bannerPreTitle: {
    fontFamily: fonts.base,
    color: colors.textOnGreen,
    fontWeight: '650',
    letterSpacing: 2,
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  bannerTitle: {
    fontFamily: fonts.display,
    fontWeight: '700',
    color: colors.mainSurface,
    fontSize: 48,
    letterSpacing: -1.5,
    lineHeight: 48,
    marginBottom: spacing.lg,
  },
  bannerSubtitle: {
    fontFamily: fonts.base,
    color: colors.textOnGreen,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 350,
  },
  formSection: {
    flex: 1,
    backgroundColor: colors.mainSurface,
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  formPreTitle: {
    fontFamily: fonts.base,
    color: colors.textSecondary,
    fontWeight: '650',
    letterSpacing: 2,
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  formTitle: {
    fontFamily: fonts.display,
    fontWeight: '600',
    color: colors.headerGreen,
    fontSize: 32,
    letterSpacing: -0.5,
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontFamily: fonts.base,
    color: colors.textPrimary,
    fontWeight: '650',
    fontSize: 13,
    marginBottom: 4,
  },
  cleanInput: {
    backgroundColor: colors.mainSurface,
    marginBottom: spacing.lg,
    fontSize: 15,
    height: 48,
  },
  cleanOutline: {
    borderRadius: borderRadius.input,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  loginBtn: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.button,
  },
  loginBtnLabel: {
    fontFamily: fonts.base,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  activateRow: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  infoLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  infoLinkText: {
    fontFamily: fonts.base,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '650',
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
