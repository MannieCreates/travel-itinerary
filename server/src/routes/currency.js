import express from 'express';
import axios from 'axios';

const router = express.Router();

// Mock exchange rates data
const mockExchangeRates = {
  result: "success",
  documentation: "https://www.exchangerate-api.com/docs",
  terms_of_use: "https://www.exchangerate-api.com/terms",
  time_last_update_unix: 1745861000,
  time_last_update_utc: "Sat, 20 Apr 2024 00:00:01 +0000",
  time_next_update_unix: 1745947401,
  time_next_update_utc: "Sun, 21 Apr 2024 00:00:01 +0000",
  base_code: "USD",
  conversion_rates: {
    "USD": 1,
    "EUR": 0.93,
    "GBP": 0.79,
    "JPY": 154.75,
    "CAD": 1.37,
    "AUD": 1.51,
    "CNY": 7.24,
    "INR": 83.47,
    "SGD": 1.35,
    "CHF": 0.91,
    "BDT": 110.25
  }
};

// Cache for exchange rates
let exchangeRatesCache = {
  rates: mockExchangeRates,
  lastUpdated: new Date()
};

// Supported currencies
const supportedCurrencies = [
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' }
];

// Get all supported currencies
router.get('/supported', (req, res) => {
  res.json(supportedCurrencies);
});

// Get exchange rates
router.get('/rates', async (req, res) => {
  try {
    // Always return our mock data
    res.json(mockExchangeRates);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ message: 'Error fetching exchange rates', error: error.message });
  }
});

// Convert amount between currencies
router.get('/convert', async (req, res) => {
  try {
    const { amount, from, to } = req.query;

    if (!amount || !from || !to) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Validate currencies
    const validFrom = supportedCurrencies.find(c => c.code === from.toUpperCase());
    const validTo = supportedCurrencies.find(c => c.code === to.toUpperCase());

    if (!validFrom || !validTo) {
      return res.status(400).json({ message: 'Unsupported currency' });
    }

    // Use our mock exchange rates
    const rates = mockExchangeRates;

    // Convert amount
    const fromRate = rates.conversion_rates[from.toUpperCase()];
    const toRate = rates.conversion_rates[to.toUpperCase()];

    if (!fromRate || !toRate) {
      return res.status(400).json({ message: 'Currency not available for conversion' });
    }

    // Convert to USD first, then to target currency
    const amountInUSD = parseFloat(amount) / fromRate;
    const convertedAmount = amountInUSD * toRate;

    res.json({
      from: {
        currency: from.toUpperCase(),
        amount: parseFloat(amount)
      },
      to: {
        currency: to.toUpperCase(),
        amount: Math.round(convertedAmount * 100) / 100
      },
      rate: toRate / fromRate,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({ message: 'Error converting currency', error: error.message });
  }
});

export default router;
