'use client';

import React, { useState } from 'react';
import { Heart, Copy, Check, Wallet, AlertCircle } from 'lucide-react';

// Declare ethereum global type
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Mock Web3 setup (in real app, use wagmi + ethers)
const CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f42b5e';
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

// Mock ABI for USDC and Web3Coffee contract
const USDC_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  }
];

export default function DonateComponent() {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [txStatus, setTxStatus] = useState<'approving' | 'donating' | 'success' | 'error' | null>(null);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const presets = [5, 10, 20, 50];
  const creatorAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f42b5e';
  const creatorName = 'John Dev';
  const creatorBio = 'Full-stack developer, sharing Web3 tips & tricks';
  const PLATFORM_FEE = 2; // 2%

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask not installed. Please install MetaMask.');
        return;
      }
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      setUserAddress(accounts[0]);
      setWalletConnected(true);
      setError('');
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setUserAddress('');
  };

  const handlePresetClick = (preset: number) => {
    setSelectedPreset(preset);
    setAmount(preset.toString());
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setSelectedPreset(null);
  };

  // Approve USDC
  const approveUSDC = async () => {
    try {
      setTxStatus('approving' as const);
      setError('');
      
      const amountInWei = (parseFloat(amount) * 1e6).toString(); // USDC has 6 decimals
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTxStatus(null);
      return true;
    } catch (err) {
      setError('Approval failed');
      setTxStatus('error' as const);
      console.error(err);
      return false;
    }
  };

  // Donate
  const handleDonate = async () => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (userAddress.toLowerCase() === creatorAddress.toLowerCase()) {
      setError('Cannot donate to yourself');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setTxStatus('approving' as const);

      // Step 1: Approve USDC
      const approved = await approveUSDC();
      if (!approved) {
        setIsLoading(false);
        return;
      }

      // Step 2: Call donate function
      setTxStatus('donating' as const);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success
      const mockTxHash = '0x' + Math.random().toString(16).slice(2);
      setTxHash(mockTxHash);
      setTxStatus('success' as const);

      // Reset form
      setTimeout(() => {
        setAmount('');
        setMessage('');
        setSelectedPreset(null);
        setTxStatus(null);
        setTxHash('');
      }, 3000);
    } catch (err) {
      setError('Transaction failed');
      setTxStatus('error' as const);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(creatorAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate fee
  const fee = amount ? (parseFloat(amount) * PLATFORM_FEE / 100).toFixed(2) : '0.00';
  const creatorAmount = amount ? (parseFloat(amount) - parseFloat(fee)).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-md mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">☕ Web3 Coffee</h1>
          <p className="text-sm text-gray-600">Support creators with USDC</p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-6">
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Wallet size={20} />
              Connect Wallet
            </button>
          ) : (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-semibold">Wallet Connected</p>
                <p className="text-sm font-mono text-gray-900">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</p>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Creator Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
          {/* Avatar */}
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
            <span className="text-3xl">👨‍💻</span>
          </div>

          {/* Creator Info */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{creatorName}</h2>
          <p className="text-sm text-gray-600 mb-4">{creatorBio}</p>

          {/* Creator Address */}
          <button
            onClick={copyAddress}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs text-gray-600 transition"
          >
            <span className="font-mono">{creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}</span>
            {copied ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Transaction Status */}
        {txStatus === 'success' && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-sm font-bold text-green-700 mb-2">✓ Donation Successful!</p>
            <p className="text-xs text-green-600 font-mono break-all">{txHash}</p>
          </div>
        )}

        {/* Donation Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Amount Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Choose amount (USDC)
            </label>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  disabled={!walletConnected || txStatus !== null}
                  className={`py-3 px-2 rounded-lg font-semibold text-sm transition ${
                    selectedPreset === preset
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={handleCustomAmount}
                placeholder="0.00"
                disabled={!walletConnected}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold disabled:bg-gray-100"
              />
            </div>

            {/* Fee Breakdown */}
            {amount && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between text-gray-700">
                  <span>Amount:</span>
                  <span className="font-bold">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Platform fee (2%):</span>
                  <span className="font-bold">-${fee}</span>
                </div>
                <div className="border-t border-gray-200 pt-1 flex justify-between text-gray-900">
                  <span className="font-bold">Creator receives:</span>
                  <span className="font-bold text-orange-600">${creatorAmount}</span>
                </div>
              </div>
            )}
          </div>

          {/* Message Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Add a message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something nice..."
              maxLength={200}
              disabled={!walletConnected || txStatus !== null}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none disabled:bg-gray-100"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/200</p>
          </div>

          {/* Donate Button */}
          <button
            onClick={handleDonate}
            disabled={!walletConnected || isLoading || !amount || txStatus !== null}
            className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
              !walletConnected || isLoading || !amount || txStatus !== null
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg active:scale-95'
            }`}
          >
            <Heart size={20} />
            {txStatus === 'approving' && 'Approving USDC...'}
            {txStatus === 'donating' && 'Processing Donation...'}
            {txStatus === 'success' && '✓ Success!'}
            {txStatus === 'error' && 'Try Again'}
            {!txStatus && (isLoading ? 'Processing...' : `Donate $${amount || '0'}`)}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            2% platform fee applied
          </p>
        </div>

        {/* Recent Donations */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent supporters</h3>
          
          <div className="space-y-3">
            {[
              { name: 'Alice', amount: 10, message: 'Love your content!' },
              { name: 'Bob', amount: 5, message: 'Thanks for the tips' },
              { name: 'Carol', amount: 20, message: 'Keep it up!' },
            ].map((donation, idx: number) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{donation.name}</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{donation.message}</p>
                </div>
                <p className="font-bold text-orange-500 flex-shrink-0">${donation.amount}</p>
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