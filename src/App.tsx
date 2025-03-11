import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import "./App.css";

const client = generateClient<Schema>();

type FilterType = 'all' | 'active' | 'completed';

interface TodoItemProps {
  todo: Schema["Todo"]["type"];
  onToggle: (todo: Schema["Todo"]["type"]) => Promise<void>;
}

const TodoItem = ({ todo, onToggle }: TodoItemProps): JSX.Element => (
  <li className="todo-item">
    <input
      type="checkbox"
      onChange={() => onToggle(todo)}
      className="todo-checkbox"
      aria-label={`タスク: ${todo.content}`}
    />
    <span className={`todo-text ${todo.isDone ? "completed" : ""}`}>
      {todo.content}
    </span>
  </li>
);

const TodoForm = ({ onSubmit, value, onChange }: {
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element => (
  <form onSubmit={onSubmit} className="todo-form">
    <div className="todo-input-wrapper">
      <span className="todo-input-circle"></span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Create a new todo.."
        className="todo-input"
        aria-label="新しいタスクの入力"
      />
    </div>
    <button type="submit" className="todo-button" aria-label="タスクを追加">
      Create
    </button>
  </form>
);

const App = (): JSX.Element => {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newTodo.trim()) {
      client.models.Todo.create({ 
        content: newTodo.trim(),
        isDone: false 
      });
      setNewTodo("");
    }
  };

  const handleToggleTodo = async (todo: Schema["Todo"]["type"]): Promise<void> => {
    await client.models.Todo.update({
      id: todo.id,
      isDone: !todo.isDone
    });
  };

  const handleClearCompleted = async (): Promise<void> => {
    const completedTodos = todos.filter(todo => todo.isDone);
    await Promise.all(
      completedTodos.map(todo => client.models.Todo.delete({ id: todo.id }))
    );
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.isDone;
    if (filter === "completed") return todo.isDone;
    return true;
  });

  const activeTodosCount = todos.filter(todo => !todo.isDone).length;

  return (
    <div className="app">
      <main className="container">
        <div className="card">
          <div className="card-header">
            <h1>TODO</h1>
          </div>
          
          <div className="card-body">
            <TodoForm
              onSubmit={handleSubmit}
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />

            {filteredTodos.length === 0 ? (
              <div className="todo-empty">
                タスクがありません
              </div>
            ) : (
              <ul className="todo-list">
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggleTodo}
                  />
                ))}
              </ul>
            )}

            <div className="filters">
              <div className="filters-left">
                {activeTodosCount} items left
              </div>
              <div className="filters-right">
                <button
                  className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-button ${filter === 'active' ? 'active' : ''}`}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
                <button
                  className="filter-button"
                  onClick={handleClearCompleted}
                >
                  Clear Completed
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="footer">
          <p>🎉 タスク管理アプリが正常に動作しています</p>
          <a 
            href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates"
            target="_blank"
            rel="noopener noreferrer"
          >
            チュートリアルの次のステップを確認する
          </a>
        </footer>
      </main>
    </div>
  );
};

export default App;