'use client';

import { RECENT_DONATIONS } from '@/constants';

export function RecentDonations() {
  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent supporters</h3>

      <div className="space-y-3">
        {RECENT_DONATIONS.map((donation, idx) => (
          <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">{donation.name}</p>
              <p className="text-xs text-gray-600 line-clamp-1">{donation.message}</p>
            </div>
            <p className="font-bold text-orange-500">${donation.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
