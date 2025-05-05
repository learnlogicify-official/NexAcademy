"use client";

import { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PanelsFullscreenProps {
  className?: string;
}

export function PanelsFullscreen({ className = "" }: PanelsFullscreenProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Toggle the left panel expansion
  const toggleLeftPanelExpand = () => {
    // Find the main container elements
    const leftPanel = document.querySelector('.left-panel') as HTMLElement;
    const rightPanel = document.querySelector('.right-panel') as HTMLElement;
    const horizontalResizer = document.querySelector('.horizontal-resizer') as HTMLElement;
    
    if (!leftPanel || !rightPanel) return;
    
    if (isExpanded) {
      // Restore normal view
      leftPanel.style.width = '50%'; // Default width
      leftPanel.classList.remove('left-panel-expanded');
      rightPanel.style.display = '';
      if (horizontalResizer) horizontalResizer.style.display = '';
      setIsExpanded(false);
    } else {
      // Expand the left panel
      leftPanel.style.width = '100%';
      leftPanel.classList.add('left-panel-expanded');
      rightPanel.style.display = 'none';
      if (horizontalResizer) horizontalResizer.style.display = 'none';
      setIsExpanded(true);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className={`panels-fullscreen-btn h-8 w-8 bg-background/90 border border-border hover:bg-muted ${className}`}
      onClick={toggleLeftPanelExpand}
      title="Expand left panel"
    >
      {isExpanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
    </Button>
  );
} 