import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);
const MAX_QTY = 20;

export function CartProvider({ children }) {
  const { user } = useAuth();
  const storageKey = user ? `canteen.cart.${user.id}` : null;
  const [items, setItems] = useState([]); // [{ food, quantity }]
  const [loadedKey, setLoadedKey] = useState(null);

  // Each person gets their own saved cart.
  useEffect(() => {
    if (!storageKey) {
      setItems([]);
      setLoadedKey(null);
      return;
    }
    try {
      setItems(JSON.parse(localStorage.getItem(storageKey)) || []);
    } catch {
      setItems([]);
    }
    setLoadedKey(storageKey);
  }, [storageKey]);

  // Only save once the stored cart has been loaded, so a refresh never wipes it.
  useEffect(() => {
    if (storageKey && loadedKey === storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, storageKey, loadedKey]);

  const setQuantity = useCallback((food, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.food.id !== food.id);
      const qty = Math.min(quantity, MAX_QTY);
      const exists = prev.some((i) => i.food.id === food.id);
      return exists
        ? prev.map((i) => (i.food.id === food.id ? { food, quantity: qty } : i))
        : [...prev, { food, quantity: qty }];
    });
  }, []);

  const quantityOf = useCallback(
    (foodId) => items.find((i) => i.food.id === foodId)?.quantity || 0,
    [items]
  );
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      setQuantity,
      quantityOf,
      clear,
      maxQty: MAX_QTY,
      count: items.reduce((n, i) => n + i.quantity, 0),
      total: items.reduce((n, i) => n + Number(i.food.price) * i.quantity, 0),
    }),
    [items, setQuantity, quantityOf, clear]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
