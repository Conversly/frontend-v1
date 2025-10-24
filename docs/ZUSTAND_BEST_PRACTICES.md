# Zustand Store Best Practices

> A comprehensive guide for creating maintainable, performant, and type-safe Zustand stores based on our codebase patterns.

## Table of Contents

1. [Store Structure & Organization](#1-store-structure--organization)
2. [Export Pattern - Granular Selectors](#2-export-pattern---granular-selectors)
3. [Computed/Derived State Patterns](#3-computedderived-state-patterns)
4. [WebSocket Connection Management](#4-websocket-connection-management)
5. [Persistence Configuration](#5-persistence-configuration)
6. [Initialization & Cleanup](#6-initialization--cleanup)
7. [Event Processing Patterns](#7-event-processing-patterns)
8. [Type Safety](#8-type-safety)
9. [Store Composition](#9-store-composition)
10. [State Updates](#10-state-updates)
11. [Naming Conventions](#11-naming-conventions)
12. [Error Handling](#12-error-handling)
13. [Complete Example Template](#complete-example-template)

---

## 1. Store Structure & Organization

### Separate Interface Definitions

Always define clear interfaces for your store state and actions. This improves readability and type safety.

```typescript
interface PortfolioState {
  // State properties
  activePositions: PositionWithPnL[];
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | null;
  
  // Action methods
  setActivePositions: (positions: PositionWithPnL[]) => void;
  initializePortfolioData: (walletAddress: string) => Promise<void>;
  clearPortfolioData: () => void;
}
```

### Use Middleware Appropriately

Choose the right middleware for your use case:

#### Persist Middleware - For localStorage

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: LOCAL_STORAGE_KEY.PORTFOLIO_DATA,
      partialize: (state) => ({ 
        // Only persist needed fields
        activePositions: state.activePositions,
      }),
    }
  )
);
```

#### SubscribeWithSelector - For performance optimization

```typescript
import { subscribeWithSelector } from 'zustand/middleware';

export const usePortfolioStore = create<PortfolioState>()(
  subscribeWithSelector((set, get) => ({
    // Store implementation
  }))
);
```

#### Combining Middlewares

```typescript
export const useMyStore = create<MyState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Store implementation
    })),
    {
      name: 'my-store',
    }
  )
);
```

---

## 2. Export Pattern - Granular Selectors

### ❌ Anti-Pattern: Exporting the entire store

```typescript
// Bad - Component re-renders on ANY state change
export const useMyStore = create(...)

// In component:
const store = useMyStore(); // Re-renders when ANYTHING changes
```

### ✅ Best Practice: Export specific selectors

```typescript
// Good - Component only re-renders when specific data changes
export const useActivePositions = () =>
  usePortfolioStore((state) => state.activePositions);

export const useIsLoading = () => 
  usePortfolioStore((state) => state.isLoading);

export const useInitializePortfolioData = () =>
  usePortfolioStore((state) => state.initializePortfolioData);

// In component:
const activePositions = useActivePositions(); // Only re-renders when activePositions change
const initializeData = useInitializePortfolioData(); // Never causes re-render
```

### Benefits

- ✅ Components only re-render when their specific data changes
- ✅ Better TypeScript inference
- ✅ Clearer component dependencies
- ✅ Easier to refactor and maintain
- ✅ Better performance

---

## 3. Computed/Derived State Patterns

### Use Selectors with Logic

```typescript
// Find primary wallet from multiple sources
export const useUserPrimaryWallet = () =>
  useWalletStore(
    (state) =>
      [...state.solWallets, ...state.evmWallets].find(
        (wallet) => wallet.isPrimary,
      ) || null,
  );

// Combine multiple states
export const useIsLoadingOrNotInitialized = () =>
  usePortfolioStore((state) => state.isLoading || !state.isInitialized);
```

### For Complex Derived State, Use Separate Hooks

```typescript
import { useMemo } from 'react';

export const useAlphaTopPerformers = (count: number = 5) => {
  const tokens = useAlphaTokens();
  
  return useMemo(() => {
    return tokens
      .sort((a, b) => b.performance - a.performance)
      .slice(0, count);
  }, [tokens, count]);
};
```

### When to Use Each Approach

| Approach | Use When |
|----------|----------|
| **Selector with logic** | Simple transformations, filtering, finding |
| **Separate hook with useMemo** | Complex calculations, sorting, expensive operations |

---

## 4. WebSocket Connection Management

### Consistent Connection State Pattern

```typescript
enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

interface SocketStore {
  socket: WebSocket | null;
  connectionState: ConnectionState;
  subscribers: Map<string, Set<Subscriber>>;
  retryCount: number;
  maxRetries: number;
  
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  subscribe: (channel: string, callback: Subscriber) => () => void; // Returns unsubscribe function
}
```

### Connection Implementation

```typescript
connect: () => {
  const state = get();
  
  // Prevent duplicate connections
  if (
    state.socket?.readyState === WebSocket.OPEN ||
    state.connectionState === ConnectionState.CONNECTING
  ) {
    return;
  }
  
  set({ connectionState: ConnectionState.CONNECTING });
  
  const ws = new WebSocket(WSS_URL);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    set({ 
      socket: ws, 
      connectionState: ConnectionState.CONNECTED,
      retryCount: 0, // Reset on successful connection
    });
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    get().handleMessage(message);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    set({ connectionState: ConnectionState.ERROR });
  };
  
  ws.onclose = () => {
    console.log('WebSocket closed');
    set({ 
      socket: null, 
      connectionState: ConnectionState.DISCONNECTED 
    });
    
    // Auto-reconnect logic
    const currentState = get();
    if (currentState.retryCount < currentState.maxRetries) {
      setTimeout(() => get().reconnect(), 1000 * currentState.retryCount);
    }
  };
  
  set({ socket: ws });
},

disconnect: () => {
  const { socket } = get();
  if (socket) {
    socket.close();
    set({ 
      socket: null, 
      connectionState: ConnectionState.DISCONNECTED 
    });
  }
},

reconnect: () => {
  set((state) => ({ retryCount: state.retryCount + 1 }));
  get().connect();
},
```

### Subscription Pattern

```typescript
subscribe: (channel: string, callback: Subscriber) => {
  const { subscribers } = get();
  
  if (!subscribers.has(channel)) {
    subscribers.set(channel, new Set());
  }
  
  subscribers.get(channel)!.add(callback);
  
  // Return unsubscribe function
  return () => {
    const subs = get().subscribers.get(channel);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        get().subscribers.delete(channel);
      }
    }
  };
},

handleMessage: (message: WebSocketMessage) => {
  const { subscribers } = get();
  const channelSubs = subscribers.get(message.channel);
  
  if (channelSubs) {
    channelSubs.forEach((callback) => callback(message.data));
  }
},
```

---

## 5. Persistence Configuration

### Partial State Persistence

Only persist what's necessary. Don't persist derived state, loading flags, or WebSocket connections.

```typescript
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false, // Don't persist
      hasHydrated: false, // Don't persist
      
      setSettings: (settings) => set({ settings }),
    }),
    {
      name: LOCAL_STORAGE_KEY.SETTINGS,
      partialize: (state) => ({ 
        settings: state.settings // Only persist settings
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Merge with defaults to handle new settings
          state.settings = { ...defaultSettings, ...state.settings };
          state.hasHydrated = true;
        }
      },
    }
  )
);
```

### Use Centralized Storage Keys

Create a constants file for localStorage keys:

```typescript
// utils/local-storage-keys.ts
export const LOCAL_STORAGE_KEY = {
  PORTFOLIO_DATA: 'trench_portfolio_data',
  SETTINGS: 'trench_app_settings',
  WALLET_STATE: 'trench_wallet_state',
  USER_PREFERENCES: 'trench_user_preferences',
} as const;

