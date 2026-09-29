import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { useState } from 'react';
import { Redirect } from 'expo-router';

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
        <ActivityIndicator size="large" color="#000000" />
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
      setError('Please fill all fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email.');
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
      setError(err?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      {/* Heading */}
      <Text className="text-4xl font-bold text-black">
        Welcome Back 👋
      </Text>

      <Text className="mb-8 mt-2 text-base text-gray-500">
        Login or Sign Up with FastAPI Backend
      </Text>

      {/* Name */}
      <Text className="mb-2 text-sm font-semibold text-black">
        Full Name
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor="#999"
        className="rounded-xl border border-gray-300 px-4 py-4 text-black"
      />

      {/* Email */}
      <Text className="mb-2 mt-5 text-sm font-semibold text-black">
        Email
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        className="rounded-xl border border-gray-300 px-4 py-4 text-black"
      />

      {/* Password */}
      <Text className="mb-2 mt-5 text-sm font-semibold text-black">
        Password
      </Text>

      <View className="flex-row items-center rounded-xl border border-gray-300">
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          className="flex-1 px-4 py-4 text-black"
        />

        <Pressable
          className="px-4"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text className="font-semibold text-black">
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </View>

      {/* Error */}
      {error ? (
        <Text className="mt-3 text-sm text-red-500">
          {error}
        </Text>
      ) : null}

      {/* Login Button */}
      <Pressable
        className={`mt-7 rounded-xl py-4 ${isSubmitting ? 'bg-gray-400' : 'bg-black'}`}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-center text-base font-bold text-white">
            Continue / Login
          </Text>
        )}
      </Pressable>
    </View>
  );
}