import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image?: string;
  price: number;
  quantity: number;
  installation_service: boolean;
  installation_charge: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity: number, installation?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleInstallation: (productId: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage or database on mount
  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      if (user) {
        // Load from database for logged-in users
        const { data, error } = await supabase
          .from("cart_items")
          .select(`
            id,
            product_id,
            quantity,
            installation_service,
            products (
              id,
              name,
              slug,
              price,
              main_image_url,
              installation_charge
            )
          `);

        if (error) throw error;

        const cartItems: CartItem[] = (data || []).map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.products.name,
          product_slug: item.products.slug,
          product_image: item.products.main_image_url,
          price: item.products.price,
          quantity: item.quantity,
          installation_service: item.installation_service,
          installation_charge: item.installation_service ? item.products.installation_charge : 0,
        }));

        setItems(cartItems);
      } else {
        // Load from localStorage for guest users
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async (newItems: CartItem[]) => {
    if (user) {
      // Save to database for logged-in users
      // TODO: Implement database sync
      localStorage.setItem("cart", JSON.stringify(newItems));
    } else {
      // Save to localStorage for guest users
      localStorage.setItem("cart", JSON.stringify(newItems));
    }
  };

  const addToCart = (product: any, quantity: number, installation: boolean = false) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product_id === product.id && item.installation_service === installation
      );

      let newItems;
      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: Date.now().toString(),
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          product_image: product.main_image_url,
          price: product.price,
          quantity: quantity,
          installation_service: installation,
          installation_charge: installation ? (product.installation_charge || 0) : 0,
        };
        newItems = [...prevItems, newItem];
      }

      saveCart(newItems);
      toast.success(`${quantity} x ${product.name} added to cart`);
      return newItems;
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.product_id !== productId);
      saveCart(newItems);
      toast.success("Item removed from cart");
      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;

    setItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      );
      saveCart(newItems);
      return newItems;
    });
  };

  const toggleInstallation = (productId: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.map((item) => {
        if (item.product_id === productId) {
          const newInstallationState = !item.installation_service;
          return {
            ...item,
            installation_service: newInstallationState,
            installation_charge: newInstallationState ? item.installation_charge : 0,
          };
        }
        return item;
      });
      saveCart(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
    toast.success("Cart cleared");
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity + item.installation_charge,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleInstallation,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
