// Environment configuration
export const ENV = {
  CONTRACT_ADDRESS: (import.meta as any).env?.VITE_CONTRACT_ADDRESS || '',
  INFURA_KEY: (import.meta as any).env?.VITE_INFURA_KEY || '',
  PINATA_JWT: (import.meta as any).env?.VITE_PINATA_JWT || '',
  PINATA_GATEWAY: (import.meta as any).env?.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud',
  NODE_ENV: (import.meta as any).env?.MODE || 'development'
};

export default ENV;