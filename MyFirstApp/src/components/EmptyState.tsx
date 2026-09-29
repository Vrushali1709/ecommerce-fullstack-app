import { View, Text, Pressable } from 'react-native';

type EmptyStateProps = {
  icon?: string;
  title: string;
  message: string;
  buttonText?: string;
  onPress?: () => void;
};

export default function EmptyState({
  icon = '📦',
  title,
  message,
  buttonText,
  onPress,
}: EmptyStateProps) {
  return (
    <View className="items-center px-6 py-16">

      <Text className="text-5xl">
        {icon}
      </Text>

      <Text className="mt-4 text-center text-2xl font-bold text-black">
        {title}
      </Text>

      <Text className="mt-2 text-center text-base leading-6 text-gray-500">
        {message}
      </Text>

      {buttonText && onPress && (
        <Pressable
          className="mt-6 rounded-xl bg-black px-8 py-4"
          onPress={onPress}
        >
          <Text className="font-bold text-white">
            {buttonText}
          </Text>
        </Pressable>
      )}

    </View>
  );
}