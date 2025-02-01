// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedVPN {
    struct Provider {
        uint256 stakedAmount; 
        uint256 rewardBalance;
        bool isRegistered;
        string ipAddr;
        string location;
    }

    struct Subscription {
        uint256 startTime; 
        uint256 endTime;
        bool isActive;  
        address provider; 
    }

    struct ProviderDetails {
        address providerAddress;
        uint256 stakedAmount;
        uint256 rewardBalance;
        bool isRegistered;
        string ipAddr;
        string location;
    }

    mapping(address => Subscription[]) public userSubscriptions;
    mapping(address => Provider) public providers; 
    uint256 public subscriptionFee; 
    uint256 public providerStakeAmount;
    address public owner; 

    address[] public providerAddresses;

    event Subscribed(address indexed user, address indexed provider, uint256 startTime, uint256 endTime);
    event Unsubscribed(address indexed user, uint256 refundAmount);
    event ProviderRegistered(address indexed provider, uint256 stakedAmount);
    event ProviderRewarded(address indexed provider, uint256 rewardAmount);
    event ProviderWithdrawn(address indexed provider, uint256 amount);
    event Withdrawn(uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyProvider() {
        require(providers[msg.sender].isRegistered, "User is not a registered provider");
        _;
    }

    constructor(uint256 _subscriptionFee, uint256 _providerStakeAmount) {
        owner = msg.sender;
        subscriptionFee = _subscriptionFee;
        providerStakeAmount = _providerStakeAmount;
    }

    function subscribe(address providerAddress, uint256 durationInDays) external payable {
        require(msg.value == subscriptionFee, "Incorrect subscription fee");
        require(providers[providerAddress].isRegistered, "Provider is not registered");

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (durationInDays * 1 days);

        userSubscriptions[msg.sender].push(Subscription(startTime, endTime, true, providerAddress));

        uint256 rewardAmount = msg.value / 2;
        providers[providerAddress].rewardBalance += rewardAmount;

        emit Subscribed(msg.sender, providerAddress, startTime, endTime);
    }

    function unsubscribe(uint256 subscriptionIndex) external {
        require(subscriptionIndex < userSubscriptions[msg.sender].length, "Invalid subscription index");

        Subscription storage sub = userSubscriptions[msg.sender][subscriptionIndex];
        require(sub.isActive, "Subscription is already inactive");

        uint256 timeElapsed = block.timestamp - sub.startTime;
        uint256 totalDuration = sub.endTime - sub.startTime;
        uint256 refundAmount = (subscriptionFee * (totalDuration - timeElapsed)) / totalDuration;

        sub.isActive = false;

        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund failed");

        emit Unsubscribed(msg.sender, refundAmount);
    }

    function registerProvider(string memory _ipAddr, string memory _location) external payable {
        require(msg.value == providerStakeAmount, "Incorrect stake amount");
        require(!providers[msg.sender].isRegistered, "Already registered as a provider");

        providers[msg.sender] = Provider({
            stakedAmount: msg.value,
            rewardBalance: 0,
            isRegistered: true,
            ipAddr: _ipAddr,
            location: _location
        });

        providerAddresses.push(msg.sender);

        emit ProviderRegistered(msg.sender, msg.value);
    }

    function withdrawProviderFunds() external onlyProvider {
        Provider storage provider = providers[msg.sender];
        uint256 totalAmount = provider.rewardBalance;

        require(totalAmount > 0, "No funds to withdraw");

        provider.rewardBalance = 0;

        (bool success, ) = msg.sender.call{value: totalAmount}("");
        require(success, "Withdrawal failed");

        emit ProviderWithdrawn(msg.sender, totalAmount);
    }

    function isSubscribed(address user, address provider) external view returns (bool) {
        Subscription[] memory subs = userSubscriptions[user];
        for (uint256 i = 0; i < subs.length; i++) {
            if (subs[i].provider == provider && subs[i].isActive && block.timestamp <= subs[i].endTime) {
                return true;
            }
        }
        return false;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawn(balance);
    }

    function updateSubscriptionFee(uint256 newFee) external onlyOwner {
        subscriptionFee = newFee;
    }

    function updateProviderStakeAmount(uint256 newAmount) external onlyOwner {
        providerStakeAmount = newAmount;
    }

    function listProviders() external view returns (ProviderDetails[] memory) {
        ProviderDetails[] memory providerDetails = new ProviderDetails[](providerAddresses.length);

        for (uint256 i = 0; i < providerAddresses.length; i++) {
            address providerAddress = providerAddresses[i];
            Provider storage provider = providers[providerAddress];

            providerDetails[i] = ProviderDetails({
                providerAddress: providerAddress,
                stakedAmount: provider.stakedAmount,
                rewardBalance: provider.rewardBalance,
                isRegistered: provider.isRegistered,
                ipAddr: provider.ipAddr,
                location: provider.location
            });
        }

        return providerDetails;
    }

    function getUserSubscriptions(address user) external view returns (Subscription[] memory) {
        return userSubscriptions[user];
    }

}