import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { useState } from 'react';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { user, loading, login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Wait until saved login state is checked
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  // Already logged in
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  const handleLogin = async () => {
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(name, email, password);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingTop: 10,
            paddingBottom: 70,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Logo Header matching Website Navbar */}
          <View className="mb-8 items-center">
            <View className="flex-row items-center">
              <Text className="text-3xl font-black tracking-[3px] text-gray-900">
                LUXE STORE
              </Text>
              <View className="ml-2 h-2.5 w-2.5 rounded-full bg-[#B89758]" />
            </View>
            <Text className="mt-2 text-xs font-semibold uppercase tracking-[2px] text-gray-400">
              Exclusive Luxury & High Horology
            </Text>
          </View>

        {/* Full Name Input */}
        <View className="mb-4">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
            Full Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
            className="rounded-xl border border-gray-200 bg-[#FAFAFB] px-4 py-3.5 text-base text-gray-900"
          />
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
            Email Address
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-xl border border-gray-200 bg-[#FAFAFB] px-4 py-3.5 text-base text-gray-900"
          />
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
            Password
          </Text>
          <View className="flex-row items-center rounded-xl border border-gray-200 bg-[#FAFAFB] pr-3">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              className="flex-1 px-4 py-3.5 text-base text-gray-900"
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#6B7280"
              />
            </Pressable>
          </View>
        </View>

        {/* Error Alert */}
        {error ? (
          <View className="mb-2 rounded-xl bg-red-50 p-3">
            <Text className="text-center text-xs font-bold text-red-600">
              {error}
            </Text>
          </View>
        ) : null}

        {/* Login Button */}
        <Pressable
          className={`mt-4 flex-row items-center justify-center rounded-xl py-4 shadow-sm active:opacity-90 ${
            isSubmitting ? 'bg-gray-400' : 'bg-black'
          }`}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-base font-bold text-white">
              Continue to Store →
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}