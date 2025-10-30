"use client";

import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  BrainCircuit,
  HelpCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SectionHeader } from './SectionHeader';
import type { UIConfigInput } from '@/types/customization';

interface AITabProps {
  config: UIConfigInput;
  updateConfig: (updates: Partial<UIConfigInput>) => void;
  systemPrompt: string;
}

export function AITab({ config, updateConfig, systemPrompt }: AITabProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Welcome Message */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="Welcome Message" 
          description="Initial bot message shown on open"
          icon={MessageSquare}
        />
        <Textarea
          value={config.InitialMessage}
          onChange={(e) => updateConfig({ InitialMessage: e.target.value })}
          placeholder="Hi! How can I help you today? 👋"
          className="bg-gray-800/50 border-gray-700/50 text-white min-h-[100px]"
        />
      </div>

      {/* Prompt Script */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
        <SectionHeader 
          title="System Prompt" 
          description="Define your assistant's personality and behavior"
          icon={BrainCircuit}
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-sans text-base text-gray-300">Prompt Script</label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-sans text-sm">This script defines how your AI assistant behaves and responds</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            value={systemPrompt}
            disabled
            placeholder="You are a helpful assistant..."
            className="bg-gray-800/50 border-gray-700/50 text-white min-h-[200px] opacity-50"
          />
          <p className="text-sm text-gray-400">System prompt is managed in the AI tab</p>
        </div>
      </div>
    </motion.div>
  );
}
