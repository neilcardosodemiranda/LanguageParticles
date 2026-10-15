/**
 * Types for the Neuromorphic Linguistic Particle Computer (Synaptron NL-QPU)
 */

export type ParticleType = 'lepton' | 'quark' | 'boson' | 'antimatter';
export type SemanticColor = 'red' | 'green' | 'blue' | 'gold' | 'violet';

export interface LetterParticle {
  id: string;
  char: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number;
  fy: number;
  mass: number;
  charge: number; // e.g. -1 for vowels, +1 for consonants, 0 for bosons
  spin: number;
  color: SemanticColor;
  radius: number;
  energy: number;
  quantumPhase: number;
  isAntimatter: boolean;
  hadronId: string | null;
  bondOrder: number; // position in word
  trail: Array<{ x: number; y: number; alpha: number }>;
  pinned?: boolean;
  decayTime?: number;
}

export interface HadronBond {
  id: string;
  particleAId: string;
  particleBId: string;
  restLength: number;
  stiffness: number;
  damping: number;
  strength: number;
}

export interface HadronWord {
  id: string;
  word: string;
  particleIds: string[];
  isStable: boolean;
  resonanceEnergy: number;
  createdAt: number;
  centerX: number;
  centerY: number;
}

export interface SynapticNeuron {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  core: 'alpha' | 'beta' | 'gamma' | 'delta';
  membranePotential: number; // -70mV rest to -50mV threshold
  threshold: number; // -50mV
  restPotential: number; // -70mV
  resetPotential: number; // -78mV
  refractoryTime: number; // ms
  decayRate: number; // leaky factor
  spikeHistory: number[]; // recent spike times (ms)
  weights: Record<string, number>; // memristor connection to other neuron IDs
  lastSpikeVisual: number; // 0 to 1 for rendering glow
  accumulatedCurrent: number;
}

export interface AttractorWell {
  id: string;
  x: number;
  y: number;
  strength: number; // positive = attract, negative = repel
  radius: number;
  type: 'gravity' | 'magnetic' | 'vowel_trap' | 'consonant_trap' | 'annihilation_sink';
  label: string;
}

export interface QuantumBarrier {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  potential: number; // Barrier height
  active: boolean;
  label: string;
}

export interface CollisionFlash {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  label?: string;
  life: number; // 1 to 0
  decayRate: number;
  type: 'fusion' | 'fission' | 'annihilation' | 'spike' | 'tunnel' | 'cherenkov';
}

export interface BeamlineConfig {
  active: boolean;
  text: string;
  velocity: number; // 0.1 to 1.5 relativistic scale
  energyGeV: number;
  frequency: number; // particles/sec in fountain mode
  isAntimatter: boolean;
  polarity: 'positive' | 'negative' | 'neutral';
}

export interface SimulationSettings {
  timeStep: number;
  cSpeed: number; // simulated speed of light
  lorentzBField: number; // magnetic field (-5 to +5)
  strongForceStrength: number; // linguistic bonding spring
  coulombConstant: number; // electrostatic attraction/repulsion
  damping: number; // vacuum viscosity
  quantumTunneling: boolean;
  collisionMode: 'fusion' | 'fission' | 'annihilation' | 'elastic';
  soundEnabled: boolean;
  soundVolume: number;
  showTrails: boolean;
  showWaveFunctions: boolean;
  showSynapticGrid: boolean;
  temperature: number; // thermal noise
}

export interface ComputerTelemetry {
  particleCount: number;
  wordCount: number;
  stableHadrons: number;
  spikeRateHz: number;
  totalKineticEnergy: number;
  entropy: number;
  opsPerSecond: number;
  annihilationsCount: number;
  recognizedWords: string[];
  recentSpikes: Array<{ neuronId: string; time: number; core: string }>;
}
