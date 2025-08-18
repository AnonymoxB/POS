import { useQuery } from '@tanstack/react-query';
import { api } from '';

const fetchPopularDishes = async () => {
  try {
    const res = await api.get("/api/order/popular")
    console.log("Popular dishes:", res.data.data)
    return res.data.data
  } catch (err) {
    console.error("Gagal ambil popular dishes", err)
    throw err
  }
}

export const usePopularDishes = () => {
  return useQuery({
    queryKey: ['popularDishes'],
    queryFn: fetchPopularDishes,
    staleTime: 5 * 60 * 1000,
  });
};
