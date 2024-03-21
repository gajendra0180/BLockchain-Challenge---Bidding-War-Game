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

    uint256 roundExtension;
    uint256 roundDuration;
    uint256 commissionPercent;
    uint256 constant DENOMINATOR = 10000;

    uint256 lastRewardedRound;
    address public admin;

    struct RoundStatus {
        uint256 roundId;
        bool isActive;
        uint256 highestBid;
        uint256 timestamp;
        uint256 endTime;
        uint256 totalRewards;
        uint256 commission;
        address rewardToken;
        address previousBidder;
        address highestBidder;
    }
    RoundStatus public round;

    mapping(uint256 => RoundStatus) public roundIdToGame;

    /* ============ Events ============ */

    event BidMade(address indexed _bidder, uint256 _amount, uint256 _timestamp);
    event RewardsDistributed(uint256 _lastRewardedRound);

    /* ============ Errors ============ */

    error BidTooLow();
    error GameInactive();
    error AlreadyBid();
    error RoundInProgress();

    /* ============ Modifier ============ */

    modifier isRoundActive() {
        _updateState();
        if (!round.isActive || round.endTime <= block.timestamp) {
            revert GameInactive();
        }
        _;
    }
    modifier onlyGameInactive() {
        _updateState();
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

    /* ============ Constructor ============ */
    constructor(
        address _admin,
        uint256 _commissionPercent,
        uint256 _roundDuration,
        uint256 _roundExtension,
        address _rewardToken
    ) initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        admin = _admin;
        commissionPercent = _commissionPercent;
        roundDuration = _roundDuration;
        roundExtension = _roundExtension;
        round = RoundStatus(
            0,
            false,
            block.timestamp,
            0,
            0,
            0,
            0,
            address(_rewardToken),
            address(0),
            address(0)
        );
    }

    /* ============ External Read Functions ============ */

    function getRoundSpecificDetails(
        uint256 _roundId
    ) external view returns (RoundStatus memory) {
        return roundIdToGame[_roundId];
    }

    function getAdmin() external view returns (address) {
        return admin;
    }

    function getAccumulatedCommission(
        uint256 _roundId
    ) external view returns (uint256) {
        return roundIdToGame[_roundId].commission;
    }

    function getCurrentRoundDetails()
        external
        view
        returns (RoundStatus memory)
    {
        return round;
    }

    function getRoundId() external view returns (uint256) {
        return _gameIds.current();
    }

    function getCurrentRoundEndTime() external view returns (uint256) {
        return round.endTime;
    }

    function gethighestBidder(
        uint256 _roundId
    ) external view returns (address) {
        return roundIdToGame[_roundId].highestBidder;
    }

    /* ============ External Write Functions ============ */
    function bid(uint256 _amount) external isRoundActive isBidTooLow(_amount) {
        _updateState();
        address prevBidder = round.highestBidder;
        if (prevBidder == msg.sender) {
            revert AlreadyBid();
        }
        uint256 amount = _amount;
        uint endTime = round.endTime + roundExtension;
        uint256 reward = round.totalRewards + amount;
        uint commission = round.commission +
            (commissionPercent * amount) /
            DENOMINATOR;
        address rewardToken = round.rewardToken;

        IERC20(rewardToken).safeTransferFrom(msg.sender, address(this), amount);

        round = RoundStatus(
            _gameIds.current(),
            true,
            amount,
            block.timestamp,
            endTime,
            reward,
            commission,
            rewardToken,
            prevBidder,
            msg.sender
        );
        roundIdToGame[_gameIds.current()] = round;
    }

    /* ============ Private Functions ============ */
    function _startRound(address rewardToken) private {
        _gameIds.increment();
        round.roundId = _gameIds.current();
        round.isActive = true;
        round.totalRewards = 0;
        uint256 amount = 0;
        uint endTime = block.timestamp + roundDuration;
        uint256 reward = round.totalRewards + amount;
        uint commission = (commissionPercent * amount) / DENOMINATOR;
        round = RoundStatus(
            _gameIds.current(),
            true,
            amount,
            block.timestamp,
            endTime,
            reward,
            commission,
            rewardToken,
            address(0),
            address(0)
        );
        roundIdToGame[_gameIds.current()] = round;
    }

    function _resetGame() private {
        round.isActive = false;
        roundIdToGame[_gameIds.current()] = round;
        delete round;
    }

    function _payRewardsAndCommission(
        uint256 _netRewards,
        uint256 _commissionAmt,
        address _highestBidder,
        address rewardToken
    ) private {
        IERC20(rewardToken).safeTransfer(_highestBidder, _netRewards);
        IERC20(rewardToken).safeTransfer(admin, _commissionAmt);
    }

    function _updateState() private {
        if (round.isActive && round.endTime <= block.timestamp) {
            _resetGame();
        }
    }

    /* ============ Admin Functions ============ */
    function pauseGame() external onlyOwner {
        _pause();
    }

    function unpauseGame() external onlyOwner {
        _unpause();
    }

    function startGame(
        address rewardToken
    ) external onlyOwner onlyGameInactive {
        _startRound(rewardToken);
    }

    function nextRound(
        address rewardToken
    ) external onlyOwner onlyGameInactive {
        _resetGame();
        _startRound(rewardToken);
    }

    function distributeRewards() external onlyOwner onlyGameInactive {
        for (uint i = lastRewardedRound + 1; i <= _gameIds.current(); i++) {
            RoundStatus memory roundInfo = roundIdToGame[i];
            address highestBidder = roundInfo.highestBidder;
            uint256 commissionAmt = roundInfo.commission;
            uint256 totalRewards = roundInfo.totalRewards;
            uint256 netRewards = totalRewards - commissionAmt;
            address rewardToken = roundInfo.rewardToken;
            _payRewardsAndCommission(
                netRewards,
                commissionAmt,
                highestBidder,
                rewardToken
            );
        }
        lastRewardedRound = _gameIds.current() + 1;
        emit RewardsDistributed(lastRewardedRound);
    }

    function setAdmin(address _admin) external onlyOwner {
        admin = _admin;
    }

    function setCommissionPercent(
        uint256 _commissionPercent
    ) external onlyOwner {
        commissionPercent = _commissionPercent;
    }

    function setRoundDuration(uint256 _roundDuration) external onlyOwner {
        roundDuration = _roundDuration;
    }

    function setRoundExtension(uint256 _roundExtension) external onlyOwner {
        roundExtension = _roundExtension;
    }

    function emergencyWithdrawFunds() external onlyOwner whenPaused {
        for (uint i = lastRewardedRound; i < _gameIds.current(); i++) {
            RoundStatus memory roundInfo = roundIdToGame[i];
            uint256 commissionAmt = roundInfo.commission;
            uint256 totalRewards = roundInfo.totalRewards;
            uint256 netRewards = totalRewards - commissionAmt;
            address rewardToken = roundInfo.rewardToken;
            _payRewardsAndCommission(
                netRewards,
                commissionAmt,
                owner(),
                rewardToken
            );
        }
    }
}