export type LocalStorageKey = typeof LOCAL_STORAGE_KEY[keyof typeof LOCAL_STORAGE_KEY];
```

### Handle Migration

```typescript
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: LOCAL_STORAGE_KEY.SETTINGS,
    version: 1, // Increment when making breaking changes
    migrate: (persistedState: any, version: number) => {
      if (version === 0) {
        // Migrate from version 0 to version 1
        return {
          ...persistedState,
          newField: defaultValue,
        };
      }
      return persistedState;
    },
  }
)
```

---

## 6. Initialization & Cleanup

### Clear Initialization Pattern

```typescript
interface PortfolioState {
  isLoading: boolean;
  isInitialized: boolean;
  data: PortfolioData[];
  error: Error | null;
  
  initializePortfolioData: (walletAddress: string) => Promise<void>;
  clearPortfolioData: () => void;
}

// Implementation
const usePortfolioStore = create<PortfolioState>()(
  (set, get) => ({
    isLoading: false,
    isInitialized: false,
    data: [],
    error: null,
    
    initializePortfolioData: async (walletAddress: string) => {
      const state = get();
      
      // Prevent duplicate initialization
      if (state.isLoading) {
        console.warn('Already loading portfolio data');
        return;
      }
      
      set({ isLoading: true, error: null });
      
      try {
        const data = await fetchPortfolioData(walletAddress);
        set({ 
          data,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to initialize portfolio:', error);
        set({ 
          isLoading: false,
          error: error as Error,
        });
      }
    },
    
    clearPortfolioData: () => set({
      data: [],
      isInitialized: false,
      isLoading: false,
      error: null,
    }),
  })
);
```

### Usage in Components

```typescript
import { useEffect } from 'react';

function PortfolioComponent({ walletAddress }: Props) {
  const initializeData = useInitializePortfolioData();
  const clearData = useClearPortfolioData();
  
  useEffect(() => {
    if (walletAddress) {
      initializeData(walletAddress);
    }
    
    // Cleanup on unmount or wallet change
    return () => {
      clearData();
    };
  }, [walletAddress, initializeData, clearData]);
  
  // ...
}
```

---

## 7. Event Processing Patterns

### WebSocket Event Handler Pattern

```typescript
interface PortfolioState {
  activePositions: Position[];
  transactions: Transaction[];
  
  processWebSocketEvent: (event: TradeEvent) => void;
  updateActivePositions: (event: TradeEvent, existing?: Position) => void;
  updateTransactions: (event: TradeEvent, existing?: Position) => void;
}

const usePortfolioStore = create<PortfolioState>()(
  (set, get) => ({
    activePositions: [],
    transactions: [],
    
    processWebSocketEvent: (event: TradeEvent) => {
      const state = get();
      const tokenAddress = event.data.tokenAddress;
      
      // Find existing position
      const activeIndex = state.activePositions.findIndex(
        (pos) => pos.tokenAddress === tokenAddress
      );
      
      const existingPosition = activeIndex !== -1 
        ? state.activePositions[activeIndex] 
        : undefined;
      
      // Update multiple related states atomically
      get().updateTransactions(event, existingPosition);
      get().updateActivePositions(event, existingPosition);
    },
    
    updateActivePositions: (event, existingPosition) => {
      set((state) => {
        const newPositions = [...state.activePositions];
        
        if (existingPosition) {
          // Update existing
          const index = newPositions.indexOf(existingPosition);
          newPositions[index] = {
            ...existingPosition,
            amount: existingPosition.amount + event.data.amount,
            lastUpdated: Date.now(),
          };
        } else {
          // Add new
          newPositions.push(createPositionFromEvent(event));
        }
        
        return { activePositions: newPositions };
      });
    },
    
    updateTransactions: (event, existingPosition) => {
      set((state) => ({
        transactions: [
          createTransactionFromEvent(event, existingPosition),
          ...state.transactions,
        ].slice(0, MAX_TRANSACTIONS), // Keep only recent transactions
      }));
    },
  })
);
```

### Batch Updates for Performance

```typescript
// ❌ Bad - Multiple separate updates trigger multiple re-renders
set({ isLoading: true });
set({ data: newData });
set({ isLoading: false });

// ✅ Good - Single atomic update
set({
  isLoading: false,
  data: newData,
  lastUpdated: Date.now(),
});
```

---

## 8. Type Safety

### Strongly Typed Store Creation

```typescript
// Define the interface
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

// Create store with explicit type
export const useUserStore = create<UserState>()(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    
    login: async (credentials) => {
      const user = await authService.login(credentials);
      set({ user, isAuthenticated: true });
    },
    
    logout: () => {
      set({ user: null, isAuthenticated: false });
    },
  })
);

