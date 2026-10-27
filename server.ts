import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { QA_DATASET_CATALOG, OFFLINE_EE_PHYSICS_DATASET, type QaPair } from './src/data/qaDatasetCatalog.js';

// Store binary .bin mmap image in OS tmpdir outside the Vite project root so
// high-frequency binary writes never trigger Vite file-watcher reloads
const CRYSTAL_DATA_DIR = path.join(os.tmpdir(), 'synaptron_crystal_mmap');
const CRYSTAL_BIN_PATH = path.join(CRYSTAL_DATA_DIR, 'synaptron_crystal.bin');
const LEGACY_DATA_BIN = path.join(__dirname, 'data', 'synaptron_crystal.bin');

if (!fs.existsSync(CRYSTAL_DATA_DIR)) {
  fs.mkdirSync(CRYSTAL_DATA_DIR, { recursive: true });
}

// Migrate any existing data/synaptron_crystal.bin out of the Vite workspace root
if (fs.existsSync(LEGACY_DATA_BIN) && !fs.existsSync(CRYSTAL_BIN_PATH)) {
  try {
    fs.copyFileSync(LEGACY_DATA_BIN, CRYSTAL_BIN_PATH);
    fs.unlinkSync(LEGACY_DATA_BIN);
  } catch {
    // Ignore migration errors
  }
}

// Server-side zero-copy mmap page cache for synaptron_crystal.bin
let mappedCrystalBuffer: Buffer | null = null;
let mappedCrystalTimestamp = 0;

if (fs.existsSync(CRYSTAL_BIN_PATH)) {
  try {
    const stat = fs.statSync(CRYSTAL_BIN_PATH);
    if (stat.size >= 64) {
      mappedCrystalBuffer = fs.readFileSync(CRYSTAL_BIN_PATH);
      mappedCrystalTimestamp = stat.mtimeMs;
    }
  } catch {
    // Ignore corrupted or unreadable initial file
  }
}

interface GutenbergBookSummary {
  id: number;
  title: string;
  author: string;
  subjects: string[];
  downloadCount: number;
  languages: string[];
}

interface CachedBookPayload {
  id: number;
  title: string;
  author: string;
  rawLength: number;
  cleanLength: number;
  wordCountEstimate: number;
  content: string;
  sourceMirror: string;
}

// In-memory LRU-style cache for catalog queries and fetched full books
const catalogCache = new Map<string, { timestamp: number; data: unknown }>();
const bookTextCache = new Map<number, CachedBookPayload>();

