import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';

import { useRef } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAddresses } from '../../context/AddressContext';
import AppFooter from '../../components/AppFooter';
import MinimalNavbar from '../../components/navigation/MinimalNavbar';

export default function Profile() {
  const { user, logout } = useAuth();
  const { orders } = useOrders();
  const { wishlist } = useWishlist();
  const { addresses } = useAddresses();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const firstLetter =
    user?.name?.trim()?.charAt(0).toUpperCase() || 'U';

  return (
    <View className="flex-1 bg-gray-100">
      {/* Top Navbar */}
      <MinimalNavbar title="My Profile" showCart={true} />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      >
        {/* Profile Header */}
        <View className="items-center rounded-3xl bg-white p-6 shadow-sm">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-black shadow-md">
            <Text className="text-3xl font-extrabold text-white">
              {firstLetter}
            </Text>
          </View>

          <Text className="mt-3 text-2xl font-extrabold text-black">
            {user?.name || 'User'}
          </Text>

          <Text className="mt-0.5 text-sm text-gray-500">
            {user?.email || ''}
          </Text>
        </View>

        {/* Account Details Box */}
        <View className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-black">
              Account Information
            </Text>
            <Pressable onPress={() => router.push('/edit-profile')}>
              <Text className="text-sm font-semibold text-blue-600">Edit</Text>
            </Pressable>
          </View>

          <View className="mt-3">
            <Text className="text-xs text-gray-400">Full Name</Text>
            <Text className="mt-0.5 text-sm font-semibold text-black">
              {user?.name}
            </Text>
          </View>

          <View className="mt-2.5">
            <Text className="text-xs text-gray-400">Email Address</Text>
            <Text className="mt-0.5 text-sm font-semibold text-black">
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Actions List */}
        <View className="mt-5">
          {/* Edit Profile */}
          <Pressable
            className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
            onPress={() => router.push('/edit-profile')}
          >
            <View className="flex-row items-center">
              <Text className="text-lg">✏️</Text>
              <Text className="ml-3 font-bold text-black">Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>

          {/* My Addresses */}
          <Pressable
            className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
            onPress={() => router.push('/addresses')}
          >
            <View className="flex-row items-center">
              <Text className="text-lg">📍</Text>
              <Text className="ml-3 font-bold text-black">
                Delivery Addresses ({addresses.length})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>

          {/* My Orders */}
          <Pressable
            className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
            onPress={() => router.push('/orders')}
          >
            <View className="flex-row items-center">
              <Text className="text-lg">📦</Text>
              <Text className="ml-3 font-bold text-black">
                My Orders ({orders.length})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>

          {/* Wishlist */}
          <Pressable
            className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
            onPress={() => router.push('/(tabs)/wishlist')}
          >
            <View className="flex-row items-center">
              <Text className="text-lg">❤️</Text>
              <Text className="ml-3 font-bold text-black">
                Saved Wishlist ({wishlist.length})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>

          {/* Logout */}
          <Pressable
            className="mt-3 rounded-2xl bg-red-500 py-4"
            onPress={handleLogout}
          >
            <Text className="text-center font-bold text-white">
              Log Out
            </Text>
          </Pressable>
        </View>

        {/* App Footer */}
        <AppFooter
          onScrollToTop={() =>
            scrollViewRef.current?.scrollTo({ y: 0, animated: true })
          }
        />
      </ScrollView>
    </View>
  );
}