import { View, Text, Pressable } from 'react-native';

type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

export default function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-6">

      <Text className="text-5xl">
        ⚠️
      </Text>

      <Text className="mt-4 text-center text-2xl font-bold text-black">
        Something went wrong
      </Text>

      <Text className="mt-2 text-center text-base text-gray-500">
        {message}
      </Text>

      <Pressable
        className="mt-6 rounded-xl bg-black px-8 py-4"
        onPress={onRetry}
      >
        <Text className="font-bold text-white">
          Retry
        </Text>
      </Pressable>

    </View>
  );
}