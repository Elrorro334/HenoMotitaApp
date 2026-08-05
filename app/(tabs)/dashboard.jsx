import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getTreesByCrew, getObservationsByTree } from '../../services/api';
import EvaluationCard from '../../components/EvaluationCard';
import { getRandomPhrase } from '../../services/timePhrases';
import { colors, fonts, spacing, borderRadius, layout } from '../../constants/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWideScreen = width >= layout.breakpoint;
  const { user, crews, activeCrew, refreshCrews } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trees, setTrees] = useState([]);
  const [recentEvaluations, setRecentEvaluations] = useState([]);
  const [assignedTree, setAssignedTree] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const crewId = activeCrew?.id || activeCrew?._id || (crews && crews[0] ? (crews[0].id || crews[0]._id) : null);
      let fetchedTrees = [];
      let fetchedObservations = [];

      if (crewId) {
        const treeRes = await getTreesByCrew(crewId).catch(() => []);
        fetchedTrees = Array.isArray(treeRes) ? treeRes : (treeRes.trees || []);
        setTrees(fetchedTrees);
        if (fetchedTrees.length > 0) {
          setAssignedTree(fetchedTrees[0]);
        }
      }

      if (fetchedTrees.length > 0) {
        for (const tree of fetchedTrees.slice(0, 5)) {
          const tId = tree.id || tree._id;
          const obsRes = await getObservationsByTree(tId).catch(() => []);
          const obsList = Array.isArray(obsRes) ? obsRes : (obsRes.observations || []);
          
          obsList.forEach(obs => {
            fetchedObservations.push({
              ...obs,
              tree: tree,
            });
          });
        }
      }

      fetchedObservations.sort((a, b) => new Date(b.createdAt || b.observationDate) - new Date(a.createdAt || a.observationDate));
      setRecentEvaluations(fetchedObservations);

    } catch (error) {
      console.warn('HenoTrack dashboard error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCrew, crews]);

  const studentName = user?.name || user?.email || 'Alumno Inspector';
  const studentInitials = studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const [welcomePhrase, setWelcomePhrase] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (studentName) {
      const firstName = studentName.split(' ')[0];
      setWelcomePhrase(getRandomPhrase('post-login', firstName));
    }
  }, [studentName]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCrews(user);
    await loadDashboardData();
    if (studentName) {
      const firstName = studentName.split(' ')[0];
      setWelcomePhrase(getRandomPhrase('post-login', firstName));
    }
  };

  const lastObsScore = recentEvaluations.length > 0 
    ? (recentEvaluations[0]?.hawksworth?.totalScore ?? 0) 
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={[styles.mainContainer, { maxWidth: layout.contentMaxWidthAuth }]}>
          
          {/* 1. Header Limpio (Top Bar) */}
          <View style={styles.topBar}>
            <View style={styles.greetingCol}>
              <Text style={styles.greetingText}>¡Hola, {studentName.split(' ')[0]}!</Text>
              <Text style={styles.subGreeting}>Listo para proteger tus árboles</Text>
            </View>
            {/* Si no tienes Avatar, este círculo sirve perfecto */}
            <TouchableOpacity style={styles.avatarCircleBtn} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
              <Text style={styles.avatarTextBtn}>{studentInitials}</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Hero Action (Botón Gigante Adictivo) */}
          <View style={styles.heroActionContainer}>
            <TouchableOpacity style={styles.heroActionBtn} onPress={() => router.push('/camera')} activeOpacity={0.85}>
              <View style={styles.heroActionContent}>
                <View style={styles.heroIconWrapper}>
                  <Ionicons name="camera" size={32} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroActionTitle}>Nueva Inspección</Text>
                  <Text style={styles.heroActionSub}>Captura el estado de tu árbol hoy</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.mainSurface} style={{ opacity: 0.8 }} />
              </View>
            </TouchableOpacity>
          </View>

          {/* 3. Estadísticas Rápidas (Gamificadas) */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="leaf" size={28} color={colors.primaryHover} style={{ marginBottom: spacing.xs }} />
              <Text style={styles.statValue}>{trees.length}</Text>
              <Text style={styles.statLabel}>Árboles</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="document-text" size={28} color={colors.primaryHover} style={{ marginBottom: spacing.xs }} />
              <Text style={styles.statValue}>{recentEvaluations.length}</Text>
              <Text style={styles.statLabel}>Registros</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons 
                name={lastObsScore >= 4 ? 'alert-circle' : (lastObsScore > 0 ? 'star' : 'seedling')} 
                size={28} 
                color={lastObsScore >= 4 ? colors.errorBorder : (lastObsScore > 0 ? colors.warningText : colors.primaryHover)} 
                style={{ marginBottom: spacing.xs }} 
              />
              <Text style={styles.statValue}>{lastObsScore > 0 ? `${lastObsScore}/6` : '-'}</Text>
              <Text style={styles.statLabel}>Salud</Text>
            </View>
          </View>

          {/* 4. Tu Árbol a Cuidar (Propiedad y Conexión) */}
          {assignedTree && (
            <View style={styles.careTreeCard}>
              <View style={styles.careHeader}>
                <Ionicons name="leaf" size={20} color={colors.primary} />
                <Text style={styles.careTitle}>Tu Árbol Principal</Text>
              </View>
              <Text style={styles.careName}>{assignedTree.commonName || 'Especie asignada'}</Text>
              <Text style={styles.careMeta}>
                {assignedTree.scientificName ? `${assignedTree.scientificName} · ` : ''}Zona {activeCrew?.zone || 'UTTT'}
              </Text>
              
              {/* Progreso visual de salud */}
              {recentEvaluations.length > 0 && (
                <View style={styles.healthTrackRow}>
                  <Text style={styles.healthTrackLabel}>Evolución reciente:</Text>
                  <View style={styles.healthDots}>
                    {recentEvaluations.slice(0, 5).reverse().map((obs, idx) => {
                      const score = obs?.hawksworth?.totalScore ?? 0;
                      const dotColor = score >= 4 ? colors.errorBorder : score >= 2 ? colors.warningText : colors.primaryHover;
                      return (
                        <View key={idx} style={[styles.healthDot, { backgroundColor: dotColor }]} />
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* 5. Feed de Actividad (Últimas Inspecciones) */}
          <View style={styles.feedSection}>
            <Text style={styles.feedTitle}>Actividad Reciente</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : recentEvaluations.length === 0 ? (
              <View style={styles.emptyFeedBox}>
                <Ionicons name="leaf-outline" size={48} color={colors.primaryHover} style={{ marginBottom: spacing.md }} />
                <Text style={styles.emptyFeedTitle}>¡Todo listo para empezar!</Text>
                <Text style={styles.emptyFeedSub}>Haz tu primera inspección para verla aquí.</Text>
              </View>
            ) : (
              <View style={styles.feedList}>
                {recentEvaluations.map((evalItem, index) => (
                  <EvaluationCard key={evalItem.id || evalItem._id || index} evaluation={evalItem} />
                ))}
              </View>
            )}
            
            {recentEvaluations.length > 0 && (
              <TouchableOpacity style={styles.viewHistoryBtn} onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.viewHistoryText}>Ver todo el historial</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 6. Aviso de Privacidad (Movido al fondo) */}
          <View style={styles.bottomPrivacyNotice}>
            <Ionicons name="information-circle" size={14} color={colors.textSecondaryAlt} />
            <Text style={styles.bottomPrivacyText}>Modo Alumno: Solo ves tus registros asignados.</Text>
          </View> 
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  mainContainer: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  // 1. Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  greetingCol: {
    flex: 1,
  },
  greetingText: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: colors.headerGreen,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontFamily: fonts.base,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  avatarCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarTextBtn: {
    color: colors.mainSurface,
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 18,
  },
  // 2. Hero Action Botón Gigante Adictivo
  heroActionContainer: {
    marginBottom: spacing.xxl,
  },
  heroActionBtn: {
    backgroundColor: colors.primary,
    borderRadius: 24, 
    padding: spacing.sm,
    shadowColor: colors.primaryHover,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryHover, 
    borderRadius: 20,
    padding: spacing.lg,
  },
  heroIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.mainSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  heroActionTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: colors.mainSurface,
    letterSpacing: -0.5,
  },
  heroActionSub: {
    fontFamily: fonts.base,
    fontSize: 13,
    color: colors.textOnGreen,
    opacity: 0.9,
    marginTop: 2,
  },
  // 3. Estadísticas Gamificadas
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.mainSurface,
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.borderLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: fonts.base,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  // 4. Tu Árbol a Cuidar
  careTreeCard: {
    backgroundColor: colors.panelSurface,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.accentGreen,
  },
  careHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  careTitle: {
    fontFamily: fonts.base,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  careName: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.headerGreen,
  },
  careMeta: {
    fontFamily: fonts.base,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  healthTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.mainSurface,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  healthTrackLabel: {
    fontFamily: fonts.base,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  healthDots: {
    flexDirection: 'row',
    gap: 6,
  },
  healthDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // 5. Feed de Actividad
  feedSection: {
    marginBottom: spacing.xl,
  },
  feedTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: colors.headerGreen,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyFeedBox: {
    backgroundColor: colors.mainSurface,
    borderRadius: 20,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyFeedEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyFeedTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyFeedSub: {
    fontFamily: fonts.base,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  feedList: {
    gap: spacing.md,
  },
  viewHistoryBtn: {
    backgroundColor: colors.secondaryButton,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  viewHistoryText: {
    fontFamily: fonts.base,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  // 6. Aviso de Privacidad
  bottomPrivacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  bottomPrivacyText: {
    fontFamily: fonts.base,
    fontSize: 11,
    color: colors.textSecondaryAlt,
    marginLeft: 4,
  },
});
