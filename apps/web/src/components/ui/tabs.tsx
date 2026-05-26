'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, createContext, useContext, useState } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({ 
  defaultValue = '', 
  value: controlledValue, 
  onValueChange,
  className, 
  children, 
  ...props 
}: TabsProps) {
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(defaultValue);
  
  const activeTab = controlledValue ?? uncontrolledActiveTab;
  const setActiveTab = (val: string) => {
    if (controlledValue === undefined) {
      setUncontrolledActiveTab(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const TabsList = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = ({ className, value, children, ...props }: TabsTriggerProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.activeTab === value;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'hover:text-gray-700',
        className
      )}
      onClick={() => context.setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ className, value, children, ...props }: HTMLAttributes<HTMLDivElement> & { value: string }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.activeTab !== value) return null;

  return (
    <div
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };