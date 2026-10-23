/**
 * Project Gutenberg Book Training, STDP Memristor Plasticity & Associative Memory Recall
 * Ingests literature, extracts n-grams and vocabulary, updates physical binding forces,
 * and answers contextual queries by traversing the 8-neuron memristor crossbars.
 */

import React, { useState, useEffect } from 'react';
import { NeuromorphicPhysicsEngine } from '../physics/engine';
import { BookTrainingStats, MemoryRecallResult } from '../types/physics';
import {
  BookOpen,
  Upload,
  Cpu,
  Sparkles,
  Zap,
  Play,
  Search,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface GutenbergTrainerProps {
  engine: NeuromorphicPhysicsEngine;
  onTrainingComplete?: (stats: BookTrainingStats) => void;
  onInjectPredictedParticles?: (tokens: string[]) => void;
}

// Sample Project Gutenberg book excerpts for instant 1-click training
export const SAMPLE_GUTENBERG_BOOKS = [
  {
    id: 'alice',
    title: 'Alice in Wonderland (Lewis Carroll)',
    year: '1865',
    text: `Alice was beginning to get very tired of sitting by her sister on the bank. Suddenly a White Rabbit with pink eyes ran close by her, took a watch out of its waistcoat-pocket, and hurried down a large rabbit-hole under the hedge.
    Down, down, down went Alice into the deep subterranean hall.
    There were doors all round the long hall, but they were all locked; and when Alice had been all the way down one side and up the other, trying every door, she walked sadly down the middle, wondering how she was ever to get out again.
    Suddenly she came upon a little three-legged table, all made of solid glass; there was nothing on it except a tiny golden key, and Alice's first thought was that it might belong to one of the doors of the hall; but, alas! either the locks were too large, or the key was too small, but at any rate it would not open any of them.
    However, on the second time round, she came upon a low curtain she had not noticed before, and behind it was a little door about fifteen inches high: she tried the little golden key in the lock, and to her great delight it fitted!
    Alice opened the door and found that it led into a small passage, not much larger than a rat-hole: she knelt down and looked along the passage into the loveliest garden you ever saw.`,
  },
  {
    id: 'timemachine',
    title: 'The Time Machine (H.G. Wells)',
    year: '1895',
    text: `The Time Traveller was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated.
    "You must follow me carefully. There are four dimensions, three which we call the three planes of Space, and a fourth, Time. Scientific people know very well that Time is only a kind of Space. A mark of a man's motion through space is a line; his motion through time is also a line."
    The Time Machine was made of nickel, parts of ivory, and crystalline quartz. It had two levers: one to push forward into the future, and one to reverse back into the past. It stood ready for its journey into the fourth dimension.`,
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein (Mary Shelley)',
    year: '1818',
    text: `It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet.
    It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open; it breathed hard, and a convulsive motion agitated its limbs.
    The spark of galvanic electricity had awakened the nervous system. The mind breathed within the reconstructed biological matrix.`,
  },
  {
    id: 'principia',
    title: 'Newton\'s Principia (Laws of Motion & Particles)',
    year: '1687',
    text: `Law I: Every body continues in its state of rest, or of uniform motion in a right line, unless it is compelled to change that state by forces impressed upon it.
    Law II: The alteration of motion is ever proportional to the motive force impressed; and is made in the direction of the right line in which that force is impressed.
    Law III: To every Action there is always opposed an equal and opposite Reaction: or the mutual actions of two bodies upon each other are always equal, and directed to contrary parts.
    The particles of matter attract each other with a force proportional to the product of their masses and inversely proportional to the square of the distance between them.`,
  },
];

export const GutenbergTrainer: React.FC<GutenbergTrainerProps> = ({
  engine,
  onTrainingComplete,
  onInjectPredictedParticles,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('alice');
  const [customText, setCustomText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'crossbar'>('presets');
  const [learningRate, setLearningRate] = useState<number>(0.12);
  const [epochs, setEpochs] = useState<number>(2);
  const [isTraining, setIsTraining] = useState<boolean>(false);

  // Question & Memory Recall States
  const [memoryQuery, setMemoryQuery] = useState<string>('Where is the golden key?');
  const [recallResult, setRecallResult] = useState<MemoryRecallResult | null>(null);

  const stats = engine.trainingStats;

  // Execute STDP training on text
  const handleTrain = (text: string, title: string) => {
    setIsTraining(true);
    setTimeout(() => {
      const resultStats = engine.trainOnText(text, title, epochs, learningRate);
      setIsTraining(false);
      onTrainingComplete?.(resultStats);

      // Perform query after training
      const recall = engine.queryBookMemory(memoryQuery);
      setRecallResult(recall);
    }, 150);
  };

  // Auto-train Alice on initial component load if empty
  useEffect(() => {
    if (engine.storedPassages.length === 0 && engine.trainingStats.totalWordsParsed === 0) {
      const aliceBook = SAMPLE_GUTENBERG_BOOKS[0];
      engine.trainOnText(aliceBook.text, aliceBook.title, 2, 0.12);
      const recall = engine.queryBookMemory('Where is the golden key?');
      setRecallResult(recall);
    } else if (!recallResult) {
      const recall = engine.queryBookMemory(memoryQuery);
      setRecallResult(recall);
    }
  }, [engine, recallResult, memoryQuery]);

  // Execute query against associative memory
  const handleExecuteMemoryQuery = (q: string) => {
    setMemoryQuery(q);
    const result = engine.queryBookMemory(q);
    setRecallResult(result);
  };

  // Handle local .txt file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCustomText(content);
        handleTrain(content, file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-3.5 text-slate-300 text-xs shadow-xl space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <div>
            <div className="font-semibold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-2">
              <span>Project Gutenberg Pattern Extractor & STDP Trainer</span>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40">
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Ingests literature, extracts n-gram binding forces, and stores associative memory in N1-N8 memristor crossbars
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded border border-slate-800">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'presets' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gutenberg Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'upload' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload .TXT / Custom
          </button>
          <button
            onClick={() => setActiveTab('crossbar')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'crossbar' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Synaptic Crossbar Heatmap
          </button>
        </div>
      </div>

      {/* Tab 1: Project Gutenberg Classics */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SAMPLE_GUTENBERG_BOOKS.map((book) => {
              const isSelected = selectedBookId === book.id;
              return (
                <div
                  key={book.id}
                  onClick={() => setSelectedBookId(book.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-950/70 border-sky-500 text-sky-100 shadow-md shadow-sky-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-100 mb-1 flex items-center justify-between">
                      <span>{book.title}</span>
                      {engine.trainingStats.bookTitle.includes(book.title.split(' ')[0]) && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mb-2">Gutenberg · {book.year}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                      "{book.text.slice(0, 140)}..."
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBookId(book.id);
                      handleTrain(book.text, book.title);
                    }}
                    disabled={isTraining}
                    className="mt-3 w-full py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Train Neuromorphic Cores</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Custom Text / File Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* File Dropzone */}
            <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all">
              <Upload className="w-6 h-6 text-sky-400" />
              <div className="text-center">
                <span className="font-semibold text-slate-200">Upload Project Gutenberg .txt Book</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Click to browse or drop any plain text file</p>
              </div>
              <input type="file" accept=".txt,.text" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Hyperparameter Settings */}
            <div className="w-full sm:w-64 bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-200 uppercase">STDP Parameters</div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Learning Rate (η):</span>
                  <span className="font-mono text-sky-400">{learningRate.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.30"
                  step="0.02"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Training Epochs:</span>
                  <span className="font-mono text-sky-400">{epochs}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={epochs}
                  onChange={(e) => setEpochs(parseInt(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Paste Raw Text Box */}
          <div>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Or paste any book excerpt, poem, or scientific paper here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleTrain(customText || 'Quantum neuromorphic substrate', 'Pasted Document')}
                disabled={!customText.trim() || isTraining}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Extract Patterns & Train Memristors</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Synaptic Crossbar Matrix ($8 \times 8$ Heatmap) */}
      {activeTab === 'crossbar' && (
        <div className="space-y-3">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>
              MEMRISTOR CONDUCTANCE CROSSBAR MATRIX (<span className="text-sky-400">Pre-Synaptic N_i</span> ↓ vs{' '}
              <span className="text-emerald-400">Post-Synaptic N_j</span> →)
            </span>
            <span className="font-mono text-[10px] text-slate-500">Conductance scale: 0.0S (Dark) to 1.0S (Bright Cyan)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-[10px] border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-slate-500">Soma</th>
                  {engine.neurons.map((n) => (
                    <th key={n.id} className="p-1 text-emerald-400 font-bold" title={n.specialization}>
                      {n.label.split('-')[0]}
                    </th>
                  ))}
                  <th className="p-1 text-slate-400 text-left pl-3 font-sans">Neuron Specialization</th>
                </tr>
              </thead>
              <tbody>
                {engine.neurons.map((nI, i) => (
                  <tr key={nI.id} className="border-t border-slate-800/60 hover:bg-slate-900/40">
                    <td className="p-1 text-sky-400 font-bold">{nI.label.split('-')[0]}</td>
                    {engine.neurons.map((nJ, j) => {
                      if (i === j) {
                        return (
                          <td key={nJ.id} className="p-1 text-slate-600 bg-slate-950/60">
                            —
                          </td>
                        );
                      }
                      const weight = nI.weights[nJ.id] || 0.2;
                      const isHigh = weight > 0.45;
                      return (
                        <td
                          key={nJ.id}
                          className={`p-1.5 transition-colors ${
                            isHigh
                              ? 'bg-sky-500/25 text-sky-200 font-bold border border-sky-500/40'
                              : 'text-slate-400'
                          }`}
                          title={`${nI.label} → ${nJ.label}: ${weight.toFixed(3)}S`}
                        >
                          {weight.toFixed(2)}
                        </td>
                      );
                    })}
                    <td className="p-1 text-slate-300 text-left pl-3 font-sans text-[11px] truncate max-w-[220px]">
                      {nI.specialization}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CORE FEATURE: Neuromorphic Memory Question & Contextual Recall Card */}
      <div className="bg-slate-900/90 border border-amber-900/40 rounded-lg p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-100 uppercase tracking-wider text-xs">
              Neuromorphic Associative Query & Semantic Memory Recall
            </span>
          </div>
          <span className="font-mono text-[10px] text-amber-400">
            Hopfield Attractor & STDP Pathway Traversal
          </span>
        </div>

        {/* Query Input Box */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={memoryQuery}
              onChange={(e) => setMemoryQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecuteMemoryQuery(memoryQuery);
              }}
              placeholder="Ask a question about the book (e.g. 'Where is the golden key?')..."
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500 pr-8"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-2.5 top-2 pointer-events-none" />
          </div>
          <button
            onClick={() => handleExecuteMemoryQuery(memoryQuery)}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Query Memory</span>
          </button>
        </div>

        {/* Quick Example Questions */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Quick Queries:</span>
          <button
            onClick={() => handleExecuteMemoryQuery('Where is the golden key?')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 transition-colors cursor-pointer"
          >
            "Where is the golden key?"
          </button>
          <button
            onClick={() => handleExecuteMemoryQuery('What was on the glass table?')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
          >
            "What was on the glass table?"
          </button>
          <button
            onClick={() => handleExecuteMemoryQuery('What was the Time Machine made of?')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 transition-colors cursor-pointer"
          >
            "What was the Time Machine made of?"
          </button>
          <button
            onClick={() => handleExecuteMemoryQuery('What is Newton\'s Third Law of Action and Reaction?')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 transition-colors cursor-pointer"
          >
            "What is Newton's Third Law?"
          </button>
        </div>

        {/* Retrieved Associative Memory Result */}
        {recallResult && (
          <div className="bg-slate-950/90 border border-slate-800 rounded p-3 space-y-2.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1.5 border-b border-slate-800">
              <span className="text-amber-300 font-bold uppercase">
                Source Document: {recallResult.sourceBook}
              </span>
              <span className="text-emerald-400 font-bold">
                Resonance Affinity: {recallResult.resonanceScore > 0 ? `${recallResult.resonanceScore} pts` : 'General Context'}
              </span>
            </div>

            {/* The verbatim retrieved resonant passage */}
            <div>
              <div className="text-[10px] text-slate-500 font-sans mb-0.5">Retrieved Book Memory Passage:</div>
              <div className="text-slate-200 font-sans italic bg-slate-900/80 p-2.5 rounded border border-slate-800/80 leading-relaxed">
                "{recallResult.matchedSentence}"
              </div>
            </div>

            {/* Particle Tokens Extracted from the Answer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 font-sans">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Recalled Particles:</span>
                {recallResult.predictedTokens.map((tok, i) => (
                  <span
                    key={i}
                    className="bg-amber-950 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded font-mono font-bold text-[11px]"
                  >
                    {tok}
                  </span>
                ))}
              </div>

              {/* Action Button: Inject Recalled Tokens into Collider */}
              <button
                onClick={() => {
                  const toInject = recallResult.predictedTokens.slice(0, 3).join(' ') || 'KEY';
                  engine.injectBeam(toInject, 'center', 5.5, false);
                  onInjectPredictedParticles?.(recallResult.predictedTokens);
                }}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Launch Recalled Words as Particles</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Pattern Dashboard */}
      {stats.totalWordsParsed > 0 && (
        <div className="pt-2 border-t border-slate-800 space-y-2">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Active Book:</div>
              <div className="font-bold text-slate-100 truncate">{stats.bookTitle}</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Learned Lexicon:</div>
              <div className="font-bold text-amber-300">
                {stats.uniqueVocabularyCount} words <span className="text-slate-500 text-[10px]">({stats.totalWordsParsed} tokens)</span>
              </div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Extracted Bigrams:</div>
              <div className="font-bold text-sky-400">{stats.patternsExtracted} pairs</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Potentiated STDP Synapses:</div>
              <div className="font-bold text-emerald-400">
                {stats.stdpPotentiatedSynapses} <span className="text-slate-500 text-[10px]">/ 56 channels</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
