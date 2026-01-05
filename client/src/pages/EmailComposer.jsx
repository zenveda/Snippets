import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SnippetPicker from '../components/SnippetPicker';
import InlineSnippetTrigger from '../components/InlineSnippetTrigger';
import './EmailComposer.css';

function EmailComposer() {
  const [showPicker, setShowPicker] = useState(false);
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+Shift+S (Mac) or Ctrl+Shift+S (Windows/Linux)
      // Use 'code' property which is more reliable than 'key'
      // Also check 'key' as fallback for better browser compatibility
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isSKey = e.code === 'KeyS' || e.key === 'S' || e.key === 's';
      
      if (isCmdOrCtrl && e.shiftKey && isSKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setShowPicker(true);
      }
    };

    // Use capture phase to catch the event before browser handlers
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  const handleSnippetSelect = (snippet) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        content.substring(0, start) + snippet.body + content.substring(end);
      
      setContent(newValue);
      
      // Set cursor position after inserted snippet
      setTimeout(() => {
        const newCursorPos = start + snippet.body.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
    setShowPicker(false);
  };

  const handleInsert = (text) => {
    setContent((prev) => prev + text);
  };

  return (
    <div className="email-composer">
      <header className="email-composer-header">
        <div className="header-left">
          <h1>Snippets</h1>
          <span className="user-info">Welcome, {user?.name}</span>
        </div>
        <nav className="header-nav">
          <button
            className="nav-button active"
            onClick={() => navigate('/')}
          >
            Email Composer
          </button>
          <button
            className="nav-button"
            onClick={() => navigate('/snippets')}
          >
            Manage Snippets
          </button>
          <button className="nav-button" onClick={logout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="email-composer-main">
        <div className="composer-container">
          <div className="composer-header">
            <h2>Email Composer</h2>
            <div className="composer-actions">
              <button
                className="snippet-button"
                onClick={() => setShowPicker(true)}
                title="Insert Snippet (Cmd+Shift+S)"
              >
                📎 Insert Snippet
              </button>
            </div>
          </div>

          <div className="composer-instructions">
            <p>
              <strong>How to insert snippets:</strong>
            </p>
            <ul>
              <li>
                Type <code>/</code> followed by a snippet name or shortcut
                (e.g., <code>/intro</code>)
              </li>
              <li>
                Use keyboard shortcut: <kbd>Cmd+Shift+S</kbd> (Mac) or{' '}
                <kbd>Ctrl+Shift+S</kbd> (Windows/Linux)
              </li>
              <li>Click the "Insert Snippet" button</li>
            </ul>
          </div>

          <div className="composer-field">
            <label htmlFor="to">To:</label>
            <input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              className="composer-input"
            />
          </div>

          <div className="composer-field">
            <label htmlFor="subject">Subject:</label>
            <input
              id="subject"
              type="text"
              placeholder="Email subject"
              className="composer-input"
            />
          </div>

          <div className="composer-field">
            <label htmlFor="body">Body:</label>
            <div className="textarea-wrapper">
              <textarea
                id="body"
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your email... Use / to trigger snippet insertion"
                className="composer-textarea"
                rows={15}
              />
              <InlineSnippetTrigger
                textareaRef={textareaRef}
                onInsert={handleInsert}
              />
            </div>
          </div>

          <div className="composer-footer">
            <button className="send-button">Send Email</button>
            <button
              className="clear-button"
              onClick={() => setContent('')}
            >
              Clear
            </button>
          </div>
        </div>
      </main>

      {showPicker && (
        <SnippetPicker
          onSelect={handleSnippetSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

export default EmailComposer;
