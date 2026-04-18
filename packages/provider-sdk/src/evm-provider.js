"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvmProvider = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const tokens_1 = require("./config/tokens");
const balance_fetcher_1 = require("./providers/balance-fetcher");
const aave_v3_1 = require("./providers/aave-v3");
const lido_1 = require("./providers/lido");
class EvmProvider {
    client;
    tokenList;
    constructor(config) {
        this.client = (0, viem_1.createPublicClient)({
            chain: chains_1.mainnet,
            transport: (0, viem_1.http)(config.rpcUrl),
        });
        this.tokenList = config.tokenList ?? tokens_1.DEFAULT_TOKEN_LIST;
    }
    async getBalances(address) {
        return (0, balance_fetcher_1.fetchBalances)(this.client, address, this.tokenList);
    }
    async getPositions(address) {
        const results = await Promise.allSettled([
            (0, aave_v3_1.fetchAavePositions)(this.client, address),
            (0, lido_1.fetchLidoPositions)(this.client, address),
        ]);
        const positions = [];
        for (const result of results) {
            if (result.status === 'fulfilled') {
                positions.push(...result.value);
            }
            else {
                console.error('[evm-provider] Protocol fetch failed:', result.reason);
            }
        }
        return positions;
    }
}
exports.EvmProvider = EvmProvider;
//# sourceMappingURL=evm-provider.js.map