import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';

import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAddresses } from '../context/AddressContext';
import MinimalNavbar from '../components/navigation/MinimalNavbar';

type PaymentMethod =
  | 'Cash on Delivery'
  | 'UPI'
  | 'Card';

export default function Checkout() {
  const {
    cart,
    totalPrice,
    promoCode,
    discountAmount,
    clearCart,
  } = useCart();

  const { addOrder } = useOrders();
  const { addresses } = useAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('Cash on Delivery');

  const deliveryCharge = totalPrice >= 1000 ? 0 : 99;
  const grandTotal = Math.max(0, totalPrice - discountAmount + deliveryCharge);

  // Select default address when addresses load
  useEffect(() => {
    if (addresses.length === 0) {
      setSelectedAddressId(null);
      return;
    }

    const defaultAddress =
      addresses.find((address) => address.isDefault) || addresses[0];

    setSelectedAddressId(defaultAddress.id);
  }, [addresses]);

  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId
  );

  const placeOrder = async () => {
    if (!selectedAddress) {
      Alert.alert(
        'Select Address',
        'Please select a delivery address to place your order.'
      );
      return;
    }

    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
        quantity: item.quantity,
      })),
      subtotal: totalPrice,
      delivery: deliveryCharge,
      total: grandTotal,
      paymentMethod,
      customer: {
        name: selectedAddress.fullName,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        pincode: selectedAddress.pincode,
      },
      status: 'Placed' as const,
    };

    await addOrder(newOrder);
    clearCart();
    router.replace('/order-success');
  };

  // Empty Cart
  if (cart.length === 0) {
    return (
      <View className="flex-1 bg-gray-100">
        <MinimalNavbar showBack={true} title="Checkout" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl">🛒</Text>

          <Text className="mt-4 text-2xl font-bold text-black">
            Your Cart is Empty
          </Text>

          <Text className="mt-2 text-center text-gray-500">
            Add products before proceeding to checkout.
          </Text>

          <Pressable
            className="mt-6 rounded-xl bg-black px-8 py-4"
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Text className="font-bold text-white">Continue Shopping</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <MinimalNavbar
        showBack={true}
        title="Checkout"
        subtitle="Complete your order"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 170,
        }}
      >
        {/* Address Section */}
        <View className="rounded-2xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xl font-bold text-black">
                Delivery Address
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                Choose delivery address
              </Text>
            </View>

            <Pressable onPress={() => router.push('/addresses')}>
              <Text className="font-semibold text-blue-600">
                + Add / Manage
              </Text>
            </Pressable>
          </View>

          {addresses.length === 0 ? (
            <View className="mt-5 items-center rounded-xl bg-gray-100 px-4 py-8">
              <Text className="text-4xl">📍</Text>
              <Text className="mt-3 text-lg font-bold text-black">
                No Address Saved
              </Text>
              <Text className="mt-2 text-center text-gray-500">
                Please add a delivery address to complete your order.
              </Text>
              <Pressable
                className="mt-5 rounded-xl bg-black px-6 py-3"
                onPress={() => router.push('/addresses')}
              >
                <Text className="font-bold text-white">Add New Address</Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-5">
              {addresses.map((item) => {
                const selected = selectedAddressId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    className={`mb-4 rounded-2xl border p-4 ${
                      selected
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => setSelectedAddressId(item.id)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center">
                        <View
                          className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${
                            selected
                              ? 'border-black bg-black'
                              : 'border-gray-400 bg-white'
                          }`}
                        >
                          {selected && (
                            <View className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </View>
                        <Text className="flex-1 text-base font-bold text-black">
                          {item.fullName}
                        </Text>
                      </View>

                      {item.isDefault && (
                        <View className="rounded-full bg-green-100 px-3 py-1">
                          <Text className="text-xs font-bold text-green-700">
                            Default
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="ml-8 mt-2 leading-5 text-gray-600">
                      {item.address}
                    </Text>
                    <Text className="ml-8 mt-1 text-gray-600">
                      {item.city}, {item.state} - {item.pincode}
                    </Text>
                    <Text className="ml-8 mt-1 text-gray-600">
                      Phone: {item.phone}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Selected Address Highlights */}
        {selectedAddress && (
          <View className="mt-5 rounded-2xl bg-green-50 p-5">
            <Text className="text-xs font-bold uppercase tracking-wider text-green-800">
              Shipment Will Be Delivered To:
            </Text>
            <Text className="mt-2 text-base font-bold text-black">
              {selectedAddress.fullName} (📞 {selectedAddress.phone})
            </Text>
            <Text className="mt-1 leading-5 text-gray-700">
              {selectedAddress.address}, {selectedAddress.city},{' '}
              {selectedAddress.state} - {selectedAddress.pincode}
            </Text>
          </View>
        )}

        {/* Payment Method Section */}
        <View className="mt-5 rounded-2xl bg-white p-5">
          <Text className="text-xl font-bold text-black">
            Payment Method
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Select your preferred payment method
          </Text>

          {/* Cash on Delivery */}
          <Pressable
            className={`mt-5 flex-row items-center rounded-2xl border p-4 ${
              paymentMethod === 'Cash on Delivery'
                ? 'border-black bg-gray-50'
                : 'border-gray-200'
            }`}
            onPress={() => setPaymentMethod('Cash on Delivery')}
          >
            <View
              className={`mr-4 h-5 w-5 items-center justify-center rounded-full border ${
                paymentMethod === 'Cash on Delivery'
                  ? 'border-black bg-black'
                  : 'border-gray-400'
              }`}
            >
              {paymentMethod === 'Cash on Delivery' && (
                <View className="h-2 w-2 rounded-full bg-white" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-black">
                Cash on Delivery
              </Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                Pay with cash when package is delivered
              </Text>
            </View>
            <Text className="text-2xl">💵</Text>
          </Pressable>

          {/* UPI */}
          <Pressable
            className={`mt-3 flex-row items-center rounded-2xl border p-4 ${
              paymentMethod === 'UPI'
                ? 'border-black bg-gray-50'
                : 'border-gray-200'
            }`}
            onPress={() => setPaymentMethod('UPI')}
          >
            <View
              className={`mr-4 h-5 w-5 items-center justify-center rounded-full border ${
                paymentMethod === 'UPI'
                  ? 'border-black bg-black'
                  : 'border-gray-400'
              }`}
            >
              {paymentMethod === 'UPI' && (
                <View className="h-2 w-2 rounded-full bg-white" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-black">UPI</Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                Google Pay, PhonePe, Paytm, BHIM
              </Text>
            </View>
            <Text className="text-2xl">📱</Text>
          </Pressable>

          {/* Card */}
          <Pressable
            className={`mt-3 flex-row items-center rounded-2xl border p-4 ${
              paymentMethod === 'Card'
                ? 'border-black bg-gray-50'
                : 'border-gray-200'
            }`}
            onPress={() => setPaymentMethod('Card')}
          >
            <View
              className={`mr-4 h-5 w-5 items-center justify-center rounded-full border ${
                paymentMethod === 'Card'
                  ? 'border-black bg-black'
                  : 'border-gray-400'
              }`}
            >
              {paymentMethod === 'Card' && (
                <View className="h-2 w-2 rounded-full bg-white" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-black">
                Credit / Debit Card
              </Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                Visa, Mastercard, RuPay
              </Text>
            </View>
            <Text className="text-2xl">💳</Text>
          </Pressable>
        </View>

        {/* Order Summary & Products */}
        <View className="mt-5 rounded-2xl bg-white p-5">
          <Text className="text-xl font-bold text-black">Order Summary</Text>

          {cart.map((item) => (
            <View
              key={item.id}
              className="mt-4 flex-row items-center justify-between"
            >
              <View className="flex-1 pr-4">
                <Text className="font-semibold text-black">{item.name}</Text>
                <Text className="mt-0.5 text-xs text-gray-500">
                  Qty: {item.quantity} × {item.price}
                </Text>
              </View>

              <Text className="font-bold text-black">
                ₹
                {(
                  Number(item.price.replace(/[₹,]/g, '')) * item.quantity
                ).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}

          <View className="my-5 h-px bg-gray-200" />

          {/* Subtotal */}
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="font-semibold text-black">
              ₹{totalPrice.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Discount */}
          {discountAmount > 0 && (
            <View className="mt-2 flex-row justify-between">
              <Text className="text-green-600">
                Coupon ({promoCode})
              </Text>
              <Text className="font-semibold text-green-600">
                - ₹{discountAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          {/* Delivery */}
          <View className="mt-2 flex-row justify-between">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="font-semibold text-black">
              {deliveryCharge === 0 ? (
                <Text className="text-green-600">FREE</Text>
              ) : (
                `₹${deliveryCharge}`
              )}
            </Text>
          </View>

          <View className="my-4 h-px bg-gray-200" />

          {/* Grand Total */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-black">Total Payable</Text>
            <Text className="text-2xl font-bold text-black">
              ₹{grandTotal.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Sticky Button */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 pb-6 pt-4">
        <Pressable
          className={`rounded-xl py-4 ${
            selectedAddress ? 'bg-black' : 'bg-gray-300'
          }`}
          onPress={placeOrder}
          disabled={!selectedAddress}
        >
          <Text
            className={`text-center text-base font-bold ${
              selectedAddress ? 'text-white' : 'text-gray-500'
            }`}
          >
            {selectedAddress
              ? `Place Order • ₹${grandTotal.toLocaleString('en-IN')}`
              : 'Select an Address to Place Order'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}