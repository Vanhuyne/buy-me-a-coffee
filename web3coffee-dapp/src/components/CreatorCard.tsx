'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { CREATOR_INFO, truncateAddress } from '@/constants';

export function CreatorCard() {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(CREATOR_INFO.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
        <span className="text-3xl">{CREATOR_INFO.emoji}</span>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">{CREATOR_INFO.name}</h2>
      <p className="text-sm text-gray-600 mb-4">{CREATOR_INFO.bio}</p>

      <button
        onClick={copyAddress}
        className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs text-gray-600 transition"
      >
        <span className="font-mono">{truncateAddress(CREATOR_INFO.address)}</span>
        {copied ? (
          <Check size={16} className="text-green-600" />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>
  );
}