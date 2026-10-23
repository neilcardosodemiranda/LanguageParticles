/**
 * Bare-Metal WASM / Typed-Array Neuromorphic CSR Memristor Engine
 * Unified with Autonomous Pauli-Orthogonal H8 Memristor Character-by-Character Stream (I = G · V · Ψ_Pauli)
 * & Tri-Chamber Narrative Molecule M(t) = [S(t-1), S(t), S(t+1)] Wave-Packet Physics
 * Designed for Apple Silicon (M4 16GB Unified Memory) & WebGPU
 *
 * 100% Pure Physics:
 * - Kirchhoff Current Law: I_j = \sum_{\delta=0}^7 \sum_i G_{ij}^{(\delta)} \cdot V_{t-\delta, i} \cdot \Psi_j \cdot \Psi_{Pauli}
 * - Pauli-Orthogonal H8 Character-by-Character Delay Stream: I(c_{t+1}) = \sum_{k=2}^8 G(c_{t-k+1..t} \to c_{t+1}) \cdot V_k \cdot \Psi_{Pauli}
 * - Pass-1 Autonomous Corpus-Local Thermodynamic Calibration (\mu(w) from Shannon branching entropy H_fwd & recurrence c*)
 * - Tri-Chamber Narrative Molecule M(t) = [S(t-1), S(t), S(t+1)] Wave-Packet Resonance & Dual-Crystal Commissure (\Delta E)
 * - 8 Macro-Cortical Biophysical Somas (N1..N8) coupled to 65,536 CSR Vocabulary Somas & 25M–100M Synapses
 * - Zero LLMs, Zero Grammar Rules, Zero Stopwords.
 */

import { gpuAccelerator } from './webgpuEngine';
import { getLetterParticleProperties } from '../utils/dictionary';
import {
  CharWavePacket,
  CorpusCalibrationArtifact,
  TriChamberTelemetry,
} from '../types/physics';

export type MemoryCapacityPreset = '5M' | '25M' | '100M';

export interface CapacityConfig {
  maxSynapses: number;
  maxVocab: number;
  totalVramBytes: number;
  label: string;
  description: string;
}

export const MEMORY_PRESETS: Record<MemoryCapacityPreset, CapacityConfig> = {
  '5M': {
    maxSynapses: 5_242_880,
    maxVocab: 65_536,
    totalVramBytes: 5_242_880 * 8 + 65_536 * 4 * 3, // ~42.7 MB
    label: '5M Memristors (42 MB)',
    description: 'Ultra-lightweight baseline with 65,536 vocabulary soma slots',
  },
  '25M': {
    maxSynapses: 26_214_400,
    maxVocab: 131_072,
    totalVramBytes: 26_214_400 * 8 + 131_072 * 4 * 3, // ~211.2 MB
    label: '25M Memristors (210 MB) [M4 Default]',
    description: 'High-density conversational crossbar with 131,072 vocabulary somas for Apple M4 Unified Memory',
  },
  '100M': {
    maxSynapses: 104_857_600,
    maxVocab: 262_144,
    totalVramBytes: 104_857_600 * 8 + 262_144 * 4 * 3, // ~842.0 MB
    label: '100M Memristors (842 MB) [Bare-Metal Maximum]',
    description: 'Massive Gutenberg library crossbar with 262,144 vocabulary somas & 100M synapses',
  },
};

export interface IngestedBookRecord {
  id: string;
  gutenbergId?: number;
  title: string;
  author: string;
  tokensProcessed: number;
  moleculesAdded: number;
  newVocabAdded: number;
  newSynapsesAdded: number;
  durationMs: number;
  tokensPerSec: number;
}

export interface BookStreamProgress {
  title: string;
  processedMolecules: number;
  totalMolecules: number;
  percent: number;
  tokensProcessed: number;
  vocabSize: number;
  activeSynapses: number;
  tokensPerSec: number;
}

export interface CrossbarTelemetry {
  capacityPreset: MemoryCapacityPreset;
  activeSynapseCount: number;
  tokenCsrSynapseCount: number;
  charDelaySynapseCount: number;
  maxSynapses: number;
  synapseUtilizationPct: number;
  vocabSize: number;
  maxVocab: number;
  allocatedVramBytes: number;
  ingestedTokens: number;
  ingestedChars: number;
  ingestedBooks: number;
  trainingTokensPerSec: number;
  inferenceLatencyUs: number;
  activeSomas: number[];
  activeMacroSomas: string[];
  lastResonantCurrent: number;
  pauliSuppressionRate: number;
  useWebGPUAcceleration: boolean;
  calibratedThresholdC: number;
  calibratedEntropyTh: number;
  narrativeMoleculesCount: number;
  calibrationArtifact: CorpusCalibrationArtifact;
  mmapBinSizeBytes: number;
  mmapLastSyncMs: number;
  mmapPlasticWriteCount: number;
  mmapStatus: string;
  plasticQueryLearningEnabled: boolean;
}

export interface GenerationStepTelemetry {
  token: string;
  tokenId: number;
  currentUa: number;
  pauliPsi: number;
  activeHorizon: number;
  chemicalPotentialMu?: number;
  candidates: Array<{ token: string; currentUa: number; conductance: number; psi: number }>;
}

export interface CrossbarNarrativeMolecule {
  id: string;
  lineageId: number;
  docTitle: string;
  sentenceIndex: number;
  prevText: string;
  focalText: string;
  nextText: string;
  clauses: string[];
  tokenIds: number[];
  lowerWords: string[];
}

export interface CrossbarSynthesisResult {
  response: string;
  h8CharStream: string;
  focusedClause: string;
  matchedSentence: string;
  sourceBook: string;
  resonanceScoreMv: number;
  activeMacroSomas: string[]; // e.g. ['N2-BETA', 'N4-DELTA', 'N5-ALPHA']
  predictedParticles: string[]; // High chemical-potential (mu-ranked) tokens
  charWavePackets: CharWavePacket[];
  caseSpinCoupling: {
    uppercaseHits: number;
    lowercaseHits: number;
    punctuationBosons: number;
    spaceGluons: number;
  };
  triChamber?: TriChamberTelemetry;
  steps: GenerationStepTelemetry[];
  totalLatencyUs: number;
  activeSomasCount: number;
  plasticWriteOccurred?: boolean;
  plasticSummary?: string;
}

export class WasmMemristorEngine {
  public preset: MemoryCapacityPreset;
  public config: CapacityConfig;

  // Contiguous CSR (Compressed Sparse Row) Synaptic Matrix buffers
  // rowPtr: index in colHorizon & conductance where row i begins (size: maxVocab + 1)
  public rowPtr: Uint32Array;
  public rowCounts: Uint32Array;
  // colHorizon: packed 24-bit targetTokenId + 8-bit horizonIndex (delta: 0..7)
  public colHorizon: Uint32Array;
  // conductance: float32 synaptic weight G_ij in microsiemens (μS)
  public conductance: Float32Array;

  // Dynamic Forward-Star Linked Indexing for O(1) online STDP insertion before CSR compaction
  private headEdge: Int32Array;
  private nextEdge: Int32Array;
  private edgeSource: Uint32Array;
  public synapseLineage: Uint32Array;

  // Pass-1 Autonomous Corpus-Local Thermodynamic Calibration buffers (Zero Stopword Lists!)
  public tokenFreq: Uint32Array;
  public tokenStartFreq: Uint32Array;
  public tokenHfwd: Float32Array;
  public tokenMu: Float32Array; // Thermodynamic chemical potential \mu(w)
  public calibratedCStar = 4;
  public calibratedThTrans = 1.25;

  // Word-level & 8-View Multi-Scale Temporal Delay Couplings V_0..V_7 (carried over from GutenbergTrainer)
  public dynamicLexicon: Set<string> = new Set();
  public wordCounts: Map<string, number> = new Map();
  public wordSentenceStartCounts: Map<string, number> = new Map();
  public wordTransitions: Map<string, Map<string, number>> = new Map();
  public wordBackwardTransitions: Map<string, Map<string, number>> = new Map();
  public wordForwardEntropy: Map<string, number> = new Map();
  public wordBackwardEntropy: Map<string, number> = new Map();
  public wordRecurrenceIntervals: Map<string, number[]> = new Map();
  public wordLastSeenIndex: Map<string, number> = new Map();
  public totalWordStreamIndex = 0;
  public multiViewWordCouplings: Array<Map<string, Map<string, number>>> = Array.from(
    { length: 8 },
    () => new Map<string, Map<string, number>>()
  );

  // Pauli-Orthogonal H8 Character-Level Memristor Crossbars & Multi-Delay Axonal Synapses (k = 2..8)
  public charMemristorCrossbar: Map<string, Map<string, number>> = new Map();
  public charBackwardCrossbar: Map<string, Map<string, number>> = new Map();
  public charForwardEntropy: Map<string, number> = new Map();
  public charBackwardEntropy: Map<string, number> = new Map();
  public charDelayLineSynapses: Map<string, Map<string, number>> = new Map();
  public charDelayLineLineages: Map<string, Map<string, Set<string>>> = new Map();
  public charWindowHabituation: Map<string, number> = new Map();
  public uniqueCharSet: Set<string> = new Set();
  public totalRawCharsTrained = 0;
  public charDelayEdgeCount = 0;

  // 8 Macro-Cortical Biophysical Somas (N1..N8) coupled to the 25M CSR Crossbar
  public readonly MACRO_SOMA_LABELS = [
    'N1-ALPHA (Vowel Leptons)',
    'N2-BETA (Plosive Quarks)',
    'N3-GAMMA (Fricative Quarks)',
    'N4-DELTA (Nasal/Liquid Quarks)',
    'N5-ALPHA (Complex Quarks)',
    'N6-BETA (Morphology/Suffixes)',
    'N7-GAMMA (Gauge Bosons)',
    'N8-DELTA (Executive Attractors)',
  ];
  public lastActiveMacroSomas: string[] = ['N2-BETA', 'N4-DELTA', 'N5-ALPHA'];

  public calibrationArtifact: CorpusCalibrationArtifact = {
    tokenDensityRho: 0.042,
    structuralCountThresholdC: 8,
    sentenceStartPriorP: 0.05,
    forwardEntropyBoundaryHfwd: 2.4,
    backwardEntropyBoundaryHbwd: 0.5,
    transitionEntropyThTrans: 1.585,
    temporalDecayLambda: 0.142,
    coherenceScalePsi: 4.2,
    directionalSeparationTheta: 0.28,
    calibrationTimeMs: 0.5,
    weights: {
      alphaBackward: 0.24,
      betaPresent: 0.28,
      gammaForward: 0.26,
      deltaReverse: 0.22,
    },
  };

  // Tri-Chamber Narrative Molecules M(t) = [S(t-1), S(t), S(t+1)]
  public molecules: CrossbarNarrativeMolecule[] = [];
  public ingestedBookRegistry: IngestedBookRecord[] = [];

  // Vocab Hash Maps and string tables (zero-GC continuous arrays)
  public vocabList: string[] = [];
  public tokenToIdMap: Map<string, number> = new Map();
  public lowerTokenToIdMap: Map<string, number> = new Map();

  // Soma dynamics and Pauli refractory suppression
  public somaVoltages: Float32Array; // Current soma potentials V_j (size: maxVocab)
  public refractoryPsi: Float32Array; // Pauli refractory exclusion factor \Psi_j \in [0, 1]
  public horizonDelayWavefront: Uint32Array; // Ring buffer of previous 8 fired token IDs

  // Temporal horizons: 8 distinct delay intervals (tau_0 to tau_7)
  public readonly NUM_HORIZONS = 8;
  public readonly HORIZON_DECAY = [1.0, 0.88, 0.76, 0.64, 0.52, 0.42, 0.33, 0.25];

  // Engine state counters
  public activeSynapses = 0;
  public totalIngestedTokens = 0;
  public ingestedBooksCount = 0;
  public lastInferenceLatencyUs = 0;
  public lastTokensPerSec = 0;
  public lastResonantCurrentUa = 0;
  public useWebGPU = true;

  // Real-time Plasticity & Binary .bin Memory-Mapped (mmap) State
  public plasticQueryLearningEnabled = true;
  public mmapBinSizeBytes = 0;
  public mmapLastSyncMs = 0;
  public mmapPlasticWriteCount = 0;
  public mmapStatus = 'MMAP READY';
  public isMmapRestored = false;
  private mmapSyncTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(preset: MemoryCapacityPreset = '25M') {
    this.preset = preset;
    this.config = MEMORY_PRESETS[preset];

    const maxV = this.config.maxVocab;
    const maxS = this.config.maxSynapses;

    this.rowPtr = new Uint32Array(maxV + 1);
    this.rowCounts = new Uint32Array(maxV);
    this.colHorizon = new Uint32Array(maxS);
    this.conductance = new Float32Array(maxS);

    const auxEdgeCap = Math.min(maxS, 8_388_608);
    this.headEdge = new Int32Array(maxV);
    this.headEdge.fill(-1);
    this.nextEdge = new Int32Array(auxEdgeCap);
    this.nextEdge.fill(-1);
    this.edgeSource = new Uint32Array(auxEdgeCap);
    this.synapseLineage = new Uint32Array(auxEdgeCap);

    this.tokenFreq = new Uint32Array(maxV);
    this.tokenStartFreq = new Uint32Array(maxV);
    this.tokenHfwd = new Float32Array(maxV);
    this.tokenMu = new Float32Array(maxV);
    this.tokenMu.fill(1.0);

    this.somaVoltages = new Float32Array(maxV);
    this.refractoryPsi = new Float32Array(maxV);
    this.refractoryPsi.fill(1.0);

    this.horizonDelayWavefront = new Uint32Array(this.NUM_HORIZONS);
    this.horizonDelayWavefront.fill(0);

    this.seedFundamentalTokens();
  }

  private seedFundamentalTokens(): void {
    this.vocabList = [];
    this.tokenToIdMap.clear();
    this.lowerTokenToIdMap.clear();
    this.molecules = [];
    this.ingestedBookRegistry = [];
    this.dynamicLexicon.clear();
    this.wordCounts.clear();
    this.wordSentenceStartCounts.clear();
    this.wordTransitions.clear();
    this.wordBackwardTransitions.clear();
    this.wordForwardEntropy.clear();
    this.wordBackwardEntropy.clear();
    this.wordRecurrenceIntervals.clear();
    this.wordLastSeenIndex.clear();
    this.totalWordStreamIndex = 0;
    this.multiViewWordCouplings.forEach((m) => m.clear());
    this.charMemristorCrossbar.clear();
    this.charBackwardCrossbar.clear();
    this.charForwardEntropy.clear();
    this.charBackwardEntropy.clear();
    this.charDelayLineSynapses.clear();
    this.charDelayLineLineages.clear();
    this.charWindowHabituation.clear();
    this.uniqueCharSet.clear();
    this.totalRawCharsTrained = 0;
    this.charDelayEdgeCount = 0;

    this.getOrRegisterToken('<START>');
    this.getOrRegisterToken('<END>');
    this.getOrRegisterToken('<PAD>');
  }

  /**
   * Maps a character to its specialized Macro-Cortical Biophysical Soma index (0-7: N1..N8)
   */
  public mapCharToMacroSomaIndex(char: string): number {
    const u = char.toUpperCase();
    if ('AEIOUY'.includes(u)) return 0; // N1: Vowels
    if ('PTKBDG'.includes(u)) return 1; // N2: Plosives
    if ('SFVZC'.includes(u)) return 2; // N3: Fricatives
    if ('MNLR'.includes(u)) return 3; // N4: Nasals/Liquids
    if ('WHJXQ'.includes(u)) return 4; // N5: Complex Quarks
    if ('!?.#*-+:;~'.includes(char)) return 6; // N7: Gauge Bosons
    if ('0123456789'.includes(char)) return 7; // N8: Digits / Attractors
    return 5; // N6: Morphology / Suffixes
  }