// TypeScript will enforce all interface properties are implemented
```

### Type-Safe Selectors

```typescript
// Export with proper types
export const useUser = (): User | null =>
  useUserStore((state) => state.user);

export const useIsAuthenticated = (): boolean =>
  useUserStore((state) => state.isAuthenticated);

export const useLogin = (): (credentials: Credentials) => Promise<void> =>
  useUserStore((state) => state.login);
```

### Generic Helpers

```typescript
// Create typed helpers for common patterns
type Selector<T, U> = (state: T) => U;

export function createTypedSelector<T>() {
  return function useSelector<U>(selector: Selector<T, U>): U {
    return useStore(selector);
  };
}
```

---

## 9. Store Composition

### Access Other Stores When Needed

```typescript
import { useWalletStore } from './wallet';
import { useTrackerStore } from './tracker';

interface PortfolioState {
  processEvent: (event: TradeEvent) => void;
}

const usePortfolioStore = create<PortfolioState>()(
  (set, get) => ({
    processEvent: (event) => {
      // Access other stores using getState()
      const userWallet = useWalletStore.getState().selectedWallet;
      const trackerWallet = useTrackerStore.getState().activeWallet;
      
      const isUserTrade = 
        trackerWallet?.address === event.maker || 
        userWallet?.address === event.maker;
      
      if (isUserTrade) {
        // Process user's trade
        set((state) => ({
          userTrades: [...state.userTrades, event],
        }));
      }
    },
  })
);
```

### Handler Registration Pattern

```typescript
type Handler = (data: any) => void;

