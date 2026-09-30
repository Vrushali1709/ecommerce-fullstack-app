import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  RefreshControl,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';

import { useState, useRef, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useCart } from '../../context/CartContext';
import { productsApi, categoriesApi } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import EmptyState from '../../components/EmptyState';
import AppFooter from '../../components/AppFooter';
import MinimalNavbar from '../../components/navigation/MinimalNavbar';

import {
  products as fallbackProducts,
  categories as fallbackCategories,
  Product,
} from '../../data/products';

const SORT_OPTIONS = [
  'Featured & Best Match',
  'Price: Low to High',
  'Price: High to Low',
  'Customer Rating',
  'Newest Arrivals',
];

export default function Explore() {
  const { addToCart } = useCart();
  const flatListRef = useRef<FlatList>(null);

  const [productsList, setProductsList] = useState<Product[]>(fallbackProducts);
  const [categoryList, setCategoryList] = useState<string[]>(fallbackCategories);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Featured & Best Match');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        console.log('Categories API error (using fallback):', catErr);
      }

      // Fetch products
      const res = await productsApi.getAll({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search.trim() ? search.trim() : undefined,
      });

      if (res?.items && Array.isArray(res.items) && res.items.length > 0) {
        setProductsList(res.items);
      } else {
        setProductsList(fallbackProducts);
      }
    } catch (err) {
      console.log('Explore load products fallback:', err);
      setProductsList(fallbackProducts);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCategory, search]);

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

  const handleBuyNow = (product: Product) => {
    addToCart(product);
    router.push('/checkout');
  };

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch =
      !search.trim() ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());

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
    if (selectedSort === 'Customer Rating') {
      return b.rating - a.rating;
    }
    if (selectedSort === 'Newest Arrivals') {
      return ((b as any).isNewArrival ? 1 : 0) - ((a as any).isNewArrival ? 1 : 0);
    }
    return 0; // 'Featured & Best Match'
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedSort('Featured & Best Match');
  };

  return (
    <View className="flex-1 bg-[#FAFAFB]">
      {/* Clean Top Navbar */}
      <MinimalNavbar
        brandText="LUXE STORE"
        showWishlist={true}
        showCart={true}
        showProfile={true}
        showMenu={true}
      />

      {/* 2-Column Catalog FlatList */}
      <FlatList
        ref={flatListRef}
        data={sortedProducts}
        keyExtractor={(item) => `explore-${item.id}`}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#B89758"
            colors={['#B89758']}
          />
        }
        columnWrapperStyle={
          sortedProducts.length > 0 ? { gap: 12 } : undefined
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 40,
        }}
        /* Header Section Below Navbar */
        ListHeaderComponent={
          <View className="mb-4">
            {/* Page Title & Subtitle */}
            <View className="mb-3 px-0.5 pt-1">
              <Text className="text-2xl font-black tracking-tight text-gray-900">
                Explore Collection
              </Text>
              <Text className="mt-0.5 text-xs font-semibold text-gray-500">
                Curated luxury catalog with real-time filters
              </Text>
            </View>

            {/* Search Input Bar */}
            <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-3.5 py-1.5 shadow-sm">
              <Ionicons name="search" size={18} color="#9CA3AF" className="mr-2" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search watches, bags, apparel..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 py-2 text-sm text-gray-900"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </Pressable>
              )}
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={{ paddingVertical: 10 }}
            >
              {categoryList.map((item) => {
                const active = selectedCategory === item;
                return (
                  <Pressable
                    key={`cat-${item}`}
                    onPress={() => setSelectedCategory(item)}
                    className={`mr-2 rounded-full px-4 py-2 border ${
                      active
                        ? 'border-[#B89758] bg-[#B89758]'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Results Count & Dropdown Trigger Row */}
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-xs font-bold text-gray-900">
                {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}
                <Text className="font-normal text-gray-500">
                  {' '}({sortedProducts.length} items)
                </Text>
              </Text>

              {/* Exact Styled Sort Dropdown Trigger Box */}
              <Pressable
                onPress={() => setIsDropdownOpen(true)}
                style={styles.dropdownTrigger}
              >
                <Text style={styles.dropdownTriggerText} numberOfLines={1}>
                  {selectedSort}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#111827" />
              </Pressable>
            </View>
          </View>
        }
        /* Empty Search / Filter State */
        ListEmptyComponent={
          <View className="py-12">
            <EmptyState
              icon="🔍"
              title="No Products Found"
              message="Try searching for another keyword or clearing your category filters."
              buttonText="Reset All Filters"
              onPress={clearFilters}
            />
          </View>
        }
        /* 2-Column Product Grid Item */
        renderItem={({ item }) => (
          <View className="mb-4 flex-1">
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item.id}`)}
              onAddToCart={() => handleAddToCart(item)}
              onBuyNow={() => handleBuyNow(item)}
            />
          </View>
        )}
        /* Footer with Scroll to Top */
        ListFooterComponent={
          <View className="mt-6">
            <AppFooter
              onScrollToTop={() =>
                flatListRef.current?.scrollToOffset({
                  offset: 0,
                  animated: true,
                })
              }
            />
          </View>
        }
      />

      {/* Dropdown Options Popup Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.modalContentWrapper}>
            <View style={styles.dropdownMenu}>
              {/* Dropdown Header Trigger Mirror */}
              <View style={styles.dropdownHeaderActive}>
                <Text style={styles.dropdownTriggerText}>
                  {selectedSort}
                </Text>
                <Ionicons name="chevron-up" size={14} color="#111827" />
              </View>

              {/* Options List */}
              {SORT_OPTIONS.map((opt) => {
                const isSelected = selectedSort === opt;
                return (
                  <Pressable
                    key={`sort-opt-${opt}`}
                    onPress={() => {
                      setSelectedSort(opt);
                      setIsDropdownOpen(false);
                    }}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={15} color="#0369A1" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 165,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownTriggerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 320,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#111827',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  dropdownHeaderActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  optionItemActive: {
    backgroundColor: '#BAE6FD', // Soft Sky Blue highlight matching screenshot
  },
  optionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionTextActive: {
    fontWeight: '800',
    color: '#0369A1',
  },
});