# Admin Dashboard Component Architecture

## Visual Component Tree

```
┌─────────────────────────────────────────────────────────────┐
│                    AdminDashboard (Main)                     │
│                     (~200 lines)                             │
│                                                              │
│  State: tokens, filters, modals                             │
│  Logic: filtering, CRUD operations                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌──────────────────┐ ┌─────────────┐ ┌──────────────────┐
│ DashboardHeader  │ │    Stats    │ │  TokenFilters    │
│   (~40 lines)    │ │ (~55 lines) │ │   (~95 lines)    │
├──────────────────┤ ├─────────────┤ ├──────────────────┤
│ • Title/Logo     │ │ • Total     │ │ • Search         │
│ • Logout Button  │ │ • RWA Count │ │ • Type Filter    │
│                  │ │ • Crypto    │ │ • Status Filter  │
│                  │ │ • Active    │ │ • Chain Filter   │
│                  │ │             │ │ • Add Button     │
└──────────────────┘ └─────────────┘ └──────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌──────────────────┐            ┌──────────────────┐
│   TokenTable     │            │   TokenModal     │
│  (~125 lines)    │            │  (~320 lines)    │
├──────────────────┤            ├──────────────────┤
│ • Table Header   │            │ • Form Fields    │
│ • Token Rows     │            │ • Address Mgmt   │
│ • Edit/Delete    │            │ • Validation     │
│                  │            │ • Save/Cancel    │
│   ┌──────────┐   │            │                  │
│   │TokenRow  │   │            │                  │
│   │(internal)│   │            │                  │
│   └──────────┘   │            │                  │
└──────────────────┘            └──────────────────┘
```

## Component Size Comparison

### Before Refactoring
```
┌────────────────────────────────────────────────────────────┐
│                   AdminDashboard.tsx                        │
│                      724 lines                              │
│                                                             │
│  All functionality in one massive file                     │
│  - Header, Stats, Filters, Table, Modal, Logic            │
└────────────────────────────────────────────────────────────┘
```

### After Refactoring
```
AdminDashboard.tsx          ~200 lines  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░
AdminTokenModal.tsx         ~320 lines  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
AdminTokenTable.tsx         ~125 lines  ▓▓▓▓▓░░░░░░░░░░░░░░░░
AdminTokenFilters.tsx       ~95  lines  ▓▓▓▓░░░░░░░░░░░░░░░░░
AdminDashboardStats.tsx     ~55  lines  ▓▓░░░░░░░░░░░░░░░░░░░
AdminDashboardHeader.tsx    ~40  lines  ▓▓░░░░░░░░░░░░░░░░░░░
                           ───────────
Total:                      ~835 lines  (includes better structure)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Interactions                     │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
             ▼                        ▼
      ┌────────────┐          ┌────────────┐
      │  Filter    │          │   CRUD     │
      │  Actions   │          │  Actions   │
      └──────┬─────┘          └──────┬─────┘
             │                       │
             │    ┌──────────────────┤
             │    │                  │
             ▼    ▼                  ▼
      ┌──────────────────────────────────────┐
      │       AdminDashboard (State)         │
      │  • tokens[]                          │
      │  • filteredTokens[]                  │
      │  • filters (search, type, etc.)      │
      │  • modals (show/hide, editing)       │
      └──────────────┬───────────────────────┘
                     │
       ┌─────────────┼─────────────────┐
       │             │                 │
       ▼             ▼                 ▼
  [Display]     [Display]         [Display]
   Stats         Filtered          Modal
               Token List        (if open)
```

## Props Flow Diagram

```
AdminDashboard
│
├─> AdminDashboardHeader
│   └─> onLogout: () => void
│
├─> AdminDashboardStats
│   └─> tokens: AdminToken[]
│
├─> AdminTokenFilters
│   ├─> searchQuery: string
│   ├─> filterType: FilterType
│   ├─> filterActive: boolean | null
│   ├─> selectedChainId: string
│   ├─> onSearchChange: (query) => void
│   ├─> onFilterTypeChange: (type) => void
│   ├─> onFilterActiveChange: (active) => void
│   ├─> onChainIdChange: (chainId) => void
│   └─> onAddToken: () => void
│
├─> AdminTokenTable
│   ├─> tokens: AdminToken[]
│   ├─> onEdit: (token) => void
│   └─> onDelete: (tokenId) => void
│
└─> AdminTokenModal (conditional)
    ├─> token: AdminToken | null
    ├─> onClose: () => void
    └─> onSave: (token) => void
```

