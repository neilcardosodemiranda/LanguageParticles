# Bare-Metal WASM + WebGPU Neuromorphic Crossbar Engine — Implementation Plan

> **Summary**: A bare-metal WebAssembly (SIMD) and WebGPU compute architecture designed for Apple Silicon (M4 16 GB Unified Memory) that scales the pure-physics neuromorphic computer from a small simulated substrate to millions of Compressed Sparse Row (CSR) memristors, enabling ultra-fast multi-book and conversational Q&A ingestion alongside real-time parallel crossbar resonance for fluent, autonomous conversational responses.

## User Review & Critical Decisions

- **WASM + WebGPU Division of Labor**: We will use an in-memory WebAssembly (WASM) linear memory engine with typed flat arrays for high-throughput token ingestion, dynamic vocabulary hashing, and Spike-Timing-Dependent Plasticity (STDP) conductance updates, paired with a WebGPU compute pipeline (WGSL shaders) that maps the CSR memristor crossbar directly into unified VRAM for massively parallel forward/backward current summation ($I_j = \sum_i G_{ij} V_i \Psi_{\text{Pauli}}$) and Winner-Take-All (WTA) lateral inhibition.
- **Memory Footprint & Apple M4 Capacity Presets**: Each sparse memristor synapse is packed into **8 bytes** (`targetTokenId: u16/u32`, `conductance: f16/f32`, `phaseDelay: u8`, `horizonMask: u8`). Users can dynamically switch between hardware capacity presets tailored to 16 GB Unified Memory:
  - **5M Memristors** (~40 MB Unified Memory) — Instantaneous warm-up & rapid literary experiments
  - **25M Memristors (Default M4 Preset)** (~200 MB Unified Memory) — Full multi-book library + conversational fluency
  - **100M Memristors (Extreme Bare-Metal Scale)** (~800 MB Unified Memory) — Massive corpus assimilation within browser `maxStorageBufferBindingSize` limits
- **Fluent Conversational Physics (No Backpropagation)**: Rather than relying on single-sentence retrieval or LLM matrix multiplication, conversational fluency emerges from **Multi-Horizon Crossbar Trajectory Synthesis**—combining 8 temporal delay lines ($\delta \in \{0..7\}$), bidirectional thermodynamic consistency, Pauli-exclusion refractory damping (preventing loops), and conversational phase-locking (`Prompt Wavefront` $\to$ `Resonant Answer Wavefront`).

---

## 1. Overview & Core Concept

Traditional neural networks spend 99% of their compute budget on dense matrix multiplications and backpropagation across billions of static weights, fighting against hardware physics. In biological and physical neuromorphic systems, **thermodynamics, wave interference, and electrostatics perform 95% of the computation automatically**:
1. **Kirchhoff's Current Law (Summation)** happens at the speed of light in parallel across crossbar columns.
2. **Ohm's Law ($I = G \cdot V$)** performs synaptic weighting directly in place.
3. **Pauli Orthogonality & Refractory Decay** naturally suppress repetitive loops and grammatical collisions without syntactic rule lists.

By moving away from JavaScript object allocations (`Map`, nested objects, garbage-collected strings) to **bare-metal C/C++-style flat linear memory via WebAssembly and WebGPU Storage Buffers**, a 16 GB Apple M4 iMac can host tens of millions of active memristive synapses in unified memory and stream thousands of words per second during training and conversational inference.

---

## 2. User Experience & Visual Design

Following the **Science, Space & Biotech** precision instrumentation aesthetic, the interface operates as an empirical hardware-calibrated laboratory console:

- **Aesthetic Direction & Color Palette**:
  - **60% Primary Canvas**: Deep space obsidian (`#07090E`) and clinical slate (`#0B0E17`).
  - **30% Structural Panels**: Flat instrument panels (`#111827`) with crisp `1px` hairline borders (`#1E293B`) and zero decorative bloat.
  - **10% Calibrated Telemetry Accents**: Laser cyan (`#06B6D4`) for WebGPU compute dispatches, phosphor emerald (`#10B981`) for WASM STDP synaptic locking, and telemetry amber (`#F59E0B`) for resonant conversational wavefronts.
