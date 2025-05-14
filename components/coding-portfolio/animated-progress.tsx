"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface AnimatedProgressProps {
  value: number;
  max: number;
  label?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
  innerClassName?: string;
  duration?: number;
}

export function AnimatedProgress({
  value,
  max,
  label,
  color = 'primary',
  size = 'md',
  showValue = true,
  valueFormatter = (v) => v.toString(),
  className = '',
  innerClassName = '',
  duration = 1.5
}: AnimatedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min(100, Math.round((value / max) * 100));
  
  // Height based on size
  const heightClass = 
    size === 'sm' ? 'h-1.5' :
    size === 'lg' ? 'h-4' : 'h-2.5';
  
  // Color class based on color prop
  let bgClass = '';
  if (color === 'primary') {
    bgClass = 'bg-primary/20 dark:bg-primary/30';
  } else if (color === 'green') {
    bgClass = 'bg-green-500/20 dark:bg-green-500/30';
  } else if (color === 'amber') {
    bgClass = 'bg-amber-500/20 dark:bg-amber-500/30';
  } else if (color === 'red') {
    bgClass = 'bg-red-500/20 dark:bg-red-500/30';
  } else if (color === 'blue') {
    bgClass = 'bg-blue-500/20 dark:bg-blue-500/30';
  } else {
    bgClass = 'bg-slate-200 dark:bg-slate-700/50';
  }
  
  // Fill color class based on color prop
  let fillClass = '';
  if (color === 'primary') {
    fillClass = 'bg-primary';
  } else if (color === 'green') {
    fillClass = 'bg-green-500';
  } else if (color === 'amber') {
    fillClass = 'bg-amber-500';
  } else if (color === 'red') {
    fillClass = 'bg-red-500';
  } else if (color === 'blue') {
    fillClass = 'bg-blue-500';
  } else {
    fillClass = 'bg-slate-500';
  }
  
  // Animate the count
  useEffect(() => {
    // If value is 0, set displayValue to 0 without animation
    if (value === 0) {
      setDisplayValue(0);
      return;
    }
    
    // Otherwise animate
    let start = 0;
    const end = Math.min(value, max);
    const stepTime = Math.abs(Math.floor(duration * 1000 / end));
    
    if (start === end) return;
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      
      if (start >= end) {
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => {
      clearInterval(timer);
    };
  }, [value, max, duration]);
  
  return (
    <div className={`w-full ${className}`}>
      {/* Label and value */}
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5 text-xs text-slate-600 dark:text-slate-300">
          {label && <div className="font-medium">{label}</div>}
          {showValue && (
            <div className="tabular-nums">
              {valueFormatter(displayValue)} <span className="text-slate-400 dark:text-slate-500">/ {valueFormatter(max)}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Progress bar */}
      <div className={`w-full ${heightClass} rounded-full overflow-hidden ${bgClass}`}>
        <motion.div
          className={`${heightClass} rounded-full ${fillClass} ${innerClassName}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration, 
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  );
}

// Circular progress variant
export function AnimatedCircularProgress({
  value,
  max,
  size = 100,
  strokeWidth = 8,
  color = 'primary',
  showValue = true,
  valueFormatter = (v) => v.toString(),
  className = '',
  duration = 1.5
}: Omit<AnimatedProgressProps, 'size' | 'innerClassName'> & { 
  size?: number;
  strokeWidth?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min(100, (value / max) * 100);
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Color classes
  let strokeColor = '';
  if (color === 'primary') {
    strokeColor = 'stroke-primary';
  } else if (color === 'green') {
    strokeColor = 'stroke-green-500';
  } else if (color === 'amber') {
    strokeColor = 'stroke-amber-500';
  } else if (color === 'red') {
    strokeColor = 'stroke-red-500';
  } else if (color === 'blue') {
    strokeColor = 'stroke-blue-500';
  } else {
    strokeColor = 'stroke-slate-500';
  }
  
  // Animate the count
  useEffect(() => {
    // If value is 0, set displayValue to 0 without animation
    if (value === 0) {
      setDisplayValue(0);
      return;
    }
    
    // Otherwise animate
    let start = 0;
    const end = Math.min(value, max);
    const stepTime = Math.abs(Math.floor(duration * 1000 / end));
    
    if (start === end) return;
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      
      if (start >= end) {
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => {
      clearInterval(timer);
    };
  }, [value, max, duration]);
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={strokeColor}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      
      {/* Center content */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums">{displayValue}</span>
          {max !== 100 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">of {max}</span>
          )}
        </div>
      )}
    </div>
  );
} 