export function errorNotDeployed(chainId: number | undefined) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass-card rounded-3xl p-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-orange flex items-center justify-center text-5xl shadow-2xl animate-pulse-slow">
            ⚠️
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Contract Not Deployed
          </h2>
          <div className="inline-block px-4 py-2 rounded-lg bg-red-900/30 border border-red-700/50 mb-6">
            <p className="text-red-300 font-mono">
              SavingPlanner.sol not found on Chain ID: {chainId} {chainId === 11155111 ? "(Sepolia)" : ""}
            </p>
          </div>
        </div>

        <div className="space-y-6 text-left">
          <div className="glass-card-light rounded-xl p-6">
            <div className="flex items-start space-x-3 mb-4">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Issue Details</h3>
                <p className="text-gray-300 leading-relaxed">
                  The <span className="font-mono text-green-400">SavingPlanner.sol</span> contract
                  has not been deployed, or the deployment address is missing from the ABI directory{" "}
                  <span className="font-mono text-orange-400">frontend/abi</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card-light rounded-xl p-6">
            <div className="flex items-start space-x-3 mb-4">
              <span className="text-2xl">🔧</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3">Deployment Instructions</h3>
                <p className="text-gray-300 mb-4">
                  To deploy the contract on a local Hardhat node, run:
                </p>
                <div className="bg-black/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-500 text-sm italic mb-1"># from SavingPlanner/backend</p>
                  <p className="font-mono text-green-400 text-lg">
                    npx hardhat deploy --network hardhat
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card-light rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Alternative Solution</h3>
                <p className="text-gray-300 leading-relaxed">
                  You can also switch to the local <span className="font-mono text-blue-400">Hardhat Node</span> using
                  the MetaMask browser extension.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

