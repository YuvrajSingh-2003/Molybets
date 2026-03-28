// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ==========================================
// CAMPAIGN (PREDICTION MARKET TICKET)
// ==========================================
contract Campaign is ERC721, Ownable {
    string public question;
    uint256 public targetPrice;
    uint256 public lockTime;
    
    uint256 public yesPool;
    uint256 public noPool;
    
    bool public resolved;
    uint8 public winningSide;
    
    address public oracle;
    uint256 public feeBP;
    address public treasury;

    uint256 private _nextTokenId;

    mapping(uint256 => uint8) public tokenSide;
    mapping(uint256 => uint256) public tokenStake;

    constructor(
        string memory _question,
        uint256 _targetPrice,
        uint256 _durationSeconds,
        address _oracle,
        uint256 _feeBP,
        address _treasury
    ) ERC721("Molybets Ticket", "MBOL") Ownable(msg.sender) {
        question = _question;
        targetPrice = _targetPrice;
        lockTime = block.timestamp + _durationSeconds;
        oracle = _oracle;
        feeBP = _feeBP;
        treasury = _treasury;
    }

    function join(uint8 _side) external payable {
        require(block.timestamp < lockTime, "Market is locked");
        require(!resolved, "Market already resolved");
        require(msg.value > 0, "Stake must be > 0");
        require(_side == 1 || _side == 0, "Invalid side");

        if (_side == 1) yesPool += msg.value;
        else noPool += msg.value;

        uint256 tokenId = _nextTokenId++;
        tokenSide[tokenId] = _side;
        tokenStake[tokenId] = msg.value;
        
        _mint(msg.sender, tokenId);
    }

    function resolve(uint8 _side) external {
        require(msg.sender == oracle, "Only oracle can resolve");
        require(block.timestamp >= lockTime, "Market not locked yet");
        require(!resolved, "Already resolved");
        
        resolved = true;
        winningSide = _side;

        // Calculate and distribute fee to treasury
        uint256 totalPool = yesPool + noPool;
        uint256 fee = (totalPool * feeBP) / 10000;
        
        if (fee > 0) {
            (bool success, ) = treasury.call{value: fee}("");
            require(success, "Fee transfer failed");
        }
    }

    function getState() external view returns (string memory) {
        if (resolved) return "RESOLVED";
        if (block.timestamp >= lockTime) return "LOCKED";
        return "OPEN";
    }

    function getImpliedOdds() external view returns (uint256, uint256) {
        uint256 total = yesPool + noPool;
        if (total == 0) return (5000, 5000); // Defaults to 50/50 odds initially (5000 BP)
        uint256 yesOdds = (yesPool * 10000) / total;
        uint256 noOdds = (noPool * 10000) / total;
        return (yesOdds, noOdds);
    }

    function getTicketValue(uint256 _tokenId) public view returns (uint256) {
        if (tokenStake[_tokenId] == 0) return 0;
        uint8 side = tokenSide[_tokenId];
        uint256 totalPool = yesPool + noPool;
        
        uint256 fee = (totalPool * feeBP) / 10000;
        uint256 netPool = totalPool - fee;

        uint256 sidePool = side == 1 ? yesPool : noPool;
        if (sidePool == 0) return 0;

        return (tokenStake[_tokenId] * netPool) / sidePool;
    }

    function claim(uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "Not ticket owner");
        require(resolved, "Market not resolved");
        require(tokenSide[_tokenId] == winningSide, "Not winning side");
        
        uint256 payout = getTicketValue(_tokenId);
        
        // Zero-out internal stake mapping tracking and destroy the NFT receipt
        tokenStake[_tokenId] = 0;
        _burn(_tokenId);

        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Payout failed");
    }
}
