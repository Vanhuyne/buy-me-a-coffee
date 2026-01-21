'use client';

import { useAccount } from 'wagmi';
import { CREATOR_INFO } from '@/constants';
import { useDonation } from '@/hooks/useDonation';
import { WalletConnection } from './WalletConnection';
import { CreatorCard } from './CreatorCard';
import { DonationForm } from './DonationForm';
import { RecentDonations } from './RecentDonations';

export default function DonateComponent() {
  const { address, isConnected } = useAccount();
  const { state, setState, executeDonation, isDonating } = useDonation(CREATOR_INFO.address);

  const handleDonate = async () => {
    // Validation
    if (!isConnected) {
      setState({ ...state, error: 'Connect wallet first' });
      return;
    }

    if (!state.amount || parseFloat(state.amount) <= 0) {
      setState({ ...state, error: 'Enter valid amount' });
      return;
    }

    if (address?.toLowerCase() === CREATOR_INFO.address.toLowerCase()) {
      setState({ ...state, error: 'Cannot donate to yourself' });
      return;
    }

    try {
      setState({ ...state, error: '', txStep: 'donating' });

      // Execute donation (sends ETH to contract)
      await executeDonation(state.amount, state.message);

      // Reset form on success
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">☕ Web3 Coffee</h1>
          <p className="text-sm text-gray-600">Support creators you like</p>
        </div>

        <div className="mb-6">
          <WalletConnection />
        </div>

        <CreatorCard />

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