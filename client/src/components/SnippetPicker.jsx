import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import './SnippetPicker.css';

function SnippetPicker({ onSelect, onClose }) {
  const [snippets, setSnippets] = useState([]);
  const [filteredSnippets, setFilteredSnippets] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    fetchSnippets();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = snippets.filter(
        s =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.body.toLowerCase().includes(search.toLowerCase()) ||
          (s.shortcut && s.shortcut.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredSnippets(filtered);
      setSelectedIndex(0);
    } else {
      setFilteredSnippets(snippets);
      setSelectedIndex(0);
    }
  }, [search, snippets]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.children;
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const fetchSnippets = async () => {
    try {
      const response = await api.get('/snippets', {
        params: { status: 'published' }
      });
      setSnippets(response.data);
      setFilteredSnippets(response.data);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredSnippets.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSnippets[selectedIndex]) {
        handleSelect(filteredSnippets[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelect = async (snippet) => {
    try {
      await api.post(`/snippets/${snippet.id}/insert`);
    } catch (error) {
      console.error('Error tracking insertion:', error);
    }
    onSelect(snippet);
  };

  return (
    <div className="snippet-picker-overlay" onClick={onClose}>
      <div className="snippet-picker" onClick={(e) => e.stopPropagation()}>
        <div className="snippet-picker-header">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="snippet-picker-search"
          />
        </div>
        <div className="snippet-picker-list" ref={listRef}>
          {filteredSnippets.length === 0 ? (
            <div className="snippet-picker-empty">No snippets found</div>
          ) : (
            filteredSnippets.map((snippet, index) => (
              <div
                key={snippet.id}
                className={`snippet-picker-item ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => handleSelect(snippet)}
              >
                <div className="snippet-picker-item-name">
                  {snippet.name}
                  {snippet.shortcut && (
                    <span className="snippet-picker-shortcut">
                      {snippet.shortcut}
                    </span>
                  )}
                </div>
                {snippet.category && (
                  <div className="snippet-picker-item-category">
                    {snippet.category}
                  </div>
                )}
                <div className="snippet-picker-item-preview">
                  {snippet.body.substring(0, 100)}
                  {snippet.body.length > 100 ? '...' : ''}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="snippet-picker-footer">
          <span>↑↓ to navigate • Enter to select • Esc to close</span>
        </div>
      </div>
    </div>
  );
}

export default SnippetPicker;
