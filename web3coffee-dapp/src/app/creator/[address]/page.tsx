'use client';

import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useCreators } from '@/hooks/useCreators';
import { useDonation } from '@/hooks/useDonation';
import { WalletConnection } from '@/components/layout/WalletConnection';
import { DonationForm } from '@/components/features/donation/DonationForm';
import { RecentDonations } from '@/components/features/donation/RecentDonations';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { truncateAddress } from '@/lib/constants';
import Link from 'next/link';

export default function CreatorPage() {
  const params = useParams();
  const creatorAddress = params.address as string;
  const { address, isConnected } = useAccount();
  const { getCreator } = useCreators();
  const creator = getCreator(creatorAddress);
  const { state, setState, executeDonation, isDonating } = useDonation(creatorAddress);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/creator/${creatorAddress}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDonate = async () => {
    if (!isConnected) {
      setState({ ...state, error: 'Connect wallet first' });
      return;
    }

    if (!state.amount || parseFloat(state.amount) <= 0) {
      setState({ ...state, error: 'Enter valid amount' });
      return;
    }

    if (address?.toLowerCase() === creatorAddress.toLowerCase()) {
      setState({ ...state, error: 'Cannot donate to yourself' });
      return;
    }

    try {
      setState({ ...state, error: '', txStep: 'donating' });
      await executeDonation(state.amount, state.message);

      setTimeout(() => {
        setState({
          amount: '',
          message: '',
          selectedPreset: null,
          copied: false,
          txHash: '',
          error: '',
          txStep: 'idle'
        });
      }, 3000);
    } catch (err: any) {
      setState({ ...state, error: err?.message || 'Error', txStep: 'idle' });
    }
  };

  if (!creator) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 to-amber-50 p-4">
        <div className="max-w-md mx-auto py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-xl font-bold text-gray-900 mb-4">Creator Not Found</p>
            <p className="text-gray-600 mb-6">
              This creator hasn't registered yet or the address is invalid.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">☕ Web3 Coffee</h1>
          <p className="text-sm text-gray-600">Support {creator.name}</p>
        </div>

        <div className="mb-6">
          <WalletConnection />
        </div>

        {/* Creator Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
            <span className="text-4xl">{creator.emoji}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{creator.name}</h2>
          <p className="text-sm text-gray-600 mb-4">{creator.bio}</p>
          
          {/* Social Links */}
          {creator.socialLinks && (
            <div className="flex justify-center gap-3 mb-4">
              {creator.socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${creator.socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  Twitter <ExternalLink size={14} />
                </a>
              )}
              {creator.socialLinks.github && (
                <a
                  href={`https://github.com/${creator.socialLinks.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-gray-900 text-sm flex items-center gap-1"
                >
                  GitHub <ExternalLink size={14} />
                </a>
              )}
              {creator.socialLinks.website && (
                <a
                  href={creator.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 text-sm flex items-center gap-1"
                >
                  Website <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Creator Address</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm font-mono text-gray-700">{truncateAddress(creator.address)}</code>
              <button
                onClick={handleCopy}
                className="text-gray-500 hover:text-orange-600 transition"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        <DonationForm
          state={state}
          setState={setState}
          onDonate={handleDonate}
          isConnected={isConnected}
          isLoading={isDonating}
        />

        <RecentDonations />

        <p className="text-xs text-gray-500 text-center mt-6">
          Powered by Web3 Coffee
        </p>
      </div>
    </div>
  );
}
