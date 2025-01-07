import axios from 'axios';

const GEONAMES_USERNAME = import.meta.env.VITE_GEONAMES_USERNAME;
const BASE_URL = 'http://api.geonames.org';

// Keep your existing loadCountries function
const loadCountries = async (inputValue) => {
  if (!inputValue) return [];
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${inputValue}`);
    return response.data.map(country => ({
      value: country.cca2,
      label: country.name.common,
      fullData: country
    })).sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error('Error loading countries:', error);
    return [];
  }
};

// Keep your existing getLocationDetails function
const getLocationDetails = async (latitude, longitude) => {
    try {
      const response = await axios.get(`https://api.api-ninjas.com/v1/reversegeocoding`, {
        params: { lat: latitude, lon: longitude },
        headers: { 'X-Api-Key': import.meta.env.VITE_API_NINJAS_KEY },
      });
      
      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        console.log('Raw location data from API:', response.data[0]);
        const result = {
          country: location.country,
          province: location.state || '',
          city: location.name || '',
        };
        console.log('Processed location data:', result);
        return result;
      }
      console.error('No location data received:', response);
      return null;
    } catch (error) {
      console.error('Error getting location details:', error.response?.data || error.message);
      return null;
    }
  };

// New provinces loading using GeoNames
const loadProvinces = async (country) => {
  if (!country) return [];
  try {
    const response = await axios.get(`${BASE_URL}/searchJSON`, {
      params: {
        country: country.value,
        username: GEONAMES_USERNAME,
        maxRows: 1000,
        featureClass: 'A',
        featureCode: 'ADM1',
        style: 'FULL'
      }
    });
    
    if (response.data && response.data.geonames) {
      return response.data.geonames
        .filter(region => region.adminCode1) // Ensure we have a valid admin code
        .map(region => ({
          value: region.adminCode1,
          label: region.name
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return [];
  } catch (error) {
    console.error('Error loading provinces:', error);
    return [];
  }
};

// New cities loading using GeoNames
const loadCities = async (country, province) => {
  if (!country || !province) return [];
  try {
    const response = await axios.get(`${BASE_URL}/searchJSON`, {
      params: {
        country: country.value,
        adminCode1: province.value,
        username: GEONAMES_USERNAME,
        maxRows: 1000,
        featureClass: 'P',
        style: 'FULL'
      }
    });
    
    if (response.data && response.data.geonames) {
      return response.data.geonames
        .map(city => ({
          value: city.geonameId.toString(),
          label: city.name
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return [];
  } catch (error) {
    console.error('Error loading cities:', error);
    return [];
  }
};

export { loadCountries, getLocationDetails, loadProvinces, loadCities };