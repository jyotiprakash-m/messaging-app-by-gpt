const hre = require("hardhat");

async function main() {
  const MessagingApp = await hre.ethers.getContractFactory("MessagingApp");
  const messagingApp = await MessagingApp.deploy();

  await messagingApp.deployed();

  console.log("MessagingApp deployed to:", messagingApp.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