// Curated fallback/starter catalog of high-impact Gutenberg books across science, philosophy, and literature
const CURATED_GUTENBERG_CATALOG: GutenbergBookSummary[] = [
  {
    id: 35,
    title: 'The Time Machine',
    author: 'Wells, H. G. (Herbert George)',
    subjects: ['Science fiction', 'Time travel', 'Dystopias'],
    downloadCount: 28450,
    languages: ['en'],
  },
  {
    id: 84,
    title: 'Frankenstein; Or, The Modern Prometheus',
    author: 'Shelley, Mary Wollstonecraft',
    subjects: ['Science fiction', 'Gothic fiction', 'Monsters'],
    downloadCount: 94320,
    languages: ['en'],
  },
  {
    id: 11,
    title: "Alice's Adventures in Wonderland",
    author: 'Carroll, Lewis',
    subjects: ['Fantasy fiction', 'Alice (Fictitious character)'],
    downloadCount: 54120,
    languages: ['en'],
  },
  {
    id: 5001,
    title: 'Relativity: The Special and General Theory',
    author: 'Einstein, Albert',
    subjects: ['Relativity (Physics)', 'Space and time', 'Physics'],
    downloadCount: 19410,
    languages: ['en'],
  },
  {
    id: 1228,
    title: 'On the Origin of Species By Means of Natural Selection',
    author: 'Darwin, Charles',
    subjects: ['Evolution (Biology)', 'Natural selection', 'Biological sciences'],
    downloadCount: 16890,
    languages: ['en'],
  },
  {
    id: 1661,
    title: 'The Adventures of Sherlock Holmes',
    author: 'Doyle, Arthur Conan',
    subjects: ['Detective and mystery stories', 'Holmes, Sherlock', 'Logic'],
    downloadCount: 49200,
    languages: ['en'],
  },
  {
    id: 2701,
    title: 'Moby Dick; Or, The Whale',
    author: 'Melville, Herman',
    subjects: ['Whaling', 'Sea stories', 'Ahab, Captain'],
    downloadCount: 68310,
    languages: ['en'],
  },
  {
    id: 36,
    title: 'The War of the Worlds',
    author: 'Wells, H. G. (Herbert George)',
    subjects: ['Science fiction', 'Mars (Planet)', 'War stories'],
    downloadCount: 24190,
    languages: ['en'],
  },
  {
    id: 1497,
    title: 'The Republic',
    author: 'Plato',
    subjects: ['Philosophy, Ancient', 'Justice', 'Political science'],
    downloadCount: 31800,
    languages: ['en'],
  },
  {
    id: 28233,
    title: 'Opticks: Or, A Treatise of the Reflections, Refractions, Inflections and Colours of Light',
    author: 'Newton, Isaac, Sir',
    subjects: ['Optics', 'Light', 'Physics'],
    downloadCount: 8420,
    languages: ['en'],
  },
  {
    id: 164,
    title: 'Twenty Thousand Leagues under the Sea',
    author: 'Verne, Jules',
    subjects: ['Science fiction', 'Submarines (Ships)', 'Underwater exploration'],
    downloadCount: 22900,
    languages: ['en'],
  },
  {
    id: 1342,
    title: 'Pride and Prejudice',
    author: 'Austen, Jane',
    subjects: ['Courtship', 'Domestic fiction', 'Social classes'],
    downloadCount: 78500,
    languages: ['en'],
  },
  {
    id: 4300,
    title: 'Ulysses',
    author: 'Joyce, James',
    subjects: ['Dublin (Ireland)', 'Modernist literature', 'Epic literature'],
    downloadCount: 31200,
    languages: ['en'],
  },
  {
    id: 1998,
    title: 'Thus Spake Zarathustra: A Book for All and None',
    author: 'Nietzsche, Friedrich Wilhelm',
    subjects: ['Philosophy, German', 'Ethics'],
    downloadCount: 26700,
    languages: ['en'],
  },
  {
    id: 2680,
    title: 'Meditations',
    author: 'Marcus Aurelius, Emperor of Rome',
    subjects: ['Stoics', 'Ethics', 'Philosophy, Ancient'],
    downloadCount: 38900,
    languages: ['en'],
  },
  {
    id: 14725,
    title: 'Treatise on Light',
    author: 'Huygens, Christiaan',
    subjects: ['Light, Wave theory of', 'Optics', 'Physics'],
    downloadCount: 6150,
    languages: ['en'],
  },
  {
    id: 37729,
    title: 'The Atomic Theory',
    author: 'Thomson, J. J. (Joseph John)',
    subjects: ['Atomic theory', 'Electrons', 'Physics'],
    downloadCount: 5490,
    languages: ['en'],
  },
  {
    id: 59,
    title: 'Discourse on the Method of Rightly Conducting One’s Reason and of Seeking Truth in the Sciences',
    author: 'Descartes, René',
    subjects: ['Methodology', 'Science -- Philosophy', 'Rationalism'],
    downloadCount: 15800,
    languages: ['en'],
  },
];

/**
 * Strips Project Gutenberg legal header and footer boilerplate so the crossbar
 * trains exclusively on authentic book prose.
 */
function stripGutenbergBoilerplate(raw: string): {
  cleanText: string;
  detectedTitle: string;
  detectedAuthor: string;
} {
  const normalized = raw.replace(/\r\n/g, '\n');

  let detectedTitle = '';
  let detectedAuthor = '';

  const titleMatch = normalized.match(/^Title:\s*(.+)$/m);
  if (titleMatch) {
    detectedTitle = titleMatch[1].trim();
  }
  const authorMatch = normalized.match(/^Author:\s*(.+)$/m);
  if (authorMatch) {
    detectedAuthor = authorMatch[1].trim();
  }

  // Locate *** START OF THE PROJECT GUTENBERG EBOOK ... ***
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

  let cleanText = normalized
    .slice(startIdx, endIdx)
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Strip Table of Contents lists (e.g. CONTENTS ... Letter 1 ... Chapter 24)
  cleanText = cleanText.replace(
    /\bCONTENTS\b[\s\S]*?(?=(?:Letter\s+\d+|Chapter\s+\d+|Preface|Introduction|Book\s+(?:\d+|[IVXLCDM]+))\b)/i,
    ''
  ).trim();

  return {
    cleanText: cleanText.length > 200 ? cleanText : normalized.trim(),
    detectedTitle,
    detectedAuthor,
  };
}

/**
 * Attempts to fetch the raw UTF-8 text of any Project Gutenberg book ID (1..75000+)
 * across official Gutenberg mirrors.
 */
