# 🚀 Web3Coffee - Hướng Dẫn Cho Người Mới Bắt Đầu

## 📖 Contract là gì?

Web3Coffee là một **smart contract** (hợp đồng thông minh) trên blockchain giúp người hâm mộ (supporters) có thể **donate tiền** cho các creator (người sáng tạo nội dung) một cách minh bạch và tự động.

### 🎯 Mục đích chính:
- Supporter gửi ETH để ủng hộ creator yêu thích
- Platform thu 2% phí
- Creator nhận 98% số tiền
- Tất cả giao dịch minh bạch trên blockchain

---

## 👥 Các vai trò trong hệ thống

### 1. **Owner (Chủ sở hữu)**
- Người deploy contract
- Quản lý nền tảng
- Rút phí platform
- Có thể tạm dừng contract khi cần
- Cập nhật cài đặt

### 2. **Creator (Người sáng tạo)**
- Nhận donation từ supporters
- Có thể rút tiền về ví bất kỳ lúc nào
- Mỗi creator có một "tài khoản" riêng trong contract

### 3. **Supporter (Người ủng hộ)**
- Gửi ETH để donate cho creator
- Kèm theo message cảm ơn
- Có thể donate bằng ETH hoặc USD

---

## 🔄 Luồng Hoạt Động Chi Tiết

### 📝 **Bước 1: Deploy Contract**

```
Owner deploy contract
  ↓
Cài đặt:
  - Platform fee: 2%
  - Min donation: 0.00001 ETH
  - Chainlink price feed (lấy giá ETH/USD)
  ↓
Contract sẵn sàng nhận donation!
```

**Code:**
```solidity
constructor(
    address _priceFeed,      // Địa chỉ Chainlink để lấy giá ETH
    uint8 _platformFee,      // Phí platform (2%)
    uint256 _minDonation     // Số tiền tối thiểu
)
```

---

### 💰 **Bước 2A: Donation bằng ETH (Cách đơn giản)**

```
1. Supporter chọn creator muốn donate
   ↓
2. Nhập số ETH muốn gửi (ví dụ: 0.1 ETH)
   ↓
3. Viết message: "Cảm ơn anh đã làm video hay!"
   ↓
4. Gửi transaction
   ↓
5. Contract tự động tính toán:
   - Total: 0.1 ETH
   - Platform fee (2%): 0.002 ETH
   - Creator nhận: 0.098 ETH
   ↓
6. Cập nhật số dư:
   - creatorBalance[creator] += 0.098 ETH
   - platformBalance += 0.002 ETH
   ↓
7. Emit event Donation (ghi lại lịch sử)
```

**Code Flow:**
```solidity
function donateWithEth(address creator, string calldata message) 
    external payable 
{
    // 1. Kiểm tra đầu vào
    if (creator == address(0)) revert InvalidCreator();
    if (msg.value < minDonation) revert BelowMinimum();
    
    // 2. Tính giá trị USD (để hiển thị)
    uint256 usdAmount = getEthToUsd(msg.value);
    
    // 3. Tính phí
    uint256 fee = (msg.value * platformFee) / 100;  // 2%
    uint256 creatorAmount = msg.value - fee;         // 98%
    
    // 4. Cập nhật số dư
    creatorBalance[creator] += creatorAmount;
    platformBalance += fee;
    
    // 5. Ghi lại sự kiện
    emit Donation(creator, msg.sender, msg.value, usdAmount, message);
}
```

**Ví dụ cụ thể:**
```
Supporter gửi: 0.1 ETH
Giá ETH: $3,000
→ Giá trị USD: $300

Tính toán:
- Platform fee: 0.1 * 2% = 0.002 ETH
- Creator nhận: 0.1 - 0.002 = 0.098 ETH

Kết quả:
- creatorBalance[0x123...] = 0.098 ETH
- platformBalance = 0.002 ETH
```

---

### 💵 **Bước 2B: Donation bằng USD (Cách nâng cao)**

```
1. Supporter muốn donate chính xác $5
   ↓
2. Contract hỏi Chainlink: "ETH giá bao nhiêu?"
   → Chainlink trả lời: "$3,000/ETH"
   ↓
3. Contract tính: $5 ÷ $3,000 = 0.00166 ETH
   ↓
4. Supporter gửi 0.00166 ETH (hoặc hơn)
   ↓
5. Nếu gửi thừa → Contract TỰ ĐỘNG HOÀN LẠI
   ↓
6. Tính phí và cập nhật giống Bước 2A
```

