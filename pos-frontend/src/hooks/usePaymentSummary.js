import { useQuery } from '@tanstack/react-query'
import api from '../https/axiosWrapper'

const fetchPaymentSummary = async (today) => {
  const res = await api.get('/api/report/payment-summary', {
    params: {
      startDate: today,
      endDate: today,
      _: Date.now(),
    },
    headers: {
      'Cache-Control': 'no-store',
      'If-None-Match': '',
    },
  })

  const raw = res.data

  const yesterdayPayments = raw.yesterday?.transactions || 0
  const todayPayments = raw.today?.transactions || 0
  const yesterdayRevenue = raw.yesterday?.revenue || 0
  const todayRevenue = raw.today?.revenue || 0

  const transactionGrowth = yesterdayPayments === 0
    ? (todayPayments > 0 ? 100 : 0)
    : Math.round(((todayPayments - yesterdayPayments) / yesterdayPayments) * 100)

  const revenueGrowth = yesterdayRevenue === 0
    ? (todayRevenue > 0 ? 100 : 0)
    : Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)

  return {
    totalRevenue: todayRevenue,
    revenueGrowth,
    totalTransactions: todayPayments,
    transactionGrowth,
  }
}



export const usePaymentSummary = () => {
  const today = new Date().toISOString().slice(0, 10)

  return useQuery({
    queryKey: ['payment-summary', today],
    queryFn: () => fetchPaymentSummary(today),
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}
