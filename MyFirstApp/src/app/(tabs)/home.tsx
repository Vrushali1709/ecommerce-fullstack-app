import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useCart } from '../../context/CartContext';
import { productsApi, categoriesApi } from '../../services/api';

import ProductCard from '../../components/ProductCard';
import HorizontalProductCard from '../../components/HorizontalProductCard';
import BestSellerCard from '../../components/BestSellerCard';
import AllProductsCarousel from '../../components/AllProductsCarousel';
import CustomerReviews from '../../components/CustomerReviews';
import HeroCarousel from '../../components/HeroCarousel';
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

const CATEGORY_METADATA: Record<string, { image: string; label: string }> = {
  All: {
    label: 'All Items',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80',
  },
  Watches: {
    label: 'Watches',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80',
  },
  Bags: {
    label: 'Bags & Totes',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
  },
  Shoes: {
    label: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
  },
  Clothing: {
    label: 'Apparel',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&q=80',
  },
  Electronics: {
    label: 'Audio Tech',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  },
  'Smart Gadgets': {
    label: 'Gadgets',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80',
  },
  Accessories: {
    label: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80',
  },
  Jewelry: {
    label: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80',
  },
  Beauty: {
    label: 'Beauty',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80',
  },
};

export default function Home() {
  const { addToCart } = useCart();

  const [productsList, setProductsList] = useState<Product[]>(fallbackProducts);
  const [categoryList, setCategoryList] = useState<string[]>(fallbackCategories);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Default');
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

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
      } else {
        setProductsList(fallbackProducts);
      }
    } catch (apiError) {
      console.log('Backend connection error (using local data):', apiError);
      setProductsList(fallbackProducts);
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

  const handleBuyNow = (product: Product) => {
    addToCart(product);
    router.push('/checkout');
  };

  // ================= FILTER / SORT =================

  const filteredProducts = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return productsList.filter((product) => {
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
  }, [productsList, search, selectedCategory]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
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
  }, [filteredProducts, selectedSort]);

  // Featured Products (rating >= 4.5 or with discounts)
  const featuredProducts = useMemo(() => {
    return productsList.slice(0, 6);
  }, [productsList]);

  // New Arrivals (reverse or slice)
  const newArrivals = useMemo(() => {
    return [...productsList].reverse().slice(0, 6);
  }, [productsList]);

  // Best Sellers (rating >= 4.7)
  const bestSellers = useMemo(() => {
    return productsList.filter((p) => p.rating >= 4.7).slice(0, 6);
  }, [productsList]);

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
          TOP WEBSITE-STYLE NAVBAR
      ===================================================== */}
      <MinimalNavbar
        brandText="LUXE STORE"
        showWishlist={true}
        showCart={true}
        showProfile={true}
        showMenu={true}
      />

      {/* =====================================================
          MAIN PRODUCTS LIST & PAGE STRUCTURE
      ===================================================== */}
      <FlatList
        key={viewMode === 'grid' ? 'grid-view-2col' : 'carousel-view-1col'}
        ref={flatListRef}
        data={viewMode === 'grid' ? sortedProducts : []}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
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
          viewMode === 'grid' && sortedProducts.length > 0
            ? { gap: 12 }
            : undefined
        }
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: 16,
        }}
        /* =====================================================
            HEADER SECTIONS (Website Style)
        ===================================================== */
        ListHeaderComponent={
          <View>
            {/* 1. TOP SEARCH BAR */}
            <View className="mb-4 mt-3">
              <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-1.5 shadow-sm">
                <Ionicons name="search" size={20} color="#9CA3AF" className="mr-2" />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search luxury products, brands, categories..."
                  placeholderTextColor="#9CA3AF"
                  className="ml-2 flex-1 py-2.5 text-[14px] text-black"
                  returnKeyType="search"
                />

                {search.length > 0 && (
                  <Pressable
                    onPress={() => setSearch('')}
                    className="ml-2 h-7 w-7 items-center justify-center rounded-full bg-gray-100"
                  >
                    <Ionicons name="close" size={16} color="#4B5563" />
                  </Pressable>
                )}
              </View>
            </View>

            {/* 2. LUXURY HERO CAROUSEL WITH ANIMATIONS & PAGINATION */}
            <HeroCarousel onSelectCategory={(cat) => setSelectedCategory(cat)} />

            {/* 3. SHOP BY CATEGORIES (Circular Photographic Avatars) */}
            <View className="mb-7">
              <View className="mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-gray-900">
                    Shop by Category
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Curated collections tailored for every style
                  </Text>
                </View>

                {selectedCategory !== 'All' && (
                  <Pressable onPress={clearFilters} className="rounded-full bg-amber-50 px-3 py-1">
                    <Text className="text-xs font-bold text-[#9A7B3F]">
                      Clear Filter
                    </Text>
                  </Pressable>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={{ paddingRight: 8, paddingVertical: 4 }}
              >
                {categoryList.map((item) => {
                  const active = selectedCategory === item;
                  const catData = CATEGORY_METADATA[item] || {
                    label: item,
                    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80',
                  };

                  return (
                    <Pressable
                      key={item}
                      onPress={() => setSelectedCategory(item)}
                      className="mr-4 w-[76px] items-center"
                    >
                      {/* Circular Avatar Ring */}
                      <View
                        className={`h-[72px] w-[72px] items-center justify-center rounded-full bg-white shadow-sm ${
                          active
                            ? 'border-[2.5px] border-[#B89758] p-[2.5px]'
                            : 'border-[1.5px] border-gray-200 p-[2px]'
                        }`}
                      >
                        <Image
                          source={{ uri: catData.image }}
                          className="h-full w-full rounded-full"
                          resizeMode="cover"
                        />
                      </View>

                      {/* Category Label Underneath */}
                      <Text
                        className={`mt-2 text-center text-xs ${
                          active
                            ? 'font-extrabold text-black'
                            : 'font-medium text-gray-600'
                        }`}
                        numberOfLines={1}
                      >
                        {catData.label || item}
                      </Text>

                      {/* Active Indicator Dot */}
                      {active ? (
                        <View className="mt-1 h-1 w-1 rounded-full bg-[#B89758]" />
                      ) : (
                        <View className="mt-1 h-1 w-1 rounded-full bg-transparent" />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. FEATURED PRODUCTS SECTION */}
            {featuredProducts.length > 0 && (
              <View className="mb-6">
                <View className="mb-3 flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-bold text-gray-900">
                      Featured Products
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Curated luxury bestsellers tailored for distinction
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => router.push('/(tabs)/explore')}
                    className="flex-row items-center"
                  >
                    <Text className="text-xs font-bold text-[#B89758]">
                      View All
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color="#B89758" />
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  contentContainerStyle={{ paddingRight: 8, paddingVertical: 4 }}
                >
                  {featuredProducts.map((prod) => (
                    <HorizontalProductCard
                      key={`feat-${prod.id}`}
                      product={prod}
                      onPress={() => router.push(`/product/${prod.id}`)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 5. PROMOTIONAL FLASH SALE BANNER */}
            <View className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 bg-amber-600 p-5 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <View className="self-start rounded-md bg-white/20 px-2 py-0.5">
                    <Text className="text-[10px] font-extrabold tracking-wider text-white uppercase">
                      Special Offer
                    </Text>
                  </View>
                  <Text className="mt-1.5 text-xl font-extrabold text-white">
                    Get Flat 20% Extra Off
                  </Text>
                  <Text className="mt-1 text-xs text-white/90">
                    Use coupon code at checkout:
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    Alert.alert('Coupon Applied 🎉', 'Code LUXE20 applied for 20% discount!');
                  }}
                  className="rounded-xl border border-white/40 bg-white px-4 py-2.5 shadow-sm"
                >
                  <Text className="text-xs font-extrabold text-[#92400E]">
                    LUXE20
                  </Text>
                  <Text className="text-center text-[9px] font-semibold text-gray-500">
                    Tap to Apply
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 6. NEW ARRIVALS */}
            {newArrivals.length > 0 && (
              <View className="mb-6">
                <View className="mb-3 flex-row items-center justify-between">
                  <View>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-lg font-bold text-gray-900">
                        New Arrivals
                      </Text>
                      <View className="rounded-md bg-emerald-100 px-2 py-0.5">
                        <Text className="text-[10px] font-extrabold text-emerald-700">NEW</Text>
                      </View>
                    </View>
                    <Text className="text-xs text-gray-500">
                      Fresh drops added to our catalog
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => router.push('/(tabs)/explore')}
                    className="flex-row items-center"
                  >
                    <Text className="text-xs font-bold text-[#B89758]">
                      See More
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color="#B89758" />
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  contentContainerStyle={{ paddingRight: 8, paddingVertical: 4 }}
                >
                  {newArrivals.map((prod) => (
                    <HorizontalProductCard
                      key={`new-${prod.id}`}
                      product={prod}
                      onPress={() => router.push(`/product/${prod.id}`)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 7. BEST SELLERS */}
            {bestSellers.length > 0 && (
              <View className="mb-6">
                <View className="mb-3 flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-bold text-gray-900">
                      Best Sellers
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Most loved top-rated products by our customers
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => router.push('/(tabs)/explore')}
                    className="flex-row items-center"
                  >
                    <Text className="text-xs font-bold text-[#B89758]">
                      View All
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color="#B89758" />
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  contentContainerStyle={{ paddingRight: 8, paddingVertical: 4 }}
                >
                  {bestSellers.map((prod) => (
                    <BestSellerCard
                      key={`bestseller-${prod.id}`}
                      product={prod}
                      onPress={() => router.push(`/product/${prod.id}`)}
                      onAddToCart={() => handleAddToCart(prod)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 8. ALL PRODUCTS CATALOG HEADER, VIEW TOGGLE & SORT BAR */}
            <View className="mb-4 mt-2 border-t border-gray-200 pt-5">
              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="text-xl font-extrabold text-gray-900">
                    {selectedCategory === 'All'
                      ? 'All Products'
                      : `${selectedCategory} Collection`}
                  </Text>

                  <Text className="mt-1 text-xs text-gray-500">
                    {sortedProducts.length} items available in store
                  </Text>
                </View>

                {/* View Mode (Carousel vs Grid) & Sort Controls */}
                <View className="flex-row items-center gap-2">
                  {/* View Mode Toggle Pill */}
                  <View className="flex-row items-center rounded-full border border-gray-200 bg-white p-0.5 shadow-sm">
                    <Pressable
                      onPress={() => setViewMode('carousel')}
                      className={`flex-row items-center rounded-full px-2.5 py-1 ${
                        viewMode === 'carousel' ? 'bg-[#111827]' : 'bg-transparent'
                      }`}
                    >
                      <Ionicons
                        name="film"
                        size={12}
                        color={viewMode === 'carousel' ? '#FFFFFF' : '#6B7280'}
                      />
                      <Text
                        className={`ml-1 text-[10.5px] font-bold ${
                          viewMode === 'carousel' ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        Carousel
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setViewMode('grid')}
                      className={`flex-row items-center rounded-full px-2.5 py-1 ${
                        viewMode === 'grid' ? 'bg-[#111827]' : 'bg-transparent'
                      }`}
                    >
                      <Ionicons
                        name="grid"
                        size={12}
                        color={viewMode === 'grid' ? '#FFFFFF' : '#6B7280'}
                      />
                      <Text
                        className={`ml-1 text-[10.5px] font-bold ${
                          viewMode === 'grid' ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        Grid
                      </Text>
                    </Pressable>
                  </View>

                  {/* Sort Button */}
                  <Pressable
                    onPress={() => {
                      setSelectedSort(
                        selectedSort === 'Default'
                          ? 'Price: Low to High'
                          : selectedSort === 'Price: Low to High'
                          ? 'Price: High to Low'
                          : selectedSort === 'Price: High to Low'
                          ? 'Rating: High to Low'
                          : 'Default'
                      );
                    }}
                    className="flex-row items-center rounded-full border border-gray-200 bg-white px-2.5 py-1.5 shadow-sm"
                  >
                    <Ionicons name="swap-vertical" size={13} color="#111827" />
                    <Text className="ml-1 text-[10.5px] font-bold text-gray-800">
                      {selectedSort === 'Default' ? 'Sort' : selectedSort}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Quick Sort Options Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={{ paddingVertical: 8 }}
                className="mt-2"
              >
                {sortOptions.map((item) => {
                  const active = selectedSort === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setSelectedSort(item)}
                      className={`mr-2 rounded-full border px-3.5 py-1.5 ${
                        active
                          ? 'border-[#B89758] bg-[#B89758]'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          active ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* ALL PRODUCTS CAROUSEL (Active by Default) */}
              {viewMode === 'carousel' && (
                sortedProducts.length > 0 ? (
                  <View className="mt-2">
                    <AllProductsCarousel
                      products={sortedProducts}
                      onPress={(prod) => router.push(`/product/${prod.id}`)}
                    />
                  </View>
                ) : (
                  <View className="py-10">
                    <EmptyState
                      icon="🔍"
                      title="No Products Found"
                      message="Try another search term or select another category."
                      buttonText="Clear Filters"
                      onPress={clearFilters}
                    />
                  </View>
                )
              )}
            </View>
          </View>
        }
        /* =====================================================
            EMPTY STATE (When in Grid Mode)
        ===================================================== */
        ListEmptyComponent={
          viewMode === 'grid' ? (
            <View className="py-10">
              <EmptyState
                icon="🔍"
                title="No Products Found"
                message="Try another search term or select another category."
                buttonText="Clear Filters"
                onPress={clearFilters}
              />
            </View>
          ) : null
        }
        /* =====================================================
            PRODUCT CARD GRID ITEM
        ===================================================== */
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
        /* =====================================================
            CUSTOMER REVIEWS & COMPREHENSIVE FOOTER
        ===================================================== */
        ListFooterComponent={
          <View className="mt-4">
            <CustomerReviews />
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