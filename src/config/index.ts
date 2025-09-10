const {
  VITE_DEV,
  PINATA_API_KEY,
  PINATA_API_SECRET,
  PINATA_API_JWT,
  VITE_UPLOAD_URL,
} = import.meta.env;
const PROD = VITE_DEV === "false";
export const isDevelopment = !PROD;

const AppConfig = {
  isProduction: PROD,
  isDevelopment,
  PINATA_API_KEY,
  PINATA_API_SECRET,
  PINATA_API_JWT,
  VITE_UPLOAD_URL: VITE_UPLOAD_URL || "",
};

export default AppConfig;
