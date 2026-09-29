import React from 'react';
import { Tabs } from 'expo-router';
import MinimalTabBar from '../../components/navigation/MinimalTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <MinimalTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Saved',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}