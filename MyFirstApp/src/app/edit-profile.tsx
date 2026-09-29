import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';

import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { useAuth } from '../context/AuthContext';
import MinimalNavbar from '../components/navigation/MinimalNavbar';

export default function EditProfile() {
  const {
    user,
    updateProfile,
  } = useAuth();

  const [name, setName] = useState(
    user?.name || ''
  );

  const [email, setEmail] = useState(
    user?.email || ''
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(
        'Missing Details',
        'Please enter both name and email.'
      );
      return;
    }

    if (!email.includes('@')) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    try {
      setSaving(true);

      await updateProfile(
        name.trim(),
        email.trim()
      );

      Alert.alert(
        'Profile Updated ✅',
        'Your profile has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace('/(tabs)/profile'),
          },
        ]
      );
    } catch (error) {
      console.log(
        'Failed to update profile:',
        error
      );

      Alert.alert(
        'Error',
        'Something went wrong while updating your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">

      {/* Header */}
      <MinimalNavbar
        showBack={true}
        title="Edit Profile"
        subtitle="Update your account information"
      />

      {/* Form */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      >

        <View className="rounded-2xl bg-white p-5">

          {/* Avatar */}
          <View className="items-center">

            <View className="h-24 w-24 items-center justify-center rounded-full bg-black">

              <Text className="text-4xl font-bold text-white">
                {name
                  ? name
                      .trim()
                      .charAt(0)
                      .toUpperCase()
                  : 'U'}
              </Text>

            </View>

            <Text className="mt-3 text-sm text-gray-500">
              Profile Information
            </Text>

          </View>

          {/* Name */}
          <Text className="mb-2 mt-8 text-sm font-semibold text-black">
            Full Name
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
            autoCapitalize="words"
            className="rounded-xl bg-gray-100 px-4 py-4 text-black"
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
            className="rounded-xl bg-gray-100 px-4 py-4 text-black"
          />

          {/* Save */}
          <Pressable
            className={`mt-7 rounded-xl py-4 ${
              saving
                ? 'bg-gray-400'
                : 'bg-black'
            }`}
            onPress={handleSave}
            disabled={saving}
          >
            <Text className="text-center font-bold text-white">
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </Text>
          </Pressable>

        </View>

      </ScrollView>

    </View>
  );
}