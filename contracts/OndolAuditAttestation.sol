// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OndolAuditAttestation
 * @dev On-Chain Smart Contract Audit Attestation Registry for GIWA Chain
 * Stores verifiable security audit reports and grades issued by Ondol AI Security Auditor.
 */

contract OndolAuditAttestation {
    address public owner;

    struct AuditRecord {
        address targetContract;
        uint8 gradeScore; // 5 = S, 4 = A, 3 = B, 2 = C, 1 = D, 0 = F
        uint16 riskScore; // 0 to 1000 (scaled by 10)
        uint32 criticalBugs;
        uint256 timestamp;
        string reportIpfsHash;
        address auditor;
    }

    mapping(address => AuditRecord[]) public contractAudits;
    mapping(bytes32 => bool) public verifiedReports;

    event AuditRecorded(
        address indexed targetContract,
        uint8 gradeScore,
        uint16 riskScore,
        uint32 criticalBugs,
        string reportIpfsHash,
        address indexed auditor
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can invoke");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Records an audit report on-chain for verifiability
     */
    function recordAudit(
        address _targetContract,
        uint8 _gradeScore,
        uint16 _riskScore,
        uint32 _criticalBugs,
        string calldata _reportIpfsHash
    ) external returns (bytes32) {
        require(_targetContract != address(0), "Invalid target contract");
        require(_gradeScore <= 5, "Grade score out of bounds");

        bytes32 reportId = keccak256(abi.encodePacked(_targetContract, block.timestamp, _reportIpfsHash));

        contractAudits[_targetContract].push(AuditRecord({
            targetContract: _targetContract,
            gradeScore: _gradeScore,
            riskScore: _riskScore,
            criticalBugs: _criticalBugs,
            timestamp: block.timestamp,
            reportIpfsHash: _reportIpfsHash,
            auditor: msg.sender
        }));

        verifiedReports[reportId] = true;

        emit AuditRecorded(_targetContract, _gradeScore, _riskScore, _criticalBugs, _reportIpfsHash, msg.sender);
        return reportId;
    }

    /**
     * @notice Fetch total audits recorded for a contract
     */
    function getAuditCount(address _targetContract) external view returns (uint256) {
        return contractAudits[_targetContract].length;
    }

    /**
     * @notice Fetch latest audit record for a contract
     */
    function getLatestAudit(address _targetContract) external view returns (
        uint8 gradeScore,
        uint16 riskScore,
        uint32 criticalBugs,
        uint256 timestamp,
        string memory reportIpfsHash,
        address auditor
    ) {
        uint256 count = contractAudits[_targetContract].length;
        require(count > 0, "No audit records found for contract");

        AuditRecord memory latest = contractAudits[_targetContract][count - 1];
        return (
            latest.gradeScore,
            latest.riskScore,
            latest.criticalBugs,
            latest.timestamp,
            latest.reportIpfsHash,
            latest.auditor
        );
    }
}
