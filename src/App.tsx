import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import "./App.css";

const client = generateClient<Schema>();

interface MicropostItemProps {
  micropost: Schema["Micropost"]["type"];
  category?: Schema["Category"]["type"];
  onDelete: (micropost: Schema["Micropost"]["type"]) => Promise<void>;
}

const MicropostItem = ({ micropost, category, onDelete }: MicropostItemProps): JSX.Element => (
  <li className="todo-item">
    <div className="micropost-content">
      <span className="todo-text">
        {micropost.title}
      </span>
      {category && (
        <span className="category-tag">
          {category.name}
        </span>
      )}
    </div>
    <button
      onClick={() => onDelete(micropost)}
      className="delete-button"
      aria-label="投稿を削除"
    >
      削除
    </button>
  </li>
);

interface MicropostFormProps {
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categories: Array<Schema["Category"]["type"]>;
  selectedCategoryId: string;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const MicropostForm = ({ 
  onSubmit, 
  value, 
  onChange,
  categories,
  selectedCategoryId,
  onCategoryChange
}: MicropostFormProps): JSX.Element => (
  <form onSubmit={onSubmit} className="todo-form">
    <div className="form-row">
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
      <select
        value={selectedCategoryId}
        onChange={onCategoryChange}
        className="category-select"
        aria-label="カテゴリーを選択"
      >
        <option value="">カテゴリーを選択</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
    <button type="submit" className="todo-button" aria-label="投稿を作成">
      投稿
    </button>
  </form>
);

const CategoryForm = ({ 
  onSubmit,
  value,
  onChange
}: {
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element => (
  <form onSubmit={onSubmit} className="category-form">
    <div className="todo-input-wrapper">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="新しいカテゴリーを作成..."
        className="todo-input"
        aria-label="新しいカテゴリーの入力"
      />
    </div>
    <button type="submit" className="todo-button" aria-label="カテゴリーを作成">
      作成
    </button>
  </form>
);

const App = (): JSX.Element => {
  const [microposts, setMicroposts] = useState<Array<Schema["Micropost"]["type"]>>([]);
  const [categories, setCategories] = useState<Array<Schema["Category"]["type"]>>([]);
  const [newMicropost, setNewMicropost] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  useEffect(() => {
    const micropostSubscription = client.models.Micropost.observeQuery().subscribe({
      next: (data) => setMicroposts([...data.items]),
    });

    const categorySubscription = client.models.Category.observeQuery().subscribe({
      next: (data) => setCategories([...data.items]),
    });

    return () => {
      micropostSubscription.unsubscribe();
      categorySubscription.unsubscribe();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newMicropost.trim() && selectedCategoryId) {
      client.models.Micropost.create({ 
        title: newMicropost.trim(),
        categoryID: selectedCategoryId
      });
      setNewMicropost("");
      setSelectedCategoryId("");
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (newCategory.trim()) {
      try {
        await client.models.Category.create({ 
          name: newCategory.trim()
        });
        setNewCategory("");
      } catch (error) {
        console.error("カテゴリーの作成に失敗しました:", error);
      }
    }
  };

  const handleDeleteMicropost = async (micropost: Schema["Micropost"]["type"]): Promise<void> => {
    await client.models.Micropost.delete({
      id: micropost.id
    });
  };

  const getCategoryForMicropost = (micropost: Schema["Micropost"]["type"]) => {
    return categories.find(category => category.id === micropost.categoryID);
  };

  return (
    <div className="app">
      <main className="container">
        <div className="card">
          <div className="card-header">
            <h1>マイクロポスト</h1>
          </div>
          
          <div className="card-body">
            <div className="category-section">
              <h2>カテゴリー管理</h2>
              <CategoryForm
                onSubmit={handleCategorySubmit}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>

            <div className="micropost-section">
              <h2>投稿作成</h2>
              <MicropostForm
                onSubmit={handleSubmit}
                value={newMicropost}
                onChange={(e) => setNewMicropost(e.target.value)}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={(e) => setSelectedCategoryId(e.target.value)}
              />
            </div>

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
                    category={getCategoryForMicropost(micropost)}
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