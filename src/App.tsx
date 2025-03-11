import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import "./App.css";

const client = generateClient<Schema>();

// 型定義
interface MicropostItemProps {
  micropost: Schema["Micropost"]["type"];
  onDelete: (micropost: Schema["Micropost"]["type"]) => Promise<void>;
  onViewDetail: (micropost: Schema["Micropost"]["type"]) => void;
  categories: Array<Schema["Category"]["type"]>;
}

interface MicropostFormProps {
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categories: Array<Schema["Category"]["type"]>;
  selectedCategoryIds: string[];
  onCategoryChange: (categoryId: string) => void;
}

interface CategoryFormProps {
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface DetailProps {
  onClose: () => void;
  categories: Array<Schema["Category"]["type"]>;
}

interface MicropostDetailProps extends DetailProps {
  micropost: Schema["Micropost"]["type"];
}

interface CategoryDetailProps extends DetailProps {
  category: Schema["Category"]["type"];
  microposts: Array<Schema["Micropost"]["type"]>;
}

// コンポーネント
const MicropostItem = ({ micropost, onDelete, onViewDetail, categories }: MicropostItemProps): JSX.Element => (
  <li className="todo-item">
    <div className="micropost-content">
      <span className="todo-text">{micropost.title}</span>
      <div className="category-tags">
        {categories.map(category => (
          <span key={category.id} className="category-tag">{category.name}</span>
        ))}
      </div>
    </div>
    <div className="button-group">
      <button onClick={() => onViewDetail(micropost)} className="view-button" aria-label="詳細を表示">詳細</button>
      <button onClick={() => onDelete(micropost)} className="delete-button" aria-label="投稿を削除">削除</button>
    </div>
  </li>
);

const MicropostForm = ({ onSubmit, value, onChange, categories, selectedCategoryIds, onCategoryChange }: MicropostFormProps): JSX.Element => (
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
    </div>
    <div className="category-selection">
      <h3>カテゴリーを選択</h3>
      <div className="category-checkboxes">
        {categories.map(category => (
          <label key={category.id} className="category-checkbox">
            <input
              type="checkbox"
              checked={selectedCategoryIds.includes(category.id)}
              onChange={() => onCategoryChange(category.id)}
            />
            {category.name}
          </label>
        ))}
      </div>
    </div>
    <button type="submit" className="todo-button" aria-label="投稿を作成">投稿</button>
  </form>
);

const CategoryForm = ({ onSubmit, value, onChange }: CategoryFormProps): JSX.Element => (
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
    <button type="submit" className="todo-button" aria-label="カテゴリーを作成">作成</button>
  </form>
);

const MicropostDetail = ({ micropost, onClose, categories }: MicropostDetailProps): JSX.Element => {
  const [relatedCategories, setRelatedCategories] = useState<Array<Schema["Category"]["type"]>>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const relations = await client.models.CategoryMicropost.list({
        filter: { micropostId: { eq: micropost.id } }
      });
      
      if (relations.data) {
        const categoryIds = relations.data.map(relation => relation.categoryId);
        setRelatedCategories(categories.filter(category => categoryIds.includes(category.id)));
      }
    };

