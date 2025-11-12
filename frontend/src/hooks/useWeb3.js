import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkIfConnected();
    // 监听账户变化
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      getBalance(accounts[0]);
    }
  };

  const checkIfConnected = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const account = accounts[0].address;
          setAccount(account);
          setIsConnected(true);
          setProvider(provider);
          const signer = await provider.getSigner();
          setSigner(signer);
          getBalance(account);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setError(error.message);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        alert('请安装 MetaMask 扩展');
        return null;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // 请求连接
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const account = accounts[0];
      setAccount(account);
      setIsConnected(true);
      setProvider(provider);
      
      const signer = await provider.getSigner();
      setSigner(signer);
      
      await getBalance(account);

      return account;
    } catch (error) {
      console.error('Connection error:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance('0');
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setError(null);
  };

  const getBalance = async (address = account) => {
    try {
      if (!provider || !address) return '0';
      
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);
      setBalance(balanceInEth);
      return balanceInEth;
    } catch (error) {
      console.error('Error getting balance:', error);
      setError(error.message);
      return '0';
    }
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
      });
    } catch (switchError) {
      // 如果网络未添加，添加它
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  return {
    account,
    balance,
    isConnected,
    provider,
    signer,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    getBalance,
    switchToSepolia,
    shortAddress: account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''
  };
};
