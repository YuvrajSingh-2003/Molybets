// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
    mapping(address => uint256[]) public userTickets;

    event Joined(address user, uint256 tokenId, uint8 side, uint256 amount);
    event Claimed(address user, uint256 tokenId, uint256 payout);
    event Resolved(uint8 winningSide);

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
        require(block.timestamp < lockTime, "Market locked");
        require(!resolved, "Resolved");
        require(msg.value > 0, "No value");
        require(_side == 0 || _side == 1, "Invalid");

        uint256 fee = (msg.value * feeBP) / 10000;
        uint256 net = msg.value - fee;

        (bool success, ) = treasury.call{value: fee}("");
        require(success, "Fee failed");

        if (_side == 1) yesPool += net;
        else noPool += net;

        uint256 tokenId = _nextTokenId++;

        tokenSide[tokenId] = _side;
        tokenStake[tokenId] = net;
        userTickets[msg.sender].push(tokenId);

        _mint(msg.sender, tokenId);

        emit Joined(msg.sender, tokenId, _side, net);
    }

    function resolve(uint8 _side) external {
        require(msg.sender == oracle, "Only oracle");
        require(block.timestamp >= lockTime, "Too early");
        require(!resolved, "Done");

        resolved = true;
        winningSide = _side;

        emit Resolved(_side);
    }

    function getTicketValue(uint256 _tokenId) public view returns (uint256) {
        uint256 stake = tokenStake[_tokenId];
        if (stake == 0) return 0;

        uint256 totalPool = yesPool + noPool;
        uint256 sidePool = tokenSide[_tokenId] == 1 ? yesPool : noPool;

        if (sidePool == 0) return 0;

        return (stake * totalPool) / sidePool;
    }

    function claim(uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "Not owner");
        require(resolved, "Not resolved");
        require(tokenSide[_tokenId] == winningSide, "Lost");
        require(tokenStake[_tokenId] > 0, "Already claimed");

        uint256 payout = getTicketValue(_tokenId);

        tokenStake[_tokenId] = 0;
        _burn(_tokenId);

        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Payout failed");

        emit Claimed(msg.sender, _tokenId, payout);
    }

    function getImpliedOdds() external view returns (uint256, uint256) {
        uint256 total = yesPool + noPool;
        if (total == 0) return (5000, 5000);

        return (
            (yesPool * 10000) / total,
            (noPool * 10000) / total
        );
    }

    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTickets[user];
    }
}

contract SidebetFactory {
    address[] public campaigns;
    address public oracle;
    address public treasury;

    event CampaignCreated(address campaign);

    constructor(address _oracle, address _treasury) {
        oracle = _oracle;
        treasury = _treasury;
    }

    function createCampaign(
        string memory q,
        uint256 t,
        uint256 d,
        uint256 fee
    ) external returns (address) {
        Campaign c = new Campaign(q, t, d, oracle, fee, treasury);
        campaigns.push(address(c));
        emit CampaignCreated(address(c));
        return address(c);
    }

    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }
}
