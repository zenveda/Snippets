import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import SnippetForm from '../components/SnippetForm';
import SnippetList from '../components/SnippetList';
import './SnippetManager.css';

function SnippetManager() {
  const [snippets, setSnippets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    scope: '',
    search: ''
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSnippets();
    fetchCategories();
  }, [filters]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/snippets', { params: filters });
      setSnippets(response.data);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreate = () => {
    setEditingSnippet(null);
    setShowForm(true);
  };

  const handleEdit = (snippet) => {
    setEditingSnippet(snippet);
    setShowForm(true);
  };

  const handleSave = async (snippetData) => {
    try {
      if (editingSnippet) {
        await api.put(`/snippets/${editingSnippet.id}`, snippetData);
      } else {
        await api.post('/snippets', snippetData);
      }
      setShowForm(false);
      setEditingSnippet(null);
      fetchSnippets();
      fetchCategories();
    } catch (error) {
      console.error('Error saving snippet:', error);
      alert('Error saving snippet: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      await api.delete(`/snippets/${id}`);
      fetchSnippets();
    } catch (error) {
      console.error('Error deleting snippet:', error);
      alert('Error deleting snippet: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="snippet-manager">
      <header className="snippet-manager-header">
        <div className="header-left">
          <h1>Snippets</h1>
          <span className="user-info">Welcome, {user?.name}</span>
        </div>
        <nav className="header-nav">
          <button
            className="nav-button"
            onClick={() => navigate('/')}
          >
            Email Composer
          </button>
          <button
            className="nav-button active"
            onClick={() => navigate('/snippets')}
          >
            Manage Snippets
          </button>
          <button className="nav-button" onClick={logout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="snippet-manager-main">
        <div className="snippet-manager-container">
          <div className="snippet-manager-toolbar">
            <div className="toolbar-left">
              <button className="create-button" onClick={handleCreate}>
                + New Snippet
              </button>
            </div>

            <div className="toolbar-filters">
              <input
                type="text"
                placeholder="Search snippets..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
              />

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="deprecated">Deprecated</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={filters.scope}
                onChange={(e) => handleFilterChange('scope', e.target.value)}
                className="filter-select"
              >
                <option value="">All Scopes</option>
                <option value="personal">Personal</option>
                <option value="team">Team</option>
                <option value="org">Organization</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading snippets...</div>
          ) : (
            <SnippetList
              snippets={snippets}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      {showForm && (
        <SnippetForm
          snippet={editingSnippet}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingSnippet(null);
          }}
          categories={categories}
          user={user}
        />
      )}
    </div>
  );
}

export default SnippetManager;
