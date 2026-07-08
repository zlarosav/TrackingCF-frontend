import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/* ------------------------------------------------------------------ *
 * Caché inteligente de lecturas.
 *
 * El backend solo trae data nueva cuando corre el cron (cada 30 min,
 * :00 y :30). Entre corridas, repetir una llamada nunca cambia el
 * resultado, así que la cacheamos por URL con un TTL alineado a la
 * próxima frontera de media hora, deduplicamos peticiones en vuelo, y
 * revalidamos de forma exacta contra GET /meta (last_tracker_run /
 * last_contest_update). Esto minimiza el consumo y resiste el abuso:
 * machacar los controles de orden/filtro pega al caché, no a la red.
 * ------------------------------------------------------------------ */

const SS_PREFIX = 'tcf_cache:';
const SS_FRESHNESS = 'tcf_freshness';

const memCache = new Map();   // url -> { data, expiresAt }
const inflight = new Map();   // url -> Promise

const hasWindow = () => typeof window !== 'undefined';

// TTL hasta la próxima frontera :00/:30 + 60s de gracia (mínimo 60s).
function ttlToNextCronBoundary() {
  const now = new Date();
  const min = now.getMinutes();
  const minsToNext = (min < 30 ? 30 : 60) - min;
  const msLeft = minsToNext * 60000 - now.getSeconds() * 1000 - now.getMilliseconds() + 60000;
  return Math.max(60000, msLeft);
}

function readCache(url) {
  const hit = memCache.get(url);
  if (hit) return hit;
  if (!hasWindow()) return null;
  try {
    const raw = sessionStorage.getItem(SS_PREFIX + url);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    memCache.set(url, parsed);
    return parsed;
  } catch (_) {
    return null;
  }
}

function writeCache(url, data, ttl) {
  const entry = { data, expiresAt: Date.now() + ttl };
  memCache.set(url, entry);
  if (!hasWindow()) return;
  try {
    sessionStorage.setItem(SS_PREFIX + url, JSON.stringify(entry));
  } catch (_) {
    // sessionStorage lleno o no disponible: el caché en memoria basta.
  }
}

function invalidate(prefix) {
  for (const key of memCache.keys()) {
    if (key.startsWith(prefix)) memCache.delete(key);
  }
  if (!hasWindow()) return;
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(SS_PREFIX + prefix)) sessionStorage.removeItem(k);
    }
  } catch (_) {}
}

async function cachedGet(url, { ttl, force = false } = {}) {
  if (!force) {
    const cached = readCache(url);
    if (cached && cached.expiresAt > Date.now()) return cached.data;
    if (inflight.has(url)) return inflight.get(url);
  }
  const promise = api.get(url)
    .then(({ data }) => {
      writeCache(url, data, ttl ?? ttlToNextCronBoundary());
      inflight.delete(url);
      return data;
    })
    .catch((err) => {
      inflight.delete(url);
      throw err;
    });
  inflight.set(url, promise);
  return promise;
}

/* ---- Revalidación exacta por frescura ---- */

let freshness = { lastTrackerRun: null, lastContestUpdate: null };
let lastMetaCheck = 0;

if (hasWindow()) {
  try {
    const raw = sessionStorage.getItem(SS_FRESHNESS);
    if (raw) freshness = JSON.parse(raw);
  } catch (_) {}
}

function saveFreshness() {
  if (!hasWindow()) return;
  try {
    sessionStorage.setItem(SS_FRESHNESS, JSON.stringify(freshness));
  } catch (_) {}
}

async function getMeta() {
  const { data } = await api.get('/meta');
  return data;
}

// Consulta /meta (throttleado) y, si el cron corrió desde la última vez,
// invalida las porciones de caché afectadas. Devuelve qué cambió para que el
// caller refetchee SOLO eso (evita parpadeos de loading cuando nada cambió).
// Barato y a prueba de abuso.
async function checkFreshness({ throttleMs = 60000, force = false } = {}) {
  const noChange = { trackerChanged: false, contestChanged: false };
  if (!force && Date.now() - lastMetaCheck < throttleMs) return noChange;
  lastMetaCheck = Date.now();
  try {
    const res = await getMeta();
    const meta = res?.data || {};
    const trackerChanged = !!freshness.lastTrackerRun && meta.lastTrackerRun !== freshness.lastTrackerRun;
    const contestChanged = !!freshness.lastContestUpdate && meta.lastContestUpdate !== freshness.lastContestUpdate;
    if (trackerChanged) { invalidate('/users'); invalidate('/submissions'); }
    if (contestChanged) { invalidate('/contests'); }
    freshness = {
      lastTrackerRun: meta.lastTrackerRun ?? null,
      lastContestUpdate: meta.lastContestUpdate ?? null,
    };
    saveFreshness();
    return { trackerChanged, contestChanged };
  } catch (_) {
    return noChange;
  }
}

export const apiClient = {
  // Users
  getUsers: async (period = 'all', opts) => {
    return cachedGet(`/users?${new URLSearchParams({ period }).toString()}`, opts);
  },

  getUser: async (handle, opts) => {
    return cachedGet(`/users/${handle}`, opts);
  },

  // Submissions
  getSubmissions: async (handle, filters = {}, opts) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return cachedGet(`/submissions/${handle}?${params.toString()}`, opts);
  },

  getStats: async (handle, opts) => {
    return cachedGet(`/submissions/${handle}/stats`, opts);
  },

  getLatestSubmissions: async (handle, limit = 10, opts) => {
    return cachedGet(`/submissions/${handle}/latest?limit=${limit}`, opts);
  },

  getContestParticipants: async (platform, contestId, opts) => {
    return cachedGet(`/contests/${platform}/${contestId}/participants`, opts);
  },

  getAllLatestSubmissions: async (period = 'month', sortBy = 'submission_time', order = 'desc', limit = 20, platform = 'all', opts) => {
    const params = new URLSearchParams({
      period,
      sortBy,
      order,
      limit: limit.toString(),
      platform,
    });
    return cachedGet(`/submissions?${params.toString()}`, opts);
  },

  // Contests recientes con participantes embebidos (una sola llamada, sin N+1)
  getRecentContests: async (limit = 25, opts) => {
    return cachedGet(`/contests/recent?limit=${limit}`, opts);
  },

  getContests: async (opts) => {
    return cachedGet('/contests', opts);
  },

  getRatingHistory: async (handle, opts) => {
    return cachedGet(`/users/${handle}/rating-history`, opts);
  },

  getActivityHeatmap: async (handle, days = 365, opts) => {
    return cachedGet(`/submissions/${handle}/heatmap?days=${days}`, opts);
  },

  // Health check (sin caché)
  health: async () => {
    const { data } = await api.get('/health');
    return data;
  },

  // Metadata / freshness helpers
  getMeta,
  checkFreshness,
  invalidate,
};

export default api;