interface HandlerStore {
  handlers: Map<string, Handler>;
  registerHandler: (key: string, handler: Handler) => void;
  unregisterHandler: (key: string) => void;
  executeHandlers: (data: any) => void;
}

const useHandlerStore = create<HandlerStore>()(
  (set, get) => ({
    handlers: new Map(),
    
    registerHandler: (key, handler) => {
      const { handlers } = get();
      handlers.set(key, handler);
      set({ handlers: new Map(handlers) }); // Create new Map to trigger update
    },
    
    unregisterHandler: (key) => {
      const { handlers } = get();
      handlers.delete(key);
      set({ handlers: new Map(handlers) });
    },
    
    executeHandlers: (data) => {
      const { handlers } = get();
      handlers.forEach((handler) => handler(data));
    },
  })
);

// Export for easy use
export const useRegisterHandler = () => 
  useHandlerStore((state) => state.registerHandler);

export const useUnregisterHandler = () => 
  useHandlerStore((state) => state.unregisterHandler);

// Usage in component
function MyComponent() {
  const registerHandler = useRegisterHandler();
  const unregisterHandler = useUnregisterHandler();
  
  useEffect(() => {
    const handlerId = 'my-component-handler';
    
    const handler = (data: any) => {
      console.log('Received:', data);
    };
    
    registerHandler(handlerId, handler);
    
    return () => {
      unregisterHandler(handlerId);
    };
  }, [registerHandler, unregisterHandler]);
  
  return <div>...</div>;
}
```

---

## 10. State Updates

### Use Functional Updates for Complex State

```typescript
// ❌ Bad - Direct mutation (doesn't work)
const addToken = (token: Token) => {
  get().tokens.push(token); // Mutates state directly!
  set({ tokens: get().tokens }); // Won't trigger update
};

// ✅ Good - Functional update
const addToken = (token: Token) => 
  set((state) => ({
    tokens: [...state.tokens, token].slice(-MAX_TOKENS)
  }));
```

### Batch Related Updates

```typescript
// ❌ Bad - Multiple updates
const loadData = async () => {
  set({ isLoading: true });
  const data = await fetchData();
  set({ data });
  set({ isLoading: false });
  set({ isInitialized: true });
};

