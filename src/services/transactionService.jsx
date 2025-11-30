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
  fetchAll: async (userId) => {
    // 1. Check Cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, cacheUserId } = JSON.parse(cached);
        const isSameUser = cacheUserId === userId;

        if (isSameUser) {
          // Hydrate dates back from strings
          return data.map(t => ({
            ...t,
            date: new Date(t.date) 
          }));
        }
      }
    } catch (e) {
      console.warn("Cache read error", e);
    }

    // 2. Fetch from Network
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

    // 3. Save to Cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: transactions,
        cacheUserId: userId
      }));
    } catch (e) {
      console.warn("Cache write error", e);
    }

    return transactions;
  },

  // Get total count of transactions with Caching
  getTotalCount: async (userId) => {
    // 1. Check Cache
    try {
      const cached = localStorage.getItem(COUNT_CACHE_KEY);
      if (cached) {
        const { count, cacheUserId } = JSON.parse(cached);
        const isSameUser = cacheUserId === userId;
        if (isSameUser) {
          return count;
        }
      }
    } catch (e) {
      console.warn("Count cache read error", e);
    }

    // 2. Fetch from Network
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where("userId", "==", userId)
    );
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;

    // 3. Save to Cache
    try {
      localStorage.setItem(COUNT_CACHE_KEY, JSON.stringify({
        count: count,
        cacheUserId: userId
      }));
    } catch (e) {
      console.warn("Count cache write error", e);
    }
    
    return count;
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
  }
};