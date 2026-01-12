import React, { useState, useReducer, useEffect } from 'react';
import { Sun, Star, Calendar, CheckSquare, Inbox, Plus, ChevronDown, ChevronRight, X } from 'lucide-react';

// -------------------- INITIAL STATE --------------------
const initialState = {
  tasks: [],
  lists: [
    { id: 'personal', name: 'Personal', color: 'red' },
  ],
  activeView: 'my-day',
  nextTaskId: 1,
};

// -------------------- ACTION TYPES --------------------
const ADD_TASK = 'ADD_TASK';
const EDIT_TASK = 'EDIT_TASK';
const DELETE_TASK = 'DELETE_TASK';
const TOGGLE_COMPLETE = 'TOGGLE_COMPLETE';
const TOGGLE_IMPORTANT = 'TOGGLE_IMPORTANT';
const SET_ACTIVE_VIEW = 'SET_ACTIVE_VIEW';
const ADD_LIST = 'ADD_LIST';

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
            id: state.nextTaskId,
            createdAt: Date.now(),
          }
        ],
        nextTaskId: state.nextTaskId + 1,
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
            ? { ...task, important: !task.important }
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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
          {text}
        </div>
      )}
    </div>
  );
};

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
function MainContent({ state, dispatch, openPanel }) {
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
              {showCompleted && completedTasks.map(task => (
                <TaskItem key={task.id} task={task} dispatch={dispatch} openPanel={openPanel} />
              ))}
            </div>
          )}

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
function TaskItem({ task, dispatch, openPanel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  const handleEditSave = () => {
    if (!editValue.trim()) return;
    dispatch({
      type: EDIT_TASK,
      payload: { id: task.id, updates: { title: editValue.trim() } }
    });
    setIsEditing(false);
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
          onChange={e => {
            e.stopPropagation();
            dispatch({ type: TOGGLE_COMPLETE, payload: task.id });
          }}
          className="w-4 h-4"
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
            onClick={e => {
              e.stopPropagation();
              dispatch({ type: TOGGLE_IMPORTANT, payload: task.id });
            }}
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
            onClick={e => {
              e.stopPropagation();
              dispatch({ type: DELETE_TASK, payload: task.id });
            }}
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

  return (
    <div className="fixed inset-0 flex z-50">
      <div className="flex-1 bg-black/30" onClick={close} />
      <div className="w-96 bg-white p-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Task Details</h2>
          <button onClick={close}>
            <X />
          </button>
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() =>
            dispatch({
              type: EDIT_TASK,
              payload: { id: task.id, updates: { title } },
            })
          }
          className="w-full border-b text-lg outline-none mb-6"
        />

        <button
          onClick={() =>
            dispatch({ type: TOGGLE_COMPLETE, payload: task.id })
          }
          className="w-full border p-2 rounded mb-2"
        >
          {task.completed ? 'Mark Active' : 'Mark Done'}
        </button>

        <button
          onClick={() =>
            dispatch({ type: TOGGLE_IMPORTANT, payload: task.id })
          }
          className="w-full border p-2 rounded mb-2"
        >
          {task.important ? 'Remove Important' : 'Mark Important ⭐'}
        </button>

        <button
          onClick={() => {
            dispatch({ type: DELETE_TASK, payload: task.id });
            close();
          }}
          className="w-full border p-2 rounded text-red-600"
        >
          Delete Task
        </button>
      </div>
    </div>
  );
}

// -------------------- APP --------------------
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [panelTaskId, setPanelTaskId] = useState(null);

  const closePanel = () => setPanelTaskId(null);
  const openPanel = id => setPanelTaskId(id);

  const panelTask = state.tasks.find(t => t.id === panelTaskId);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar state={state} dispatch={dispatch} />
      <MainContent state={state} dispatch={dispatch} openPanel={openPanel} />
      {panelTask && (
        <TaskPanel task={panelTask} dispatch={dispatch} close={closePanel} />
      )}
    </div>
  );
}