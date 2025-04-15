import React, { useState } from 'react';
import { X, Send, Heart } from 'lucide-react';

interface EmailCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailCollectionModal({ isOpen, onClose }: EmailCollectionModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    console.log('Email submitted:', email);
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <Heart className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h3>
              <p className="text-gray-600">
                We'll keep you updated on how Africa Thryves is making a difference.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                Stay Connected with Africa Thryves
              </h3>
              <p className="text-gray-600 mb-6">
                While this was just a game, real African entrepreneurs are building 
                sustainable agricultural businesses every day. Learn how Africa Thryves 
                is supporting their success.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Stay Updated
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}