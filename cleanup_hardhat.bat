@echo off
REM 自动清理Hardhat冲突的脚本
REM 使用前请备份重要文件！

echo.
echo ================================
echo  Hardhat 冲突清理工具
echo ================================
echo.
echo 警告：此脚本将删除可能重复的目录
echo 请确保您已备份重要文件！
echo.

set /p confirm="确认继续? (y/n): "
if /i not "%confirm%"=="y" (
    echo 已取消操作
    exit /b 0
)

echo.
echo [1/4] 检查并备份...

REM 创建备份目录
if not exist "backup_cleanup" mkdir backup_cleanup

REM 备份顶层contracts目录
if exist "contracts" (
    echo [INFO] 备份 contracts/ 到 backup_cleanup\contracts_backup
    xcopy /S /I /Y contracts backup_cleanup\contracts_backup
    echo [INFO] 删除 contracts/
    rmdir /s /q contracts
    echo [OK] contracts/ 已删除 ✓
)

REM 备份顶层scripts目录（如果是Hardhat生成的）
if exist "scripts" (
    REM 检查是否是Hardhat生成的（看是否包含.gitkeep或示例文件）
    if exist "scripts\.gitkeep" (
        echo [INFO] 检测到Hardhat生成的scripts/
        echo [INFO] 备份 scripts/ 到 backup_cleanup\scripts_backup
        xcopy /S /I /Y scripts backup_cleanup\scripts_backup
        echo [INFO] 删除 scripts/
        rmdir /s /q scripts
        echo [OK] scripts/ 已删除 ✓
    ) else (
        echo [WARN] scripts/ 存在但不确定是否为Hardhat生成
        echo [WARN] 跳过删除，请手动检查: %cd%\scripts
    )
)

echo.
echo [2/4] 验证backend目录...

if exist "backend\contracts" (
    echo [OK] backend\contracts 存在 ✓
) else (
    echo [ERROR] backend\contracts 丢失！
    exit /b 1
)

if exist "backend\scripts" (
    echo [OK] backend\scripts 存在 ✓
) else (
    echo [ERROR] backend\scripts 丢失！
    exit /b 1
)

echo.
echo [3/4] 检查hardhat.config.js...

if exist "hardhat.config.js" (
    findstr "backend" hardhat.config.js >nul
    if %errorlevel% equ 0 (
        echo [OK] hardhat.config.js 已配置backend路径 ✓
    ) else (
        echo [WARN] hardhat.config.js 可能需要更新
    )
) else (
    echo [ERROR] hardhat.config.js 未找到！
)

echo.
echo [4/4] 最终检查...

if exist "contracts" (
    echo [WARN] 还存在顶层contracts/
) else (
    echo [OK] 顶层contracts/已清理 ✓
)

if exist "scripts" (
    echo [WARN] 还存在顶层scripts/
) else (
    echo [OK] 顶层scripts/已清理 ✓
)

echo.
echo ================================
echo  清理完成！
echo ================================
echo.
echo 已备份到: backup_cleanup\
echo 如需恢复，请手动复制相关文件
echo.
echo 下一步:
echo 1. npm install
echo 2. npx hardhat compile
echo 3. npx hardhat run backend\scripts\deploy.js --network sepolia
echo.

pause
