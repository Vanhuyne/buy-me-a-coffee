# ☕ Web3Coffee - Decentralized Creator Support Platform

A smart contract platform built on Base L2 that enables transparent and efficient donations to content creators using ETH with real-time USD conversion via Chainlink price feeds.

## 🚀 Quick Start

### Deployed Contracts

**Base Sepolia Testnet:**
- **Web3CoffeeOptimized:** `0x91d0427efdfAb2e970C59FF58F913394312Febc1`
- **View on BaseScan:** [Contract Link](https://sepolia.basescan.org/address/0x91d0427efdfab2e970c59ff58f913394312febc1)

## 📚 Documentation

- **[Deployment Guide](docs/DEPLOYMENT.md)** - Complete deployment instructions and contract usage
- **[Beginner's Guide](docs/BEGINNER_GUIDE.md)** - Detailed explanation for newcomers
- **[Optimization Report](docs/OPTIMIZATION_REPORT.md)** - Gas optimizations and improvements (if exists)

## ✨ Features

- ✅ **ETH Donations** - Direct donations with ETH
- ✅ **USD Donations** - Donate specific USD amounts with automatic ETH calculation
- ✅ **Chainlink Integration** - Real-time ETH/USD price feeds
- ✅ **Auto Refund** - Excess ETH automatically refunded
- ✅ **Platform Fee** - Configurable 2% platform fee (withdrawable by owner)
- ✅ **Pausable** - Emergency stop mechanism
- ✅ **Gas Optimized** - Custom errors, storage packing, unchecked math
- ✅ **Security First** - Reentrancy protection, CEI pattern, access control

## 🛠️ Tech Stack

- **Solidity ^0.8.20**
- **Foundry** - Development framework
- **Chainlink** - Price feeds
- **OpenZeppelin** - Security standards
- **Base L2** - Low-cost transactions

## 📖 Foundry Documentation

https://book.getfoundry.sh/

## 🔧 Usage

### Build

```shell
forge build
```

### Test

```shell
forge test
```

### Deploy to Base Sepolia

```shell
forge script script/script/DeployWeb3CoffeeOptimized.s.sol:DeployWeb3CoffeeOptimized \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Interact with Contract

```bash
# Donate 0.01 ETH
cast send CONTRACT_ADDRESS \
  "donateWithEth(address,string)" \
  CREATOR_ADDRESS \
  "Thank you!" \
  --value 0.01ether \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Check balance
cast call CONTRACT_ADDRESS \
  "getBalance(address)" \
  CREATOR_ADDRESS \
  --rpc-url $BASE_SEPOLIA_RPC_URL

# Withdraw (as creator)
cast send CONTRACT_ADDRESS \
  "withdrawAll()" \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $CREATOR_PRIVATE_KEY
```

### Format

```shell
forge fmt
```

### Gas Snapshots

```shell
forge snapshot
```

## 🏗️ Project Structure

```
coffee-contracts/
├── src/
│   ├── contract/
│   │   ├── Web3Coffee.sol              # Original contract
│   │   └── Web3CoffeeOptimized.sol     # Optimized version ⭐
│   └── test/
│       ├── Web3Coffee.t.sol
│       └── Web3CoffeeOptimizedTest.t.sol
├── script/
│   └── script/
│       ├── DeployWeb3Coffee.s.sol
│       └── DeployWeb3CoffeeOptimized.s.sol
├── docs/                               # Documentation folder
│   ├── BEGINNER_GUIDE.md              # For newcomers
│   └── DEPLOYMENT.md                  # Deployment guide
└── README.md                          # This file
```

## 💡 Key Improvements (Optimized Version)

| Feature | Old | Optimized |
|---------|-----|-----------|
| Platform Fee Withdrawal | ❌ Stuck forever | ✅ Withdrawable |
| Excess ETH Refund | ❌ Lost | ✅ Auto refund |
| Chainlink Validation | ❌ Basic | ✅ Complete |
| Custom Errors | ❌ Strings | ✅ Gas efficient |
| Storage Packing | ❌ 3 slots | ✅ 2 slots |
| Gas Cost | ~55K | ~52K (-5%) |

## 🔐 Security

- ✅ Reentrancy protection (CEI pattern)
- ✅ Access control (onlyOwner modifier)
- ✅ Chainlink staleness check (< 3 hours)
- ✅ Pausable for emergencies
- ✅ No locked funds

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read the documentation in `docs/` folder before contributing.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for creators | Powered by Base L2 & Chainlink**

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
