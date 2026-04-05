# Verity Frontend - Pages & Features

## Overview
This document outlines the frontend pages and their corresponding features based on the Verity blockchain backend.

---

## Authentication Pages

### 1. **Login Page** (`/login`)
- Email/Username input
- Password input
- Login button
- "Forgot Password?" link
- Link to Sign Up page
- JWT token storage upon successful login
- Error messages for failed authentication

### 2. **Sign Up Page** (`/signup`)
- Name input
- Email input
- Password input
- Confirm Password input
- Create Account button
- Link to Login page
- Input validation (password strength, email format)
- Success message with redirect to login

### 3. **Forgot Password Page** (`/forgot-password`)
- Email input
- Send Reset Link button
- Confirmation message

---

## Dashboard & Home

### 4. **Main Dashboard** (`/dashboard`)
- **Header**: User profile, logout button, notifications
- **Summary Cards**:
  - Total Account Balance
  - Total Transactions (count)
  - Total Blocks (count)
  - Account Status
- **Quick Actions**: Create Transaction, Create Account, View Audit Log
- **Charts/Analytics**:
  - Transaction history graph
  - Block creation timeline
- **Recent Activity Feed**:
  - Latest 5 transactions
  - Latest 5 blocks
  - Latest audit events

---

## Account Management

### 5. **Accounts List Page** (`/accounts`)
- **Table/Cards View**:
  - Account ID
  - Account Name
  - Balance
  - Status (Active/Inactive)
  - Nonce
  - Created Date
- **Search & Filter**:
  - Search by account name or ID
  - Filter by status
- **Pagination**
- **Action Buttons**:
  - View Details
  - Edit
  - Delete (with confirmation)
  - Create New Account button

### 6. **Account Details Page** (`/accounts/:id`)
- **Account Information**:
  - Account ID
  - Account Name
  - Balance
  - Public Key / Private Key (with visibility toggle)
  - Status
  - Nonce (replay attack protection)
  - Created/Updated timestamps
- **Tabs/Sections**:
  - **Transactions**: All transactions linked to this account (paginated)
  - **Audit Log**: All events related to this account
- **Action Buttons**:
  - Edit Account
  - Transfer Balance (if applicable)
  - Delete Account

### 7. **Create/Edit Account Page** (`/accounts/new` | `/accounts/:id/edit`)
- Account Name input
- Initial Balance input
- Status selector (Active/Inactive)
- Generate Key Pair button
- Display generated public/private keys
- Save button
- Cancel button
- Error validation

---

## Transaction Management

### 8. **Transactions List Page** (`/transactions`)
- **Table/Cards View**:
  - Transaction ID
  - From Account
  - To Account
  - Amount
  - Status (Pending, Confirmed, Failed)
  - Hash
  - Timestamp
  - Block Number (if confirmed)
- **Search & Filter**:
  - Filter by status
  - Filter by account
  - Date range filter
- **Pagination**
- **Create New Transaction button**

### 9. **Create Transaction Page** (`/transactions/new`)
- From Account selector (dropdown or search)
- To Account selector (dropdown or search)
- Amount input
- Message/Data input (optional)
- Nonce input (auto-filled from account)
- Sign Transaction button
- Display transaction signature
- Submit Transaction button
- Cancel button
- Error validation

### 10. **Transaction Details Page** (`/transactions/:id`)
- **Transaction Details**:
  - Transaction ID
  - From Account
  - To Account
  - Amount
  - Status
  - Hash
  - Signature
  - Timestamp
  - Block Number (if confirmed)
  - Message/Data
- **Verification Section**:
  - Verify Signature button (shows valid/invalid)
  - Show Public Key used for verification
- **Related Information**:
  - Block containing this transaction (if confirmed)
  - Account audit trail

---

## Block Management

### 11. **Blocks List Page** (`/blocks`)
- **Table/Cards View**:
  - Block Number
  - Merkle Root
  - Block Hash
  - Transaction Count
  - Timestamp
  - Validator/Creator
- **Search & Filter**:
  - Filter by block number range
  - Date range filter
- **Pagination**
- **Create New Block button** (if role allows)

### 12. **Block Details Page** (`/blocks/:id`)
- **Block Information**:
  - Block Number
  - Merkle Root
  - Block Hash
  - Timestamp
  - Creator/Validator
- **Transactions in Block**:
  - Table of all transactions in this block
  - Click each transaction to view details
- **Merkle Tree Visualization**:
  - Visual representation of merkle tree
  - Leaf nodes (transaction hashes)
  - Branch nodes
  - Root hash
- **Verification Section**:
  - Verify Merkle Root button
  - Show verification status
- **Related Information**:
  - Previous Block link
  - Next Block link (if exists)

---

## Consensus & Voting

### 13. **Consensus Page** (`/consensus`)
- **Current Consensus State**:
  - Current Leader
  - Voting Status
  - Participants count
- **Active Proposals/Votes**:
  - Proposal description
  - Voting options
  - Current vote counts
  - Time remaining
  - User's vote (if eligible)
- **Vote History**:
  - Table of past votes/consensus rounds
  - Results
  - Timestamp
- **Cast New Vote button** (if eligible)

