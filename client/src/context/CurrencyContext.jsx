import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supportedCurrencies, setSupportedCurrencies] = useState([
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
  ]);

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    fetchRates();
    fetchSupportedCurrencies();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/currency/rates');
      setRates(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch currency rates');
      console.error('Error fetching currency rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportedCurrencies = async () => {
    try {
      const response = await api.get('/currency/supported');
      setSupportedCurrencies(response.data);
    } catch (err) {
      console.error('Error fetching supported currencies:', err);
    }
  };

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const convertPrice = (amount, fromCurrency = 'USD') => {
    if (!rates || !rates.conversion_rates) {
      return amount;
    }

    if (fromCurrency === currency) {
      return amount;
    }

    // Convert from source currency to USD
    const amountInUSD = fromCurrency === 'USD'
      ? amount
      : amount / rates.conversion_rates[fromCurrency];

    // Convert from USD to target currency
    const convertedAmount = amountInUSD * rates.conversion_rates[currency];

    return Math.round(convertedAmount * 100) / 100;
  };

  const formatPrice = (amount, fromCurrency = 'USD') => {
    const convertedAmount = convertPrice(amount, fromCurrency);
    const currencyInfo = supportedCurrencies.find(c => c.code === currency);

    return `${currencyInfo?.symbol || ''}${convertedAmount.toLocaleString()}`;
  };

  const value = {
    currency,
    supportedCurrencies,
    changeCurrency,
    convertPrice,
    formatPrice,
    loading,
    error,
    refreshRates: fetchRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