// ✅ Good - Single atomic update
const loadData = async () => {
  set({ isLoading: true });
  try {
    const data = await fetchData();
    set({ 
      data,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  } catch (error) {
    set({ 
      isLoading: false,
      error: error as Error,
    });
  }
};
```

### Immutable Updates for Nested State

```typescript
// ✅ Update nested object immutably
const updateUserProfile = (updates: Partial<Profile>) =>
  set((state) => ({
    user: state.user ? {
      ...state.user,
      profile: {
        ...state.user.profile,
        ...updates,
      },
    } : null,
  }));

// ✅ Update item in array
const updateToken = (address: string, updates: Partial<Token>) =>
  set((state) => ({
    tokens: state.tokens.map((token) =>
      token.address === address
        ? { ...token, ...updates }
        : token
    ),
  }));

// ✅ Remove item from array
const removeToken = (address: string) =>
  set((state) => ({
    tokens: state.tokens.filter((token) => token.address !== address),
  }));
```

---

## 11. Naming Conventions

### State Properties: Use Nouns

```typescript
interface MyState {
  // ✅ Good - Descriptive nouns
  activePositions: Position[];
  selectedWallet: Wallet | null;
  connectionState: ConnectionState;
  isLoading: boolean;
  hasError: boolean;
  
  // ❌ Bad - Unclear or action-like
  positions: Position[]; // Active? Historical? All?
  wallet: Wallet; // Which wallet?
  loading: boolean; // Use 'isLoading' for booleans
}
```

### Action Methods: Use Verbs

```typescript
interface MyState {
  // ✅ Good - Clear action verbs
  setActivePositions: (positions: Position[]) => void;
  initializePortfolioData: (address: string) => Promise<void>;
  processWebSocketEvent: (event: Event) => void;
  clearPortfolioData: () => void;
  
  // ❌ Bad - Unclear or noun-like
  positions: (positions: Position[]) => void; // Confusing with state
  portfolio: (address: string) => Promise<void>; // Not a clear action
}
```

### Exported Selectors: Use 'use' Prefix

```typescript
// ✅ Good - Follows React hooks convention
export const useActivePositions = () =>
  usePortfolioStore((state) => state.activePositions);

export const useIsLoading = () =>
  usePortfolioStore((state) => state.isLoading);

export const useInitializePortfolio = () =>
  usePortfolioStore((state) => state.initializePortfolioData);

// ❌ Bad - Doesn't follow convention
export const getActivePositions = () => ...
export const activePositions = () => ...
```

### Boolean State: Use 'is', 'has', 'should' Prefixes

```typescript
interface MyState {
  // ✅ Good - Clear boolean intent
  isLoading: boolean;
  isInitialized: boolean;
  isConnected: boolean;
  hasError: boolean;
  hasHydrated: boolean;
  shouldAutoReconnect: boolean;
  
  // ❌ Bad - Not obviously boolean
  loading: boolean;
  initialized: boolean;
  error: boolean;
}
```

---

## 12. Error Handling

### Comprehensive Error Handling

```typescript
interface MyState {
  error: Error | null;
  isLoading: boolean;
  retryCount: number;
  maxRetries: number;
  
  loadData: () => Promise<void>;
  handleError: (error: Error) => void;
  retry: () => Promise<void>;
}

const useMyStore = create<MyState>()(
  (set, get) => ({
    error: null,
    isLoading: false,
    retryCount: 0,
    maxRetries: 3,
    
    loadData: async () => {
      const state = get();
      
      if (state.isLoading) {
        console.warn('Already loading');
        return;
      }
      
      set({ isLoading: true, error: null });
      
      try {
        const data = await fetchData();
        set({ 
          data,
          isLoading: false,
          error: null,
          retryCount: 0, // Reset on success
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        get().handleError(error as Error);
      }
    },
    
    handleError: (error: Error) => {
      const state = get();
      
      set({ 
        error,
        isLoading: false,
      });
      
      // Auto-retry logic
      if (state.retryCount < state.maxRetries) {
        console.log(`Retrying... (${state.retryCount + 1}/${state.maxRetries})`);
        setTimeout(() => {
          get().retry();
        }, 1000 * Math.pow(2, state.retryCount)); // Exponential backoff
      }
    },
    
    retry: async () => {
      set((state) => ({ 
        retryCount: state.retryCount + 1,
        error: null,
      }));
      await get().loadData();
    },
  })
);
```

### WebSocket Error Handling

```typescript
connect: () => {
  const state = get();
  
  if (state.connectionState === ConnectionState.CONNECTING) {
    return;
  }
  
  set({ connectionState: ConnectionState.CONNECTING });
  
  try {
    const ws = new WebSocket(WSS_URL);
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ 
        connectionState: ConnectionState.ERROR,
        error: new Error('WebSocket connection failed'),
      });
      
      // Implement retry with backoff
      const currentState = get();
      if (currentState.retryCount < currentState.maxRetries) {
        const delay = 1000 * Math.pow(2, currentState.retryCount);
        console.log(`Reconnecting in ${delay}ms...`);
        setTimeout(() => get().reconnect(), delay);
      }
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      set({ 
        socket: null,
        connectionState: ConnectionState.DISCONNECTED,
      });
      
      // Only auto-reconnect if close was unexpected
      if (!event.wasClean) {
        get().reconnect();
      }
    };
    
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    set({ 
      connectionState: ConnectionState.ERROR,
      error: error as Error,
    });
  }
},
```

---

## Complete Example Template

Here's a comprehensive template that incorporates all best practices:

```typescript
// my-feature-store.ts
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { LOCAL_STORAGE_KEY } from '@/utils/local-storage-keys';

// ============================================================================
// TYPES
// ============================================================================

interface DataItem {
  id: string;
  name: string;
  value: number;
}

enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface MyFeatureState {
  // Data state
  data: DataItem[];
  selectedItem: DataItem | null;
  
  // UI state
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | null;
  
  // WebSocket state
  socket: WebSocket | null;
  connectionState: ConnectionState;
  retryCount: number;
  maxRetries: number;
  
  // Data actions
  initializeData: () => Promise<void>;
  updateData: (data: DataItem[]) => void;
  addItem: (item: DataItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<DataItem>) => void;
  setSelectedItem: (item: DataItem | null) => void;
  clearData: () => void;
  
  // WebSocket actions
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  sendMessage: (message: any) => void;
  handleMessage: (message: any) => void;
  
  // Error handling
  handleError: (error: Error) => void;
  clearError: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_RETRY_COUNT = 3;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.example.com';

// ============================================================================
// STORE CREATION
// ============================================================================

export const useMyFeatureStore = create<MyFeatureState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Initial state
      data: [],
      selectedItem: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      socket: null,
      connectionState: ConnectionState.DISCONNECTED,
      retryCount: 0,
      maxRetries: MAX_RETRY_COUNT,
      
      // Data actions
      initializeData: async () => {
        const state = get();
        
        // Prevent duplicate initialization
        if (state.isLoading) {
          console.warn('Already loading data');
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/my-feature');
          if (!response.ok) throw new Error('Failed to fetch data');
          
          const data = await response.json();
          
          set({ 
            data,
            isInitialized: true,
            isLoading: false,
            error: null,
            retryCount: 0,
          });
          
          // Connect WebSocket after data loads
          get().connect();
        } catch (error) {
          console.error('Failed to initialize:', error);
          get().handleError(error as Error);
        }
      },
      
      updateData: (data) => set({ data }),
      
      addItem: (item) =>
        set((state) => ({
          data: [...state.data, item],
        })),
      
      removeItem: (id) =>
        set((state) => ({
          data: state.data.filter((item) => item.id !== id),
          selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
        })),
      
      updateItem: (id, updates) =>
        set((state) => ({
          data: state.data.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
          selectedItem: state.selectedItem?.id === id
            ? { ...state.selectedItem, ...updates }
            : state.selectedItem,
        })),
      
      setSelectedItem: (item) => set({ selectedItem: item }),
      
      clearData: () => set({
        data: [],
        selectedItem: null,
        isInitialized: false,
        isLoading: false,
        error: null,
      }),
      
      // WebSocket actions
      connect: () => {
        const state = get();
        
        // Prevent duplicate connections
        if (
          state.socket?.readyState === WebSocket.OPEN ||
          state.connectionState === ConnectionState.CONNECTING
        ) {
          return;
        }
        
        set({ connectionState: ConnectionState.CONNECTING });
        
        try {
          const ws = new WebSocket(WS_URL);
          
          ws.onopen = () => {
            console.log('WebSocket connected');
            set({ 
              socket: ws,
              connectionState: ConnectionState.CONNECTED,
              retryCount: 0,
              error: null,
            });
          };
          
          ws.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              get().handleMessage(message);
            } catch (error) {
              console.error('Failed to parse message:', error);
            }
          };
          
          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            set({ 
              connectionState: ConnectionState.ERROR,
              error: new Error('WebSocket connection failed'),
            });
          };
          
          ws.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            set({ 
              socket: null,
              connectionState: ConnectionState.DISCONNECTED,
            });
            
            // Auto-reconnect if close was unexpected
            const currentState = get();
            if (!event.wasClean && currentState.retryCount < currentState.maxRetries) {
              const delay = 1000 * Math.pow(2, currentState.retryCount);
              console.log(`Reconnecting in ${delay}ms...`);
              setTimeout(() => get().reconnect(), delay);
            }
          };
          
          set({ socket: ws });
        } catch (error) {
          console.error('Failed to create WebSocket:', error);
          get().handleError(error as Error);
        }
      },
      
      disconnect: () => {
        const { socket } = get();
        if (socket) {
          socket.close();
          set({ 
            socket: null,
            connectionState: ConnectionState.DISCONNECTED,
          });
        }
      },
      
      reconnect: () => {
        set((state) => ({ 
          retryCount: state.retryCount + 1,
        }));
        get().connect();
      },
      
      sendMessage: (message) => {
        const { socket, connectionState } = get();
        
        if (socket && connectionState === ConnectionState.CONNECTED) {
          socket.send(JSON.stringify(message));
        } else {
          console.warn('Cannot send message: WebSocket not connected');
        }
      },
      
      handleMessage: (message) => {
        // Handle different message types
        switch (message.type) {
          case 'UPDATE':
            if (message.data) {
              get().updateItem(message.data.id, message.data);
            }
            break;
          case 'ADD':
            if (message.data) {
              get().addItem(message.data);
            }
            break;
          case 'REMOVE':
            if (message.data?.id) {
              get().removeItem(message.data.id);
            }
            break;
          default:
            console.warn('Unknown message type:', message.type);
        }
      },
      
      // Error handling
      handleError: (error) => {
        const state = get();
        
        set({ 
          error,
          isLoading: false,
        });
        
        // Auto-retry logic for initialization
        if (!state.isInitialized && state.retryCount < state.maxRetries) {
          console.log(`Retrying... (${state.retryCount + 1}/${state.maxRetries})`);
          setTimeout(() => {
            set((s) => ({ retryCount: s.retryCount + 1 }));
            get().initializeData();
          }, 1000 * Math.pow(2, state.retryCount));
        }
      },
      
      clearError: () => set({ error: null }),
    })),
    {
      name: LOCAL_STORAGE_KEY.MY_FEATURE,
      partialize: (state) => ({ 
        // Only persist necessary fields
        data: state.data,
        selectedItem: state.selectedItem,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrating store...');
        if (state) {
          // Reset transient state after rehydration
          state.isLoading = false;
          state.error = null;
          state.socket = null;
          state.connectionState = ConnectionState.DISCONNECTED;
        }
      },
    }
  )
);

