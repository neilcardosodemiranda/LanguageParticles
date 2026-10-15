/**
 * Neuromorphic Particle Physics Engine
 * Simulates linguistic particle dynamics, relativistic kinematics,
 * Strong Linguistic Bonding, Coulomb fields, Lorentz deflection,
 * and Leaky Integrate-and-Fire (LIF) spiking synaptic memristor lattice.
 */

import {
  LetterParticle,
  HadronBond,
  HadronWord,
  SynapticNeuron,
  AttractorWell,
  QuantumBarrier,
  CollisionFlash,
  SimulationSettings,
  ComputerTelemetry,
} from '../types/physics';
import {
  getLetterParticleProperties,
  checkWordStability,
  STRONG_BINDING_BIGRAMS,
  areComplementaryAntimatter,
} from '../utils/dictionary';
import { soundEngine } from '../utils/audio';

export class NeuromorphicPhysicsEngine {
  public particles: LetterParticle[] = [];
  public bonds: HadronBond[] = [];
  public hadrons: HadronWord[] = [];
  public neurons: SynapticNeuron[] = [];
  public attractors: AttractorWell[] = [];
  public barriers: QuantumBarrier[] = [];
  public flashes: CollisionFlash[] = [];

  public width: number = 1000;
  public height: number = 650;

  public settings: SimulationSettings = {
    timeStep: 0.6,
    cSpeed: 18.0, // simulated speed of light
    lorentzBField: 1.2, // magnetic deflection
    strongForceStrength: 0.45,
    coulombConstant: 25.0,
    damping: 0.992,
    quantumTunneling: true,
    collisionMode: 'fusion',
    soundEnabled: true,
    soundVolume: 0.25,
    showTrails: true,
    showWaveFunctions: true,
    showSynapticGrid: true,
    temperature: 0.2,
  };

  public telemetry: ComputerTelemetry = {
    particleCount: 0,
    wordCount: 0,
    stableHadrons: 0,
    spikeRateHz: 0,
    totalKineticEnergy: 0,
    entropy: 0,
    opsPerSecond: 0,
    annihilationsCount: 0,
    recognizedWords: [],
    recentSpikes: [],
  };

