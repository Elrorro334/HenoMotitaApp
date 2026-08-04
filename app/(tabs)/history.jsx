import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Searchbar, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getTreesByCrew, getObservationsByTree } from '../../services/api';
import EvaluationCard from '../../components/EvaluationCard';

export default function HistoryScreen() {
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
      {/* Header Intro Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.pillTag}>
          <Ionicons name="time-outline" size={12} color="#176B52" style={{ marginRight: 4 }} />
          <Text style={styles.pillTagText}>Seguimiento Quincenal del Alumno</Text>
        </View>
        <Text style={styles.headerTitle}>Mis Inspecciones y Expediente</Text>
        <Text style={styles.headerSub}>
          Consulta la valoración Hawksworth por tercios, coordenadas GPS y observaciones registradas en la API.
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#176B52']} />}
      >
        <Searchbar
          placeholder="Buscar por código de árbol o notas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={{ fontSize: 13 }}
          icon={() => <Ionicons name="search-outline" size={18} color="#687A74" />}
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
            <ActivityIndicator size="small" color="#176B52" />
            <Text style={styles.loadingText}>Cargando expediente desde la API...</Text>
          </View>
        ) : filteredObservations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={36} color="#687A74" />
            <Text style={styles.emptyTitle}>Sin Inspecciones Encontradas</Text>
            <Text style={styles.emptySub}>No se encontraron expedientes con los filtros seleccionados en la base de datos.</Text>
          </View>
        ) : (
          filteredObservations.map((evalItem, idx) => (
            <View key={evalItem.id || evalItem._id || idx}>
              <EvaluationCard evaluation={evalItem} />
              
              {evalItem.notes ? (
                <View style={styles.doctorReviewBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Ionicons name="chatbox-ellipses-outline" size={14} color="#176B52" style={{ marginRight: 6 }} />
                    <Text style={styles.doctorReviewTitle}>Notas del Registro:</Text>
                  </View>
                  <Text style={styles.doctorReviewText}>
                    "{evalItem.notes}"
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F5',
  },
  headerBanner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#DCE7E1',
  },
  pillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF6F1',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  pillTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#176B52',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#163029',
  },
  headerSub: {
    fontSize: 12,
    color: '#687A74',
    marginTop: 2,
    lineHeight: 16,
  },
  searchbar: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#DCE7E1',
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE7E1',
  },
  activeChip: {
    backgroundColor: '#EDF6F1',
    borderColor: '#176B52',
  },
  chipText: {
    color: '#687A74',
    fontWeight: '600',
    fontSize: 12,
  },
  activeChipText: {
    color: '#176B52',
    fontWeight: '800',
    fontSize: 12,
  },
  doctorReviewBox: {
    backgroundColor: '#EDF6F1',
    marginHorizontal: 16,
    marginTop: -4,
    marginBottom: 12,
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderColor: '#DCECE4',
    borderTopWidth: 0,
  },
  doctorReviewTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#176B52',
  },
  doctorReviewText: {
    fontSize: 12,
    color: '#163029',
    fontStyle: 'italic',
    lineHeight: 16,
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
    marginTop: 6,
  },
  emptySub: {
    fontSize: 12,
    color: '#687A74',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
