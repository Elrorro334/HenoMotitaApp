import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function EvaluationCard({ evaluation }) {
  // Extract fields from either raw backend observation response or formatted object
  const totalScore = evaluation?.hawksworth?.totalScore ?? evaluation?.scale ?? 0;
  const treeCode = evaluation?.tree?.code || evaluation?.treeId || 'Árbol';
  const treeSpecies = evaluation?.tree?.commonName || evaluation?.species || 'Sin Especie';
  const notes = evaluation?.notes || evaluation?.comments || '';
  
  const rawDate = evaluation?.observationDate || evaluation?.date || evaluation?.createdAt;
  const formattedDate = rawDate 
    ? new Date(rawDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Fecha desconocida';

  // Severity config based on Hawksworth 0-6 score
  const getStatusConfig = (score) => {
    if (score >= 4) {
      return { 
        bg: '#FEE2E2', 
        text: '#DC2626', 
        label: 'SEVERO', 
        icon: 'alert-circle',
        rec: 'Poda sanitaria inmediata del dosel afectado e inspección intensiva.'
      };
    } else if (score >= 2) {
      return { 
        bg: '#FEF3C7', 
        text: '#D97706', 
        label: 'MODERADO', 
        icon: 'warning',
        rec: 'Remoción manual selectiva de heno motita y seguimiento quincenal.'
      };
    } else {
      return { 
        bg: '#DCFCE7', 
        text: '#16A34A', 
        label: 'LEVE / SANO', 
        icon: 'checkmark-circle',
        rec: 'Monitoreo preventivo mensual y preservación de salud foliar.'
      };
    }
  };

  const statusCfg = getStatusConfig(totalScore);

  return (
    <Card style={styles.card} mode="contained">
      <Card.Content style={styles.cardContent}>
        <View style={styles.rowTop}>
          <View style={styles.infoCol}>
            <Text style={styles.treeTitle}>
              {treeCode} <Text style={styles.speciesText}>({treeSpecies})</Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
              <Ionicons name="calendar-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>

          <View style={[styles.badgePill, { backgroundColor: statusCfg.bg }]}>
            <Ionicons name={statusCfg.icon} size={14} color={statusCfg.text} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeScaleText, { color: statusCfg.text }]}>
              Hawksworth: {totalScore} / 6
            </Text>
          </View>
        </View>

        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationLabel}>Diagnóstico y Acción Técnica:</Text>
          <Text style={styles.recommendationText} numberOfLines={2}>
            {statusCfg.rec}
          </Text>
        </View>

        {notes ? (
          <View style={styles.commentsBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Ionicons name="chatbox-ellipses-outline" size={13} color="#0284C7" style={{ marginRight: 4 }} />
              <Text style={styles.commentsLabel}>Observaciones del Inspector:</Text>
            </View>
            <Text style={styles.commentsText} numberOfLines={2}>
              {notes}
            </Text>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  treeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  speciesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeScaleText: {
    fontWeight: '800',
    fontSize: 12,
  },
  recommendationBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#16A34A',
  },
  recommendationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  recommendationText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    lineHeight: 18,
  },
  commentsBox: {
    marginTop: 8,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
  },
  commentsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  commentsText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
