// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title BiddingWar
/// @notice Contract for game mechanics for the bidding war game.
contract BiddingWar is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using Counters for Counters.Counter;
    using SafeERC20 for IERC20;

    Counters.Counter private _gameIds;

    /* ============ State Variables ============ */

    uint256 constant EXTENSION = 600;
    uint256 constant ROUNDDURATION = 3600;
    uint256 constant COMMISSION = 500;
    uint256 constant DENOMINATOR = 10000;

    uint256 lastRewardedRound;
    address public admin;
    uint256 accumulatedCommision;

    struct RoundStatus {
        uint256 roundId;
        bool isActive;
        uint256 highestBid;
        uint256 timestamp;
        uint256 endTime;
        uint256 totalRewards;
        uint256 commission;
        address previousBidder;
        address highestBidder;
    }
    RoundStatus public round;

    mapping(uint256 => RoundStatus) public roundIdToGame;

    /* ============ Events ============ */

    event BidMade(address indexed _bidder, uint256 _amount, uint256 _timestamp);
    event RewardsDistributed(uint256 _lastRewardedRound);
    event CommissionWithdrawn(uint256 _commission);

    /* ============ Errors ============ */

    error BidTooLow();
    error GameInactive();
    error AlreadyBid();
    error RoundInProgress();
    error CommisionWithdrawFailed();
    error EmergencyWithdrawFailed();
    error RewardDistributionFailed();
    error ZeroAccumulatedCommission();

    /* ============ Modifier ============ */

    modifier isRoundActive() {
        if (!round.isActive || round.endTime <= block.timestamp) {
            revert GameInactive();
            _;
        }
    }
    modifier onlyGameInactive() {
        if (round.isActive) {
            revert RoundInProgress();
        }
        _;
    }
    modifier isBidTooLow(uint256 _amount) {
        if (_amount <= round.highestBid) {
            revert BidTooLow();
        }
        _;
    }

    modifier hasAccumulatedCommission(){
        if(accumulatedCommision == 0){
            revert ZeroAccumulatedCommission();
        }
        _;
    }

    /* ============ Initialization ============ */

    function __BiddingWar_init(address _admin) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        accumulatedCommision = 0;
        admin = _admin;
    }

    /* ============ External Read Functions ============ */

    function getRoundSpecificDetails(uint256 _roundId)
        external
        view
        returns (RoundStatus memory)
    {
        return roundIdToGame[_roundId];
    }

    function getAdmin() external view returns (address) {
        return admin;
    }

    function getAccumulatedCommission() external view returns (uint256) {
        return accumulatedCommision;
    }

    function getCurrentRoundDetails() external view returns (RoundStatus memory) {
        return round;
    }

    function getRoundId() external view returns (uint256) {
        return _gameIds.current();
    }

    function getCurrentRoundEndTime() external view returns (uint256) {
        return round.endTime;
    }

    function highestBidder(uint256 _roundId) external view returns (address) {
        return roundIdToGame[_roundId].highestBidder;
    }


    /* ============ External Write Functions ============ */
    function bid(
        uint256 _amount
    ) external isRoundActive isBidTooLow(_amount) {
        if (round.previousBidder == msg.sender) {
            revert AlreadyBid();
        }
        uint256 amount = _amount;
        uint endTime = round.endTime + EXTENSION;
        uint256 reward = round.totalPrize + amount;
        uint commission = round.commission + (COMMISSION * amount) / 100; // this calculation is wrong as decimal is not handled
        accumulatedCommision += commission;
        round = RoundStatus(
            true,
            amount,
            block.timestamp,
            endTime,
            reward,
            commission,
            msg.sender
        );
    }

    /* ============ Private Functions ============ */
    function _startRound() private {
        _gameIds.increment();
        round.roundId = _gameIds.current();
        round.isActive = true;
        uint256 amount = 0;
        uint endTime = block.timestamp + ROUNDDURATION;
        uint256 reward = round.totalRewards + amount;
        uint commission = (COMMISSION * amount) / 100;
        round = RoundStatus(
            true,
            amount,
            block.timestamp,
            endTime,
            reward,
            commission,
            msg.sender
        );
        roundIdToGame[_gameIds.current()] = round;
    }

    function _resetGame() private {
        delete round;
    }

    function _payRewards(
        uint _netRewards,
        address _highestBidder
    ) private {
        bool success;
        (success, ) = payable(_highestBidder).call{value: _netRewards}("");
        if (!success) {
            revert RewardDistributionFailed();
        }
    }

    function __payCommission(bool _payCommission) private {
        if (_payCommission) {
            (bool success, ) = payable(admin).call{value: accumulatedCommision}("");
            if (!success) {
                revert CommisionWithdrawFailed();
            }
            accumulatedCommision = 0;
            emit CommissionWithdrawn(accumulatedCommision);
        }
    }

    /* ============ Admin Functions ============ */
        function pauseGame() external onlyOwner {
        _pause();
    }

    function unpauseGame() external onlyOwner {
        _unpause();
    }

    function startGame() external onlyOwner onlyGameInactive {
        _startRound();
    }

    function nextRound() external onlyOwner onlyGameInactive {
        _resetGame();
        _startRound();
    }

    function distributeRewards(
        bool _payCommission
    ) external onlyOwner onlyGameInactive {
        for (uint i = lastRewardedRound; i < _gameIds.current(); i++) {
            RoundStatus memory game = roundIdToGame[i];
            address highestBidder = game.highestBidder;
            uint256 commissionAmt = game.commission;
            uint256 totalRewards = game.totalRewards;
            uint256 netRewards = totalRewards - commissionAmt;
            roundIdToGame[i] = game;
            _payRewards(
                netRewards,
                highestBidder,
            );
        }
        _payCommission(_payCommission);
        lastRewardedRound = _gameIds.current();
        emit RewardsDistributed(lastRewardedRound);
    }

    function commisionWithdraw() external onlyOwner hasAccumulatedCommission {
        (bool success, ) = payable(admin()).call{value: accumulatedCommision}("");
        if (!success) {
            revert CommisionWithdrawFailed();
        }
        accumulatedCommision = 0;
        emit CommissionWithdrawn(round.commission);
    }

    function emergencyWithdrawFunds() external onlyOwner whenPaused {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        if (!success) {
            revert EmergencyWithdrawFailed();
        }
    }
}