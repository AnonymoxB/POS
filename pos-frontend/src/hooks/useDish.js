// src/hooks/useDish.js
import { useState, useEffect, useCallback } from "react";
import { getDishById } from "../https/index";

export function useDish(dishId) {
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDish = useCallback(async () => {
    if (!dishId) return;
    setLoading(true);
    try {
      const res = await getDishById(dishId);
      setDish(res.data?.data || null);
    } catch (err) {
      console.error("Gagal load dish:", err);
      setDish(null);
    } finally {
      setLoading(false);
    }
  }, [dishId]);

  useEffect(() => {
    loadDish();
  }, [loadDish]);

  return { dish, loading, reloadDish: loadDish };
}
