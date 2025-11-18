import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "SavingPlanner";

// <root>/backend
const rel = "../backend";

// <root>/frontend/abi
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/${dirname}${line}`
  );
  process.exit(1);
}

if (!fs.existsSync(outdir)) {
  console.error(`${line}Unable to locate ${outdir}.${line}`);
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

// Network name to chainId mapping
const networkChainIdMap = {
  hardhat: 31337,
  localhost: 31337,
  anvil: 31337,
  sepolia: 11155111,
  mainnet: 1,
  goerli: 5,
  // Add more networks as needed
};

// Network name to display name mapping
const networkDisplayNameMap = {
  hardhat: "hardhat",
  localhost: "hardhat",
  anvil: "anvil",
  sepolia: "sepolia",
  mainnet: "mainnet",
  goerli: "goerli",
};

/**
 * Automatically discover all deployments
 * Returns array of { network, chainId, chainName, deployment }
 */
function discoverDeployments() {
  const foundDeployments = [];

  // Check if deployments directory exists
  if (!fs.existsSync(deploymentsDir)) {
    console.log(`No deployments directory found at ${deploymentsDir}`);
    return foundDeployments;
  }

  // Read all subdirectories in deployments folder
  const entries = fs.readdirSync(deploymentsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const networkName = entry.name;
    const contractFilePath = path.join(
      deploymentsDir,
      networkName,
      `${CONTRACT_NAME}.json`
    );

    // Check if deployment file exists
    if (!fs.existsSync(contractFilePath)) {
      console.log(`Skipping ${networkName}: ${CONTRACT_NAME}.json not found`);
      continue;
    }

    // Get chainId from mapping, or skip if unknown network
    const chainId = networkChainIdMap[networkName];
    if (!chainId) {
      console.log(
        `Skipping ${networkName}: Unknown network (not in chainId mapping)`
      );
      continue;
    }

    // Get display name
    const chainName = networkDisplayNameMap[networkName] || networkName;

    try {
      // Read deployment file
      const jsonString = fs.readFileSync(contractFilePath, "utf-8");
      const deployment = JSON.parse(jsonString);

      if (!deployment.address) {
        console.log(`Skipping ${networkName}: No address found in deployment`);
        continue;
      }

      if (!deployment.abi || !Array.isArray(deployment.abi)) {
        console.log(`Skipping ${networkName}: Invalid ABI`);
        continue;
      }

      foundDeployments.push({
        network: networkName,
        chainId,
        chainName,
        deployment,
      });

      console.log(
        `Found deployment: ${networkName} (chainId: ${chainId}, address: ${deployment.address})`
      );
    } catch (error) {
      console.log(
        `Skipping ${networkName}: Error reading deployment file - ${error.message}`
      );
      continue;
    }
  }

  return foundDeployments;
}

// Automatically discover all deployments
const allFoundDeployments = discoverDeployments();

// Collect deployments for addresses file
const deployments = {};
const allDeployments = [];

for (const found of allFoundDeployments) {
  deployments[found.chainId.toString()] = {
    address: found.deployment.address,
    chainId: found.chainId,
    chainName: found.chainName,
  };
  allDeployments.push(found.deployment);
}

// Verify ABI consistency across all networks
let abiSource = null;
if (allDeployments.length > 0) {
  abiSource = allDeployments[0].abi;
  
  // Check if all deployments have the same ABI
  for (let i = 1; i < allDeployments.length; i++) {
    if (
      JSON.stringify(abiSource) !== JSON.stringify(allDeployments[i].abi)
    ) {
      console.warn(
        `Warning: ABI differs between deployments. Using ABI from first deployment.`
      );
      break;
    }
  }
}

if (!abiSource) {
  console.warn(
    `${line}No deployments found. Generated files will have empty addresses object.${line}`
  );
}

// Generate ABI file
const tsCode = abiSource
  ? `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: abiSource }, null, 2)} as const;
\n`
  : `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
  Warning: No deployments found. ABI may be empty or outdated.
*/
export const ${CONTRACT_NAME}ABI = { abi: [] } as const;
\n`;

// Build addresses object dynamically - only include deployed networks
const addressesEntries =
  Object.keys(deployments).length > 0
    ? Object.entries(deployments)
        .map(
          ([chainId, info]) =>
            `  "${chainId}": { address: "${info.address}", chainId: ${info.chainId}, chainName: "${info.chainName}" }`
        )
        .join(",\n")
    : "";

const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
  Automatically discovers all existing deployments.
*/
export const ${CONTRACT_NAME}Addresses = {
${addressesEntries || "  // No deployments found"}
};
`;

console.log(`\n${line}`);
console.log(`Found ${allFoundDeployments.length} deployment(s):`);
for (const found of allFoundDeployments) {
  console.log(`  - ${found.network} (chainId: ${found.chainId}): ${found.deployment.address}`);
}
if (allFoundDeployments.length === 0) {
  console.log(`  No deployments found. Skipped.`);
}
console.log(`${line}`);

console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);

fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);


