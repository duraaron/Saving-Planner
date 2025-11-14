
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const SavingPlannerABI = {
  "abi": [
    {
      "inputs": [],
      "name": "ZamaProtocolUnsupported",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "confidentialProtocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getAchievability",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getCurrentSaving",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getRate",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getRequiredSaving",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getTarget",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getTime",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "recalculateSavingsPlan",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "annualRateScaled6",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "months",
          "type": "uint32"
        }
      ],
      "name": "recalculateSavingsPlanWithParams",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "encryptedTarget",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedRate",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedTime",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedCurrentSaving",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        },
        {
          "internalType": "uint32",
          "name": "annualRateScaled6",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "months",
          "type": "uint32"
        }
      ],
      "name": "submitSavingsPlan",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "userSavingsData",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "target",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "rate",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "time",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "currentSaving",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "requiredSaving",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "achievability",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
} as const;

