import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONFIG } from '../config';
import CampaignAbi from '../abis/Campaign.json';

export const useCampaign = (address, signer, account) => {
  const [data, setData] = useState({
    question: "",
    targetPrice: 0n,
    lockTime: 0n,
    yesPool: 0n,
    noPool: 0n,
    resolved: false,
    winningSide: 0,
    state: "OPEN",
    yesPct: 50,
    noPct: 50,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔄 Fetch campaign data
  const fetchCampaignData = useCallback(async () => {
    if (!address || !signer || address === "FILL_ME") return;

    try {
      const contract = new ethers.Contract(address, CampaignAbi, signer);

      const [
        question,
        targetPrice,
        lockTime,
        yesPool,
        noPool,
        resolved,
        winningSide,
        odds
      ] = await Promise.all([
        contract.question(),
        contract.targetPrice(),
        contract.lockTime(),
        contract.yesPool(),
        contract.noPool(),
        contract.resolved(),
        contract.winningSide(),
        contract.getImpliedOdds()
      ]);

      // 🧠 Calculate state manually
      const nowSeconds = Math.floor(Date.now() / 1000);
      let calculatedState = "OPEN";

      if (resolved) calculatedState = "RESOLVED";
      else if (nowSeconds >= Number(lockTime)) calculatedState = "LOCKED";

      setData({
        question,
        targetPrice,
        lockTime,
        yesPool,
        noPool,
        resolved,
        winningSide,
        state: calculatedState,
        yesPct: Number(odds[0]) / 100,
        noPct: Number(odds[1]) / 100,
      });

      setError(null);

    } catch (err) {
      console.error("Error fetching campaign data:", err);
      setError("Failed to fetch campaign data");
    }
  }, [address, signer]);

  // 💰 Join market
  const join = async (side, amount) => {
    if (!signer) return;

    setLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(address, CampaignAbi, signer);

      const tx = await contract.join(side, { value: amount });
      await tx.wait();

      await fetchCampaignData();
      return tx.hash;

    } catch (err) {
      console.error("Join error:", err);
      setError(err.reason || "Transaction failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🧾 Resolve market
  const resolve = async (side) => {
    if (!signer) return;

    setLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(address, CampaignAbi, signer);

      const tx = await contract.resolve(side);
      await tx.wait();

      await fetchCampaignData();

    } catch (err) {
      console.error("Resolve error:", err);
      setError(err.reason || "Resolve failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 💸 Claim rewards
  const claim = async (tokenId) => {
    if (!signer) return;

    try {
      const contract = new ethers.Contract(address, CampaignAbi, signer);

      const tx = await contract.claim(tokenId);
      await tx.wait();

      return tx.hash;

    } catch (err) {
      console.error("Claim error:", err);
      setError(err.reason || "Claim failed");
      throw err;
    }
  };

  // 🔁 Auto refresh
  useEffect(() => {
    fetchCampaignData();

    const interval = setInterval(fetchCampaignData, 10000);
    return () => clearInterval(interval);

  }, [fetchCampaignData]);

  return {
    data,
    loading,
    error,
    join,
    resolve,
    claim,
    fetchCampaignData
  };
};