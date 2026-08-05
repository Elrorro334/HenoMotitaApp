import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Text, Searchbar, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getTreesByCrew, getObservationsByTree } from '../../services/api';
import EvaluationCard from '../../components/EvaluationCard';
import { colors, fonts, spacing, borderRadius, layout } from '../../constants/theme';

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  
  const { activeCrew, crews, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trees, setTrees] = useState([]);
  const [observations, setObservations] = useState([]);

  const loadHistoryData = useCallback(async () => {
    try {
      const crewId = activeCrew?.id || activeCrew?._id || (crews && crews[0] ? (crews[0].id || crews[0]._id) : null);
      if (!crewId) {
        setLoading(false);
        return;
      }

      const treeRes = await getTreesByCrew(crewId).catch(() => []);
      const treeList = Array.isArray(treeRes) ? treeRes : (treeRes.trees || []);
      setTrees(treeList);

      let allObs = [];
      for (const tree of treeList) {
        const tId = tree.id || tree._id;
        const obsRes = await getObservationsByTree(tId).catch(() => []);
        const obsList = Array.isArray(obsRes) ? obsRes : (obsRes.observations || []);
        
        obsList.forEach(obs => {
          allObs.push({
            ...obs,
            tree,
          });
        });
      }

      allObs.sort((a, b) => new Date(b.createdAt || b.observationDate) - new Date(a.createdAt || a.observationDate));
      setObservations(allObs);
    } catch (error) {
      console.warn('Error loading HenoTrack history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCrew, crews]);

  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistoryData();
  };

  const filteredObservations = observations.filter(obs => {
    const treeCode = obs?.tree?.code || '';
    const species = obs?.tree?.commonName || '';
    const notes = obs?.notes || '';
    
    const matchesSearch = !searchQuery || 
      treeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notes.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'mezquite') return matchesSearch && species.toLowerCase().includes('mezquite');
    if (selectedFilter === 'huizache') return matchesSearch && species.toLowerCase().includes('huizache');
    return matchesSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: spacing.xxxl, alignItems: 'center' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={[styles.mainWrapper, { maxWidth: layout.contentMaxWidthAuth }]}>
          
          {/* Header Intro Banner */}
          <View style={styles.headerBanner}>
            <View style={styles.pillTag}>
              <Ionicons name="time-outline" size={12} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.pillTagText}>SEGUIMIENTO QUINCENAL DEL ALUMNO</Text>
            </View>
            <Text style={styles.headerTitle}>Mis Inspecciones y Expediente</Text>
            <Text style={styles.headerSub}>
              Consulta la valoración Hawksworth por tercios, coordenadas GPS y observaciones registradas en la API.
            </Text>
          </View>

          <Searchbar
            placeholder="Buscar por código de árbol o notas..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ fontSize: 13, fontFamily: fonts.base }}
            icon={() => <Ionicons name="search-outline" size={18} color={colors.textSecondary} />}
          />

          {/* Species Filter Chips */}
          <View style={styles.chipRow}>
            <Chip 
              selected={selectedFilter === 'todos'} 
              onPress={() => setSelectedFilter('todos')}
              style={[styles.chip, selectedFilter === 'todos' && styles.activeChip]}
              textStyle={selectedFilter === 'todos' ? styles.activeChipText : styles.chipText}
            >
              Todas las Inspecciones ({observations.length})
            </Chip>
            <Chip 
              selected={selectedFilter === 'mezquite'} 
              onPress={() => setSelectedFilter('mezquite')}
              style={[styles.chip, selectedFilter === 'mezquite' && styles.activeChip]}
              textStyle={selectedFilter === 'mezquite' ? styles.activeChipText : styles.chipText}
            >
              Mezquites
            </Chip>
            <Chip 
              selected={selectedFilter === 'huizache'} 
              onPress={() => setSelectedFilter('huizache')}
              style={[styles.chip, selectedFilter === 'huizache' && styles.activeChip]}
              textStyle={selectedFilter === 'huizache' ? styles.activeChipText : styles.chipText}
            >
              Huizaches
            </Chip>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando expediente desde la API...</Text>
            </View>
          ) : filteredObservations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={36} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Sin Inspecciones Encontradas</Text>
              <Text style={styles.emptySub}>No se encontraron expedientes con los filtros seleccionados en la base de datos.</Text>
            </View>
          ) : (
            filteredObservations.map((evalItem, idx) => (
              <View key={evalItem.id || evalItem._id || idx} style={{ width: '100%' }}>
                <EvaluationCard evaluation={evalItem} />
                
                {evalItem.notes ? (
                  <View style={styles.doctorReviewBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <Ionicons name="chatbox-ellipses-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.doctorReviewTitle}>NOTAS DEL REGISTRO:</Text>
                    </View>
                    <Text style={styles.doctorReviewText}>
                      "{evalItem.notes}"
                    </Text>
                  </View>
                ) : null}
              </View>
            ))
          )}

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
  mainWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  headerBanner: {
    backgroundColor: colors.mainSurface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  pillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryButton,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: borderRadius.input,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  pillTagText: {
    fontFamily: fonts.base,
    fontSize: 10.5,
    fontWeight: '650',
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '600',
    color: colors.headerGreen,
  },
  headerSub: {
    fontFamily: fonts.base,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  searchbar: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.mainSurface,
    borderRadius: borderRadius.input,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.mainSurface,
    borderRadius: borderRadius.select,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activeChip: {
    backgroundColor: colors.secondaryButton,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.base,
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  activeChipText: {
    fontFamily: fonts.base,
    color: colors.primary,
    fontWeight: '650',
    fontSize: 12,
  },
  doctorReviewBox: {
    backgroundColor: colors.secondaryButton,
    marginHorizontal: spacing.lg,
    marginTop: -4,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderBottomLeftRadius: borderRadius.card,
    borderBottomRightRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderTopWidth: 0,
  },
  doctorReviewTitle: {
    fontFamily: fonts.base,
    fontSize: 10.5,
    fontWeight: '650',
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  doctorReviewText: {
    fontFamily: fonts.base,
    fontSize: 12.5,
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 17,
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
    marginTop: 6,
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
