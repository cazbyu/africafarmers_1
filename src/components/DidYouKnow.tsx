import React from 'react';
import { Lightbulb } from 'lucide-react';

const didYouKnowFacts = [
  "Africa is home to 60% of the world's uncultivated arable land, holding immense potential for global food security.",
  "The Ethiopian coffee ceremony is a unique cultural ritual that can last for hours, celebrating one of Africa's most important crops.",
  "Cassava, a staple food in Africa, can be stored in the ground for up to 2 years, providing food security during lean times.",
  "African farmers grow over 1,000 different traditional crop varieties, contributing significantly to global agricultural biodiversity.",
  "The Sahel region's farmers have developed innovative drought-resistant farming techniques over generations.",
  "Ghana and Côte d'Ivoire together produce about 60% of the world's cocoa.",
  "Teff, an ancient grain from Ethiopia, is naturally gluten-free and rich in nutrients.",
  "African farmers often practice intercropping, growing multiple crops together to improve soil health and maximize yields."
];

interface DidYouKnowProps {
  factIndex: number;
}

export function DidYouKnow({ factIndex }: DidYouKnowProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-amber-700 mb-2">
        <Lightbulb className="w-5 h-5" />
        <span className="font-semibold">Did You Know?</span>
      </div>
      <p className="text-amber-800">{didYouKnowFacts[factIndex]}</p>
    </div>
  );
}

export { didYouKnowFacts };