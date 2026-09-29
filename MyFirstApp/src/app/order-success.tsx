import {
  View,
  Text,
  Pressable,
} from 'react-native';

import { router } from 'expo-router';

export default function OrderSuccess() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">

      <View className="h-24 w-24 items-center justify-center rounded-full bg-green-100">
        <Text className="text-5xl">
          ✓
        </Text>
      </View>

      <Text className="mt-7 text-3xl font-bold text-black">
        Order Placed! 🎉
      </Text>

      <Text className="mt-3 text-center text-base leading-6 text-gray-500">
        Your order has been placed successfully.
        We will deliver your products soon.
      </Text>

      <Pressable
        className="mt-8 w-full rounded-xl bg-black py-4"
        onPress={() =>
          router.replace('/orders')
        }
      >
        <Text className="text-center font-bold text-white">
          View My Orders
        </Text>
      </Pressable>

      <Pressable
        className="mt-3 w-full rounded-xl border border-gray-300 py-4"
        onPress={() =>
          router.replace('/(tabs)/home')
        }
      >
        <Text className="text-center font-bold text-black">
          Continue Shopping
        </Text>
      </Pressable>

    </View>
  );
}