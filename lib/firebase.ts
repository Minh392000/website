import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  increment,
  collection
} from 'firebase/firestore';

// Placeholder Firebase Configuration
// Thầy cô và học viên có thể cấu hình thông số thật của dự án Firebase ở đây hoặc qua hệ thống AI Studio.
export const firebaseConfig = {
  apiKey: "AIzaSyFakeKeyPlaceholderForInfoSecAI2026",
  authDomain: "infosecai-vwa.firebaseapp.com",
  projectId: "infosecai-vwa",
  storageBucket: "infosecai-vwa.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456abcdef",
  measurementId: "G-MEASUREMENTID"
};

let app: FirebaseApp;
let db: Firestore | null = null;
let isRealFirebase = false;

try {
  // Check if real config file is injected by AI Studio setup
  // In Next.js, we can try to dynamically check or fallback safely.
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  isRealFirebase = true;
} catch (error) {
  console.warn("Đang chạy ở chế độ Offline/Local do chưa cấu hình Firebase chính thức:", error);
}

export { app, db, isRealFirebase };

// --- Error Handler for Security and Permissions ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: "local_user_session",
      email: "student@vwa.edu.vn"
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// --- Dynamic API Wrapper with Local Fallback ---

export interface GlobalStats {
  module1CompletedCount: number;
  module2CompletedCount: number;
  module3CompletedCount: number;
  module4CompletedCount: number;
  updatedAt: string;
}

const DEFAULT_GLOBAL_STATS: GlobalStats = {
  module1CompletedCount: 42,
  module2CompletedCount: 28,
  module3CompletedCount: 15,
  module4CompletedCount: 8,
  updatedAt: new Date().toISOString()
};

// Listen to Global Stats
export function subscribeToGlobalStats(callback: (stats: GlobalStats) => void) {
  const path = 'global_stats/aggregate';
  
  if (db && isRealFirebase) {
    try {
      return onSnapshot(doc(db, path), (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as GlobalStats);
        } else {
          // If doc doesn't exist, set it up
          setDoc(doc(db!, path), DEFAULT_GLOBAL_STATS).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, path);
          });
          callback(DEFAULT_GLOBAL_STATS);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        // Fallback on permission error
        callback(getLocalGlobalStats());
      });
    } catch (e) {
      console.warn("Không kết nối được Firestore, sử dụng dữ liệu mô phỏng Local:", e);
    }
  }

  // Fallback if Firebase not fully live or runs in mock mode
  const interval = setInterval(() => {
    callback(getLocalGlobalStats());
  }, 3000);
  
  callback(getLocalGlobalStats());
  return () => clearInterval(interval);
}

// Sync global stats locally in localStorage to simulate real-time updates for multiple users/tabs
function getLocalGlobalStats(): GlobalStats {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('infosec_global_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_GLOBAL_STATS;
      }
    } else {
      localStorage.setItem('infosec_global_stats', JSON.stringify(DEFAULT_GLOBAL_STATS));
    }
  }
  return DEFAULT_GLOBAL_STATS;
}

// Inccrement Module Finished on Firestore (or fallback to Local)
export async function completeModuleOnFirebase(moduleId: number) {
  const path = 'global_stats/aggregate';
  
  // Track that we increments locally first
  if (typeof window !== 'undefined') {
    const localStats = getLocalGlobalStats();
    const key = `module${moduleId}CompletedCount` as keyof GlobalStats;
    if (typeof localStats[key] === 'number') {
      (localStats[key] as number) += 1;
    }
    localStats.updatedAt = new Date().toISOString();
    localStorage.setItem('infosec_global_stats', JSON.stringify(localStats));
  }

  if (db && isRealFirebase) {
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      const updatePayload: Record<string, any> = {};
      const key = `module${moduleId}CompletedCount`;
      updatePayload[key] = increment(1);
      updatePayload.updatedAt = new Date().toISOString();
      
      if (docSnap.exists()) {
        await updateDoc(docRef, updatePayload);
      } else {
        const initial: any = { ...DEFAULT_GLOBAL_STATS };
        initial[key] = (initial[key] as number) + 1;
        await setDoc(docRef, initial);
      }
      console.log(`Đã cập nhật tiến trình Firestore thành công cho Mô-đun ${moduleId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  } else {
    console.log(`[Chế độ Local-Offline] Mô-đun ${moduleId} đã được ghi nhận hoàn thành cục bộ.`);
  }
}
