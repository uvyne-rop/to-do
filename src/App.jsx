import React, { useState, useReducer, useEffect } from 'react';
import { Sun, Star, Calendar, CheckSquare, Inbox, Plus, ChevronDown, ChevronRight } from 'lucide-react';

// Redux-like State Management with useReducer
const initialState = {
  tasks: [],
  lists: [
    { id: 'personal', name: 'Personal', color: 'red' },
    
  ],
  activeView: 'my-day',
  nextTaskId: 1
};

// Action types
const ADD_TASK = 'tasks/add';
const EDIT_TASK = 'tasks/edit';
const DELETE_TASK = 'tasks/delete';
const TOGGLE_COMPLETE = 'tasks/toggleComplete';
const TOGGLE_IMPORTANT = 'tasks/toggleImportant';
const SET_ACTIVE_VIEW = 'ui/setActiveView';
const ADD_LIST = 'lists/add';
const DELETE_LIST = 'lists/delete';

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, { ...action.payload, id: state.nextTaskId, createdAt: Date.now() }],
        nextId: state.nextId + 1
      };
    case 'EDIT_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'TOGGLE_COMPLETE':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload ? { ...task, completed: !task.completed } : task
        )
      };
    case 'TOGGLE_IMPORTANT':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload ? { ...task, important: !task.important } : task
        )
      };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'ADD_LIST':
      return {
        ...state,
        lists: [...state.lists, { id: state.nextListId, name: action.payload, count: 0 }],
        nextId: state.nextId + 1
      };
    default:
      return state;
  }
}

// Sidebar Component
function Sidebar({ state, dispatch }) {
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const getTaskCount = (view) => {
    const today = new Date().toISOString().split('T')[0];
    
    switch(view) {
      case 'my-day':
        return state.tasks.filter(t => t.myDay && !t.completed).length;
      case 'important':
        return state.tasks.filter(t => t.important && !t.completed).length;
      case 'planned':
        return state.tasks.filter(t => t.date && !t.completed).length;
      case 'all':
        return state.tasks.filter(t => !t.completed).length;
      default:
        return state.tasks.filter(t => t.list === view && !t.completed).length;
    }
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      dispatch({ type: 'ADD_LIST', payload: newListName.trim() });
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
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
            AP
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Arjun Patel</div>
            <div className="text-xs text-gray-500">Pro Plan</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = state.activeView === item.id;
            const count = getTaskCount(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: item.id })}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>
                    {item.label}
                  </span>
                </div>
                {count > 0 && (
                  <span className="text-sm text-gray-500">{count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* My Lists */}
        <div className="mt-6 px-2">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            My Lists
          </div>
          <div className="space-y-1">
            {state.lists.map((list) => {
              const isActive = state.activeView === list.id;
              const count = getTaskCount(list.id);
              const colorMap = {
                red: 'bg-red-500',
                blue: 'bg-blue-500',
                green: 'bg-green-500'
              };
              
              return (
                <button
                  key={list.id}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: list.id })}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${colorMap[list.color]}`} />
                    <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>
                      {list.name}
                    </span>
                  </div>
                  {count > 0 && (
                    <span className="text-sm text-gray-500">{count}</span>
                  )}
                </button>
              );
            })}

            {/* Create List */}
            {showCreateList ? (
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
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

// Main Content Component
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

  const getViewIcon = () => {
    if (state.activeView === 'my-day') return <Sun className="w-6 h-6 text-yellow-500" />;
    return null;
  };

  const getFilteredTasks = (completed = false) => {
    let filtered = state.tasks.filter(t => t.completed === completed);
    
    switch(state.activeView) {
      case 'my-day':
        return filtered.filter(t => t.myDay);
      case 'important':
        return filtered.filter(t => t.important);
      case 'planned':
        return filtered.filter(t => t.date);
      case 'all':
        return filtered;
      default:
        return filtered.filter(t => t.list === state.activeView);
    }
  };

  const handleAddTask = () => {
    if (inputValue.trim()) {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          title: inputValue.trim(),
          completed: false,
          important: false,
          myDay: state.activeView === 'my-day',
          list: state.activeView !== 'my-day' && state.activeView !== 'important' && state.activeView !== 'planned' && state.activeView !== 'all' ? state.activeView : 'personal',
          date: null,
          time: null
        }
      });
      setInputValue('');
    }
  };

  const activeTasks = getFilteredTasks(false);
  const completedTasks = getFilteredTasks(true);

  const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date();
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-4">
        <h1 className="text-xl font-bold text-gray-900">To-Do</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl">
          {/* Date */}
          <div className="text-sm text-gray-500 mb-2">{formatDate()}</div>
          
          {/* Title */}
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{getViewTitle()}</h1>
            {getViewIcon()}
          </div>

          {/* Input */}
          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask();
                }}
                placeholder="Add a task to your day..."
                className="flex-1 outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Active Tasks */}
          <div className="space-y-2 mb-6">
            {activeTasks.map(task => (
              <TaskItem key={task.id} task={task} dispatch={dispatch} />
            ))}
          </div>

          {/* Completed Section */}
          {completedTasks.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-3"
              >
                {showCompleted ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span>Completed ({completedTasks.length})</span>
              </button>
              
              {showCompleted && (
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <TaskItem key={task.id} task={task} dispatch={dispatch} />
                  ))}
                </div>
              )}
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

// Task Item Component
function TaskItem({ task, dispatch }) {
  const [isHovered, setIsHovered] = useState(false);

  const isOverdue = () => {
    if (!task.date || task.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.date < today;
  };

  const getCategoryColor = () => {
    const list = task.list;
    if (list === 'work') return 'text-blue-600 bg-blue-50';
    if (list === 'personal') return 'text-green-600 bg-green-50';
    if (list === 'groceries') return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getCategoryName = () => {
    if (task.list === 'work') return 'Work Projects';
    if (task.list === 'personal') return 'Personal';
    if (task.list === 'groceries') return 'Groceries';
    return task.list;
  };

  return (
    <div
      className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_COMPLETE', payload: task.id })}
        className="flex-shrink-0"
      >
        {task.completed ? (
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-blue-600 transition-colors" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`text-gray-900 ${task.completed ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          {/* Category Badge */}
          <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor()}`}>
            {getCategoryName()}
          </span>
          
          {/* Time */}
          {task.time && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {task.time}
            </span>
          )}
          
          {/* Date Tag */}
          {task.date && !task.time && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Today
            </span>
          )}
          
          {/* Overdue */}
          {isOverdue() && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Star Button */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_IMPORTANT', payload: task.id })}
        className={`flex-shrink-0 transition-colors ${
          task.important
            ? 'text-yellow-500'
            : isHovered
            ? 'text-gray-400 hover:text-yellow-500'
            : 'text-transparent'
        }`}
      >
        <Star className={`w-5 h-5 ${task.important ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist state in memory (localStorage simulation)
  useEffect(() => {
    // State is automatically managed by useReducer
    // In production, you'd sync with localStorage here
  }, [state]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar state={state} dispatch={dispatch} />
      <MainContent state={state} dispatch={dispatch} />
    </div>
  );
}