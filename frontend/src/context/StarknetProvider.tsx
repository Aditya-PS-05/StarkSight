"use client";

import { ReactNode } from "react";
import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  jsonRpcProvider,
  argent,
  braavos,
  voyager,
} from "@starknet-react/core";
import { STARKNET_CONFIG } from "@/config/starknet";

function rpc() {
  return {
    nodeUrl: STARKNET_CONFIG.rpcUrl,
  };
}

export function StarknetProvider({ children }: { children: ReactNode }) {
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={jsonRpcProvider({ rpc })}
      connectors={[argent(), braavos()]}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
