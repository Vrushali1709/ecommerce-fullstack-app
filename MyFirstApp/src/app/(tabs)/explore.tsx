import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';

import { useState, useRef, useEffect, useCallback } from 'react';
import { router } from 'expo-router';

import { useCart } from '../../context/CartContext';
import { productsApi, categoriesApi } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import EmptyState from '../../components/EmptyState';
import AppFooter from '../../components/AppFooter';
import MinimalNavbar from '../../components/navigation/MinimalNavbar';

import {
  products as fallbackProducts,
  categories as fallbackCategories,
  sortOptions,
  Product,
} from '../../data/products';

export default function Explore() {
  const { addToCart } = useCart();
  const flatListRef = useRef<FlatList>(null);

  const [productsList, setProductsList] = useState<Product[]>(fallbackProducts);
  const [categoryList, setCategoryList] = useState<string[]>(fallbackCategories);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Default');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Fetch categories
      try {
        const cats = await categoriesApi.getAll();
        if (cats && Array.isArray(cats) && cats.length > 0) {
          setCategoryList(['All', ...cats.map((c) => c.name)]);
        }
      } catch (catErr) {
        console.log('Categories API error:', catErr);
      }

      // Fetch products
      const res = await productsApi.getAll({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search.trim() ? search.trim() : undefined,
        sort: selectedSort !== 'Default' ? selectedSort : undefined,
      });

      if (res?.items && Array.isArray(res.items) && res.items.length > 0) {
        setProductsList(res.items);
      }
    } catch (err) {
      console.log('Explore load products note (offline fallback):', err);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCategory, search, selectedSort]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    Alert.alert(
      'Added to Cart 🛒',
      `${product.name} has been added to your cart.`
    );
  };

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch =
      !search.trim() ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'Price: Low to High') {
      return a.priceValue - b.priceValue;
    }
    if (selectedSort === 'Price: High to Low') {
      return b.priceValue - a.priceValue;
    }
    if (selectedSort === 'Rating: High to Low') {
      return b.rating - a.rating;
    }
    return 0;
  });

  return (
    <View className="flex-1 bg-gray-100">
      {/* Top Navbar */}
      <MinimalNavbar
        title="Explore Collection"
        subtitle="Curated catalog & filters"
        showWishlist={true}
        showCart={true}
      />

      {/* Search and Filters Header */}
      <View className="bg-white px-5 pb-4 pt-2 border-b border-gray-100">
        {/* Search Input */}
        <View className="flex-row items-center rounded-2xl bg-gray-100 px-4 py-1">
          <Text className="mr-2 text-base">🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by keywords, style, material..."
            placeholderTextColor="#888"
            className="flex-1 py-3 text-base text-black"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Text className="text-base text-gray-500">✕</Text>
            </Pressable>
          )}
        </View>

        {/* Categories */}
        <FlatList
          data={categoryList}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          className="mt-3.5"
          renderItem={({ item }) => {
            const active = selectedCategory === item;
            return (
              <Pressable
                onPress={() => setSelectedCategory(item)}
                className={`mr-2.5 rounded-full px-4 py-2 ${
                  active ? 'bg-black' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    active ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />

        {/* Sort Options */}
        <View className="mt-3">
          <FlatList
            data={sortOptions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const active = selectedSort === item;
              return (
                <Pressable
                  onPress={() => setSelectedSort(item)}
                  className={`mr-2 rounded-full border px-3 py-1.5 ${
                    active
                      ? 'border-black bg-black'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      active ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </View>

      {/* Product List */}
      <FlatList
        ref={flatListRef}
        data={sortedProducts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000"
          />
        }
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
        ListFooterComponent={
          <AppFooter
            onScrollToTop={() =>
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              })
            }
          />
        }
        ListHeaderComponent={
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-black">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </Text>
            <Text className="text-xs text-gray-500 font-medium">
              Showing {sortedProducts.length} result(s)
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title="No Results Found"
            message="Try searching for something else or clearing your filters."
            buttonText="Reset Filters"
            onPress={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedSort('Default');
            }}
          />
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/product/${item.id}`)}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
      />
    </View>
  );
}