import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONFIG } from '../config';

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(true);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const network = await browserProvider.getNetwork();
      const userSigner = await browserProvider.getSigner();

      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setProvider(browserProvider);
      setSigner(userSigner);

      // Check network and switch if necessary
      if (Number(network.chainId) !== CONFIG.chainId) {
        await switchNetwork();
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${CONFIG.chainId.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${CONFIG.chainId.toString(16)}`,
                chainName: CONFIG.networkName,
                rpcUrls: [CONFIG.rpcUrl],
                nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
                blockExplorerUrls: ["https://testnet-rpc.monad.xyz/"], // Placeholder explorer link
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding network:", addError);
        }
      }
    }
  };

  const fetchBalance = useCallback(async () => {
    if (!account || !provider) return;

    try {
      const bal = await provider.getBalance(account);
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }, [account, provider]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });

      window.ethereum.on("chainChanged", (hexChainId) => {
        setChainId(Number(hexChainId));
      });
    }

    // Initial check
    const checkConnection = async () => {
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.listAccounts();
        if (accounts.length > 0) {
          await connectWallet();
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [connectWallet]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    account,
    balance,
    provider,
    signer,
    chainId,
    loading,
    connectWallet,
    fetchBalance,
    isCorrectNetwork: chainId === CONFIG.chainId
  };
};
