import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Badge, useTheme } from 'react-native-paper';

export default function EvaluationCard({ evaluation }) {
  const theme = useTheme();

  const getStatusColor = (status) => {
    switch (status) {
      case 'severe': return '#D32F2F';
      case 'moderate': return '#FFA000';
      case 'mild': return '#388E3C';
      default: return theme.colors.primary;
    }
  };

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            {evaluation.treeId} - {evaluation.species}
          </Text>
          <Badge size={24} style={{ backgroundColor: getStatusColor(evaluation.status) }}>
            {evaluation.scale.toFixed(1)}
          </Badge>
        </View>
        <Text variant="bodySmall" style={styles.date}>
          Fecha: {evaluation.date}
        </Text>
        <Text variant="bodyMedium" style={{ marginTop: 8 }}>
          {evaluation.recommendation}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#666',
    marginTop: 4,
  },
});
