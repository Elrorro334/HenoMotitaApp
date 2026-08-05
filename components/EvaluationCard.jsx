import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, borderRadius } from '../constants/theme';

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

  // Severity config based on Hawksworth 0-6 score using user palette
  const getStatusConfig = (score) => {
    if (score >= 4) {
      return { 
        bg: colors.errorBg, 
        text: colors.errorText,
        borderColor: colors.errorBorder,
        label: 'SEVERO', 
        icon: 'alert-circle',
        rec: 'Poda sanitaria inmediata del dosel afectado e inspección intensiva.'
      };
    } else if (score >= 2) {
      return { 
        bg: colors.warningBg, 
        text: colors.warningText, 
        borderColor: colors.warningText,
        label: 'MODERADO', 
        icon: 'warning',
        rec: 'Remoción manual selectiva de heno motita y seguimiento quincenal.'
      };
    } else {
      return { 
        bg: colors.positiveBg, 
        text: colors.positiveText, 
        borderColor: colors.positiveText,
        label: 'LEVE / SANO', 
        icon: 'checkmark-circle',
        rec: 'Monitoreo preventivo mensual y preservación de salud foliar.'
      };
    }
  };

  const statusCfg = getStatusConfig(totalScore);

  return (
    <Card style={[styles.card, { borderLeftWidth: 3, borderLeftColor: statusCfg.borderColor }]} mode="contained">
      <Card.Content style={styles.cardContent}>
        <View style={styles.rowTop}>
          <View style={styles.infoCol}>
            <Text style={styles.treeTitle}>
              {treeCode} <Text style={styles.speciesText}>({treeSpecies})</Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
              <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
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

        <View style={[styles.recommendationBox, { borderLeftColor: statusCfg.borderColor }]}>
          <Text style={styles.recommendationLabel}>DIAGNÓSTICO Y ACCIÓN TÉCNICA:</Text>
          <Text style={styles.recommendationText} numberOfLines={2}>
            {statusCfg.rec}
          </Text>
        </View>

        {notes ? (
          <View style={styles.commentsBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Ionicons name="chatbox-ellipses-outline" size={13} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.commentsLabel}>OBSERVACIONES DEL INSPECTOR:</Text>
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
    backgroundColor: colors.mainSurface,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.headerGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
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
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  speciesText: {
    fontFamily: fonts.base,
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  dateText: {
    fontFamily: fonts.base,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.select,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeScaleText: {
    fontFamily: fonts.base,
    fontWeight: '650',
    fontSize: 12,
  },
  recommendationBox: {
    marginTop: 12,
    backgroundColor: colors.panelSurface,
    padding: 12,
    borderRadius: borderRadius.input,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentGreen,
  },
  recommendationLabel: {
    fontFamily: fonts.base,
    fontSize: 11,
    fontWeight: '650',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  recommendationText: {
    fontFamily: fonts.base,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
    lineHeight: 18,
  },
  commentsBox: {
    marginTop: 8,
    backgroundColor: colors.secondaryButton,
    padding: 10,
    borderRadius: borderRadius.input,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  commentsLabel: {
    fontFamily: fonts.base,
    fontSize: 11,
    fontWeight: '650',
    color: colors.highlightText,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  commentsText: {
    fontFamily: fonts.base,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

