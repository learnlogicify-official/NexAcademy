import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FullScreenEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  content: string;
  onContentChange: (content: string) => void;
  isEditing: boolean;
}

export default function FullScreenEditor({
  isOpen,
  onClose,
  onSave,
  title,
  onTitleChange,
  content,
  onContentChange,
  isEditing
}: FullScreenEditorProps) {
  // Prevent scrolling on the body when fullscreen is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black z-[9999]"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999999,
        backgroundColor: '#111',
      }}
    >
      <div className="flex flex-col h-screen p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? "Edit Article" : "Add New Article"}
          </h2>
          <Button variant="outline" onClick={onClose}>Exit Fullscreen</Button>
        </div>
        
        <div className="bg-background p-4 rounded-lg mb-4">
          <Input
            name="title"
            value={title}
            onChange={onTitleChange}
            placeholder="Article Title"
            className="w-full mb-4"
          />
        </div>
        
        <div className="flex-1 bg-background rounded-lg overflow-hidden">
          {/* Placeholder for a new rich text editor */}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(); onClose(); }}>
            {isEditing ? "Save Changes" : "Add Article"}
          </Button>
        </div>
      </div>
    </div>
  );
} 