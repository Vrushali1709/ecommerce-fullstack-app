import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { products as fallbackProducts, Review, Product } from '../../data/products';
import { productsApi } from '../../services/api';
import MinimalNavbar from '../../components/navigation/MinimalNavbar';

const { width } = Dimensions.get('window');

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review Form States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Make sure id is a string
  const productId = Array.isArray(id) ? id[0] : id;

  const fallbackProduct = fallbackProducts.find((item) => item.id === productId);
  const [product, setProduct] = useState<Product | undefined>(fallbackProduct);
  const [customReviews, setCustomReviews] = useState<Review[]>(
    fallbackProduct?.reviews || []
  );
  const [loading, setLoading] = useState(false);

  // Fetch live product from API
  useEffect(() => {
    if (!productId) return;
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const liveProduct = await productsApi.getById(productId);
        if (isMounted && liveProduct) {
          setProduct(liveProduct);
          if (liveProduct.reviews && liveProduct.reviews.length > 0) {
            setCustomReviews(liveProduct.reviews);
          }
        }
      } catch (err) {
        console.log('Live product details note (using fallback):', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Product not found
  if (!product && !loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-2xl font-bold text-black">
          Product Not Found
        </Text>
        <Pressable
          className="mt-5 rounded-xl bg-black px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (loading && !product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const currentProduct = product!;
  const savedInWishlist = isInWishlist(currentProduct.id);
  const imageGallery =
    currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images
      : [currentProduct.image];

  const handleAddToCart = () => {
    addToCart(currentProduct, quantity);
    Alert.alert(
      'Added to Cart 🛍️',
      `${quantity}x ${currentProduct.name} added to your cart.`
    );
  };

  const handleBuyNow = () => {
    addToCart(currentProduct, quantity);
    router.push('/checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(currentProduct);
  };

  const handleAddReview = async () => {
    if (!newReviewerName.trim() || !newReviewComment.trim()) {
      Alert.alert('Required Fields', 'Please enter your name and review comment.');
      return;
    }

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName: newReviewerName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: 'Just now',
    };

    setCustomReviews([newRev, ...customReviews]);

    // Send to backend
    try {
      setSubmittingReview(true);
      await productsApi.addReview(currentProduct.id, {
        userName: newReviewerName.trim(),
        rating: newReviewRating,
        comment: newReviewComment.trim(),
      });
    } catch (err) {
      console.log('Add review API note (saved locally):', err);
    } finally {
      setSubmittingReview(false);
      setNewReviewerName('');
      setNewReviewComment('');
      setShowReviewModal(false);
      Alert.alert('Thank You! ⭐', 'Your review has been published successfully.');
    }
  };

  const relatedProducts = fallbackProducts.filter(
    (item) => item.category === currentProduct.category && item.id !== currentProduct.id
  );

  return (
    <View className="flex-1 bg-white">
      {/* Top Clean Navbar */}
      <MinimalNavbar
        showBack={true}
        title={currentProduct.name}
        showWishlist={true}
        showCart={true}
      />

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
        }}
      >
        {/* ================= IMAGE GALLERY CAROUSEL ================= */}
        <View className="relative bg-gray-50">
          <FlatList
            data={imageGallery}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `img-${index}`}
            onMomentumScrollEnd={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
              );
              setActiveImageIndex(slide);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width, height: 360 }}
                resizeMode="cover"
              />
            )}
          />

          {/* Discount Badge */}
          {currentProduct.discountPercent ? (
            <View className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 shadow">
              <Text className="text-xs font-bold text-white">
                {currentProduct.discountPercent}% OFF
              </Text>
            </View>
          ) : null}

          {/* Image Dots Indicator */}
          {imageGallery.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
              {imageGallery.map((_, idx) => (
                <View
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    activeImageIndex === idx
                      ? 'w-6 bg-black'
                      : 'w-2 bg-gray-400'
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        {/* ================= PRODUCT MAIN DETAILS ================= */}
        <View className="px-5 pt-5">
          {/* Category & Rating */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {currentProduct.category}
            </Text>
            <View className="flex-row items-center rounded-lg bg-amber-50 px-2.5 py-1">
              <Text className="text-sm font-bold text-amber-800">
                ⭐ {currentProduct.rating}
              </Text>
              <Text className="ml-1 text-xs text-amber-700">
                ({currentProduct.reviewCount || customReviews.length}+ reviews)
              </Text>
            </View>
          </View>

          {/* Product Name */}
          <Text className="mt-2 text-2xl font-extrabold text-black">
            {currentProduct.name}
          </Text>

          {/* Price & Quantity Stepper */}
          <View className="mt-4 flex-row items-center justify-between">
            <View className="flex-row items-baseline gap-2">
              <Text className="text-3xl font-extrabold text-black">
                {currentProduct.price}
              </Text>
              {currentProduct.originalPrice ? (
                <Text className="text-base text-gray-400 line-through">
                  {currentProduct.originalPrice}
                </Text>
              ) : null}
            </View>

            {/* Stepper */}
            <View className="flex-row items-center rounded-xl bg-gray-100 px-3 py-1.5">
              <Pressable
                className="h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm"
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Text className="text-lg font-bold text-black">−</Text>
              </Pressable>

              <Text className="mx-4 text-base font-bold text-black">
                {quantity}
              </Text>

              <Pressable
                className="h-8 w-8 items-center justify-center rounded-lg bg-black shadow-sm"
                onPress={() => setQuantity((q) => q + 1)}
              >
                <Text className="text-lg font-bold text-white">+</Text>
              </Pressable>
            </View>
          </View>

          {/* Wishlist Fast Toggle */}
          <Pressable
            className="mt-4 flex-row items-center self-start rounded-full bg-gray-100 px-4 py-2"
            onPress={handleWishlist}
          >
            <Ionicons
              name={savedInWishlist ? 'heart' : 'heart-outline'}
              size={18}
              color={savedInWishlist ? '#EF4444' : '#374151'}
            />
            <Text
              className={`ml-2 text-sm font-semibold ${
                savedInWishlist ? 'text-red-500' : 'text-gray-700'
              }`}
            >
              {savedInWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
            </Text>
          </Pressable>

          <View className="my-6 h-px bg-gray-200" />

          {/* ================= DESCRIPTION ================= */}
          <Text className="text-lg font-bold text-black">Description</Text>
          <Text className="mt-2 text-base leading-6 text-gray-600">
            {currentProduct.description}
          </Text>

          {/* ================= KEY HIGHLIGHTS ================= */}
          {currentProduct.highlights && currentProduct.highlights.length > 0 && (
            <View className="mt-6">
              <Text className="text-lg font-bold text-black">
                Key Highlights
              </Text>
              <View className="mt-3 space-y-2">
                {currentProduct.highlights.map((highlight, index) => (
                  <View key={index} className="flex-row items-center">
                    <Text className="mr-2 text-green-600">✓</Text>
                    <Text className="text-sm font-medium text-gray-700">
                      {highlight}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ================= SPECIFICATIONS ================= */}
          <Text className="mt-7 text-lg font-bold text-black">
            Specifications & Features
          </Text>
          <View className="mt-3 rounded-2xl bg-gray-50 p-4">
            <View className="mb-2.5 flex-row justify-between">
              <Text className="text-gray-500">Category</Text>
              <Text className="font-semibold text-black">{currentProduct.category}</Text>
            </View>
            {currentProduct.specs &&
              Object.entries(currentProduct.specs).map(([key, val]) => (
                <View key={key} className="mb-2.5 flex-row justify-between">
                  <Text className="text-gray-500">{key}</Text>
                  <Text className="font-semibold text-black">{val}</Text>
                </View>
              ))}
            <View className="mb-2.5 flex-row justify-between">
              <Text className="text-gray-500">Delivery</Text>
              <Text className="font-semibold text-green-600">Free delivery on ₹1000+</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Return Policy</Text>
              <Text className="font-semibold text-black">7-Day Free Replacement</Text>
            </View>
          </View>

          {/* ================= REVIEWS SECTION ================= */}
          <View className="mt-8">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-black">
                  Customer Reviews
                </Text>
                <Text className="text-xs text-gray-500">
                  {customReviews.length} verified ratings
                </Text>
              </View>

              <Pressable
                className="rounded-xl border border-black bg-white px-3.5 py-2"
                onPress={() => setShowReviewModal(!showReviewModal)}
              >
                <Text className="text-xs font-bold text-black">
                  {showReviewModal ? 'Close Form' : '✍️ Write Review'}
                </Text>
              </Pressable>
            </View>

            {/* Interactive Write Review Form */}
            {showReviewModal && (
              <View className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <Text className="text-sm font-bold text-black">
                  Share Your Experience
                </Text>

                {/* Rating Picker */}
                <View className="mt-3 flex-row items-center gap-2">
                  <Text className="text-xs text-gray-500">Your Rating:</Text>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => setNewReviewRating(star)}
                    >
                      <Ionicons
                        name={star <= newReviewRating ? 'star' : 'star-outline'}
                        size={22}
                        color="#F59E0B"
                      />
                    </Pressable>
                  ))}
                </View>

                {/* Name */}
                <TextInput
                  value={newReviewerName}
                  onChangeText={setNewReviewerName}
                  placeholder="Your Name"
                  placeholderTextColor="#999"
                  className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-black"
                />

                {/* Comment */}
                <TextInput
                  value={newReviewComment}
                  onChangeText={setNewReviewComment}
                  placeholder="Write your feedback..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-black"
                />

                <Pressable
                  className="mt-3 rounded-xl bg-black py-2.5"
                  onPress={handleAddReview}
                  disabled={submittingReview}
                >
                  <Text className="text-center text-sm font-bold text-white">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Reviews List */}
            <View className="mt-4 space-y-3">
              {customReviews.length === 0 ? (
                <Text className="text-sm text-gray-500">
                  No reviews yet. Be the first to review!
                </Text>
              ) : (
                customReviews.map((rev) => (
                  <View
                    key={rev.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="font-bold text-black text-sm">
                        {rev.userName}
                      </Text>
                      <Text className="text-xs text-gray-400">{rev.date}</Text>
                    </View>

                    <View className="mt-1 flex-row items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < Math.floor(rev.rating) ? 'star' : 'star-outline'}
                          size={14}
                          color="#F59E0B"
                        />
                      ))}
                    </View>

                    <Text className="mt-2 text-sm text-gray-600">
                      {rev.comment}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* ================= SIMILAR PRODUCTS ================= */}
          {relatedProducts.length > 0 && (
            <View className="mt-8">
              <Text className="text-lg font-bold text-black">
                Similar Products
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-3"
              >
                {relatedProducts.map((rel) => (
                  <Pressable
                    key={rel.id}
                    className="mr-3 w-40 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2.5"
                    onPress={() => router.push(`/product/${rel.id}`)}
                  >
                    <Image
                      source={{ uri: rel.image }}
                      className="h-28 w-full rounded-xl"
                      resizeMode="cover"
                    />
                    <Text
                      numberOfLines={1}
                      className="mt-2 font-bold text-black text-sm"
                    >
                      {rel.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-gray-500 font-semibold">
                      {rel.price}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ================= BOTTOM STICKY ACTIONS ================= */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 pb-6 pt-4">
        <View className="flex-row gap-3">
          {/* Add to Cart */}
          <Pressable
            className="flex-1 rounded-xl border border-black bg-white py-4"
            onPress={handleAddToCart}
          >
            <Text className="text-center text-base font-bold text-black">
              Add to Cart
            </Text>
          </Pressable>

          {/* Buy Now */}
          <Pressable
            className="flex-1 rounded-xl bg-black py-4"
            onPress={handleBuyNow}
          >
            <Text className="text-center text-base font-bold text-white">
              Buy Now
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}