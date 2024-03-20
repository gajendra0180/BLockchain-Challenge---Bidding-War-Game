import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import("@nomiclabs/hardhat-ethers");
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "solidity-coverage";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    energi: {
      url: "https://nodeapi.test.energi.network/v1/jsonrpc" || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    devnet: {
      url: "https://rpc.vnet.tenderly.co/devnet/arb/58966753-78eb-4d17-8134-fc689efe4d40",
      chainId: 42161,
    },
  },
};

export default config;
