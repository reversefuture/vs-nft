// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
/**
 * @title VSPostNFT
 * @dev NFT contract for creating unique digital posts with deterministic token IDs
 * Same image hash + text content will always generate the same token ID
 */
contract VSPostNFT is ERC721, ERC721URIStorage, Ownable {
    
    // Events
    event PostMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string imageHash,
        string textContent,
        string tokenURI,
        uint256 timestamp
    );
    
    event PostUpdated(
        uint256 indexed tokenId,
        string newTokenURI,
        uint256 timestamp
    );
    
    // Structs
    struct Post {
        string imageHash;      // MD5 hash of the image
        string textContent;    // Text content of the post
        address creator;       // Original creator
        uint256 createdAt;     // Creation timestamp
        uint256 updatedAt;     // Last update timestamp
        bool exists;           // Whether the post exists
    }
    
    // State variables
    mapping(uint256 => Post) public posts;
    mapping(bytes32 => uint256) public contentHashToTokenId;
    mapping(uint256 => bool) public tokenExists;
    
    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY = 1000000; // Maximum number of NFTs
    
    // Minting fee (can be set by owner)
    uint256 public mintingFee = 0.001 ether;
    
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {}
    
    /**
     * @dev Generate deterministic token ID from image hash and text content
     * @param imageHash MD5 hash of the image
     * @param textContent Text content of the post
     * @return tokenId Deterministic token ID
     */
    function generateTokenId(
        string memory imageHash,
        string memory textContent
    ) public pure returns (uint256) {
        bytes32 hash = keccak256(abi.encodePacked(imageHash, textContent));
        return uint256(hash);
    }
    
    /**
     * @dev Mint a new NFT or return existing token ID if content already exists
     * @param imageHash MD5 hash of the image
     * @param textContent Text content of the post
     * @param _tokenURI IPFS URI for the NFT metadata
     * @return tokenId The token ID (new or existing)
     * @return isNewMint Whether this is a new mint or existing token
     */
    function mintPost(
        string memory imageHash,
        string memory textContent,
        string memory _tokenURI
    ) external payable returns (uint256 tokenId, bool isNewMint) {
        require(bytes(imageHash).length > 0, "Image hash cannot be empty");
        require(bytes(textContent).length > 0, "Text content cannot be empty");
        require(bytes(_tokenURI).length > 0, "Token URI cannot be empty");
        require(msg.value >= mintingFee, "Insufficient minting fee");
        require(totalSupply < MAX_SUPPLY, "Maximum supply reached");
        
        // Generate deterministic token ID
        tokenId = generateTokenId(imageHash, textContent);
        bytes32 contentHash = keccak256(abi.encodePacked(imageHash, textContent));
        
        // Check if this content already exists
        if (contentHashToTokenId[contentHash] != 0) {
            // Content already exists, return existing token ID
            tokenId = contentHashToTokenId[contentHash];
            isNewMint = false;
            
            // Refund the minting fee since no new token is created
            payable(msg.sender).transfer(msg.value);
            
            return (tokenId, isNewMint);
        }
        
        // Mint new token
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // Store post data
        posts[tokenId] = Post({
            imageHash: imageHash,
            textContent: textContent,
            creator: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });
        
        // Map content hash to token ID
        contentHashToTokenId[contentHash] = tokenId;
        tokenExists[tokenId] = true;
        totalSupply++;
        
        isNewMint = true;
        
        emit PostMinted(
            tokenId,
            msg.sender,
            imageHash,
            textContent,
            _tokenURI,
            block.timestamp
        );
        
        return (tokenId, isNewMint);
    }
    
    /**
     * @dev Update token URI (only by token owner or approved)
     * @param tokenId Token ID to update
     * @param newTokenURI New IPFS URI for the NFT metadata
     */
    function updateTokenURI(
        uint256 tokenId,
        string memory newTokenURI
    ) external {
        require(tokenExists[tokenId], "Token does not exist");
        require(
            _isAuthorized(ownerOf(tokenId), msg.sender, tokenId),
            "Not owner or approved"
        );
        require(bytes(newTokenURI).length > 0, "Token URI cannot be empty");
        
        _setTokenURI(tokenId, newTokenURI);
        posts[tokenId].updatedAt = block.timestamp;
        
        emit PostUpdated(tokenId, newTokenURI, block.timestamp);
    }
    
    /**
     * @dev Get post data by token ID
     * @param tokenId Token ID to query
     * @return post Post data
     */
    function getPost(uint256 tokenId) external view returns (Post memory post) {
        require(tokenExists[tokenId], "Token does not exist");
        return posts[tokenId];
    }
    
    /**
     * @dev Check if content already exists and return token ID
     * @param imageHash MD5 hash of the image
     * @param textContent Text content of the post
     * @return exists Whether the content exists
     * @return tokenId Token ID if exists, 0 otherwise
     */
    function checkContentExists(
        string memory imageHash,
        string memory textContent
    ) external view returns (bool exists, uint256 tokenId) {
        bytes32 contentHash = keccak256(abi.encodePacked(imageHash, textContent));
        tokenId = contentHashToTokenId[contentHash];
        exists = tokenId != 0;
        return (exists, tokenId);
    }
    
    /**
     * @dev Get all tokens owned by an address
     * @param owner Address to query
     * @return tokenIds Array of token IDs owned by the address
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory tokenIds) {
        uint256 balance = balanceOf(owner);
        tokenIds = new uint256[](balance);
        
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalSupply && currentIndex < balance; i++) {
            if (tokenExists[i] && ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Set minting fee (only owner)
     * @param newFee New minting fee in wei
     */
    function setMintingFee(uint256 newFee) external onlyOwner {
        mintingFee = newFee;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Emergency withdraw for specific amount (only owner)
     * @param amount Amount to withdraw in wei
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    

}