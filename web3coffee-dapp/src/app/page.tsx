'use client';

import Link from 'next/link';
import { useCreators } from '@/hooks/useCreators';
import { truncateAddress } from '@/lib/constants';
import { ExternalLink, Plus } from 'lucide-react';

export default function Home() {
  const { getCreatorsList, isLoading } = useCreators();
  const creators = getCreatorsList();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">☕ Support Creators</h1>
          <p className="text-gray-600">Discover and support amazing creators with crypto</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading creators...</p>
          </div>
        ) : creators.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">☕</div>
            <p className="text-xl font-bold text-gray-900 mb-2">No Creators Yet</p>
            <p className="text-gray-600 mb-6">
              Be the first creator to register and start receiving donations!
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
            >
              <Plus size={20} />
              Register Now
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Discover Creators ({creators.length})
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {creators.map((creator) => (
                <Link
                  key={creator.address}
                  href={`/creator/${creator.address}`}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">{creator.emoji}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition">
                        {creator.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {creator.bio}
                      </p>
                      <code className="text-xs text-gray-500 font-mono">
                        {truncateAddress(creator.address)}
                      </code>
                      
                      {creator.socialLinks && (
                        <div className="flex gap-3 mt-3">
                          {creator.socialLinks.twitter && (
                            <span className="text-xs text-blue-500">Twitter</span>
                          )}
                          {creator.socialLinks.github && (
                            <span className="text-xs text-gray-700">GitHub</span>
                          )}
                          {creator.socialLinks.website && (
                            <span className="text-xs text-orange-600">Website</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <ExternalLink 
                      size={20} 
                      className="text-gray-400 group-hover:text-orange-500 transition flex-shrink-0"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