// ============================================================================
// SELECTORS - Export granular selectors
// ============================================================================

// Data selectors
export const useMyFeatureData = () =>
  useMyFeatureStore((state) => state.data);

export const useSelectedItem = () =>
  useMyFeatureStore((state) => state.selectedItem);

// UI state selectors
export const useIsLoading = () =>
  useMyFeatureStore((state) => state.isLoading);

export const useIsInitialized = () =>
  useMyFeatureStore((state) => state.isInitialized);

export const useError = () =>
  useMyFeatureStore((state) => state.error);

// WebSocket selectors
export const useConnectionState = () =>
  useMyFeatureStore((state) => state.connectionState);

export const useIsConnected = () =>
  useMyFeatureStore((state) => state.connectionState === ConnectionState.CONNECTED);

// Action selectors
export const useInitializeMyFeature = () =>
  useMyFeatureStore((state) => state.initializeData);

export const useAddItem = () =>
  useMyFeatureStore((state) => state.addItem);

export const useRemoveItem = () =>
  useMyFeatureStore((state) => state.removeItem);

export const useUpdateItem = () =>
  useMyFeatureStore((state) => state.updateItem);

export const useSetSelectedItem = () =>
  useMyFeatureStore((state) => state.setSelectedItem);

export const useClearData = () =>
  useMyFeatureStore((state) => state.clearData);