- **Typography & Metric Discipline**:
  - **Interface Labels**: Clean technical sans-serif (`IBM Plex Sans` / `Inter`).
  - **Live Telemetry & Hardware Readouts**: Strict tabular monospace (`JetBrains Mono` / `font-mono tabular-nums`) with separated unit hierarchy (e.g., `25.00 M` memristors, `198.4 MB` VRAM, `412.8 µs` WGSL dispatch) to guarantee zero layout jitter during 60 FPS streaming.
  - **Text-First Status Glyphs**: Hardware states reported with explicit semantic glyphs (`● M4 UNIFIED VRAM ARMED`, `▲ CSR REALLOCATION`, `● WASM SIMD ACTIVE`).
- **Workspace Layout Architecture**:
  - **Top Hardware & Laboratory Ribbon**: 3-zone bar featuring active laboratory branch switching (`Linguistic Collider`, `Bare-Metal WASM + WebGPU Crossbar`, `Temporal Multiscale Chamber`), live M4 memory allocation gauge, and hardware backend indicator.
  - **Left Column — Corpus Streamer & Bare-Metal Capacity Controls**:
    - Capacity Preset Selector (`5M`, `25M`, `100M` memristors) with real-time byte-level RAM/VRAM breakdown (`8 bytes / synapse`).
    - Multi-Book & Conversational Dialogue Pack Loader (built-in Gutenberg library, Scientific Dialogues, Conversational Q&A packs, plus drag-and-drop multi-file `.txt` / `.json` streaming).
    - STDP Physical Hyperparameters: Learning rate ($\eta$), temporal horizon depth ($\delta = 0..7$), refractory decay ($\tau_{\text{ref}}$), and Pauli exclusion strength ($\Omega$).
  - **Center Stage — Interactive Conversational Resonance Terminal & Crossbar Matrix**:
    - **Live Conversational Prompt & Token-by-Token Wavefront Streamer**: Ask open-ended or book-specific questions and watch the WebGPU crossbar synthesize fluent multi-clause responses token-by-token, displaying the active H0–H7 soma firing path, real-time conductance current ($I = G \cdot V \cdot \Psi$), and stuttering/loop suppression ratio.
    - **Hardware Crossbar Conductance Heatmap & Spike Raster**: High-density canvas visualizing active CSR row/column current summation, top resonant candidate tokens, and lateral inhibition competition.
  - **Bottom Tray — WASM + WebGPU Kernel Profiler**:
    - Live comparison of WASM STDP ingestion speed (`tokens/sec`, `synapses updated/sec`), WebGPU compute pass latency (`µs`), workgroup occupancy, and unified memory bandwidth (`GB/s`).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Compressed Sparse Row (CSR) Linear Layout vs. Dense Crossbar Matrix
- **Trade-Off**: A dense $100,000 \times 100,000$ vocabulary crossbar requires $10^{10}$ floats ($40\text{ GB}$ of RAM), which overflows a 16 GB iMac. Natural language, however, follows a power-law sparsity distribution where each word or character only forms meaningful multi-horizon transitions with a bounded local neighborhood.
- **Resolution**: We implement a **Dynamic Block-CSR (Compressed Sparse Row) Flat Pool** in shared `ArrayBuffer` / WebAssembly linear memory. Each synapse consumes exactly **8 bytes** (`targetId: u32`, `conductance_fp16: u16`, `horizon_phase: u16`). This allows **25,000,000 memristors to fit in just 200 MB of Unified Memory**, leaving over 15 GB of headroom on an M4 iMac.

