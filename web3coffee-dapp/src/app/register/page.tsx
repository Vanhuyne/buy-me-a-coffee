'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useCreators } from '@/hooks/useCreators';
import { WalletConnection } from '@/components/layout/WalletConnection';
import { AlertCircle } from 'lucide-react';

const EMOJI_OPTIONS = ['👨‍💻', '👩‍💻', '🎨', '🎵', '📝', '🎮', '📷', '🎬', '🏃‍♂️', '🍳'];

export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { saveCreator, isRegistered } = useCreators();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    emoji: '👨‍💻',
    twitter: '',
    github: '',
    website: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (isRegistered(address)) {
      setError('This wallet is already registered as a creator');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.bio.trim()) {
      setError('Please enter your bio');
      return;
    }

    setIsSubmitting(true);

    const profile = {
      address: address.toLowerCase(),
      name: formData.name.trim(),
      bio: formData.bio.trim(),
      emoji: formData.emoji,
      socialLinks: {
        twitter: formData.twitter.trim() || undefined,
        github: formData.github.trim() || undefined,
        website: formData.website.trim() || undefined
      },
      createdAt: Date.now()
    };

    const success = saveCreator(profile);

    if (success) {
      console.log('✅ Creator registered:', profile);
      router.push(`/creator/${address}`);
    } else {
      setError('Failed to save profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">☕ Become a Creator</h1>
          <p className="text-sm text-gray-600">Create your profile to receive donations</p>
        </div>

        <div className="mb-6">
          <WalletConnection />
        </div>

        {isConnected && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Emoji Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Choose Your Avatar
              </label>
              <div className="grid grid-cols-5 gap-3">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, emoji })}
                    className={`text-4xl p-4 rounded-lg transition ${
                      formData.emoji === emoji
                        ? 'bg-orange-100 ring-2 ring-orange-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                maxLength={50}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell people what you do..."
                maxLength={200}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</p>
            </div>

            {/* Social Links */}
            <div className="mb-6 space-y-4">
              <label className="block text-sm font-semibold text-gray-900">
                Social Links (Optional)
              </label>
              
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="Twitter username (without @)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
              />
              
              <input
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="GitHub username"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
              />
              
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="Website URL"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!isConnected || isSubmitting}
              className="w-full py-4 rounded-lg font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </form>
        )}

        {!isConnected && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              Please connect your wallet to register as a creator
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
