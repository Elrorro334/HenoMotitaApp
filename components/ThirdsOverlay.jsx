import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function ThirdsOverlay() {
  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <View style={[styles.third, styles.topThird]}>
        <Text style={styles.label}>Tercio Superior</Text>
      </View>
      <View style={[styles.third, styles.middleThird]}>
        <Text style={styles.label}>Tercio Medio</Text>
      </View>
      <View style={[styles.third, styles.bottomThird]}>
        <Text style={styles.label}>Tercio Inferior</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  third: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
  topThird: {
    borderTopWidth: 0,
  },
  middleThird: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderStyle: 'dashed',
  },
  bottomThird: {
    borderBottomWidth: 0,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