### 14. **Voting/Consensus Details Page** (`/consensus/:id`)
- **Proposal Details**:
  - Title
  - Description
  - Status (Active, Closed, Passed, Failed)
  - Created Date
  - Deadline
- **Vote Results**:
  - Bar chart showing vote distribution
  - Participants and their votes
  - Vote counts by option
- **Cast Vote** (if active and user is eligible):
  - Vote options buttons
  - Submit button
  - Confirmation before submitting

---

## Audit & Compliance

### 15. **Audit Log Page** (`/audit`)
- **Audit Events Table**:
  - Event ID
  - Event Type (Create, Update, Delete, Transfer, Verify, etc.)
  - Account involved
  - Description
  - Timestamp
  - Status
- **Search & Filter**:
  - Filter by event type
  - Filter by account
  - Date range filter
  - Search by description
- **Pagination**
- **Export Audit Log button** (CSV/JSON)

### 16. **Audit Event Details Page** (`/audit/:id`)
- **Event Information**:
  - Event ID
  - Event Type
  - Related Account
  - Description
  - Timestamp
  - User who triggered event
  - IP Address (if tracked)
- **Related Data**:
  - Links to related transaction/account/block
  - Before/After values (if applicable)
- **Compliance Info**:
  - Immutability status
  - Retention policy

---

## Ledger & State

### 17. **Ledger State Page** (`/ledger`)
- **Current Ledger State**:
  - Total Accounts
  - Total Transactions
  - Total Blocks
  - Total Balance in System
  - System Status
- **State History**:
  - Table of ledger state snapshots
  - Timestamp
  - Account count
  - Transaction count
  - Block count
  - State hash
- **Verify State button**:
  - Check integrity of ledger state
  - Display verification result

### 18. **Ledger Verification Page** (`/ledger/verify`)
- **Verification Information**:
  - Current state hash
  - Previous state hash
  - State difference (if any)
  - Verification result (Valid/Invalid)
- **Detailed Report**:
  - All accounts and balances
  - All blocks
  - Hash chain verification
- **Export Ledger button** (JSON)

---

## Cryptography & Verification

### 19. **Merkle Proof Verification Page** (`/crypto/merkle-verify`)
- **Merkle Proof Inputs**:
  - Transaction Hash input
  - Merkle Root input
  - Proof path (JSON input or file upload)
- **Verify button**
- **Result Display**:
  - Valid/Invalid status
  - Step-by-step verification process
  - Visual merkle tree with highlighted path

### 20. **Signature Verification Page** (`/crypto/signature-verify`)
- **Signature Verification Inputs**:
  - Transaction/Message input (or upload)
  - Signature input (hex)
  - Public Key input (hex)
- **Verify button**
- **Result Display**:
  - Valid/Invalid status
  - Algorithm used (ECDSA P-256)
  - Hash algorithm (SHA-256)

---

## User Profile & Settings

### 21. **User Profile Page** (`/profile`)
- **Profile Information**:
  - User name
  - Email
  - Role/Permissions
  - Account created date
  - Last login
- **Edit Profile** section:
  - Change name
  - Change email
  - Change password
- **API Keys** (if applicable):
  - Generate new API key
  - List active keys
  - Revoke keys

### 22. **Settings Page** (`/settings`)
- **Theme Settings**:
  - Dark/Light mode toggle
- **Notification Settings**:
  - Email notifications
  - Push notifications
  - Alert types
- **Security Settings**:
  - Two-factor authentication
  - Session management
  - Active sessions list
- **Preferences**:
  - Items per page
  - Default view (table/cards)
  - Date format
  - Currency format

---

## Additional Pages

### 23. **Error Pages**
- **404 - Not Found** (`/404`)
  - Friendly error message
  - Navigation back to dashboard
- **403 - Forbidden** (`/403`)
  - Insufficient permissions message
  - Request access option
- **500 - Server Error** (`/500`)
  - Error message
  - Report error button
  - Retry option

### 24. **Loading & Splash Screen**
- Display while authenticating
- Progress indicators for long operations

---

## Navigation Structure

### Main Navigation Menu
- Dashboard
- Accounts
- Transactions
- Blocks
- Consensus
- Audit Log
- Ledger
- Crypto Tools (Merkle Verify, Signature Verify)
- Settings
- User Profile (top-right dropdown)

---

## Key Features to Implement Across Pages

1. **JWT Authentication**: Check token validity on every page
2. **Role-Based Access Control**: Show/hide features based on user role
3. **Real-time Updates**: WebSocket or polling for live data (optional)
4. **Responsive Design**: Mobile-friendly on all pages
5. **Data Export**: CSV/JSON export for tables
6. **Search & Filtering**: Consistent across all list pages
7. **Pagination**: For all paginated tables
8. **Error Handling**: Consistent error messages and handling
9. **Confirmation Dialogs**: For destructive actions (delete, transfer)
10. **Loading States**: Show loading spinners for async operations
11. **Toast Notifications**: For success/error messages
12. **Dark Mode**: Theme toggle

---

## Development Phases

**Phase 1 (MVP)**: Dashboard, Accounts, Transactions, Login
**Phase 2**: Blocks, Audit Log, Forms validation
**Phase 3**: Consensus, Ledger, Crypto Tools
**Phase 4**: Advanced features, Real-time updates, Analytics
