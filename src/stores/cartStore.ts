import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (item, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(i => i.id === item.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          const updatedItems = currentItems.map(i => 
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          );
          set({ items: updatedItems });
        } else {
          // Add new item
          set({ items: [...currentItems, { ...item, quantity }] });
        }
      },
      
      removeItem: (id) => {
        const currentItems = get().items;
        const filteredItems = currentItems.filter(item => item.id !== id);
        set({ items: filteredItems });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        const currentItems = get().items;
        const updatedItems = currentItems.map(item => 
          item.id === id ? { ...item, quantity } : item
        );
        set({ items: updatedItems });
      },
      
      clearCart: () => {
        set({ items: [], total: 0 });
      },
      
      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items
      })
    }
  )
);