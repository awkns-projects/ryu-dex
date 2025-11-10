// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

/**
 * @title NFTMarketplace
 * @dev Marketplace for NFT auctions with USDC bidding
 * Supports English auctions where highest bidder wins
 */
contract NFTMarketplace is ReentrancyGuard, Ownable, ERC721Holder {
    // Auction struct
    struct Auction {
        uint256 auctionId;
        address nftContract;
        uint256 tokenId;
        address seller;
        address paymentToken; // USDC contract address
        uint256 minBid;
        uint256 buyoutPrice;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool ended;
        bool cancelled;
    }

    // Direct listing struct for fixed price sales
    struct DirectListing {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address seller;
        address paymentToken; // USDC contract address
        uint256 price;
        bool active;
    }

    // State variables
    uint256 private _auctionIdCounter;
    uint256 private _listingIdCounter;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => DirectListing) public directListings;
    mapping(uint256 => mapping(address => uint256)) public bids; // auctionId => bidder => amount

    uint256 public platformFee; // Fee in basis points (100 = 1%)
    address public feeRecipient;

    // Events
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 minBid,
        uint256 buyoutPrice,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );

    event AuctionCancelled(uint256 indexed auctionId);

    event DirectListingCreated(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    event DirectListingSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price
    );

    event DirectListingCancelled(uint256 indexed listingId);

    event PlatformFeeUpdated(uint256 newFee);

    /**
     * @dev Constructor
     * @param platformFee_ Platform fee in basis points (250 = 2.5%)
     * @param feeRecipient_ Address to receive platform fees
     */
    constructor(
        uint256 platformFee_,
        address feeRecipient_
    ) Ownable(msg.sender) {
        require(platformFee_ <= 1000, "Fee too high"); // Max 10%
        require(feeRecipient_ != address(0), "Invalid fee recipient");
        platformFee = platformFee_;
        feeRecipient = feeRecipient_;
    }

    /**
     * @dev Create a new auction
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID of the NFT
     * @param paymentToken Address of the payment token (USDC)
     * @param minBid Minimum bid amount
     * @param buyoutPrice Buyout price (instant purchase)
     * @param duration Auction duration in seconds
     */
    function createAuction(
        address nftContract,
        uint256 tokenId,
        address paymentToken,
        uint256 minBid,
        uint256 buyoutPrice,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(paymentToken != address(0), "Invalid payment token");
        require(buyoutPrice > minBid, "Buyout must be > min bid");
        require(duration >= 1 hours && duration <= 30 days, "Invalid duration");

        // Transfer NFT to marketplace
        IERC721(nftContract).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId
        );

        uint256 auctionId = _auctionIdCounter++;
        uint256 endTime = block.timestamp + duration;

        auctions[auctionId] = Auction({
            auctionId: auctionId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            paymentToken: paymentToken,
            minBid: minBid,
            buyoutPrice: buyoutPrice,
            startTime: block.timestamp,
            endTime: endTime,
            highestBidder: address(0),
            highestBid: 0,
            ended: false,
            cancelled: false
        });

        emit AuctionCreated(
            auctionId,
            nftContract,
            tokenId,
            msg.sender,
            minBid,
            buyoutPrice,
            endTime
        );

        return auctionId;
    }

    /**
     * @dev Place a bid on an auction
     * @param auctionId ID of the auction
     * @param bidAmount Amount to bid
     */
    function placeBid(
        uint256 auctionId,
        uint256 bidAmount
    ) external nonReentrant {
        Auction storage auction = auctions[auctionId];

        require(!auction.ended, "Auction has ended");
        require(!auction.cancelled, "Auction was cancelled");
        require(block.timestamp >= auction.startTime, "Auction not started");
        require(block.timestamp < auction.endTime, "Auction expired");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(bidAmount >= auction.minBid, "Bid below minimum");
        require(bidAmount > auction.highestBid, "Bid not high enough");

        // Transfer bid amount from bidder to marketplace
        IERC20(auction.paymentToken).transferFrom(
            msg.sender,
            address(this),
            bidAmount
        );

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            IERC20(auction.paymentToken).transfer(
                auction.highestBidder,
                auction.highestBid
            );
        }

        // Update auction state
        auction.highestBidder = msg.sender;
        auction.highestBid = bidAmount;
        bids[auctionId][msg.sender] = bidAmount;

        emit BidPlaced(auctionId, msg.sender, bidAmount);

        // Check for buyout
        if (bidAmount >= auction.buyoutPrice) {
            _endAuction(auctionId);
        }
    }

    /**
     * @dev End an auction (can be called by anyone after endTime)
     * @param auctionId ID of the auction
     */
    function endAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];

        require(!auction.ended, "Auction already ended");
        require(!auction.cancelled, "Auction was cancelled");
        require(block.timestamp >= auction.endTime, "Auction not yet ended");

        _endAuction(auctionId);
    }

    /**
     * @dev Internal function to end an auction
     * @param auctionId ID of the auction
     */
    function _endAuction(uint256 auctionId) private {
        Auction storage auction = auctions[auctionId];
        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            // Calculate platform fee
            uint256 fee = (auction.highestBid * platformFee) / 10000;
            uint256 sellerAmount = auction.highestBid - fee;

            // Transfer payment to seller
            IERC20(auction.paymentToken).transfer(auction.seller, sellerAmount);

            // Transfer platform fee
            if (fee > 0) {
                IERC20(auction.paymentToken).transfer(feeRecipient, fee);
            }

            // Transfer NFT to winner
            IERC721(auction.nftContract).safeTransferFrom(
                address(this),
                auction.highestBidder,
                auction.tokenId
            );

            emit AuctionEnded(
                auctionId,
                auction.highestBidder,
                auction.highestBid
            );
        } else {
            // No bids, return NFT to seller
            IERC721(auction.nftContract).safeTransferFrom(
                address(this),
                auction.seller,
                auction.tokenId
            );

            emit AuctionEnded(auctionId, address(0), 0);
        }
    }

    /**
     * @dev Cancel an auction (only seller, only if no bids)
     * @param auctionId ID of the auction
     */
    function cancelAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];

        require(msg.sender == auction.seller, "Only seller can cancel");
        require(!auction.ended, "Auction has ended");
        require(!auction.cancelled, "Already cancelled");
        require(auction.highestBidder == address(0), "Cannot cancel with bids");

        auction.cancelled = true;

        // Return NFT to seller
        IERC721(auction.nftContract).safeTransferFrom(
            address(this),
            auction.seller,
            auction.tokenId
        );

        emit AuctionCancelled(auctionId);
    }

    /**
     * @dev Get auction details
     * @param auctionId ID of the auction
     */
    function getAuction(
        uint256 auctionId
    ) external view returns (Auction memory) {
        return auctions[auctionId];
    }

    /**
     * @dev Check if auction is active
     * @param auctionId ID of the auction
     */
    function isAuctionActive(uint256 auctionId) external view returns (bool) {
        Auction memory auction = auctions[auctionId];
        return
            !auction.ended &&
            !auction.cancelled &&
            block.timestamp >= auction.startTime &&
            block.timestamp < auction.endTime;
    }

    /**
     * @dev Get all valid (active) auction IDs
     */
    function getAllValidAuctions() external view returns (uint256[] memory) {
        uint256 validCount = 0;

        // Count valid auctions
        for (uint256 i = 0; i < _auctionIdCounter; i++) {
            Auction memory auction = auctions[i];
            if (
                !auction.ended &&
                !auction.cancelled &&
                block.timestamp >= auction.startTime &&
                block.timestamp < auction.endTime
            ) {
                validCount++;
            }
        }

        // Create array of valid auction IDs
        uint256[] memory validAuctions = new uint256[](validCount);
        uint256 index = 0;

        for (uint256 i = 0; i < _auctionIdCounter; i++) {
            Auction memory auction = auctions[i];
            if (
                !auction.ended &&
                !auction.cancelled &&
                block.timestamp >= auction.startTime &&
                block.timestamp < auction.endTime
            ) {
                validAuctions[index] = i;
                index++;
            }
        }

        return validAuctions;
    }

    /**
     * @dev Update platform fee (only owner)
     * @param newFee New fee in basis points
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    /**
     * @dev Update fee recipient (only owner)
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    /**
     * @dev Create a direct listing (fixed price)
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID of the NFT
     * @param paymentToken Address of the payment token (USDC)
     * @param price Fixed sale price
     */
    function createDirectListing(
        address nftContract,
        uint256 tokenId,
        address paymentToken,
        uint256 price
    ) external nonReentrant returns (uint256) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(paymentToken != address(0), "Invalid payment token");
        require(price > 0, "Price must be greater than 0");

        // Transfer NFT to marketplace
        IERC721(nftContract).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId
        );

        uint256 listingId = _listingIdCounter++;

        directListings[listingId] = DirectListing({
            listingId: listingId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            paymentToken: paymentToken,
            price: price,
            active: true
        });

        emit DirectListingCreated(
            listingId,
            nftContract,
            tokenId,
            msg.sender,
            price
        );
        return listingId;
    }

    /**
     * @dev Buy a direct listing
     * @param listingId ID of the listing
     */
    function buyDirectListing(uint256 listingId) external nonReentrant {
        DirectListing storage listing = directListings[listingId];

        require(listing.active, "Listing not active");
        require(msg.sender != listing.seller, "Seller cannot buy");

        listing.active = false;

        // Calculate platform fee
        uint256 fee = (listing.price * platformFee) / 10000;
        uint256 sellerAmount = listing.price - fee;

        // Transfer payment from buyer to seller
        IERC20(listing.paymentToken).transferFrom(
            msg.sender,
            listing.seller,
            sellerAmount
        );

        // Transfer platform fee
        if (fee > 0) {
            IERC20(listing.paymentToken).transferFrom(
                msg.sender,
                feeRecipient,
                fee
            );
        }

        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId
        );

        emit DirectListingSold(listingId, msg.sender, listing.price);
    }

    /**
     * @dev Cancel a direct listing
     * @param listingId ID of the listing
     */
    function cancelDirectListing(uint256 listingId) external nonReentrant {
        DirectListing storage listing = directListings[listingId];

        require(msg.sender == listing.seller, "Only seller can cancel");
        require(listing.active, "Listing not active");

        listing.active = false;

        // Return NFT to seller
        IERC721(listing.nftContract).safeTransferFrom(
            address(this),
            listing.seller,
            listing.tokenId
        );

        emit DirectListingCancelled(listingId);
    }

    /**
     * @dev Get direct listing details
     * @param listingId ID of the listing
     */
    function getDirectListing(
        uint256 listingId
    ) external view returns (DirectListing memory) {
        return directListings[listingId];
    }

    /**
     * @dev Get all active direct listings
     */
    function getAllActiveDirectListings()
        external
        view
        returns (uint256[] memory)
    {
        uint256 activeCount = 0;

        // Count active listings
        for (uint256 i = 0; i < _listingIdCounter; i++) {
            if (directListings[i].active) {
                activeCount++;
            }
        }

        // Create array of active listing IDs
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < _listingIdCounter; i++) {
            if (directListings[i].active) {
                activeListings[index] = i;
                index++;
            }
        }

        return activeListings;
    }

    /**
     * @dev Get total number of auctions created
     */
    function totalAuctions() external view returns (uint256) {
        return _auctionIdCounter;
    }

    /**
     * @dev Get total number of direct listings created
     */
    function totalDirectListings() external view returns (uint256) {
        return _listingIdCounter;
    }
}
