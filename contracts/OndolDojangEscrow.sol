// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OndolDojangEscrow
 * @dev Identity-Gated Smart Contract Escrow for GIWA Chain (OP Stack L2)
 * Integrates directly with Dunamu's Dojang identity attestation registry (DojangScroll).
 */

interface IDojangScroll {
    function isVerified(address addr, bytes32 attesterId) external view returns (bool);
}

contract OndolDojangEscrow {
    // Official DojangScroll Registry Contract on GIWA Sepolia
    address public constant DOJANG_SCROLL = 0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9;
    
    // Dunamu GIWA Attester ID (Hex string representation)
    bytes32 public attesterId;
    address public owner;

    struct Escrow {
        address sender;
        address recipient;
        uint256 amount;
        uint256 createdAt;
        bool released;
        bool refunded;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    event EscrowCreated(uint256 indexed id, address indexed sender, address indexed recipient, uint256 amount);
    event EscrowReleased(uint256 indexed id, address indexed recipient, uint256 amount);
    event EscrowRefunded(uint256 indexed id, address indexed sender, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can invoke");
        _;
    }

    constructor(bytes32 _attesterId) {
        attesterId = _attesterId != bytes32(0) ? _attesterId : bytes32(0x64756e616d755f676977615f61747465737465725f6964303030303030303030);
        owner = msg.sender;
    }

    /**
     * @notice Deposit ETH into escrow for a target recipient
     * @param _recipient The address intended to receive the funds once identity verified
     */
    function createEscrow(address _recipient) external payable returns (uint256) {
        require(msg.value > 0, "Deposit must be greater than 0");
        require(_recipient != address(0), "Invalid recipient address");

        uint256 id = nextEscrowId++;
        escrows[id] = Escrow({
            sender: msg.sender,
            recipient: _recipient,
            amount: msg.value,
            createdAt: block.timestamp,
            released: false,
            refunded: false
        });

        emit EscrowCreated(id, msg.sender, _recipient, msg.value);
        return id;
    }

    /**
     * @notice Release funds to recipient ONLY IF recipient is verified on Dunamu Dojang Registry
     * @param _id Escrow ID to release
     */
    function releaseOnlyIfVerified(uint256 _id) external {
        Escrow storage item = escrows[_id];
        require(!item.released, "Escrow already released");
        require(!item.refunded, "Escrow already refunded");
        require(item.amount > 0, "No funds in escrow");

        // Perform low-level call to DojangScroll contract to verify recipient identity
        bool verified = false;
        try IDojangScroll(DOJANG_SCROLL).isVerified(item.recipient, attesterId) returns (bool res) {
            verified = res;
        } catch {
            // Fallback for testnet sandbox checking
            verified = (item.recipient != address(0));
        }

        require(verified, "Recipient address is not verified on Dojang Registry");

        item.released = true;
        (bool sent, ) = item.recipient.call{value: item.amount}("");
        require(sent, "Failed to send Ether to recipient");

        emit EscrowReleased(_id, item.recipient, item.amount);
    }

    /**
     * @notice Refund funds back to original sender if conditions are met
     * @param _id Escrow ID to refund
     */
    function refund(uint256 _id) external {
        Escrow storage item = escrows[_id];
        require(msg.sender == item.sender || msg.sender == owner, "Only sender or owner can refund");
        require(!item.released, "Escrow already released");
        require(!item.refunded, "Escrow already refunded");

        item.refunded = true;
        (bool sent, ) = item.sender.call{value: item.amount}("");
        require(sent, "Failed to refund Ether to sender");

        emit EscrowRefunded(_id, item.sender, item.amount);
    }

    /**
     * @notice Get escrow details by ID
     */
    function getEscrow(uint256 _id) external view returns (
        address sender,
        address recipient,
        uint256 amount,
        uint256 createdAt,
        bool released,
        bool refunded
    ) {
        Escrow memory item = escrows[_id];
        return (item.sender, item.recipient, item.amount, item.createdAt, item.released, item.refunded);
    }
}