export const useConnectWebSocket = () =>
  useMyFeatureStore((state) => state.connect);

export const useDisconnectWebSocket = () =>
  useMyFeatureStore((state) => state.disconnect);

export const useSendMessage = () =>
  useMyFeatureStore((state) => state.sendMessage);

// Derived selectors
export const useIsReady = () =>
  useMyFeatureStore((state) => state.isInitialized && !state.isLoading);

export const useHasError = () =>
  useMyFeatureStore((state) => state.error !== null);

export const useItemById = (id: string) =>
  useMyFeatureStore((state) => 
    state.data.find((item) => item.id === id) || null
  );

// ============================================================================
// COMPUTED/DERIVED HOOKS
// ============================================================================

import { useMemo } from 'react';

export const useSortedData = (sortBy: keyof DataItem = 'name') => {
  const data = useMyFeatureData();
  
  return useMemo(() => {
    return [...data].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });
  }, [data, sortBy]);
};

export const useFilteredData = (predicate: (item: DataItem) => boolean) => {
  const data = useMyFeatureData();
  
  return useMemo(() => {
    return data.filter(predicate);
  }, [data, predicate]);
};

// ============================================================================
// USAGE EXAMPLE IN COMPONENT
// ============================================================================

/*
import { useEffect } from 'react';
import {
  useMyFeatureData,
  useIsLoading,
  useIsConnected,
  useInitializeMyFeature,
  useConnectWebSocket,
  useDisconnectWebSocket,
  useSortedData,
} from '@/store/my-feature-store';

function MyFeatureComponent() {
  // Get data and state
  const data = useSortedData('name');
  const isLoading = useIsLoading();
  const isConnected = useIsConnected();
  
  // Get actions
  const initialize = useInitializeMyFeature();
  const connect = useConnectWebSocket();
  const disconnect = useDisconnectWebSocket();
  
  // Initialize on mount
  useEffect(() => {
    initialize();
    
    return () => {
      disconnect();
    };
  }, [initialize, disconnect]);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}: {item.value}</li>
        ))}
      </ul>
    </div>
  );
}
*/
```

---

## Key Takeaways

### ✅ DO

1. **Always export granular selectors** - Never make components use the raw store
2. **Use TypeScript interfaces** for complete type safety
3. **Implement proper initialization/cleanup** patterns with flags
4. **Persist only necessary state** using `partialize`
5. **Handle WebSocket connections** with proper state machine pattern
6. **Prevent duplicate operations** with loading/connecting flags
7. **Use functional updates** for state that depends on previous state
8. **Implement error boundaries** in all async operations
9. **Follow consistent naming** conventions (is/has/should for booleans)
10. **Compose stores carefully** using `getState()` when needed

### ❌ DON'T

1. **Don't export the raw store** for component consumption
2. **Don't mutate state directly** - always create new objects/arrays
3. **Don't persist transient state** (loading flags, WebSocket connections)
4. **Don't batch updates in separate `set()` calls** - combine them
5. **Don't forget cleanup** - disconnect WebSockets, clear intervals
6. **Don't use the store hook in event handlers** - use `getState()` instead
7. **Don't duplicate state** - compute derived values in selectors
8. **Don't ignore errors** - always handle and log them appropriately
9. **Don't create circular dependencies** between stores
10. **Don't skip TypeScript** - type safety catches bugs early

---

## Additional Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Last Updated:** October 23, 2025  
**Version:** 1.0.0
