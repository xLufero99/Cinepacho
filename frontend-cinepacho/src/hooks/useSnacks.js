import { useState, useMemo, useEffect } from 'react';
import { getSnacksBySede } from "../services/snacksService";
import { useBookingContext } from '../contexts/BookingContext';

// Business logic constants
const MAX_QUANTITY_PER_ITEM = 10;
const DEFAULT_CATEGORY = 'all';

export default function useSnacks() {
  // State management
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY);
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Obtener la sede seleccionada del contexto
  const { selectedHeadquarters } = useBookingContext();

  // Load snacks from backend cuando cambia la sede
  useEffect(() => {
    const loadSnacks = async () => {
      if (!selectedHeadquarters?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const data = await getSnacksBySede(selectedHeadquarters.id);
        setSnacks(data);
      } catch (error) {
        console.error('Error loading snacks:', error);
        setSnacks([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadSnacks();
  }, [selectedHeadquarters]);

  // Pure business logic functions
  const calculateItemTotal = (price, quantity) => price * quantity;
  
  const calculateCartTotals = (cartItems) => {
    const subtotal = cartItems.reduce((total, item) => 
      total + calculateItemTotal(item.price, item.quantity), 0
    );
    const points = cartItems.reduce((total, item) => 
      total + (item.points * item.quantity), 0
    );
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return {
      subtotal,
      points,
      itemCount,
      total: subtotal
    };
  };

  const findCartItem = (cartItems, snackId) => 
    cartItems.find(item => item.id === snackId);

  const createCartItem = (snack) => ({ ...snack, quantity: 1 });

  const validateQuantity = (quantity) => Math.min(Math.max(0, quantity), MAX_QUANTITY_PER_ITEM);

  // Computed values (derived state)
  const filteredSnacks = useMemo(() => {
    if (selectedCategory === DEFAULT_CATEGORY) {
      return snacks;
    }
    return snacks.filter(snack => snack.category === selectedCategory);
  }, [selectedCategory, snacks]);

  const cartTotals = useMemo(() => 
    calculateCartTotals(cart), [cart]
  );

  const isCartEmpty = cart.length === 0;

  // Action functions (business logic)
  const addToCart = (snackId) => {
    setCart(prevCart => {
      const existingItem = findCartItem(prevCart, snackId);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === snackId
            ? { ...item, quantity: validateQuantity(item.quantity + 1) }
            : item
        );
      } else {
        const snack = snacks.find(s => s.id === snackId);
        if (snack) {
          return [...prevCart, createCartItem(snack)];
        }
      }
      return prevCart;
    });
  };

  const removeFromCart = (snackId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== snackId));
  };

  const updateQuantity = (snackId, quantity) => {
    const validatedQuantity = validateQuantity(quantity);
    
    if (validatedQuantity === 0) {
      removeFromCart(snackId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === snackId
          ? { ...item, quantity: validatedQuantity }
          : item
      )
    );
  };

  const getItemQuantity = (snackId) => {
    const item = findCartItem(cart, snackId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
  };

  return {
    // State
    cart,
    selectedCategory,
    filteredSnacks,
    cartTotals,
    isCartEmpty,
    loading,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    getItemQuantity,
    clearCart,
    setSelectedCategory,

    // Constants
    MAX_QUANTITY_PER_ITEM,
    DEFAULT_CATEGORY
  };
}