import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import "./App.css";

const client = generateClient<Schema>();

interface MicropostItemProps {
  micropost: Schema["Micropost"]["type"];
  onDelete: (micropost: Schema["Micropost"]["type"]) => Promise<void>;
}

const MicropostItem = ({ micropost, onDelete }: MicropostItemProps): JSX.Element => (
  <li className="todo-item">
    <span className="todo-text">
      {micropost.title}
    </span>
    <button
      onClick={() => onDelete(micropost)}
      className="delete-button"
      aria-label="投稿を削除"
    >
      削除
    </button>
  </li>
);

const MicropostForm = ({ onSubmit, value, onChange }: {
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element => (
  <form onSubmit={onSubmit} className="todo-form">
    <div className="todo-input-wrapper">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="新しい投稿を作成..."
        className="todo-input"
        aria-label="新しい投稿の入力"
      />
    </div>
    <button type="submit" className="todo-button" aria-label="投稿を作成">
      投稿
    </button>
  </form>
);

const App = (): JSX.Element => {
  const [microposts, setMicroposts] = useState<Array<Schema["Micropost"]["type"]>>([]);
  const [newMicropost, setNewMicropost] = useState("");

  useEffect(() => {
    const subscription = client.models.Micropost.observeQuery().subscribe({
      next: (data) => setMicroposts([...data.items]),
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newMicropost.trim()) {
      client.models.Micropost.create({ 
        title: newMicropost.trim()
      });
      setNewMicropost("");
    }
  };

  const handleDeleteMicropost = async (micropost: Schema["Micropost"]["type"]): Promise<void> => {
    await client.models.Micropost.delete({
      id: micropost.id
    });
  };

  return (
    <div className="app">
      <main className="container">
        <div className="card">
          <div className="card-header">
            <h1>マイクロポスト</h1>
          </div>
          
          <div className="card-body">
            <MicropostForm
              onSubmit={handleSubmit}
              value={newMicropost}
              onChange={(e) => setNewMicropost(e.target.value)}
            />

            {microposts.length === 0 ? (
              <div className="todo-empty">
                投稿がありません
              </div>
            ) : (
              <ul className="todo-list">
                {microposts.map((micropost) => (
                  <MicropostItem
                    key={micropost.id}
                    micropost={micropost}
                    onDelete={handleDeleteMicropost}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <footer className="footer">
          <p>🎉 マイクロポストアプリが正常に動作しています</p>
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