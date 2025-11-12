@echo off
REM Hardhat项目结构检查和清理脚本
REM Kindshare 4.0 - Web3 Setup Helper

echo.
echo ================================
echo  Kindshare Web3 项目检查脚本
echo ================================
echo.

REM 检查是否在项目根目录
if not exist "backend" (
    echo [ERROR] 未找到backend目录，请在项目根目录运行此脚本
    exit /b 1
)

echo [INFO] 检查项目结构...
echo.

REM 检查后端Web3文件
echo === 后端Web3文件检查 ===
if exist "backend\contracts\KindToken.sol" (
    echo [OK] backend\contracts\KindToken.sol ✓
) else (
    echo [WARN] backend\contracts\KindToken.sol 未找到
)

if exist "backend\scripts\deploy.js" (
    echo [OK] backend\scripts\deploy.js ✓
) else (
    echo [WARN] backend\scripts\deploy.js 未找到
)

if exist "backend\config\web3Config.js" (
    echo [OK] backend\config\web3Config.js ✓
) else (
    echo [WARN] backend\config\web3Config.js 未找到
)

echo.
echo === 根目录冲突检查 ===
if exist "contracts" (
    echo [WARN] ⚠️ 发现根目录 contracts/ 目录（重复！）
    echo       建议: 运行 rmdir /s /q contracts
) else (
    echo [OK] 没有根目录 contracts/ ✓
)

if exist "scripts" (
    echo [WARN] ⚠️ 发现根目录 scripts/ 目录（可能冲突）
    echo       检查: 是否只是示例脚本或Node package脚本
) else (
    echo [OK] 没有根目录 scripts/ ✓
)

if exist "test" (
    echo [INFO] 发现根目录 test/ 目录（可接受）
) else (
    echo [OK] 没有根目录 test/ ✓
)

echo.
echo === Hardhat配置检查 ===
if exist "hardhat.config.js" (
    echo [OK] hardhat.config.js 存在 ✓
    findstr "backend" hardhat.config.js >nul
    if %errorlevel% equ 0 (
        echo [OK] hardhat.config.js 已配置backend路径 ✓
    ) else (
        echo [WARN] hardhat.config.js 可能未配置backend路径
    )
) else (
    echo [ERROR] hardhat.config.js 未找到！
)

echo.
echo === package.json检查 ===
findstr "hardhat" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] package.json 包含hardhat依赖 ✓
) else (
    echo [WARN] package.json 可能缺少hardhat依赖
    echo       建议: npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
)

findstr "ethers" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] package.json 包含ethers依赖 ✓
) else (
    echo [WARN] package.json 可能缺少ethers依赖
)

echo.
echo === 环境变量检查 ===
if exist "backend\config\config.env" (
    echo [OK] backend\config\config.env 存在 ✓
    findstr "SEPOLIA_RPC_URL" backend\config\config.env >nul
    if %errorlevel% equ 0 (
        echo [OK] 已配置 SEPOLIA_RPC_URL ✓
    ) else (
        echo [WARN] 未配置 SEPOLIA_RPC_URL
    )
    findstr "PRIVATE_KEY" backend\config\config.env >nul
    if %errorlevel% equ 0 (
        echo [OK] 已配置 PRIVATE_KEY ✓
    ) else (
        echo [WARN] 未配置 PRIVATE_KEY
    )
    findstr "CONTRACT_ADDRESS" backend\config\config.env >nul
    if %errorlevel% equ 0 (
        echo [OK] 已配置 CONTRACT_ADDRESS ✓
    ) else (
        echo [INFO] CONTRACT_ADDRESS 未配置（部署后会自动添加）
    )
) else (
    echo [ERROR] backend\config\config.env 未找到
)

echo.
echo ================================
echo  检查完成！
echo ================================
echo.
echo 推荐后续步骤:
echo 1. 确保所有[OK]项目都已通过
echo 2. 如果有[WARN]警告，按提示修复
echo 3. 运行: npm install
echo 4. 运行: npx hardhat compile
echo 5. 运行: npx hardhat run backend\scripts\deploy.js --network sepolia
echo.
echo 更多帮助见: HARDHAT_SETUP_GUIDE.md
echo.

pause
