// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OndolDojangEscrow
 * @dev Identity-Gated Smart Contract Escrow for GIWA Chain (OP Stack L2)
 * Integrates directly with Dunamu's Dojang identity attestation registry (DojangScroll).
 * Strict verification enforcement with zero fallback loopholes and ReentrancyGuard protection.
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

    // Lock duration before depositor can request a timeout refund (7 days)
    uint256 public constant REFUND_LOCK_PERIOD = 7 days;

    // Reentrancy Guard state
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

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
    event AttesterIdUpdated(bytes32 indexed oldAttesterId, bytes32 indexed newAttesterId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can invoke");
        _;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor(bytes32 _attesterId) {
        attesterId = _attesterId != bytes32(0) ? _attesterId : bytes32(0x64756e616d755f676977615f61747465737465725f6964303030303030303030);
        owner = msg.sender;
        _status = _NOT_ENTERED;
    }

    /**
     * @notice Update attester ID by contract owner
     */
    function setAttesterId(bytes32 _newAttesterId) external onlyOwner {
        require(_newAttesterId != bytes32(0), "Invalid attester ID");
        emit AttesterIdUpdated(attesterId, _newAttesterId);
        attesterId = _newAttesterId;
    }

    /**
     * @notice Deposit ETH into escrow for a target recipient
     * @param _recipient The address intended to receive the funds once identity verified
     */
    function createEscrow(address _recipient) external payable nonReentrant returns (uint256) {
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
     * @notice Release funds to recipient ONLY IF recipient is strictly verified on Dunamu Dojang Registry
     * @dev Zero fallback loopholes: enforces strict IDojangScroll(DOJANG_SCROLL).isVerified() call.
     * @param _id Escrow ID to release
     */
    function releaseOnlyIfVerified(uint256 _id) external nonReentrant {
        Escrow storage item = escrows[_id];
        require(!item.released, "Escrow already released");
        require(!item.refunded, "Escrow already refunded");
        require(item.amount > 0, "No funds in escrow");

        // Strict verification check against official DojangScroll contract without fallback loopholes
        bool verified = IDojangScroll(DOJANG_SCROLL).isVerified(item.recipient, attesterId);
        require(verified, "Recipient address is not verified on Dojang Registry");

        // Check-Effects-Interactions (CEI) Pattern: State update BEFORE external call
        item.released = true;
        (bool sent, ) = item.recipient.call{value: item.amount}("");
        require(sent, "Failed to send Ether to recipient");

        emit EscrowReleased(_id, item.recipient, item.amount);
    }

    /**
     * @notice Refund funds back to original sender if lock period has expired or unverified
     * @param _id Escrow ID to refund
     */
    function refund(uint256 _id) external nonReentrant {
        Escrow storage item = escrows[_id];
        require(msg.sender == item.sender || msg.sender == owner, "Only sender or owner can refund");
        require(!item.released, "Escrow already released");
        require(!item.refunded, "Escrow already refunded");

        // Allow sender refund if timeout lock period has passed OR if owner invokes emergency refund
        if (msg.sender != owner) {
            require(block.timestamp >= item.createdAt + REFUND_LOCK_PERIOD, "Escrow lock period not expired");
        }

        // Check-Effects-Interactions (CEI) Pattern
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
