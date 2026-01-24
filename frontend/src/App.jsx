import React, { useState, useReducer, useEffect } from 'react';
import { Sun, Star, Calendar, CheckSquare, Inbox, Plus, ChevronDown, ChevronRight, X, LogOut,  Check } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from 'react-router-dom'

// --------------------  INITIAL STATE  --------------------
const initialState = {
  tasks: [],
  lists: [{ id: 'personal', name: 'Personal', color: 'red' }],
  activeView: 'my-day',
  loading: false,
  error: null
};

// --------------------  ACTION TYPES  --------------------
const SET_TASKS   = 'SET_TASKS';
const ADD_TASK    = 'ADD_TASK';
const EDIT_TASK   = 'EDIT_TASK';
const DELETE_TASK = 'DELETE_TASK';
const TOGGLE_COMPLETE = 'TOGGLE_COMPLETE';
const TOGGLE_IMPORTANT = 'TOGGLE_IMPORTANT';
const SET_ACTIVE_VIEW  = 'SET_ACTIVE_VIEW';
const ADD_LIST = 'ADD_LIST';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR   = 'SET_ERROR';

// --------------------  REDUCER  --------------------
// The reducer controls how the app state changes
// It receives the current state and an action
function appReducer(state, action) {
  switch (action.type) {
    case SET_TASKS:   return { ...state, tasks: action.payload, loading: false };  //load all tasks from firestore into state
    case ADD_TASK:    return { ...state, tasks: [action.payload, ...state.tasks], loading: false };
    case EDIT_TASK:   return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t), loading: false };
    case DELETE_TASK: return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload), loading: false };
    case TOGGLE_COMPLETE: return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t), loading: false };
    case TOGGLE_IMPORTANT: return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t), loading: false };
    case SET_ACTIVE_VIEW:  return { ...state, activeView: action.payload };
    case ADD_LIST:    return { ...state, lists: [...state.lists, { id: `list-${state.lists.length + 1}`, name: action.payload, color: 'blue' }] };
    case SET_LOADING: return { ...state, loading: action.payload };  //  Turn loading ON or OFF
    case SET_ERROR:   return { ...state, error: action.payload, loading: false };   // Save an error message and stop loading
    default: return state;
  }
}

// --------------------  FIREBASE API  --------------------
//  contains all functions that talk to Firebase Firestore
export const firebaseAPI = {
  subscribeTasks: (uid, cb) => {
    const q = query(collection(db, 'tasks'), where('userId', '==', uid));     // Create a query: select tasks where userId == current user id
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));   // Listen for real-time updates from Firestore
    // Whenever data changes, this callback runs
  },
  createTask: async (taskData) => {
    const docRef = await addDoc(collection(db, 'tasks'), { ...taskData, createdAt: new Date(), updatedAt: new Date() });
    return { id: docRef.id, ...taskData };
  },
  updateTask: async (id, updates) => {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, { ...updates, updatedAt: new Date() });
    return { id, ...updates };
  },
  deleteTask: async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
    return id;
  }
};

// --------------------  TINY TOOLTIP  --------------------
const Tip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">{text}</div>}
    </div>
  );
};

