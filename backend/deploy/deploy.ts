import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedSavingPlanner = await deploy("SavingPlanner", {
    from: deployer,
    log: true,
  });

  console.log(`SavingPlanner contract: `, deployedSavingPlanner.address);
};
export default func;
func.id = "deploy_savingPlanner"; // id required to prevent reexecution
func.tags = ["SavingPlanner"];