**Code Flow:**
```solidity
function donateWithUsdAmount(
    address creator,
    uint256 usdAmount,  // $5.00 = 500000000 (8 decimals)
    string calldata message
) external payable {
    // 1. Validate
    if (creator == address(0)) revert InvalidCreator();
    if (usdAmount == 0) revert InvalidAmount();
    
    // 2. Hỏi Chainlink và tính ETH cần thiết
    uint256 requiredEth = getUsdToEth(usdAmount);
    if (msg.value < requiredEth) revert InsufficientETHSent();
    
    // 3. Tính phí
    uint256 fee = (msg.value * platformFee) / 100;
    uint256 creatorAmount = msg.value - fee;
    
    // 4. Cập nhật số dư
    creatorBalance[creator] += creatorAmount;
    platformBalance += fee;
    
    // 5. HOÀN LẠI ETH THỪA (Tính năng mới!)
    uint256 excess = msg.value - requiredEth;
    if (excess > 0) {
        (bool success, ) = msg.sender.call{value: excess}("");
        if (!success) revert WithdrawalFailed();
    }
    
    emit Donation(creator, msg.sender, msg.value - excess, usdAmount, message);
}
```

**Ví dụ:**
```
Supporter muốn donate: $5.00
ETH price: $3,000
Required ETH: $5 ÷ $3,000 = 0.00166 ETH

Supporter gửi: 0.002 ETH (gửi thừa 0.00034 ETH)
→ Contract hoàn lại: 0.00034 ETH
→ Chỉ charge: 0.00166 ETH

Tính phí:
- Platform: 0.00166 * 2% = 0.0000332 ETH
- Creator: 0.001627 ETH
```

---

### 🏧 **Bước 3: Creator Rút Tiền**

```
Creator kiểm tra số dư
  ↓
Có 0.5 ETH trong contract
  ↓
Gọi withdraw(0.5 ether)
  ↓
Contract kiểm tra:
  ✓ Số dư đủ không?
  ✓ Amount > 0?
  ↓
Trừ số dư TRƯỚCì (ngăn reentrancy attack)
  creatorBalance[creator] = 0.5 - 0.5 = 0
  ↓
Chuyển ETH cho creator
  ↓
Emit event Withdrawal
```

**Code Flow:**
```solidity
function withdraw(uint256 amount) external {
    // 1. Validate
    if (amount == 0) revert InvalidAmount();
    if (creatorBalance[msg.sender] < amount) revert InsufficientBalance();
    
    // 2. TRỪ SỐ DƯ TRƯỚC (CEI Pattern - Checks-Effects-Interactions)
    creatorBalance[msg.sender] -= amount;
    
    // 3. Chuyển tiền
    (bool success, ) = msg.sender.call{value: amount}("");
    if (!success) revert WithdrawalFailed();
    
    // 4. Ghi log
    emit Withdrawal(msg.sender, amount);
}
```

**Tại sao trừ số dư trước?**
> Để ngăn chặn **Reentrancy Attack** - một kiểu tấn công nổi tiếng trong smart contract (ví dụ: The DAO hack 2016).

**Rút toàn bộ (dễ hơn):**
```solidity
function withdrawAll() external {
    uint256 balance = creatorBalance[msg.sender];
    if (balance == 0) revert InsufficientBalance();
    
    creatorBalance[msg.sender] = 0;
    (bool success, ) = msg.sender.call{value: balance}("");
    if (!success) revert WithdrawalFailed();
    
    emit Withdrawal(msg.sender, balance);
}
```

---

### 💼 **Bước 4: Owner Rút Platform Fee**

```
Owner kiểm tra platformBalance
  ↓
Có 1 ETH phí tích lũy
  ↓
Gọi withdrawPlatformFee(1 ether)
  ↓
Contract kiểm tra:
  ✓ Msg.sender == owner?
  ✓ platformBalance >= amount?
  ↓
Trừ platformBalance
  ↓
Chuyển ETH cho owner
  ↓
Emit event PlatformFeeWithdrawn
```

**Code:**
```solidity
function withdrawPlatformFee(uint256 amount) external onlyOwner {
    if (amount == 0) revert InvalidAmount();
    if (platformBalance < amount) revert InsufficientBalance();
    
    platformBalance -= amount;
    (bool success, ) = owner.call{value: amount}("");
    if (!success) revert WithdrawalFailed();
    
    emit PlatformFeeWithdrawn(owner, amount);
}
```

---

