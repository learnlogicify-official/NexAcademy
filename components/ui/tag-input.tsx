import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Input } from './input';
import { Badge } from './badge';
import { X, Search, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Label } from './label';
import { debounce } from 'lodash';

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
  availableTags?: TagObj[];
  isLoading?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "Add tag...",
  disabled = false,
  className,
  allowCreation = false,
  availableTags,
  isLoading = false,
}) => {
  // State
  const [input, setInput] = useState("");
  const [allTags, setAllTags] = useState<TagObj[]>([]);
  const [filtered, setFiltered] = useState<TagObj[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 'auto' });

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  // Create portal container if it doesn't exist
  useEffect(() => {
    if (typeof window !== 'undefined' && !portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.classList.add('tag-input-portal');
      document.body.appendChild(portalRef.current);
    }
    
    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
        portalRef.current = null;
      }
    };
  }, []);

  // Initialize tags from props or API
  useEffect(() => {

    
    if (availableTags !== undefined) {
      // Use the provided availableTags even if empty
      setAllTags(availableTags);
      
    } 
  }, [availableTags]);

  // Update dropdown position function with improved calculation
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate position with better accuracy
      let left = rect.left + window.scrollX;
      let top = rect.bottom + window.scrollY + 4;
      const width = Math.min(rect.width, 300); // Cap width at 300px
      
      // Make sure dropdown isn't cut off at right edge
      if (left + width > viewportWidth - 10) {
        left = viewportWidth - width - 10;
      }
      
      // Make sure dropdown isn't cut off at bottom edge
      const estimatedHeight = Math.min(filtered.length * 40 + 50, 280);
      if (top + estimatedHeight > viewportHeight - 10) {
        // Position above input if not enough space below
        top = rect.top + window.scrollY - estimatedHeight - 4;
      }
      

      
      setDropdownPosition({
        top,
        left,
        width: `${width}px`
      });
    }
  };

  // Update dropdown position when needed
  useEffect(() => {
    if (showDropdown) {
      updateDropdownPosition();
      
      // Update position on scroll or resize with better performance
      const handleScroll = () => {
        requestAnimationFrame(updateDropdownPosition);
      };
      
      const handleResize = () => {
        requestAnimationFrame(updateDropdownPosition);
      };
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showDropdown, filtered]);

  // Search function
  const handleSearch = (q: string) => {
    console.log('Searching for:', q);
    
    if (!q.trim()) {
      setFiltered([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // If availableTags prop was provided, use it for filtering without API call
    if (availableTags !== undefined) {
      const filteredTags = availableTags.filter(tag => 
        tag.name.toLowerCase().includes(q.toLowerCase()) &&
        !value.some(v => v.id === tag.id)
      );

      setFiltered(filteredTags);
      setShowDropdown(true);
      setLoading(false);
      return;
    }
    
    // Otherwise, make API request
    fetch(`/api/tags?search=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        let tags: TagObj[] = [];
        if (Array.isArray(data)) {
          tags = data.map((t: any) => ({ id: t.id, name: t.name }));
        } else if (Array.isArray(data.tags)) {
          tags = data.tags.map((t: any) => ({ id: t.id, name: t.name }));
        }
        
        // Filter out already selected tags
        tags = tags.filter(tag => !value.some(v => v.id === tag.id));
        console.log('Filtered tags from API:', tags.length);
        
        setFiltered(tags);
        setShowDropdown(true);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching tags:', err);
        setLoading(false);
      });
  };

  // Debounced search for API calls
  const debouncedSearch = useRef(
    debounce((q: string) => {
      handleSearch(q);
    }, 300)
  ).current;

  // Track input changes
  useEffect(() => {
   
    
    if (input.trim()) {
      // Immediate filtering for better UX when availableTags is provided
      if (availableTags !== undefined) {
        const filteredTags = availableTags.filter(tag => 
          tag.name.toLowerCase().includes(input.toLowerCase()) &&
          !value.some(v => v.id === tag.id)
        );
        setFiltered(filteredTags);
        setShowDropdown(true);
      } else {
        // API based search with debounce
        debouncedSearch(input);
      }
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
    
    setHighlighted(-1);
  }, [input, value, availableTags, debouncedSearch]);

  // Show tags on focus
  const handleFocus = () => {
    console.log('Input focused:', {
      availableTagsDefined: availableTags !== undefined, 
      availableTagsLength: availableTags?.length || 0
    });
    
    // Show all available tags not already selected on focus
    if (availableTags !== undefined) {
      const unselectedTags = availableTags.filter(tag => !value.some(v => v.id === tag.id));
      console.log('Showing unselected tags on focus:', unselectedTags.length);
      setFiltered(unselectedTags);
      setShowDropdown(unselectedTags.length > 0);
      if (unselectedTags.length > 0) {
        updateDropdownPosition();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!showDropdown) return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted(prev => {
          const next = prev + 1;
          return next >= filtered.length ? 0 : next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted(prev => {
          const next = prev - 1;
          return next < 0 ? filtered.length - 1 : next;
        });
      } else if (e.key === 'Enter' && highlighted >= 0) {
        e.preventDefault();
        if (filtered[highlighted]) {
          handleAdd(filtered[highlighted]);
        }
      } else if (e.key === 'Enter' && input.trim() && allowCreation && filtered.length === 0) {
        e.preventDefault();
        handleCreateTag(input.trim());
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDropdown, filtered, highlighted, input, allowCreation]);

  // Close dropdown on outside click with improved handling  
  useEffect(() => {
    if (!showDropdown) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicked inside the dropdown
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      
      // Don't close if clicked inside the input container
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        return;
      }
      
      // Otherwise, close the dropdown
      setShowDropdown(false);
    };
    
    // Use capture phase to get the click before it's stopped
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [showDropdown]);

  // Add tag handler
  const handleAdd = (tag: TagObj) => {
    if (!tag || !tag.id) {
      console.error('Attempted to add invalid tag:', tag);
      return;
    }
    
    // Check if tag is already selected to avoid duplicates
    if (value.some(v => v.id === tag.id)) {
      
      return;
    }
    

    
    // Create a new array with the added tag
    const newValue = [...value, tag];
    
    // Call the onChange handler immediately
    onChange(newValue);
    
    // Reset all state
    setInput('');
    setFiltered([]);
    
    // Important: immediately close the dropdown
    setShowDropdown(false);
    
    // Refocus the input after a short delay to allow state updates to complete
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  };

  // Remove tag handler
  const handleRemove = (tag: TagObj) => {
    onChange(value.filter(t => t.id !== tag.id));
  };

  // Create new tag
  const handleCreateTag = async (name: string) => {
    if (creatingTag || !name.trim()) return;
    
    setCreatingTag(true);
    
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      const data = await res.json();
      
      if (data && data.id) {
        const newTag = { id: data.id, name: data.name || name };
        
        // Add to allTags
        setAllTags(prev => [...prev, newTag]);
        
        // Add to selection
        handleAdd(newTag);
      } else {
        console.error('Failed to create tag:', data);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setCreatingTag(false);
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-1.5">
      {label && (
        <Label className="font-medium flex items-center gap-1.5">
          {label}
        </Label>
      )}
      
      <div 
        className="relative"
        ref={containerRef}
      >
        {/* Render selected tags */}
        <div className="flex flex-wrap gap-1.5 p-1 min-h-10 rounded-md border border-input bg-transparent overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
          {value && value.length > 0 ? (
            value.map(tag => (
              <Badge 
                key={tag.id} 
                variant="secondary"
                className="px-2 py-1 text-xs flex items-center gap-1 animate-in fade-in"
              >
                <span className="max-w-[200px] truncate">{tag.name}</span>
                {!disabled && (
                  <X 
                    className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(tag);
                    }}
                  />
                )}
              </Badge>
            ))
          ) : null}
          
          {/* Input field */}
          <div className="relative flex-1 min-w-[8rem]">
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value.trim()) {
                  setShowDropdown(true);
                  requestAnimationFrame(updateDropdownPosition);
                }
              }}
              onFocus={handleFocus}
              onClick={() => {
                if (!showDropdown && availableTags && availableTags.length > 0) {
                  // Show all unselected tags on click
                  const unselectedTags = availableTags.filter(tag => !value.some(v => v.id === tag.id));
                  if (unselectedTags.length > 0) {
                    setFiltered(unselectedTags);
                    setShowDropdown(true);
                    requestAnimationFrame(updateDropdownPosition);
                  }
                }
              }}
              placeholder={value.length ? placeholder : placeholder}
              className="flex-1 h-8 px-1 py-0 border-0 focus-visible:ring-0 focus-visible:outline-none"
              disabled={disabled || isLoading}
            />
          </div>
        </div>
        
        {/* Loading indicator */}
        {isLoading && availableTags === undefined && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {/* Dropdown portal */}
        {showDropdown && typeof window !== 'undefined' && portalRef.current && createPortal(
          <div 
            ref={dropdownRef}
            className="fixed max-h-[280px] overflow-y-auto rounded-lg border-2 border-primary bg-card shadow-xl pointer-events-auto"
            style={{ 
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 9999
            }}
          >
            {/* Tag dropdown content */}
            {filtered.length > 0 ? (
              <>
                <div className="py-1.5 px-2 text-xs font-medium text-primary border-b border-primary/20">
                  {filtered.length} matching {filtered.length === 1 ? 'tag' : 'tags'}
                </div>
                <div className="py-1.5">
                  {filtered.map((tag, i) => (
                    <Button
                      key={tag.id}
                      type="button"
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm h-auto py-1.5 px-2 mb-0.5",
                        i === highlighted && "bg-primary/10"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('Tag button clicked:', tag);
                        handleAdd(tag);
                      }}
                      onMouseEnter={() => setHighlighted(i)}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              input.trim() && allowCreation ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start text-sm h-auto py-2 px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('Create tag button clicked:', input.trim());
                    handleCreateTag(input.trim());
                  }}
                >
                  <Plus className="h-4 w-4 text-primary mr-2" />
                  <span>Create tag "<span className="font-medium">{input.trim()}</span>"</span>
                  {creatingTag && <Loader2 className="h-3.5 w-3.5 animate-spin ml-auto" />}
                </Button>
              ) : (
                <div className="px-3 py-4 text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <div className="p-2 rounded-full bg-muted/50">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p>{availableTags?.length ? 'No matching tags found' : 'No tags available'}</p>
                </div>
              )
            )}
          </div>,
          portalRef.current
        )}
      </div>
    </div>
  );
};

export default TagInput; 