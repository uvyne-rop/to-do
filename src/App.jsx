import React, { useState, useReducer, useEffect } from 'react';
import { Sun, Star, Calendar, CheckSquare, Inbox, Plus, ChevronDown, ChevronRight } from 'lucide-react';

// -------------------- INITIAL STATE --------------------
const initialState = {
  tasks: [],
  lists: [
    { id: 'personal', name: 'Personal', color: 'red' },
  ],
  activeView: 'my-day',
  nextTaskId: 1, // <-- use this consistently
};

// -------------------- ACTION TYPES --------------------
const ADD_TASK = 'ADD_TASK';
const EDIT_TASK = 'EDIT_TASK';
const DELETE_TASK = 'DELETE_TASK';
const TOGGLE_COMPLETE = 'TOGGLE_COMPLETE';
const TOGGLE_IMPORTANT = 'TOGGLE_IMPORTANT';
const SET_ACTIVE_VIEW = 'SET_ACTIVE_VIEW';
const ADD_LIST = 'ADD_LIST';
const DELETE_LIST = 'DELETE_LIST';

// -------------------- REDUCER --------------------
function appReducer(state, action) {
  switch (action.type) {
    case ADD_TASK:
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            ...action.payload,
            id: state.nextTaskId,   // ✅ assign unique ID
            createdAt: Date.now(),
          }
        ],
        nextTaskId: state.nextTaskId + 1, // ✅ increment correctly
      };

    case EDIT_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };

    case DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };

    case TOGGLE_COMPLETE:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed }
            : task
        ),
      };

    case TOGGLE_IMPORTANT:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, important: !task.important } // ✅ only toggle clicked task
            : task
        ),
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

    default:
      return state;
  }
}

// -------------------- SIDEBAR --------------------
function Sidebar({ state, dispatch }) {
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
        <h1 className="text-xl font-bold text-gray-900">To-Do</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {/* Navigation */}
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

        {/* Lists */}
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
function MainContent({ state, dispatch }) {
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

  const handleAddTask = () => {
    if (!inputValue.trim()) return;
    dispatch({
      type: ADD_TASK,
      payload: {
        title: inputValue.trim(),
        completed: false,
        important: false,
        myDay: state.activeView === 'my-day',
        list: ['my-day', 'important', 'planned', 'all'].includes(state.activeView)
          ? 'personal'
          : state.activeView,
        date: null,
        time: null
      }
    });
    setInputValue('');
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

          {/* Input */}
          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                placeholder="Add a task to your day..."
                className="flex-1 outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Active Tasks */}
          <div className="space-y-2 mb-6">
            {activeTasks.map(task => <TaskItem key={task.id} task={task} dispatch={dispatch} />)}
          </div>

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-3"
              >
                {showCompleted ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                <span>Completed ({completedTasks.length})</span>
              </button>
              {showCompleted && completedTasks.map(task => <TaskItem key={task.id} task={task} dispatch={dispatch} />)}
            </div>
          )}

          {/* Empty State */}
          {activeTasks.length === 0 && completedTasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No tasks yet. Add one above to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------- TASK ITEM --------------------
function TaskItem({ task, dispatch }) {
  const [isHovered, setIsHovered] = useState(false);

  const isOverdue = () => {
    if (!task.date || task.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.date < today;
  };

  const getCategoryColor = () => {
    if (task.list === 'work') return 'text-blue-600 bg-blue-50';
    if (task.list === 'personal') return 'text-green-600 bg-green-50';
    if (task.list === 'groceries') return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div
      className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <button onClick={() => dispatch({ type: TOGGLE_COMPLETE, payload: task.id })} className="flex-shrink-0">
        {task.completed
          ? <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          : <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-blue-600 transition-colors" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`text-gray-900 ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</div>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor()}`}>
            {task.list.charAt(0).toUpperCase() + task.list.slice(1)}
          </span>
          {isOverdue() && <span className="text-xs text-red-500">Overdue</span>}
        </div>
      </div>

      {/* Star */}
      <button
        onClick={() => dispatch({ type: TOGGLE_IMPORTANT, payload: task.id })}
        className={`flex-shrink-0 transition-colors ${task.important ? 'text-yellow-500' : isHovered ? 'text-gray-400 hover:text-yellow-500' : 'text-transparent'}`}
      >
        <Star className={`w-5 h-5 ${task.important ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}

// -------------------- APP --------------------
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // optional: localStorage sync here
  }, [state]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar state={state} dispatch={dispatch} />
      <MainContent state={state} dispatch={dispatch} />
    </div>
  );
}
