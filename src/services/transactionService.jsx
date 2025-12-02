import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocs,
  getCountFromServer // Import for count
} from "firebase/firestore";
import { firestore } from "../utils/firebase.jsx";
import { transactionInputSchema } from "../schemas/transaction.jsx";

const COLLECTION_NAME = "transactions";
const CACHE_KEY = "soldi_sotto_transactions_cache";
const COUNT_CACHE_KEY = "soldi_sotto_transactions_count_cache";
const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes for stale-while-revalidate


// Helper to normalize date from Firestore or JSON string
const normalizeDate = (dateInput) => {
  if (!dateInput) return new Date();
  if (typeof dateInput.toDate === 'function') return dateInput.toDate(); // Firestore Timestamp
  return new Date(dateInput); // String or Date object
};

// Helper to clear cache for full data and count
const invalidateCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(COUNT_CACHE_KEY);
  } catch (e) {
    console.warn("Failed to clear cache", e);
  }
};

export const TransactionService = {
  // Subscribe to recent transactions (real-time)
  subscribeToRecent: (userId, limitCount, onUpdate, onError) => {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id,
          amount: parseFloat(docData.amount) || 0,
          date: normalizeDate(docData.date),
        };
      });
      onUpdate(data);
    }, onError);
  },

  // Fetch all transactions with Caching
  fetchAll: async (userId, { forceRefresh = false, ttlMs = DEFAULT_TTL_MS, onRevalidated, revalidateIfFresh = true } = {}) => {
    const readCache = () => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed.cacheUserId !== userId) return null;
        return parsed;
      } catch (e) {
        console.warn("Cache read error", e);
        return null;
      }
    };

    const cache = readCache();
    const hydrate = (data) =>
      data.map((t) => ({
        ...t,
        date: new Date(t.date),
      }));

    const isFresh = cache?.cachedAt && Date.now() - cache.cachedAt < ttlMs;

    const fetchFromNetwork = async () => {
      const q = query(
        collection(firestore, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id,
          amount: parseFloat(docData.amount) || 0,
          date: normalizeDate(docData.date),
        };
      });

      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: transactions,
            cacheUserId: userId,
            cachedAt: Date.now(),
          })
        );
      } catch (e) {
        console.warn("Cache write error", e);
      }

      return transactions;
    };

    const shouldRevalidateInBackground = cache && (!isFresh || revalidateIfFresh);

    if (!forceRefresh && cache) {
      if (shouldRevalidateInBackground) {
        fetchFromNetwork()
          .then((live) => onRevalidated?.(live))
          .catch((e) => console.warn("Background refresh error", e));
      }
      if (isFresh && !revalidateIfFresh) {
        return hydrate(cache.data);
      }
      // Return cached immediately even if revalidating
      return hydrate(cache.data);
    }

    // No cache or forced refresh
    return await fetchFromNetwork();
  },

  // Get total count of transactions with Caching
  getTotalCount: async (userId, { forceRefresh = false, ttlMs = DEFAULT_TTL_MS, onRevalidated, revalidateIfFresh = true } = {}) => {
    const readCache = () => {
      try {
        const raw = localStorage.getItem(COUNT_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed.cacheUserId !== userId) return null;
        return parsed;
      } catch (e) {
        console.warn("Count cache read error", e);
        return null;
      }
    };

    const cache = readCache();
    const isFresh = cache?.cachedAt && Date.now() - cache.cachedAt < ttlMs;

    const fetchFromNetwork = async () => {
      const q = query(collection(firestore, COLLECTION_NAME), where("userId", "==", userId));
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;

      try {
        localStorage.setItem(
          COUNT_CACHE_KEY,
          JSON.stringify({
            count,
            cacheUserId: userId,
            cachedAt: Date.now(),
          })
        );
      } catch (e) {
        console.warn("Count cache write error", e);
      }

      return count;
    };

    const shouldRevalidateInBackground = cache && (!isFresh || revalidateIfFresh);

    if (!forceRefresh && cache) {
      if (shouldRevalidateInBackground) {
        fetchFromNetwork()
          .then((liveCount) => onRevalidated?.(liveCount))
          .catch((e) => console.warn("Background count refresh error", e));
      }
      if (isFresh && !revalidateIfFresh) {
        return cache.count;
      }
      return cache.count;
    }

    return await fetchFromNetwork();
  },

  add: async (userId, data) => {
    // Validate data using Zod
    const validatedData = transactionInputSchema.parse(data);
    
    const result = await addDoc(collection(firestore, COLLECTION_NAME), {
      userId,
      ...validatedData,
      createdAt: serverTimestamp(),
    });
    
    invalidateCache(); // Invalidate on write
    return result;
  },

  update: async (id, data) => {
    const transactionRef = doc(firestore, COLLECTION_NAME, id);
    const result = await updateDoc(transactionRef, data);
    
    invalidateCache(); // Invalidate on write
    return result;
  },

  delete: async (id) => {
    const transactionRef = doc(firestore, COLLECTION_NAME, id);
    const result = await deleteDoc(transactionRef);
    
    invalidateCache(); // Invalidate on write
    return result;
  },

  invalidateCache,
  DEFAULT_TTL_MS,
};
