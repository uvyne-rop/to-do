import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';

// Firebase CRUD API
export const firebaseAPI = {
  // Get all tasks for a specific user
  getAllTasks: async (uid) => {
    const q = query(collection(db, "tasks"), where("userId", "==", uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Create a new task
  createTask: async (taskData) => {
    if (!taskData.userId) throw new Error("User ID missing");
    const fullTask = {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(collection(db, "tasks"), fullTask);
    return { id: docRef.id, ...fullTask };
  },

  // Update a task
  updateTask: async (id, updates) => {
    const docRef = doc(db, "tasks", id);
    const updatedTask = { ...updates, updatedAt: new Date() };
    await updateDoc(docRef, updatedTask);
    return { id, ...updatedTask };
  },

  // Delete a task
  deleteTask: async (id) => {
    const docRef = doc(db, "tasks", id);
    await deleteDoc(docRef);
    return { success: true, deletedId: id };
  },

subscribeTasks: (uid, cb) => {
  const q = query(collection(db, 'tasks'), where('userId', '==', uid));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
},
  // Realtime updates
  getAllTasksRealtime: (uid, callback) => {
    const q = query(collection(db, "tasks"), where("userId", "==", uid));
    return onSnapshot(q, snapshot => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tasks);
    });
  }
};
