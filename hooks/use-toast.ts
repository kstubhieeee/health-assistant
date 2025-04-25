'use client';

// Simple toast implementation
import * as React from 'react';

// Simplified interface
export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export interface ToastActionElement {
  // Empty interface for compatibility
}

// Simplified toast function
export function toast(props: ToastProps) {
  // Just log the toast message and use alert for now
  console.log('Toast:', props.title, props.description);
  if (props.title || props.description) {
    const message = props.title ? `${props.title}: ${props.description || ''}` : props.description;
    alert(message);
  }
  
  return {
    id: 'toast-id',
    dismiss: () => {},
    update: () => {},
  };
}

// Simplified useToast hook
export function useToast() {
  return {
    toast,
    toasts: [],
    dismiss: () => {},
  };
}
