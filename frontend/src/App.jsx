import React, { useState, useReducer, useEffect } from 'react';
import { Sun, Star, Calendar, CheckSquare, Inbox, Plus, ChevronDown, ChevronRight, X, LogOut } from 'lucide-react';

import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";





// -------------------- INITIAL STATE --------------------
const initialState = {
  tasks: [],
  lists: [
    { id: 'personal', name: 'Personal', color: 'red' },
  ],
  activeView: 'my-day',
  loading: false,
  error: null
};

// -------------------- ACTION TYPES --------------------
const SET_TASKS = 'SET_TASKS';
const ADD_TASK = 'ADD_TASK';
const EDIT_TASK = 'EDIT_TASK';
const DELETE_TASK = 'DELETE_TASK';
const TOGGLE_COMPLETE = 'TOGGLE_COMPLETE';
const TOGGLE_IMPORTANT = 'TOGGLE_IMPORTANT';
const SET_ACTIVE_VIEW = 'SET_ACTIVE_VIEW';
const ADD_LIST = 'ADD_LIST';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';

// -------------------- REDUCER --------------------
function appReducer(state, action) {
  switch (action.type) {
    case SET_TASKS:
      return { ...state, tasks: action.payload, loading: false };
      
    case ADD_TASK:
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        loading: false
      };
      
    case EDIT_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        loading: false
      };
      
    case DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        loading: false
      };
      
    case TOGGLE_COMPLETE:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        loading: false
      };
      
    case TOGGLE_IMPORTANT:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        loading: false
      };
      
    case SET_ACTIVE_VIEW:
      return { ...state, activeView: action.payload };
      
    case ADD_LIST:
      return {
        ...state,
        lists: [
          ...state.lists,
          { id: `list-${state.lists.length + 1}`, name: action.payload, color: 'blue' },
        ],
      };
      
    case SET_LOADING:
      return { ...state, loading: action.payload };
      
    case SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    default:
      return state;
  }
}

// -------------------- MOCK API (Replace with real API in production) -------------------

export const firebaseAPI = {
  getAllTasks: async () => {
    const snapshot = await getDocs(collection(db, "tasks"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  createTask: async (taskData) => {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...taskData };
  },

  updateTask: async (id, updates) => {
    const docRef = doc(db, "tasks", id);
    await updateDoc(docRef, { ...updates, updatedAt: new Date() });
    return { id, ...updates };
  },

  deleteTask: async (id) => {
    const docRef = doc(db, "tasks", id);
    await deleteDoc(docRef);
    return { success: true, deletedId: id };
  },

  getAllTasksRealtime: (callback) => {
    const q = collection(db, "tasks");
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tasks);
    });
  }
};

// -------------------- TINY TOOLTIP --------------------
const Tip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">
          {text}
        </div>
      )}
    </div>
  );
};

