import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ThirdsOverlay({ showGrid = true }) {
  if (!showGrid) return null;

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      {/* Corner Target HUD Reticles */}
      <View style={[styles.cornerReticle, styles.topLeft]} />
      <View style={[styles.cornerReticle, styles.topRight]} />
      <View style={[styles.cornerReticle, styles.bottomLeft]} />
      <View style={[styles.cornerReticle, styles.bottomRight]} />

      {/* Top Third */}
      <View style={[styles.third, styles.topThird]}>
        <View style={styles.glassBadge}>
          <Ionicons name="filter-outline" size={14} color="#5EEAD4" style={{ marginRight: 6 }} />
          <Text style={styles.label}>TERCIO SUPERIOR (COPA ALTA)</Text>
        </View>
      </View>

      {/* Middle Third */}
      <View style={[styles.third, styles.middleThird]}>
        <View style={styles.glassBadgeActive}>
          <Ionicons name="git-commit-outline" size={14} color="#FDE047" style={{ marginRight: 6 }} />
          <Text style={styles.labelActive}>TERCIO MEDIO (DOSEL PRINCIPAL)</Text>
        </View>
      </View>

      {/* Bottom Third */}
      <View style={[styles.third, styles.bottomThird]}>
        <View style={styles.glassBadge}>
          <Ionicons name="leaf-outline" size={14} color="#5EEAD4" style={{ marginRight: 6 }} />
          <Text style={styles.label}>TERCIO INFERIOR (RAMAS BAJAS)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  third: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topThird: {
    borderTopWidth: 0,
  },
  middleThird: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.4)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(253, 224, 71, 0.03)',
  },
  bottomThird: {
    borderBottomWidth: 0,
  },
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 63, 50, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.3)',
  },
  glassBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 63, 50, 0.90)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.6)',
  },
  label: {
    color: '#E6F4F1',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#FEF08A',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  // HUD Target Corners
  cornerReticle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#5EEAD4',
  },
  topLeft: {
    top: 12,
    left: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 12,
    right: 12,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
});
