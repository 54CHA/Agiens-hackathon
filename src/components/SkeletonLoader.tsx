import React from 'react';

interface SkeletonLoaderProps {
  type: 'auth' | 'newChat' | 'existingChat';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type }) => {
  if (type === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-200">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (type === 'newChat') {
    return (
      <div className="flex h-screen bg-white dark:bg-black transition-colors duration-200">
        {/* Sidebar skeleton */}
        <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
          <div className="space-y-4">
            {/* New chat button skeleton */}
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            
            {/* User profile skeleton */}
            <div className="flex items-center space-x-3 p-3 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>

            {/* Conversations skeleton */}
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main chat area skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Header skeleton */}
          <div className="h-16 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Empty state for new chat */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mx-auto"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-64 animate-pulse mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse mx-auto"></div>
            </div>
          </div>

          {/* Input area skeleton */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'existingChat') {
    return (
      <div className="flex h-screen bg-white dark:bg-black transition-colors duration-200">
        {/* Sidebar skeleton */}
        <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
          <div className="space-y-4">
            {/* New chat button skeleton */}
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            
            {/* User profile skeleton */}
            <div className="flex items-center space-x-3 p-3 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>

            {/* Conversations skeleton */}
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main chat area skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Header skeleton */}
          <div className="h-16 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Chat messages skeleton */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                {/* User message skeleton */}
                <div className="flex justify-end">
                  <div className="max-w-xs bg-gray-200 dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
                
                {/* AI message skeleton */}
                <div className="flex justify-start">
                  <div className="max-w-2xl bg-gray-200 dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input area skeleton */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