## 🔍 Chainlink Price Feed - Lấy Giá ETH

### Tại sao cần Chainlink?

Blockchain **KHÔNG THỂ** tự lấy giá ETH từ sàn như Binance, Coinbase. Cần **Oracle** (Chainlink) để đưa dữ liệu thế giới thực vào blockchain.

### Cách hoạt động:

```
1. Contract hỏi: "ETH giá bao nhiêu?"
   ↓
2. Chainlink nodes (nhiều node độc lập) lấy giá từ:
   - Binance
   - Coinbase
   - Kraken
   - ...
   ↓
3. Tính giá trung bình
   ↓
4. Đa số nodes đồng ý → Cập nhật giá lên blockchain
   ↓
5. Contract đọc giá: $3,191.35 (với 8 decimals = 319135000000)
```

**Code với validation đầy đủ:**
```solidity
function getLatestPrice() public view returns (int256 price) {
    // 1. Lấy dữ liệu từ Chainlink
    (
        uint80 roundId,           // ID của round cập nhật
        int256 answer,            // Giá ETH
        ,                         // startedAt (không dùng)
        uint256 updatedAt,        // Thời gian cập nhật
        uint80 answeredInRound    // Round được trả lời
    ) = dataFeed.latestRoundData();
    
    // 2. VALIDATE - Rất quan trọng!
    
    // Check 1: Giá phải > 0
    if (answer <= 0) revert InvalidAmount();
    
    // Check 2: Có thời gian cập nhật
    if (updatedAt == 0) revert StalePrice();
    
    // Check 3: Round hoàn thành
    if (answeredInRound < roundId) revert InvalidRound();
    
    // Check 4: Giá không quá cũ (< 3 giờ)
    if (block.timestamp - updatedAt > 3 hours) {
        revert StalePrice();
    }
    
    return answer;
}
```

**Tại sao phải validate?**
- Nếu Chainlink bị lỗi → Giá sai → User bị thiệt
- Nếu giá cũ 10 giờ → ETH crash → User donate sai giá
- Security first! 🔒

---

## 📊 Ví Dụ Thực Tế Đầy Đủ

### Kịch bản: Alice donate cho Bob

**Setup:**
- Alice (supporter): `0x111...`
- Bob (creator): `0x222...`
- ETH price: $3,000
- Platform fee: 2%

**Bước 1: Alice muốn donate $10 cho Bob**

```javascript
// Alice gọi contract
donateWithUsdAmount(
    0x222...,              // Bob's address
    1000000000,            // $10.00 (8 decimals)
    "Love your videos!"    // Message
) {value: 0.0035 ether}    // Gửi hơi thừa để đảm bảo
```

**Contract xử lý:**
```
1. Hỏi Chainlink: ETH = $3,000
2. Tính required: $10 ÷ $3,000 = 0.00333 ETH
3. Alice gửi 0.0035 ETH → OK (đủ)

4. Tính phí:
   - Fee: 0.00333 * 2% = 0.0000666 ETH
   - Bob nhận: 0.00333 - 0.0000666 = 0.00326 ETH

5. Hoàn thừa:
   - Excess: 0.0035 - 0.00333 = 0.00017 ETH
   - Transfer lại cho Alice: 0.00017 ETH

6. Cập nhật:
   - creatorBalance[Bob] += 0.00326 ETH
   - platformBalance += 0.0000666 ETH

7. Event:
   Donation(Bob, Alice, 0.00333 ETH, $10.00, "Love your videos!")
```

**Bước 2: Bob kiểm tra số dư**

```javascript
// Bob gọi
getBalance(0x222...)

// Trả về:
{
    ethBalance: 0.00326 ETH,
    usdBalance: $9.78  // (0.00326 * $3,000)
}
```

**Bước 3: Bob rút tiền**

```javascript
// Bob gọi
withdrawAll()

// Contract:
1. Check: Bob có 0.00326 ETH ✓
2. Set: creatorBalance[Bob] = 0
3. Transfer: 0.00326 ETH → Bob's wallet
4. Event: Withdrawal(Bob, 0.00326 ETH)
```

**Kết quả cuối:**
- Alice đã donate $10 (thực tế charge 0.00333 ETH)
- Bob nhận về ví: 0.00326 ETH = $9.78
- Platform kiếm: 0.0000666 ETH = $0.22 (2%)
- Alice nhận lại excess: 0.00017 ETH

---

## 🛡️ Tính Năng Bảo Mật

