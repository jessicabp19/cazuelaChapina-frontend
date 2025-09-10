import { create } from "zustand";

export interface CartItem {
  varianteId: number;
  nombre: string;
  presentacion: string;
  precioUnit: number;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "cantidad">, qty?: number) => void;
  remove: (varianteId: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  add: (item, qty = 1) => {
    const items = [...get().items];
    const idx = items.findIndex(i => i.varianteId === item.varianteId);
    if (idx >= 0) items[idx].cantidad += qty;
    else items.push({ ...item, cantidad: qty });
    set({ items });
  },
  remove: (varianteId) => set({ items: get().items.filter(i => i.varianteId !== varianteId) }),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((s, i) => s + i.precioUnit * i.cantidad, 0),
}));
