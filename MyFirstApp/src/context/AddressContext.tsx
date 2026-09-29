import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { addressesApi } from '../services/api';
import { useAuth } from './AuthContext';

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

type AddressContextType = {
  addresses: Address[];
  addAddress: (address: Address) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  refreshAddresses: () => Promise<void>;
};

const AddressContext = createContext<
  AddressContextType | undefined
>(undefined);

const ADDRESS_STORAGE_KEY = '@myfirstapp_addresses';

export function AddressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load addresses from local storage first
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const savedAddresses = await AsyncStorage.getItem(
          ADDRESS_STORAGE_KEY
        );

        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        }
      } catch (error) {
        console.log('Failed to load addresses:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadAddresses();
  }, []);

  // Sync with Backend API when token is present
  useEffect(() => {
    if (token) {
      refreshAddresses();
    }
  }, [token]);

  const refreshAddresses = async () => {
    if (!token) return;
    try {
      const serverAddrs = await addressesApi.getAll();
      if (serverAddrs && Array.isArray(serverAddrs)) {
        const mapped: Address[] = serverAddrs.map((a: any) => ({
          id: a.id,
          fullName: a.fullName || a.full_name || '',
          phone: a.phone || '',
          address: a.address || '',
          city: a.city || '',
          state: a.state || '',
          pincode: a.pincode || '',
          isDefault: Boolean(a.isDefault ?? a.is_default),
        }));
        setAddresses(mapped);
        await AsyncStorage.setItem(
          ADDRESS_STORAGE_KEY,
          JSON.stringify(mapped)
        );
      }
    } catch (err) {
      console.log('Backend addresses sync note:', err);
    }
  };

  // Save addresses to local storage
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveAddresses = async () => {
      try {
        await AsyncStorage.setItem(
          ADDRESS_STORAGE_KEY,
          JSON.stringify(addresses)
        );
      } catch (error) {
        console.log('Failed to save addresses:', error);
      }
    };

    saveAddresses();
  }, [addresses, isLoaded]);

  const addAddress = async (newAddr: Address) => {
    setAddresses((currentAddresses) => {
      if (currentAddresses.length === 0) {
        return [{ ...newAddr, isDefault: true }];
      }
      return [...currentAddresses, newAddr];
    });

    if (token) {
      try {
        const serverAddr = await addressesApi.create({
          fullName: newAddr.fullName,
          phone: newAddr.phone,
          address: newAddr.address,
          city: newAddr.city,
          state: newAddr.state,
          pincode: newAddr.pincode,
          isDefault: newAddr.isDefault,
        });
        if (serverAddr?.id) {
          await refreshAddresses();
        }
      } catch (err) {
        console.log('Backend addAddress error:', err);
      }
    }
  };

  const updateAddress = async (updatedAddress: Address) => {
    setAddresses((currentAddresses) =>
      currentAddresses.map((address) =>
        address.id === updatedAddress.id
          ? updatedAddress
          : address
      )
    );

    if (token) {
      try {
        await addressesApi.update(updatedAddress.id, {
          fullName: updatedAddress.fullName,
          phone: updatedAddress.phone,
          address: updatedAddress.address,
          city: updatedAddress.city,
          state: updatedAddress.state,
          pincode: updatedAddress.pincode,
          isDefault: updatedAddress.isDefault,
        });
      } catch (err) {
        console.log('Backend updateAddress error:', err);
      }
    }
  };

  const deleteAddress = async (id: string) => {
    setAddresses((currentAddresses) => {
      const filtered = currentAddresses.filter(
        (address) => address.id !== id
      );

      if (
        filtered.length > 0 &&
        !filtered.some((address) => address.isDefault)
      ) {
        filtered[0] = {
          ...filtered[0],
          isDefault: true,
        };
      }

      return filtered;
    });

    if (token) {
      try {
        await addressesApi.delete(id);
      } catch (err) {
        console.log('Backend deleteAddress error:', err);
      }
    }
  };

  const setDefaultAddress = async (id: string) => {
    setAddresses((currentAddresses) =>
      currentAddresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      }))
    );

    if (token) {
      try {
        await addressesApi.setDefault(id);
      } catch (err) {
        console.log('Backend setDefault error:', err);
      }
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        refreshAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const context = useContext(AddressContext);

  if (!context) {
    throw new Error(
      'useAddresses must be used inside AddressProvider'
    );
  }

  return context;
}