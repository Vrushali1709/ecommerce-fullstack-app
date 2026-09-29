import { View, Text, ActivityIndicator } from 'react-native';

type LoadingStateProps = {
  message?: string;
};

export default function LoadingState({
  message = 'Loading...',
}: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-6">
      <ActivityIndicator
        size="large"
        color="#000000"
      />

      <Text className="mt-4 text-base font-medium text-gray-600">
        {message}
      </Text>
    </View>
  );
}