const Payment = require('../models/paymentModel')

const getPaymentSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    let filter = { status: 'success' }

    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00.000`)
      const end = new Date(`${endDate}T23:59:59.999`)
      filter.createdAt = { $gte: start, $lte: end }
    }

    const payments = await Payment.find(filter)

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0)
    const totalTransactions = payments.length

    // Inisialisasi default
    let growth = 0
    let yesterdayRevenue = 0
    let yesterdayPayments = []

    // Hitung growth jika startDate === endDate (perbandingan hari ke hari)
    if (startDate && endDate && startDate === endDate) {
      const yesterday = new Date(startDate)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)

      yesterdayPayments = await Payment.find({
        status: 'success',
        createdAt: {
          $gte: new Date(`${yesterdayStr}T00:00:00.000`),
          $lte: new Date(`${yesterdayStr}T23:59:59.999`)
        }
      })

      yesterdayRevenue = yesterdayPayments.reduce((acc, curr) => acc + curr.amount, 0)

      if (yesterdayRevenue === 0 && totalRevenue > 0) {
        growth = 100
      } else if (yesterdayRevenue > 0) {
        growth = ((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      } else {
        growth = 0
      }

      console.log("Start Date:", startDate)
      console.log("End Date:", endDate)
      console.log("Yesterday:", yesterdayStr)
      console.log("Yesterday Payments:", yesterdayPayments.length)
      console.log("Yesterday Revenue:", yesterdayRevenue)
      console.log("Today Revenue:", totalRevenue)
      console.log("Growth:", growth)
    }

    // 💡 Ringkasan Per Hari
    const revenueByDay = {}
    payments.forEach(payment => {
      const day = payment.createdAt.toISOString().slice(0, 10)
      revenueByDay[day] = (revenueByDay[day] || 0) + payment.amount
    })

    // 💡 Ringkasan Per Bulan
    const revenueByMonth = {}
    payments.forEach(payment => {
      const month = payment.createdAt.toISOString().slice(0, 7)
      revenueByMonth[month] = (revenueByMonth[month] || 0) + payment.amount
    })

    // ✅ Respons akhir
    res.json({
      today: {
        revenue: totalRevenue,
        transactions: totalTransactions
      },
      yesterday: {
        revenue: yesterdayRevenue,
        transactions: yesterdayPayments.length
      },
      growth: parseFloat(growth.toFixed(2)),
      revenueByDay,
      revenueByMonth
    })


  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Gagal mengambil ringkasan pembayaran', error })
  }
}

module.exports = { getPaymentSummary }
