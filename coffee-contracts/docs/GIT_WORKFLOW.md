# 🔧 Git Workflow & File Organization

## 📁 Cấu trúc thư mục hiện tại

```
coffee-contracts/
├── src/                    # Smart contracts & tests
│   ├── contract/          
│   └── test/             
├── script/                # Deployment scripts
├── docs/                  # 📚 Documentation (có thể ignore)
│   ├── BEGINNER_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── OPTIMIZATION_REPORT.md
├── broadcast/             # Deployment records (git tracked)
├── lib/                   # Dependencies (gitignore via gitmodules)
└── README.md             # Main documentation (MUST track)
```

## ✅ Files được track (nên commit)

### **Bắt buộc:**
- ✅ `README.md` - Documentation chính
- ✅ `src/**/*.sol` - Smart contracts
- ✅ `script/**/*.sol` - Deploy scripts
- ✅ `test/**/*.sol` - Test files
- ✅ `foundry.toml` - Config
- ✅ `package.json` - Dependencies
- ✅ `.gitignore` - Git config

### **Tùy chọn:**
- ⚠️ `broadcast/` - Deployment history (có thể ignore trên production)
- ⚠️ `docs/` - Documentation files (nếu quá nhiều)

## ❌ Files KHÔNG nên track

- ❌ `.env` - Private keys, secrets
- ❌ `cache/` - Build cache
- ❌ `out/` - Build artifacts
- ❌ `node_modules/` - Dependencies
- ❌ `lib/` - Forge dependencies (dùng .gitmodules)

## 🎯 Các tình huống xử lý

### **Tình huống 1: Quá nhiều file .md**

**Hiện tại:** 3 file .md ở root → OK  
**Nếu > 5 files:** Nên chuyển vào `docs/`

#### Option A: Ignore toàn bộ docs/ (Khuyến nghị cho development)
```bash
# .gitignore
docs/
*.md
!README.md  # Except README
```

#### Option B: Track docs/ nhưng selective (Khuyến nghị cho production)
```bash
# .gitignore - Comment out docs ignore
# docs/

# Only track important docs
docs/DEPLOYMENT.md
!docs/BEGINNER_GUIDE.md  # Important for users
```

### **Tình huống 2: File .md đã commit, muốn remove**

```bash
# Remove from git but keep local
git rm --cached docs/*.md
git commit -m "Remove documentation files from git"

# Update .gitignore
echo "docs/*.md" >> .gitignore
git add .gitignore
git commit -m "Update gitignore to exclude docs"
```

### **Tình huống 3: Broadcast files quá nhiều**

**Vấn đề:** Mỗi lần deploy tạo file mới trong `broadcast/`

**Giải pháp 1: Ignore run history (chỉ giữ latest)**
```bash
# .gitignore
broadcast/**/run-*.json
!broadcast/**/run-latest.json
```

**Giải pháp 2: Ignore toàn bộ broadcast (dev environment)**
```bash
# .gitignore
broadcast/
```

**Giải pháp 3: Keep cho production (để verify deployments)**
```bash
# Không ignore, commit hết để track deployment history
```

### **Tình huống 4: Repository đã quá lớn**

```bash
# Check repo size
du -sh .git

# If > 100MB, consider:

# 1. Remove large files from history
git filter-branch --tree-filter 'rm -rf docs/*.md' HEAD

# 2. Or use BFG Repo-Cleaner (faster)
bfg --delete-files '*.md' --except-files 'README.md'

# 3. Force push (DANGEROUS - coordinate with team)
git push origin --force --all
```

## 📋 Recommended .gitignore

```gitignore
# Compiler files
cache/
out/

# Ignores development broadcast logs
!/broadcast
/broadcast/*/31337/
/broadcast/**/dry-run/

# Dotenv file
.env

# Documentation (Optional - uncomment to ignore)
# docs/
# *.md
# !README.md

# Node modules
node_modules/

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Build artifacts
artifacts/
typechain/
typechain-types/

# Coverage
coverage/
coverage.json

# Hardhat (if using)
hardhat.config.ts
```

## 🚀 Git Workflow Commands

### **Initial Setup**
```bash
# Clone project
git clone <repo-url>
cd coffee-contracts

# Install dependencies
forge install

# Setup .env
cp .env.example .env
# Edit .env with your keys
```

### **Development Workflow**
```bash
# 1. Create feature branch
git checkout -b feature/new-contract

# 2. Make changes
# ... edit files ...

# 3. Check status
git status

# 4. Add files selectively
git add src/contract/NewContract.sol
git add script/DeployNew.s.sol
git add README.md

# 5. Commit with clear message
git commit -m "feat: Add NewContract with XYZ feature"

# 6. Push to remote
git push origin feature/new-contract
```

### **Before Commit Checklist**
```bash
# ✅ Check what will be committed
git status

# ✅ Review changes
git diff

# ✅ Make sure .env is not included
git status | grep .env  # Should return nothing

# ✅ Build succeeds
forge build

# ✅ Tests pass
forge test

# ✅ No secrets in code
grep -r "PRIVATE_KEY" src/ script/
```

### **Clean Up Workflow**
```bash
# Remove all build artifacts
forge clean

# Remove untracked files (BE CAREFUL!)
git clean -fd

# Undo uncommitted changes
git restore .

# Undo last commit (keep changes)
git reset HEAD~1

# Remove file from git but keep local
git rm --cached <file>
```

## 📊 Best Practices

### **Documentation Files**

✅ **DO:**
- Keep README.md in root - always tracked
- Put detailed docs in `docs/` folder
- Add links from README to docs
- Use clear naming: `DEPLOYMENT.md`, `BEGINNER_GUIDE.md`

❌ **DON'T:**
- Put too many .md in root (max 2-3)
- Commit auto-generated docs
- Forget to update docs when code changes

### **Commit Messages**

```bash
# Good
git commit -m "feat: Add withdraw all function to optimize gas"
git commit -m "fix: Resolve reentrancy vulnerability in withdraw"
git commit -m "docs: Update deployment guide with new contract address"

# Bad
git commit -m "update"
git commit -m "fix bug"
git commit -m "wip"
```

### **Branch Strategy**

```
main (production)
  ├── develop (staging)
  │   ├── feature/new-contract
  │   ├── feature/optimize-gas
  │   └── fix/reentrancy-bug
  └── hotfix/critical-bug
```

## 🔒 Security Checklist

Before every commit:

- [ ] No `.env` file
- [ ] No private keys in code
- [ ] No API keys in code
- [ ] No sensitive data in comments
- [ ] `.gitignore` is up to date

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Gitignore.io](https://www.toptal.com/developers/gitignore)

---

**Current Status:**
- ✅ README.md tracked
- ✅ docs/ folder created
- ✅ .gitignore configured
- ✅ All contracts tracked
- ⚠️ Review docs/ before pushing (can ignore if too large)
