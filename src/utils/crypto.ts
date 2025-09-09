import CryptoJS from 'crypto-js';

/**
 * Calculate MD5 hash of a file
 * @param file File to hash
 * @returns Promise<string> MD5 hash
 */
export const calculateMD5 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        const hash = CryptoJS.MD5(wordArray).toString();
        resolve(hash);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Calculate SHA256 hash of a string
 * @param input String to hash
 * @returns string SHA256 hash
 */
export const calculateSHA256 = (input: string): string => {
  return CryptoJS.SHA256(input).toString();
};

/**
 * Generate deterministic token ID from image hash and text content
 * This mimics the smart contract's generateTokenId function
 * @param imageHash MD5 hash of the image
 * @param textContent Text content of the post
 * @returns string Token ID as hex string
 */
export const generateTokenId = (imageHash: string, textContent: string): string => {
  const combined = imageHash + textContent;
  const hash = CryptoJS.SHA3(combined, { outputLength: 256 });
  return '0x' + hash.toString();
};

/**
 * Validate image file type and size
 * @param file File to validate
 * @returns object Validation result
 */
export const validateImageFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  const errors: string[] = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only JPEG, PNG, GIF, and WebP images are allowed');
  }
  
  if (file.size > maxSize) {
    errors.push('Image size must be less than 10MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Convert file to base64 data URL
 * @param file File to convert
 * @returns Promise<string> Base64 data URL
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Compress image file
 * @param file Image file to compress
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @param quality Compression quality (0-1)
 * @returns Promise<File> Compressed file
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};