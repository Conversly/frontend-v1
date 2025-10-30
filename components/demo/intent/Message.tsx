'use client';
import { Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { MemoizedMarkdown } from '@/components/shared/memoized-markdown';
import { useState } from 'react';
import { submitFeedback } from '@/lib/api/response';
import { toast } from 'sonner';

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  id: string;
  timestamp?: string;
  citations?: string[];
  responseId?: string;
}

export function Message({ content, role, id, timestamp, citations, responseId }: MessageProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleFeedback = async (feedbackType: 'positive' | 'negative') => {
    if (!responseId || isSubmittingFeedback) return;

    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(responseId, feedbackType);
      setFeedback(feedbackType);
      toast.success("Thank you for your feedback!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
          ${role === 'assistant' ? 'bg-purple-500/10' : 'bg-gray-700'}
        `}>
          {role === 'assistant' ? (
            <Bot size={24} className="text-purple-400" />
          ) : (
            <User size={24} className="text-gray-300" />
          )}
        </div>

        {/* Message Content */}
        <div className={`
          max-w-[80%] rounded-lg p-5 font-sans text-[15px] leading-relaxed
          ${role === 'assistant' 
            ? 'bg-[#1a1a1a] text-gray-200' 
            : 'bg-purple-500/10 text-gray-200'}
        `}>
          <div className="prose prose-invert prose-p:text-gray-200 prose-p:font-sans prose-p:text-[15px] 
                        prose-code:text-gray-200 prose-pre:bg-[#2a2a2a] prose-pre:text-gray-200
                        max-w-none">
            <MemoizedMarkdown content={content} id={id} />
          </div>
          {timestamp && (
            <span className="text-sm text-gray-500 mt-2 block font-sans">
              {timestamp}
            </span>
          )}
        </div>
      </div>

      {/* Citations - Only for assistant messages */}
      {role === 'assistant' && citations && citations.length > 0 && (
        <div className="flex flex-wrap gap-2 ml-16">
          <div className="text-xs text-gray-400 w-full mb-1">Sources:</div>
          {citations.map((citation, idx) => {
            const docName = citation.split('/').pop() || citation;
            return (
              <a
                key={idx}
                href={citation.startsWith('http') ? citation : `https://tryintent.com/docs/${citation}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 bg-purple-600/20 text-purple-300
                           border border-purple-500/30 rounded-md hover:bg-purple-600/30 
                           transition-colors text-sm"
              >
                📄 {docName}
              </a>
            );
          })}
        </div>
      )}

      {/* Feedback buttons - Only for assistant messages with responseId */}
      {role === 'assistant' && responseId && (
        <div className="flex gap-2 items-center ml-16">
          <span className="text-xs text-gray-500">Was this helpful?</span>
          <button
            onClick={() => handleFeedback('positive')}
            disabled={feedback !== null || isSubmittingFeedback}
            className={`p-1.5 rounded transition-colors ${
              feedback === 'positive' 
                ? 'bg-green-500/20 text-green-400' 
                : 'hover:bg-gray-700 text-gray-400 hover:text-green-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Thumbs up"
          >
            <ThumbsUp size={16} />
          </button>
          <button
            onClick={() => handleFeedback('negative')}
            disabled={feedback !== null || isSubmittingFeedback}
            className={`p-1.5 rounded transition-colors ${
              feedback === 'negative' 
                ? 'bg-red-500/20 text-red-400' 
                : 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Thumbs down"
          >
            <ThumbsDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