## State Management Pattern

```
┌────────────────────────────────────────────┐
│         AdminDashboard State               │
├────────────────────────────────────────────┤
│                                            │
│  Source State:                             │
│  ├─ tokens: AdminToken[]                   │
│  └─ editingToken: AdminToken | null        │
│                                            │
│  Filter State:                             │
│  ├─ searchQuery: string                    │
│  ├─ filterType: FilterType                 │
│  ├─ filterActive: boolean | null           │
│  └─ selectedChainId: string                │
│                                            │
│  Derived State:                            │
│  └─ filteredTokens: AdminToken[]           │
│     (computed via useEffect)               │
│                                            │
│  UI State:                                 │
│  ├─ showAddModal: boolean                  │
│  └─ editingToken: AdminToken | null        │
│                                            │
└────────────────────────────────────────────┘
```

## Responsibility Matrix

| Component              | Rendering | State | Logic | API Calls |
|------------------------|-----------|-------|-------|-----------|
| AdminDashboard         | ✓         | ✓✓✓   | ✓✓✓   | (future)  |
| AdminDashboardHeader   | ✓✓✓       | ✗     | ✗     | ✗         |
| AdminDashboardStats    | ✓✓✓       | ✗     | ✓     | ✗         |
| AdminTokenFilters      | ✓✓✓       | ✗     | ✗     | ✗         |
| AdminTokenTable        | ✓✓✓       | ✗     | ✗     | ✗         |
| AdminTokenModal        | ✓✓✓       | ✓     | ✓✓    | ✗         |

Legend:
- ✗ : Not responsible
- ✓ : Minimal responsibility
- ✓✓ : Moderate responsibility
- ✓✓✓ : Primary responsibility

## Component Communication

```
┌─────────────────────────────────────────────────────┐
│              Event Flow Examples                     │
└─────────────────────────────────────────────────────┘

1. Search Token:
   User types in search box
   → AdminTokenFilters.onSearchChange()
   → AdminDashboard.setSearchQuery()
   → useEffect triggers filtering
   → AdminTokenTable receives filtered tokens

2. Add Token:
   User clicks "Add Token"
   → AdminTokenFilters.onAddToken()
   → AdminDashboard.setShowAddModal(true)
   → AdminTokenModal renders
   → User fills form and saves
   → AdminTokenModal.onSave()
   → AdminDashboard.handleSaveToken()
   → Modal closes, token list updates

3. Edit Token:
   User clicks edit icon
   → AdminTokenTable.onEdit(token)
   → AdminDashboard.setEditingToken(token)
   → AdminTokenModal renders with token data
   → User updates and saves
   → AdminTokenModal.onSave()
   → AdminDashboard updates token in list

4. Delete Token:
   User clicks delete icon
   → AdminTokenTable.onDelete(tokenId)
   → AdminDashboard.handleDeleteToken()
   → Confirmation dialog
   → Token removed from list
```

## File Size Metrics

```
Component Lines Breakdown:

AdminDashboard.tsx:
├─ Imports:           15 lines
├─ Mock Data:         100 lines
├─ Component Logic:   60 lines
└─ JSX:               25 lines
                      ──────────
                      ~200 lines

AdminTokenModal.tsx:
├─ Imports:           5 lines
├─ Component Logic:   65 lines
└─ JSX (Form):        250 lines
                      ──────────
                      ~320 lines

AdminTokenTable.tsx:
├─ Imports:           5 lines
├─ TokenRow:          60 lines
└─ Table Component:   60 lines
                      ──────────
                      ~125 lines

AdminTokenFilters.tsx:
├─ Imports:           3 lines
├─ Props Interface:   15 lines
└─ JSX:               77 lines
                      ──────────
                      ~95 lines

AdminDashboardStats.tsx:
├─ Imports:           5 lines
├─ StatCard:          20 lines
└─ Stats Component:   30 lines
                      ──────────
                      ~55 lines

AdminDashboardHeader.tsx:
├─ Imports:           3 lines
└─ Component:         37 lines
                      ──────────
                      ~40 lines
```
