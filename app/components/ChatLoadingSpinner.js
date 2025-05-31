import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const ChatLoadingSpinner = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6B46C1" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 50,
    alignSelf: 'center',
  },
});

export default ChatLoadingSpinner;