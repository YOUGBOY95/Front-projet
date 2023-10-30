import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';

const Splash = () => {
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = new Animated.Value(0); // Initialiser l'opacité à 0

  useEffect(() => {
    // Animation d'opacité
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000, // 1000ms (1 seconde) pour l'animation
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Simulation d'une tâche asynchrone (par exemple, chargement du logo)
    setTimeout(() => {
      setIsLoading(false);
      
    }, 3000); // 1000ms (1 seconde) pour simuler le chargement
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
          <Image source={require('./cerveau1.png')} style={styles.logo} resizeMode="contain" />
          {/* Mettez le texte à droite du logo */}
          <Text style={styles.appName}>TalkWave</Text>
        </Animated.View>
      </View>
    );
  }

  return null; // Rendu nul quand le chargement est terminé (l'écran de splash disparaîtra)
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10, // Ajoutez une marge à droite du logo pour l'espace
  },
  appName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Splash;
