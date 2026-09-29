import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';

import { useEffect, useState, useRef, useCallback } from 'react';
import { router } from 'expo-router';

import { useCart } from '../../context/CartContext';
import { productsApi, categoriesApi, healthApi } from '../../services/api';

import ProductCard from '../../components/ProductCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import AppFooter from '../../components/AppFooter';
import MinimalNavbar from '../../components/navigation/MinimalNavbar';

import {
  products as fallbackProducts,
  categories as fallbackCategories,
  sortOptions,
  Product,
} from '../../data/products';

export default function Home() {
  const { addToCart } = useCart();

  const [productsList, setProductsList] = useState<Product[]>(fallbackProducts);
  const [categoryList, setCategoryList] = useState<string[]>(fallbackCategories);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Default');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState<boolean | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // ================= LOAD PRODUCTS FROM API =================

  const loadProducts = useCallback(async (isPullRefresh: boolean = false) => {
    if (!isPullRefresh) setLoading(true);
    setError(false);

    try {
      // 1. Fetch categories
      try {
        const catRes = await categoriesApi.getAll();
        if (catRes && Array.isArray(catRes) && catRes.length > 0) {
          const names = ['All', ...catRes.map((c) => c.name)];
          setCategoryList(names);
        }
      } catch (catErr) {
        console.log('Categories API error (using fallback):', catErr);
      }

      // 2. Fetch products
      const prodRes = await productsApi.getAll({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search.trim() ? search.trim() : undefined,
        sort: selectedSort !== 'Default' ? selectedSort : undefined,
      });

      if (prodRes && Array.isArray(prodRes.items) && prodRes.items.length > 0) {
        setProductsList(prodRes.items);
        setIsLiveApi(true);
      } else {
        // Fallback to local if empty or offline
        setProductsList(fallbackProducts);
        setIsLiveApi(false);
      }
    } catch (apiError) {
      console.log('Backend connection error (using local data):', apiError);
      setProductsList(fallbackProducts);
      setIsLiveApi(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, search, selectedSort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts(true);
  };

  // ================= ADD TO CART =================

  const handleAddToCart = (product: Product) => {
    addToCart(product);

    Alert.alert(
      'Added to Cart 🛍️',
      `${product.name} has been added to your cart.`
    );
  };

  // ================= FILTER / SORT =================

  const filteredProducts = productsList.filter((product) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      product.name.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText) ||
      product.description.toLowerCase().includes(searchText);

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

  // ================= CLEAR FILTER =================

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedSort('Default');
  };

  // ================= LOADING =================

  if (loading && !refreshing) {
    return (
      <LoadingState message="Connecting to Live Store Collection..." />
    );
  }

  // ================= ERROR =================

  if (error) {
    return (
      <ErrorState
        message="We couldn't load the collection. Please try again."
        onRetry={() => loadProducts()}
      />
    );
  }

  // ================= HOME =================

  return (
    <View className="flex-1 bg-[#F7F7F5]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <MinimalNavbar
        brandText="LUXE STORE"
        showSearch={false}
        showWishlist={true}
        showCart={true}
      />

      {/* =====================================================
          MAIN PRODUCTS LIST
      ===================================================== */}

      <FlatList
        ref={flatListRef}
        data={sortedProducts}
        keyExtractor={(item) => item.id}
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
        columnWrapperStyle={{
          gap: 12,
        }}
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: 16,
        }}

        /* =====================================================
            HEADER
        ===================================================== */

        ListHeaderComponent={
          <View>

            {/* LIVE API STATUS BADGE */}
            <View className="mb-2 mt-2 flex-row items-center justify-between">
              <View className="flex-row items-center rounded-full bg-white px-3 py-1 border border-gray-200">
                <View
                  className={`mr-2 h-2 w-2 rounded-full ${
                    isLiveApi ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <Text className="text-[11px] font-semibold text-gray-700">
                  {isLiveApi ? 'FastAPI Backend Live 🟢' : 'Local / Offline Mode 🟠'}
                </Text>
              </View>

              <Pressable
                onPress={() => onRefresh()}
                className="flex-row items-center px-2 py-1"
              >
                <Text className="text-xs font-semibold text-[#B89758]">
                  🔄 Refresh API
                </Text>
              </Pressable>
            </View>

            {/* HERO / WELCOME */}

            <View className="mb-5 mt-1 rounded-[28px] bg-black px-6 py-7">

              <Text className="mb-2 text-xs font-semibold uppercase tracking-[3px] text-[#B89758]">
                Premium Collection
              </Text>

              <Text className="max-w-[280px] text-3xl font-bold leading-9 text-white">
                Discover Your
                {'\n'}
                Signature Style
              </Text>

              <Text className="mt-3 max-w-[290px] text-sm leading-5 text-gray-300">
                Curated essentials synced directly with our real-time database.
              </Text>

              <Pressable
                onPress={() => {
                  setSelectedCategory('All');
                  setSearch('');
                }}
                className="mt-5 self-start rounded-full bg-[#B89758] px-5 py-3"
              >
                <Text className="text-sm font-bold text-white">
                  Explore Collection
                </Text>
              </Pressable>

            </View>

            {/* =================================================
                SEARCH
            ================================================= */}

            <View className="mb-4">

              <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-1">

                <Text className="mr-3 text-lg">
                  🔍
                </Text>

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search products in database..."
                  placeholderTextColor="#999"
                  className="flex-1 py-3 text-[15px] text-black"
                  returnKeyType="search"
                />

                {search.length > 0 && (
                  <Pressable
                    onPress={() => setSearch('')}
                    className="ml-2 h-7 w-7 items-center justify-center rounded-full bg-gray-100"
                  >
                    <Text className="text-xs text-gray-600">
                      ✕
                    </Text>
                  </Pressable>
                )}

              </View>

            </View>

            {/* =================================================
                CATEGORY TITLE
            ================================================= */}

            <View className="mb-3 flex-row items-center justify-between">

              <Text className="text-lg font-bold text-gray-900">
                Categories
              </Text>

              {selectedCategory !== 'All' && (
                <Pressable onPress={clearFilters}>
                  <Text className="text-xs font-semibold text-[#9A7B3F]">
                    Clear
                  </Text>
                </Pressable>
              )}

            </View>

            {/* =================================================
                CATEGORIES
            ================================================= */}

            <FlatList
              data={categoryList}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              nestedScrollEnabled
              contentContainerStyle={{
                paddingBottom: 18,
              }}
              renderItem={({ item }) => {

                const active = selectedCategory === item;

                return (
                  <Pressable
                    onPress={() => setSelectedCategory(item)}
                    className={`mr-2.5 rounded-full border px-5 py-2.5 ${
                      active
                        ? 'border-black bg-black'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        active
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />

            {/* =================================================
                PRODUCTS HEADER
            ================================================= */}

            <View className="mb-3 mt-1 flex-row items-end justify-between">

              <View>

                <Text className="text-xl font-bold text-gray-900">
                  {selectedCategory === 'All'
                    ? 'All Products'
                    : selectedCategory}
                </Text>

                <Text className="mt-1 text-xs text-gray-500">
                  {sortedProducts.length} items available
                </Text>

              </View>

              <Pressable
                onPress={() => {
                  setSelectedSort(
                    selectedSort === 'Default'
                      ? 'Price: Low to High'
                      : 'Default'
                  );
                }}
                className="flex-row items-center rounded-full border border-gray-200 bg-white px-3 py-2"
              >
                <Text className="mr-1 text-xs">
                  ↕
                </Text>

                <Text className="text-xs font-semibold text-gray-700">
                  Sort
                </Text>
              </Pressable>

            </View>

            {/* =================================================
                SORT OPTIONS
            ================================================= */}

            {selectedSort !== 'Default' && (
              <View className="mb-4">

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
                        className={`mr-2 rounded-full border px-4 py-2 ${
                          active
                            ? 'border-[#B89758] bg-[#B89758]'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            active
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    );
                  }}
                />

              </View>
            )}

          </View>
        }

        /* =====================================================
            EMPTY STATE
        ===================================================== */

        ListEmptyComponent={
          <View className="py-10">

            <EmptyState
              icon="🔍"
              title="No Products Found"
              message="Try another search term or category."
              buttonText="Clear Filters"
              onPress={clearFilters}
            />

          </View>
        }

        /* =====================================================
            PRODUCT CARD
        ===================================================== */

        renderItem={({ item }) => (

          <View className="mb-4 flex-1">

            <ProductCard
              product={item}
              onPress={() =>
                router.push(`/product/${item.id}`)
              }
              onAddToCart={() =>
                handleAddToCart(item)
              }
            />

          </View>

        )}

        /* =====================================================
            FOOTER
        ===================================================== */

        ListFooterComponent={
          <View className="mt-5">

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

    </View>
  );
}