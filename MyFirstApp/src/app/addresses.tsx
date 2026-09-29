import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';

import { useState } from 'react';
import { router } from 'expo-router';

import {
  useAddresses,
  Address,
} from '../context/AddressContext';
import MinimalNavbar from '../components/navigation/MinimalNavbar';

export default function Addresses() {
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setFullName('');
    setPhone('');
    setAddress('');
    setCity('');
    setState('');
    setPincode('');
  };

  const saveAddress = () => {
    if (
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      Alert.alert(
        'Missing Details',
        'Please fill all address fields.'
      );
      return;
    }

    if (phone.length !== 10) {
      Alert.alert(
        'Invalid Phone',
        'Please enter a valid 10-digit phone number.'
      );
      return;
    }

    if (pincode.length !== 6) {
      Alert.alert(
        'Invalid Pincode',
        'Please enter a valid 6-digit pincode.'
      );
      return;
    }

    if (editingId) {
      const existingAddress = addresses.find(
        (item) => item.id === editingId
      );

      if (!existingAddress) {
        return;
      }

      const updatedAddress: Address = {
        id: editingId,
        fullName,
        phone,
        address,
        city,
        state,
        pincode,
        isDefault: existingAddress.isDefault,
      };

      updateAddress(updatedAddress);

      Alert.alert(
        'Address Updated',
        'Your address has been updated.'
      );
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        fullName,
        phone,
        address,
        city,
        state,
        pincode,
        isDefault: addresses.length === 0,
      };

      addAddress(newAddress);

      Alert.alert(
        'Address Saved',
        'Your address has been saved.'
      );
    }

    resetForm();
  };

  const editAddress = (item: Address) => {
    setEditingId(item.id);
    setFullName(item.fullName);
    setPhone(item.phone);
    setAddress(item.address);
    setCity(item.city);
    setState(item.state);
    setPincode(item.pincode);
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddress(id),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-100">

      {/* Header */}
      <MinimalNavbar
        showBack={true}
        title="Delivery Addresses"
        subtitle={`${addresses.length} saved address(es)`}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 50,
        }}
      >

        {/* Address Form */}

        <View className="rounded-2xl bg-white p-5">

          <Text className="text-xl font-bold text-black">
            {editingId
              ? 'Edit Address'
              : 'Add New Address'}
          </Text>

          {/* Name */}
          <Text className="mb-2 mt-5 font-semibold text-gray-700">
            Full Name
          </Text>

          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor="#999"
            className="rounded-xl bg-gray-100 px-4 py-4 text-black"
          />

          {/* Phone */}
          <Text className="mb-2 mt-4 font-semibold text-gray-700">
            Phone
          </Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="10 digit phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10}
            className="rounded-xl bg-gray-100 px-4 py-4 text-black"
          />

          {/* Address */}
          <Text className="mb-2 mt-4 font-semibold text-gray-700">
            Address
          </Text>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="House no, street, area"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            className="rounded-xl bg-gray-100 px-4 py-4 text-black"
            style={{
              minHeight: 90,
            }}
          />

          {/* City */}
          <Text className="mb-2 mt-4 font-semibold text-gray-700">
            City
          </Text>

          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Enter city"
            placeholderTextColor="#999"
            className="rounded-xl bg-gray-100 px-4 py-4 text-black"
          />

          {/* State */}
          <Text className="mb-2 mt-4 font-semibold text-gray-700">
            State
          </Text>

          <TextInput
            value={state}
            onChangeText={setState}
            placeholder="Enter state"
            placeholderTextColor="#999"
            className="rounded-xl bg-gray-100 px-4 py-4 text-black"
          />

          {/* Pincode */}
          <Text className="mb-2 mt-4 font-semibold text-gray-700">
            Pincode
          </Text>

          <TextInput
            value={pincode}
            onChangeText={setPincode}
            placeholder="6 digit pincode"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={6}
            className="rounded-xl bg-gray-100 px-4 py-4 text-black"
          />

          {/* Save */}
          <Pressable
            className="mt-6 rounded-xl bg-black py-4"
            onPress={saveAddress}
          >
            <Text className="text-center font-bold text-white">
              {editingId
                ? 'Update Address'
                : 'Save Address'}
            </Text>
          </Pressable>

          {/* Cancel Edit */}
          {editingId && (
            <Pressable
              className="mt-3 rounded-xl border border-gray-300 py-4"
              onPress={resetForm}
            >
              <Text className="text-center font-bold text-black">
                Cancel
              </Text>
            </Pressable>
          )}

        </View>

        {/* Saved Addresses */}

        <Text className="mb-3 mt-7 text-xl font-bold text-black">
          Saved Addresses
        </Text>

        {addresses.length === 0 ? (
          <View className="items-center rounded-2xl bg-white px-5 py-10">

            <Text className="text-5xl">
              📍
            </Text>

            <Text className="mt-4 text-xl font-bold text-black">
              No Saved Addresses
            </Text>

            <Text className="mt-2 text-center text-gray-500">
              Add an address for faster checkout.
            </Text>

          </View>
        ) : (
          addresses.map((item) => (
            <View
              key={item.id}
              className="mb-4 rounded-2xl bg-white p-5"
            >

              {/* Header */}
              <View className="flex-row items-center justify-between">

                <Text className="text-lg font-bold text-black">
                  {item.fullName}
                </Text>

                {item.isDefault && (
                  <View className="rounded-full bg-green-100 px-3 py-2">
                    <Text className="text-xs font-bold text-green-700">
                      Default
                    </Text>
                  </View>
                )}

              </View>

              {/* Address */}
              <Text className="mt-3 leading-6 text-gray-600">
                {item.address}
              </Text>

              <Text className="mt-1 text-gray-600">
                {item.city}, {item.state} - {item.pincode}
              </Text>

              <Text className="mt-1 text-gray-600">
                Phone: {item.phone}
              </Text>

              {/* Actions */}
              <View className="mt-5 flex-row">

                {!item.isDefault && (
                  <Pressable
                    className="mr-3 rounded-xl bg-black px-4 py-3"
                    onPress={() =>
                      setDefaultAddress(item.id)
                    }
                  >
                    <Text className="text-sm font-bold text-white">
                      Set Default
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  className="mr-3 rounded-xl border border-gray-300 px-4 py-3"
                  onPress={() => editAddress(item)}
                >
                  <Text className="text-sm font-bold text-black">
                    Edit
                  </Text>
                </Pressable>

                <Pressable
                  className="rounded-xl bg-red-50 px-4 py-3"
                  onPress={() => confirmDelete(item.id)}
                >
                  <Text className="text-sm font-bold text-red-500">
                    Delete
                  </Text>
                </Pressable>

              </View>

            </View>
          ))
        )}

      </ScrollView>

    </View>
  );
}   