import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-root-toast';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('eve.holt@reqres.in');
  const [password, setPassword] = useState('pistol');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) navigation.replace('Home');
    };
    checkAuth();
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show('Email and password are required', { duration: Toast.durations.SHORT });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://reqres.in/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        await AsyncStorage.setItem('token', data.token);
        navigation.replace('Home');
      } else {
        Toast.show(data.error || 'Login failed', { duration: Toast.durations.SHORT });
      }
    } catch (error) {
      Toast.show('Network error', { duration: Toast.durations.SHORT });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, alignSelf: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12,
    marginBottom: 16, fontSize: 16,
  },
  button: {
    backgroundColor: '#1976d2', padding: 16, borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
