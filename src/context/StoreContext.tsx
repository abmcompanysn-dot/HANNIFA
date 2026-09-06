import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CustomDetails = {
  gender: "femme" | "homme";
  forModel?: string;
  contact: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    details: string;
  };
  measurements: Record<string, string>;
  fabricSource: "maison" | "envoi" | "conseil";
  fabricName?: string;
  fabricFileName?: string;
  comment?: string;
};

export type CartItem = {
  key: string;
  kind: "product" | "custom";
  productId?: string;
  name: string;
  detail?: string;
  price: number;
  qty: number;
  image?: string;
  colorName?: string;
  size?: string;
  custom?: CustomDetails;
};

export type Customer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note?: string;
};

export type Order = {
  id: string;
  placedAt: number;
  items: CartItem[];
  total: number;
  customer: Customer;
  paymentId: string;
  paymentLabel: string;
};

type Toast = { id: number; msg: string };

type Store = {
  cart: CartItem[];
  cartOpen: boolean;
  orders: Order[];
  customer: Customer | null;
  toasts: Toast[];
  cartCount: number;
  cartTotal: number;
  setCartOpen: (v: boolean) => void;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (key: string, delta: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  placeOrder: (customer: Customer, paymentId: string, paymentLabel: string) => Order | null;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  toast: (msg: string) => void;
};

const Ctx = createContext<Store | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => load("hanis_cart", []));
  const [orders, setOrders] = useState<Order[]>(() => load("hanis_orders", []));
  const [customer, setCustomer] = useState<Customer | null>(() => load("hanis_customer", null));
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem("hanis_cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("hanis_orders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem("hanis_customer", JSON.stringify(customer));
  }, [customer]);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const addToCart = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setCart((c) => {
        const existing = c.find((i) => i.key === item.key);
        if (existing)
          return c.map((i) => (i.key === item.key ? { ...i, qty: i.qty + qty } : i));
        return [...c, { ...item, qty }];
      });
      toast(`${item.name} — ajouté au panier`);
      setCartOpen(true);
    },
    [toast]
  );

  const updateQty = useCallback((key: string, delta: number) => {
    setCart((c) =>
      c
        .map((i) => (i.key === key ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setCart((c) => c.filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const placeOrder = useCallback(
    (cust: Customer, paymentId: string, paymentLabel: string): Order | null => {
      if (cart.length === 0) return null;
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const id = `HNS-${new Date().getFullYear()}-${String(
        Math.floor(1000 + Math.random() * 9000)
      )}`;
      const order: Order = {
        id,
        placedAt: Date.now(),
        items: cart,
        total,
        customer: cust,
        paymentId,
        paymentLabel,
      };
      setOrders((o) => [order, ...o]);
      setCustomer(cust);
      setCart([]);
      return order;
    },
    [cart]
  );

  const updateOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((o) => o.map((ord) => (ord.id === id ? { ...ord, ...patch } : ord)));
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const value: Store = {
    cart,
    cartOpen,
    orders,
    customer,
    toasts,
    cartCount,
    cartTotal,
    setCartOpen,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    placeOrder,
    updateOrder,
    toast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
