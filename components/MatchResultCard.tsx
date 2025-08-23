
import React from 'react';
import type { MatchResult } from '../types';

interface MatchResultCardProps {
  result: MatchResult;
}

const MatchResultCard: React.FC<MatchResultCardProps> = ({ result }) => {
  const scoreColor = result.compatibilityScore > 80 ? 'bg-green-500' : result.compatibilityScore > 60 ? 'bg-yellow-500' : 'bg-orange-500';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-stone-200/80 transition-transform hover:scale-105 hover:shadow-lg">
      <div className="p-5 flex items-start gap-4">
        <img className="h-16 w-16 rounded-full object-cover" src={result.avatarUrl} alt={result.userName} />
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-stone-800">{result.userName}</h3>
            <div className={`text-white text-sm font-bold px-3 py-1 rounded-full ${scoreColor}`}>
              {result.compatibilityScore}%
            </div>
          </div>
          <p className="text-stone-500 text-xs uppercase">Compatibility</p>
          <p className="mt-3 text-stone-600 italic">"{result.reason}"</p>
        </div>
      </div>
    </div>
  );
};

export default MatchResultCard;
