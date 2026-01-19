"use client";

import React, { useState } from "react";
import { Heart, Copy, Check, Wallet, AlertCircle, Loader } from "lucide-react";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useReadContract,
} from "wagmi";
import { useConnect, useDisconnect } from "wagmi";
import { parseUnits } from "viem";
import toast from "react-hot-toast";
import { ConnectButton } from "./ConnectButton";

// Types
interface DonationState {
  amount: string;
  message: string;
  selectedPreset: number | null;
  copied: boolean;
  txHash: string;
  error: string;
  txStep: "idle" | "approving" | "donating" | "success";
}

// Contract Configuration
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const DONATION_CONTRACT = "0x742d35Cc6634C0532925a3b844Bc9e7595f42b5e";

// USDC ABI (minimal - approve function)
const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
] as const;

// Donation Contract ABI
const DONATION_ABI = [
  {
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "message", type: "string" },
      { name: "creator", type: "address" },
    ],
    name: "donate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;



export default function DonateComponent() {
  // ========== Wagmi Hooks ==========
  const { address, isConnected } = useAccount();

  // Get USDC Balance
  const { data: balanceData } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: !!address,
    },
  }) as { data: bigint | undefined };

  // Approve USDC Hook
  const {
    writeContract: approveUSDC,
    isPending: isApprovingUSDC,
    isError: isApproveError,
  } = useWriteContract();

  // Donate Hook
  const {
    writeContract: donate,
    isPending: isDonating,
    isError: isDonateError,
  } = useWriteContract();

  // ========== Local State ==========
  const [state, setState] = useState<DonationState>({
    amount: "",
    message: "",
    selectedPreset: null,
    copied: false,
    txHash: "",
    error: "",
    txStep: "idle",
  });

  // ========== Constants ==========
  const presets = [5, 10, 20, 50];
  const creatorAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f42b5e" as const;
  const creatorName = "John Dev";
  const creatorBio = "Full-stack developer, sharing Web3 tips & tricks";
  const PLATFORM_FEE = 2;

  // ========== Handlers ==========

  const handlePresetClick = (preset: number) => {
    setState((prev) => ({
      ...prev,
      selectedPreset: preset,
      amount: preset.toString(),
    }));
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      amount: e.target.value,
      selectedPreset: null,
    }));
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(creatorAddress);
    setState((prev) => ({ ...prev, copied: true }));
    toast.success("Address copied!");
    setTimeout(() => {
      setState((prev) => ({ ...prev, copied: false }));
    }, 2000);
  };

  // ========== Step 1: Approve USDC ==========
  const handleApproveUSDC = async (): Promise<boolean> => {
    try {
      if (!isConnected || !address) {
        const msg = "Wallet not connected";
        setState((prev) => ({ ...prev, error: msg }));
        toast.error(msg);
        return false;
      }

      setState((prev) => ({ ...prev, txStep: "approving", error: "" }));
      toast.loading("Waiting for approval...");

      const amountInWei = parseUnits(state.amount, 6); // USDC has 6 decimals

      return new Promise((resolve) => {
        approveUSDC(
          {
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: "approve",
            args: [DONATION_CONTRACT, amountInWei],
          },
          {
            onSuccess: (data) => {
              console.log("✅ Approval successful:", data);
              toast.success("USDC approved! Processing donation...");
              setState((prev) => ({ ...prev, txHash: data }));
              resolve(true);
            },
            onError: (error: any) => {
              const errorMsg = error?.message || "Approval failed";
              console.error("❌ Approval error:", errorMsg);
              setState((prev) => ({
                ...prev,
                error: errorMsg,
                txStep: "idle",
              }));
              toast.error(errorMsg);
              resolve(false);
            },
          },
        );
      });
    } catch (err: any) {
      const errorMsg = err?.message || "Approval error occurred";
      console.error("❌ Error:", errorMsg);
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        txStep: "idle",
      }));
      toast.error(errorMsg);
      return false;
    }
  };

  // ========== Step 2: Execute Donation ==========
  const handleDonate = async () => {
    // --- Validation ---
    if (!isConnected) {
      const msg = "Please connect your wallet first";
      setState((prev) => ({ ...prev, error: msg }));
      toast.error(msg);
      return;
    }

    if (!state.amount || parseFloat(state.amount) <= 0) {
      const msg = "Please enter a valid amount";
      setState((prev) => ({ ...prev, error: msg }));
      toast.error(msg);
      return;
    }

    if (address?.toLowerCase() === creatorAddress.toLowerCase()) {
      const msg = "Cannot donate to yourself";
      setState((prev) => ({ ...prev, error: msg }));
      toast.error(msg);
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: "" }));

      // First: Approve USDC
      const approved = await handleApproveUSDC();
      if (!approved) return;

      // Wait for approval to be processed
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Second: Execute Donation
      setState((prev) => ({ ...prev, txStep: "donating" }));
      toast.loading("Processing donation...");

      const amountInWei = parseUnits(state.amount, 6);

      donate(
        {
          address: DONATION_CONTRACT,
          abi: DONATION_ABI,
          functionName: "donate",
          args: [amountInWei, state.message, creatorAddress],
        },
        {
          onSuccess: (data) => {
            console.log("✅ Donation successful:", data);
            setState((prev) => ({
              ...prev,
              txStep: "success",
              txHash: data,
            }));
            toast.success("Donation sent! ❤️");

            // Reset form after 3 seconds
            setTimeout(() => {
              setState((prev) => ({
                ...prev,
                amount: "",
                message: "",
                selectedPreset: null,
                txStep: "idle",
                txHash: "",
              }));
            }, 3000);
          },
          onError: (error: any) => {
            const errorMsg = error?.message || "Donation failed";
            console.error("❌ Donation error:", errorMsg);
            setState((prev) => ({
              ...prev,
              error: errorMsg,
              txStep: "idle",
            }));
            toast.error(errorMsg);
          },
        },
      );
    } catch (err: any) {
      const errorMsg = err?.message || "Error occurred";
      console.error("❌ Error:", errorMsg);
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        txStep: "idle",
      }));
      toast.error(errorMsg);
    }
  };

  // ========== Calculate Fees ==========
  const fee = state.amount
    ? ((parseFloat(state.amount) * PLATFORM_FEE) / 100).toFixed(2)
    : "0.00";
  const creatorAmount = state.amount
    ? (parseFloat(state.amount) - parseFloat(fee)).toFixed(2)
    : "0.00";

  const isLoading = isApprovingUSDC || isDonating;
  const isDisabled =
    !isConnected || isLoading || !state.amount || state.txStep !== "idle";

  // ========== Render ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-md mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ☕ Web3 Coffee
          </h1>
          <p className="text-sm text-gray-600">Support creators with USDC</p>
        </div>

        {/* Wallet Connection - Step 1 */}
        <div className="mb-6">
          <ConnectButton />
          {isConnected && balanceData && (
            <p className="text-xs text-green-600 mt-2">
              💰 Balance: {(balanceData / BigInt(1e6)).toString()} USDC
            </p>
          )}
        </div>

        {/* Creator Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
            <span className="text-3xl">👨‍💻</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {creatorName}
          </h2>
          <p className="text-sm text-gray-600 mb-4">{creatorBio}</p>

          <button
            onClick={copyAddress}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs text-gray-600 transition"
          >
            <span className="font-mono">
              {creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}
            </span>
            {state.copied ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        {/* Success Status */}
        {state.txStep === "success" && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-sm font-bold text-green-700 mb-2">
              ✅ Donation Successful!
            </p>
            <p className="text-xs text-green-600 font-mono break-all">
              {state.txHash}
            </p>
          </div>
        )}

        {/* Donation Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Amount Section - Step 2 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Choose amount (USDC)
            </label>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  disabled={isDisabled}
                  className={`py-3 px-2 rounded-lg font-semibold text-sm transition ${
                    state.selectedPreset === preset
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold">
                $
              </span>
              <input
                type="number"
                value={state.amount}
                onChange={handleCustomAmount}
                placeholder="0.00"
                disabled={!isConnected}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Fee Breakdown */}
            {state.amount && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between text-gray-700">
                  <span>Amount:</span>
                  <span className="font-bold">
                    ${parseFloat(state.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Platform fee (2%):</span>
                  <span className="font-bold">-${fee}</span>
                </div>
                <div className="border-t border-gray-200 pt-1 flex justify-between text-gray-900">
                  <span className="font-bold">Creator receives:</span>
                  <span className="font-bold text-orange-600">
                    ${creatorAmount}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Message Section - Step 3 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Add a message (optional)
            </label>
            <textarea
              value={state.message}
              onChange={(e) =>
                setState((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Say something nice..."
              maxLength={200}
              disabled={!isConnected || state.txStep !== "idle"}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              {state.message.length}/200
            </p>
          </div>

          {/* Donate Button - Step 4 */}
          <button
            onClick={handleDonate}
            disabled={isDisabled}
            className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
              isDisabled
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg active:scale-95"
            }`}
          >
            {isLoading && <Loader size={20} className="animate-spin" />}
            <Heart size={20} />
            {state.txStep === "approving" && "Approving USDC..."}
            {state.txStep === "donating" && "Processing Donation..."}
            {state.txStep === "success" && "✓ Success!"}
            {state.txStep === "idle" &&
              (isLoading ? "Processing..." : `Donate $${state.amount || "0"}`)}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            2% platform fee applied
          </p>
        </div>

        {/* Recent Donations */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Recent supporters
          </h3>

          <div className="space-y-3">
            {[
              { name: "Alice", amount: 10, message: "Love your content!" },
              { name: "Bob", amount: 5, message: "Thanks for the tips" },
              { name: "Carol", amount: 20, message: "Keep it up!" },
            ].map((donation, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">
                    {donation.name}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {donation.message}
                  </p>
                </div>
                <p className="font-bold text-orange-500 flex-shrink-0">
                  ${donation.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Powered by Web3 Coffee on Blockchain
        </p>
      </div>
    </div>
  );
}
