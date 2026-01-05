import './SnippetList.css';

function SnippetList({ snippets, onEdit, onDelete }) {
  const getStatusBadgeClass = (status) => {
    const classes = {
      draft: 'status-draft',
      published: 'status-published',
      deprecated: 'status-deprecated',
      archived: 'status-archived'
    };
    return classes[status] || '';
  };

  const getScopeBadgeClass = (scope) => {
    const classes = {
      personal: 'scope-personal',
      team: 'scope-team',
      org: 'scope-org'
    };
    return classes[scope] || '';
  };

  if (snippets.length === 0) {
    return (
      <div className="snippet-list-empty">
        <p>No snippets found. Create your first snippet to get started!</p>
      </div>
    );
  }

  return (
    <div className="snippet-list">
      {snippets.map((snippet) => (
        <div key={snippet.id} className="snippet-card">
          <div className="snippet-card-header">
            <div className="snippet-card-title">
              <h3>{snippet.name}</h3>
              <div className="snippet-badges">
                <span className={`badge ${getStatusBadgeClass(snippet.status)}`}>
                  {snippet.status}
                </span>
                <span className={`badge ${getScopeBadgeClass(snippet.scope)}`}>
                  {snippet.scope}
                </span>
                {snippet.category && (
                  <span className="badge badge-category">{snippet.category}</span>
                )}
                {snippet.shortcut && (
                  <span className="badge badge-shortcut">{snippet.shortcut}</span>
                )}
              </div>
            </div>
            <div className="snippet-card-actions">
              <button
                className="action-button edit-button"
                onClick={() => onEdit(snippet)}
              >
                Edit
              </button>
              <button
                className="action-button delete-button"
                onClick={() => onDelete(snippet.id)}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="snippet-card-body">
            <pre className="snippet-body">{snippet.body}</pre>
          </div>

          <div className="snippet-card-footer">
            <div className="snippet-meta">
              <span>Version {snippet.version}</span>
              {snippet.usage_count > 0 && (
                <span>• Used {snippet.usage_count} times</span>
              )}
              {snippet.last_used_at && (
                <span>• Last used {new Date(snippet.last_used_at).toLocaleDateString()}</span>
              )}
            </div>
            <div className="snippet-owner">
              {snippet.owner_name}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SnippetList;