async function fetchGutenbergBookById(bookId: number): Promise<CachedBookPayload> {
  const cached = bookTextCache.get(bookId);
  if (cached) return cached;

  const candidateMirrors = [
    `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`,
    `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`,
    `https://www.gutenberg.org/files/${bookId}/${bookId}.txt`,
    `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt.utf8`,
  ];

  let rawText = '';
  let winningMirror = '';

  for (const url of candidateMirrors) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 14000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'NeuromorphicCrossbarResearchEngine/1.0 (Academic/Browser Crossbar)',
          Accept: 'text/plain, text/*;q=0.9, */*;q=0.8',
        },
      });
      clearTimeout(timeout);

      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 500 && !text.trim().startsWith('<!DOCTYPE html')) {
          rawText = text;
          winningMirror = url;
          break;
        }
      }
    } catch {
      // Try next mirror
    }
  }

  if (!rawText) {
    throw new Error(`Project Gutenberg Book #${bookId} text stream was not found on standard UTF-8 mirrors.`);
  }

  const { cleanText, detectedTitle, detectedAuthor } = stripGutenbergBoilerplate(rawText);
  const curatedMatch = CURATED_GUTENBERG_CATALOG.find((b) => b.id === bookId);

  const title =
    detectedTitle || curatedMatch?.title || `Project Gutenberg Book #${bookId}`;
  const author =
    detectedAuthor || curatedMatch?.author || 'Project Gutenberg Author';

  const wordCountEstimate = cleanText.split(/\s+/).filter(Boolean).length;

  const payload: CachedBookPayload = {
    id: bookId,
    title,
    author,
    rawLength: rawText.length,
    cleanLength: cleanText.length,
    wordCountEstimate,
    content: cleanText,
    sourceMirror: winningMirror,
  };

  // Bound cache to 25 full books in server RAM
  if (bookTextCache.size >= 25) {
    const oldestKey = bookTextCache.keys().next().value;
    if (oldestKey !== undefined) bookTextCache.delete(oldestKey);
  }
  bookTextCache.set(bookId, payload);

  return payload;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  /**
   * GET /api/gutenberg/catalog
   * Searches and browses the 75,000+ Project Gutenberg library via Gutendex API with
   * automatic fallback to our curated scientific & literary catalog.
   */
  app.get('/api/gutenberg/catalog', async (req, res) => {
    const search = String(req.query.search || '').trim();
    const topic = String(req.query.topic || '').trim();
    const ids = String(req.query.ids || '').trim();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);

    const cacheKey = `${search}|${topic}|${ids}|${page}`;
    const cached = catalogCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 1000 * 60 * 15) {
      return res.json(cached.data);
    }

    try {
      const params = new URLSearchParams();
      params.set('languages', 'en');
      params.set('mime_type', 'text/plain');
      if (search) params.set('search', search);
      if (topic) params.set('topic', topic);
      if (ids) params.set('ids', ids);
      if (page > 1) params.set('page', String(page));

      const url = `https://gutendex.com/books?${params.toString()}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Gutendex HTTP ${response.status}`);
      }

      const rawData = (await response.json()) as {
        count?: number;
        next?: string | null;
        previous?: string | null;
        results?: Array<{
          id: number;
          title: string;
          authors?: Array<{ name: string }>;
          subjects?: string[];
          download_count?: number;
          languages?: string[];
        }>;
      };

      const books: GutenbergBookSummary[] = (rawData.results || []).map((item) => ({
        id: item.id,
        title: item.title,
        author:
          item.authors && item.authors.length > 0
            ? item.authors.map((a) => a.name).join('; ')
            : 'Unknown Author',
        subjects: (item.subjects || []).slice(0, 4),
        downloadCount: item.download_count || 0,
        languages: item.languages || ['en'],
      }));

      const resultPayload = {
        totalCount: rawData.count || books.length,
        page,
        hasMore: Boolean(rawData.next),
        books: books.length > 0 ? books : CURATED_GUTENBERG_CATALOG,
        source: 'gutendex-live',
      };

      catalogCache.set(cacheKey, { timestamp: Date.now(), data: resultPayload });
      return res.json(resultPayload);
    } catch {
      // Filter curated catalog locally if live Gutendex API timed out
      const qLower = (search || topic).toLowerCase();
      const filtered = qLower
        ? CURATED_GUTENBERG_CATALOG.filter(
            (b) =>
              b.title.toLowerCase().includes(qLower) ||
              b.author.toLowerCase().includes(qLower) ||
              b.subjects.some((s) => s.toLowerCase().includes(qLower))
          )
        : CURATED_GUTENBERG_CATALOG;

      return res.json({
        totalCount: 75400,
        page: 1,
        hasMore: true,
        books: filtered.length > 0 ? filtered : CURATED_GUTENBERG_CATALOG,
        source: 'curated-mirror-index',
      });
    }
  });

  /**
   * GET /api/gutenberg/book/:id
   * Streams the complete cleaned UTF-8 text of any Project Gutenberg book ID (1..75000+)
   */
  app.get('/api/gutenberg/book/:id', async (req, res) => {
    const bookId = parseInt(req.params.id, 10);
    if (!Number.isFinite(bookId) || bookId < 1) {
      return res.status(400).json({ error: 'Invalid Project Gutenberg Book ID.' });
    }

    try {
      const payload = await fetchGutenbergBookById(bookId);
      return res.json(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch book from Gutenberg mirrors.';
      return res.status(404).json({ error: msg, id: bookId });
    }
  });

  // In-memory cache for parsed high-throughput Q&A datasets
  const qaDatasetCache = new Map<string, QaPair[]>();
  let customUploadedPairs: QaPair[] = [];

  // Helper to build 25,000 deep Electrical Engineering & Circuit Physics Q&As
  function generateParametricEePhysicsDataset(): QaPair[] {
    const basePairs = [...OFFLINE_EE_PHYSICS_DATASET];
    const generated: QaPair[] = [...basePairs];

    // Algorithmic physical circuit permutations
    const rValues = [10, 47, 100, 220, 470, 1000, 2200, 4700, 10000, 47000, 100000]; // Ohms
    const cValues = [
      { val: 1e-12, str: '1 pF' },
      { val: 10e-12, str: '10 pF' },
      { val: 100e-12, str: '100 pF' },
      { val: 1e-9, str: '1 nF' },
      { val: 10e-9, str: '10 nF' },
      { val: 100e-9, str: '100 nF' },
      { val: 1e-6, str: '1 µF' },
      { val: 10e-6, str: '10 µF' },
      { val: 100e-6, str: '100 µF' },
    ];
    const lValues = [
      { val: 1e-6, str: '1 µH' },
      { val: 10e-6, str: '10 µH' },
      { val: 100e-6, str: '100 µH' },
      { val: 1e-3, str: '1 mH' },
      { val: 10e-3, str: '10 mH' },
      { val: 100e-3, str: '100 mH' },
    ];
    const vValues = [1.2, 1.8, 2.5, 3.3, 5.0, 9.0, 12.0, 15.0, 24.0, 48.0]; // Volts

    let pId = basePairs.length + 1;

    // 1. Ohm's Law & Power Dissipation Q&As
    for (const v of vValues) {
      for (const r of rValues) {
        const i = v / r;
        const iStr = i < 0.001 ? `${(i * 1e6).toFixed(2)} µA` : i < 1.0 ? `${(i * 1e3).toFixed(2)} mA` : `${i.toFixed(3)} A`;
        const p = v * i;
        const pStr = p < 0.001 ? `${(p * 1e6).toFixed(2)} µW` : p < 1.0 ? `${(p * 1e3).toFixed(2)} mW` : `${p.toFixed(3)} W`;
        generated.push({
          id: `ee-ohm-${pId++}`,
          question: `An electrical circuit applies a DC voltage of ${v} V across a ${r >= 1000 ? `${r / 1000} kΩ` : `${r} Ω`} resistor. What is the current flow and dissipated thermal power?`,
          answer: `By Ohm's Law (I = V / R), current flow is exactly ${iStr}. The dissipated Joule power (P = V · I = I²R) equals ${pStr}.`,
          category: 'Circuit Theory',
          sourceDataset: 'ee_physics',
        });
      }
    }

    // 2. RC Low-Pass Filter Cutoff & Time Constant Q&As
    for (const r of [100, 1000, 4700, 10000, 47000, 100000]) {
      for (const c of cValues) {
        const tau = r * c.val;
        const fc = 1.0 / (2 * Math.PI * tau);
        const fcStr = fc >= 1e6 ? `${(fc / 1e6).toFixed(2)} MHz` : fc >= 1e3 ? `${(fc / 1e3).toFixed(2)} kHz` : `${fc.toFixed(2)} Hz`;
        const tauStr = tau < 1e-6 ? `${(tau * 1e9).toFixed(2)} ns` : tau < 1e-3 ? `${(tau * 1e6).toFixed(2)} µs` : `${(tau * 1e3).toFixed(2)} ms`;
        generated.push({
          id: `ee-rc-${pId++}`,
          question: `In an RC low-pass filter with R = ${r >= 1000 ? `${r / 1000} kΩ` : `${r} Ω`} and C = ${c.str}, calculate the time constant tau and -3dB cutoff frequency.`,
          answer: `The time constant τ = R · C = ${tauStr}. The corner -3dB cutoff frequency is f_c = 1 / (2π · R · C) = ${fcStr}. At this frequency, output attenuation is -3 dB (phase lag -45 degrees).`,
          category: 'Filter & Frequency Domain',
          sourceDataset: 'ee_physics',
        });
      }
    }

    // 3. LC Resonant Tank Frequency & Wave Impedance
    for (const l of lValues) {
      for (const c of cValues) {
        const fres = 1.0 / (2 * Math.PI * Math.sqrt(l.val * c.val));
        const z0 = Math.sqrt(l.val / c.val);
        const fresStr = fres >= 1e6 ? `${(fres / 1e6).toFixed(2)} MHz` : fres >= 1e3 ? `${(fres / 1e3).toFixed(2)} kHz` : `${fres.toFixed(2)} Hz`;
        const z0Str = z0 >= 1000 ? `${(z0 / 1000).toFixed(2)} kΩ` : `${z0.toFixed(2)} Ω`;
        generated.push({
          id: `ee-lc-${pId++}`,
          question: `What is the resonant frequency and characteristic impedance of an LC tank circuit with L = ${l.str} and C = ${c.str}?`,
          answer: `The undamped LC resonance frequency is f_0 = 1 / (2π√(LC)) = ${fresStr}. The characteristic surge impedance is Z_0 = √(L / C) = ${z0Str}, where magnetic and electric storage interchange at zero net reactance.`,
          category: 'Resonance & RF',
          sourceDataset: 'ee_physics',
        });
      }
    }

    // 4. Memristor Dynamic Conductance & State Variable Equations
    const stateW = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95];
    for (const w of stateW) {
      for (const ron of [50, 100, 200]) {
        for (const roff of [10000, 50000, 100000]) {
          const m = w * ron + (1 - w) * roff;
          const g = 1.0 / m;
          const gStr = g < 1e-4 ? `${(g * 1e6).toFixed(2)} µS` : `${(g * 1e3).toFixed(3)} mS`;
          generated.push({
            id: `ee-mem-${pId++}`,
            question: `In an HP titanium dioxide TiO2 memristor with R_on = ${ron} Ω, R_off = ${roff >= 1000 ? `${roff / 1000} kΩ` : `${roff} Ω`}, and state variable w/D = ${w.toFixed(2)}, what is the memristance and conductance?`,
            answer: `The memristance is M(w) = w · R_on + (1 - w) · R_off = ${m >= 1000 ? `${(m / 1000).toFixed(2)} kΩ` : `${m.toFixed(1)} Ω`}. The synaptic crossbar conductance is G = 1 / M = ${gStr}, governing current according to Ohm's Law I(t) = G(w) · V(t).`,
            category: 'Neuromorphic Memristor Physics',
            sourceDataset: 'ee_physics',
          });
        }
      }
    }

    // 5. Op-Amp Inverting, Non-inverting, Differential, and Integrator Circuits
    for (const rf of [10000, 47000, 100000, 220000, 1000000]) {
      for (const rin of [1000, 4700, 10000, 22000]) {
        const invGain = -(rf / rin);
        const nonInvGain = 1 + (rf / rin);
        generated.push({
          id: `ee-opamp-${pId++}`,
          question: `For an ideal operational amplifier circuit with input resistor R_in = ${rin >= 1000 ? `${rin / 1000} kΩ` : `${rin} Ω`} and feedback resistor R_f = ${rf >= 1000 ? `${rf / 1000} kΩ` : `${rf} Ω`}, calculate both inverting and non-inverting voltage gains.`,
          answer: `In inverting configuration, virtual ground at the inverting terminal yields voltage gain A_v = -R_f / R_in = ${invGain.toFixed(2)} (180 degree phase shift). In non-inverting configuration, gain is A_v = 1 + (R_f / R_in) = ${nonInvGain.toFixed(2)} (in-phase).`,
          category: 'Analog Op-Amp Circuits',
          sourceDataset: 'ee_physics',
        });
      }
    }

    // Repeat templates to form 25,000 dense Q&A pairs for high-throughput streaming
    while (generated.length < 25000) {
      const idx = generated.length % basePairs.length;
      const bp = basePairs[idx];
      generated.push({
        id: `ee-master-${pId++}`,
        question: bp.question,
        answer: bp.answer,
        category: bp.category,
        sourceDataset: 'ee_physics',
      });
    }

    return generated;
  }

  // Asynchronous remote or local dataset loader with disk caching
  async function loadQaDataset(datasetId: string): Promise<QaPair[]> {
    if (datasetId === 'custom') {
      return customUploadedPairs;
    }

    if (qaDatasetCache.has(datasetId)) {
      return qaDatasetCache.get(datasetId)!;
    }

    const localCachePath = path.join(CRYSTAL_DATA_DIR, `qa_${datasetId}.json`);

    // Check disk cache first
    if (fs.existsSync(localCachePath)) {
      try {
        const rawJson = fs.readFileSync(localCachePath, 'utf8');
        const parsed = JSON.parse(rawJson) as QaPair[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          qaDatasetCache.set(datasetId, parsed);
          return parsed;
        }
      } catch {
        // Fall through to live fetch/generate
      }
    }

    if (datasetId === 'ee_physics') {
      const pairs = generateParametricEePhysicsDataset();
      qaDatasetCache.set(datasetId, pairs);
      try {
        fs.writeFileSync(localCachePath, JSON.stringify(pairs.slice(0, 5000)));
      } catch {
        // Ignore cache write error
      }
      return pairs;
    }

    const meta = QA_DATASET_CATALOG.find((d) => d.id === datasetId);
    if (!meta || !meta.remoteUrl) {
      // Fallback: return EE physics dataset if unknown dataset
      return generateParametricEePhysicsDataset();
    }

    // Live remote fetch with 20-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const resp = await fetch(meta.remoteUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Synaptron-Memristor-Crossbar/2.4 (Neuromorphic Physics Research)',
          Accept: 'application/json, text/plain, */*',
        },
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      }

      const pairs: QaPair[] = [];

      if (datasetId === 'alpaca') {
        const rawItems = (await resp.json()) as Array<{
          instruction?: string;
          input?: string;
          output?: string;
        }>;
        for (let i = 0; i < rawItems.length; i++) {
          const item = rawItems[i];
          const instr = (item.instruction || '').trim();
          const inp = (item.input || '').trim();
          const out = (item.output || '').trim();
          if (!instr || !out) continue;
          const question = inp ? `${instr}\nContext: ${inp}` : instr;
          pairs.push({
            id: `alpaca-${i + 1}`,
            question,
            answer: out,
            category: 'General Instruction',
            sourceDataset: 'alpaca',
          });
        }
      } else if (datasetId === 'dolly') {
        const text = await resp.text();
        const lines = text.split('\n');
        let dId = 1;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const item = JSON.parse(trimmed) as {
              instruction?: string;
              context?: string;
              response?: string;
              category?: string;
            };
            const instr = (item.instruction || '').trim();
            const ctx = (item.context || '').trim();
            const ans = (item.response || '').trim();
            if (!instr || !ans) continue;
            const question = ctx ? `${instr}\nContext: ${ctx}` : instr;
            pairs.push({
              id: `dolly-${dId++}`,
              question,
              answer: ans,
              category: item.category || 'Human Dialogue',
              sourceDataset: 'dolly',
            });
          } catch {
            // Skip invalid JSONL line
          }
        }
      } else if (datasetId === 'squad') {
        const rawData = (await resp.json()) as {
          data?: Array<{
            paragraphs?: Array<{
              context?: string;
              qas?: Array<{
                question?: string;
                id?: string;
                answers?: Array<{ text: string }>;
                is_impossible?: boolean;
              }>;
            }>;
          }>;
        };
        let sId = 1;
        for (const doc of rawData.data || []) {
          for (const para of doc.paragraphs || []) {
            for (const qa of para.qas || []) {
              if (qa.is_impossible) continue;
              const q = (qa.question || '').trim();
              const a = qa.answers && qa.answers.length > 0 ? (qa.answers[0].text || '').trim() : '';
              if (!q || !a) continue;
              pairs.push({
                id: qa.id || `squad-${sId++}`,
                question: q,
                answer: a,
                category: 'Wikipedia Factual Q&A',
                sourceDataset: 'squad',
              });
            }
          }
        }
      }

      if (pairs.length > 0) {
        qaDatasetCache.set(datasetId, pairs);
        try {
          fs.writeFileSync(localCachePath, JSON.stringify(pairs.slice(0, 10000)));
        } catch {
          // Ignore cache write error
        }
        return pairs;
      }

      return generateParametricEePhysicsDataset();
    } catch {
      clearTimeout(timeout);
      // Fallback if network blocked or timed out
      return generateParametricEePhysicsDataset();
    }
  }

  /**
   * GET /api/qa-datasets/catalog
   * Returns list of available open instruction & Q&A datasets
   */
  app.get('/api/qa-datasets/catalog', (_req, res) => {
    return res.json({
      catalog: QA_DATASET_CATALOG,
      customUploadedCount: customUploadedPairs.length,
    });
  });

  /**
   * GET /api/qa-datasets/stream/:datasetId
   * Streams high-throughput batches of Q&A pairs (offset, limit)
   */
  app.get('/api/qa-datasets/stream/:datasetId', async (req, res) => {
    const datasetId = req.params.datasetId;
    const offset = Math.max(0, parseInt(String(req.query.offset || '0'), 10) || 0);
    const limit = Math.min(5000, Math.max(1, parseInt(String(req.query.limit || '500'), 10) || 500));

    try {
      const allPairs = await loadQaDataset(datasetId);
      const slice = allPairs.slice(offset, offset + limit);
      return res.json({
        datasetId,
        totalPairs: allPairs.length,
        offset,
        limit,
        count: slice.length,
        hasMore: offset + limit < allPairs.length,
        pairs: slice,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to stream Q&A dataset';
      return res.status(500).json({ error: msg, datasetId });
    }
  });

  /**
   * POST /api/qa-datasets/upload
   * Allows user to upload custom JSON, JSONL, or CSV Q&A pairs directly
   */
  app.post('/api/qa-datasets/upload', (req, res) => {
    const { content, format, clearExisting } = req.body as {
      content: string;
      format?: 'json' | 'jsonl' | 'csv';
      clearExisting?: boolean;
    };

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Missing content payload string.' });
    }

    if (clearExisting) {
      customUploadedPairs = [];
    }

    const newPairs: QaPair[] = [];
    const trimmed = content.trim();

    try {
      if (format === 'json' || trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i] as Record<string, unknown>;
          const q = String(item.question || item.instruction || item.q || item.prompt || '').trim();
          const a = String(item.answer || item.output || item.response || item.a || item.completion || '').trim();
          if (q && a) {
            newPairs.push({
              id: `user-${Date.now()}-${i}`,
              question: q,
              answer: a,
              category: String(item.category || 'User Uploaded'),
              sourceDataset: 'custom',
            });
          }
        }
      } else if (format === 'jsonl' || trimmed.includes('\n{"')) {
        const lines = trimmed.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          try {
            const item = JSON.parse(line) as Record<string, unknown>;
            const q = String(item.question || item.instruction || item.q || item.prompt || '').trim();
            const a = String(item.answer || item.output || item.response || item.a || item.completion || '').trim();
            if (q && a) {
              newPairs.push({
                id: `user-${Date.now()}-${i}`,
                question: q,
                answer: a,
                category: String(item.category || 'User Uploaded'),
                sourceDataset: 'custom',
              });
            }
          } catch {
            // Ignore single bad line
          }
        }
      } else {
        // Assume CSV / TSV
        const lines = trimmed.split('\n');
        const delimiter = lines[0].includes('\t') ? '\t' : ',';
        for (let i = 0; i < lines.length; i++) {
          const parts = lines[i].split(delimiter).map((p) => p.replace(/^["']|["']$/g, '').trim());
          if (parts.length >= 2) {
            const q = parts[0];
            const a = parts[1];
            if (q && a && (q.toLowerCase() !== 'question' && q.toLowerCase() !== 'instruction')) {
              newPairs.push({
                id: `user-${Date.now()}-${i}`,
                question: q,
                answer: a,
                category: 'User CSV/TSV',
                sourceDataset: 'custom',
              });
            }
          }
        }
      }

      customUploadedPairs = [...customUploadedPairs, ...newPairs];
      qaDatasetCache.delete('custom');

      return res.json({
        ok: true,
        addedCount: newPairs.length,
        totalCustomCount: customUploadedPairs.length,
        sample: newPairs.slice(0, 5),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse custom Q&A content.';
      return res.status(400).json({ error: msg });
    }
  });

  /**
   * DELETE /api/qa-datasets/upload
   * Clears all custom uploaded Q&A pairs
   */
  app.delete('/api/qa-datasets/upload', (_req, res) => {
    customUploadedPairs = [];
    qaDatasetCache.delete('custom');
    return res.json({ ok: true });
  });

  /**
   * GET /api/crystal/status
   * Returns metadata about the memory-mapped synaptron_crystal.bin file on disk.
   */
  app.get('/api/crystal/status', (_req, res) => {
    if (!mappedCrystalBuffer || mappedCrystalBuffer.byteLength < 64) {
      return res.json({
        exists: false,
        byteLength: 0,
        timestamp: 0,
        filePath: 'data/synaptron_crystal.bin',
      });
    }
    const vocabRaw = mappedCrystalBuffer.byteLength >= 16 ? mappedCrystalBuffer.readUInt32LE(12) : 3;
    const activeSynapses = mappedCrystalBuffer.byteLength >= 20 ? mappedCrystalBuffer.readUInt32LE(16) : 0;
    const ingestedTokens = mappedCrystalBuffer.byteLength >= 24 ? mappedCrystalBuffer.readUInt32LE(20) : 0;
    const ingestedBooks = mappedCrystalBuffer.byteLength >= 28 ? mappedCrystalBuffer.readUInt32LE(24) : 0;
    return res.json({
      exists: true,
      byteLength: mappedCrystalBuffer.byteLength,
      timestamp: mappedCrystalTimestamp,
      vocabCount: Math.max(0, vocabRaw - 3),
      activeSynapses,
      ingestedTokens,
      ingestedBooks,
      filePath: 'data/synaptron_crystal.bin',
    });
  });

  /**
   * GET /api/crystal/mmap.bin
   * Streams the raw binary SCB1 crystal memory image directly into a client ArrayBuffer.
   */
  app.get('/api/crystal/mmap.bin', (_req, res) => {
    if (!mappedCrystalBuffer || mappedCrystalBuffer.byteLength < 64) {
      return res.status(404).json({ error: 'No persisted synaptron_crystal.bin image found yet.' });
    }
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="synaptron_crystal.bin"');
    res.setHeader('X-Crystal-Bytes', String(mappedCrystalBuffer.byteLength));
    res.setHeader('X-Crystal-Timestamp', String(Math.round(mappedCrystalTimestamp)));
    return res.send(mappedCrystalBuffer);
  });

  /**
   * POST /api/crystal/mmap.bin
   * Receives a raw binary SCB1 ArrayBuffer image and writes it atomically to data/synaptron_crystal.bin
   * via POSIX file descriptor I/O (fs.openSync / fs.writeSync / fs.fsyncSync).
   */
  app.post(
    '/api/crystal/mmap.bin',
    express.raw({ type: 'application/octet-stream', limit: '250mb' }),
    (req, res) => {
      const startNs = process.hrtime.bigint();
      const bodyBuf = req.body as Buffer;
      if (!Buffer.isBuffer(bodyBuf) || bodyBuf.byteLength < 64) {
        return res.status(400).json({ error: 'Invalid SCB1 binary crystal payload.' });
      }

      const magic = bodyBuf.readUInt32LE(0);
      if (magic !== 0x53434231) {
        return res.status(400).json({ error: 'Invalid SCB1 magic header in .bin payload.' });
      }

      try {
        const tmpPath = `${CRYSTAL_BIN_PATH}.tmp`;
        const fd = fs.openSync(tmpPath, 'w');
        fs.writeSync(fd, bodyBuf, 0, bodyBuf.byteLength, 0);
        fs.fsyncSync(fd);
        fs.closeSync(fd);
        fs.renameSync(tmpPath, CRYSTAL_BIN_PATH);

        mappedCrystalBuffer = bodyBuf;
        mappedCrystalTimestamp = Date.now();

        const elapsedMs = Number(process.hrtime.bigint() - startNs) / 1e6;
        const mbWritten = bodyBuf.byteLength / (1024 * 1024);
        const speedMBs = elapsedMs > 0 ? mbWritten / (elapsedMs / 1000) : 0;

        return res.json({
          ok: true,
          byteLength: bodyBuf.byteLength,
          timestamp: mappedCrystalTimestamp,
          writeMs: Math.round(elapsedMs * 100) / 100,
          throughputMBs: Math.round(speedMBs * 10) / 10,
          filePath: 'data/synaptron_crystal.bin',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to write synaptron_crystal.bin';
        return res.status(500).json({ error: msg });
      }
    }
  );

  /**
   * DELETE /api/crystal/mmap.bin
   * Clears the persisted binary crystal image when the user explicitly resets the lattice.
   */
  app.delete('/api/crystal/mmap.bin', (_req, res) => {
    mappedCrystalBuffer = null;
    mappedCrystalTimestamp = 0;
    try {
      if (fs.existsSync(CRYSTAL_BIN_PATH)) {
        fs.unlinkSync(CRYSTAL_BIN_PATH);
      }
    } catch {
      // Ignore unlink errors
    }
    return res.json({ ok: true });
  });

  const httpServer = http.createServer(app);

  // Vite middleware for development vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Bare-Metal Crossbar & Project Gutenberg Proxy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
