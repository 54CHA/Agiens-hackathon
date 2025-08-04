import React, { useState } from 'react';
import { X, Robot, ArrowRight, CheckCircle, XCircle } from '@phosphor-icons/react';

interface PromptApprovalData {
  analysisId: string;
  analysis: {
    themes: string[];
    communicationStyle: string;
    gaps: string[];
    recommendations: string[];
  };
  improvements: {
    name: string;
    description: string;
    systemPrompt: string;
    reason: string;
  };
  currentAgent: {
    name: string;
    description: string;
    systemPrompt: string;
  };
}

interface PromptApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (analysisId: string) => Promise<void>;
  onReject: () => void;
  data: PromptApprovalData | null;
  isLoading?: boolean;
}

export const PromptApprovalModal: React.FC<PromptApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  data,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'comparison'>('analysis');
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    if (!data) return;
    
    try {
      setIsApproving(true);
      await onApprove(data.analysisId);
      onClose();
    } catch (error) {
      console.error('Failed to approve improvement:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Robot size={20} className="text-white" weight="fill" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Agent Improvement Suggestion
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI has analyzed your conversations and suggests improvements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'analysis'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Analysis Results
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'comparison'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Before vs After
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* Improvement Reason */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Why These Changes?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {data.improvements.reason}
                  </p>
                </div>

                {/* Analysis Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Conversation Themes */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                      Detected Themes
                    </h4>
                    <div className="space-y-1">
                      {data.analysis.themes.map((theme, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mr-2 mb-1"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Communication Style */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                      Communication Style
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {data.analysis.communicationStyle}
                    </p>
                  </div>

                  {/* Identified Gaps */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {data.analysis.gaps.map((gap, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {data.analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comparison' && (
              <div className="space-y-6">
                {/* Name Comparison */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Agent Name
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {data.currentAgent.name}
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400" />
                    <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Proposed</p>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {data.improvements.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description Comparison */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Description
                  </h3>
                  <div className="flex items-start space-x-4">
                    <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {data.currentAgent.description}
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400 mt-4" />
                    <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Proposed</p>
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        {data.improvements.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Prompt Comparison */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    System Prompt
                  </h3>
                  <div className="flex items-start space-x-4">
                    <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current</p>
                      <p className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {data.currentAgent.systemPrompt}
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400 mt-4" />
                    <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Proposed</p>
                      <p className="text-sm text-blue-900 dark:text-blue-100 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {data.improvements.systemPrompt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            This will update your agent permanently. You can always revert changes later.
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2"
              disabled={isApproving}
            >
              <XCircle size={16} />
              <span>Reject</span>
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isApproving}
            >
              {isApproving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Apply Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};