// --------------------  AUTH SCREEN  --------------------
function AuthScreen({ onLogin }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const auth   = getAuth();
  const google = new GoogleAuthProvider();


  const finish = () => navigate('/app');

  /* ----------  email  ---------- */
  const handleEmail = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);
      onLogin(cred.user);
      finish();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ----------  social  ---------- */
  const social = async provider => {
    setError('');
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, provider);
      onLogin(res.user);
      finish();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">To-Do App</h1>
          <p className="text-gray-500">{isLogin ? 'Login to continue' : 'Create an account'}</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* Social button */}
        <div className="space-y-3 mb-6">
         
          <button onClick={() => social(google)} disabled={loading} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="font-medium">Google</span>
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">OR CONTINUE WITH</span></div>
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (isLogin ? 'Logging in...' : 'Creating account...') : (isLogin ? 'Login' : 'Create account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------  SIDEBAR  --------------------
function Sidebar({ state, dispatch, onLogout, userEmail }) {
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const getTaskCount = view => {
    switch (view) {
      case 'my-day':    return state.tasks.filter(t => t.myDay && !t.completed).length;
      case 'important': return state.tasks.filter(t => t.important && !t.completed).length;
      case 'planned':   return state.tasks.filter(t => t.date && !t.completed).length;
      case 'all':       return state.tasks.filter(t => !t.completed).length;
      default:          return state.tasks.filter(t => t.list === view && !t.completed).length;
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
          <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><LogOut className="w-5 h-5 text-gray-600" /></button>
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
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
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateList(); if (e.key === 'Escape') setShowCreateList(false); }}
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

// --------------------  MAIN CONTENT  --------------------
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

  const getFilteredTasks = completed => state.tasks
    .filter(t => t.completed === completed)
    .filter(t => {
      switch (state.activeView) {
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
        userId: user.uid,
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

          {state.error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{state.error}</div>}

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

// --------------------  TASK ITEM  --------------------
function TaskItem({ task, dispatch, openPanel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  const save = async () => {
    if (!editValue.trim() || editValue === task.title) { setIsEditing(false); return; }
    const updated = await firebaseAPI.updateTask(task.id, { title: editValue.trim() });
    dispatch({ type: EDIT_TASK, payload: updated });
    setIsEditing(false);
  };

  const toggleComplete = async e => {
    e.stopPropagation();
    const updated = await firebaseAPI.updateTask(task.id, { completed: !task.completed });
    dispatch({ type: TOGGLE_COMPLETE, payload: updated });
  };

  const toggleImportant = async e => {
    e.stopPropagation();
    const updated = await firebaseAPI.updateTask(task.id, { important: !task.important });
    dispatch({ type: TOGGLE_IMPORTANT, payload: updated });
  };

  const deleteTask = async e => {
    e.stopPropagation();
    await firebaseAPI.deleteTask(task.id);
    dispatch({ type: DELETE_TASK, payload: task.id });
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
          onChange={toggleComplete}
          className="w-4 h-4 cursor-pointer"
        />

        {isEditing ? (
          <input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditValue(task.title); setIsEditing(false); } }}
            onBlur={save}
            autoFocus
            className="flex-1 border-b border-blue-500 outline-none text-gray-800"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 ml-3">
        <Tip text={task.important ? 'Remove important' : 'Mark important'}>
          <button onClick={toggleImportant} className="p-1 rounded hover:bg-gray-100">
            <Star className={`w-5 h-5 ${task.important ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
          </button>
        </Tip>

        <Tip text="Edit task">
          <button onClick={e => { e.stopPropagation(); setIsEditing(true); }} className="p-1 rounded hover:bg-gray-100 text-gray-500">
            ✏
          </button>
        </Tip>

        <Tip text="Delete task">
          <button onClick={deleteTask} className="p-1 rounded hover:bg-gray-100 text-red-500">
            🗑
          </button>
        </Tip>
      </div>
    </div>
  );
}

// --------------------  TASK PANEL  --------------------
function TaskPanel({ task, dispatch, close }) {
  const [title, setTitle] = useState(task.title);

  const saveTitle = async () => {
    if (!title.trim() || title === task.title) return;
    const updated = await firebaseAPI.updateTask(task.id, { title });
    dispatch({ type: EDIT_TASK, payload: updated });
  };

  const toggleComplete = async () => {
    const updated = await firebaseAPI.updateTask(task.id, { completed: !task.completed });
    dispatch({ type: TOGGLE_COMPLETE, payload: updated });
  };

  const toggleImportant = async () => {
    const updated = await firebaseAPI.updateTask(task.id, { important: !task.important });
    dispatch({ type: TOGGLE_IMPORTANT, payload: updated });
  };

  const deleteTask = async () => {
    await firebaseAPI.deleteTask(task.id);
    dispatch({ type: DELETE_TASK, payload: task.id });
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={close}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Task Details</h2>
          <button onClick={close} className="text-gray-500 hover:text-gray-800"><X /></button>
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
          <button onClick={toggleComplete} className="w-full border p-2 rounded hover:bg-gray-50">{task.completed ? 'Mark Active' : 'Mark Done'}</button>
          <button onClick={toggleImportant} className="w-full border p-2 rounded hover:bg-gray-50">{task.important ? 'Remove Important' : 'Mark Important ⭐'}</button>
          <button onClick={deleteTask} className="w-full border p-2 rounded text-red-600 hover:bg-red-50">Delete Task</button>
        </div>
      </div>
    </div>
  );
}

// --------------------  MAIN APP  --------------------
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // Task ID currently opened in the side panel
  const [panelTaskId, setPanelTaskId] = useState(null);
  const [user, setUser] = useState(null);   // Logged-in user
  const [authLoading, setAuthLoading] = useState(true);  // Loading state while checking authentication

  /*  AUTH STATE  */
  useEffect(() => {
    const auth = getAuth();

    // Listen for login / logout changes
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  /*  TASKS LOADER */
  useEffect(() => {
    if (!user?.uid) return;   // Do nothing if user is not logged in
    dispatch({ type: SET_LOADING, payload: true });  // Show loading while fetching tasks
    const unsub = firebaseAPI.subscribeTasks(user.uid, tasks => {
      dispatch({ type: SET_TASKS, payload: tasks });
    });     // Subscribe to user's tasks in Firestore
    return unsub;
  }, [user]);

  // Login handler
  const handleLogin = u => setUser(u);

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    dispatch({ type: SET_TASKS, payload: [] });
  };

  // Task panel helpers
  const closePanel = () => setPanelTaskId(null);
  const openPanel = id => setPanelTaskId(id);

  // Currently selected task
  const panelTask = state.tasks.find(t => t.id === panelTaskId);

  // Show spinner while checking auth
  if (authLoading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );

  // Show login screen if not authenticated
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  // Main app layout
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        state={state}
        dispatch={dispatch}
        onLogout={handleLogout}
        userEmail={user.email}
      />

      <MainContent
        state={state}
        dispatch={dispatch}
        openPanel={openPanel}
        user={user}
      />

      {panelTask && (
        <TaskPanel
          task={panelTask}
          dispatch={dispatch}
          close={closePanel}
        />
      )}
    </div>
  );
}
