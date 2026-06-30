import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXUHk531nBmt7SOV1RwJScQSZlFE40KaE",
  authDomain: "view-boost-cd9da.firebaseapp.com",
  projectId: "view-boost-cd9da",
  storageBucket: "view-boost-cd9da.firebasestorage.app",
  messagingSenderId: "193918839064",
  appId: "1:193918839064:web:a4c7716b2ce5d04015d66d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ── Auth Functions ───────────────────────────────────────────────────────────
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  // Check if user doc exists, if not create it
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // New user - create profile with starting points
    await setDoc(userRef, {
      name: user.displayName || "Kullanıcı",
      email: user.email,
      avatar: user.photoURL || `https://i.pravatar.cc/80?u=${user.uid}`,
      channel: "@" + (user.email ? user.email.split("@")[0] : "kullanici"),
      points: 50, // welcome bonus
      totalEarned: 50,
      isPro: false,
      proExpiresAt: null,
      videosWatched: 0,
      createdAt: serverTimestamp(),
    });
    return { uid: user.uid, isNew: true };
  }
  return { uid: user.uid, isNew: false };
}

export function logout() {
  return signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Firestore Functions ──────────────────────────────────────────────────────
export async function getUserData(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return { uid, ...snap.data() };
  }
  return null;
}

export async function addPoints(uid, amount) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    points: increment(amount),
    totalEarned: increment(amount),
  });
}

export async function spendPoints(uid, amount) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    points: increment(-amount),
  });
}

export async function incrementVideosWatched(uid) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    videosWatched: increment(1),
  });
}

export async function setProStatus(uid, isPro, expiresAt) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    isPro,
    proExpiresAt: expiresAt,
  });
}

export async function submitVideo(uid, videoData, cost) {
  const videoRef = doc(db, "submittedVideos", `${uid}_${Date.now()}`);
  await setDoc(videoRef, {
    ...videoData,
    submittedBy: uid,
    cost,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  await spendPoints(uid, cost);
}