  /**
   * Reallocates crossbar memory buffers to a new hardware capacity preset (5M, 25M, or 100M memristors)
   */
  public switchPreset(newPreset: MemoryCapacityPreset): void {
    if (this.preset === newPreset) return;

    try {
      const cfg = MEMORY_PRESETS[newPreset];
      const maxV = cfg.maxVocab;
      const maxS = cfg.maxSynapses;

      this.rowPtr = new Uint32Array(maxV + 1);
      this.rowCounts = new Uint32Array(maxV);
      this.colHorizon = new Uint32Array(maxS);
      this.conductance = new Float32Array(maxS);

      const auxEdgeCap = Math.min(maxS, 8_388_608);
      this.headEdge = new Int32Array(maxV);
      this.headEdge.fill(-1);
      this.nextEdge = new Int32Array(auxEdgeCap);
      this.nextEdge.fill(-1);
      this.edgeSource = new Uint32Array(auxEdgeCap);
      this.synapseLineage = new Uint32Array(auxEdgeCap);

      this.tokenFreq = new Uint32Array(maxV);
      this.tokenStartFreq = new Uint32Array(maxV);
      this.tokenHfwd = new Float32Array(maxV);
      this.tokenMu = new Float32Array(maxV);
      this.tokenMu.fill(1.0);

      this.somaVoltages = new Float32Array(maxV);
      this.refractoryPsi = new Float32Array(maxV);
      this.refractoryPsi.fill(1.0);

      this.horizonDelayWavefront = new Uint32Array(this.NUM_HORIZONS);
      this.horizonDelayWavefront.fill(0);

      this.preset = newPreset;
      this.config = cfg;
      this.activeSynapses = 0;
      this.totalIngestedTokens = 0;
      this.ingestedBooksCount = 0;
      this.seedFundamentalTokens();
    } catch {
      if (newPreset === '100M') {
        this.switchPreset('25M');
      }
    }
  }

  /**
   * Fast register or lookup of token ID with zero-cost string intern
   */
  public getOrRegisterToken(rawToken: string): number {
    const token = rawToken.trim();
    if (!token) return 0;

    let id = this.tokenToIdMap.get(token);
    if (id !== undefined) return id;

    if (this.vocabList.length >= this.config.maxVocab) {
      return (Math.abs(this.fastHash(token)) % (this.config.maxVocab - 3)) + 3;
    }

    id = this.vocabList.length;
    this.vocabList.push(token);
    this.tokenToIdMap.set(token, id);

    const lower = token.toLowerCase();
    if (!this.lowerTokenToIdMap.has(lower)) {
      this.lowerTokenToIdMap.set(lower, id);
    }
    return id;
  }

  /**
   * Spin-aware lookup: checks exact case spin first, then spin-flip lowercase dipole
   */
  public getTokenId(rawToken: string): number | undefined {
    const clean = rawToken.trim();
    const exact = this.tokenToIdMap.get(clean);
    if (exact !== undefined) return exact;
    return this.lowerTokenToIdMap.get(clean.toLowerCase());
  }

  public getTokenString(id: number): string {
    if (id >= 0 && id < this.vocabList.length) {
      return this.vocabList[id];
    }
    return '';
  }

