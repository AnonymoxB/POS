import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await axios.get('/api/order') 
      return res.data.data 
    },
  })
}
