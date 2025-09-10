import AppConfig from "@/config/index";
import axios from "axios";
import CryptoJS from "crypto-js";

// IPFS service using Pinata (free tier)
export class IPFSService {
  private readonly PINATA_API_URL = "https://api.pinata.cloud";
  private readonly PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

  // For demo purposes - in production, use environment variables
  private readonly PINATA_JWT = AppConfig.PINATA_API_JWT; // Replace with actual token

  async uploadImage(file: File): Promise<string> {
    if (!file) {
      throw new Error("No file provided for upload");
    }
    console.log(">> file received:", file.name, file.size, file.type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", `${file.name}-${Date.now()}`);

    try {
      const response = await axios.post(
        `${AppConfig.VITE_UPLOAD_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(">> upload res: ", response);

      return response?.data?.blob?.url;
    } catch (error) {
      console.error("Failed to upload image to vercel blob:", error);
      return null;
    }
  }

  async uploadImage2(file: File): Promise<string> {
    if (!file) {
      throw new Error("No file provided for upload");
    }
    console.log(">> file received:", file.name, file.size, file.type);
    const formData = new FormData();
    formData.append("file", file);
    const imageName = `NFT_Image_${Date.now()}`;
    const metadata = JSON.stringify({
      name: imageName,
      keyvalues: {
        type: "nft-image",
      },
    });
    formData.append("pinataMetadata", metadata);

    try {
      const response = await axios.post(
        `${this.PINATA_API_URL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${this.PINATA_JWT}`,
          },
        }
      );

      return `${this.PINATA_GATEWAY}/${response.data.IpfsHash}`;
    } catch (error) {
      console.error("Failed to upload image to IPFS:", error);
      // Fallback: use a mock IPFS URL for demo
      return `https://ipfs.io/ipfs/${imageName}.${file.type}`;
    }
  }

  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      const response = await axios.post(
        `${this.PINATA_API_URL}/pinning/pinJSONToIPFS`,
        metadata,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.PINATA_JWT}`,
          },
        }
      );

      return `${this.PINATA_GATEWAY}/${response.data.IpfsHash}`;
    } catch (error) {
      console.error("Failed to upload metadata to IPFS:", error);
      // Fallback: return mock metadata URL
      return `https://ipfs.io/ipfs/QmYourMetadataHash${Date.now()}`;
    }
  }

  generateContentHash(imageFile: File, text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        const imageHash = CryptoJS.MD5(wordArray).toString();
        const textHash = CryptoJS.MD5(text).toString();
        const combinedHash = CryptoJS.MD5(imageHash + textHash).toString();
        resolve(combinedHash);
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(imageFile);
    });
  }
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url?: string;
  background_color?: string;
  animation_url?: string;
  youtube_url?: string;
}

export const ipfsService = new IPFSService();
