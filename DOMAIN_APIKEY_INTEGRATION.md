# Domain & API Key Integration Summary

## Overview
Successfully integrated separate domain and API key management routes, removing `allowedDomains` from the widget configuration API.

## Changes Made

### 1. **API Routes (`lib/api/deploy.ts`)**
Added 4 new API functions:

#### Domain Management
- `getDomainAllowlist(chatbotId)` - GET `/widget/domain/:chatbotId`
  - Fetches all allowed domains for a chatbot
  - Returns: `{ domains: DomainInfo[] }`

- `addDomainToAllowlist(chatbotId, domain)` - POST `/widget/domain`
  - Adds a new domain to the allowlist
  - Returns: `{ id, domain, createdAt }`

#### API Key Management
- `getApiKey(chatbotId)` - GET `/key/:chatbotId`
  - Fetches the API key for a chatbot
  - Returns: `{ apiKey: string | null }`

- `createApiKey(chatbotId)` - POST `/key/:chatbotId`
  - Generates a new API key for a chatbot
  - Returns: `{ apiKey: string }`

### 2. **Types (`types/customization.ts`)**
- **Removed** `allowedDomains: string[]` from `UIConfigInput` interface
- Domains are now managed separately through dedicated API endpoints

### 3. **Store (`store/chatbot/customization.ts`)**
Added new state management:

#### Domain State
```typescript
domains: DomainInfo[]
isLoadingDomains: boolean
isSavingDomain: boolean
loadDomains(chatbotId): Promise<void>
addDomain(chatbotId, domain): Promise<void>
```

#### API Key State
```typescript
apiKey: string | null
isLoadingApiKey: boolean
isCreatingApiKey: boolean
loadApiKey(chatbotId): Promise<void>
generateApiKey(chatbotId): Promise<string>
```

#### Widget Config Changes
- `allowedDomains` is now sent as an empty array `[]` in widget config saves
- No longer part of the UI draft configuration
- `payloadToUIConfig()` no longer extracts `allowedDomains` from server payload

### 4. **UI (`components/chatbot/tabs/CustomizationTab.tsx`)**

#### API Key Section (Integration Tab)
- **Before**: Email request button to contact support
- **After**: 
  - Shows loading state while fetching
  - If no key exists: "Generate API Key" button
  - If key exists: 
    - Display with show/hide toggle
    - Copy to clipboard button
    - Security warning message

#### Allowed Domains Section (Integration Tab)
- **Before**: Inline editing with add/remove for local draft
- **After**:
  - Lists all domains from server with creation dates
  - Input field + "Add" button to add new domains
  - Shows loading state while fetching
  - Empty state when no domains exist
  - Real-time updates after adding domains
  - Domain format validation hint

#### Lifecycle
- `useEffect` now loads 3 separate resources on mount:
  1. Widget configuration
  2. Domain allowlist
  3. API key

## API Integration Flow

### Domain Management
```
1. Load domains on component mount
2. Display all domains with metadata
3. User enters new domain → validation
4. POST to /widget/domain → adds to list
5. Toast notification on success/failure
```

### API Key Management
```
1. Load API key on component mount
2. If null → show "Generate" button
3. User clicks generate → POST to /key/:chatbotId
4. Store returns new key → update UI
5. User can show/hide/copy key
```

## Benefits

1. **Separation of Concerns**: Domains and API keys are managed independently from widget styling/config
2. **Better Security**: API keys are handled through dedicated endpoints
3. **Improved UX**: 
   - Real-time domain list with metadata
   - Generate API key without leaving the app
   - Clear loading and error states
4. **Type Safety**: Removed `allowedDomains` from UI config prevents confusion
5. **Scalability**: Easier to add domain management features (delete, edit, etc.)

## Migration Notes

- Existing `allowedDomains` in widget config are no longer used
- Domains should be migrated to the new domain table via backend migration
- Widget config API now ignores `allowedDomains` field or sets it to `[]`

## Testing Checklist

- [ ] Load domains on chatbot page load
- [ ] Add new domain successfully
- [ ] Domain validation errors display correctly
- [ ] Generate API key for chatbot
- [ ] Show/hide API key works
- [ ] Copy API key to clipboard
- [ ] Loading states display properly
- [ ] Error toasts show on failures
- [ ] Widget config save doesn't include domains
