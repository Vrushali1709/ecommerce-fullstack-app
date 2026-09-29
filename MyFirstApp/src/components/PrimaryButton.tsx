import {
  Text,
  Pressable,
} from 'react-native';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`rounded-xl py-4 ${
        disabled
          ? 'bg-gray-300'
          : 'bg-black'
      }`}
    >
      <Text
        className={`text-center text-base font-bold ${
          disabled
            ? 'text-gray-500'
            : 'text-white'
        }`}
      >
        {title}
      </Text>
    </Pressable>
  );
}