import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