### Decision 2: Compiled In-Memory WASM Binary Kernel + WGSL Compute Shader
- **Trade-Off**: External `.wasm` binary fetches can fail or require complex external build toolchains in browser sandboxes, while pure JavaScript loops bottleneck on bitwise hashing and STDP decay over millions of edges.
- **Resolution**: We construct an **inline WebAssembly SIMD-compatible binary module** (compiled directly from structured WASM bytecode / typed memory kernels at initialization) operating over a shared `WebAssembly.Memory` arena, paired with a **WebGPU Compute Pipeline (WGSL)** that binds the exact same flat CSR arrays (`rowPtr`, `colIdx`, `conductance`, `tokenPotentials`) in GPU `storage` buffers for parallel inference.

### Decision 3: Conversational Fluency via Multi-Horizon Trajectory Synthesis
- **Trade-Off**: Standard Markov chains or single-step bigram crossbars lose context after 2–3 words, while pure sentence retrieval cannot synthesize novel conversational replies.
- **Resolution**: During inference, the WebGPU shader evaluates **8 simultaneous temporal delay horizons ($\delta \in \{0..7\}$)** anchored by the query's semantic attractor nodes. Each generated token updates a sliding **Active Context Wavefront** ($V_{t}, V_{t-1}, \dots, V_{t-7}$) and applies **Pauli Refractory Inhibition** to recently fired somas, driving a smooth, grammatically coherent trajectory across sentence boundaries until a natural thermodynamic ground state (punctuation attractor) is reached.

---

## 4. Technical Architecture & Data Strategy

### End-to-End Bare-Metal Pipeline Diagram

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                   CORPUS & CONVERSATIONAL Q&A STREAMER                       │
│     Gutenberg Books + Multi-Turn Q&A Packs + Drag-and-Drop File Chunks       │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │ Raw UTF-8 Byte / Token Stream
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│              WASM LINEAR MEMORY ENGINE (STDP & CSR COMPILER)                 │
│  ┌─────────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐  │
│  │ FNV-1a / Robin-Hood     │  │ 8-Horizon Delay Line │  │ 8-Byte Synapse  │  │
│  │ Vocabulary Hash Table   │─▶│ Circular Spike Ring  │─▶│ CSR Arena Pool  │  │
│  │ (Zero GC String Alloc)  │  │ (δ = 0..7 Horizons)  │  │ (5M–100M Edges) │  │
│  └─────────────────────────┘  └──────────────────────┘  └────────┬────────┘  │
└──────────────────────────────────────────────────────────────────┼───────────┘
                                                                   │ Zero-Copy /
                                                                   │ Fast Queue Write
                                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│           APPLE M4 UNIFIED MEMORY — WEBGPU COMPUTE ENGINE (WGSL)             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Storage Buffers: row_ptr<u32> | col_idx<u32> | cond_phase<u32> | V<f32>│  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ @compute @workgroup_size(256) fn crossbar_resonance_pass()             │  │
│  │   • Parallel Kirchhoff Current Summation: I_j = Σ G_ij · V_i(δ)        │  │
│  │   • Bidirectional Context Attractor Resonance (Query Target Locking)   │  │
│  │   • Pauli-Exclusion Refractory Suppression & Lateral Inhibition (WTA)  │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
└──────────────────────────────────────┼───────────────────────────────────────┘
                                       │ Staging Readback (Top-K Resonant Somas)
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│               CONVERSATIONAL WAVEFRONT & TELEMETRY CONSOLE                   │
│   Real-Time Token Stream • 8-Soma Phase Oscilloscope • VRAM/GFLOPs Profiler  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Flat Binary Data Structures (Zero-GC Layout)

1. **Vocabulary Node Table (`SoA` - Structure of Arrays)**:
   - `tokenHash: Uint32Array` — 32-bit FNV-1a hash of each unique word/punctuation token.
   - `tokenFreq: Uint32Array` — Empirical corpus count for thermodynamic baseline entropy $H(w)$ and inverse-frequency salience weighting.
   - `tokenRolePhase: Float32Array` — Mean normalized sentence position $s_{\text{pos}} \in [0, 1]$ and directional flow polarity.
