import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import './InlineSnippetTrigger.css';

function InlineSnippetTrigger({ textareaRef, onInsert }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [filteredSnippets, setFilteredSnippets] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [triggerPosition, setTriggerPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchSnippets();
  }, []);

  // Refetch snippets when dropdown is shown
  useEffect(() => {
    if (showDropdown) {
      fetchSnippets();
    }
  }, [showDropdown]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = (e) => {
      const value = e.target.value;
      const cursorPos = e.target.selectionStart;
      const textBeforeCursor = value.substring(0, cursorPos);
      const match = textBeforeCursor.match(/\/[\w-]*$/);

      if (match && match.index !== undefined) {
        const query = match[0].substring(1);
        setQuery(query);
        updateDropdownPosition(e.target, match.index);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    };

    const handleKeyDown = (e) => {
      if (!showDropdown) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSnippets.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && showDropdown) {
        e.preventDefault();
        if (filteredSnippets[selectedIndex]) {
          insertSnippet(filteredSnippets[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  }, [textareaRef, showDropdown, filteredSnippets, selectedIndex]);

  useEffect(() => {
    if (query) {
      const filtered = snippets.filter(
        s =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          (s.shortcut && s.shortcut.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredSnippets(filtered);
      setSelectedIndex(0);
    } else {
      setFilteredSnippets(snippets);
      setSelectedIndex(0);
    }
  }, [query, snippets]);

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

  const updateDropdownPosition = (textarea, matchIndex) => {
    const rect = textarea.getBoundingClientRect();
    const textBeforeMatch = textarea.value.substring(0, matchIndex);
    const lines = textBeforeMatch.split('\n');
    const line = lines.length - 1;
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
    
    // Simple approximation - position below the textarea
    setTriggerPosition({
      top: rect.top + Math.min((line + 1) * lineHeight, rect.height - lineHeight) + 25,
      left: rect.left + 10
    });
  };

  const insertSnippet = async (snippet) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const value = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const match = textBeforeCursor.match(/\/[\w-]*$/);
    
    if (match) {
      const start = match.index;
      const end = cursorPos;
      const newValue =
        value.substring(0, start) + snippet.body + value.substring(end);
      
      // Update textarea value
      textarea.value = newValue;
      
      // Set cursor position after inserted snippet
      const newCursorPos = start + snippet.body.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      
      setShowDropdown(false);
      
      // Trigger onChange event to sync with React state
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);

      // Track insertion
      try {
        await api.post(`/snippets/${snippet.id}/insert`);
      } catch (error) {
        console.error('Error tracking insertion:', error);
      }
    }
  };

  if (!showDropdown || filteredSnippets.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="inline-snippet-dropdown"
      style={{
        position: 'fixed',
        top: `${triggerPosition.top}px`,
        left: `${triggerPosition.left}px`
      }}
    >
      {filteredSnippets.map((snippet, index) => (
        <div
          key={snippet.id}
          className={`inline-snippet-item ${
            index === selectedIndex ? 'selected' : ''
          }`}
          onClick={() => insertSnippet(snippet)}
        >
          <div className="inline-snippet-item-name">
            {snippet.name}
            {snippet.shortcut && (
              <span className="inline-snippet-shortcut">
                {snippet.shortcut}
              </span>
            )}
          </div>
          {snippet.category && (
            <div className="inline-snippet-item-category">{snippet.category}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default InlineSnippetTrigger;
