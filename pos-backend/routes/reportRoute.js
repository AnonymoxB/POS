const express = require('express')
const router = express.Router()
const { getPaymentSummary } = require('../controllers/reportController')

router.get('/payment-summary', getPaymentSummary)

module.exports = router
