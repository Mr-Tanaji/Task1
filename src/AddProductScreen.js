import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-root-toast';

const PRODUCTS_KEY = 'products';

export default function AddProductScreen({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim() || !price.trim()) {
      Toast.show('Product Name and Price are required', { duration: Toast.durations.SHORT });
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      Toast.show('Price must be a positive number', { duration: Toast.durations.SHORT });
      return;
    }
    setLoading(true);
    try {
      const p = await AsyncStorage.getItem(PRODUCTS_KEY);
      const products = p ? JSON.parse(p) : [];
      if (products.some(prod => prod.name.toLowerCase() === name.trim().toLowerCase())) {
        Toast.show('Product name already exists', { duration: Toast.durations.SHORT });
        setLoading(false);
        return;
      }
      const product = { name: name.trim(), price: price.trim(), imageUrl: imageUrl.trim() || undefined };
      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify([product, ...products]));
      Toast.show('Product added!', { duration: Toast.durations.SHORT });
      navigation.goBack();
    } catch {
      Toast.show('Failed to add product', { duration: Toast.durations.SHORT });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Product</Text>
      <TextInput
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChangeText={setImageUrl}
        style={styles.input}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleAdd} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, alignSelf: 'center' },
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
