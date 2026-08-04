import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getTreesByCrew, getObservationsByTree } from '../../services/api';
import EvaluationCard from '../../components/EvaluationCard';
import { getRandomPhrase } from '../../services/timePhrases';


export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#176B52']} />}
      >
        {/* Student HenoTrack Hero Banner */}
        <View style={styles.studentHero}>
          <View style={styles.heroPill}>
            <Ionicons name="sparkles-outline" size={12} color="#176B52" style={{ marginRight: 4 }} />
            <Text style={styles.heroPillText}>Perfil Alumno · Monitoreo Ambiental UTTT</Text>
          </View>

          <Text style={styles.heroGreeting}>Hola, {studentName.split(' ')[0]}.</Text>
          <Text style={styles.heroSub}>
            {welcomePhrase || 'Tus registros estan al corriente. Consulta tus arboles, fotografias, observaciones y entregas quincenales.'}
          </Text>


          {/* Student Profile Card */}
          <View style={styles.studentProfileBadge}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{studentInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.badgeRoleLabel}>
                {user?.role === 'STUDENT' ? 'Alumno Asignado' : user?.role || 'Inspector'}
              </Text>
              <Text style={styles.badgeName}>{studentName}</Text>
              <Text style={styles.badgeCrew}>
                {activeCrew?.name || activeCrew?.code || 'Cuadrilla Activa'} · {activeCrew?.zone || 'UTTT'}
              </Text>
            </View>
          </View>

          <View style={styles.heroActionsRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/camera')}>
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.primaryBtnText}>Nueva Inspección</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/history')}>
              <Ionicons name="analytics-outline" size={18} color="#176B52" style={{ marginRight: 6 }} />
              <Text style={styles.secondaryBtnText}>Mi Seguimiento</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Notice Banner */}
        <View style={styles.privacyBanner}>
          <Ionicons name="lock-closed" size={18} color="#176B52" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>Acceso Limitado por Perfil Alumno</Text>
            <Text style={styles.privacySub}>
              Desde esta vista solo puedes capturar inspecciones y consultar tus propios árboles asignados y reportes quincenales.
            </Text>
          </View>
        </View>

        {/* Student KPIs Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#EDF6F1' }]}>
              <Ionicons name="checkmark-sharp" size={18} color="#176B52" />
            </View>
            <Text style={styles.kpiVal}>{trees.length}</Text>
            <Text style={styles.kpiLabel}>Árboles Registrados</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#EAF2FB' }]}>
              <Ionicons name="document-text-outline" size={18} color="#4E7AA8" />
            </View>
            <Text style={styles.kpiVal}>{recentEvaluations.length}</Text>
            <Text style={styles.kpiLabel}>Informes Registrados</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: lastObsScore >= 4 ? '#FFF0EE' : '#FFF5DF' }]}>
              <Ionicons 
                name={lastObsScore >= 4 ? 'alert-circle' : 'warning-outline'} 
                size={18} 
                color={lastObsScore >= 4 ? '#C75B52' : '#D99A28'} 
              />
            </View>
            <Text style={[styles.kpiVal, lastObsScore >= 4 && { color: '#C75B52' }]}>
              {lastObsScore} / 6
            </Text>
            <Text style={styles.kpiLabel}>Última Valoración</Text>
          </View>
        </View>

        {/* Assigned Principal Tree Card */}
        {assignedTree && (
          <View style={styles.assignedTreePanel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelKicker}>Asignación Principal</Text>
                <Text style={styles.panelTitle}>Árbol de Seguimiento Quincenal</Text>
              </View>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityBadgeText}>{assignedTree.status || 'ACTIVO'}</Text>
              </View>
            </View>

            <View style={styles.assignedTreeCard}>
              <View style={styles.treeIconCircle}>
                <Ionicons name="leaf" size={24} color="#176B52" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.treeCodeLabel}>Código de Árbol en API</Text>
                <Text style={styles.treeCodeVal}>{assignedTree.code}</Text>
                <Text style={styles.treeMetaSub}>
                  {assignedTree.commonName || 'Especie'} {assignedTree.scientificName ? `· ${assignedTree.scientificName}` : ''}
                </Text>
              </View>
            </View>

            {recentEvaluations.length > 0 && (
              <>
                <Text style={styles.evolutionLabel}>Historial de Inspecciones Registradas en Servidor:</Text>
                <View style={styles.evolutionGrid}>
                  {recentEvaluations.slice(0, 3).map((obs, idx) => {
                    const score = obs?.hawksworth?.totalScore ?? 0;
                    const dateStr = obs?.observationDate ? new Date(obs.observationDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : `Visita ${idx + 1}`;
                    return (
                      <View key={obs.id || obs._id || idx} style={styles.evoCol}>
                        <Text style={styles.evoDate}>{dateStr}</Text>
                        <Text style={styles.evoScore}>{score} / 6</Text>
                        <View style={[styles.evoBar, { height: Math.max(16, score * 9), backgroundColor: score >= 4 ? '#C75B52' : score >= 2 ? '#D99A28' : '#176B52' }]} />
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
            <Ionicons name="time-outline" size={20} color="#176B52" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Tus Últimas Inspecciones en Servidor</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.viewAllText}>Ver Historial →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#176B52" />
            <Text style={styles.loadingText}>Cargando información...</Text>
          </View>
        ) : recentEvaluations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="leaf-outline" size={40} color="#687A74" style={{ marginBottom: 8 }} />
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F5',
  },
  scroll: {
    paddingBottom: 24,
  },
  studentHero: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: '#DCE7E1',
    marginBottom: 16,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF6F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#176B52',
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: '900',
    color: '#163029',
  },
  heroSub: {
    fontSize: 13,
    color: '#687A74',
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '500',
  },
  studentProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF6F1',
    padding: 12,
    borderRadius: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#DCECE4',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#176B52',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  badgeRoleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#176B52',
    textTransform: 'uppercase',
  },
  badgeName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#163029',
  },
  badgeCrew: {
    fontSize: 11,
    color: '#687A74',
    fontWeight: '600',
    marginTop: 1,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#176B52',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#EDF6F1',
    borderWidth: 1,
    borderColor: '#176B52',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#176B52',
    fontWeight: '800',
    fontSize: 13,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF6F1',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCECE4',
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#176B52',
  },
  privacySub: {
    fontSize: 11,
    color: '#687A74',
    marginTop: 2,
    lineHeight: 15,
  },
  kpiGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCE7E1',
    alignItems: 'center',
  },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#163029',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#687A74',
    textAlign: 'center',
    marginTop: 2,
  },
  assignedTreePanel: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE7E1',
    marginBottom: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  panelKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: '#176B52',
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#163029',
  },
  priorityBadge: {
    backgroundColor: '#EDF6F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#176B52',
  },
  assignedTreeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F8F5',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  treeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDF6F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  treeCodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#687A74',
  },
  treeCodeVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#163029',
  },
  treeMetaSub: {
    fontSize: 12,
    color: '#687A74',
  },
  evolutionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#687A74',
    marginBottom: 8,
  },
  evolutionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: '#EDF6F1',
    padding: 14,
    borderRadius: 14,
    height: 90,
  },
  evoCol: {
    alignItems: 'center',
  },
  evoDate: {
    fontSize: 10,
    fontWeight: '700',
    color: '#687A74',
    marginBottom: 2,
  },
  evoScore: {
    fontSize: 11,
    fontWeight: '900',
    color: '#163029',
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
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#163029',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#176B52',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#687A74',
    marginTop: 8,
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE7E1',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#163029',
  },
  emptySub: {
    fontSize: 12,
    color: '#687A74',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
