import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon: React.ElementType;
}

export function SectionHeader({ title, description, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold text-white">
            {title}
          </h2>
          {description && (
            <p className="font-sans text-base text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
