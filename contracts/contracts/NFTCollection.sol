// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTCollection
 * @dev Custom NFT Collection contract for minting unique NFTs
 * Users can mint NFTs from this collection and list them on the marketplace
 * Supports minting with native token (HYPE) or ERC20 (USDC)
 */
contract NFTCollection is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Collection metadata
    string public collectionURI;
    uint256 public maxSupply;
    uint256 public mintPrice;
    bool public paused;

    // Payment configuration
    address public paymentToken; // Address of ERC20 token for payment (USDC), zero address for native token
    bool public useERC20Payment; // True if using ERC20, false for native token

    // Events
    event NFTMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string tokenURI
    );
    event CollectionURIUpdated(string newURI);
    event MintPriceUpdated(uint256 newPrice);
    event PausedStateChanged(bool isPaused);
    event PaymentTokenUpdated(address indexed token, bool useERC20);

    /**
     * @dev Constructor to initialize the NFT collection
     * @param name_ Name of the NFT collection
     * @param symbol_ Symbol of the NFT collection
     * @param collectionURI_ URI for collection metadata
     * @param maxSupply_ Maximum number of NFTs that can be minted (0 for unlimited)
     * @param mintPrice_ Price to mint an NFT (in wei or ERC20 smallest unit)
     * @param paymentToken_ Address of ERC20 payment token (USDC), zero address for native token
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory collectionURI_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        address paymentToken_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        collectionURI = collectionURI_;
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        paused = false;
        paymentToken = paymentToken_;
        useERC20Payment = paymentToken_ != address(0);
    }

    /**
     * @dev Mint a new NFT
     * @param to Address to mint the NFT to
     * @param tokenURI_ URI for the token metadata
     */
    function mint(
        address to,
        string memory tokenURI_
    ) public payable returns (uint256) {
        require(!paused, "Minting is paused");

        if (maxSupply > 0) {
            require(_tokenIdCounter < maxSupply, "Max supply reached");
        }

        // Handle payment
        if (useERC20Payment) {
            require(msg.value == 0, "Send ERC20, not native token");
            if (mintPrice > 0) {
                require(
                    IERC20(paymentToken).transferFrom(
                        msg.sender,
                        address(this),
                        mintPrice
                    ),
                    "ERC20 transfer failed"
                );
            }
        } else {
            require(msg.value >= mintPrice, "Insufficient payment");
        }

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        emit NFTMinted(to, tokenId, tokenURI_);

        return tokenId;
    }

    /**
     * @dev Batch mint multiple NFTs
     * @param to Address to mint the NFTs to
     * @param tokenURIs Array of token URIs
     */
    function batchMint(
        address to,
        string[] memory tokenURIs
    ) public payable returns (uint256[] memory) {
        require(!paused, "Minting is paused");

        uint256 totalPrice = mintPrice * tokenURIs.length;

        // Handle payment
        if (useERC20Payment) {
            require(msg.value == 0, "Send ERC20, not native token");
            if (totalPrice > 0) {
                require(
                    IERC20(paymentToken).transferFrom(
                        msg.sender,
                        address(this),
                        totalPrice
                    ),
                    "ERC20 transfer failed"
                );
            }
        } else {
            require(msg.value >= totalPrice, "Insufficient payment");
        }

        uint256[] memory tokenIds = new uint256[](tokenURIs.length);

        for (uint256 i = 0; i < tokenURIs.length; i++) {
            if (maxSupply > 0) {
                require(_tokenIdCounter < maxSupply, "Max supply reached");
            }

            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;

            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);

            tokenIds[i] = tokenId;
            emit NFTMinted(to, tokenId, tokenURIs[i]);
        }

        return tokenIds;
    }

    /**
     * @dev Update collection URI
     * @param newURI New collection URI
     */
    function setCollectionURI(string memory newURI) public onlyOwner {
        collectionURI = newURI;
        emit CollectionURIUpdated(newURI);
    }

    /**
     * @dev Update mint price
     * @param newPrice New mint price (in wei or ERC20 smallest unit)
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    /**
     * @dev Update payment token
     * @param token Address of ERC20 token (USDC), zero address for native token
     */
    function setPaymentToken(address token) public onlyOwner {
        paymentToken = token;
        useERC20Payment = token != address(0);
        emit PaymentTokenUpdated(token, useERC20Payment);
    }

    /**
     * @dev Pause or unpause minting
     * @param isPaused Whether to pause minting
     */
    function setPaused(bool isPaused) public onlyOwner {
        paused = isPaused;
        emit PausedStateChanged(isPaused);
    }

    /**
     * @dev Get total number of minted NFTs
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Withdraw contract balance (native token)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Withdraw ERC20 tokens (USDC)
     * @param token Address of ERC20 token to withdraw
     */
    function withdrawERC20(address token) public onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No ERC20 balance to withdraw");
        require(
            IERC20(token).transfer(owner(), balance),
            "ERC20 transfer failed"
        );
    }

    /**
     * @dev Override required by Solidity
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
