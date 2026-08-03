import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services";
import { getMessage } from "../services/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState(null);
  const [count, setCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [total, setTotal] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      setCount(0);
      setSubtotal(0);
      setDiscount(0);
      setDeliveryCharge(0);
      setTotal(0);
      setCouponCode("");
      return;
    }
    try {
      setLoading(true);
      const { data } = await cartService.getCart();
      setCart(data.cart);
      setCount(data.count || 0);
      setSubtotal(data.subtotal || 0);
      setDiscount(data.discount || 0);
      setDeliveryCharge(data.deliveryCharge || 0);
      setTotal(data.total || 0);
      setCouponCode(data.couponCode || "");
    } catch (error) {
      console.error("Load cart error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart, user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return { success: false, message: "Please login to add items to your cart" };
    try {
      const { data } = await cartService.add(productId, quantity);
      setCart(data.cart);
      setCount(data.count);
      setSubtotal(data.subtotal);
      setDiscount(data.discount);
      setDeliveryCharge(data.deliveryCharge);
      setTotal(data.total);
      setCouponCode(data.couponCode || "");
      showToast("Added to cart", "success");
      return { success: true };
    } catch (error) {
      const msg = getMessage(error, "Could not add to cart");
      showToast(msg, "error");
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      const { data } = await cartService.updateQty(productId, quantity);
      setCart(data.cart);
      setCount(data.count);
      setSubtotal(data.subtotal);
      setDiscount(data.discount);
      setDeliveryCharge(data.deliveryCharge);
      setTotal(data.total);
      setCouponCode(data.couponCode || "");
    } catch (error) {
      showToast(getMessage(error, "Could not update quantity"), "error");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await cartService.remove(productId);
      setCart(data.cart);
      setCount(data.count);
      setSubtotal(data.subtotal);
      setDiscount(data.discount);
      setDeliveryCharge(data.deliveryCharge);
      setTotal(data.total);
      setCouponCode(data.couponCode || "");
      showToast("Removed from cart", "info");
    } catch (error) {
      showToast(getMessage(error, "Could not remove item"), "error");
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clear();
      await loadCart();
    } catch (error) {
      showToast(getMessage(error, "Could not clear cart"), "error");
    }
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await cartService.applyCoupon(code);
      setDiscount(data.discount);
      setCouponCode(data.couponCode);
      showToast(data.message, "success");
      await loadCart();
      return { success: true };
    } catch (error) {
      showToast(getMessage(error, "Invalid coupon"), "error");
      return { success: false, message: getMessage(error) };
    }
  };

  const removeCoupon = async () => {
    try {
      await cartService.removeCoupon();
      setCouponCode("");
      await loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        subtotal,
        discount,
        deliveryCharge,
        total,
        couponCode,
        loading,
        loadCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
