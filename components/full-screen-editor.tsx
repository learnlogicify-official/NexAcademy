import React, { useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
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
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            value={content}
            init={{
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                'searchreplace', 'visualblocks', 'code',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar:
                'undo redo | formatselect | bold italic backcolor | \
                alignleft aligncenter alignright alignjustify | \
                bullist numlist outdent indent | removeformat | help',
              content_style: `
                body { 
                  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
                  font-size: 16px;
                  line-height: 1.6;
                  color: #f8fafc; 
                }
                p { margin: 0 0 1em 0; }
                h1, h2, h3, h4, h5, h6 { 
                  margin-top: 1.5em; 
                  margin-bottom: 0.5em; 
                  line-height: 1.3;
                  font-weight: 600;
                }
                h1 { font-size: 1.8em; }
                h2 { font-size: 1.5em; }
                h3 { font-size: 1.3em; }
                h4 { font-size: 1.2em; }
                ul, ol { 
                  margin-bottom: 1em;
                  padding-left: 1.5em;
                }
                li { margin-bottom: 0.5em; }
                img {
                  max-width: 100%;
                  height: auto;
                }
                blockquote {
                  margin-left: 0;
                  padding-left: 1em;
                  border-left: 3px solid #64748b;
                  font-style: italic;
                }
                pre {
                  background-color: #1e293b;
                  border-radius: 0.25rem;
                  padding: 1em;
                  white-space: pre-wrap;
                }
                table {
                  border-collapse: collapse;
                  width: 100%;
                }
                table td, table th {
                  border: 1px solid #3f3f46;
                  padding: 0.5em;
                }
              `,
              height: '100%',
              min_height: 500,
              resize: false,
              branding: false,
              promote: false
            }}
            onEditorChange={onContentChange}
          />
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