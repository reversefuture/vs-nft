const {
    VITE_DEV,
  PINATA_API_KEY,
  PINATA_API_SECRET,
  PINATA_API_JWT,
} = import.meta.env;
const PROD = VITE_DEV === 'false';
export const isDevelopment = !PROD;

const AppConfig = {
  isProduction: PROD,
  isDevelopment,
  PINATA_API_KEY,
  PINATA_API_SECRET,
  PINATA_API_JWT,
};

export default AppConfig;
