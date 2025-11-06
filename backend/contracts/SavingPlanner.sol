// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Savings Planner - Encrypted Savings Goal Planning System
/// @notice A privacy-preserving savings planning DApp using FHEVM
/// @dev All calculations are performed on encrypted data
contract SavingPlanner is SepoliaConfig {
    // User data structure
    struct UserSavingsData {
        euint32 target;           // Encrypted savings target amount
        euint32 rate;             // Encrypted annual interest rate (in basis points, e.g., 500 = 5%)
        euint32 time;             // Encrypted savings period (in months)
        euint32 currentSaving;    // Encrypted current savings amount
        euint32 requiredSaving;   // Encrypted required periodic saving amount
        euint32 achievability;   // Encrypted achievability rate (currentSaving / requiredSaving)
    }

    // Mapping from user address to their savings data
    mapping(address => UserSavingsData) public userSavingsData;

    /// @notice Submit encrypted savings planning data and calculate savings plan
    /// @param encryptedTarget The encrypted savings target amount
    /// @param encryptedRate The encrypted annual interest rate (in basis points, e.g., 500 = 5%)
    /// @param encryptedTime The encrypted savings period (in months)
    /// @param encryptedCurrentSaving The encrypted current savings amount
    /// @param inputProof The input proof for verification
    function submitSavingsPlan(
        externalEuint32 encryptedTarget,
        externalEuint32 encryptedRate,
        externalEuint32 encryptedTime,
        externalEuint32 encryptedCurrentSaving,
        bytes calldata inputProof,
        uint32 annualRateScaled6,
        uint32 months
    ) external {
        // Convert external encrypted inputs to internal encrypted types
        euint32 target = FHE.fromExternal(encryptedTarget, inputProof);
        euint32 rate = FHE.fromExternal(encryptedRate, inputProof);
        euint32 time = FHE.fromExternal(encryptedTime, inputProof);
        euint32 currentSaving = FHE.fromExternal(encryptedCurrentSaving, inputProof);

        // Compute monthly deposit (requiredSaving) with clear r and m:
        // period = (target - current * (1+i)^m) * i / ((1+i)^m - 1), keep 3 decimals
        // Special case: if r == 0 => period = (target - current) / m, keep 3 decimals

        // Scaling: i keeps 6 decimals (S = 1_000_000). We store result scaled by 1_000 (3 decimals).
        uint256 S = 1_000_000; // 6 decimals scale
        // iScaled rounded to 6 decimals after dividing by 12
        uint256 iScaled = (uint256(annualRateScaled6) + 6) / 12; // rounding half up for division by 12

        euint32 requiredSaving;

        if (annualRateScaled6 == 0) {
            // Linear case: period = (target - current) / m, scaled x1000
            if (months == 0) {
                requiredSaving = FHE.asEuint32(0);
            } else {
                // diffClamped = max(target - current, 0)
                ebool underflowLin = FHE.lt(target, currentSaving);
                euint32 diffClamped = FHE.select(underflowLin, FHE.asEuint32(0), FHE.sub(target, currentSaving));
                euint32 num1000 = FHE.mul(diffClamped, 1000);
                // rounding to nearest 1/1000: + months/2 before dividing by months
                euint32 numRounded = FHE.add(num1000, months / 2);
                requiredSaving = FHE.div(numRounded, months);
            }
        } else {
            // Geometric case
            // Compute AScaled = round((1+i)^m * S) using fixed-point, S=1e6
            uint256 base = S + iScaled;
            uint256 AScaled = S;
            for (uint32 k = 0; k < months; k++) {
                AScaled = (AScaled * base) / S;
            }

            uint256 denomInt = AScaled > S ? (AScaled - S) : 0;
            if (denomInt == 0) {
                // Fallback to linear if denominator degenerate
                if (months == 0) {
                    requiredSaving = FHE.asEuint32(0);
                } else {
                    ebool underflowLin2 = FHE.lt(target, currentSaving);
                    euint32 diffClamped2 = FHE.select(underflowLin2, FHE.asEuint32(0), FHE.sub(target, currentSaving));
                    euint32 num1000 = FHE.mul(diffClamped2, 1000);
                    euint32 numRounded = FHE.add(num1000, months / 2);
                    requiredSaving = FHE.div(numRounded, months);
                }
            } else {
                // curr * A
                euint32 currTimesA = FHE.mul(currentSaving, uint32(AScaled));
                euint32 currARescaled = FHE.div(currTimesA, uint32(S));

                // diffClamped = max(target - current*(1+i)^m, 0)
                ebool underflowGeom = FHE.lt(target, currARescaled);
                euint32 diffClamped = FHE.select(underflowGeom, FHE.asEuint32(0), FHE.sub(target, currARescaled));

                // t = diff * iScaled  (fits in 32-bit for typical inputs)
                euint32 t = FHE.mul(diffClamped, uint32(iScaled));

                // Integer part q0 = floor(t / denom)
                euint32 q0 = FHE.div(t, uint32(denomInt));
                euint32 p0Scaled3 = FHE.mul(q0, 1000);

                // Remainder rem = t - denom * q0
                euint32 denomTimesQ0 = FHE.mul(uint32(denomInt), q0);
                euint32 rem = FHE.sub(t, denomTimesQ0);

                // Fractional 3 digits: d3 = floor((rem * 1000 + denom/2) / denom)
                euint32 rem1000 = FHE.mul(rem, 1000);
                euint32 remRounded = FHE.add(rem1000, uint32(denomInt / 2));
                euint32 d3 = FHE.div(remRounded, uint32(denomInt));

                requiredSaving = FHE.add(p0Scaled3, d3);
            }
        }

        // Calculate achievability = currentSaving / requiredSaving
        // Formula: enc(achievability) = enc(current_saving) / enc(required_saving)
        // Since we cannot divide encrypted by encrypted, we use comparison-based percentage
        
        // Approach: achievability = min(100, currentSaving * 100 / requiredSaving)
        // Since division is not possible, we use: if currentSaving >= requiredSaving then 100% else 0%
        // This gives a binary achievability indicator
        
        // For a more nuanced calculation, we would need to decrypt and calculate off-chain
        // But for on-chain encrypted calculation, we use:
        ebool currentGteRequired = FHE.not(FHE.lt(currentSaving, requiredSaving));
        euint32 achievability = FHE.select(currentGteRequired, FHE.asEuint32(100), FHE.asEuint32(0));

        // Store user data
        UserSavingsData storage data = userSavingsData[msg.sender];
        data.target = target;
        data.rate = rate;
        data.time = time;
        data.currentSaving = currentSaving;
        data.requiredSaving = requiredSaving;
        data.achievability = achievability;

        // Grant permissions for decryption
        FHE.allowThis(data.target);
        FHE.allow(data.target, msg.sender);
        FHE.allowThis(data.rate);
        FHE.allow(data.rate, msg.sender);
        FHE.allowThis(data.time);
        FHE.allow(data.time, msg.sender);
        FHE.allowThis(data.currentSaving);
        FHE.allow(data.currentSaving, msg.sender);
        FHE.allowThis(data.requiredSaving);
        FHE.allow(data.requiredSaving, msg.sender);
        FHE.allowThis(data.achievability);
        FHE.allow(data.achievability, msg.sender);
    }

    /// @notice Get encrypted target for a user
    /// @param userAddress The address of the user
    /// @return The encrypted target
    function getTarget(address userAddress) external view returns (euint32) {
        return userSavingsData[userAddress].target;
    }

    /// @notice Get encrypted rate for a user
    /// @param userAddress The address of the user
    /// @return The encrypted rate
    function getRate(address userAddress) external view returns (euint32) {
        return userSavingsData[userAddress].rate;
    }

    /// @notice Get encrypted time for a user
    /// @param userAddress The address of the user
    /// @return The encrypted time
    function getTime(address userAddress) external view returns (euint32) {
        return userSavingsData[userAddress].time;
    }

    /// @notice Get encrypted current saving for a user
    /// @param userAddress The address of the user
    /// @return The encrypted current saving
    function getCurrentSaving(address userAddress) external view returns (euint32) {
        return userSavingsData[userAddress].currentSaving;
    }

    /// @notice Get encrypted required saving for a user
    /// @param userAddress The address of the user
    /// @return The encrypted required saving
    function getRequiredSaving(address userAddress) external view returns (euint32) {
        return userSavingsData[userAddress].requiredSaving;
    }

    /// @notice Get encrypted achievability for a user
    /// @param userAddress The address of the user
    /// @return The encrypted achievability
    function getAchievability(address userAddress) external view returns (euint32) {
        return userSavingsData[userAddress].achievability;
    }

    /// @notice Calculate and update savings plan for a user (recalculate after updating data)
    /// @dev This function recalculates requiredSaving and achievability based on stored values
    /// Uses the same formula as submitSavingsPlan: required_saving = target / (1 + rate)^time
    function recalculateSavingsPlan() external {
        UserSavingsData storage data = userSavingsData[msg.sender];
        
        // Calculate required_saving = target / (1 + rate)^time using linear approximation
        // Formula: requiredSaving ≈ target - target * rate * time / 10000
        euint32 targetRate = FHE.mul(data.target, data.rate);
        euint32 targetRateTime = FHE.mul(targetRate, data.time);
        euint32 adjustment = FHE.div(targetRateTime, 10000);
        euint32 requiredSaving = FHE.sub(data.target, adjustment);
        
        // Ensure requiredSaving is positive
        ebool isNegative = FHE.lt(requiredSaving, FHE.asEuint32(1));
        requiredSaving = FHE.select(isNegative, FHE.asEuint32(1), requiredSaving);
        
        // Calculate achievability = currentSaving / requiredSaving
        ebool currentGteRequired = FHE.not(FHE.lt(data.currentSaving, requiredSaving));
        euint32 achievability = FHE.select(currentGteRequired, FHE.asEuint32(100), FHE.asEuint32(0));

        data.requiredSaving = requiredSaving;
        data.achievability = achievability;

        // Grant permissions for decryption
        FHE.allowThis(data.requiredSaving);
        FHE.allow(data.requiredSaving, msg.sender);
        FHE.allowThis(data.achievability);
        FHE.allow(data.achievability, msg.sender);
    }

    /// @notice Recalculate required monthly deposit using clear annual rate (6 decimals) and months
    /// @param annualRateScaled6 Annual rate r scaled by 1e6 (e.g., 5% => 50000)
    /// @param months Savings duration in months (m)
    function recalculateSavingsPlanWithParams(uint32 annualRateScaled6, uint32 months) external {
        UserSavingsData storage data = userSavingsData[msg.sender];

        uint256 S = 1_000_000;
        uint256 iScaled = (uint256(annualRateScaled6) + 6) / 12;

        euint32 requiredSaving;

        if (annualRateScaled6 == 0) {
            if (months == 0) {
                requiredSaving = FHE.asEuint32(0);
            } else {
                ebool underflowLin = FHE.lt(data.target, data.currentSaving);
                euint32 diffClamped = FHE.select(underflowLin, FHE.asEuint32(0), FHE.sub(data.target, data.currentSaving));
                euint32 num1000 = FHE.mul(diffClamped, 1000);
                euint32 numRounded = FHE.add(num1000, months / 2);
                requiredSaving = FHE.div(numRounded, months);
            }
        } else {
            uint256 base = S + iScaled;
            uint256 AScaled = S;
            for (uint32 k = 0; k < months; k++) {
                AScaled = (AScaled * base) / S;
            }

            uint256 denomInt = AScaled > S ? (AScaled - S) : 0;
            if (denomInt == 0) {
                if (months == 0) {
                    requiredSaving = FHE.asEuint32(0);
                } else {
                    ebool underflowLin2 = FHE.lt(data.target, data.currentSaving);
                    euint32 diffClamped2 = FHE.select(underflowLin2, FHE.asEuint32(0), FHE.sub(data.target, data.currentSaving));
                    euint32 num1000 = FHE.mul(diffClamped2, 1000);
                    euint32 numRounded = FHE.add(num1000, months / 2);
                    requiredSaving = FHE.div(numRounded, months);
                }
            } else {
                euint32 currTimesA = FHE.mul(data.currentSaving, uint32(AScaled));
                euint32 currARescaled = FHE.div(currTimesA, uint32(S));
                ebool underflowGeom = FHE.lt(data.target, currARescaled);
                euint32 diffClamped = FHE.select(underflowGeom, FHE.asEuint32(0), FHE.sub(data.target, currARescaled));
                euint32 t = FHE.mul(diffClamped, uint32(iScaled));
                euint32 q0 = FHE.div(t, uint32(denomInt));
                euint32 p0Scaled3 = FHE.mul(q0, 1000);
                euint32 denomTimesQ0 = FHE.mul(uint32(denomInt), q0);
                euint32 rem = FHE.sub(t, denomTimesQ0);
                euint32 rem1000 = FHE.mul(rem, 1000);
                euint32 remRounded = FHE.add(rem1000, uint32(denomInt / 2));
                euint32 d3 = FHE.div(remRounded, uint32(denomInt));
                requiredSaving = FHE.add(p0Scaled3, d3);
            }
        }

        ebool currentGteRequired = FHE.not(FHE.lt(data.currentSaving, requiredSaving));
        euint32 achievability = FHE.select(currentGteRequired, FHE.asEuint32(100), FHE.asEuint32(0));

        data.requiredSaving = requiredSaving;
        data.achievability = achievability;

        FHE.allowThis(data.requiredSaving);
        FHE.allow(data.requiredSaving, msg.sender);
        FHE.allowThis(data.achievability);
        FHE.allow(data.achievability, msg.sender);
    }
}

