// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTPostMinter
 * @dev ERC721 contract for minting NFTs from posts with content hash deduplication
 */
contract NFTPostMinter is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Mapping from content hash to token ID
    mapping(string => uint256) private _contentHashToTokenId;
    
    // Mapping to check if content hash exists
    mapping(string => bool) private _contentHashExists;
    
    // Mapping from token ID to content hash
    mapping(uint256 => string) private _tokenIdToContentHash;

    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string contentHash,
        string tokenURI
    );

    constructor() ERC721("NFTPostMinter", "NFTPM") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    /**
     * @dev Mint a new NFT with content hash deduplication
     * @param to Address to mint the NFT to
     * @param tokenURI_ Metadata URI for the NFT
     * @param contentHash Unique hash of the content (image + text)
     * @return tokenId The ID of the minted token
     */
    function mintNFT(
        address to,
        string memory tokenURI_,
        string memory contentHash
    ) public returns (uint256) {
        require(bytes(contentHash).length > 0, "Content hash cannot be empty");
        require(bytes(tokenURI_).length > 0, "Token URI cannot be empty");
        
        // Check if this content hash already exists
        if (_contentHashExists[contentHash]) {
            // Return existing token ID instead of minting new one
            return _contentHashToTokenId[contentHash];
        }

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        // Store content hash mappings
        _contentHashToTokenId[contentHash] = tokenId;
        _contentHashExists[contentHash] = true;
        _tokenIdToContentHash[tokenId] = contentHash;

        emit NFTMinted(to, tokenId, contentHash, tokenURI_);
        
        return tokenId;
    }

    /**
     * @dev Check if a content hash already exists
     * @param contentHash The content hash to check
     * @return bool True if the content hash exists
     */
    function contentHashExists(string memory contentHash) public view returns (bool) {
        return _contentHashExists[contentHash];
    }

    /**
     * @dev Get token ID by content hash
     * @param contentHash The content hash to look up
     * @return uint256 The token ID associated with the content hash
     */
    function getTokenByContentHash(string memory contentHash) public view returns (uint256) {
        require(_contentHashExists[contentHash], "Content hash does not exist");
        return _contentHashToTokenId[contentHash];
    }

    /**
     * @dev Get content hash by token ID
     * @param tokenId The token ID to look up
     * @return string The content hash associated with the token ID
     */
    function getContentHashByTokenId(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenIdToContentHash[tokenId];
    }

    /**
     * @dev Get the total number of tokens minted
     * @return uint256 The total supply of tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // The following functions are overrides required by Solidity.
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