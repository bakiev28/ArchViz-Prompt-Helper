/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Loader2, Copy, Check, Info, LayoutGrid, FileJson } from 'lucide-react';
import { analyzeArchitectureImage } from './services/gemini';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    setError(null);
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const base64Data = image.split(',')[1];
      const analysis = await analyzeArchitectureImage(base64Data, mimeType);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-zinc-200 bg-white/50 backdrop-blur-md flex items-center px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">Archivision AI</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">v1.0.0 // Beta</span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500">
              <Info className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Input Source</span>
            </div>
            
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className={cn(
                "relative group aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden",
                image ? "border-zinc-300 bg-white" : "border-zinc-200 bg-zinc-100/50 hover:border-zinc-400 hover:bg-zinc-100"
              )}
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer bg-white text-zinc-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-100 transition-colors">
                      Change Image
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-4 p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-900">Drop architectural image here</p>
                    <p className="text-xs text-zinc-500">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                </label>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!image || isAnalyzing}
              className={cn(
                "w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                !image || isAnalyzing 
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" 
                  : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Architecture...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Generate JSON Prompt
                </>
              )}
            </button>
          </section>

          <section className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              How it works
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Our AI analyzes the structural elements, material palette, lighting conditions, and environmental context of your image to create a high-fidelity structured prompt for your design workflow.
            </p>
            <ul className="space-y-2">
              {['Style Identification', 'Material Breakdown', 'Lighting & Mood', 'Composition Analysis'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="w-1 h-1 rounded-full bg-zinc-300" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right Column: Output */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500">
              <FileJson className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Structured Output</span>
            </div>
            {result && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            )}
          </div>

          <div className="relative min-h-[400px] lg:min-h-0 lg:h-[calc(100vh-200px)] glass-panel rounded-2xl overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {!result && !isAnalyzing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                    <FileJson className="w-8 h-8 text-zinc-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-400">Analysis results will appear here</p>
                    <p className="text-xs text-zinc-300">Upload an image to begin</p>
                  </div>
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-12 space-y-6"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-zinc-100 border-t-zinc-900 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-zinc-900 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-sm font-medium text-zinc-900">Deconstructing Scene...</p>
                    <div className="flex gap-1 justify-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1.5 h-1.5 rounded-full bg-zinc-300"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 overflow-auto p-6 json-container"
                >
                  <pre className="text-zinc-800 whitespace-pre-wrap break-words">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-400">
            © 2024 Archivision AI. Powered by Gemini 3 Flash.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Documentation</a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">API Access</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
