// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract KindToken is ERC20, Ownable, ERC20Permit {
    // 事件：代币铸造
    event TokensMinted(address indexed to, uint256 amount);
    
    // 事件：代币销毁
    event TokensBurned(address indexed from, uint256 amount);
    
    // 事件：代币转账
    event TokenTransferred(address indexed from, address indexed to, uint256 amount);

    constructor() 
        ERC20("Kind Share Token", "KSTT") 
        ERC20Permit("Kind Share Token")
        Ownable(msg.sender)
    {
        // 初始总供应量: 1000万个代币
        _mint(msg.sender, 10000000 * 10 ** 18);
        emit TokensMinted(msg.sender, 10000000 * 10 ** 18);
    }

    /**
     * @dev 铸造新代币 (仅管理员)
     * @param to 接收地址
     * @param amount 金额
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev 销毁代币
     * @param amount 金额
     */
    function burn(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev 其他账户销毁代币 (需要授权)
     * @param account 账户地址
     * @param amount 金额
     */
    function burnFrom(address account, uint256 amount) public {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "Insufficient allowance");
        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
        emit TokensBurned(account, amount);
    }

    /**
     * @dev 获取用户余额
     * @param account 账户地址
     * @return 余额
     */
    function getBalance(address account) public view returns (uint256) {
        return balanceOf(account);
    }

    /**
     * @dev 检查用户是否有足够的余额
     * @param account 账户地址
     * @param amount 检查的金额
     * @return 是否有足够余额
     */
    function hasEnoughBalance(address account, uint256 amount) public view returns (bool) {
        return balanceOf(account) >= amount;
    }

    /**
     * @dev 转账代币 (重写以支持事件)
     * @param to 接收地址
     * @param amount 金额
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(amount > 0, "Amount must be greater than 0");
        bool success = super.transfer(to, amount);
        if (success) {
            emit TokenTransferred(msg.sender, to, amount);
        }
        return success;
    }

    /**
     * @dev 授权转账 (重写以支持事件)
     * @param from 转账来源地址
     * @param to 接收地址
     * @param amount 金额
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        returns (bool) 
    {
        require(from != address(0), "Cannot transfer from zero address");
        require(to != address(0), "Cannot transfer to zero address");
        require(amount > 0, "Amount must be greater than 0");
        bool success = super.transferFrom(from, to, amount);
        if (success) {
            emit TokenTransferred(from, to, amount);
        }
        return success;
    }

    /**
     * @dev 批量转账 (用于分发)
     * @param recipients 接收者列表
     * @param amounts 金额列表
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) 
        public 
        returns (bool) 
    {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length <= 200, "Too many recipients");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Amount must be greater than 0");
            _transfer(msg.sender, recipients[i], amounts[i]);
            emit TokenTransferred(msg.sender, recipients[i], amounts[i]);
        }
        return true;
    }
}