// -------------------- AUTH SCREEN --------------------
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    let userCredential;
    if (isLogin) {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } else {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    }

    const currentUser = userCredential.user;
    onLogin(currentUser); // pass the Firebase user
    setLoading(false);
  }catch (err) {
  setError(err.code === 'auth/wrong-password' ? 'Incorrect password' :
           err.code === 'auth/user-not-found' ? 'User not found' :
           err.message);
}

};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">To-Do App</h1>
          <p className="text-gray-500">{isLogin ? 'Login to continue' : 'Create an account'}</p>
          <p className="text-xs text-yellow-600 mt-2 bg-yellow-50 p-2 rounded">
            ⚠️ Demo Mode: Real Firebase auth in production
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- SIDEBAR --------------------
function Sidebar({ state, dispatch, onLogout, userEmail }) {
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const getTaskCount = (view) => {
    switch(view) {
      case 'my-day': return state.tasks.filter(t => t.myDay && !t.completed).length;
      case 'important': return state.tasks.filter(t => t.important && !t.completed).length;
      case 'planned': return state.tasks.filter(t => t.date && !t.completed).length;
      case 'all': return state.tasks.filter(t => !t.completed).length;
      default: return state.tasks.filter(t => t.list === view && !t.completed).length;
    }
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      dispatch({ type: ADD_LIST, payload: newListName.trim() });
      setNewListName('');
      setShowCreateList(false);
    }
  };

  const navItems = [
    { id: 'my-day', icon: Sun, label: 'My Day', color: 'blue' },
    { id: 'important', icon: Star, label: 'Important', color: 'gray' },
    { id: 'planned', icon: Calendar, label: 'Planned', color: 'gray' },
    { id: 'all', icon: Inbox, label: 'All Tasks', color: 'gray' }
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">To-Do</h1>
          <p className="text-xs text-gray-500 mt-1">{userEmail}</p>
        </div>
        <Tip text="Logout">
          <button
            onClick={onLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </Tip>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = state.activeView === item.id;
            const count = getTaskCount(item.id);
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: SET_ACTIVE_VIEW, payload: item.id })}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>{item.label}</span>
                </div>
                {count > 0 && <span className="text-sm text-gray-500">{count}</span>}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 px-2">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">My Lists</div>
          <div className="space-y-1">
            {state.lists.map(list => {
              const isActive = state.activeView === list.id;
              const count = getTaskCount(list.id);
              const colorMap = { red: 'bg-red-500', blue: 'bg-blue-500', green: 'bg-green-500' };
              return (
                <button
                  key={list.id}
                  onClick={() => dispatch({ type: SET_ACTIVE_VIEW, payload: list.id })}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${colorMap[list.color]}`} />
                    <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>{list.name}</span>
                  </div>
                  {count > 0 && <span className="text-sm text-gray-500">{count}</span>}
                </button>
              );
            })}

            {showCreateList ? (
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateList();
                    if (e.key === 'Escape') setShowCreateList(false);
                  }}
                  onBlur={() => setShowCreateList(false)}
                  placeholder="List name"
                  className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setShowCreateList(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create List</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- MAIN CONTENT --------------------
function MainContent({ state, dispatch, openPanel, user }) {
  
  const [inputValue, setInputValue] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const getViewTitle = () => {
    if (state.activeView === 'my-day') return 'My Day';
    if (state.activeView === 'important') return 'Important';
    if (state.activeView === 'planned') return 'Planned';
    if (state.activeView === 'all') return 'All Tasks';
    const list = state.lists.find(l => l.id === state.activeView);
    return list ? list.name : 'Tasks';
  };

  const getFilteredTasks = completed =>
    state.tasks.filter(t => t.completed === completed).filter(t => {
      switch(state.activeView) {
        case 'my-day': return t.myDay;
        case 'important': return t.important;
        case 'planned': return t.date;
        case 'all': return true;
        default: return t.list === state.activeView;
      }
    });

  const handleAddTask = async () => {
  if (!inputValue.trim()) return;

  dispatch({ type: SET_LOADING, payload: true });

  try {
    const taskData = {
      title: inputValue.trim(),
      completed: false,
      important: false,
      myDay: state.activeView === 'my-day',
      list: ['my-day', 'important', 'planned', 'all'].includes(state.activeView) ? 'personal' : state.activeView,
      userId: user.uid, // important
      date: null,
      time: null
    };

    const newTask = await firebaseAPI.createTask(taskData);
    dispatch({ type: ADD_TASK, payload: newTask });
    setInputValue('');
  } catch (error) {
    console.error('Failed to add task:', error);
    dispatch({ type: SET_ERROR, payload: 'Failed to add task' });
  }
};


  const activeTasks = getFilteredTasks(false);
  const completedTasks = getFilteredTasks(true);

  const formatDate = () => {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const date = new Date();
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl">
          <div className="text-sm text-gray-500 mb-2">{formatDate()}</div>
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{getViewTitle()}</h1>
            {state.activeView === 'my-day' && <Sun className="w-6 h-6 text-yellow-500" />}
          </div>

          {state.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                placeholder="Add a task to your day..."
                disabled={state.loading}
                className="flex-1 outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
              />
            </div>
          </div>

          {state.loading && activeTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading tasks...
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-6">
                {activeTasks.map(task => (
                  <TaskItem key={task.id} task={task} dispatch={dispatch} openPanel={openPanel} />
                ))}
              </div>

              {completedTasks.length > 0 && (
                <div className="mt-8">
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-3"
                  >
                    {showCompleted ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                    <span>Completed ({completedTasks.length})</span>
                  </button>
                  {showCompleted && (
                    <div className="space-y-2">
                      {completedTasks.map(task => (
                        <TaskItem key={task.id} task={task} dispatch={dispatch} openPanel={openPanel} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTasks.length === 0 && completedTasks.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>No tasks yet. Add one above to get started!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------- TASK ITEM --------------------
function TaskItem({ task, dispatch, openPanel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  const handleEditSave = async () => {
    if (!editValue.trim()) return;
    
    try {
      const updatedTask = await firebaseAPI.updateTask(task.id, { title: editValue.trim() });
      dispatch({ type: EDIT_TASK, payload: updatedTask });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit task:', error);
      dispatch({ type: SET_ERROR, payload: 'Failed to update task' });
    }
  };

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    
    try {
      const updatedTask = await firebaseAPI.updateTask(task.id, { 
        completed: !task.completed 
      });
      dispatch({ type: TOGGLE_COMPLETE, payload: updatedTask });
    } catch (error) {
      console.error('Failed to toggle complete:', error);
      dispatch({ type: SET_ERROR, payload: 'Failed to update task' });
    }
  };

  const handleToggleImportant = async (e) => {
    e.stopPropagation();
    
    try {
      const updatedTask = await firebaseAPI.updateTask(task.id, { 
        important: !task.important 
      });
      dispatch({ type: TOGGLE_IMPORTANT, payload: updatedTask });
    } catch (error) {
      console.error('Failed to toggle important:', error);
      dispatch({ type: SET_ERROR, payload: 'Failed to update task' });
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    try {
      await firebaseAPI.deleteTask(task.id);
      dispatch({ type: DELETE_TASK, payload: task.id });
    } catch (error) {
      console.error('Failed to delete task:', error);
      dispatch({ type: SET_ERROR, payload: 'Failed to delete task' });
    }
  };

  return (
    <div
      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
      onClick={() => openPanel(task.id)}
    >
      <div className="flex items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="w-4 h-4 cursor-pointer"
        />

        {isEditing ? (
          <input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEditSave()}
            onBlur={handleEditSave}
            autoFocus
            className="flex-1 border-b border-blue-500 outline-none text-gray-800"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            className={`flex-1 ${
              task.completed ? 'line-through text-gray-400' : 'text-gray-800'
            }`}
          >
            {task.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 ml-3">
        <Tip text={task.important ? 'Remove important' : 'Mark important'}>
          <button
            onClick={handleToggleImportant}
            className="p-1 rounded hover:bg-gray-100"
          >
            <Star
              className={`w-5 h-5 ${
                task.important
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-400'
              }`}
            />
          </button>
        </Tip>

        <Tip text="Edit task">
          <button
            onClick={e => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            ✏
          </button>
        </Tip>

        <Tip text="Delete task">
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-gray-100 text-red-500"
          >
            🗑
          </button>
        </Tip>
      </div>
    </div>
  );
}

// -------------------- TASK PANEL --------------------
function TaskPanel({ task, dispatch, close }) {
  const [title, setTitle] = useState(task.title);

  const saveTitle = async () => {
    if (!title.trim()) return;
    
    try {
      const updatedTask = await firebaseAPI.updateTask(task.id, { title });
      dispatch({ type: EDIT_TASK, payload: updatedTask });
    } catch (error) {
      console.error('Failed to update title:', error);
      dispatch({ type: SET_ERROR, payload: 'Failed to update task' });
    }
  };

  const handleToggleComplete = async () => {
    try {
      const updatedTask = await firebaseAPI.updateTask(task.id, { 
        completed: !task.completed 
      });
      dispatch({ type: TOGGLE_COMPLETE, payload: updatedTask });
    } catch (error) {
      console.error('Failed to toggle complete:', error);
      dispatch({ type: SET_ERROR, payload: 'Failed to update task' });
    }
  };

  const handleToggleImportant = async () => {
    try {
      const updatedTask = await firebaseAPI.updateTask(task.id, { 
        important: !task.important 
      });
      dispatch({ type: TOGGLE_IMPORTANT, payload: updatedTask });
    } catch (error) {
      console.error('Failed to toggle important:', error);
      dispatch({ type: SET_ERROR, payload: 'Failed to update task' });
    }
  };

  const handleDelete = async () => {
    try {
      await firebaseAPI.deleteTask(task.id);
      dispatch({ type: DELETE_TASK, payload: task.id });
      close();
    } catch (error) {
      console.error('Failed to delete task:', error);
      dispatch({ type: SET_ERROR, payload: 'Failed to delete task' });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={close}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Task Details</h2>
          <button onClick={close} className="text-gray-500 hover:text-gray-800">
            <X />
          </button>
        </div>

        <label className="block mb-2 text-sm text-gray-600">Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={e => e.key === 'Enter' && saveTitle()}
          className="w-full border-b text-lg outline-none mb-6"
          autoFocus
        />

        <div className="space-y-2">
          <button
            onClick={handleToggleComplete}
            className="w-full border p-2 rounded hover:bg-gray-50"
          >
            {task.completed ? 'Mark Active' : 'Mark Done'}
          </button>

          <button
            onClick={handleToggleImportant}
            className="w-full border p-2 rounded hover:bg-gray-50"
          >
            {task.important ? 'Remove Important' : 'Mark Important ⭐'}
          </button>

          <button
            onClick={handleDelete}
            className="w-full border p-2 rounded text-red-600 hover:bg-red-50"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- MAIN APP --------------------
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [panelTaskId, setPanelTaskId] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check if user is logged in (demo mode)
useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      setUser(firebaseUser); // store Firebase user
      fetchTasks(firebaseUser.uid); // fetch tasks for this user
    } else {
      setUser(null);
    }
    setAuthLoading(false);
  });

  return () => unsubscribe();
}, []);



  const fetchTasks = async (uid) => {
  dispatch({ type: SET_LOADING, payload: true });
  try {
    const snapshot = await getDocs(collection(db, "tasks"));
    const tasks = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(task => task.userId === uid); // only this user's tasks
    dispatch({ type: SET_TASKS, payload: tasks });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    dispatch({ type: SET_ERROR, payload: 'Failed to load tasks' });
  }
};


  const handleLogin = (firebaseUser) => {
  setUser(firebaseUser); // store full user, not just email
};


  const handleLogout = () => {
    localStorage.removeItem('demo_user');
    setUser(null);
    dispatch({ type: SET_TASKS, payload: [] });
  };

  const closePanel = () => setPanelTaskId(null);
  const openPanel = id => setPanelTaskId(id);

  const panelTask = state.tasks.find(t => t.id === panelTaskId);

  // Show loading while checking auth
 if (authLoading) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );
}


  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Main app
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
  state={state} 
  dispatch={dispatch} 
  onLogout={handleLogout}
  userEmail={user.email} 
/>

<MainContent state={state} dispatch={dispatch} openPanel={openPanel} user={user} />

      {panelTask && (
        <TaskPanel task={panelTask} dispatch={dispatch} close={closePanel} />
      )}
    </div>
  );
}