### 1. **Reentrancy Protection**
```solidity
// ✓ ĐÚNG: Trừ số dư TRƯỚC khi transfer
creatorBalance[msg.sender] -= amount;
(bool success, ) = msg.sender.call{value: amount}("");

// ✗ SAI: Transfer trước
(bool success, ) = msg.sender.call{value: amount}("");
creatorBalance[msg.sender] -= amount;  // Có thể bị tấn công!
```

### 2. **Access Control**
```solidity
modifier onlyOwner() {
    if (msg.sender != owner) revert OnlyOwner();
    _;
}

// Chỉ owner mới gọi được
function setPlatformFee(uint8 newFee) external onlyOwner { ... }
```

### 3. **Pausable**
```solidity
// Owner có thể pause khi phát hiện lỗi
function setPaused(bool _paused) external onlyOwner {
    paused = _paused;
}

// Không nhận donation khi pause
function donateWithEth(...) external payable whenNotPaused { ... }
```

### 4. **Price Feed Validation**
- Kiểm tra giá > 0
- Kiểm tra độ tươi (< 3 giờ)
- Kiểm tra round hoàn thành

---

## 💡 Tips Cho Người Mới

### 1. **Gas Fee**
- Mỗi transaction tốn gas (phí network)
- Base Sepolia testnet: rẻ hoặc free
- Mainnet: có thể $1-$50 tùy lúc

### 2. **Decimals**
```solidity
1 ETH = 1,000,000,000,000,000,000 wei (18 decimals)
$1.00 = 100,000,000 (8 decimals trong contract)

Ví dụ:
0.001 ETH = 1000000000000000 wei
$5.50 = 550000000 (8 decimals)
```

### 3. **Transaction Flow**
```
User click "Donate"
  → Wallet (MetaMask) popup
  → User confirm + pay gas
  → Transaction pending...
  → Miners/Validators confirm
  → Transaction success!
  → Balance updated
```

### 4. **Events**
Events không lưu trong storage → KHÔNG TỐN GAS nhiều
Nhưng có thể query từ bên ngoài → Dùng làm lịch sử

---

## 🚀 Deploy và Test

### Test trên Base Sepolia:
```bash
# 1. Deploy contract
forge script script/DeployWeb3CoffeeOptimized.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# 2. Donate bằng cast
cast send CONTRACT_ADDRESS \
  "donateWithEth(address,string)" \
  CREATOR_ADDRESS \
  "Thank you!" \
  --value 0.01ether \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# 3. Check balance
cast call CONTRACT_ADDRESS \
  "creatorBalance(address)" \
  CREATOR_ADDRESS \
  --rpc-url $BASE_SEPOLIA_RPC_URL

# 4. Withdraw
cast send CONTRACT_ADDRESS \
  "withdrawAll()" \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $CREATOR_PRIVATE_KEY
```

---

## ❓ FAQ - Câu Hỏi Thường Gặp

**Q: Tiền có bị mất không?**
A: Không. Tiền được lưu trong smart contract, chỉ creator mới rút được. Code đã được audit và test kỹ.

**Q: Tại sao phải validate Chainlink?**
A: Nếu Chainlink bị lỗi hoặc giá cũ, user có thể bị thiệt. Validation đảm bảo giá luôn chính xác và mới.

**Q: Tại sao không dùng string errors?**
A: Custom errors tiết kiệm ~97% gas khi revert. Ví dụ: "Invalid creator" tốn ~1,000 gas, nhưng `InvalidCreator()` chỉ tốn ~50 gas.

**Q: Platform fee đi đâu?**
A: Lưu trong `platformBalance`, owner có thể rút bất kỳ lúc nào bằng `withdrawPlatformFee()`.

**Q: Có giới hạn số tiền donate không?**
A: Có `minDonation` (mặc định 0.00001 ETH), không có max. Nhưng nên thêm max limit trong production.

**Q: Nếu creator không rút tiền thì sao?**
A: Tiền vẫn an toàn trong contract, creator có thể rút sau 1 năm, 10 năm... bất kỳ lúc nào.

---

## 📚 Học Thêm

- **Solidity Docs**: https://docs.soliditylang.org
- **Chainlink**: https://docs.chain.link
- **Foundry Book**: https://book.getfoundry.sh
- **Smart Contract Security**: https://consensys.github.io/smart-contract-best-practices/

---

🎉 **Chúc bạn học tập vui vẻ!** Nếu có câu hỏi, hãy đọc lại guide này hoặc tham khảo source code có comment chi tiết.