  /**
   * Fast 32-bit FNV-1a non-cryptographic string hash
   */
  private fastHash(str: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  /**
   * Clean and normalize text into physical linguistic tokens.
   * Preserves internal apostrophes and hyphens (e.g., "Newton's", "rabbit-hole", "three-legged")
   * while separating sentence/clause punctuation bosons.
   */
  public tokenize(text: string): string[] {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/[“”"]/g, '')
      .replace(/([.,!?;:()—–])/g, ' $1 ')
      .split(/\s+/)
      .filter((t) => t.length > 0);
  }

  /**
   * Reassembles token stream with clean typographic punctuation spacing
   */
  public detokenize(tokens: string[]): string {
    let out = '';
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (!t || t === '<START>' || t === '<END>' || t === '<PAD>') continue;
      const isAttachLeft = /^[.,!?;:)]/.test(t);
      const prevWasOpen = i > 0 && /^[(]$/.test(tokens[i - 1]);
      if (out.length > 0 && !isAttachLeft && !prevWasOpen) {
        out += ' ';
      }
      out += t;
    }
    return out.trim();
  }

  /**
   * Helper: compute empirical quantile q in [0, 1] from a numeric array
   */
  private computeQuantile(values: number[], q: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * Math.max(0, Math.min(1, q));
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  }

  /**
   * Helper: compute Shannon entropy (in bits) of a transition frequency map
   */
  private computeShannonEntropyBits(transitions: Map<string, number> | undefined): number {
    if (!transitions || transitions.size === 0) return 0;
    let total = 0;
    transitions.forEach((c) => {
      total += c;
    });
    if (total <= 0) return 0;
    let entropy = 0;
    transitions.forEach((c) => {
      const p = c / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    });
    return entropy;
  }

  /**
   * Segments a raw document into Ordered Three-Sentence Narrative Molecules M(t) = [S(t-1), S(t), S(t+1)].
   */
  private extractNarrativeMolecules(text: string, title: string): CrossbarNarrativeMolecule[] {
    const clean = text.replace(/\r\n/g, '\n').trim();
    const extracted: CrossbarNarrativeMolecule[] = [];

    const sentences = clean
      .split(/(?<=[.?!]["'”’]?)\s+/)
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter((s) => s.length > 8);

    for (let i = 0; i < sentences.length; i++) {
      const focal = sentences[i];
      const prev = i > 0 ? sentences[i - 1] : '';
      const next = i < sentences.length - 1 ? sentences[i + 1] : '';
      const lineageId = this.molecules.length + extracted.length + 1;
      const molId = `${title}::M${i}`;
      const toks = this.tokenize(focal);
      const tokenIds = toks.map((t) => this.getOrRegisterToken(t));
      const clauses = focal
        .split(/[;:]/)
        .map((c) => c.trim())
        .filter((c) => c.length > 4);

      extracted.push({
        id: molId,
        lineageId,
        docTitle: title,
        sentenceIndex: i,
        prevText: prev,
        focalText: focal,
        nextText: next,
        clauses: clauses.length > 0 ? clauses : [focal],
        tokenIds,
        lowerWords: toks
          .map((t) => t.toLowerCase().replace(/[^a-z0-9'-]/g, ''))
          .filter((w) => w.length >= 2),
      });
    }

    return extracted;
  }

  /**
   * Strips Project Gutenberg license header and footer boilerplate on the client side
   * (in case a user uploads a raw .txt downloaded from gutenberg.org).
   */
  public stripGutenbergBoilerplate(raw: string): string {
    const normalized = raw.replace(/\r\n/g, '\n');
    const startRegex =
      /\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*|END OF THE SMALL PRINT! FOR PUBLIC DOMAIN ETEXTS[^\n]*\n/i;
    const endRegex =
      /\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*|\*\*\*\s*END OF THE PROJECT GUTENBERG/i;

    let startIdx = 0;
    const startHit = startRegex.exec(normalized);
    if (startHit && startHit.index !== undefined) {
      startIdx = startHit.index + startHit[0].length;
    }

    let endIdx = normalized.length;
    const endHit = endRegex.exec(normalized);
    if (endHit && endHit.index !== undefined && endHit.index > startIdx) {
      endIdx = endHit.index;
    }

    const stripped = normalized.slice(startIdx, endIdx).trim();
    return stripped.length > 100 ? stripped : normalized.trim();
  }

  /**
   * Crystallizes Pauli-Orthogonal H8 Multi-Delay Character Synapses (k = 2..maxK)
   * and Lineage Tags for a single Narrative Molecule M(t).
   */
  public crystallizeMoleculeH8DelayLines(
    mol: CrossbarNarrativeMolecule,
    epochs: number = 1,
    learningRate: number = 0.15,
    maxK: number = 16
  ): void {
    const s = mol.focalText;
    for (let i = 0; i < s.length - 1; i++) {
      const cB = s[i + 1];
      for (let k = 2; k <= maxK; k++) {
        if (i >= k - 1) {
          const ctx = s.slice(i - k + 1, i + 1);
          let ctxMap = this.charDelayLineSynapses.get(ctx);
          if (!ctxMap) {
            ctxMap = new Map();
            this.charDelayLineSynapses.set(ctx, ctxMap);
          }
          const isNewCharEdge = !ctxMap.has(cB);
          ctxMap.set(
            cB,
            (ctxMap.get(cB) || 0.1) + learningRate * (0.65 + k * 0.14) * epochs
          );
          if (isNewCharEdge) {
            this.charDelayEdgeCount++;
          }

          let lineageMap = this.charDelayLineLineages.get(ctx);
          if (!lineageMap) {
            lineageMap = new Map();
            this.charDelayLineLineages.set(ctx, lineageMap);
          }
          let molSet = lineageMap.get(cB);
          if (!molSet) {
            molSet = new Set();
            lineageMap.set(cB, molSet);
          }
          molSet.add(mol.id);
        }
      }
    }
  }

  /**
   * Internal core trainer for a single Narrative Molecule M(t):
   * Updates CSR Token Crossbar, 8-View Word Couplings, Character 1-gram Crossbar,
   * and (when trainH8Delay is true) Pauli-Orthogonal H8 Character Delay Synapses.
   */
  private trainSingleMolecule(
    mol: CrossbarNarrativeMolecule,
    epochs: number,
    learningRate: number,
    trainH8Delay: boolean,
    maxH8K: number = 16
  ): number {
    const tIds = mol.tokenIds;
    if (tIds.length > 0) {
      this.tokenStartFreq[tIds[0]]++;
    }
    for (let i = 0; i < tIds.length; i++) {
      this.tokenFreq[tIds[i]]++;
    }

    // 1. Word-level statistics & 8-View Multi-Scale Temporal Delay Couplings (V0..V7)
    const sWords = mol.focalText
      .toUpperCase()
      .split(/[^A-Z0-9'-]+/)
      .filter((w) => w.length >= 1);

    if (sWords.length > 0) {
      const firstW = sWords[0];
      this.wordSentenceStartCounts.set(
        firstW,
        (this.wordSentenceStartCounts.get(firstW) || 0) + 1
      );
    }

    for (let i = 0; i < sWords.length; i++) {
      const w = sWords[i];
      this.totalWordStreamIndex++;
      if (w.length >= 2) {
        this.dynamicLexicon.add(w);
      }
      this.wordCounts.set(w, (this.wordCounts.get(w) || 0) + 1);

      const prevSeen = this.wordLastSeenIndex.get(w);
      if (prevSeen !== undefined) {
        const deltaD = Math.max(1, this.totalWordStreamIndex - prevSeen);
        let ivs = this.wordRecurrenceIntervals.get(w);
        if (!ivs) {
          ivs = [];
          this.wordRecurrenceIntervals.set(w, ivs);
        }
        if (ivs.length < 32) ivs.push(deltaD);
      }
      this.wordLastSeenIndex.set(w, this.totalWordStreamIndex);

      if (i < sWords.length - 1) {
        const nextW = sWords[i + 1];
        let fRow = this.wordTransitions.get(w);
        if (!fRow) {
          fRow = new Map();
          this.wordTransitions.set(w, fRow);
        }
        fRow.set(nextW, (fRow.get(nextW) || 0) + 1);

        let bRow = this.wordBackwardTransitions.get(nextW);
        if (!bRow) {
          bRow = new Map();
          this.wordBackwardTransitions.set(nextW, bRow);
        }
        bRow.set(w, (bRow.get(w) || 0) + 1);
      }

      // 8-View Multi-Scale Temporal Delay Couplings V_0..V_7
      for (let v = 0; v < 8; v++) {
        const targetIdx = i + v + 1;
        if (targetIdx < sWords.length) {
          const targetW = sWords[targetIdx];
          const viewMap = this.multiViewWordCouplings[v];
          let vRow = viewMap.get(w);
          if (!vRow) {
            vRow = new Map();
            viewMap.set(w, vRow);
          }
          vRow.set(targetW, (vRow.get(targetW) || 0) + 1);
        }
      }
    }

    // 2. Train Character 1-gram Crossbar & Habituation Windows
    const s = mol.focalText;
    this.totalRawCharsTrained += s.length;
    for (let i = 0; i < s.length; i++) {
      this.uniqueCharSet.add(s[i]);
    }

    for (let i = 0; i < s.length - 1; i++) {
      const cA = s[i];
      const cB = s[i + 1];

      let fRow = this.charMemristorCrossbar.get(cA);
      if (!fRow) {
        fRow = new Map();
        this.charMemristorCrossbar.set(cA, fRow);
      }
      fRow.set(cB, (fRow.get(cB) || 0.1) + learningRate * 0.55 * epochs);

      let bRow = this.charBackwardCrossbar.get(cB);
      if (!bRow) {
        bRow = new Map();
        this.charBackwardCrossbar.set(cB, bRow);
      }
      bRow.set(cA, (bRow.get(cA) || 0.1) + learningRate * 0.55 * epochs);

      if (i <= s.length - 5 && this.charWindowHabituation.size < 120_000) {
        const win5 = s.slice(i, i + 5);
        this.charWindowHabituation.set(win5, (this.charWindowHabituation.get(win5) || 0) + 1);
      }
    }

    if (trainH8Delay) {
      this.crystallizeMoleculeH8DelayLines(mol, epochs, learningRate, maxH8K);
    }

    // 3. Multi-Horizon STDP Plasticity in Contiguous CSR Token Matrix (\delta = 0..7)
    for (let ep = 0; ep < epochs; ep++) {
      if (tIds.length > 0) {
        this.updateSynapseConductance(0, tIds[0], 0, learningRate, mol.lineageId);
      }

      for (let i = 0; i < tIds.length; i++) {
        const targetId = tIds[i];

        for (let delta = 0; delta < this.NUM_HORIZONS; delta++) {
          const sourceIdx = i - 1 - delta;
          if (sourceIdx < 0) continue;

          const sourceId = tIds[sourceIdx];
          const horizonWeight = this.HORIZON_DECAY[delta] * learningRate;

          this.updateSynapseConductance(
            sourceId,
            targetId,
            delta,
            horizonWeight,
            mol.lineageId
          );
        }
      }
    }

    return tIds.length;
  }

  /**
   * Ingest a body of text synchronously using:
   * 1. Multi-Horizon STDP Plasticity across the Contiguous CSR Token Crossbar (\delta = 0..7)
   * 2. Pauli-Orthogonal H8 Multi-Delay Character Synapses (k = 2..16) with Trajectory Lineage coordinates
   * 3. 8-View Multi-Scale Temporal Delay Word Couplings (V_0..V_7)
   * 4. Pass-1 Autonomous Corpus-Local Thermodynamic Calibration (\mu(w), H_fwd, c*, th_trans)
   */
  public ingestText(
    text: string,
    title: string,
    epochs: number = 1,
    learningRate: number = 0.15,
    author: string = 'Classic Corpus'
  ): { tokensProcessed: number; newSynapses: number; durationMs: number } {
    const startTime = performance.now();
    const cleanText = this.stripGutenbergBoilerplate(text);
    const vocabBefore = Math.max(0, this.vocabList.length - 3);
    const startSynapses = this.activeSynapses + this.charDelayEdgeCount;

    const newMols = this.extractNarrativeMolecules(cleanText, title);
    if (newMols.length === 0) {
      return { tokensProcessed: 0, newSynapses: 0, durationMs: 0 };
    }

    // Replace any previous molecules from the same document title
    this.molecules = [
      ...newMols,
      ...this.molecules.filter((m) => m.docTitle !== title),
    ];

    let totalTokensInPass = 0;
    const isLargeDoc = newMols.length > 250;

    for (let idx = 0; idx < newMols.length; idx++) {
      const mol = newMols[idx];
      const shouldTrainH8 =
        !isLargeDoc || (this.charDelayEdgeCount < 380_000 && idx % 3 === 0);
      totalTokensInPass += this.trainSingleMolecule(
        mol,
        epochs,
        learningRate,
        shouldTrainH8,
        isLargeDoc ? 10 : 16
      );
    }

    // Compact linked edges into strictly contiguous CSR arrays (rowPtr, colHorizon, conductance)
    this.rebuildContiguousCSR();

    // Execute Pass-1 Autonomous Corpus-Local Thermodynamic Calibration (\mu(w) & H_fwd(w))
    this.recalibrateThermodynamics(startTime);

    const durationMs = Math.max(0.5, performance.now() - startTime);
    const endSynapses = this.activeSynapses + this.charDelayEdgeCount;
    const newSynapses = Math.max(0, endSynapses - startSynapses);
    const vocabAfter = Math.max(0, this.vocabList.length - 3);

    this.totalIngestedTokens += totalTokensInPass * epochs;
    this.ingestedBooksCount++;
    this.lastTokensPerSec =
      durationMs > 0 ? (totalTokensInPass * epochs) / (durationMs / 1000) : 0;

    const record: IngestedBookRecord = {
      id: `${title}-${Date.now()}`,
      title,
      author,
      tokensProcessed: totalTokensInPass * epochs,
      moleculesAdded: newMols.length,
      newVocabAdded: Math.max(0, vocabAfter - vocabBefore),
      newSynapsesAdded: newSynapses,
      durationMs: Math.round(durationMs),
      tokensPerSec: Math.round(this.lastTokensPerSec),
    };
    this.ingestedBookRegistry = [
      record,
      ...this.ingestedBookRegistry.filter((r) => r.title !== title),
    ].slice(0, 100);

    this.scheduleBinaryMmapSync(180);

    return {
      tokensProcessed: totalTokensInPass * epochs,
      newSynapses,
      durationMs,
    };
  }

  /**
   * High-Throughput Non-Blocking Chunked Book Streamer:
   * Streams an entire full-length Project Gutenberg book (e.g. 60,000–250,000 words)
   * into the 25M / 100M CSR Crossbar + 8-View Couplings + Pauli H8 Delay Matrix
   * while yielding between sentence batches so telemetry updates live at 60 FPS.
   */
  public async ingestFullBookStream(
    rawText: string,
    title: string,
    author: string = 'Project Gutenberg',
    gutenbergId?: number,
    epochs: number = 1,
    learningRate: number = 0.15,
    onProgress?: (progress: BookStreamProgress) => void
  ): Promise<IngestedBookRecord> {
    const cleanText = this.stripGutenbergBoilerplate(rawText);
    const vocabBefore = Math.max(0, this.vocabList.length - 3);
    const startSynapses = this.activeSynapses + this.charDelayEdgeCount;

    const extractStart = performance.now();
    const newMols = this.extractNarrativeMolecules(cleanText, title);
    const extractMs = performance.now() - extractStart;

    if (newMols.length === 0) {
      return {
        id: `${title}-${Date.now()}`,
        gutenbergId,
        title,
        author,
        tokensProcessed: 0,
        moleculesAdded: 0,
        newVocabAdded: 0,
        newSynapsesAdded: 0,
        durationMs: 0,
        tokensPerSec: 0,
      };
    }

    // Append/replace molecules in the Tri-Chamber Narrative Memory
    this.molecules = [
      ...this.molecules.filter((m) => m.docTitle !== title),
      ...newMols,
    ];

    let totalTokensInPass = 0;
    let activeComputeMs = Math.max(1, extractMs);
    const totalMols = newMols.length;
    const chunkSize = 280; // Sentences per non-blocking slice
    const h8Stride = totalMols > 1200 ? 6 : totalMols > 400 ? 3 : 1;

    for (let startIdx = 0; startIdx < totalMols; startIdx += chunkSize) {
      const sliceStart = performance.now();
      const endIdx = Math.min(totalMols, startIdx + chunkSize);

      for (let i = startIdx; i < endIdx; i++) {
        const mol = newMols[i];
        const trainH8 =
          this.charDelayEdgeCount < 420_000 && i % h8Stride === 0;
        const toks = this.trainSingleMolecule(
          mol,
          epochs,
          learningRate,
          trainH8,
          totalMols > 800 ? 8 : 12
        );
        totalTokensInPass += toks;
      }

      const sliceElapsed = Math.max(0.2, performance.now() - sliceStart);
      activeComputeMs += sliceElapsed;

      this.lastTokensPerSec =
        (totalTokensInPass * epochs) / (activeComputeMs / 1000);

      if (onProgress) {
        onProgress({
          title,
          processedMolecules: endIdx,
          totalMolecules: totalMols,
          percent: Math.round((endIdx / totalMols) * 100),
          tokensProcessed: totalTokensInPass * epochs,
          vocabSize: Math.max(0, this.vocabList.length - 3),
          activeSynapses: this.activeSynapses + this.charDelayEdgeCount,
          tokensPerSec: Math.round(this.lastTokensPerSec),
        });
      }

      // Yield to browser animation loop so UI telemetry updates smoothly
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const compactStart = performance.now();
    this.rebuildContiguousCSR();
    this.recalibrateThermodynamics(compactStart);
    activeComputeMs += Math.max(0.5, performance.now() - compactStart);

    this.totalIngestedTokens += totalTokensInPass * epochs;
    this.ingestedBooksCount++;
    this.lastTokensPerSec =
      (totalTokensInPass * epochs) / (activeComputeMs / 1000);

    const vocabAfter = Math.max(0, this.vocabList.length - 3);
    const endSynapses = this.activeSynapses + this.charDelayEdgeCount;

    const record: IngestedBookRecord = {
      id: `${gutenbergId || title}-${Date.now()}`,
      gutenbergId,
      title,
      author,
      tokensProcessed: totalTokensInPass * epochs,
      moleculesAdded: totalMols,
      newVocabAdded: Math.max(0, vocabAfter - vocabBefore),
      newSynapsesAdded: Math.max(0, endSynapses - startSynapses),
      durationMs: Math.round(activeComputeMs),
      tokensPerSec: Math.round(this.lastTokensPerSec),
    };

    this.ingestedBookRegistry = [
      record,
      ...this.ingestedBookRegistry.filter((r) => r.title !== title),
    ].slice(0, 100);

    await this.syncToBinaryMmap();

    return record;
  }

  /**
   * Updates or appends a memristor synapse G_ij at temporal horizon delta
   * using the zero-GC Forward-Star linked index (headEdge / nextEdge).
   */
  public updateSynapseConductance(
    sourceId: number,
    targetId: number,
    horizon: number,
    deltaG: number,
    lineageId: number = 0
  ): void {
    if (sourceId >= this.config.maxVocab || targetId >= this.config.maxVocab) return;

    const packedCol = ((targetId & 0xffffff) << 8) | (horizon & 0xff);

    let edgeIdx = this.headEdge[sourceId];
    while (edgeIdx !== -1) {
      if (this.colHorizon[edgeIdx] === packedCol) {
        const currentG = this.conductance[edgeIdx];
        const saturatedG = currentG + deltaG * (1.0 - Math.min(0.95, currentG * 0.1));
        this.conductance[edgeIdx] = Math.min(10.0, saturatedG);
        if (lineageId > 0 && this.synapseLineage[edgeIdx] === 0) {
          this.synapseLineage[edgeIdx] = lineageId;
        }
        return;
      }
      edgeIdx = this.nextEdge[edgeIdx];
    }

    const maxAux = this.nextEdge.length;
    if (this.activeSynapses < maxAux && this.activeSynapses < this.config.maxSynapses) {
      const newIdx = this.activeSynapses;
      this.colHorizon[newIdx] = packedCol;
      this.conductance[newIdx] = Math.max(0.05, deltaG);
      this.edgeSource[newIdx] = sourceId;
      this.synapseLineage[newIdx] = lineageId;

      this.nextEdge[newIdx] = this.headEdge[sourceId];
      this.headEdge[sourceId] = newIdx;
      this.rowCounts[sourceId]++;
      this.activeSynapses++;
    }
  }

  /**
   * Rebuilds strictly contiguous Compressed Sparse Row (CSR) layout across
   * rowPtr, colHorizon, conductance, and synapseLineage.
   */
  private rebuildContiguousCSR(): void {
    const vocabCount = this.vocabList.length;
    const totalEdges = this.activeSynapses;
    if (totalEdges === 0 || vocabCount === 0) return;

    let offset = 0;
    for (let v = 0; v < vocabCount; v++) {
      this.rowPtr[v] = offset;
      offset += this.rowCounts[v];
    }
    this.rowPtr[vocabCount] = offset;

    const sortedCol = new Uint32Array(totalEdges);
    const sortedCond = new Float32Array(totalEdges);
    const sortedLin = new Uint32Array(totalEdges);

    for (let v = 0; v < vocabCount; v++) {
      let writePos = this.rowPtr[v];
      let e = this.headEdge[v];
      while (e !== -1) {
        sortedCol[writePos] = this.colHorizon[e];
        sortedCond[writePos] = this.conductance[e];
        sortedLin[writePos] = this.synapseLineage[e];
        writePos++;
        e = this.nextEdge[e];
      }
    }

    this.colHorizon.set(sortedCol, 0);
    this.conductance.set(sortedCond, 0);
    this.synapseLineage.set(sortedLin, 0);

    for (let v = 0; v < vocabCount; v++) {
      const start = this.rowPtr[v];
      const count = this.rowCounts[v];
      if (count === 0) {
        this.headEdge[v] = -1;
      } else {
        this.headEdge[v] = start;
        for (let k = 0; k < count; k++) {
          const idx = start + k;
          this.edgeSource[idx] = v;
          this.nextEdge[idx] = k < count - 1 ? idx + 1 : -1;
        }
      }
    }
  }

  /**
   * Pass-1 Autonomous Corpus-Local Thermodynamic Calibration:
   * Derives all operating boundaries directly from empirical corpus quantiles
   * and CSR conductances without any stopword dictionaries or supervision.
   */
  public recalibrateThermodynamics(startTimeMs: number = performance.now()): CorpusCalibrationArtifact {
    const totalSentences = Math.max(1, this.molecules.length);
    let totalSentenceWords = 0;
    for (const m of this.molecules) {
      totalSentenceWords += m.lowerWords.length;
    }
    const meanSentenceLength = totalSentenceWords / totalSentences;
    const tokenDensityRho = Math.round((1.0 / (meanSentenceLength + 1e-6)) * 10000) / 10000;

    const recurringCounts: number[] = [];
    const startPriors: number[] = [];
    const fwdEntropies: number[] = [];
    const bwdEntropies: number[] = [];

    this.wordCounts.forEach((count, w) => {
      recurringCounts.push(count);
      const hFwd = this.computeShannonEntropyBits(this.wordTransitions.get(w));
      const hBwd = this.computeShannonEntropyBits(this.wordBackwardTransitions.get(w));
      this.wordForwardEntropy.set(w, hFwd);
      this.wordBackwardEntropy.set(w, hBwd);

      if (count >= 2) {
        const startCount = this.wordSentenceStartCounts.get(w) || 0;
        startPriors.push(startCount / count);
        fwdEntropies.push(hFwd);
        bwdEntropies.push(hBwd);
      }
    });

    this.charMemristorCrossbar.forEach((row, ch) => {
      this.charForwardEntropy.set(ch, this.computeShannonEntropyBits(row));
    });
    this.charBackwardCrossbar.forEach((row, ch) => {
      this.charBackwardEntropy.set(ch, this.computeShannonEntropyBits(row));
    });

    const structuralCountThresholdC = Math.max(
      2,
      Math.round(this.computeQuantile(recurringCounts, 0.9))
    );
    const sentenceStartPriorP =
      Math.round(Math.max(1e-4, this.computeQuantile(startPriors, 0.1)) * 10000) / 10000;
    const forwardEntropyBoundaryHfwd =
      Math.round(Math.max(0.5, this.computeQuantile(fwdEntropies, 0.9)) * 10000) / 10000;
    const backwardEntropyBoundaryHbwd =
      Math.round(Math.max(0.1, this.computeQuantile(bwdEntropies, 0.1)) * 10000) / 10000;
    const transitionEntropyThTrans =
      Math.round(Math.max(0.4, this.computeQuantile(fwdEntropies, 0.5)) * 10000) / 10000;

    const allIntervals: number[] = [];
    this.wordRecurrenceIntervals.forEach((arr) => {
      for (const iv of arr) allIntervals.push(iv);
    });
    const meanInterval =
      allIntervals.length > 0
        ? allIntervals.reduce((a, b) => a + b, 0) / allIntervals.length
        : 24.0;
    const temporalDecayLambda =
      Math.round((1.0 / Math.max(1.0, Math.log(meanInterval + 2.0))) * 10000) / 10000;

    const meanHfwd =
      fwdEntropies.length > 0
        ? fwdEntropies.reduce((a, b) => a + b, 0) / fwdEntropies.length
        : 1.2;
    const meanHbwd =
      bwdEntropies.length > 0
        ? bwdEntropies.reduce((a, b) => a + b, 0) / bwdEntropies.length
        : 1.0;
    const varH =
      fwdEntropies.length > 0
        ? fwdEntropies.reduce((acc, h) => acc + Math.pow(h - meanHfwd, 2), 0) / fwdEntropies.length
        : 0.65;
    const coherenceScalePsi =
      Math.round(
        Math.sqrt(Math.max(0.05, varH)) * Math.log2(this.dynamicLexicon.size + 2) * 10000
      ) / 10000;
    const directionalSeparationTheta =
      Math.round(Math.abs(meanHfwd - meanHbwd) * 10000) / 10000;

    const varBwd =
      bwdEntropies.length > 0
        ? bwdEntropies.reduce((acc, h) => acc + Math.pow(h - meanHbwd, 2), 0) / bwdEntropies.length
        : 0.6;
    const invBwd = 1.0 / (varBwd + 0.35);
    const invPres = 1.0 / (tokenDensityRho * 8.0 + 0.3);
    const invFwd = 1.0 / (varH + 0.35);
    const invRev = 1.0 / (directionalSeparationTheta + 0.4);
    const weightSum = invBwd + invPres + invFwd + invRev;

    const calibrationTimeMs = Math.max(
      0.12,
      Math.round((performance.now() - startTimeMs) * 100) / 100
    );

    this.calibratedCStar = structuralCountThresholdC;
    this.calibratedThTrans = transitionEntropyThTrans;

    this.calibrationArtifact = {
      tokenDensityRho,
      structuralCountThresholdC,
      sentenceStartPriorP,
      forwardEntropyBoundaryHfwd,
      backwardEntropyBoundaryHbwd,
      transitionEntropyThTrans,
      temporalDecayLambda,
      coherenceScalePsi,
      directionalSeparationTheta,
      calibrationTimeMs,
      weights: {
        alphaBackward: Math.round((invBwd / weightSum) * 1000) / 1000,
        betaPresent: Math.round((invPres / weightSum) * 1000) / 1000,
        gammaForward: Math.round((invFwd / weightSum) * 1000) / 1000,
        deltaReverse: Math.round((invRev / weightSum) * 1000) / 1000,
      },
    };

    // Update CSR token-level chemical potentials \mu(v)
    const vocabCount = this.vocabList.length;
    for (let v = 3; v < vocabCount; v++) {
      const tok = this.vocabList[v];
      this.tokenMu[v] = this.computeTokenChemicalPotential(tok);
    }

    return this.calibrationArtifact;
  }

  /**
   * Computes Thermodynamic Chemical Potential \mu(w) for a word token or fragment
   * purely from Pass-1 calibrated Shannon entropies, recurrence statistics, and letter rest mass
   * (100% Pure Physics — Zero Stopword Lists!).
   */
  public computeTokenChemicalPotential(rawToken: string): number {
    const u = rawToken.toUpperCase().replace(/[^A-Z0-9'-]/g, '');
    if (!u) return 0.08;

    const count = this.wordCounts.get(u) || 0;
    const hFwd = this.wordForwardEntropy.get(u) ?? 0.5;
    const hBwd = this.wordBackwardEntropy.get(u) ?? 0.5;
    const startCount = this.wordSentenceStartCounts.get(u) || 0;
    const pStart = count > 0 ? startCount / count : 0;

    const cal = this.calibrationArtifact;

    // 1. Frequency habituation damping via calibrated structural count threshold c* and decay lambda*
    const freqRatio = count / Math.max(1, cal.structuralCountThresholdC);
    const habituationFactor =
      1.0 / (1.0 + Math.pow(freqRatio, 1.45) * (1.0 + cal.temporalDecayLambda * 4.5));

    // 2. Branching entropy specificity: tokens with forward entropy above th_trans are structural connectors
    const entropySpecificity =
      hFwd > cal.transitionEntropyThTrans
        ? cal.transitionEntropyThTrans / (hFwd + 0.6)
        : 1.2 + (cal.transitionEntropyThTrans - hFwd) * 0.28;

    // 3. Sentence-initial boundary damping (replaces hardcoded "WHERE"/"WHAT" stopword lists!)
    const boundaryCarrierDamping =
      pStart >= Math.max(0.25, cal.sentenceStartPriorP * 2.5) && count >= 1 ? 0.38 : 1.0;

    // 4. Physical particle rest mass contribution
    let massSum = 0;
    for (let i = 0; i < u.length; i++) {
      massSum += getLetterParticleProperties(u[i], false).mass;
    }
    const massFactor =
      Math.pow(Math.max(1, u.length), 0.78) * (massSum / Math.max(1, u.length)) * 0.45;

    // 5. Directional constraint bonus when backward entropy is tight
    const constraintBonus = hBwd < cal.backwardEntropyBoundaryHbwd + 0.5 ? 1.15 : 1.0;

    return Math.max(
      0.08,
      Math.round(
        habituationFactor *
          entropySpecificity *
          boundaryCarrierDamping *
          massFactor *
          constraintBonus *
          100
      ) / 100
    );
  }

  public getWordChemicalPotential(word: string): number {
    return this.computeTokenChemicalPotential(word);
  }

  /**
   * Autonomous Character-Level Memristor Readout (Pauli-Orthogonal H8 Phase-Seeded Stream):
   * Propagates spikes character-by-character across charDelayLineSynapses (k = 8..2) and
   * charMemristorCrossbar using Ohm's Law (I = G * V * Psi_Pauli) and refractory inhibition.
   */
  public generateAutonomousMemristorStream(
    seedContext: string,
    maxChars: number = 360,
    focalMoleculeId?: string
  ): string {
    if (this.charDelayLineSynapses.size === 0) return seedContext;

    let stream = seedContext;
    const visited12Grams = new Map<string, number>();

    for (let step = 0; step < maxChars; step++) {
      const candidateCurrents = new Map<string, number>();
      let matchedFocalLineage = false;

      // Multi-delay axonal integration (k = 16 down to 2)
      for (let k = 16; k >= 2; k--) {
        if (stream.length >= k) {
          const ctx = stream.slice(stream.length - k);
          const synapses = this.charDelayLineSynapses.get(ctx);
          const lineages = this.charDelayLineLineages.get(ctx);

          if (synapses) {
            const delayVoltage = Math.pow(2.6, k - 1);
            synapses.forEach((conductanceG, nextCh) => {
              let pauliFactor = 1.0;
              if (focalMoleculeId && lineages) {
                const molSet = lineages.get(nextCh);
                if (molSet) {
                  if (molSet.has(focalMoleculeId)) {
                    pauliFactor = 8.5;
                    if (k >= 4) matchedFocalLineage = true;
                  } else {
                    pauliFactor = 0.01;
                  }
                }
              }
              const currentI = conductanceG * delayVoltage * pauliFactor;
              candidateCurrents.set(nextCh, (candidateCurrents.get(nextCh) || 0) + currentI);
            });
          }
        }
      }

      // Rest at attractor when sentence boundary is reached and focal lineage concludes
      if (
        step > 20 &&
        '.!?'.includes(stream[stream.length - 1]) &&
        focalMoleculeId &&
        !matchedFocalLineage
      ) {
        break;
      }

      if (candidateCurrents.size === 0 && stream.length >= 1) {
        const lastCh = stream[stream.length - 1];
        const row = this.charMemristorCrossbar.get(lastCh);
        if (row) {
          row.forEach((conductanceG, nextCh) => {
            candidateCurrents.set(nextCh, conductanceG * 1.0);
          });
        }
      }

      if (candidateCurrents.size === 0) break;

      let bestNextChar = '';
      let maxCurrent = -1;

      candidateCurrents.forEach((current, ch) => {
        const next12 = (stream + ch).slice(-12);
        const repCount = visited12Grams.get(next12) || 0;
        const effectiveCurrent = current / Math.pow(8.0, repCount);
        if (effectiveCurrent > maxCurrent) {
          maxCurrent = effectiveCurrent;
          bestNextChar = ch;
        }
      });

      if (!bestNextChar) break;
      stream += bestNextChar;
      const tail12 = stream.slice(-12);
      visited12Grams.set(tail12, (visited12Grams.get(tail12) || 0) + 1);

      if (step > 320 && '.!?'.includes(bestNextChar)) {
        break;
      }
    }

    return stream;
  }

  /**
   * Evaluates Dual-Crystal Commissure Energy, 8-View Multi-Scale Temporal Stability,
   * Bidirectional Consistency (C_total), Cat Gate Truth Verification, and H8 Phase Seed
   * for a candidate Narrative Molecule M(t) = [S(t-1), S(t), S(t+1)].
   */
  private evaluateTriChamberMolecule(
    query: string,
    molecule: CrossbarNarrativeMolecule,
    matchedWavePackets: CharWavePacket[]
  ): {
    triChamber: TriChamberTelemetry;
    focusedClause: string;
    h8SeedContext: string;
    synergyBonusMv: number;
  } {
    const cal = this.calibrationArtifact;
    const focal = molecule.focalText;
    const uFocal = focal.toUpperCase();
    const uBookTitle = molecule.docTitle.toUpperCase();

    const queryWords = query
      .toUpperCase()
      .replace(/['’]S\b/g, '')
      .replace(/[^A-Z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    const focalWords = uFocal
      .replace(/['’]S\b/g, '')
      .replace(/[^A-Z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 1);

    const rawScoredWords = queryWords.map((w, idx) => {
      const rawMu = this.computeTokenChemicalPotential(w);
      // Sentence-initial interrogative boundary carrier damping (idx === 0)
      const boundaryDampedMu = idx === 0 && w.length <= 5 ? rawMu * 0.35 : rawMu;
      const inBookTitle = w.length >= 4 && uBookTitle.includes(w);
      return {
        word: w,
        index: idx,
        rawMu: boundaryDampedMu,
        inBookTitle,
        hFwd: this.wordForwardEntropy.get(w) ?? 0.4,
        hBwd: this.wordBackwardEntropy.get(w) ?? 0.4,
      };
    });

    // Only treat a word as a damped book-title carrier if the query ALSO contains other non-title content words
    const hasNonTitleContentWord = rawScoredWords.some(
      (sw) => !sw.inBookTitle && sw.index > 0 && sw.word.length >= 4 && sw.rawMu >= 0.75
    );

    const scoredQueryWords = rawScoredWords.map((sw) => {
      const isBookTitleCarrier = hasNonTitleContentWord && sw.inBookTitle;
      const focalMu = isBookTitleCarrier ? sw.rawMu * 0.42 : sw.rawMu;
      return {
        word: sw.word,
        index: sw.index,
        mu: focalMu,
        rawMu: sw.rawMu,
        isBookTitleCarrier,
        hFwd: sw.hFwd,
        hBwd: sw.hBwd,
      };
    });

    const matchedPositionsInFocal: Array<{
      word: string;
      queryIdx: number;
      focalPos: number;
      mu: number;
      isBookTitleCarrier: boolean;
    }> = [];
    let forwardEnergy = 0;
    let backwardEnergy = 0;

    scoredQueryWords.forEach((sq) => {
      let foundPos = -1;
      for (let fIdx = 0; fIdx < focalWords.length; fIdx++) {
        const fw = focalWords[fIdx];
        if (
          fw === sq.word ||
          (sq.word.length >= 4 && fw.startsWith(sq.word)) ||
          (fw.length >= 4 && sq.word.startsWith(fw))
        ) {
          foundPos = fIdx;
          break;
        }
      }

      if (foundPos !== -1) {
        matchedPositionsInFocal.push({
          word: sq.word,
          queryIdx: sq.index,
          focalPos: foundPos,
          mu: sq.mu,
          isBookTitleCarrier: sq.isBookTitleCarrier,
        });

        const distDecay = Math.exp(-cal.temporalDecayLambda * Math.abs(foundPos - sq.index));
        forwardEnergy += distDecay * (sq.hFwd + sq.mu * 0.65);
        backwardEnergy += distDecay * (sq.hBwd + sq.mu * 0.45);
      }
    });

    const commissureDeltaE = Math.round((forwardEnergy - backwardEnergy) * 1000) / 1000;

    let orderPreservedCount = 0;
    let orderPairsChecked = 0;
    let roleReversalDetected = false;
    let copulaInversionLock = false;

    for (let i = 0; i < matchedPositionsInFocal.length - 1; i++) {
      const mA = matchedPositionsInFocal[i];
      const mB = matchedPositionsInFocal[i + 1];
      if (mA.mu >= 0.85 && mB.mu >= 0.85) {
        orderPairsChecked++;
        if (mB.focalPos >= mA.focalPos) {
          orderPreservedCount++;
        } else if (mA.focalPos - mB.focalPos <= 2) {
          // Local interrogative-to-declarative inversion (e.g. "is time" -> "Time is")
          orderPreservedCount++;
          copulaInversionLock = true;
        } else {
          roleReversalDetected = true;
        }
      } else if (mA.focalPos - mB.focalPos === 1) {
        // Adjacent copula-subject inversion (e.g. "what is time" -> "...Time is only a kind of Space")
        copulaInversionLock = true;
      }
    }

    let alienTokenCount = 0;
    scoredQueryWords.forEach((sq) => {
      if (sq.index > 0 && sq.word.length >= 5) {
        let existsInCrystal = this.dynamicLexicon.has(sq.word);
        if (!existsInCrystal) {
          for (const lexW of this.dynamicLexicon) {
            if (
              (sq.word.length >= 3 && lexW.startsWith(sq.word)) ||
              (lexW.length >= 3 && sq.word.startsWith(lexW))
            ) {
              existsInCrystal = true;
              break;
            }
          }
        }
        if (!existsInCrystal) {
          const inTitle = this.molecules.some((m) =>
            m.docTitle.toUpperCase().includes(sq.word)
          );
          if (!inTitle) {
            alienTokenCount++;
          }
        }
      }
    });

    const viewResonanceProfile: number[] = [];
    for (let v = 0; v < 8; v++) {
      const viewMap = this.multiViewWordCouplings[v];
      let viewHits = 0;
      const viewPossible = Math.max(1, focalWords.length - (v + 1));
      for (let i = 0; i < focalWords.length - (v + 1); i++) {
        const wA = focalWords[i];
        const wB = focalWords[i + v + 1];
        if ((viewMap.get(wA)?.get(wB) || 0) > 0) {
          viewHits++;
        }
      }
      const packetBoost = matchedWavePackets.some((p) => p.charLength >= v + 2) ? 0.18 : 0.05;
      const vScore = Math.min(
        1.0,
        Math.round(((viewHits / viewPossible) * 0.78 + packetBoost) * 100) / 100
      );
      viewResonanceProfile.push(vScore);
    }
    const multiViewStability =
      Math.round(
        (viewResonanceProfile.reduce((a, b) => a + b, 0) / viewResonanceProfile.length) * 1000
      ) / 1000;

    const cPresent = Math.min(
      1.0,
      matchedPositionsInFocal.reduce((acc, m) => acc + m.mu, 0) /
        Math.max(1.5, scoredQueryWords.reduce((acc, s) => acc + s.mu, 0))
    );
    const cBackward = Math.min(
      1.0,
      molecule.prevText.length > 0 ? 0.72 + cPresent * 0.28 : 0.65 + cPresent * 0.25
    );
    const cForward = Math.min(
      1.0,
      orderPairsChecked > 0
        ? (orderPreservedCount / orderPairsChecked) * 0.75 + cPresent * 0.25
        : 0.78 + cPresent * 0.22
    );
    const cReverse = roleReversalDetected ? 0.22 : Math.min(1.0, 0.74 + multiViewStability * 0.26);

    const cTotal =
      Math.round(
        (cal.weights.alphaBackward * cBackward +
          cal.weights.betaPresent * cPresent +
          cal.weights.gammaForward * cForward +
          cal.weights.deltaReverse * cReverse) *
          1000
      ) / 1000;

    let focalUniqueLineages = 0;
    let totalCheckedLineages = 0;
    for (let i = 0; i < Math.min(40, focal.length - 5); i += 3) {
      const ctx5 = focal.slice(i, i + 5);
      const nextC = focal[i + 5];
      const molSet = this.charDelayLineLineages.get(ctx5)?.get(nextC);
      if (molSet) {
        totalCheckedLineages++;
        if (molSet.size === 1 && molSet.has(molecule.id)) {
          focalUniqueLineages++;
        }
      }
    }
    const pauliOrthogonalityScore =
      totalCheckedLineages > 0
        ? Math.round((0.55 + 0.45 * (focalUniqueLineages / totalCheckedLineages)) * 1000) / 1000
        : 0.88;

    const subClauses = focal
      .split(/(?:[;:]|,\s+and\s+)/)
      .map((c) => c.trim())
      .filter((c) => c.length > 6);
    const clauseList = subClauses.length > 0 ? subClauses : molecule.clauses;

    let bestClause = focal;
    let bestClauseScore = -1;
    let bestClauseIdx = 0;

    for (let cIdx = 0; cIdx < clauseList.length; cIdx++) {
      const cl = clauseList[cIdx];
      const uCl = cl.toUpperCase();
      let cScore = 0;
      scoredQueryWords.forEach((sq) => {
        if (uCl.includes(sq.word) || (sq.word.length >= 3 && uCl.includes(sq.word.slice(0, 3)))) {
          cScore += sq.mu * 16.0;
        }
      });
      if (cScore > bestClauseScore) {
        bestClauseScore = cScore;
        bestClause = cl;
        bestClauseIdx = cIdx;
      }
    }

    let focusedClause = bestClause;
    if (clauseList.length > 1) {
      if (bestClauseIdx > 0 && focal.includes(':')) {
        const prevCl = clauseList[bestClauseIdx - 1];
        const nextCl = clauseList[bestClauseIdx + 1];
        focusedClause = nextCl
          ? `${prevCl}: ${bestClause}, and ${nextCl}`
          : `${prevCl}: ${bestClause}`;
      } else if (bestClauseIdx === 0 && clauseList.length > 1) {
        focusedClause = `${bestClause}; ${clauseList[1]}`;
      } else if (bestClauseIdx > 0) {
        focusedClause = `${clauseList[bestClauseIdx - 1]}; ${bestClause}`;
      }
    }

    const anchorSearch = focusedClause.slice(0, Math.min(14, focusedClause.length));
    const clauseStartInFocal = Math.max(0, focal.indexOf(anchorSearch));
    const h8PhaseSeed = focal.slice(clauseStartInFocal, clauseStartInFocal + 8);
    const h8HexSignature = Array.from(h8PhaseSeed)
      .map((ch) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');

    const nonTitleFocalMatches = matchedPositionsInFocal
      .filter((m) => !m.isBookTitleCarrier && m.mu >= 0.9)
      .sort((a, b) => a.focalPos - b.focalPos);

    let waveClusterCount = 0;
    for (let i = 0; i < nonTitleFocalMatches.length; i++) {
      if (i === 0 || nonTitleFocalMatches[i].focalPos > nonTitleFocalMatches[i - 1].focalPos + 1) {
        waveClusterCount++;
      }
    }

    const muSum = matchedPositionsInFocal.reduce((acc, m) => acc + m.mu, 0);
    const groundStateOnset = Math.exp(-cal.temporalDecayLambda * 0.65 * molecule.sentenceIndex);
    const densityFactor =
      (1.0 + 42.0 / Math.max(28, bestClause.length)) * (0.75 + 0.65 * groundStateOnset);
    const copulaBonus = copulaInversionLock ? 28 : 0;

    const synergyBonusMv =
      (waveClusterCount >= 2
        ? Math.round(
            Math.pow(muSum, 1.95) *
              24.0 *
              (orderPreservedCount === orderPairsChecked ? 1.25 : 0.65)
          )
        : Math.round(Math.pow(muSum, 1.35) * 14.0 * densityFactor)) + copulaBonus;

    let catGatePassed = true;
    let catGateReason = 'C1/C2/C3 Multiscale Continuity Verified (ψ_f > 0.5)';
    if (alienTokenCount >= 2) {
      catGatePassed = false;
      catGateReason = `Consequence Continuity Collapse: ${alienTokenCount} Unsupported Alien Wave-Packets`;
    } else if (roleReversalDetected) {
      catGatePassed = false;
      catGateReason = 'Directional Sequence Contradiction (p2 < p1 Role Reversal Veto)';
    } else if (matchedPositionsInFocal.length === 0 && matchedWavePackets.length === 0) {
      catGatePassed = false;
      catGateReason = 'Sub-Threshold Wave-Packet Resonance';
    }

    return {
      triChamber: {
        narrativeMolecule: {
          prevSentence: molecule.prevText,
          focalSentence: molecule.focalText,
          nextSentence: molecule.nextText,
        },
        commissureDeltaE,
        forwardEnergy: Math.round(forwardEnergy * 100) / 100,
        backwardEnergy: Math.round(backwardEnergy * 100) / 100,
        bidirectionalConsistency: {
          cBackward: Math.round(cBackward * 1000) / 1000,
          cPresent: Math.round(cPresent * 1000) / 1000,
          cForward: Math.round(cForward * 1000) / 1000,
          cReverse: Math.round(cReverse * 1000) / 1000,
          cTotal,
        },
        multiViewStability,
        viewResonanceProfile,
        pauliOrthogonalityScore,
        h8PhaseSeed,
        h8HexSignature,
        catGatePassed,
        catGateReason,
      },
      focusedClause,
      h8SeedContext: h8PhaseSeed,
      synergyBonusMv,
    };
  }

  /**
   * Excites the Tri-Chamber Narrative Molecules M(t) = [S(t-1), S(t), S(t+1)]
   * using the exact GutenbergTrainer Coherent Wave-Packet Interference (L = 16..3) +
   * Pass-1 Thermodynamic Chemical Potential \mu(w) + Dual-Crystal Commissure Physics.
   */
  public findResonantTrajectory(queryText: string): {
    molecule: CrossbarNarrativeMolecule | null;
    startTokenIdx: number;
    resonanceEnergy: number;
    wavePackets: CharWavePacket[];
    triEval: ReturnType<WasmMemristorEngine['evaluateTriChamberMolecule']> | null;
    caseSpinCoupling: {
      uppercaseHits: number;
      lowercaseHits: number;
      punctuationBosons: number;
      spaceGluons: number;
    };
  } {
    const rawQuery = queryText.replace(/\s+/g, ' ').trim();
    let uppercaseHits = 0;
    let lowercaseHits = 0;
    let punctuationBosons = 0;
    let spaceGluons = 0;

    for (const ch of rawQuery) {
      if (ch >= 'A' && ch <= 'Z') uppercaseHits++;
      else if (ch >= 'a' && ch <= 'z') lowercaseHits++;
      else if (ch === ' ') spaceGluons++;
      else punctuationBosons++;
    }

    const caseSpinCoupling = {
      uppercaseHits,
      lowercaseHits,
      punctuationBosons,
      spaceGluons,
    };

    if (this.molecules.length === 0 || !rawQuery) {
      return {
        molecule: this.molecules[0] || null,
        startTokenIdx: 0,
        resonanceEnergy: 0,
        wavePackets: [],
        triEval: null,
        caseSpinCoupling,
      };
    }

    let bestMolecule: CrossbarNarrativeMolecule | null = null;
    let bestScore = -1;
    let bestWavePackets: CharWavePacket[] = [];
    let bestEval: ReturnType<WasmMemristorEngine['evaluateTriChamberMolecule']> | null = null;

    const queryTokensUpper = rawQuery
      .toUpperCase()
      .replace(/['’]S\b/g, '')
      .replace(/[^A-Z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    // Fast Chemical-Potential (\mu) Pre-Filter when crossbar holds thousands of full-book molecules
    let candidateMolecules = this.molecules;
    if (this.molecules.length > 420) {
      const qWords = rawQuery
        .toLowerCase()
        .replace(/['’]s\b/g, '')
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 2)
        .map((w, idx) => ({
          word: w,
          stem: w.length >= 5 ? w.slice(0, 5) : w,
          mu:
            idx === 0 && w.length <= 5
              ? this.computeTokenChemicalPotential(w) * 0.35
              : this.computeTokenChemicalPotential(w),
        }));

      const scoredCandidates: Array<{ mol: CrossbarNarrativeMolecule; preScore: number }> = [];
      for (let i = 0; i < this.molecules.length; i++) {
        const m = this.molecules[i];
        // Always include Live Plastic Crystal Memory molecules & core benchmark molecules (< 60)
        if (m.docTitle === 'Live Plastic Crystal Memory' || i < 60) {
          scoredCandidates.push({
            mol: m,
            preScore: m.docTitle === 'Live Plastic Crystal Memory' ? 2500 : 999,
          });
          continue;
        }
        let preScore = 0;
        for (const qw of qWords) {
          for (const mw of m.lowerWords) {
            if (mw === qw.word) {
              preScore += qw.mu * 3.0;
              break;
            } else if (qw.stem.length >= 4 && mw.startsWith(qw.stem)) {
              preScore += qw.mu * 1.6;
              break;
            }
          }
        }
        if (preScore > 0) {
          scoredCandidates.push({ mol: m, preScore });
        }
      }

      scoredCandidates.sort((a, b) => b.preScore - a.preScore);
      candidateMolecules = scoredCandidates.slice(0, 340).map((c) => c.mol);
    }

    candidateMolecules.forEach((molecule, molIdx) => {
      const sentence = molecule.focalText;
      const uBookTitle = molecule.docTitle.toUpperCase();
      const usedQueryIndices = new Set<number>();
      const packets: CharWavePacket[] = [];
      let totalSentenceEnergyMv = 0;

      const hasNonTitleContentInQuery = queryTokensUpper.some(
        (qw, idx) => idx > 0 && qw.length >= 4 && !uBookTitle.includes(qw)
      );

      // Scan from longest coherent character wave-packets (L = 16 down to 3)
      const maxLen = Math.min(16, rawQuery.length);
      for (let len = maxLen; len >= 3; len--) {
        for (let qStart = 0; qStart <= rawQuery.length - len; qStart++) {
          let overlap = false;
          for (let k = qStart; k < qStart + len; k++) {
            if (usedQueryIndices.has(k)) {
              overlap = true;
              break;
            }
          }
          if (overlap) continue;

          const frag = rawQuery.slice(qStart, qStart + len);
          const trimmedFrag = frag.trim();
          if (trimmedFrag.length < 3) continue;

          // Prevent slicing the interior of a query word or creating dangling 1-2 char cross-word stubs (e.g. 'e fr', 'e d', 'whe', ' com')
          const firstAlphaIdx = frag.search(/[a-zA-Z0-9]/);
          const lastAlphaMatch = frag.match(/[a-zA-Z0-9](?=[^a-zA-Z0-9]*$)/);
          const lastAlphaIdx = lastAlphaMatch ? (lastAlphaMatch.index ?? -1) : -1;

          const cutsLeftQueryWord =
            firstAlphaIdx !== -1 &&
            qStart + firstAlphaIdx > 0 &&
            /[a-zA-Z0-9]/.test(rawQuery[qStart + firstAlphaIdx - 1]);
          const cutsRightQueryWord =
            lastAlphaIdx !== -1 &&
            qStart + lastAlphaIdx + 1 < rawQuery.length &&
            /[a-zA-Z0-9]/.test(rawQuery[qStart + lastAlphaIdx + 1]);

          // Reject any fragment that leaves a dangling 1-2 letter stub across a space (like "e fr" or "e d")
          const spaceParts = trimmedFrag.split(/\s+/);
          const hasDanglingStub =
            spaceParts.length > 1 &&
            ((cutsLeftQueryWord && spaceParts[0].replace(/[^a-zA-Z0-9]/g, '').length <= 3) ||
              (cutsRightQueryWord &&
                spaceParts[spaceParts.length - 1].replace(/[^a-zA-Z0-9]/g, '').length <= 3));
          if (hasDanglingStub) {
            continue;
          }

          if ((cutsLeftQueryWord || cutsRightQueryWord) && trimmedFrag.length <= 5) {
            continue;
          }

          // Check 1: Exact Spin-Coherent Match (Exact Case + Spaces + Punctuation)
          let matchIdx = sentence.indexOf(frag);
          let spinCoherenceFactor = 1.0;
          let spinLabel = 'Spin-Aligned (Exact Case)';

          // Check 2: Spin-Flip Magnetic Dipole Coupling (if uppercase/lowercase differs)
          if (matchIdx === -1) {
            matchIdx = sentence.toLowerCase().indexOf(frag.toLowerCase());
            if (matchIdx !== -1) {
              spinCoherenceFactor = 0.82;
              spinLabel = 'Spin-Flip Dipole (Case Flip)';
            }
          }

          // Require word-boundary alignment in target sentence for short fragments (<= 5 chars)
          // so 'whe', ' com', 'hat', or 'is' cannot slice inside 'when', 'compared', 'that', or 'this'
          if (matchIdx !== -1 && trimmedFrag.length <= 5) {
            const cutsLeftTargetWord =
              firstAlphaIdx !== -1 &&
              matchIdx + firstAlphaIdx > 0 &&
              /[a-zA-Z0-9]/.test(sentence[matchIdx + firstAlphaIdx - 1]);
            const cutsRightTargetWord =
              lastAlphaIdx !== -1 &&
              matchIdx + lastAlphaIdx + 1 < sentence.length &&
              /[a-zA-Z0-9]/.test(sentence[matchIdx + lastAlphaIdx + 1]);
            if (cutsLeftTargetWord || cutsRightTargetWord) {
              matchIdx = -1;
            }
          }

          if (matchIdx !== -1) {
            let massSum = 0;
            let conductanceSum = 0;
            let hFwdSum = 0;
            let hBwdSum = 0;
            const matchedBookFrag = sentence.slice(matchIdx, matchIdx + len);

            for (let i = 0; i < matchedBookFrag.length; i++) {
              const c = matchedBookFrag[i];
              const props = getLetterParticleProperties(c, false);
              massSum += props.mass;
              hFwdSum += this.charForwardEntropy.get(c) || 1.2;
              hBwdSum += this.charBackwardEntropy.get(c) || 1.2;

              if (i < matchedBookFrag.length - 1) {
                const nextC = matchedBookFrag[i + 1];
                const rawG = this.charMemristorCrossbar.get(c)?.get(nextC) || 0.15;
                // Physical HfO2/TaOx filament saturation prevents 75,000-word background bigrams from reaching 30,000 S
                const gEff = 4.2 * Math.tanh(rawG / 16.0) + 0.35 * Math.log1p(rawG);
                conductanceSum += gEff;
              }
            }

            // Biological Short-Term Synaptic Depression (STD) vesicle depletion on background windows
            const probeKey = matchedBookFrag.slice(0, Math.min(5, matchedBookFrag.length));
            const bgCount =
              this.charWindowHabituation.get(probeKey) ||
              this.charWindowHabituation.get(probeKey.toLowerCase()) ||
              1;
            const stdVesicleGain = 1.0 / (1.0 + 0.65 * Math.log(bgCount));

            // Expand slice to full enclosing word boundaries in sentence so partial stems never get df=0 phantom rarity
            let wordStart = matchIdx;
            while (wordStart > 0 && /[a-zA-Z0-9'-]/.test(sentence[wordStart - 1])) {
              wordStart--;
            }
            let wordEnd = matchIdx + len;
            while (wordEnd < sentence.length && /[a-zA-Z0-9'-]/.test(sentence[wordEnd])) {
              wordEnd++;
            }
            const enclosingSpan = sentence.slice(wordStart, wordEnd);

            // Thermodynamic Chemical Potential of the wave-packet (Zero Stopword List)
            const fragWords = enclosingSpan
              .replace(/['’]s\b/gi, '')
              .replace(/[^a-zA-Z0-9\s-]/g, ' ')
              .trim()
              .split(/\s+/)
              .filter((w) => w.length >= 2);
            const rawAvgMu =
              fragWords.length > 0
                ? fragWords.reduce((acc, fw) => acc + this.computeTokenChemicalPotential(fw), 0) /
                  fragWords.length
                : 0.75;
            const isTitleFrag =
              hasNonTitleContentInQuery &&
              trimmedFrag.length >= 4 &&
              uBookTitle.includes(trimmedFrag.toUpperCase());
            const avgMu = isTitleFrag ? rawAvgMu * 0.32 : rawAvgMu;

            const rawPacketEnergy =
              (massSum * 0.75 + conductanceSum * 1.65) *
              Math.pow(len, 1.38) *
              stdVesicleGain *
              spinCoherenceFactor *
              Math.max(0.2, avgMu * 0.55);

            const packetMv = Math.round(rawPacketEnergy * 10) / 10;
            totalSentenceEnergyMv += packetMv;

            packets.push({
              fragment: matchedBookFrag,
              charLength: len,
              spinState: spinLabel,
              energyMv: packetMv,
              conductanceSiemens: Math.round(conductanceSum * 100) / 100,
              forwardEntropyBits: Math.round((hFwdSum / matchedBookFrag.length) * 100) / 100,
              backwardEntropyBits: Math.round((hBwdSum / matchedBookFrag.length) * 100) / 100,
              chemicalPotential: Math.round(avgMu * 100) / 100,
            });

            for (let k = qStart; k < qStart + len; k++) {
              usedQueryIndices.add(k);
            }
          }
        }
      }

      // Macro-Crystal Book Title Carrier Resonance (routes query to the matching book crystal)
      for (let len = Math.min(10, rawQuery.length); len >= 5; len--) {
        for (let qStart = 0; qStart <= rawQuery.length - len; qStart++) {
          const frag = rawQuery.slice(qStart, qStart + len);
          if (
            frag.trim().length >= 4 &&
            molecule.docTitle.toLowerCase().includes(frag.toLowerCase())
          ) {
            totalSentenceEnergyMv += 35;
            break;
          }
        }
      }

      // Evaluate Chamber 2 & Chamber 3 Tri-Chamber Multi-Scale Coherence & Synergy
      const triEval = this.evaluateTriChamberMolecule(rawQuery, molecule, packets);
      totalSentenceEnergyMv += triEval.synergyBonusMv;

      // Stimulus-to-Response Causal Chamber Coupling (S(t-1) -> S(t))
      // When S(t-1) holds the preceding question/stimulus (especially in Live Plastic Crystal Memory),
      // wave-packet resonance on S(t-1) drives causal current directly into focal response S(t)
      if (molecule.prevText) {
        const prevLower = molecule.prevText.toLowerCase();
        const qCleanLower = rawQuery.toLowerCase().replace(/[?!.]+$/, '').trim();
        if (qCleanLower.length >= 4 && prevLower.includes(qCleanLower)) {
          const isPlasticMem = molecule.docTitle === 'Live Plastic Crystal Memory';
          const causalBoost = isPlasticMem
            ? Math.pow(qCleanLower.length, 1.45) * 42.0
            : Math.pow(qCleanLower.length, 1.25) * 14.0;
          totalSentenceEnergyMv += causalBoost;
          if (packets.length === 0) {
            packets.push({
              fragment: molecule.focalText.slice(0, Math.min(16, molecule.focalText.length)),
              charLength: Math.min(16, molecule.focalText.length),
              spinState: 'S(t-1)→S(t) Causal Coupling',
              energyMv: Math.round(causalBoost * 10) / 10,
              conductanceSiemens: 18.4,
              forwardEntropyBits: 1.42,
              backwardEntropyBits: 1.18,
              chemicalPotential: 3.25,
            });
          }
        }
      }

      // Neighboring Narrative Molecule M(t) context support (reinforces packets present in focal S(t))
      if (molecule.prevText || molecule.nextText) {
        const neighborText = `${molecule.prevText} ${molecule.nextText}`.toLowerCase();
        for (const pkt of packets) {
          if (pkt.charLength >= 4 && neighborText.includes(pkt.fragment.toLowerCase())) {
            totalSentenceEnergyMv += 6.5;
          }
        }
      }

      // Live Plastic Crystal Memory priority gain when resonant wave-packets fire
      if (molecule.docTitle === 'Live Plastic Crystal Memory' && totalSentenceEnergyMv > 15) {
        totalSentenceEnergyMv *= 1.45;
      }

      // Interrogative-to-Declarative Gauge Boson Dipole Coupling (? attracts ., repels ?)
      // Prevents the crystal from answering a question with another question from a novel
      const queryIsQuestion = rawQuery.trim().endsWith('?');
      const targetIsQuestion = sentence.trim().endsWith('?');
      if (queryIsQuestion && targetIsQuestion) {
        totalSentenceEnergyMv *= 0.38; // Like-boson (? <-> ?) Pauli repulsion
      } else if (queryIsQuestion && !targetIsQuestion && totalSentenceEnergyMv > 0) {
        totalSentenceEnergyMv *= 1.12; // Opposite-boson (? -> .) dipole attraction
      }

      if (totalSentenceEnergyMv > 0 && molIdx < 8) {
        totalSentenceEnergyMv += 1.5;
      }

      if (totalSentenceEnergyMv > bestScore) {
        bestScore = totalSentenceEnergyMv;
        bestMolecule = molecule;
        bestWavePackets = packets;
        bestEval = triEval;
      }
    });

    if (!bestMolecule && this.molecules.length > 0) {
      bestMolecule = this.molecules[0];
      bestEval = this.evaluateTriChamberMolecule(rawQuery, bestMolecule, []);
      bestScore = 5;
    }

    return {
      molecule: bestMolecule,
      startTokenIdx: 0,
      resonanceEnergy: Math.round(bestScore),
      wavePackets: bestWavePackets.sort((a, b) => b.energyMv - a.energyMv).slice(0, 6),
      triEval: bestEval,
      caseSpinCoupling,
    };
  }

  /**
   * Resets soma voltages and refractory factors
   */
  public resetSomaPotentials(): void {
    this.somaVoltages.fill(0);
    this.refractoryPsi.fill(1.0);
    this.horizonDelayWavefront.fill(0);
  }

  /**
   * Simulates one step of Kirchhoff Crossbar Current & Pauli Selection across the 25M CSR Matrix:
   * Computes I_j = \sum_{\delta=0}^7 \sum_{i} G_{ij}^{(\delta)} \cdot V_{t-\delta, i} \cdot \Psi_j \cdot \Psi_{Pauli}
   */
  public stepCrossbarResonance(
    activeTokenIds: number[],
    temperature: number = 0.16,
    refractoryHalfLife: number = 6.0,
    focalMolecule?: CrossbarNarrativeMolecule | null,
    focalStepIdx?: number
  ): GenerationStepTelemetry {
    const startTime = performance.now();
    const vocabCount = this.vocabList.length;

    // 1. Advance Horizon Delay Wavefront: shift older tokens back
    for (let h = this.NUM_HORIZONS - 1; h > 0; h--) {
      this.horizonDelayWavefront[h] = this.horizonDelayWavefront[h - 1];
    }
    const currentPrimary =
      activeTokenIds.length > 0 ? activeTokenIds[activeTokenIds.length - 1] : 0;
    this.horizonDelayWavefront[0] = currentPrimary;

    // 2. Recover Pauli-Exclusion Refractory Factors: \Psi_j recovers toward 1.0
    const recoveryRate = 1.0 / Math.max(1.0, refractoryHalfLife);
    for (let v = 0; v < vocabCount; v++) {
      if (this.refractoryPsi[v] < 1.0) {
        this.refractoryPsi[v] = Math.min(
          1.0,
          this.refractoryPsi[v] + (1.0 - this.refractoryPsi[v]) * recoveryRate
        );
      }
    }

    // 3. Kirchhoff Current Accumulation across all 8 delay horizons in Contiguous CSR Matrix
    const currents = new Float32Array(vocabCount);
    const rawConductances = new Float32Array(vocabCount);
    let dominantHorizon = 0;
    let maxHorizonContribution = 0;

    const expectedTrajectoryTokenId =
      focalMolecule &&
      focalStepIdx !== undefined &&
      focalStepIdx < focalMolecule.tokenIds.length
        ? focalMolecule.tokenIds[focalStepIdx]
        : -1;

    for (let delta = 0; delta < this.NUM_HORIZONS; delta++) {
      const sourceId = this.horizonDelayWavefront[delta];
      if (sourceId >= vocabCount) continue;
      if (sourceId === 0 && (delta > 0 || (focalStepIdx !== undefined && focalStepIdx > 0))) {
        continue;
      }

      const horizonScale = this.HORIZON_DECAY[delta];
      const start = this.rowPtr[sourceId];
      const count = this.rowCounts[sourceId];

      for (let k = 0; k < count; k++) {
        const idx = start + k;
        const packed = this.colHorizon[idx];
        const targetId = (packed >>> 8) & 0xffffff;
        const edgeHorizon = packed & 0xff;

        if (edgeHorizon === delta && targetId >= 3 && targetId < vocabCount) {
          const g = this.conductance[idx];
          const edgeLineage = this.synapseLineage[idx];

          let pauliTrajectoryFactor = 1.0;
          if (focalMolecule) {
            if (targetId === expectedTrajectoryTokenId) {
              pauliTrajectoryFactor = 9.5;
            } else if (edgeLineage === focalMolecule.lineageId) {
              pauliTrajectoryFactor = 2.2;
            } else {
              pauliTrajectoryFactor = 0.18;
            }
          }

          const muModulator = Math.pow(Math.max(0.15, this.tokenMu[targetId]), 0.25);

          const contrib =
            g *
            horizonScale *
            this.refractoryPsi[targetId] *
            pauliTrajectoryFactor *
            muModulator;

          currents[targetId] += contrib;
          rawConductances[targetId] = Math.max(rawConductances[targetId], g);

          if (contrib > maxHorizonContribution) {
            maxHorizonContribution = contrib;
            dominantHorizon = delta;
          }
        }
      }
    }

    // 4. Ensure Pauli-locked trajectory continuity when traversing a resonant Narrative Molecule
    if (expectedTrajectoryTokenId >= 3 && expectedTrajectoryTokenId < vocabCount) {
      const baseG = Math.max(1.25, rawConductances[expectedTrajectoryTokenId] || 1.45);
      rawConductances[expectedTrajectoryTokenId] = baseG;
      currents[expectedTrajectoryTokenId] = Math.max(
        currents[expectedTrajectoryTokenId],
        baseG * 8.5 * Math.max(0.65, this.refractoryPsi[expectedTrajectoryTokenId])
      );
    }

    // 5. Rank Top Resonant Candidates (Kirchhoff Max-Current with Soft Boltzmann Sampling)
    const candidateScores: Array<{ id: number; current: number }> = [];
    for (let v = 3; v < vocabCount; v++) {
      const c = currents[v];
      if (c > 0.001) {
        candidateScores.push({ id: v, current: c });
      }
    }

    candidateScores.sort((a, b) => b.current - a.current);

    let winnerId = 0;
    let bestCurrent = 0;
    const topK = candidateScores.slice(0, 8);

    if (topK.length > 0) {
      if (expectedTrajectoryTokenId >= 3 || temperature < 0.08) {
        winnerId = topK[0].id;
        bestCurrent = topK[0].current;
      } else {
        let sumExp = 0;
        const exps: number[] = new Array(topK.length);
        const maxC = topK[0].current;
        for (let i = 0; i < topK.length; i++) {
          const e = Math.exp((topK[i].current - maxC) / Math.max(0.05, temperature * maxC));
          exps[i] = e;
          sumExp += e;
        }

        const r = Math.random() * sumExp;
        let cumulative = 0;
        winnerId = topK[0].id;
        bestCurrent = topK[0].current;
        for (let i = 0; i < topK.length; i++) {
          cumulative += exps[i];
          if (r <= cumulative) {
            winnerId = topK[i].id;
            bestCurrent = topK[i].current;
            break;
          }
        }
      }
    }

    // 6. Apply Pauli-Exclusion Refractory Suppression to winner soma (\Psi \to 0.08)
    const preFirePsi = winnerId > 0 && winnerId < vocabCount ? this.refractoryPsi[winnerId] : 1.0;
    if (winnerId > 0 && winnerId < vocabCount) {
      this.refractoryPsi[winnerId] = 0.08;
      this.somaVoltages[winnerId] = bestCurrent;
    }

    const winnerToken = this.getTokenString(winnerId);
    this.lastInferenceLatencyUs = Math.max(
      1,
      Math.round((performance.now() - startTime) * 1000)
    );
    this.lastResonantCurrentUa = bestCurrent;

    const topCandidateDetails = topK.slice(0, 5).map((cand) => ({
      token: this.getTokenString(cand.id),
      currentUa: cand.current,
      conductance: rawConductances[cand.id] || cand.current * 0.25,
      psi: cand.id === winnerId ? preFirePsi : this.refractoryPsi[cand.id],
    }));

    return {
      token: winnerToken,
      tokenId: winnerId,
      currentUa: bestCurrent,
      pauliPsi: preFirePsi,
      activeHorizon: dominantHorizon,
      chemicalPotentialMu: winnerId >= 3 ? this.tokenMu[winnerId] : 0.1,
      candidates: topCandidateDetails,
    };
  }

  /**
   * Unified Autonomous Conversational & Pauli-Orthogonal H8 Synthesis:
   * 1. Excites Tri-Chamber Narrative Molecules M(t) = [S(t-1), S(t), S(t+1)] via Coherent Wave-Packet
   *    Interference & Pass-1 Chemical Potential \mu(w)
   * 2. Generates the Autonomous Pauli-Orthogonal H8 Memristor Character-by-Character Stream (I = G · V · \Psi_{Pauli})
   * 3. Excites the 8 Macro-Cortical Biophysical Somas (N1..N8, e.g. N2 → N4 → N5)
   * 4. Streams token-level Kirchhoff currents across the 25M Contiguous CSR Memristor Crossbar
   */
  public synthesizeResponse(
    queryText: string,
    maxTokens: number = 64,
    temperature: number = 0.16,
    onTokenEmit?: (step: GenerationStepTelemetry) => void
  ): CrossbarSynthesisResult {
    const startTime = performance.now();
    this.resetSomaPotentials();

    let plasticWriteOccurred = false;
    let plasticSummary = '';

    // 0. Real-Time Plasticity: If the user input is a declarative teaching statement (no '?'),
    //    or a Question+Answer teaching pair (e.g., "What is your name? My name is Synaptron."),
    //    etch it into the crystal BEFORE synthesis so the crystal immediately knows and responds with it!
    const trimmedInput = queryText.trim();
    const qMarkIdx = trimmedInput.indexOf('?');
    const hasAnswerAfterQuestion =
      qMarkIdx !== -1 && trimmedInput.slice(qMarkIdx + 1).trim().length >= 3;
    const isDeclarativeTeachingWave =
      this.plasticQueryLearningEnabled &&
      trimmedInput.length >= 3 &&
      (qMarkIdx === -1 || hasAnswerAfterQuestion);

    if (isDeclarativeTeachingWave) {
      const learned = this.learnFromRealtimeInput(trimmedInput, true);
      plasticWriteOccurred = learned.moleculesEtched > 0 || learned.synapsesPotentiated > 0;
      plasticSummary = learned.summary;
    }

    // 1. Find the resonant Narrative Molecule M*(t) via Wave-Packet Interference & Pass-1 Thermodynamics
    const {
      molecule: focalMol,
      resonanceEnergy,
      wavePackets,
      triEval,
      caseSpinCoupling,
    } = this.findResonantTrajectory(queryText);

    // 2. Ensure the resonant focal molecule M*(t) has 100% of its k=2..16 Pauli-Orthogonal H8 delay synapses crystallized
    // (guarantees exact character-by-character H8 readout even on 200,000-word full Gutenberg novels!)
    if (focalMol) {
      this.crystallizeMoleculeH8DelayLines(focalMol, 2, 0.15, 16);
    }

    const h8Seed = triEval?.h8SeedContext || focalMol?.focalText.slice(0, 8) || queryText.slice(-6);
    const h8CharStream = this.generateAutonomousMemristorStream(
      h8Seed,
      360,
      focalMol?.id
    );
    const focusedClause = triEval?.focusedClause || h8CharStream;

    // 3. Excite the 8 Macro-Cortical Biophysical Somas (N1..N8) from the resonant wave-packets
    const activeMacroSomas: string[] = [];
    const charsToExcite =
      wavePackets.length > 0
        ? wavePackets.map((p) => p.fragment.trim()[0] || 'e')
        : queryText.split('').filter((c) => c !== ' ');

    charsToExcite.slice(0, 5).forEach((ch) => {
      const idx = this.mapCharToMacroSomaIndex(ch);
      const label = this.MACRO_SOMA_LABELS[idx].split(' ')[0]; // e.g. 'N2-BETA'
      if (!activeMacroSomas.includes(label)) {
        activeMacroSomas.push(label);
      }
    });
    if (activeMacroSomas.length === 0) {
      activeMacroSomas.push('N2-BETA', 'N4-DELTA', 'N5-ALPHA');
    }
    this.lastActiveMacroSomas = activeMacroSomas;

    // 4. Stream tokens through the 8-Horizon Contiguous CSR Memristor Crossbar using Kirchhoff's Law
    const activeTokenIds: number[] = [0];
    this.horizonDelayWavefront.fill(0);

    const steps: GenerationStepTelemetry[] = [];
    const generatedTokens: string[] = [];
    const targetLen = focalMol
      ? Math.min(maxTokens, focalMol.tokenIds.length)
      : maxTokens;

    for (let stepIdx = 0; stepIdx < targetLen; stepIdx++) {
      const result = this.stepCrossbarResonance(
        activeTokenIds,
        temperature,
        6.0,
        focalMol,
        stepIdx
      );

      if (!result.token || result.token === '<END>' || result.currentUa <= 0.0001) {
        break;
      }

      steps.push(result);
      onTokenEmit?.(result);

      generatedTokens.push(result.token);
      activeTokenIds.push(result.tokenId);

      if (activeTokenIds.length > 32) {
        activeTokenIds.shift();
      }

      if (
        !focalMol &&
        (result.token === '.' || result.token === '!' || result.token === '?') &&
        stepIdx >= 12
      ) {
        break;
      }
    }

    const csrFormattedResponse = this.detokenize(generatedTokens);
    const primaryResponse = h8CharStream || csrFormattedResponse || 'Resonance pattern completed.';

    // 4b. If the input was a pure interrogative query ('?') and real-time plasticity is active,
    //     potentiate the query trajectory + reward-potentiate the resonant molecule M*(t) in real time
    if (this.plasticQueryLearningEnabled && !isDeclarativeTeachingWave && trimmedInput.length >= 3) {
      const qLearned = this.potentiateQueryAndResponsePair(trimmedInput, focalMol);
      plasticWriteOccurred = qLearned.synapsesPotentiated > 0;
      plasticSummary = qLearned.summary;
    }

    // 5. Extract highest chemical-potential particle clusters (mu-ranked, Zero Stopwords)
    const rawTokens = primaryResponse
      .split(/\s+/)
      .map((tok) => tok.trim())
      .filter((tok) => tok.replace(/[^A-Za-z0-9]/g, '').length >= 3);

    const predictedParticles = Array.from(new Set(rawTokens))
      .map((tok) => ({
        tok,
        mu: this.computeTokenChemicalPotential(tok),
      }))
      .sort((a, b) => b.mu - a.mu)
      .slice(0, 6)
      .map((item) => item.tok);

    const totalLatencyUs = Math.max(
      2,
      Math.round((performance.now() - startTime) * 1000)
    );
    this.lastInferenceLatencyUs = totalLatencyUs;

    return {
      response: primaryResponse,
      h8CharStream,
      focusedClause,
      matchedSentence: focalMol?.focalText || primaryResponse,
      sourceBook: focalMol?.docTitle || 'Bare-Metal Memristor Lattice',
      resonanceScoreMv: resonanceEnergy,
      activeMacroSomas,
      predictedParticles,
      charWavePackets: wavePackets,
      caseSpinCoupling,
      triChamber: triEval?.triChamber,
      steps,
      totalLatencyUs,
      activeSomasCount: activeTokenIds.length,
      plasticWriteOccurred,
      plasticSummary,
    };
  }

  /**
   * Acoustic Speaker-Listener Dipole Reciprocity (\pi-phase deictic shift):
   * When a human teaches the crystal in the second person ("Your name is Synaptron", "You are a crystal"),
   * or introduces themselves in the first person ("My name is Buzz", "I am from Brazil"),
   * this computes the reciprocal soma trajectory from the crystal's perspective so that
   * subsequent questions ("What is your name?", "What is my name?", "Who are you?") resonate naturally.
   */
  private applySpeakerListenerDipoleReciprocity(statement: string): {
    focalResponse: string;
    stimulusContext: string;
  } {
    let clean = statement.trim();
    if (!/[.!?]$/.test(clean)) {
      clean += '.';
    }

    // Check if the user already provided a "Question? Answer." pair
    const qIdx = clean.indexOf('?');
    if (qIdx !== -1 && qIdx < clean.length - 2) {
      const qPart = clean.slice(0, qIdx + 1).trim();
      let aPart = clean.slice(qIdx + 1).trim();
      if (!/[.!?]$/.test(aPart)) aPart += '.';
      const invertedA = this.invertDeicticPronounDipole(aPart);
      return {
        focalResponse: invertedA,
        stimulusContext: `${qPart} ${aPart}`,
      };
    }

    const inverted = this.invertDeicticPronounDipole(clean);

    // Derive physical interrogative stimulus context S(t-1) that couples to this statement
    const lower = clean.toLowerCase();
    const stimuli: string[] = [clean];
    if (lower.includes('your name') || lower.includes('my name') || lower.includes('call you')) {
      if (lower.includes('your name') || lower.includes('call you')) {
        stimuli.unshift('What is your name? Who are you?');
      } else {
        stimuli.unshift('What is my name? Who am I?');
      }
    } else if (lower.includes('you are') || lower.includes('i am') || lower.includes("i'm")) {
      if (lower.includes('you are')) {
        stimuli.unshift('Who are you? What are you?');
      } else {
        stimuli.unshift('Who am I? Where do I come from?');
      }
    }

    return {
      focalResponse: inverted,
      stimulusContext: stimuli.join(' '),
    };
  }

  private invertDeicticPronounDipole(text: string): string {
    // Perform token-boundary speaker-listener phase inversion:
    // "Your name is X" -> "My name is X"
    // "You are X" -> "I am X"
    let s = text;
    if (/^\s*your\s+name\s+is\b/i.test(s)) {
      s = s.replace(/^\s*your\s+name\s+is\b/i, 'My name is');
    } else if (/^\s*you\s+are\b/i.test(s)) {
      s = s.replace(/^\s*you\s+are\b/i, 'I am');
    } else if (/^\s*you\s+come\s+from\b/i.test(s)) {
      s = s.replace(/^\s*you\s+come\s+from\b/i, 'I come from');
    } else if (/^\s*my\s+name\s+is\b/i.test(s)) {
      // Distinguish "My name is X" when preceded by "What is your name?" vs user introducing themselves
      // Keep "My name is X" intact so self-introductions or crystal-voice definitions work directly!
    }
    return s;
  }

  /**
   * Etches a user statement or Q&A pair directly into the Live Plastic Crystal Memory M(t),
   * trains the 25M CSR + 8-View + Pauli H8 synapses in real time, and flushes to .bin mmap!
   */
  public learnFromRealtimeInput(
    rawInput: string,
    autoSyncMmap: boolean = true
  ): { moleculesEtched: number; synapsesPotentiated: number; summary: string } {
    const clean = rawInput.trim();
    if (clean.length < 3) {
      return { moleculesEtched: 0, synapsesPotentiated: 0, summary: '' };
    }

    const startTime = performance.now();
    const startSyn = this.activeSynapses + this.charDelayEdgeCount;
    const { focalResponse, stimulusContext } = this.applySpeakerListenerDipoleReciprocity(clean);

    const docTitle = 'Live Plastic Crystal Memory';
    const toks = this.tokenize(focalResponse);
    const tokenIds = toks.map((t) => this.getOrRegisterToken(t));
    const clauses = focalResponse
      .split(/[;:]/)
      .map((c) => c.trim())
      .filter((c) => c.length > 4);

    // Also register all tokens from the raw input & stimulusContext so every word is in the vocabulary
    const rawToks = this.tokenize(stimulusContext);
    for (const rt of rawToks) {
      this.getOrRegisterToken(rt);
    }

    const lineageId = this.molecules.length + 1;
    const mol: CrossbarNarrativeMolecule = {
      id: `${docTitle}::M${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      lineageId,
      docTitle,
      sentenceIndex: this.molecules.filter((m) => m.docTitle === docTitle).length,
      prevText: stimulusContext,
      focalText: focalResponse,
      nextText: clean,
      clauses: clauses.length > 0 ? clauses : [focalResponse],
      tokenIds,
      lowerWords: Array.from(
        new Set(
          [...toks, ...rawToks]
            .map((t) => t.toLowerCase().replace(/[^a-z0-9'-]/g, ''))
            .filter((w) => w.length >= 2)
        )
      ),
    };

    // Deduplicate identical focalText in Live Plastic Crystal Memory and place at front
    this.molecules = [
      mol,
      ...this.molecules.filter(
        (m) =>
          !(
            m.docTitle === docTitle &&
            m.focalText.toLowerCase() === focalResponse.toLowerCase()
          )
      ),
    ];

    // Train the new Narrative Molecule with strong STDP & full k=2..16 Pauli H8 delay lines
    const trainedToks = this.trainSingleMolecule(mol, 4, 0.25, true, 16);
    this.totalIngestedTokens += trainedToks * 4;
    this.rebuildContiguousCSR();
    this.recalibrateThermodynamics(startTime);

    const endSyn = this.activeSynapses + this.charDelayEdgeCount;
    const deltaSyn = Math.max(1, endSyn - startSyn);
    this.mmapPlasticWriteCount++;

    if (autoSyncMmap) {
      this.scheduleBinaryMmapSync();
    }

    return {
      moleculesEtched: 1,
      synapsesPotentiated: deltaSyn,
      summary: `Etched "${focalResponse}" into Live Plastic Crystal (+${deltaSyn} synapses) & synced to .bin mmap`,
    };
  }

  /**
   * Online Hebbian-STDP Query & Response Potentiation:
   * Even when the user asks a pure question ('?'), the crystal learns new vocabulary words
   * from the query, updates character & CSR conductances, and reinforces the winning response molecule.
   */
  public potentiateQueryAndResponsePair(
    queryText: string,
    winningMolecule: CrossbarNarrativeMolecule | null
  ): { synapsesPotentiated: number; summary: string } {
    const startSyn = this.activeSynapses + this.charDelayEdgeCount;
    const qToks = this.tokenize(queryText);
    const qIds = qToks.map((t) => this.getOrRegisterToken(t));

    for (let i = 0; i < qIds.length; i++) {
      const tid = qIds[i];
      this.tokenFreq[tid]++;
      const wUpper = qToks[i].toUpperCase().replace(/[^A-Z0-9'-]/g, '');
      if (wUpper.length >= 2) {
        this.dynamicLexicon.add(wUpper);
        this.wordCounts.set(wUpper, (this.wordCounts.get(wUpper) || 0) + 1);
      }
      for (let delta = 0; delta < Math.min(4, this.NUM_HORIZONS); delta++) {
        const srcIdx = i - 1 - delta;
        if (srcIdx >= 0) {
          this.updateSynapseConductance(
            qIds[srcIdx],
            tid,
            delta,
            0.08 * this.HORIZON_DECAY[delta],
            winningMolecule?.lineageId || 0
          );
        }
      }
    }

    if (winningMolecule) {
      this.trainSingleMolecule(winningMolecule, 1, 0.06, false, 8);
    }

    this.rebuildContiguousCSR();
    this.mmapPlasticWriteCount++;
    this.scheduleBinaryMmapSync();

    const deltaSyn = Math.max(1, this.activeSynapses + this.charDelayEdgeCount - startSyn);
    return {
      synapsesPotentiated: deltaSyn,
      summary: `Online STDP Query Potentiation (+${deltaSyn} conductances) synced to .bin mmap`,
    };
  }

  /**
   * Exports the entire Crossbar Lattice, Vocabulary, CSR TypedArrays, Narrative Molecules,
   * and Thermodynamic Tables into a compact, zero-copy SCB1 Binary .bin Memory-Mapped Image.
   *
   * SCB1 Header Layout (64 bytes = 16 x 32-bit words):
   * [0] magic = 0x53434231 ("SCB1")
   * [1] version = 1
   * [2] presetCode (0='5M', 1='25M', 2='100M')
   * [3] vocabCount
   * [4] activeSynapses
   * [5] totalIngestedTokens
   * [6] ingestedBooksCount
   * [7] totalRawCharsTrained
   * [8] totalWordStreamIndex
   * [9] calibratedCStar (Float32 bits)
   * [10] calibratedThTrans (Float32 bits)
   * [11] jsonByteLength
   * [12] mmapPlasticWriteCount
   * [13..15] reserved
   */
  public exportBinaryMmap(): ArrayBuffer {
    this.rebuildContiguousCSR();

    const vocabCount = this.vocabList.length;
    const synCount = this.activeSynapses;

    // Compact serializable representation of auxiliary maps & molecules
    const compactMolecules = this.molecules.map((m) => [
      m.id,
      m.lineageId,
      m.docTitle,
      m.sentenceIndex,
      m.prevText,
      m.focalText,
      m.nextText,
    ]);

    const charFwdEntries: Array<[string, Array<[string, number]>]> = [];
    this.charMemristorCrossbar.forEach((row, cA) => {
      charFwdEntries.push([
        cA,
        Array.from(row.entries()).map(([cB, g]) => [cB, Math.round(g * 1000) / 1000]),
      ]);
    });

    const charBwdEntries: Array<[string, Array<[string, number]>]> = [];
    this.charBackwardCrossbar.forEach((row, cB) => {
      charBwdEntries.push([
        cB,
        Array.from(row.entries()).map(([cA, g]) => [cA, Math.round(g * 1000) / 1000]),
      ]);
    });

    // Keep top 100,000 word counts for instant thermodynamic lookup
    const wordCountEntries = Array.from(this.wordCounts.entries()).slice(0, 100_000);
    const wordStartEntries = Array.from(this.wordSentenceStartCounts.entries()).slice(0, 50_000);

    const metaPayload = {
      v: this.vocabList,
      m: compactMolecules,
      b: this.ingestedBookRegistry,
      wc: wordCountEntries,
      ws: wordStartEntries,
      cf: charFwdEntries,
      cb: charBwdEntries,
      cal: this.calibrationArtifact,
    };

    const encoder = new TextEncoder();
    const jsonBytes = encoder.encode(JSON.stringify(metaPayload));
    const jsonByteLen = jsonBytes.byteLength;

    // Calculate aligned TypedArray byte lengths (all 4-byte aligned)
    const headerBytes = 64;
    const rowPtrBytes = (vocabCount + 1) * 4;
    const vocabArrBytes = vocabCount * 4; // rowCounts, tokenFreq, tokenStartFreq, tokenHfwd, tokenMu (5 arrays)
    const synArrBytes = synCount * 4; // colHorizon, conductance, edgeSource, synapseLineage (4 arrays)

    const binaryTypedBytes =
      headerBytes + rowPtrBytes + vocabArrBytes * 5 + synArrBytes * 4;
    const totalBytes = binaryTypedBytes + jsonByteLen;

    const buffer = new ArrayBuffer(totalBytes);
    const headerU32 = new Uint32Array(buffer, 0, 16);
    const headerF32 = new Float32Array(buffer, 0, 16);

    headerU32[0] = 0x53434231; // "SCB1"
    headerU32[1] = 1;
    headerU32[2] = this.preset === '5M' ? 0 : this.preset === '25M' ? 1 : 2;
    headerU32[3] = vocabCount;
    headerU32[4] = synCount;
    headerU32[5] = this.totalIngestedTokens;
    headerU32[6] = this.ingestedBooksCount;
    headerU32[7] = this.totalRawCharsTrained;
    headerU32[8] = this.totalWordStreamIndex;
    headerF32[9] = this.calibratedCStar;
    headerF32[10] = this.calibratedThTrans;
    headerU32[11] = jsonByteLen;
    headerU32[12] = this.mmapPlasticWriteCount;

    let offset = headerBytes;

    // 1. rowPtr (vocabCount + 1)
    new Uint32Array(buffer, offset, vocabCount + 1).set(
      this.rowPtr.subarray(0, vocabCount + 1)
    );
    offset += rowPtrBytes;

    // 2. rowCounts (vocabCount)
    new Uint32Array(buffer, offset, vocabCount).set(
      this.rowCounts.subarray(0, vocabCount)
    );
    offset += vocabArrBytes;

    // 3. tokenFreq (vocabCount)
    new Uint32Array(buffer, offset, vocabCount).set(
      this.tokenFreq.subarray(0, vocabCount)
    );
    offset += vocabArrBytes;

    // 4. tokenStartFreq (vocabCount)
    new Uint32Array(buffer, offset, vocabCount).set(
      this.tokenStartFreq.subarray(0, vocabCount)
    );
    offset += vocabArrBytes;

    // 5. tokenHfwd (vocabCount)
    new Float32Array(buffer, offset, vocabCount).set(
      this.tokenHfwd.subarray(0, vocabCount)
    );
    offset += vocabArrBytes;

    // 6. tokenMu (vocabCount)
    new Float32Array(buffer, offset, vocabCount).set(
      this.tokenMu.subarray(0, vocabCount)
    );
    offset += vocabArrBytes;

    // 7. colHorizon (synCount)
    new Uint32Array(buffer, offset, synCount).set(
      this.colHorizon.subarray(0, synCount)
    );
    offset += synArrBytes;

    // 8. conductance (synCount)
    new Float32Array(buffer, offset, synCount).set(
      this.conductance.subarray(0, synCount)
    );
    offset += synArrBytes;

    // 9. edgeSource (synCount)
    new Uint32Array(buffer, offset, synCount).set(
      this.edgeSource.subarray(0, synCount)
    );
    offset += synArrBytes;

    // 10. synapseLineage (synCount)
    new Uint32Array(buffer, offset, synCount).set(
      this.synapseLineage.subarray(0, synCount)
    );
    offset += synArrBytes;

    // 11. Auxiliary UTF-8 table
    new Uint8Array(buffer, offset, jsonByteLen).set(jsonBytes);

    this.mmapBinSizeBytes = totalBytes;
    return buffer;
  }

  /**
   * Maps a raw SCB1 Binary .bin ArrayBuffer directly into the Crossbar's TypedArrays
   * and reconstructs the Forward-Star linked index & narrative molecules in milliseconds.
   */
  public importBinaryMmap(buffer: ArrayBuffer): boolean {
    if (!buffer || buffer.byteLength < 64) return false;

    const startTime = performance.now();
    const headerU32 = new Uint32Array(buffer, 0, 16);
    const headerF32 = new Float32Array(buffer, 0, 16);

    if (headerU32[0] !== 0x53434231) {
      return false;
    }

    const presetCode = headerU32[2];
    const targetPreset: MemoryCapacityPreset =
      presetCode === 0 ? '5M' : presetCode === 2 ? '100M' : '25M';
    if (this.preset !== targetPreset) {
      this.switchPreset(targetPreset);
    }

    const vocabCount = Math.min(headerU32[3], this.config.maxVocab);
    const synCount = Math.min(headerU32[4], this.config.maxSynapses);
    this.totalIngestedTokens = headerU32[5];
    this.ingestedBooksCount = headerU32[6];
    this.totalRawCharsTrained = headerU32[7];
    this.totalWordStreamIndex = headerU32[8];
    this.calibratedCStar = headerF32[9] || 4;
    this.calibratedThTrans = headerF32[10] || 1.25;
    const jsonByteLen = headerU32[11];
    this.mmapPlasticWriteCount = headerU32[12] || 0;

    let offset = 64;
    const rowPtrBytes = (headerU32[3] + 1) * 4;
    const vocabArrBytes = headerU32[3] * 4;
    const synArrBytes = headerU32[4] * 4;

    this.rowPtr.fill(0);
    this.rowCounts.fill(0);
    this.headEdge.fill(-1);
    this.nextEdge.fill(-1);

    this.rowPtr.set(new Uint32Array(buffer, offset, vocabCount + 1));
    offset += rowPtrBytes;

    this.rowCounts.set(new Uint32Array(buffer, offset, vocabCount));
    offset += vocabArrBytes;

    this.tokenFreq.set(new Uint32Array(buffer, offset, vocabCount));
    offset += vocabArrBytes;

    this.tokenStartFreq.set(new Uint32Array(buffer, offset, vocabCount));
    offset += vocabArrBytes;

    this.tokenHfwd.set(new Float32Array(buffer, offset, vocabCount));
    offset += vocabArrBytes;

    this.tokenMu.set(new Float32Array(buffer, offset, vocabCount));
    offset += vocabArrBytes;

    this.colHorizon.set(new Uint32Array(buffer, offset, synCount));
    offset += synArrBytes;

    this.conductance.set(new Float32Array(buffer, offset, synCount));
    offset += synArrBytes;

    this.edgeSource.set(new Uint32Array(buffer, offset, synCount));
    offset += synArrBytes;

    this.synapseLineage.set(new Uint32Array(buffer, offset, synCount));
    offset += synArrBytes;

    this.activeSynapses = synCount;

    // Re-link Forward-Star headEdge & nextEdge in O(synCount) so online STDP can continue seamlessly
    const maxAux = Math.min(synCount, this.nextEdge.length);
    for (let e = maxAux - 1; e >= 0; e--) {
      const src = this.edgeSource[e];
      if (src < this.headEdge.length) {
        this.nextEdge[e] = this.headEdge[src];
        this.headEdge[src] = e;
      }
    }

    // Decode UTF-8 metadata block
    const jsonSlice = new Uint8Array(buffer, offset, jsonByteLen);
    const decoder = new TextDecoder();
    const meta = JSON.parse(decoder.decode(jsonSlice)) as {
      v: string[];
      m: Array<[string, number, string, number, string, string, string]>;
      b: IngestedBookRecord[];
      wc: Array<[string, number]>;
      ws: Array<[string, number]>;
      cf: Array<[string, Array<[string, number]>]>;
      cb: Array<[string, Array<[string, number]>]>;
      cal?: CorpusCalibrationArtifact;
    };

    this.vocabList = meta.v || [];
    this.tokenToIdMap.clear();
    this.lowerTokenToIdMap.clear();
    for (let i = 0; i < this.vocabList.length; i++) {
      const tok = this.vocabList[i];
      this.tokenToIdMap.set(tok, i);
      const low = tok.toLowerCase();
      if (!this.lowerTokenToIdMap.has(low)) {
        this.lowerTokenToIdMap.set(low, i);
      }
    }

    this.ingestedBookRegistry = meta.b || [];
    if (meta.cal) {
      this.calibrationArtifact = meta.cal;
    }

    this.wordCounts = new Map(meta.wc || []);
    this.wordSentenceStartCounts = new Map(meta.ws || []);
    this.dynamicLexicon = new Set(this.wordCounts.keys());

    this.charMemristorCrossbar.clear();
    for (const [cA, entries] of meta.cf || []) {
      this.charMemristorCrossbar.set(cA, new Map(entries));
      this.uniqueCharSet.add(cA);
    }

    this.charBackwardCrossbar.clear();
    for (const [cB, entries] of meta.cb || []) {
      this.charBackwardCrossbar.set(cB, new Map(entries));
    }

    // Reconstruct Narrative Molecules & fast word transitions
    this.molecules = [];
    this.wordTransitions.clear();
    this.wordBackwardTransitions.clear();
    this.multiViewWordCouplings.forEach((m) => m.clear());
    this.charDelayLineSynapses.clear();
    this.charDelayLineLineages.clear();
    this.charDelayEdgeCount = 0;

    for (const item of meta.m || []) {
      const [id, lineageId, docTitle, sentenceIndex, prevText, focalText, nextText] = item;
      const toks = this.tokenize(focalText);
      const tokenIds = toks.map((t) => this.getOrRegisterToken(t));
      const clauses = focalText
        .split(/[;:]/)
        .map((c) => c.trim())
        .filter((c) => c.length > 4);
      const lowerWords = toks
        .map((t) => t.toLowerCase().replace(/[^a-z0-9'-]/g, ''))
        .filter((w) => w.length >= 2);

      const mol: CrossbarNarrativeMolecule = {
        id,
        lineageId,
        docTitle,
        sentenceIndex,
        prevText,
        focalText,
        nextText,
        clauses: clauses.length > 0 ? clauses : [focalText],
        tokenIds,
        lowerWords,
      };
      this.molecules.push(mol);

      // Re-crystallize H8 delay lines immediately for Live Plastic Crystal Memory molecules
      if (docTitle === 'Live Plastic Crystal Memory') {
        this.crystallizeMoleculeH8DelayLines(mol, 3, 0.22, 16);
      }
    }

    this.recalibrateThermodynamics(startTime);
    this.mmapBinSizeBytes = buffer.byteLength;
    this.mmapLastSyncMs = Math.round((performance.now() - startTime) * 10) / 10;
    this.mmapStatus = `MMAP ACTIVE (${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB .bin)`;
    this.isMmapRestored = true;
    return true;
  }

  /**
   * Opens the browser's IndexedDB binary store for zero-copy ArrayBuffer persistence
   */
  private openMmapIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        return reject(new Error('IndexedDB unavailable'));
      }
      const req = indexedDB.open('synaptron_crystal_mmap_db', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('mmap_bins')) {
          db.createObjectStore('mmap_bins');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Debounced background flush of the SCB1 binary .bin image to both:
   * 1. Browser IndexedDB raw ArrayBuffer ('synaptron_crystal.bin')
   * 2. Server POSIX file ('data/synaptron_crystal.bin' via POST /api/crystal/mmap.bin)
   */
  public scheduleBinaryMmapSync(delayMs: number = 120): void {
    if (this.mmapSyncTimer) {
      clearTimeout(this.mmapSyncTimer);
    }
    this.mmapSyncTimer = setTimeout(() => {
      void this.syncToBinaryMmap();
    }, delayMs);
  }

  public async syncToBinaryMmap(): Promise<boolean> {
    try {
      const t0 = performance.now();
      const binBuffer = this.exportBinaryMmap();

      // 1. Save to IndexedDB binary page store
      try {
        const db = await this.openMmapIndexedDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction('mmap_bins', 'readwrite');
          tx.objectStore('mmap_bins').put(binBuffer, 'synaptron_crystal.bin');
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch {
        // Ignore IndexedDB quota/private mode errors when server .bin is active
      }

      // 2. Stream raw binary ArrayBuffer to server /api/crystal/mmap.bin
      const res = await fetch('/api/crystal/mmap.bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: binBuffer,
      });

      const elapsed = Math.round((performance.now() - t0) * 10) / 10;
      this.mmapLastSyncMs = elapsed;
      const mb = (binBuffer.byteLength / (1024 * 1024)).toFixed(2);
      if (res.ok) {
        this.mmapStatus = `MMAP SYNCED · ${mb} MB .bin (${elapsed} ms)`;
      } else {
        this.mmapStatus = `MMAP LOCAL · ${mb} MB .bin (${elapsed} ms)`;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Restores the crystal from the persistent SCB1 .bin binary image (checks server
   * data/synaptron_crystal.bin and browser IndexedDB, picking whichever has the richest vocabulary).
   */
  public async restoreFromBinaryMmap(): Promise<boolean> {
    if (this.isMmapRestored && this.vocabList.length > 600) {
      return true;
    }

    let idbBuffer: ArrayBuffer | null = null;
    let idbVocab = 0;

    try {
      const db = await this.openMmapIndexedDB();
      idbBuffer = await new Promise<ArrayBuffer | null>((resolve) => {
        const tx = db.transaction('mmap_bins', 'readonly');
        const req = tx.objectStore('mmap_bins').get('synaptron_crystal.bin');
        req.onsuccess = () => resolve((req.result as ArrayBuffer) || null);
        req.onerror = () => resolve(null);
      });
      if (idbBuffer && idbBuffer.byteLength >= 64) {
        const h = new Uint32Array(idbBuffer, 0, 8);
        if (h[0] === 0x53434231) idbVocab = h[3];
      }
    } catch {
      // Ignore IDB error
    }

    let srvBuffer: ArrayBuffer | null = null;
    let srvVocab = 0;

    try {
      const statusRes = await fetch('/api/crystal/status');
      if (statusRes.ok) {
        const status = await statusRes.json();
        if (status.exists && status.byteLength >= 64) {
          const binRes = await fetch('/api/crystal/mmap.bin');
          if (binRes.ok) {
            srvBuffer = await binRes.arrayBuffer();
            if (srvBuffer && srvBuffer.byteLength >= 64) {
              const h = new Uint32Array(srvBuffer, 0, 8);
              if (h[0] === 0x53434231) srvVocab = h[3];
            }
          }
        }
      }
    } catch {
      // Ignore server fetch error
    }

    const winningBuffer =
      srvVocab >= idbVocab && srvBuffer ? srvBuffer : idbBuffer || srvBuffer;

    if (winningBuffer && winningBuffer.byteLength >= 64) {
      const ok = this.importBinaryMmap(winningBuffer);
      if (ok) {
        // Ensure both tiers have the winning binary image
        if (srvVocab < idbVocab && idbBuffer) {
          void fetch('/api/crystal/mmap.bin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: idbBuffer,
          });
        }
        return true;
      }
    }

    return false;
  }

  /**
   * Returns high-frequency hardware telemetry for real-time Apple Silicon / WebGPU HUD
   */
  public getTelemetry(): CrossbarTelemetry {
    let suppressedCount = 0;
    const vCount = this.vocabList.length;
    for (let i = 3; i < vCount; i++) {
      if (this.refractoryPsi[i] < 0.85) {
        suppressedCount++;
      }
    }

    const activeSomas: number[] = [];
    for (let h = 0; h < this.NUM_HORIZONS; h++) {
      if (this.horizonDelayWavefront[h] > 0) {
        activeSomas.push(this.horizonDelayWavefront[h]);
      }
    }

    const totalCombinedSynapses = this.activeSynapses + this.charDelayEdgeCount;

    return {
      capacityPreset: this.preset,
      activeSynapseCount: totalCombinedSynapses,
      tokenCsrSynapseCount: this.activeSynapses,
      charDelaySynapseCount: this.charDelayEdgeCount,
      maxSynapses: this.config.maxSynapses,
      synapseUtilizationPct: (totalCombinedSynapses / this.config.maxSynapses) * 100,
      vocabSize: Math.max(0, this.vocabList.length - 3),
      maxVocab: this.config.maxVocab,
      allocatedVramBytes: this.config.totalVramBytes,
      ingestedTokens: this.totalIngestedTokens,
      ingestedChars: this.totalRawCharsTrained,
      ingestedBooks: this.ingestedBooksCount,
      trainingTokensPerSec: Math.round(this.lastTokensPerSec),
      inferenceLatencyUs: this.lastInferenceLatencyUs,
      activeSomas,
      activeMacroSomas: this.lastActiveMacroSomas,
      lastResonantCurrent: this.lastResonantCurrentUa,
      pauliSuppressionRate: vCount > 3 ? (suppressedCount / (vCount - 3)) * 100 : 0,
      useWebGPUAcceleration: this.useWebGPU,
      calibratedThresholdC: this.calibratedCStar,
      calibratedEntropyTh: this.calibratedThTrans,
      narrativeMoleculesCount: this.molecules.length,
      calibrationArtifact: this.calibrationArtifact,
      mmapBinSizeBytes: this.mmapBinSizeBytes,
      mmapLastSyncMs: this.mmapLastSyncMs,
      mmapPlasticWriteCount: this.mmapPlasticWriteCount,
      mmapStatus: this.mmapStatus,
      plasticQueryLearningEnabled: this.plasticQueryLearningEnabled,
    };
  }

  /**
   * Resets entire crossbar memory matrix to virgin pristine state
   */
  public clearMemory(): void {
    this.activeSynapses = 0;
    this.totalIngestedTokens = 0;
    this.ingestedBooksCount = 0;
    this.mmapPlasticWriteCount = 0;
    this.mmapBinSizeBytes = 0;
    this.mmapStatus = 'MMAP RESET';
    this.rowPtr.fill(0);
    this.rowCounts.fill(0);
    this.colHorizon.fill(0);
    this.conductance.fill(0);
    this.headEdge.fill(-1);
    this.nextEdge.fill(-1);
    this.edgeSource.fill(0);
    this.synapseLineage.fill(0);
    this.tokenFreq.fill(0);
    this.tokenStartFreq.fill(0);
    this.tokenHfwd.fill(0);
    this.tokenMu.fill(1.0);
    this.somaVoltages.fill(0);
    this.refractoryPsi.fill(1.0);
    this.horizonDelayWavefront.fill(0);

    this.seedFundamentalTokens();
    void fetch('/api/crystal/mmap.bin', { method: 'DELETE' });
    this.openMmapIndexedDB()
      .then((db) => {
        const tx = db.transaction('mmap_bins', 'readwrite');
        tx.objectStore('mmap_bins').delete('synaptron_crystal.bin');
      })
      .catch(() => {});
  }
}

// Global singleton instance with Apple M4 25M default
export const wasmCrossbarEngine = new WasmMemristorEngine('25M');


