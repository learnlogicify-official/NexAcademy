import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { Input } from './input';
import { Badge } from './badge';
import { X, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface TagObj {
  id: string;
  name: string;
}

interface TagInputProps {
  value: TagObj[];
  onChange: (tags: TagObj[]) => void;
  label?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowCreation?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Add tag...',
  disabled = false,
  className = '',
  allowCreation = true,
}) => {
  const [allTags, setAllTags] = useState<TagObj[]>([]);
  const [input, setInput] = useState('');
  const [filtered, setFiltered] = useState<TagObj[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all tags on mount for initial suggestions
  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllTags(data.map((t: any) => ({ id: t.id, name: t.name })));
        } else if (Array.isArray(data.tags)) {
          setAllTags(data.tags.map((t: any) => ({ id: t.id, name: t.name })));
        }
      });
  }, []);

  // Debounced search function
  function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  const debouncedSearch = useRef(
    debounce((q: string) => {
      if (!q.trim()) {
        setFiltered([]);
        setShowDropdown(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      fetch(`/api/tags?search=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          let tags: TagObj[] = [];
          if (Array.isArray(data)) {
            tags = data.map((t: any) => ({ id: t.id, name: t.name }));
          } else if (Array.isArray(data.tags)) {
            tags = data.tags.map((t: any) => ({ id: t.id, name: t.name }));
          }
          // Remove already selected tags
          tags = tags.filter(tag => !value.some(v => v.id === tag.id));
          setFiltered(tags);
          setShowDropdown(true);
        })
        .finally(() => setLoading(false));
    }, 250)
  ).current;

  useEffect(() => {
    if (input.trim()) {
      debouncedSearch(input);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
    setHighlighted(-1);
  }, [input, value, debouncedSearch]);

  // Keyboard navigation
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted(h => (h < filtered.length - 1 ? h + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted(h => (h > 0 ? h - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlighted >= 0 && filtered[highlighted]) {
          handleAdd(filtered[highlighted]);
        } else if (input.trim() && allowCreation) {
          handleCreateTag(input.trim());
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDropdown, filtered, highlighted, input, value, allowCreation]);

  const handleAdd = (tag: TagObj) => {
    if (!tag || value.some(v => v.id === tag.id)) return;
    onChange([...value, tag]);
    setInput('');
    setShowDropdown(false);
  };

  const handleRemove = (tag: TagObj) => {
    onChange(value.filter(t => t.id !== tag.id));
  };

  // Handle creating a new tag
  const handleCreateTag = async (tagName: string) => {
    // Don't create empty tags or duplicate names
    if (!tagName.trim() || value.some(v => v.name.toLowerCase() === tagName.toLowerCase())) {
      return;
    }
    
    // Check if this tag already exists in our available tags
    const existingTag = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      handleAdd(existingTag);
      return;
    }
    
    setCreatingTag(true);
    
    try {
      // API call to create a new tag
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: tagName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create tag');
      }
      
      const newTag = await response.json();
      
      // Add to available tags
      setAllTags(prev => [...prev, { id: newTag.id, name: newTag.name }]);
      
      // Add to selected tags
      handleAdd({ id: newTag.id, name: newTag.name });
    } catch (error) {
      console.error('Error creating tag:', error);
      // Still allow adding the tag locally with a temporary ID if API fails
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      handleAdd({ id: tempId, name: tagName });
    } finally {
      setCreatingTag(false);
      setInput('');
      setShowDropdown(false);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  return (
    <div className={cn('w-full', className)}>
      {label && <label className="block mb-1 font-medium text-sm">{label}</label>}
      <div className={cn('flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-gradient-to-br from-background/80 to-muted/40 px-3 py-2 focus-within:ring-2 focus-within:ring-primary/40', disabled && 'opacity-60 pointer-events-none')}>  
        {value.map(tag => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-primary/10 border border-primary/20"
          >
            {tag.name}
            <button
              type="button"
              className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none"
              onClick={() => handleRemove(tag)}
              tabIndex={-1}
              aria-label={`Remove tag ${tag.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => input && setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim() && !showDropdown) {
              e.preventDefault();
              handleCreateTag(input.trim());
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] border-0 shadow-none bg-transparent focus:ring-0 focus:outline-none text-base px-0"
          disabled={disabled || creatingTag}
          autoComplete="off"
          spellCheck={false}
        />
        {creatingTag ? (
          <div className="animate-pulse h-4 w-4 bg-primary/20 rounded-full ml-1"></div>
        ) : (
          <Search className="h-4 w-4 text-muted-foreground ml-1" />
        )}
      </div>
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-popover border border-primary/20 rounded-xl shadow-lg max-h-48 overflow-y-auto"
        >
          {loading && (
            <div className="px-4 py-2 text-muted-foreground text-sm">Searching...</div>
          )}
          {filtered.map((tag, i) => (
            <div
              key={tag.id}
              className={cn(
                'px-4 py-2 cursor-pointer hover:bg-primary/10',
                highlighted === i && 'bg-primary/20 text-primary font-semibold'
              )}
              onMouseDown={() => handleAdd(tag)}
              onMouseEnter={() => setHighlighted(i)}
            >
              {tag.name}
            </div>
          ))}
          {!loading && filtered.length === 0 && input.trim() && allowCreation && (
            <div
              className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-primary/10"
              onMouseDown={() => handleCreateTag(input.trim())}
            >
              <span>Create "{input.trim()}"</span>
              <Plus className="h-4 w-4" />
            </div>
          )}
          {!loading && filtered.length === 0 && input.trim() && !allowCreation && (
            <div className="px-4 py-2 text-muted-foreground text-sm">No tags found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagInput; 