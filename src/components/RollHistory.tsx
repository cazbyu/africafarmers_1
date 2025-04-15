import React from 'react';
import { SeasonRoll } from '../types';
import { ArrowLeft, History } from 'lucide-react';

interface RollHistoryProps {
  rollHistory: SeasonRoll[];
  onBack: () => void;
}

export function RollHistory({ rollHistory, onBack }: RollHistoryProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-8 relative">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-green-600 hover:text-green-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Game
          </button>
          <div className="flex items-center gap-2 text-gray-600">
            <History className="w-5 h-5" />
            Roll History
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {rollHistory.map((roll, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">
                  Season {roll.season}
                </h3>
                <div className="text-gray-600">
                  Roll: {roll.roll.join(' + ')} = {roll.roll.reduce((a, b) => a + b, 0)}
                </div>
              </div>
              <p className="text-gray-600">{roll.outcome}</p>
            </div>
          ))}

          {rollHistory.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No rolls recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}