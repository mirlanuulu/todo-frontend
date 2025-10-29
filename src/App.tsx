import { useEffect, useState } from 'react';
import { getTasks, createTask, deleteTask, updateTaskStatus, updateTaskImage, uploadImage } from './api';
import './App.css';

interface Task {
  id: number;
  title: string;
  status: string;
  image_url?: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTasks();
      setTasks(res.data || []);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    
    try {
      setUploading(true);
      let finalImageURL = imageUrl.trim();
      
      if (selectedImage) {
        const uploadRes = await uploadImage(selectedImage);
        finalImageURL = uploadRes.data.url;
      }
      
      await createTask(title, finalImageURL);
      setTitle('');
      setImageUrl('');
      setSelectedImage(null);
      setImagePreview('');
      
      const fileInput = document.getElementById('image-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await loadTasks();
    } catch (err: any) {
      console.error('Failed to create task:', err);
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateTaskStatus(id, status);
      await loadTasks();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      await loadTasks();
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleUpdateImage = async (id: number) => {
    if (!newImageUrl.trim()) return;
    
    try {
      await updateTaskImage(id, newImageUrl);
      setEditingImageId(null);
      setNewImageUrl('');
      await loadTasks();
    } catch (err: any) {
      console.error('Failed to update image:', err);
      setError(err.response?.data?.error || 'Failed to update image');
    }
  };

  const getImageURL = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
  };

  const filterTasks = (status: string) => tasks.filter(t => t.status === status);

  const renderTask = (task: Task) => (
    <div key={task.id} className="task-card">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
      </div>
      
      {task.image_url ? (
        <div className="task-image-container">
          <img 
            src={getImageURL(task.image_url)} 
            alt={task.title}
            className="task-image"
          />
          <button 
            className="edit-image-btn"
            onClick={() => {
              setEditingImageId(task.id);
              setNewImageUrl(task.image_url || '');
            }}
          >
            🖼️ Change
          </button>
        </div>
      ) : (
        <button 
          className="add-image-btn"
          onClick={() => setEditingImageId(task.id)}
        >
          📷 Add Image
        </button>
      )}

      {editingImageId === task.id && (
        <div className="image-edit-form">
          <input
            type="text"
            value={newImageUrl}
            onChange={e => setNewImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="image-url-input"
          />
          <div className="image-edit-actions">
            <button onClick={() => handleUpdateImage(task.id)} className="save-btn">
              ✓ Save
            </button>
            <button onClick={() => setEditingImageId(null)} className="cancel-btn">
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      <div className="task-actions">
        {task.status === 'todo' && (
          <>
            <button onClick={() => handleStatusChange(task.id, 'in_progress')} className="btn-progress">
              ▶️ Start
            </button>
            <button onClick={() => handleStatusChange(task.id, 'trash')} className="btn-trash">
              🗑️
            </button>
          </>
        )}
        {task.status === 'in_progress' && (
          <>
            <button onClick={() => handleStatusChange(task.id, 'done')} className="btn-done">
              ✓ Done
            </button>
            <button onClick={() => handleStatusChange(task.id, 'todo')} className="btn-back">
              ⏪ Back
            </button>
            <button onClick={() => handleStatusChange(task.id, 'trash')} className="btn-trash">
              🗑️
            </button>
          </>
        )}
        {task.status === 'done' && (
          <>
            <button onClick={() => handleStatusChange(task.id, 'archive')} className="btn-archive">
              📦 Archive
            </button>
            <button onClick={() => handleStatusChange(task.id, 'in_progress')} className="btn-back">
              ⏪ Back
            </button>
          </>
        )}
        {task.status === 'trash' && (
          <>
            <button onClick={() => handleStatusChange(task.id, 'todo')} className="btn-restore">
              ↩️ Restore
            </button>
            <button onClick={() => handleDelete(task.id)} className="btn-delete">
              ❌ Delete Forever
            </button>
          </>
        )}
        {task.status === 'archive' && (
          <>
            <button onClick={() => handleStatusChange(task.id, 'done')} className="btn-restore">
              ↩️ Restore
            </button>
            <button onClick={() => handleDelete(task.id)} className="btn-delete">
              ❌ Delete
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="app-title">⚡ TASK COMMAND CENTER ⚡</h1>
      </div>

      {error && (
        <div className="error-banner">{error}</div>
      )}

      <div className="create-task-panel">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter new task..."
          className="task-input"
        />
        
        <div className="image-inputs">
          <input
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="Or paste image URL"
            className="url-input"
          />
          
          <label htmlFor="image-input" className="file-upload-label">
            📁 Upload
          </label>
          <input
            type="file"
            id="image-input"
            accept="image/*"
            onChange={handleImageSelect}
            className="file-input"
          />
          
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="upload-preview" />
          )}
        </div>

        <button 
          onClick={handleAdd}
          disabled={uploading || !title.trim()}
          className="create-btn"
        >
          {uploading ? '⏳ Creating...' : '➕ CREATE TASK'}
        </button>
      </div>

      {loading ? (
        <div className="loading">⏳ Loading tasks...</div>
      ) : (
        <>
          <div className="board">
            <div className="column">
              <div className="column-header todo-header">
                <h2>📋 TO DO</h2>
                <span className="count">{filterTasks('todo').length}</span>
              </div>
              <div className="column-content">
                {filterTasks('todo').map(renderTask)}
              </div>
            </div>

            <div className="column">
              <div className="column-header progress-header">
                <h2>⚙️ IN PROGRESS</h2>
                <span className="count">{filterTasks('in_progress').length}</span>
              </div>
              <div className="column-content">
                {filterTasks('in_progress').map(renderTask)}
              </div>
            </div>

            <div className="column">
              <div className="column-header done-header">
                <h2>✅ DONE</h2>
                <span className="count">{filterTasks('done').length}</span>
              </div>
              <div className="column-content">
                {filterTasks('done').map(renderTask)}
              </div>
            </div>
          </div>

          <div className="archives">
            <div className="archive-section">
              <div className="archive-header trash-header">
                <h2>🗑️ TRASH</h2>
                <span className="count">{filterTasks('trash').length}</span>
              </div>
              <div className="archive-grid">
                {filterTasks('trash').map(renderTask)}
              </div>
            </div>

            <div className="archive-section">
              <div className="archive-header archive-header-completed">
                <h2>📦 ARCHIVE</h2>
                <span className="count">{filterTasks('archive').length}</span>
              </div>
              <div className="archive-grid">
                {filterTasks('archive').map(renderTask)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;