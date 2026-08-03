import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { wishlistService } from "../services";
import { getMessage } from "../services/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState(null);
  const [count, setCount] = useState(0);

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlist(null);
      setCount(0);
      return;
    }
    try {
      const { data } = await wishlistService.getWishlist();
      setWishlist(data.wishlist);
      setCount(data.count || 0);
    } catch (error) {
      console.error("Load wishlist error:", error);
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist, user]);

  const isInWishlist = (productId) =>
    wishlist?.items?.some((i) => String(i.product?._id) === String(productId));

  const toggleWishlist = async (productId) => {
    if (!user) {
      showToast("Please login to use wishlist", "error");
      return { success: false };
    }
    try {
      if (isInWishlist(productId)) {
        const { data } = await wishlistService.remove(productId);
        setCount(data.count);
        showToast("Removed from wishlist", "info");
      } else {
        const { data } = await wishlistService.add(productId);
        setCount(data.count);
        showToast("Added to wishlist", "success");
      }
      await loadWishlist();
      return { success: true };
    } catch (error) {
      showToast(getMessage(error, "Could not update wishlist"), "error");
      return { success: false };
    }
  };

  const moveToCart = async (productId) => {
    const result = await toggleWishlist(productId);
    return result;
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, count, loadWishlist, isInWishlist, toggleWishlist, moveToCart }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
