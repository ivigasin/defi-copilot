"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProvider = createProvider;
const mock_provider_1 = require("./mock-provider");
const evm_provider_1 = require("./evm-provider");
function createProvider(type) {
    switch (type) {
        case 'mock':
            return new mock_provider_1.MockPortfolioProvider();
        case 'evm': {
            const rpcUrl = process.env.EVM_RPC_URL;
            if (!rpcUrl) {
                throw new Error('EVM_RPC_URL environment variable is required for evm provider');
            }
            return new evm_provider_1.EvmProvider({ rpcUrl });
        }
        default:
            throw new Error(`Unknown provider type: ${type}`);
    }
}
//# sourceMappingURL=provider-factory.js.map