import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PRODUCTS_KEY = 'products';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = await AsyncStorage.getItem(PRODUCTS_KEY);
      setProducts(p ? JSON.parse(p) : []);
    } catch {
      Toast.show('Failed to load products', { duration: Toast.durations.SHORT });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadProducts);
    return unsubscribe;
  }, [navigation, loadProducts]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const deleteProduct = async (name) => {
    Alert.alert('Delete Product', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const newProducts = products.filter(p => p.name !== name);
          await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts));
          setProducts(newProducts);
          Toast.show('Product deleted', { duration: Toast.durations.SHORT });
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#1976d2" />
      </TouchableOpacity>
      <TextInput
        style={styles.search}
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
      />
      {!filtered.length ? (
        <View style={styles.center}><Text style={styles.noproduct}>No Product Found</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.imageBox} />
              ) : (
                <View style={styles.imageBoxPlaceholder}>
                  <Text style={styles.imageText}>IMG</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>${item.price}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteProduct(item.name)}>
                <Icon name="delete" size={28} color="#b00020" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddProduct')}>
        <Icon name="add" color="#fff" size={32} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 56 },
  logoutBtn: {
    position: 'absolute', top: 32, right: 24, zIndex: 2, backgroundColor: '#fff',
    borderRadius: 20, padding: 6, borderWidth: 1, borderColor: '#1976d2',
  },
  search: {
    borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 12,
    marginBottom: 12, fontSize: 16,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noproduct: { fontSize: 18, color: '#999' },
  productItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
    borderRadius: 8, padding: 12, marginBottom: 10,
  },
  imageBox: {
    width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#eee',
  },
  imageBoxPlaceholder: {
    width: 40, height: 40, backgroundColor: '#e0e0e0', borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  imageText: { color: '#888', fontWeight: 'bold' },
  productName: { fontSize: 17, fontWeight: 'bold' },
  productPrice: { color: '#1976d2', fontSize: 16, marginTop: 2 },
  fab: {
    position: 'absolute', right: 24, bottom: 32, backgroundColor: '#1976d2',
    borderRadius: 28, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
});
