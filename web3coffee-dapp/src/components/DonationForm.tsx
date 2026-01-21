'use client';

import { Heart, AlertCircle, Loader } from 'lucide-react';
import { DONATION_PRESETS, MESSAGE_MAX_LENGTH, PLATFORM_FEE, formatFee, formatCreatorAmount } from '@/constants';
import { DonationState } from '@/types';

interface Props {
  state: DonationState;
  setState: (state: DonationState) => void;
  onDonate: () => void;
  isConnected: boolean;
  isLoading: boolean;
}

export function DonationForm({
  state,
  setState,
  onDonate,
  isConnected,
  isLoading
}: Props) {
  const fee = formatFee(state.amount, PLATFORM_FEE);
  const creatorAmount = formatCreatorAmount(state.amount, fee);
  const isDisabled = !isConnected || isLoading || !state.amount || state.txStep !== 'idle';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {state.error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {state.txStep === 'success' && (
        <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-700 mb-2">✅ Success!</p>
          <p className="text-xs text-green-600 font-mono break-all">{state.txHash}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Amount (USD)</label>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {DONATION_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setState({ ...state, selectedPreset: preset, amount: preset.toString() })}
              disabled={isDisabled}
              className={`py-3 px-2 rounded-lg font-semibold text-sm transition ${
                state.selectedPreset === preset
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-50'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>

        <div className="relative mb-2">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold">$</span>
          <input
            type="number"
            value={state.amount}
            onChange={(e) => setState({ ...state, amount: e.target.value, selectedPreset: null })}
            placeholder="0.00"
            disabled={!isConnected}
            className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none disabled:bg-gray-100"
          />
        </div>

        {state.amount && (
          <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-bold">${parseFloat(state.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fee (2%):</span>
              <span className="font-bold">-${fee}</span>
            </div>
            <div className="border-t border-gray-200 pt-1 flex justify-between">
              <span className="font-bold">Creator gets:</span>
              <span className="font-bold text-orange-600">${creatorAmount}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Message</label>
        <textarea
          value={state.message}
          onChange={(e) => setState({ ...state, message: e.target.value })}
          placeholder="Say something nice..."
          maxLength={MESSAGE_MAX_LENGTH}
          disabled={!isConnected || state.txStep !== 'idle'}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 resize-none disabled:bg-gray-100"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">{state.message.length}/{MESSAGE_MAX_LENGTH}</p>
      </div>

      <button
        onClick={onDonate}
        disabled={isDisabled}
        className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
          isDisabled ? 'bg-gray-300' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg'
        }`}
      >
        {isLoading && <Loader size={20} className="animate-spin" />}
        <Heart size={20} />
        {state.txStep === 'donating' && 'Processing...'}
        {state.txStep === 'success' && 'Success!'}
        {state.txStep === 'idle' && (isLoading ? 'Processing...' : `Donate $${state.amount || '0'}`)}
      </button>
    </div>
  );
}