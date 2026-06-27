import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, ModifierMap, OfflineMutation } from '@/types'

interface WaiterState {
  selectedTableId: string | null
  activeOrderId: string | null
  cartItems: CartItem[]
  offlineQueue: OfflineMutation[]
  isOnline: boolean
  selectTable: (tableId: string | null) => void
  setActiveOrderId: (orderId: string | null) => void
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  addToOfflineQueue: (mutation: OfflineMutation) => void
  removeFromOfflineQueue: (mutationId: string) => void
  clearOfflineQueue: () => void
  setOnlineStatus: (status: boolean) => void
  resetTableSession: () => void
}

export const useWaiterStore = create<WaiterState>()(
  persist(
    (set) => ({
      selectedTableId: null,
      activeOrderId: null,
      cartItems: [],
      offlineQueue: [],
      isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
      selectTable: (tableId) => set({ selectedTableId: tableId }),
      setActiveOrderId: (orderId) => set({ activeOrderId: orderId }),
      addToCart: (item) =>
        set((state) => ({
          cartItems: [
            ...state.cartItems,
            { ...item, id: crypto.randomUUID() },
          ],
        })),
      removeFromCart: (itemId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.id !== itemId),
        })),
      clearCart: () => set({ cartItems: [] }),
      addToOfflineQueue: (mutation) =>
        set((state) => ({
          offlineQueue: [...state.offlineQueue, mutation],
        })),
      removeFromOfflineQueue: (mutationId) =>
        set((state) => ({
          offlineQueue: state.offlineQueue.filter((m) => m.id !== mutationId),
        })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),
      setOnlineStatus: (status) => set({ isOnline: status }),
      resetTableSession: () =>
        set({
          selectedTableId: null,
          activeOrderId: null,
          cartItems: [],
        }),
    }),
    {
      name: 'waiter-offline-storage',
      partialize: (state) => ({
        offlineQueue: state.offlineQueue,
        selectedTableId: state.selectedTableId,
        activeOrderId: state.activeOrderId,
        cartItems: state.cartItems,
      }),
    }
  )
)

export type { ModifierMap }