2. **Compressed Sparse Row (CSR) Memristor Crossbar**:
   - `csrRowPtr: Uint32Array (size: V + 1)` — Start and end indices in the synapse pool for source token $i$.
   - `csrColAndHorizon: Uint32Array (size: M)` — Packed 32-bit word: `[31..8: targetTokenId (24 bits, up to 16.7M vocab) | 7..0: horizonMask & phase bin (8 bits)]`.
   - `csrConductance: Float32Array` (or packed `Uint32Array` with `f16` forward/backward conductance $G_{\text{fwd}}, G_{\text{bwd}}$) — Synaptic conductance updated via STDP rule:
     $$\Delta G_{ij}(\delta) = \eta \cdot \exp\left(-\frac{\delta}{\tau_{\text{STDP}}}\right) \cdot \left(1 - G_{ij}\right)$$
3. **Interactive State & Verification Roadmap**:
   - **Phase 1**: Build the **Bare-Metal WASM + CSR Memory Pool** and extend the WebGPU engine with the **WGSL Crossbar Resonance Compute Pipeline** alongside the existing particle kinematics kernel.
   - **Phase 2**: Integrate the **Multi-Book + Conversational Q&A Corpus Streamer** with built-in Gutenberg books, scientific Q&A dialogues, and chunked file ingestion capable of processing 500,000+ tokens/sec.
   - **Phase 3**: Build the **Bare-Metal Crossbar Console & Conversational Resonance UI** within the Gutenberg Trainer / Collider workspace, featuring live M4 VRAM telemetry, capacity scaling (`5M` / `25M` / `100M`), and autonomous conversational Q&A synthesis.
   - **Phase 4**: **Frontal Lobe Continuous Synthesis Operator (Zero Heuristic Selection Rules)**:
     - Replaced discrete `if/else` selection branches (`SELECT_LEFT` / `SELECT_RIGHT`) with a continuous wave-mixer operator where the Frontal Lobe **always synthesizes an answer** (`action = 'SYNTHESIZE'`).
     - Dynamically computes continuous hemispheric conductance currents $J_L = E_L \cdot G_L$ and $J_R = E_R \cdot G_R$, normalized into continuous flux weights $\alpha_L, \alpha_R$.
     - Strictly enforces bicameral architectural invariants:
       `assert(left.final_output === null)`
       `assert(right.final_output === null)`
       `assert(callosum.final_output === null)`
       `assert(frontal.final_output !== null)`
       `assert(response === frontal.final_output)`
    - **Phase 5**: **Massive Open Q&A Datasets & Instruction Streamer (Completed)**:
      - Integrated hundreds of thousands of instruction-tuning, reading-comprehension, and scientific Q&A pairs directly into the 25M–100M Neuromorphic CSR Memristor Crossbar.
      - **Dataset Catalog**: Stanford Alpaca 52K, Databricks Dolly 15K, Stanford SQuAD 2.0 (100k+), StackExchange Electrical Engineering & Circuit Physics (25K), OpenAssistant (20K), SciQ STEM (18K), and Philosophy of Mind (12K).
      - **High-Throughput Chunked Ingestion Engine**: `ingestQaPairStream` in `wasmMemristorEngine.ts` mapping stimulus $S(t-1)$ and response $S(t)$ into Right Hemisphere narrative molecules with non-blocking UI slicing (~120k–250k tok/s).
      - **Server-side Streaming Endpoints**: `/api/qa-datasets/catalog`, `/api/qa-datasets/stream/:datasetId` with local disk caching and pagination, and `/api/qa-datasets/upload` for custom user JSON/JSONL/CSV datasets.
      - **Interactive UI**: `MassiveQaDatasetsView.tsx` embedded with live batch controls, continuous auto-streamer, real-time Q&A stimulus-response ticker, and a live neuromorphic test query terminal.
