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
          
          {/* Student HenoTrack Hero Banner */}
          <View style={styles.studentHero}>
            <View style={styles.heroPill}>
              <Ionicons name="sparkles-outline" size={12} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.heroPillText}>PERFIL ALUMNO · MONITOREO AMBIENTAL UTTT</Text>
            </View>

            <Text style={styles.heroGreeting}>Hola, {studentName.split(' ')[0]}.</Text>
            <Text style={styles.heroSub}>
              {welcomePhrase || 'Tus registros están al corriente. Consulta tus árboles, fotografías, observaciones y entregas quincenales.'}
            </Text>

            {/* Student Profile Card */}
            <View style={styles.studentProfileBadge}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{studentInitials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.badgeRoleLabel}>
                  {user?.role === 'STUDENT' ? 'ALUMNO ASIGNADO' : user?.role || 'INSPECTOR'}
                </Text>
                <Text style={styles.badgeName}>{studentName}</Text>
                <Text style={styles.badgeCrew}>
                  {activeCrew?.name || activeCrew?.code || 'Cuadrilla Activa'} · {activeCrew?.zone || 'UTTT'}
                </Text>
              </View>
            </View>

            <View style={styles.heroActionsRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/camera')}>
                <Ionicons name="add-circle-outline" size={18} color={colors.mainSurface} style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Nueva Inspección</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/history')}>
                <Ionicons name="analytics-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.secondaryBtnText}>Mi Seguimiento</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Notice Banner */}
          <View style={styles.privacyBanner}>
            <Ionicons name="lock-closed" size={18} color={colors.primary} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>Acceso Limitado por Perfil Alumno</Text>
              <Text style={styles.privacySub}>
                Desde esta vista solo puedes capturar inspecciones y consultar tus propios árboles asignados y reportes quincenales.
              </Text>
            </View>
          </View>

          {/* Student KPIs Grid with 3px Left Border Accent */}
          <View style={[styles.kpiGrid, isWideScreen && styles.wideKpiGrid]}>
            <View style={[styles.kpiCard, { borderLeftWidth: 3, borderLeftColor: colors.accentGreen }]}>
              <View style={[styles.kpiIcon, { backgroundColor: colors.secondaryButton }]}>
                <Ionicons name="checkmark-sharp" size={18} color={colors.primary} />
              </View>
              <Text style={styles.kpiVal}>{trees.length}</Text>
              <Text style={styles.kpiLabel}>ÁRBOLES REGISTRADOS</Text>
            </View>

            <View style={[styles.kpiCard, { borderLeftWidth: 3, borderLeftColor: colors.focusGreen }]}>
              <View style={[styles.kpiIcon, { backgroundColor: colors.panelSurface }]}>
                <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.kpiVal}>{recentEvaluations.length}</Text>
              <Text style={styles.kpiLabel}>INFORMES REGISTRADOS</Text>
            </View>

            <View style={[styles.kpiCard, { borderLeftWidth: 3, borderLeftColor: lastObsScore >= 4 ? colors.errorBorder : colors.warningText }]}>
              <View style={[styles.kpiIcon, { backgroundColor: lastObsScore >= 4 ? colors.errorBg : colors.warningBg }]}>
                <Ionicons 
                  name={lastObsScore >= 4 ? 'alert-circle' : 'warning-outline'} 
                  size={18} 
                  color={lastObsScore >= 4 ? colors.errorBorder : colors.warningText} 
                />
              </View>
              <Text style={[styles.kpiVal, lastObsScore >= 4 && { color: colors.errorText }]}>
                {lastObsScore} / 6
              </Text>
              <Text style={styles.kpiLabel}>ÚLTIMA VALORACIÓN</Text>
            </View>
          </View>

          {/* Assigned Principal Tree Card with 3px Accent */}
          {assignedTree && (
            <View style={styles.assignedTreePanel}>
              <View style={styles.panelHeader}>
                <View>
                  <Text style={styles.panelKicker}>ASIGNACIÓN PRINCIPAL</Text>
                  <Text style={styles.panelTitle}>Árbol de Seguimiento Quincenal</Text>
                </View>
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityBadgeText}>{assignedTree.status || 'ACTIVO'}</Text>
                </View>
              </View>

              <View style={styles.assignedTreeCard}>
                <View style={styles.treeIconCircle}>
                  <Ionicons name="leaf" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.treeCodeLabel}>CÓDIGO DE ÁRBOOL EN API</Text>
                  <Text style={styles.treeCodeVal}>{assignedTree.code}</Text>
                  <Text style={styles.treeMetaSub}>
                    {assignedTree.commonName || 'Especie'} {assignedTree.scientificName ? `· ${assignedTree.scientificName}` : ''}
                  </Text>
                </View>
              </View>

              {recentEvaluations.length > 0 && (
                <>
                  <Text style={styles.evolutionLabel}>HISTORIAL DE INSPECCIONES REGISTRADAS EN SERVIDOR:</Text>
                  <View style={styles.evolutionGrid}>
                    {recentEvaluations.slice(0, 3).map((obs, idx) => {
                      const score = obs?.hawksworth?.totalScore ?? 0;
                      const dateStr = obs?.observationDate ? new Date(obs.observationDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : `Visita ${idx + 1}`;
                      const barColor = score >= 4 ? colors.errorBorder : score >= 2 ? colors.warningText : colors.primary;
                      return (
                        <View key={obs.id || obs._id || idx} style={styles.evoCol}>
                          <Text style={styles.evoDate}>{dateStr}</Text>
                          <Text style={styles.evoScore}>{score} / 6</Text>
                          <View style={[styles.evoBar, { height: Math.max(16, score * 9), backgroundColor: barColor }]} />
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          )}

          {/* Recent Inspections Header */}
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Tus Últimas Inspecciones en Servidor</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.viewAllText}>Ver Historial →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando información...</Text>
            </View>
          ) : recentEvaluations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="leaf-outline" size={40} color={colors.textSecondary} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>Sin Inspecciones Registradas</Text>
              <Text style={styles.emptySub}>
                Aún no has registrado capturas de campo en la plataforma. Presiona "Nueva Inspección" para comenzar.
              </Text>
            </View>
          ) : (
            recentEvaluations.map((evalItem, index) => (
              <EvaluationCard key={evalItem.id || evalItem._id || index} evaluation={evalItem} />
            ))
          )}

          <View style={{ height: 32 }} /> 
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
  },
  studentHero: {
    backgroundColor: colors.mainSurface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: borderRadius.card,
    borderBottomRightRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: layout.panelAccentBorderWidth,
    borderLeftColor: colors.accentGreen,
    marginBottom: spacing.lg,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryButton,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.input,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroPillText: {
    fontFamily: fonts.base,
    fontSize: 11,
    fontWeight: '650',
    color: colors.primary,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  heroGreeting: {
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '600',
    color: colors.headerGreen,
  },
  heroSub: {
    fontFamily: fonts.base,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
    fontWeight: '500',
  },
  studentProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panelSurface,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: layout.panelAccentBorderWidth,
    borderLeftColor: colors.primary,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.mainSurface,
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 16,
  },
  badgeRoleLabel: {
    fontFamily: fonts.base,
    fontSize: 10.5,
    fontWeight: '650',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeName: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  badgeCrew: {
    fontFamily: fonts.base,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: fonts.base,
    color: colors.mainSurface,
    fontWeight: '650',
    fontSize: 14,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.secondaryButton,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: fonts.base,
    color: colors.primary,
    fontWeight: '650',
    fontSize: 14,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panelSurface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: layout.panelAccentBorderWidth,
    borderLeftColor: colors.primary,
  },
  privacyTitle: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '600',
    color: colors.headerGreen,
  },
  privacySub: {
    fontFamily: fonts.base,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  wideKpiGrid: {
    gap: spacing.lg,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.mainSurface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  kpiIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justify.Content: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  kpiVal: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  kpiLabel: {
    fontFamily: fonts.base,
    fontSize: 10,
    fontWeight: '650',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  assignedTreePanel: {
    backgroundColor: colors.mainSurface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: layout.panelAccentBorderWidth,
    borderLeftColor: colors.accentGreen,
    marginBottom: spacing.lg,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  panelKicker: {
    fontFamily: fonts.base,
    fontSize: 11,
    fontWeight: '650',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  panelTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.headerGreen,
  },
  priorityBadge: {
    backgroundColor: colors.secondaryButton,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.input,
  },
  priorityBadgeText: {
    fontFamily: fonts.base,
    fontSize: 10,
    fontWeight: '650',
    color: colors.primary,
  },
  assignedTreeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panelSurface,
    padding: spacing.md,
    borderRadius: borderRadius.input,
    marginBottom: spacing.md,
  },
  treeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryButton,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  treeCodeLabel: {
    fontFamily: fonts.base,
    fontSize: 10,
    fontWeight: '650',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  treeCodeVal: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  treeMetaSub: {
    fontFamily: fonts.base,
    fontSize: 12,
    color: colors.textSecondary,
  },
  evolutionLabel: {
    fontFamily: fonts.base,
    fontSize: 11,
    fontWeight: '650',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  evolutionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: colors.panelSurface,
    padding: spacing.md,
    borderRadius: borderRadius.input,
    height: 90,
  },
  evoCol: {
    alignItems: 'center',
  },
  evoDate: {
    fontFamily: fonts.base,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  evoScore: {
    fontFamily: fonts.base,
    fontSize: 11,
    fontWeight: '650',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  evoBar: {
    width: 24,
    borderRadius: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.headerGreen,
  },
  viewAllText: {
    fontFamily: fonts.base,
    fontSize: 12,
    fontWeight: '650',
    color: colors.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    fontFamily: fonts.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: colors.mainSurface,
    marginHorizontal: spacing.lg,
    padding: spacing.xxl,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.headerGreen,
  },
  emptySub: {
    fontFamily: fonts.base,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
