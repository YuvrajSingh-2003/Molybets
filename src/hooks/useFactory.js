import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONFIG } from '../config';
import SidebetFactoryAbi from '../abis/SidebetFactory.json';

export const useFactory = (signer) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCampaigns = useCallback(async () => {
    if (!signer || CONFIG.SidebetFactory === "FILL_ME") return;

    setLoading(true);
    try {
      const contract = new ethers.Contract(CONFIG.SidebetFactory, SidebetFactoryAbi, signer);
      const addresses = await contract.getCampaigns();
      setCampaigns([...addresses].reverse()); // Newest first
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const createCampaign = async (question, targetPrice, durationSeconds) => {
    if (!signer || CONFIG.SidebetFactory === "FILL_ME") throw new Error("Wallet not connected or factory address missing");

    setLoading(true);
    try {
      const contract = new ethers.Contract(CONFIG.SidebetFactory, SidebetFactoryAbi, signer);
      const feeBP = 1000; // 10%
      const tx = await contract.createCampaign(question, targetPrice, durationSeconds, feeBP);
      await tx.wait();
      await getCampaigns();
      return tx.hash;
    } catch (err) {
      console.error("Error creating campaign:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCampaigns();
  }, [getCampaigns]);

  return { campaigns, loading, error, createCampaign, getCampaigns };
};
