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
    <View className="flex-1 bg-[#FAFAFB]">
      {/* Clean Top Navbar */}
      <MinimalNavbar
        brandText="LUXE STORE"
        showWishlist={true}
        showCart={true}
        showProfile={true}
        showMenu={true}
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 40,
        }}
      >
        {/* Header Below Navbar */}
        <View className="mb-4 px-0.5 pt-1">
          <Text className="text-2xl font-black tracking-tight text-gray-900">
            My Profile
          </Text>
          <Text className="mt-0.5 text-xs font-semibold text-gray-500">
            Manage your personal account and preferences
          </Text>
        </View>

        {/* Profile Card */}
        <View className="items-center rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-black shadow-md">
            <Text className="text-3xl font-black text-white">
              {firstLetter}
            </Text>
          </View>

          <Text className="mt-3 text-2xl font-extrabold text-black">
            {user?.name || 'User'}
          </Text>

          <Text className="mt-0.5 text-sm font-medium text-gray-500">
            {user?.email || ''}
          </Text>
        </View>

        {/* Account Details Box */}
        <View className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-extrabold text-black">
              Account Information
            </Text>
            <Pressable onPress={() => router.push('/edit-profile')}>
              <Text className="text-sm font-bold text-black underline">Edit</Text>
            </Pressable>
          </View>

          <View className="mt-3">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Full Name
            </Text>
            <Text className="mt-0.5 text-sm font-bold text-black">
              {user?.name}
            </Text>
          </View>

          <View className="mt-2.5">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Email Address
            </Text>
            <Text className="mt-0.5 text-sm font-bold text-black">
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Navigation Actions List */}
        <View className="mt-4">
          {/* Edit Profile */}
          <Pressable
            className="mb-3 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
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
            className="mb-3 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
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
            className="mb-3 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
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
            className="mb-3 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
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
            className="mt-3 rounded-2xl bg-red-500 py-4 shadow-sm active:opacity-90"
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