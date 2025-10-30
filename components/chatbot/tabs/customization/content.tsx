"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  ListPlus,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { UIConfigInput } from '@/types/customization';

interface ContentTabProps {
  config: UIConfigInput;
  updateConfig: (updates: Partial<UIConfigInput>) => void;
}

export function ContentTab({ config, updateConfig }: ContentTabProps) {
  const handleStarterQuestionChange = (index: number, value: string) => {
    const newQuestions = [...config.starterQuestions];
    newQuestions[index] = value;
    updateConfig({ starterQuestions: newQuestions });
  };

  const handleAddStarterQuestion = () => {
    updateConfig({ starterQuestions: [...config.starterQuestions, ''] });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Display Name */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="Display Name" 
          description="Controls the name displayed in the chat header"
          icon={MessageSquare}
        />
        <Input
          value={config.DisplayName}
          onChange={(e) => updateConfig({ DisplayName: e.target.value.slice(0, 100) })}
          maxLength={100}
          placeholder="Support Bot"
          className="bg-gray-800/50 border-gray-700/50 text-white"
        />
      </div>

      {/* Initial Messages */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="Initial Messages" 
          description="Shown automatically when the chat opens"
          icon={MessageSquare}
        />
        <div className="space-y-2">
          <Textarea
            value={config.InitialMessage}
            onChange={(e) => updateConfig({ InitialMessage: e.target.value.slice(0, 1000) })}
            placeholder="Hi! What can I help you with?\nAsk me about pricing\n..."
            maxLength={1000}
            className="bg-gray-800/50 border-gray-700/50 text-white min-h-[120px]"
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Enter each message in a new line</span>
            <div className="flex items-center gap-3">
              <span>{config.InitialMessage.length}/1000</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-700 text-white hover:bg-gray-700/50" 
                onClick={() => updateConfig({ InitialMessage: '' })}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Messages */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 space-y-4">
        <SectionHeader 
          title="Suggested Messages" 
          description="Quick replies shown as buttons"
          icon={ListPlus}
        />
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 border border-gray-800/60">
          <span className="text-sm text-gray-300">Keep showing the suggested messages after the user's first message</span>
          <input 
            type="checkbox" 
            className="w-5 h-5" 
            checked={config.keepShowingSuggested} 
            onChange={(e) => updateConfig({ keepShowingSuggested: e.target.checked })} 
          />
        </div>
        <div className="space-y-3">
          {config.starterQuestions.map((question, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                value={question}
                onChange={(e) => handleStarterQuestionChange(index, e.target.value)}
                placeholder={`Suggestion ${index + 1}`}
                className="bg-gray-800/50 border-gray-700/50 text-white"
              />
              {index >= 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newQuestions = config.starterQuestions.filter((_, i) => i !== index);
                    updateConfig({ starterQuestions: newQuestions });
                  }}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            onClick={handleAddStarterQuestion}
            variant="outline"
            className="w-full border-gray-700 text-white hover:bg-gray-700/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add suggested message
          </Button>
        </div>
      </div>

      {/* Message Placeholder */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="Message Placeholder" 
          description="Shown inside the input before the user types"
          icon={MessageSquare}
        />
        <Input
          value={config.messagePlaceholder}
          onChange={(e) => updateConfig({ messagePlaceholder: e.target.value.slice(0, 100) })}
          placeholder="Message..."
          maxLength={100}
          className="bg-gray-800/50 border-gray-700/50 text-white"
        />
      </div>

      {/* Feedback and Regenerate */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 space-y-4">
        <SectionHeader 
          title="User Actions" 
          description="Enable feedback and regenerate controls"
          icon={Sparkles}
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Collect user feedback on answers</span>
          <input 
            type="checkbox" 
            className="w-5 h-5" 
            checked={config.collectFeedback} 
            onChange={(e) => updateConfig({ collectFeedback: e.target.checked })} 
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Allow regenerate last response</span>
          <input 
            type="checkbox" 
            className="w-5 h-5" 
            checked={config.allowRegenerate} 
            onChange={(e) => updateConfig({ allowRegenerate: e.target.checked })} 
          />
        </div>
      </div>

      {/* Dismissible Notice */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="Dismissible Notice" 
          description="Temporary notice shown until user's first message (plain text)"
          icon={MessageSquare}
        />
        <div className="space-y-2">
          <Textarea
            value={config.dismissibleNoticeText}
            onChange={(e) => updateConfig({ dismissibleNoticeText: e.target.value.slice(0, 200) })}
            placeholder="Type a short notice (text only)."
            maxLength={200}
            className="bg-gray-800/50 border-gray-700/50 text-white min-h-[100px]"
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>This notice hides after the user's first message</span>
            <span>{config.dismissibleNoticeText.length}/200</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="Footer" 
          description="Persistent info at the bottom of the chat (plain text)"
          icon={MessageSquare}
        />
        <div className="space-y-2">
          <Textarea
            value={config.footerText}
            onChange={(e) => updateConfig({ footerText: e.target.value.slice(0, 200) })}
            placeholder="Add a disclaimer or link (text only)."
            maxLength={200}
            className="bg-gray-800/50 border-gray-700/50 text-white min-h-[80px]"
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Shown above the input</span>
            <span>{config.footerText.length}/200</span>
          </div>
        </div>
      </div>

      {/* Auto Show Initial Messages */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="Auto Show Initial Messages" 
          description="Automatically show initial messages after a delay"
          icon={MessageSquare}
        />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="w-5 h-5" 
              checked={config.autoShowInitial} 
              onChange={(e) => updateConfig({ autoShowInitial: e.target.checked })} 
            />
            <span className="text-sm text-gray-300">Enable</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={config.autoShowDelaySec}
              onChange={(e) => updateConfig({ autoShowDelaySec: Number(e.target.value) })}
              className="w-24 bg-gray-800/50 border-gray-700/50 text-white"
            />
            <span className="text-sm text-gray-400">seconds</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
