import { useState, useEffect } from 'react';
import './SnippetForm.css';

function SnippetForm({ snippet, onSave, onCancel, categories, user }) {
  const [formData, setFormData] = useState({
    name: '',
    body: '',
    shortcut: '',
    category: '',
    scope: 'personal',
    status: 'draft',
    tags: ''
  });

  useEffect(() => {
    if (snippet) {
      setFormData({
        name: snippet.name || '',
        body: snippet.body || '',
        shortcut: snippet.shortcut || '',
        category: snippet.category || '',
        scope: snippet.scope || 'personal',
        status: snippet.status || 'draft',
        tags: snippet.tags || ''
      });
    }
  }, [snippet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const canPublishOrg = user?.role === 'admin' || user?.role === 'manager';
  const canPublishTeam = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="snippet-form-overlay" onClick={onCancel}>
      <div className="snippet-form" onClick={(e) => e.stopPropagation()}>
        <div className="snippet-form-header">
          <h2>{snippet ? 'Edit Snippet' : 'New Snippet'}</h2>
          <button className="close-button" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                Name <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Intro - Product Demo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="shortcut">Shortcut</label>
              <input
                id="shortcut"
                name="shortcut"
                type="text"
                value={formData.shortcut}
                onChange={handleChange}
                placeholder="/intro-demo"
              />
              <small>Optional: Used for quick insertion</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="body">
              Body <span className="required">*</span>
            </label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              required
              rows={10}
              placeholder="Enter your snippet text. Use {{token}} for placeholders."
            />
            <small>Use {`{{placeholder}}`} for dynamic content (e.g., {`{{first_name}}`})</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                list="categories"
                placeholder="e.g., Introduction"
              />
              <datalist id="categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label htmlFor="scope">Scope</label>
              <select
                id="scope"
                name="scope"
                value={formData.scope}
                onChange={handleChange}
              >
                <option value="personal">Personal</option>
                {canPublishTeam && <option value="team">Team</option>}
                {canPublishOrg && <option value="org">Organization</option>}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="deprecated">Deprecated</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="intro,demo,product (comma-separated)"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              {snippet ? 'Update' : 'Create'} Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SnippetForm;
