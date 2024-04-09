import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, Input, Form, Alert, Button } from 'antd';
import './CurrencyConverter.css'; // Import custom CSS for styling

const { Option } = Select;

const CurrencyConverter = () => {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [error, setError] = useState('');
  const [countryFlags, setCountryFlags] = useState({});

  useEffect(() => {
    axios.get('https://api.exchangerate-api.com/v4/latest/USD')
      .then(response => {
        const currencyData = Object.keys(response.data.rates);
        setCurrencies(currencyData);
        fetchCountryFlags(currencyData);
      })
      .catch(error => {
        console.error('Error fetching currencies:', error);
      });
  }, []);

  const fetchCountryFlags = (currencies) => {
    const flags = {};
    const promises = currencies.map(currency =>
      axios.get(`https://restcountries.com/v3.1/currency/${currency}`)
        .then(response => {
          if (response.data.length > 0) {
            let countryCode = response.data[0].cca2.toLowerCase();
            if (currency === 'INR') { 
              countryCode = 'in';
            }
            flags[currency] = `https://flagcdn.com/w80/${countryCode}.png`;
          }
        })
        .catch(error => {
          console.error(`Error fetching country flag for ${currency}:`, error);
        })
    );
  
    Promise.all(promises)
      .then(() => {
        setCountryFlags(flags);
      })
      .catch(error => {
        console.error('Error fetching country flags:', error);
      });
  };
  
  

  const handleCurrencyChange = (value, type) => {
    if (type === 'from') {
      setFromCurrency(value);
    } else {
      setToCurrency(value);
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const convertCurrency = () => {
    if (!fromCurrency || !toCurrency || !amount || isNaN(amount)) {
      setError('Please enter valid data.');
      return;
    }
    axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      .then(response => {
        const exchangeRate = response.data.rates[toCurrency];
        const converted = amount * exchangeRate;
        setConvertedAmount(converted.toFixed(2));
        setError('');
      })
      .catch(error => {
        setError('Error fetching exchange rates. Please try again later.');
        console.error('Error converting currency:', error);
      });
  };

  return (
    <div className="currency-converter-container">
      <h1 className="title">Currency Converter</h1>
      <Form layout="vertical" className="form-container">
        <h4 className="title">Select countryCode</h4>
        <Form.Item label="From">
          <Select defaultValue="" style={{ width: 200 }} onChange={(value) => handleCurrencyChange(value, 'from')}>
            {currencies.map(currency => (
              <Option key={currency} value={currency}>
                <img src={countryFlags[currency]} alt={currency} className="flag-icon" />
                {currency}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="To">
          <Select defaultValue="" style={{ width: 200 }} onChange={(value) => handleCurrencyChange(value, 'to')}>
            {currencies.map(currency => (
              <Option key={currency} value={currency}>
                <img src={countryFlags[currency]} alt={currency} className="flag-icon" />
                {currency}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Amount">
          <Input type="number" onChange={handleAmountChange} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={convertCurrency}>Convert</Button>
        </Form.Item>
        {error && <Alert message={error} type="error" />}
        {convertedAmount > 0 && (
          <p style={{fontWeight:'bolder'}}>{amount} {fromCurrency} equals {convertedAmount} {toCurrency}</p>
        )}
      </Form>
    </div>
  );
};

export default CurrencyConverter;