    fetchCategories();
  }, [micropost.id, categories]);

  return (
    <div className="detail-modal">
      <div className="detail-content">
        <h2>マイクロポスト詳細</h2>
        <div className="detail-section">
          <h3>タイトル</h3>
          <p>{micropost.title}</p>
        </div>
        <div className="detail-section">
          <h3>カテゴリー</h3>
          <div className="category-list">
            {relatedCategories.map(category => (
              <span key={category.id} className="category-tag">{category.name}</span>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="close-button">閉じる</button>
      </div>
    </div>
  );
};

const CategoryDetail = ({ category, onClose, microposts, categories }: CategoryDetailProps): JSX.Element => {
  const [relatedMicroposts, setRelatedMicroposts] = useState<Array<Schema["Micropost"]["type"]>>([]);

  useEffect(() => {
    const fetchMicroposts = async () => {
      const relations = await client.models.CategoryMicropost.list({
        filter: { categoryId: { eq: category.id } }
      });
      
      if (relations.data) {
        const micropostIds = relations.data.map(relation => relation.micropostId);
        setRelatedMicroposts(microposts.filter(micropost => micropostIds.includes(micropost.id)));
      }
    };

    fetchMicroposts();
  }, [category.id, microposts]);

  return (
    <div className="detail-modal">
      <div className="detail-content">
        <h2>カテゴリー詳細</h2>
        <div className="detail-section">
          <h3>名前</h3>
          <p>{category.name}</p>
        </div>
        <div className="detail-section">
          <h3>関連するマイクロポスト</h3>
          <ul className="micropost-list">
            {relatedMicroposts.map(micropost => (
              <li key={micropost.id} className="micropost-item">{micropost.title}</li>
            ))}
          </ul>
        </div>
        <button onClick={onClose} className="close-button">閉じる</button>
      </div>
    </div>
  );
};

const App = (): JSX.Element => {
  // State管理
  const [microposts, setMicroposts] = useState<Array<Schema["Micropost"]["type"]>>([]);
  const [categories, setCategories] = useState<Array<Schema["Category"]["type"]>>([]);
  const [newMicropost, setNewMicropost] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedMicropost, setSelectedMicropost] = useState<Schema["Micropost"]["type"] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Schema["Category"]["type"] | null>(null);
  const [micropostCategories, setMicropostCategories] = useState<Record<string, Schema["Category"]["type"][]>>({});

  // データ取得
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

  // カテゴリー情報の取得
  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesMap: Record<string, Schema["Category"]["type"][]> = {};
      
      await Promise.all(
        microposts.map(async (micropost) => {
          const postCategories = await getCategoryForMicropost(micropost);
          if (postCategories.length > 0) {
            categoriesMap[micropost.id] = postCategories;
          }
        })
      );
      
      setMicropostCategories(categoriesMap);
    };

    if (microposts.length > 0) {
      fetchCategories();
    }
  }, [microposts, categories]);

  // イベントハンドラー
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMicropost.trim() && selectedCategoryIds.length > 0) {
      try {
        const newPost = await client.models.Micropost.create({ 
          title: newMicropost.trim()
        });

        if (newPost.data?.id) {
          await Promise.all(
            selectedCategoryIds.map(categoryId =>
              client.models.CategoryMicropost.create({
                categoryId,
                micropostId: newPost.data!.id
              })
            )
          );
        }
        setNewMicropost("");
        setSelectedCategoryIds([]);
      } catch (error) {
        console.error("マイクロポストの作成に失敗しました:", error);
      }
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
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

  const handleDeleteMicropost = async (micropost: Schema["Micropost"]["type"]) => {
    try {
      const relations = await client.models.CategoryMicropost.list({
        filter: { micropostId: { eq: micropost.id } }
      });
      
      if (relations.data) {
        await Promise.all(
          relations.data.map(relation => 
            client.models.CategoryMicropost.delete({
              id: relation.id
            })
          )
        );
      }

      await client.models.Micropost.delete({
        id: micropost.id
      });
    } catch (error) {
      console.error("マイクロポストの削除に失敗しました:", error);
    }
  };

  const getCategoryForMicropost = async (micropost: Schema["Micropost"]["type"]): Promise<Array<Schema["Category"]["type"]>> => {
    try {
      const relations = await client.models.CategoryMicropost.list({
        filter: { micropostId: { eq: micropost.id } }
      });
      
      if (!relations.data) return [];
      
      return relations.data
        .map(relation => categories.find(category => category.id === relation.categoryId))
        .filter((category): category is Schema["Category"]["type"] => category !== undefined);
    } catch (error) {
      console.error("カテゴリー情報の取得に失敗しました:", error);
      return [];
    }
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
              <div className="category-list">
                {categories.map(category => (
                  <div key={category.id} className="category-item">
                    <span>{category.name}</span>
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className="view-button"
                    >
                      詳細
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="micropost-section">
              <h2>投稿作成</h2>
              <MicropostForm
                onSubmit={handleSubmit}
                value={newMicropost}
                onChange={(e) => setNewMicropost(e.target.value)}
                categories={categories}
                selectedCategoryIds={selectedCategoryIds}
                onCategoryChange={handleCategoryToggle}
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
                    onDelete={handleDeleteMicropost}
                    onViewDetail={setSelectedMicropost}
                    categories={micropostCategories[micropost.id] || []}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        {selectedMicropost && (
          <MicropostDetail
            micropost={selectedMicropost}
            onClose={() => setSelectedMicropost(null)}
            categories={categories}
          />
        )}

        {selectedCategory && (
          <CategoryDetail
            category={selectedCategory}
            onClose={() => setSelectedCategory(null)}
            microposts={microposts}
            categories={categories}
          />
        )}

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