'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

function ReviewDashboardContent() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('img');
  const resumeUrl = searchParams.get('resume');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No image found for review</h2>
        <p className="text-gray-500 max-w-sm">
          The image parameter is missing from the URL. Please check your automation link.
        </p>
      </div>
    );
  }

  const handleDecision = async (approved: boolean) => {
    if (!resumeUrl) {
      setErrorMessage('Missing resume URL. Cannot submit decision.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch(resumeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit: ${response.statusText}`);
      }

      setStatus('success');
    } catch (error) {
      console.error('Error submitting decision:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-green-50 p-4 rounded-full mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Decision Submitted Successfully</h2>
        <p className="text-gray-500 mb-6">
          Your response has been sent back to the automation workflow.
        </p>
        <p className="text-sm font-medium text-gray-400">You can safely close this window now.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-indigo-500" />
          AI Scene Review
        </h1>
        <p className="text-gray-500 mt-1">
          Review the generated image below and decide whether to proceed with the video generation.
        </p>
      </div>

      {/* Image Display */}
      <div className="p-6 bg-gray-50/50">
        <div className="relative w-full overflow-hidden rounded-xl shadow-inner bg-gray-200 group flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="AI Generated Scene"
            className="w-full h-[500px] object-contain transition-transform duration-500 group-hover:scale-105"
            onLoad={() => console.log('Image loaded')}
            onError={() => {
              setErrorMessage('Failed to load the image. It might be an invalid URL.');
              setStatus('error');
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => handleDecision(true)}
          disabled={status === 'loading'}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-white transition-all duration-200 
            ${status === 'loading' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 active:transform active:scale-95 shadow-lg shadow-green-200'}`}
        >
          {status === 'loading' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          {status === 'loading' ? 'Processing...' : 'Approve & Generate Video'}
        </button>

        <button
          onClick={() => handleDecision(false)}
          disabled={status === 'loading'}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-white transition-all duration-200 
            ${status === 'loading' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 active:transform active:scale-95 shadow-lg shadow-red-200'}`}
        >
          {status === 'loading' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {status === 'loading' ? 'Processing...' : 'Decline & Reroll Image'}
        </button>
      </div>

      {/* Error Message */}
      {status === 'error' && (
        <div className="px-6 pb-6">
          <div className="p-4 bg-red-50 rounded-lg flex items-center gap-3 text-red-700 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          Loading dashboard...
        </div>
      }>
        <ReviewDashboardContent />
      </Suspense>
    </main>
  );
}
