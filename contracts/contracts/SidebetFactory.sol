// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Campaign.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ==========================================
// FACTORY
// ==========================================
contract SidebetFactory is Ownable {
    address[] public campaigns;
    address public oracle;
    address public treasury;

    event CampaignCreated(address campaignAddress, string question, uint256 targetPrice, uint256 lockTime);

    // Provide the trusted oracle and treasury wallet addresses on deployment
    constructor(address _oracle, address _treasury) Ownable(msg.sender) {
        oracle = _oracle;
        treasury = _treasury;
    }

    function createCampaign(
        string memory _question,
        uint256 _targetPrice,
        uint256 _durationSeconds,
        uint256 _feeBP // Ex: 1000 for 10%
    ) external returns (address) {
        Campaign newCampaign = new Campaign(
            _question,
            _targetPrice,
            _durationSeconds,
            oracle,
            _feeBP,
            treasury
        );
        campaigns.push(address(newCampaign));
        
        emit CampaignCreated(address(newCampaign), _question, _targetPrice, block.timestamp + _durationSeconds);
        return address(newCampaign);
    }

    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }
}
