"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useSavingPlanner } from "@/hooks/useSavingPlanner";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { useState } from "react";

/*
 * Main SavingPlanner React component
 */
export const SavingPlannerDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  // FHEVM instance
  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  // SavingPlanner hook
  const savingPlanner = useSavingPlanner({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  // Form state
  const [target, setTarget] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [currentSaving, setCurrentSaving] = useState<string>("");

  const handleSubmit = () => {
    const targetNum = parseInt(target);
    const rateNum = parseInt(rate); // basis points
    const timeNum = parseInt(time);
    const currentSavingNum = parseInt(currentSaving);

    if (isNaN(targetNum) || isNaN(rateNum) || isNaN(timeNum) || isNaN(currentSavingNum)) {
      alert("Please enter valid numbers for all fields");
      return;
    }

    if (targetNum <= 0 || rateNum < 0 || timeNum <= 0 || currentSavingNum < 0) {
      alert("Please enter positive values");
      return;
    }

    savingPlanner.submitSavingsPlan({
      target: targetNum,
      rate: rateNum,
      time: timeNum,
      currentSaving: currentSavingNum,
    });
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="glass-card rounded-3xl p-12 hover-lift">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-orange flex items-center justify-center text-5xl shadow-2xl">
              🔐
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Connect MetaMask to start planning your encrypted savings journey
            </p>
            <button
              className="gradient-green hover:opacity-90 active:scale-95 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isConnected}
              onClick={connect}
            >
              Connect MetaMask Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  const noAddressConfigured = typeof chainId === "number" && !savingPlanner.contractAddress;
  if (noAddressConfigured) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="glass-card rounded-2xl p-8 hover-lift">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Encrypted Savings Calculator
            </h2>
            <p className="text-gray-300 text-lg">
              Calculate your monthly savings goal with complete privacy using FHE technology
            </p>
            <div className="mt-4 inline-block">
              <span className="status-badge info">
                <span className="font-mono text-xs">{savingPlanner.contractAddress?.slice(0, 10)}...{savingPlanner.contractAddress?.slice(-8)}</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Network</p>
            <div className="status-badge success">
              Chain ID: {chainId}
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FHEVM Status Card */}
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg gradient-green flex items-center justify-center text-xl">
              🔒
            </div>
            <h3 className="text-xl font-bold text-white">FHEVM Engine</h3>
          </div>
          <div className="space-y-3">
            <StatusRow 
              label="Instance Status" 
              value={fhevmInstance ? "Ready" : "Initializing"}
              status={fhevmInstance ? "success" : "warning"}
            />
            <StatusRow 
              label="Connection" 
              value={fhevmStatus}
              status="info"
            />
            <StatusRow 
              label="Error State" 
              value={fhevmError ? (fhevmError instanceof Error ? fhevmError.message : fhevmError) : "No Errors"}
              status={fhevmError ? "warning" : "success"}
            />
          </div>
        </div>

        {/* Operation Status Card */}
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center text-xl">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white">Operation Status</h3>
          </div>
          <div className="space-y-3">
            <StatusRow 
              label="Can Submit" 
              value={savingPlanner.canSubmit}
              status={savingPlanner.canSubmit ? "success" : "warning"}
            />
            <StatusRow 
              label="Submitting" 
              value={savingPlanner.isSubmitting}
              status={savingPlanner.isSubmitting ? "warning" : "info"}
            />
            <StatusRow 
              label="Can Decrypt" 
              value={savingPlanner.canDecrypt}
              status={savingPlanner.canDecrypt ? "success" : "warning"}
            />
            <StatusRow 
              label="Decrypting" 
              value={savingPlanner.isDecrypting}
              status={savingPlanner.isDecrypting ? "warning" : "info"}
            />
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="glass-card rounded-2xl p-8 hover-lift">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-green flex items-center justify-center text-xl">
            📊
          </div>
          <h3 className="text-2xl font-bold text-white">Calculate Your Savings Plan</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Savings Target"
            value={target}
            onChange={setTarget}
            placeholder="e.g., 100000"
            description="Your total savings goal amount"
            icon="🎯"
          />
          <InputField
            label="Annual Interest Rate"
            value={rate}
            onChange={setRate}
            placeholder="e.g., 500 (=5%)"
            description="Rate in basis points (500 = 5%)"
            icon="📈"
          />
          <InputField
            label="Time Period"
            value={time}
            onChange={setTime}
            placeholder="e.g., 12"
            description="Number of months to reach goal"
            icon="📅"
          />
          <InputField
            label="Current Savings"
            value={currentSaving}
            onChange={setCurrentSaving}
            placeholder="e.g., 10000"
            description="Your existing savings amount"
            icon="💵"
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            className={`gradient-green hover:opacity-90 active:scale-95 px-10 py-4 rounded-xl font-bold text-white text-lg shadow-2xl transition-all duration-200 
              ${!savingPlanner.canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!savingPlanner.canSubmit}
            onClick={handleSubmit}
          >
            {savingPlanner.canSubmit
              ? "🔐 Calculate Encrypted Savings Plan"
              : savingPlanner.isSubmitting
                ? "⏳ Processing Transaction..."
                : "⚠️ Please Check Input Values"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="glass-card rounded-2xl p-8 hover-lift">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center text-xl">
            🔓
          </div>
          <h3 className="text-2xl font-bold text-white">Decrypted Results</h3>
        </div>

        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 mb-6 border border-blue-700/50">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">💰</div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
                Required Monthly Payment
              </p>
              <p className="text-4xl font-bold text-white mb-3">
                {savingPlanner.decryptedResults.requiredSaving !== undefined
                  ? `$${(Number(savingPlanner.decryptedResults.requiredSaving) / 1000).toFixed(3)}`
                  : "Awaiting Decryption"}
              </p>
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50">
                <p className="text-sm text-gray-300 leading-relaxed">
                  <span className="font-semibold text-white">How it works:</span> This is the monthly amount you need to save to reach your target, factoring in compound interest.
                </p>
                <p className="text-xs text-gray-400 mt-3 font-mono">
                  <span className="text-white">Formula:</span> payment = (target - current × (1 + i)^m) × i ÷ ((1 + i)^m - 1)
                  <br />
                  <span className="text-gray-500">where i = annual_rate ÷ 12, m = months</span>
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  <span className="text-yellow-400">⚠️ Special Case:</span> If interest rate is 0%, formula simplifies to: (target - current) ÷ months
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className={`gradient-orange hover:opacity-90 active:scale-95 px-10 py-4 rounded-xl font-bold text-white text-lg shadow-2xl transition-all duration-200
              ${!savingPlanner.canDecrypt ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!savingPlanner.canDecrypt}
            onClick={savingPlanner.decryptResults}
          >
            {savingPlanner.canDecrypt
              ? "🔓 Decrypt & Reveal Results"
              : savingPlanner.isDecrypting
                ? "⏳ Decrypting Data..."
                : "📭 No Data to Decrypt"}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {savingPlanner.message && (
        <div className="glass-card rounded-2xl p-6 border-l-4 border-blue-400">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💬</div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">System Message</p>
              <p className="text-white font-medium">{savingPlanner.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
interface StatusRowProps {
  label: string;
  value: string | boolean | null | undefined;
  status: "success" | "warning" | "info";
}

function StatusRow({ label, value, status }: StatusRowProps) {
  let displayValue: string;
  let displayClass = "";

  if (typeof value === "boolean") {
    displayValue = value ? "✓ Active" : "✗ Inactive";
    displayClass = value ? "text-green-400" : "text-orange-400";
  } else if (typeof value === "string") {
    displayValue = value;
    displayClass = "text-gray-200";
  } else if (value === null) {
    displayValue = "null";
    displayClass = "text-gray-500";
  } else if (value === undefined) {
    displayValue = "undefined";
    displayClass = "text-gray-500";
  } else {
    displayValue = String(value);
    displayClass = "text-gray-200";
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/20 border border-gray-700/30">
      <span className="text-gray-300 text-sm">{label}</span>
      <span className={`font-mono font-semibold text-sm ${displayClass}`}>
        {displayValue}
      </span>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  description: string;
  icon: string;
}

function InputField({ label, value, onChange, placeholder, description, icon }: InputFieldProps) {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xl">{icon}</span>
        <label className="text-white font-semibold">
          {label}
        </label>
      </div>
      <input
        type="number"
        className="input-field w-full px-4 py-3 rounded-lg text-lg font-medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <p className="text-sm text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );
}

