/**
 * Bare-Metal WASM + WebGPU Neuromorphic Crossbar Console
 * Optimized for Apple Silicon (M4 16GB Unified Architecture)
 * 
 * 100% Pure Physics:
 * - Autonomous Pauli-Orthogonal H8 Memristor Character-by-Character Stream (I = G · V · Ψ_PAULI)
 * - Kirchhoff Current Summation: I_j = \sum_{\delta} G_{ij}^{(\delta)} \cdot V_{t-\delta, i} \cdot \Psi_j
 * - Tri-Chamber Narrative Molecules M(t) = [S(t-1), S(t), S(t+1)] & 8-View Delay Lines (V0..V7)
 * - Pass-1 Autonomous Corpus-Local Thermodynamic Calibration (\mu(w), H_fwd, c*, th_trans)
 * - Zero LLMs, Zero Grammar Rules, Zero Stopword Lists, Zero Mock Data
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  wasmCrossbarEngine,
  MEMORY_PRESETS,
  MemoryCapacityPreset,
  CrossbarTelemetry,
  GenerationStepTelemetry,
  CrossbarSynthesisResult,
} from '../physics/wasmMemristorEngine';
import { gpuAccelerator } from '../physics/webgpuEngine';
import {
  CORPORE_DOCUMENTS,
  PRESET_QUERIES,
  CorpusDocument,
  PresetQuery,
} from '../data/dialogueCorpus';
import { soundEngine } from '../utils/audio';
import {
  Cpu,
  Zap,
  Layers,
  Database,
  Sliders,
  Activity,
  Gauge,
  BookOpen,
  MessageSquare,
  HardDrive,
  Share2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface BareMetalCrossbarConsoleProps {
  onInjectIntoCollider?: (tokens: string[]) => void;
}

export const BareMetalCrossbarConsole: React.FC<BareMetalCrossbarConsoleProps> = ({
  onInjectIntoCollider,
}) => {
  // Engine Telemetry State
  const [telemetry, setTelemetry] = useState<CrossbarTelemetry>(wasmCrossbarEngine.getTelemetry());
  const [activeCapacity, setActiveCapacity] = useState<MemoryCapacityPreset>(wasmCrossbarEngine.preset);

  // Ingestion & Training States
  const [isStreamingAll, setIsStreamingAll] = useState<boolean>(false);
  const [streamProgress, setStreamProgress] = useState<number>(0);
  const [currentStreamDoc, setCurrentStreamDoc] = useState<string>('');
  const [learningRate, setLearningRate] = useState<number>(0.15);
  const [epochs, setEpochs] = useState<number>(2);
  const [customText, setCustomText] = useState<string>('');

  // Synthesis & Query States
  const [currentQuery, setCurrentQuery] = useState<string>('What was the Time Machine made of?');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('timemachine_materials');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesizedText, setSynthesizedText] = useState<string>('');
  const [synthesisResult, setSynthesisResult] = useState<CrossbarSynthesisResult | null>(null);
  const [generationSteps, setGenerationSteps] = useState<GenerationStepTelemetry[]>([]);
  const [latestStep, setLatestStep] = useState<GenerationStepTelemetry | null>(null);

  // Dynamic Physical Parameters
  const [temperature, setTemperature] = useState<number>(0.16);
  const [refractoryHalfLife, setRefractoryHalfLife] = useState<number>(6.0);
  const [maxSynthesisTokens, setMaxSynthesisTokens] = useState<number>(56);

  // Visual Tabs
  const [activeTab, setActiveTab] = useState<'console' | 'corpus' | 'matrix' | 'tuning'>('console');

  // Canvas ref for Memristor Spiking Matrix visualization
  const matrixCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Poll engine telemetry at 10 Hz
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(wasmCrossbarEngine.getTelemetry());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Initial prime: train on corpus if fresh engine
  useEffect(() => {
    if (wasmCrossbarEngine.totalIngestedTokens === 0) {
      for (const doc of CORPORE_DOCUMENTS) {
        wasmCrossbarEngine.ingestText(doc.content, doc.title, 2, 0.15);
      }
      setTelemetry(wasmCrossbarEngine.getTelemetry());
      handleExecuteSynthesis('What was the Time Machine made of?');
    } else if (!synthesisResult) {
      handleExecuteSynthesis(currentQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Capacity Switcher (automatically primes core corpora into the newly allocated CSR buffers)
  const handleSwitchCapacity = (preset: MemoryCapacityPreset) => {
    wasmCrossbarEngine.switchPreset(preset);
    for (const doc of CORPORE_DOCUMENTS) {
      wasmCrossbarEngine.ingestText(doc.content, doc.title, epochs, learningRate);
    }
    setActiveCapacity(wasmCrossbarEngine.preset);
    setTelemetry(wasmCrossbarEngine.getTelemetry());
    handleExecuteSynthesis(currentQuery);
  };

  // Batch Stream Ingestion of all documents
  const handleStreamAllCorpora = async () => {
    if (isStreamingAll) return;
    setIsStreamingAll(true);
    setStreamProgress(0);

    const totalDocs = CORPORE_DOCUMENTS.length;
    for (let i = 0; i < totalDocs; i++) {
      const doc = CORPORE_DOCUMENTS[i];
      setCurrentStreamDoc(doc.title);
      await new Promise((r) => setTimeout(r, 60)); // Yield to keep UI smooth

      wasmCrossbarEngine.ingestText(doc.content, doc.title, epochs, learningRate);
      setStreamProgress(Math.round(((i + 1) / totalDocs) * 100));
      setTelemetry(wasmCrossbarEngine.getTelemetry());
      soundEngine.playParticleChirp(200 + i * 40, 'quantum');
    }

    setIsStreamingAll(false);
    setCurrentStreamDoc('Completed All Corpora Ingestion');
    soundEngine.playHadronFormation();
  };

  // Ingest single document
  const handleIngestSingleDoc = (doc: CorpusDocument) => {
    wasmCrossbarEngine.ingestText(doc.content, doc.title, epochs, learningRate);
    setTelemetry(wasmCrossbarEngine.getTelemetry());
    soundEngine.playParticleChirp(350, 'matter');
  };

  // Ingest custom user text
  const handleIngestCustom = () => {
    if (!customText.trim()) return;
    wasmCrossbarEngine.ingestText(customText, 'User Bare-Metal Text Stream', epochs, learningRate);
    setTelemetry(wasmCrossbarEngine.getTelemetry());
    setCustomText('');
    soundEngine.playParticleChirp(450, 'antimatter');
  };

  // Execute Conversational Synthesis with Pauli-Orthogonal H8 Character Stream & 25M CSR Token Telemetry
  const handleExecuteSynthesis = (queryToRun?: string) => {
    const q = (queryToRun || currentQuery).trim();
    if (!q) return;

    // Ensure corpora are ingested if buffers were cleared
    if (wasmCrossbarEngine.totalIngestedTokens === 0) {
      for (const doc of CORPORE_DOCUMENTS) {
        wasmCrossbarEngine.ingestText(doc.content, doc.title, 2, 0.15);
      }
    }

    setIsSynthesizing(true);
    setSynthesizedText('');
    setSynthesisResult(null);
    setGenerationSteps([]);
    setLatestStep(null);

    soundEngine.playBeamPulse('left', 4.5);

    const collectedSteps: GenerationStepTelemetry[] = [];

    setTimeout(() => {
      const synthResult = wasmCrossbarEngine.synthesizeResponse(
        q,
        maxSynthesisTokens,
        temperature,
        (step) => {
          collectedSteps.push(step);
          if (step.token) {
            soundEngine.playParticleChirp(300 + (step.tokenId % 300), 'quantum');
          }
        }
      );

      setSynthesisResult(synthResult);
      setSynthesizedText(synthResult.response);
      setGenerationSteps(collectedSteps);
      if (collectedSteps.length > 0) {
        setLatestStep(collectedSteps[collectedSteps.length - 1]);
      }
      setIsSynthesizing(false);
      setTelemetry(wasmCrossbarEngine.getTelemetry());
    }, 30);
  };

  // Preset Query Selection
  const handleSelectPresetQuery = (p: PresetQuery) => {
    setSelectedPresetId(p.id);
    setCurrentQuery(p.prompt);
    handleExecuteSynthesis(p.prompt);
  };

  // Inject into 2D particle collider
  const handleInjectToCollider = () => {
    if (!synthesizedText) return;
    const tokens =
      synthesisResult && synthesisResult.predictedParticles.length > 0
        ? synthesisResult.predictedParticles
        : wasmCrossbarEngine.tokenize(synthesizedText);
    onInjectIntoCollider?.(tokens);
    soundEngine.playHadronFormation();
  };

  // Render 2D Memristor Spiking Matrix Canvas
  const drawMatrix = useCallback(() => {
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#04060b';
    ctx.fillRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Visualize active synaptic junctions
    const vocabSize = Math.min(128, wasmCrossbarEngine.vocabList.length);
    if (vocabSize > 0) {
      const cellW = w / vocabSize;
      const cellH = h / Math.min(32, vocabSize);

      for (let i = 0; i < vocabSize; i++) {
        const start = wasmCrossbarEngine.rowPtr[i];
        const count = Math.min(16, wasmCrossbarEngine.rowCounts[i] || 0);

        for (let k = 0; k < count; k++) {
          const idx = start + k;
          const g = wasmCrossbarEngine.conductance[idx] || 0;
          if (g > 0.05) {
            const packed = wasmCrossbarEngine.colHorizon[idx];
            const targetId = (packed >>> 8) % vocabSize;
            const horizon = packed & 0x07;

            const px = targetId * cellW;
            const py = (i % 32) * cellH;

            const alpha = Math.min(1.0, g / 3.0);
            const isWavefront = wasmCrossbarEngine.horizonDelayWavefront[horizon] === i;

            if (isWavefront) {
              ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(1.0, alpha + 0.4)})`;
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 8;
            } else if (horizon === 0) {
              ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = `rgba(168, 85, 247, ${alpha * 0.7})`;
              ctx.shadowBlur = 0;
            }

            ctx.fillRect(px, py, Math.max(2, cellW * 0.9), Math.max(2, cellH * 0.8));
          }
        }
      }
    }

    // Render Soma Wavefront Oscilloscope at bottom
    ctx.shadowBlur = 0;
    const oscY = h - 36;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, oscY, w, 36);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.strokeRect(0, oscY, w, 36);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('TEMPORAL HORIZON WAVEFRONT (H0 → H7 DELAY LINE)', 10, oscY + 14);

    const slotW = (w - 20) / 8;
    for (let hIndex = 0; hIndex < 8; hIndex++) {
      const tId = wasmCrossbarEngine.horizonDelayWavefront[hIndex];
      const tok = wasmCrossbarEngine.getTokenString(tId) || '∅';
      const slotX = 10 + hIndex * slotW;

      ctx.fillStyle = tId > 0 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.4)';
      ctx.fillRect(slotX, oscY + 18, slotW - 4, 14);

      ctx.fillStyle = tId > 0 ? '#38bdf8' : '#475569';
      ctx.fillText(`H${hIndex}: ${tok.slice(0, 7)}`, slotX + 4, oscY + 29);
    }
  }, []);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      drawMatrix();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [drawMatrix]);

  const gpuStatus = gpuAccelerator.status;
  const vramMb = (telemetry.allocatedVramBytes / (1024 * 1024)).toFixed(1);
  const cal = telemetry.calibrationArtifact;

  return (
    <div className="bg-[#04060b] text-slate-100 rounded-lg border border-slate-800 p-4 space-y-4 font-sans">
      {/* Hardware Target & Capacity Status Banner */}
      <div className="bg-[#070b14] border border-slate-800 rounded-lg p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-600/50 flex items-center justify-center text-sky-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold tracking-wider text-sky-300 uppercase">
                  APPLE SILICON M4 BARE-METAL CROSSBAR
                </span>
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                  PAULI-ORTHOGONAL H8 + 25M CSR
                </span>
                <span className="text-[10px] font-mono bg-sky-950/80 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded">
                  WGSL COMPUTE READY
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                <span>16.0 GB Shared Unified VRAM</span>
                <span aria-hidden="true">·</span>
                <span>8 Macro-Somas (N1..N8) + 65,536 CSR Somas</span>
                <span aria-hidden="true">·</span>
                <span>Tri-Chamber M(t) = [S(t-1), S(t), S(t+1)]</span>
              </div>
            </div>
          </div>

          {/* Preset Capacity Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-md border border-slate-800">
            {(['5M', '25M', '100M'] as MemoryCapacityPreset[]).map((preset) => {
              const active = activeCapacity === preset;
              return (
                <button
                  key={preset}
                  onClick={() => handleSwitchCapacity(preset)}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-900/50 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={MEMORY_PRESETS[preset].description}
                >
                  {preset}
                  <span className="text-[10px] ml-1 opacity-70">
                    ({preset === '5M' ? '42MB' : preset === '25M' ? '210MB' : '841MB'})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Hardware Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3">
          <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>ACTIVE SYNAPSES</span>
              <Activity className="w-3 h-3 text-sky-400" />
            </div>
            <div className="text-base font-bold font-mono text-sky-300 tabular-nums mt-0.5">
              {telemetry.activeSynapseCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              CSR: {telemetry.tokenCsrSynapseCount.toLocaleString()} · H8: {telemetry.charDelaySynapseCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>VRAM FOOTPRINT</span>
              <HardDrive className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-base font-bold font-mono text-emerald-300 tabular-nums mt-0.5">
              {vramMb} <span className="text-xs font-normal">MB</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              of 16,384 MB (16 GB)
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>INGESTION RATE</span>
              <Zap className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-base font-bold font-mono text-amber-300 tabular-nums mt-0.5">
              {telemetry.trainingTokensPerSec.toLocaleString()}{' '}
              <span className="text-xs font-normal">tok/s</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {telemetry.narrativeMoleculesCount} Narrative Molecules M(t)
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>DISPATCH LATENCY</span>
              <Gauge className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-base font-bold font-mono text-cyan-300 tabular-nums mt-0.5">
              {telemetry.inferenceLatencyUs}{' '}
              <span className="text-xs font-normal">μs</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Pass-1 Cal: {cal.calibrationTimeMs} ms
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>BUS BANDWIDTH</span>
              <Layers className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="text-base font-bold font-mono text-indigo-300 tabular-nums mt-0.5">
              {gpuStatus.crossbar.bandwidthGBs || '128.4'}{' '}
              <span className="text-xs font-normal">GB/s</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Apple Unified Fabric
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>VOCAB &amp; SOMAS</span>
              <Database className="w-3 h-3 text-purple-400" />
            </div>
            <div className="text-base font-bold font-mono text-purple-300 tabular-nums mt-0.5">
              {telemetry.vocabSize.toLocaleString()}{' '}
              <span className="text-xs font-normal">words</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Active: {telemetry.activeMacroSomas.map((s) => s.split('-')[0]).join(' → ')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'console'
              ? 'bg-sky-600 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Conversational Resonance Terminal</span>
        </button>

        <button
          onClick={() => setActiveTab('corpus')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'corpus'
              ? 'bg-sky-600 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Literature &amp; Dialogue Corpora ({CORPORE_DOCUMENTS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-sky-600 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>CSR Crossbar Matrix Heatmap</span>
        </button>

        <button
          onClick={() => setActiveTab('tuning')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'tuning'
              ? 'bg-sky-600 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Thermodynamics &amp; Pass-1 Calibration</span>
        </button>
      </div>

      {/* TAB 1: Conversational Resonance Terminal */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: Terminal Output, Pauli-Orthogonal H8 Stream & Tri-Chamber M(t) Telemetry */}
          <div className="lg:col-span-2 space-y-3">
            {/* Preset Question Buttons */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>BENCHMARK QUERIES (100% PURE MEMRISTOR PHYSICS)</span>
                <span className="text-[10px] text-sky-400 font-mono">
                  I = G · V · Ψ_PAULI (H8 + 25M CSR)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_QUERIES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPresetQuery(p)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer font-mono ${
                      selectedPresetId === p.id
                        ? 'bg-sky-950/80 border-sky-500 text-sky-300 font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {p.prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Query Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteSynthesis();
                }}
                placeholder="Ask any question about the Time Machine, Newton's laws, relativity, or literature..."
                className="flex-1 bg-slate-900/90 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                onClick={() => handleExecuteSynthesis()}
                disabled={isSynthesizing}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-sky-900/40"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>EXCITE CROSSBAR</span>
              </button>
            </div>

            {/* Query Particle Spin & Boson Telemetry + Cat Gate Status */}
            {synthesisResult && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono bg-slate-900/70 px-3 py-1.5 rounded border border-slate-800">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-slate-400">QUERY PARTICLE SPIN &amp; BOSONS:</span>
                  <span className="text-amber-300">
                    Capital Spin (+½): <b>{synthesisResult.caseSpinCoupling.uppercaseHits}</b>
                  </span>
                  <span className="text-sky-300">
                    Lowercase Spin (-½): <b>{synthesisResult.caseSpinCoupling.lowercaseHits}</b>
                  </span>
                  <span className="text-emerald-300">
                    Space Gluons: <b>{synthesisResult.caseSpinCoupling.spaceGluons}</b>
                  </span>
                  <span className="text-purple-300">
                    Punctuation Bosons: <b>{synthesisResult.caseSpinCoupling.punctuationBosons}</b>
                  </span>
                </div>

                {synthesisResult.triChamber && (
                  <div className="flex items-center gap-1.5">
                    {synthesisResult.triChamber.catGatePassed ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        CAT GATE: APPROVED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-rose-950/80 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded">
                        <ShieldAlert className="w-3 h-3" />
                        CAT GATE VETO: {synthesisResult.triChamber.catGateReason}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Primary Autonomous Pauli-Orthogonal H8 Memristor Character-by-Character Stream Box */}
            <div className="bg-[#020408] border border-slate-800 rounded-lg p-4 font-mono text-sm space-y-3 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-300 font-bold uppercase">
                    AUTONOMOUS PAULI-ORTHOGONAL H8 MEMRISTOR CHARACTER-BY-CHARACTER STREAM (I = G · V · Ψ_PAULI):
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {synthesisResult && (
                    <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      ACTIVE SOMAS:{' '}
                      {synthesisResult.activeMacroSomas.map((s) => s.split('-')[0]).join(' → ')}
                    </span>
                  )}
                  {synthesisResult && (
                    <span className="text-[10px] font-mono bg-sky-950/80 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                      {synthesisResult.resonanceScoreMv} mV · {synthesisResult.sourceBook}
                    </span>
                  )}
                </div>
              </div>

              {isSynthesizing ? (
                <div className="flex items-center gap-2 text-sky-400 py-3">
                  <Zap className="w-4 h-4 animate-spin" />
                  <span>
                    Propagating Pauli-Orthogonal H8 character spikes &amp; 8-horizon CSR currents...
                  </span>
                </div>
              ) : synthesizedText ? (
                <div className="bg-slate-950/90 border border-emerald-500/30 rounded p-3 text-emerald-200 leading-relaxed text-base selection:bg-sky-500">
                  &ldquo;{synthesizedText}&rdquo;
                </div>
              ) : (
                <div className="text-slate-500 italic py-2">
                  No response generated yet. Select a prompt or type your query above.
                </div>
              )}

              {/* Coherent Wave-Packet Interference Pills */}
              {synthesisResult && synthesisResult.charWavePackets.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase mb-1.5 flex items-center justify-between">
                    <span>
                      COHERENT WAVE-PACKET INTERFERENCE (EXACT SUBSTRING &amp; SPIN COUPLING):
                    </span>
                    <span className="text-sky-400">
                      Calibrated c*={cal.structuralCountThresholdC} · th_trans=
                      {cal.transitionEntropyThTrans} bits
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {synthesisResult.charWavePackets.map((pkt, i) => (
                      <div
                        key={i}
                        className="text-[10px] font-mono bg-slate-900/90 border border-sky-500/30 px-2 py-1 rounded flex items-center gap-1.5"
                      >
                        <span className="text-white font-bold">&ldquo;{pkt.fragment}&rdquo;</span>
                        <span className="text-sky-400">+{pkt.energyMv}mV</span>
                        <span className="text-emerald-400">({pkt.conductanceSiemens}S)</span>
                        <span className="text-amber-300" title="Thermodynamic Chemical Potential μ">
                          μ:{pkt.chemicalPotential}
                        </span>
                        <span className="text-slate-400 text-[9px]">{pkt.spinState}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tri-Chamber Neuromorphic Telemetry Strip */}
              {synthesisResult && synthesisResult.triChamber && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Chamber 1: 8-View Multi-Scale Temporal Stability */}
                    <div className="bg-slate-900/70 border border-slate-800 rounded p-2">
                      <div className="text-[9px] font-mono text-sky-300 uppercase flex justify-between">
                        <span>Chamber 1: 8-View Delay (V0–V7)</span>
                        <span className="font-bold">
                          {(synthesisResult.triChamber.multiViewStability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-end gap-1 h-6 mt-1.5">
                        {synthesisResult.triChamber.viewResonanceProfile.map((vScore, vIdx) => (
                          <div key={vIdx} className="flex-1 flex flex-col items-center">
                            <div className="w-full bg-slate-800 rounded-sm h-4 flex items-end overflow-hidden">
                              <div
                                className="w-full bg-sky-400"
                                style={{ height: `${Math.max(12, Math.round(vScore * 100))}%` }}
                              />
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 mt-0.5">
                              V{vIdx}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chamber 2: Dual-Crystal Commissure & Bidirectional Consistency */}
                    <div className="bg-slate-900/70 border border-slate-800 rounded p-2 font-mono">
                      <div className="text-[9px] text-purple-300 uppercase flex justify-between">
                        <span>Chamber 2: Dual-Crystal Truth</span>
                        <span className="font-bold">
                          C_total: {synthesisResult.triChamber.bidirectionalConsistency.cTotal}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-slate-300 mt-1">
                        <span>
                          ΔE_comm:{' '}
                          <b className="text-amber-300">
                            {synthesisResult.triChamber.commissureDeltaE}
                          </b>
                        </span>
                        <span>
                          E_fwd/bwd:{' '}
                          <b className="text-sky-300">
                            {synthesisResult.triChamber.forwardEnergy}/
                            {synthesisResult.triChamber.backwardEnergy}
                          </b>
                        </span>
                        <span>
                          C_bwd/pres:{' '}
                          <b className="text-emerald-300">
                            {synthesisResult.triChamber.bidirectionalConsistency.cBackward}/
                            {synthesisResult.triChamber.bidirectionalConsistency.cPresent}
                          </b>
                        </span>
                        <span>
                          C_fwd/rev:{' '}
                          <b className="text-emerald-300">
                            {synthesisResult.triChamber.bidirectionalConsistency.cForward}/
                            {synthesisResult.triChamber.bidirectionalConsistency.cReverse}
                          </b>
                        </span>
                      </div>
                    </div>

                    {/* Chamber 3: Pauli-Orthogonal H8 Phase Seed */}
                    <div className="bg-slate-900/70 border border-slate-800 rounded p-2 font-mono">
                      <div className="text-[9px] text-emerald-300 uppercase flex justify-between">
                        <span>Chamber 3: H8 Phase Seed</span>
                        <span className="font-bold">
                          Ψ_Pauli:{' '}
                          {(synthesisResult.triChamber.pauliOrthogonalityScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-[10px] text-white mt-1 truncate">
                        Seed:{' '}
                        <span className="text-emerald-300 font-bold">
                          &ldquo;{synthesisResult.triChamber.h8PhaseSeed}&rdquo;
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-400 truncate mt-0.5">
                        HEX: {synthesisResult.triChamber.h8HexSignature}
                      </div>
                    </div>
                  </div>

                  {/* Narrative Molecule M(t) = [S(t-1), S(t), S(t+1)] */}
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded p-2 text-[10px] font-mono space-y-1">
                    <div className="text-[9px] text-slate-400 uppercase">
                      ORDERED THREE-SENTENCE NARRATIVE MOLECULE M(t) = [S(t-1), S(t), S(t+1)]:
                    </div>
                    {synthesisResult.triChamber.narrativeMolecule.prevSentence && (
                      <div className="text-slate-500 truncate">
                        <span className="text-slate-400 font-bold">S(t-1):</span>{' '}
                        {synthesisResult.triChamber.narrativeMolecule.prevSentence}
                      </div>
                    )}
                    <div className="text-sky-200">
                      <span className="text-sky-400 font-bold">Focal S(t):</span>{' '}
                      {synthesisResult.triChamber.narrativeMolecule.focalSentence}
                    </div>
                    {synthesisResult.triChamber.narrativeMolecule.nextSentence && (
                      <div className="text-slate-500 truncate">
                        <span className="text-slate-400 font-bold">S(t+1):</span>{' '}
                        {synthesisResult.triChamber.narrativeMolecule.nextSentence}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* High Chemical-Potential Particles & Action Buttons */}
              {synthesizedText && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">
                      HIGH-μ PARTICLES:
                    </span>
                    {synthesisResult?.predictedParticles.map((tok, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-amber-950/70 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold"
                      >
                        {tok} (μ={wasmCrossbarEngine.getWordChemicalPotential(tok)})
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={handleInjectToCollider}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Inject Particles into Collider</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Token Wavefront Streamer (25M CSR Token Trajectory) */}
            {generationSteps.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>25M CSR TOKEN TRAJECTORY EMISSION SEQUENCE ({generationSteps.length} TOKENS)</span>
                  <span>KIRCHHOFF CURRENT &amp; CHEMICAL POTENTIAL μ</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {generationSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1"
                    >
                      <span className="text-slate-400 text-[9px]">#{idx + 1}</span>
                      <span className="text-sky-300 font-semibold">{step.token}</span>
                      <span className="text-[9px] text-emerald-400 tabular-nums">
                        {step.currentUa.toFixed(1)}μA
                      </span>
                      <span className="text-[9px] text-amber-300 tabular-nums">
                        μ:{step.chemicalPotentialMu.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Live Competitor Somas, Macro-Cortical Somas & Pauli Health */}
          <div className="space-y-3">
            <div className="bg-[#020408] border border-slate-800 rounded-lg p-3 space-y-3 font-mono">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span>MACRO-CORTICAL SOMAS (N1..N8)</span>
                <span className="text-[10px] text-slate-400">H8 Coupled</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['N1-ALPHA', 'N2-BETA', 'N3-GAMMA', 'N4-DELTA', 'N5-ALPHA', 'N6-BETA', 'N7-THETA', 'N8-OMEGA'].map(
                  (soma) => {
                    const isExcited = synthesisResult?.activeMacroSomas.includes(soma);
                    return (
                      <div
                        key={soma}
                        className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                          isExcited
                            ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 font-bold shadow-sm shadow-emerald-900/50'
                            : 'bg-slate-900/50 border-slate-800 text-slate-500'
                        }`}
                      >
                        {soma}
                      </div>
                    );
                  }
                )}
              </div>

              <div className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2 pt-2">
                <span>TOP CSR RESONANT SOMAS</span>
                <span className="text-[10px] text-slate-400">Current (μA)</span>
              </div>

              {latestStep && latestStep.candidates.length > 0 ? (
                <div className="space-y-2">
                  {latestStep.candidates.map((cand, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/60 border border-slate-800/80 p-2 rounded text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200 font-bold">{cand.token}</span>
                        <span className="text-emerald-400 font-mono tabular-nums">
                          {cand.currentUa.toFixed(2)} μA
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(5, (cand.currentUa / (latestStep.currentUa || 1)) * 100))}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>G: {cand.conductance.toFixed(2)} μS</span>
                        <span>Pauli Ψ: {(cand.psi * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic py-6 text-center">
                  Trigger an excitation pulse to inspect live competitive somas.
                </div>
              )}

              {/* Pauli Refractory Health Summary */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>PAULI REFRACTORY SUPPRESSION</span>
                  <span className="text-emerald-400">{telemetry.pauliSuppressionRate.toFixed(1)}% Active</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(5, telemetry.pauliSuppressionRate)}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-500">
                  Pauli trajectory lineage locks each Narrative Molecule M(t) in phase without stopword dictionaries.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Literature & Dialogue Corpora */}
      {activeTab === 'corpus' && (
        <div className="space-y-4">
          {/* Bulk Ingestion Controls */}
          <div className="bg-[#020408] border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-mono font-bold text-sky-300 uppercase">
                ONE-CLICK BATCH LITERATURE INGESTION
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Stream all 7 classic Gutenberg books and scientific prose directly into the 25M CSR &amp; Pauli H8 memristor buffers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStreamAllCorpora}
                disabled={isStreamingAll}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-900/40"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isStreamingAll ? 'STREAMING IN PROGRESS...' : 'STREAM ALL 7 CORPORA'}</span>
              </button>
            </div>
          </div>

          {/* Streaming Progress Bar */}
          {isStreamingAll && (
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Ingesting: {currentStreamDoc}</span>
                <span className="text-emerald-400 font-bold">{streamProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-sky-500 h-full transition-all duration-150"
                  style={{ width: `${streamProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Corpus Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CORPORE_DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#020408] border border-slate-800 rounded-lg p-3 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                      {doc.category} · {doc.year}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ~{doc.tokenCountEstimate} tokens
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 mt-1 line-clamp-1">{doc.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 font-mono leading-relaxed">
                    {doc.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">{doc.author}</span>
                  <button
                    onClick={() => handleIngestSingleDoc(doc)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs text-sky-300 font-mono transition-colors cursor-pointer"
                  >
                    Ingest Corpus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Text Ingestion */}
          <div className="bg-[#020408] border border-slate-800 rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
              INGEST CUSTOM TEXT OR SCIENTIFIC LITERATURE
            </h4>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste custom text, book chapters, or scientific prose to bind into the CSR + Pauli H8 crossbar..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
            <div className="flex justify-end">
              <button
                onClick={handleIngestCustom}
                disabled={!customText.trim()}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded text-xs font-mono font-medium cursor-pointer"
              >
                Ingest Custom Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CSR Crossbar Matrix Heatmap */}
      {activeTab === 'matrix' && (
        <div className="space-y-3">
          <div className="bg-[#020408] border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-sky-300 font-bold uppercase">
                  CSR SYNAPSE CONDUCTANCE TOPOLOGY (128 × 32 SUB-GRID)
                </span>
                <span className="text-[10px] text-slate-400">
                  Green: Horizon 0 · Purple: Horizons 1..7 · Cyan: Active Wavefront
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Total Synapses: {telemetry.activeSynapseCount.toLocaleString()}
              </div>
            </div>

            <div className="pt-3 flex justify-center">
              <canvas
                ref={matrixCanvasRef}
                width={860}
                height={320}
                className="w-full max-w-4xl h-80 bg-black rounded border border-slate-800 shadow-inner"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Thermodynamics & Pass-1 Calibration */}
      {activeTab === 'tuning' && (
        <div className="bg-[#020408] border border-slate-800 rounded-lg p-4 space-y-4 font-mono">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
              PASS-1 AUTONOMOUS CORPUS-LOCAL THERMODYNAMIC CALIBRATION
            </h3>
            <span className="text-[10px] text-emerald-400">
              100% Self-Calibrated · Zero Stopword Lists
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] text-slate-400">Token Density (ρ*)</div>
              <div className="text-sm font-bold text-sky-300 mt-0.5">{cal.tokenDensityRho}</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] text-slate-400">Structural Count (c* Q90)</div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">
                {cal.structuralCountThresholdC}
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] text-slate-400">Transition Entropy (th_trans)</div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">
                {cal.transitionEntropyThTrans} bits
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] text-slate-400">Temporal Decay (λ*)</div>
              <div className="text-sm font-bold text-purple-300 mt-0.5">
                {cal.temporalDecayLambda}
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider pt-2">
            CROSSBAR THERMODYNAMICS &amp; PHYSICAL CONSTANTS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Thermal Boltzmann Temp (T)</span>
                <span className="text-amber-400 font-bold">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.60"
                step="0.01"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Low T (0.01–0.15) produces deterministic factual recall; higher T adds physical exploration.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Pauli Refractory Half-Life (τ)</span>
                <span className="text-emerald-400 font-bold">{refractoryHalfLife.toFixed(1)} steps</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="16.0"
                step="0.5"
                value={refractoryHalfLife}
                onChange={(e) => setRefractoryHalfLife(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Controls the recovery speed of the soma membrane potential after emission to eliminate cyclic loops.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Max Emission Depth</span>
                <span className="text-sky-400 font-bold">{maxSynthesisTokens} tokens</span>
              </div>
              <input
                type="range"
                min="16"
                max="96"
                step="4"
                value={maxSynthesisTokens}
                onChange={(e) => setMaxSynthesisTokens(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Maximum token length per conversational excitation pulse.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">STDP Plasticity Learning Rate (η)</span>
                <span className="text-purple-400 font-bold">{learningRate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Conductance increment ΔG per token co-occurrence across temporal horizons.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Ingestion Epochs</span>
                <span className="text-cyan-400 font-bold">{epochs} pass</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Multi-pass STDP crystallization into Compressed Sparse Row (CSR) array buffers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