  private spikeCounter = 0;
  private lastSpikeCheckTime = performance.now();
  private opsCounter = 0;
  private lastOpsTime = performance.now();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initDefaultNeuromorphicLattice();
  }

  public setDimensions(w: number, h: number) {
    this.width = Math.max(400, w);
    this.height = Math.max(300, h);
    this.repositionNeurons();
  }

  /**
   * Initializes the 4-core Neuromorphic memristor crossbar lattice
   */
  public initDefaultNeuromorphicLattice() {
    this.neurons = [];
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rx = Math.min(280, this.width * 0.32);
    const ry = Math.min(180, this.height * 0.28);

    const cores: Array<'alpha' | 'beta' | 'gamma' | 'delta'> = ['alpha', 'beta', 'gamma', 'delta'];

    // 8 Spiking Neurons positioned in an ellipse around the interaction zone
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const core = cores[i % 4];
      const neuron: SynapticNeuron = {
        id: `neuron-${i}`,
        label: `N${i + 1}-${core.toUpperCase()}`,
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
        radius: 22,
        core,
        membranePotential: -70.0,
        threshold: -50.0,
        restPotential: -70.0,
        resetPotential: -78.0,
        refractoryTime: 0,
        decayRate: 0.08,
        spikeHistory: [],
        weights: {},
        lastSpikeVisual: 0,
        accumulatedCurrent: 0,
      };

      // Set initial synaptic memristor weights to adjacent neurons
      for (let j = 0; j < 8; j++) {
        if (i !== j) {
          neuron.weights[`neuron-${j}`] = 0.2 + Math.random() * 0.3;
        }
      }
      this.neurons.push(neuron);
    }
  }

  private repositionNeurons() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rx = Math.min(280, this.width * 0.32);
    const ry = Math.min(180, this.height * 0.28);

    this.neurons.forEach((n, i) => {
      const angle = (i / this.neurons.length) * Math.PI * 2;
      n.x = cx + Math.cos(angle) * rx;
      n.y = cy + Math.sin(angle) * ry;
    });
  }

  /**
   * Spawns an elementary letter particle
   */
  public addParticle(
    char: string,
    x: number,
    y: number,
    vx: number = 0,
    vy: number = 0,
    isAntimatter: boolean = false
  ): LetterParticle {
    const props = getLetterParticleProperties(char, isAntimatter);
    const id = `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const p: LetterParticle = {
      id,
      char,
      type: props.type,
      x,
      y,
      vx,
      vy,
      fx: 0,
      fy: 0,
      mass: props.mass,
      charge: props.charge,
      spin: props.spin,
      color: props.color,
      radius: props.radius,
      energy: 0.5 * props.mass * (vx * vx + vy * vy),
      quantumPhase: Math.random() * Math.PI * 2,
      isAntimatter,
      hadronId: null,
      bondOrder: 0,
      trail: [],
    };

    this.particles.push(p);
    return p;
  }

  /**
   * Injects a full word or sequence as an accelerated particle beam
   */
  public injectBeam(
    text: string,
    side: 'left' | 'right' | 'top' | 'center',
    velocity: number = 5.0,
    isAntimatter: boolean = false,
    spreadY: number = 0
  ) {
    const clean = text.trim();
    if (!clean) return;

    const chars = clean.split('');
    const spacing = 28;
    const startY = this.height / 2 + spreadY;

    let startX = 60;
    let dirX = 1;

    if (side === 'right') {
      startX = this.width - 60;
      dirX = -1;
    } else if (side === 'top') {
      startX = this.width / 2;
    } else if (side === 'center') {
      startX = this.width / 2 - (chars.length * spacing) / 2;
      dirX = 0;
    }

    const spawned: LetterParticle[] = [];

    chars.forEach((c, index) => {
      const px = side === 'center' ? startX + index * spacing : startX - dirX * index * spacing;
      const py = startY + (Math.random() - 0.5) * 8;
      const vx = dirX * velocity * (0.95 + Math.random() * 0.1);
      const vy = (Math.random() - 0.5) * (velocity * 0.2);

      const p = this.addParticle(c, px, py, vx, vy, isAntimatter);
      spawned.push(p);
    });

    // If fired as a pre-bound word molecule (Hadron)
    if (spawned.length > 1 && side === 'center') {
      this.formHadron(spawned, clean.toUpperCase());
    }

    soundEngine.updateSynchrotronHum(true, Math.min(1.0, velocity / 10));
  }

  /**
   * Bonds an array of particles into a Hadron word molecule
   */
  public formHadron(particles: LetterParticle[], wordStr?: string): HadronWord {
    const word = wordStr || particles.map((p) => p.char).join('').toUpperCase();
    const hadronId = `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const { isStable } = checkWordStability(word.split(''));

    particles.forEach((p, idx) => {
      p.hadronId = hadronId;
      p.bondOrder = idx;
    });

    // Create elastic spring bonds between consecutive particles
    for (let i = 0; i < particles.length - 1; i++) {
      const bond: HadronBond = {
        id: `b-${particles[i].id}-${particles[i + 1].id}`,
        particleAId: particles[i].id,
        particleBId: particles[i + 1].id,
        restLength: 32,
        stiffness: 0.65,
        damping: 0.15,
        strength: isStable ? 1.0 : 0.4,
      };
      this.bonds.push(bond);
    }

    const cx = particles.reduce((acc, p) => acc + p.x, 0) / particles.length;
    const cy = particles.reduce((acc, p) => acc + p.y, 0) / particles.length;

    const hadron: HadronWord = {
      id: hadronId,
      word,
      particleIds: particles.map((p) => p.id),
      isStable,
      resonanceEnergy: isStable ? 100 : 25,
      createdAt: Date.now(),
      centerX: cx,
      centerY: cy,
    };

    this.hadrons.push(hadron);

    if (isStable) {
      soundEngine.playWordFusion(word);
      this.flashes.push({
        id: `f-${Date.now()}`,
        x: cx,
        y: cy,
        radius: 10,
        maxRadius: 80,
        color: '#38bdf8',
        label: `SYNTHESIS: ${word}`,
        life: 1.0,
        decayRate: 0.03,
        type: 'fusion',
      });
      if (!this.telemetry.recognizedWords.includes(word)) {
        this.telemetry.recognizedWords.unshift(word);
        if (this.telemetry.recognizedWords.length > 8) {
          this.telemetry.recognizedWords.pop();
        }
      }
    }

    return hadron;
  }

  /**
   * Main Physics Tick Update (called at 60 FPS)
   */
  public update(dt: number) {
    const effectiveDt = dt * this.settings.timeStep;
    this.opsCounter += this.particles.length * 4;

    // Reset forces
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.fx = 0;
      p.fy = 0;

      // Thermal fluctuations
      if (this.settings.temperature > 0) {
        p.fx += (Math.random() - 0.5) * this.settings.temperature * 1.5;
        p.fy += (Math.random() - 0.5) * this.settings.temperature * 1.5;
      }

      // Quantum wave-function phase rotation
      p.quantumPhase = (p.quantumPhase + (p.energy + 0.1) * effectiveDt * 2) % (Math.PI * 2);
    }

    // Apply Hadron Spring Bonds (Strong Nuclear / Linguistic Force)
    this.updateBonds(effectiveDt);

    // Apply Pairwise Forces: Coulomb, Strong Bigram attraction, and Collisions
    this.updateInterParticleForces(effectiveDt);

    // Apply External Electromagnetic Fields (Lorentz B-field)
    this.updateLorentzForces(effectiveDt);

    // Apply Attractor Wells and Sinks
    this.updateAttractors(effectiveDt);

    // Apply Quantum Barriers and Tunneling
    this.updateQuantumBarriers(effectiveDt);

    // Integrate Kinematics (Verlet / Euler with relativistic limit)
    this.integrateKinematics(effectiveDt);

    // Update Neuromorphic Spiking Lattice (LIF neurons & memristors)
    this.updateNeuromorphicLattice(effectiveDt);

    // Update Visual Collision Flashes
    this.updateFlashes(effectiveDt);

    // Calculate Telemetry
    this.updateTelemetry();
  }

  /**
   * Hadron Spring Bond dynamics
   */
  private updateBonds(dt: number) {
    const deadBondIds = new Set<string>();

    for (const bond of this.bonds) {
      const pA = this.particles.find((p) => p.id === bond.particleAId);
      const pB = this.particles.find((p) => p.id === bond.particleBId);

      if (!pA || !pB) {
        deadBondIds.add(bond.id);
        continue;
      }

      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const displacement = dist - bond.restLength;

      // Hooke's Law with damping
      const forceMag = bond.stiffness * displacement * this.settings.strongForceStrength;
      const nx = dx / dist;
      const ny = dy / dist;

      // Relative velocity along bond vector
      const relVx = pB.vx - pA.vx;
      const relVy = pB.vy - pA.vy;
      const dampingForce = (relVx * nx + relVy * ny) * bond.damping;

      const totalF = forceMag + dampingForce;

      pA.fx += totalF * nx;
      pA.fy += totalF * ny;
      pB.fx -= totalF * nx;
      pB.fy -= totalF * ny;

      // Fission breakdown if pulled beyond rupture threshold (unless stable hadron)
      if (dist > bond.restLength * 3.5 && bond.strength < 0.8) {
        deadBondIds.add(bond.id);
        pA.hadronId = null;
        pB.hadronId = null;
        this.flashes.push({
          id: `fission-${Date.now()}`,
          x: (pA.x + pB.x) / 2,
          y: (pA.y + pB.y) / 2,
          radius: 8,
          maxRadius: 35,
          color: '#f97316',
          label: 'FISSION',
          life: 1.0,
          decayRate: 0.05,
          type: 'fission',
        });
      }
    }

    if (deadBondIds.size > 0) {
      this.bonds = this.bonds.filter((b) => !deadBondIds.has(b.id));
    }
  }

  /**
   * Particle-to-Particle Electromagnetic & Linguistic interactions
   */
  private updateInterParticleForces(_dt: number) {
    const count = this.particles.length;
    const toRemove = new Set<string>();

    for (let i = 0; i < count; i++) {
      const pA = this.particles[i];
      if (toRemove.has(pA.id)) continue;

      for (let j = i + 1; j < count; j++) {
        const pB = this.particles[j];
        if (toRemove.has(pB.id)) continue;

        const dx = pB.x - pA.x;
        const dy = pB.y - pA.y;
        const distSq = dx * dx + dy * dy;
        const minDist = pA.radius + pB.radius;

        // --- 1. Antimatter Annihilation Check ---
        if (distSq < minDist * minDist) {
          const isAntimatterPair =
            (pA.isAntimatter && !pB.isAntimatter) || (!pA.isAntimatter && pB.isAntimatter);

          if (isAntimatterPair) {
            // Annihilation Event!
            toRemove.add(pA.id);
            toRemove.add(pB.id);
            this.telemetry.annihilationsCount++;

            const flashX = (pA.x + pB.x) / 2;
            const flashY = (pA.y + pB.y) / 2;

            soundEngine.playAnnihilation();

            this.flashes.push({
              id: `annihilate-${Date.now()}-${Math.random()}`,
              x: flashX,
              y: flashY,
              radius: 12,
              maxRadius: 110,
              color: '#ec4899',
              label: `ANNIHILATION: ${pA.char} ⊗ ${pB.char}`,
              life: 1.0,
              decayRate: 0.025,
              type: 'annihilation',
            });

            // Emit 3-4 gamma photon bosons
            for (let g = 0; g < 4; g++) {
              const theta = (g / 4) * Math.PI * 2 + Math.random() * 0.5;
              const gv = 8.0;
              this.addParticle('γ', flashX, flashY, Math.cos(theta) * gv, Math.sin(theta) * gv, false);
            }
            continue;
          }
        }

        // --- 2. Coulomb Electrostatic Force ---
        const dist = Math.sqrt(distSq) || 0.1;
        if (dist < 260) {
          const coulombForce =
            (this.settings.coulombConstant * pA.charge * pB.charge) / (distSq + 120);
          const nx = dx / dist;
          const ny = dy / dist;

          // Repel if same sign, attract if opposite sign
          pA.fx -= coulombForce * nx;
          pA.fy -= coulombForce * ny;
          pB.fx += coulombForce * nx;
          pB.fy += coulombForce * ny;

          // --- 3. Strong Linguistic Force (Bond Formation between Letters) ---
          const bigram = (pA.char + pB.char).toUpperCase();
          const reverseBigram = (pB.char + pA.char).toUpperCase();
          const hasAffinity =
            STRONG_BINDING_BIGRAMS.has(bigram) || STRONG_BINDING_BIGRAMS.has(reverseBigram);

          // Strong Yukawa-like attractive potential if valid bigram within binding distance
          if (hasAffinity && dist < 70 && this.settings.collisionMode === 'fusion') {
            const yukawa = 4.0 / (1 + dist * 0.05);
            pA.fx += yukawa * nx;
            pA.fy += yukawa * ny;
            pB.fx -= yukawa * nx;
            pB.fy -= yukawa * ny;

            // Form dynamic spring bond if not already connected
            const alreadyBonded = this.bonds.some(
              (b) =>
                (b.particleAId === pA.id && b.particleBId === pB.id) ||
                (b.particleAId === pB.id && b.particleBId === pA.id)
            );

            if (!alreadyBonded && dist < minDist * 1.3) {
              const bond: HadronBond = {
                id: `bond-${pA.id}-${pB.id}`,
                particleAId: pA.id,
                particleBId: pB.id,
                restLength: minDist * 1.1,
                stiffness: 0.5,
                damping: 0.2,
                strength: 0.7,
              };
              this.bonds.push(bond);
              soundEngine.playLetterCollision(pA.char, Math.abs(pA.vx));
            }
          }
        }

        // --- 4. Elastic Particle-to-Particle Hard Contact Collision ---
        if (dist < minDist) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Push apart
          pA.x -= nx * overlap * 0.5;
          pA.y -= ny * overlap * 0.5;
          pB.x += nx * overlap * 0.5;
          pB.y += ny * overlap * 0.5;

          // Elastic impulse
          const kx = pA.vx - pB.vx;
          const ky = pA.vy - pB.vy;
          const p = 2 * (nx * kx + ny * ky) / (pA.mass + pB.mass);

          pA.vx -= p * pB.mass * nx;
          pA.vy -= p * pB.mass * ny;
          pB.vx += p * pA.mass * nx;
          pB.vy += p * pA.mass * ny;

          soundEngine.playLetterCollision(pA.char, Math.abs(p));
        }
      }
    }

    if (toRemove.size > 0) {
      this.particles = this.particles.filter((p) => !toRemove.has(p.id));
      this.bonds = this.bonds.filter(
        (b) => !toRemove.has(b.particleAId) && !toRemove.has(b.particleBId)
      );
    }
  }

  /**
   * Lorentz Magnetic Deflection: F = q * (v x B)
   * In 2D plane: F_x = q * v_y * B_z, F_y = -q * v_x * B_z
   */
  private updateLorentzForces(_dt: number) {
    const B = this.settings.lorentzBField;
    if (Math.abs(B) < 0.01) return;

    for (const p of this.particles) {
      const q = p.charge;
      if (Math.abs(q) < 0.05) continue;

      const fx = q * p.vy * B * 0.15;
      const fy = -q * p.vx * B * 0.15;

      p.fx += fx;
      p.fy += fy;
    }
  }

  /**
   * Gravitational and Magnetic Attractor Wells
   */
  private updateAttractors(_dt: number) {
    for (const att of this.attractors) {
      for (const p of this.particles) {
        const dx = att.x - p.x;
        const dy = att.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;

        if (dist > att.radius * 2.5) continue;

        let strength = att.strength;

        if (att.type === 'vowel_trap' && 'AEIOUYaeiouy'.includes(p.char)) {
          strength *= 2.5;
        } else if (att.type === 'consonant_trap' && !'AEIOUYaeiouy'.includes(p.char)) {
          strength *= 2.5;
        }

        const force = (strength * 100) / (dist + 30);
        const nx = dx / dist;
        const ny = dy / dist;

        p.fx += force * nx;
        p.fy += force * ny;
      }
    }
  }

  /**
   * Quantum Barriers & Wave-Packet Tunneling
   */
  private updateQuantumBarriers(_dt: number) {
    if (!this.settings.quantumTunneling) return;

    for (const bar of this.barriers) {
      if (!bar.active) continue;

      for (const p of this.particles) {
        // Check bounding box intersection
        if (
          p.x >= bar.x &&
          p.x <= bar.x + bar.width &&
          p.y >= bar.y &&
          p.y <= bar.y + bar.height
        ) {
          const kineticEnergy = 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy);

          // Quantum tunneling transmission probability: T = exp(-2 * d * sqrt(V0 - E))
          const canTunnel = kineticEnergy > bar.potential * 0.6 || Math.random() < 0.12;

          if (canTunnel) {
            // Tunnel through!
            this.flashes.push({
              id: `tunnel-${Date.now()}`,
              x: p.x,
              y: p.y,
              radius: 6,
              maxRadius: 28,
              color: '#a855f7',
              label: 'TUNNEL',
              life: 1.0,
              decayRate: 0.08,
              type: 'tunnel',
            });
          } else {
            // Reflect back off barrier face
            p.vx *= -0.85;
            p.x += p.vx * 2;
          }
        }
      }
    }
  }

  /**
   * Kinematics Integration with Relativistic Speed of Light Clamp
   */
  private integrateKinematics(dt: number) {
    const c = this.settings.cSpeed;
    const damping = this.settings.damping;
    const margin = 16;

    for (const p of this.particles) {
      if (p.pinned) continue;

      // Acceleration: a = F / m
      const ax = p.fx / p.mass;
      const ay = p.fy / p.mass;

      p.vx = (p.vx + ax * dt) * damping;
      p.vy = (p.vy + ay * dt) * damping;

      // Relativistic velocity saturation v < c
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed >= c * 0.98) {
        const factor = (c * 0.98) / speed;
        p.vx *= factor;
        p.vy *= factor;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Elastic boundary reflection
      if (p.x < margin) {
        p.x = margin;
        p.vx = Math.abs(p.vx) * 0.8;
      } else if (p.x > this.width - margin) {
        p.x = this.width - margin;
        p.vx = -Math.abs(p.vx) * 0.8;
      }

      if (p.y < margin) {
        p.y = margin;
        p.vy = Math.abs(p.vy) * 0.8;
      } else if (p.y > this.height - margin) {
        p.y = this.height - margin;
        p.vy = -Math.abs(p.vy) * 0.8;
      }

      // Record trail coordinates for phosphor persistence
      if (this.settings.showTrails) {
        p.trail.unshift({ x: p.x, y: p.y, alpha: 1.0 });
        if (p.trail.length > 8) {
          p.trail.pop();
        }
        for (const t of p.trail) {
          t.alpha *= 0.82;
        }
      } else {
        p.trail = [];
      }

      p.energy = 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy);
    }
  }

  /**
   * Neuromorphic LIF (Leaky Integrate-and-Fire) Spiking Lattice & Memristor dynamics
   */
  private updateNeuromorphicLattice(dt: number) {
    const now = performance.now();

    for (const neuron of this.neurons) {
      // 1. Refractory recovery
      if (neuron.refractoryTime > 0) {
        neuron.refractoryTime -= dt * 16.6;
        neuron.membranePotential = neuron.resetPotential;
        continue;
      }

      // 2. Leaky integration towards rest potential (-70mV)
      neuron.membranePotential +=
        (neuron.restPotential - neuron.membranePotential) * neuron.decayRate * dt;

      // 3. Transduce passing letter particle electromagnetic flux into Synaptic Current
      let inducedCurrent = 0;

      for (const p of this.particles) {
        const dx = p.x - neuron.x;
        const dy = p.y - neuron.y;
        const distSq = dx * dx + dy * dy;
        const receptiveRadius = neuron.radius * 2.8;

        if (distSq < receptiveRadius * receptiveRadius) {
          const dist = Math.sqrt(distSq) || 1.0;
          const proximityFactor = 1.0 - dist / receptiveRadius;
          // Particle charge and velocity flux
          const flux = (Math.abs(p.charge) + 0.5) * (Math.sqrt(p.vx * p.vx + p.vy * p.vy) + 1.0);
          inducedCurrent += proximityFactor * flux * 4.2;
        }
      }

      neuron.membranePotential += inducedCurrent * dt;
      neuron.accumulatedCurrent = inducedCurrent;
      neuron.lastSpikeVisual = Math.max(0, neuron.lastSpikeVisual - 0.05);

      // 4. Threshold Spike Action Potential
      if (neuron.membranePotential >= neuron.threshold) {
        neuron.membranePotential = 35.0; // peak depolarization action potential
        neuron.refractoryTime = 12.0; // refractory period
        neuron.spikeHistory.push(now);
        neuron.lastSpikeVisual = 1.0;
        this.spikeCounter++;

        // Trigger bio-acoustic discharge tick
        soundEngine.playNeuronSpike(neuron.core);

        this.telemetry.recentSpikes.unshift({
          neuronId: neuron.id,
          time: now,
          core: neuron.core,
        });
        if (this.telemetry.recentSpikes.length > 12) {
          this.telemetry.recentSpikes.pop();
        }

        // Synaptic shockwave: propels nearby particles
        for (const p of this.particles) {
          const dx = p.x - neuron.x;
          const dy = p.y - neuron.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;

          if (dist < neuron.radius * 3.5) {
            const shockwave = (neuron.radius * 3.5 - dist) * 0.12;
            p.vx += (dx / dist) * shockwave;
            p.vy += (dy / dist) * shockwave;
          }
        }

        // STDP (Spike-Timing-Dependent Plasticity) Memristor weight reinforcement
        for (const targetId in neuron.weights) {
          const target = this.neurons.find((n) => n.id === targetId);
          if (target && target.lastSpikeVisual > 0.4) {
            // Long-Term Potentiation (LTP)
            neuron.weights[targetId] = Math.min(1.0, neuron.weights[targetId] + 0.04);
          } else {
            // Slight depression
            neuron.weights[targetId] = Math.max(0.05, neuron.weights[targetId] - 0.005);
          }
        }

        this.flashes.push({
          id: `spike-${Date.now()}-${Math.random()}`,
          x: neuron.x,
          y: neuron.y,
          radius: neuron.radius,
          maxRadius: neuron.radius * 2.5,
          color: neuron.core === 'alpha' ? '#38bdf8' : neuron.core === 'beta' ? '#4ade80' : neuron.core === 'gamma' ? '#f43f5e' : '#fbbf24',
          label: `${neuron.label} SPIKE`,
          life: 1.0,
          decayRate: 0.06,
          type: 'spike',
        });
      }
    }
  }

  /**
   * Update visual flashes
   */
  private updateFlashes(_dt: number) {
    for (const f of this.flashes) {
      f.life -= f.decayRate;
      f.radius += (f.maxRadius - f.radius) * 0.18;
    }
    this.flashes = this.flashes.filter((f) => f.life > 0.02);
  }

  /**
   * Compute live physical telemetry
   */
  private updateTelemetry() {
    const now = performance.now();

    // Spike rate Hz calculation
    if (now - this.lastSpikeCheckTime >= 500) {
      const elapsedSec = (now - this.lastSpikeCheckTime) / 1000;
      this.telemetry.spikeRateHz = Math.round(this.spikeCounter / elapsedSec);
      this.spikeCounter = 0;
      this.lastSpikeCheckTime = now;
    }

    // Neuromorphic operations per second
    if (now - this.lastOpsTime >= 1000) {
      this.telemetry.opsPerSecond = this.opsCounter;
      this.opsCounter = 0;
      this.lastOpsTime = now;
    }

    this.telemetry.particleCount = this.particles.length;
    this.telemetry.wordCount = this.hadrons.length;
    this.telemetry.stableHadrons = this.hadrons.filter((h) => h.isStable).length;

    let totalEnergy = 0;
    let sumVx = 0;
    let sumVy = 0;

    for (const p of this.particles) {
      totalEnergy += p.energy;
      sumVx += Math.abs(p.vx);
      sumVy += Math.abs(p.vy);
    }

    this.telemetry.totalKineticEnergy = Math.round(totalEnergy * 10) / 10;

    // Shannon / Thermodynamic entropy estimation
    const vMean = (sumVx + sumVy) / (this.particles.length * 2 || 1);
    let variance = 0;
    for (const p of this.particles) {
      const v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      variance += Math.pow(v - vMean, 2);
    }
    this.telemetry.entropy = Math.round((Math.log(variance + 1.1) / Math.LN2) * 10) / 10;
  }

  /**
   * Reset the collider chamber
   */
  public clearChamber() {
    this.particles = [];
    this.bonds = [];
    this.hadrons = [];
    this.flashes = [];
    this.telemetry.recognizedWords = [];
    this.telemetry.annihilationsCount = 0;
  }
}
