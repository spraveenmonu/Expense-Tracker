# SpendWise — Project Overview & Architecture

Welcome to **SpendWise**, a modern, feature-rich Smart Finance Tracker built with React, Vite, and Framer Motion. This document provides a high-level walkthrough of the project, including its core features, technology stack, directory structure, and setup instructions.

---

## 🚀 Key Features

1. **Intelligent Dashboard**: Displays real-time financial metrics—including overall balance, total income, total expenses, and savings goal progress. Includes interactive chart visualization (weekly, monthly, yearly views) powered by Recharts.
2. **Interactive Transaction Management**: Allows adding, viewing, filtering, and deleting transactions categorized by transaction type (Income, Expense, Savings) and categories.
3. **Smart Financial Insights**: Provides automatic spending analysis, calculating financial health scores, tracking essential vs. non-essential spending ratios, and serving context-aware warnings or tips (e.g., alert when spending rises too fast compared to last month).
4. **Persistent Offline Storage**: Uses IndexedDB (via the [idb](https://www.npmjs.com/package/idb) package) with automatic fallback and data migration from legacy `localStorage`.
5. **Dynamic Theme System**: Supports toggling between two visually striking themes: **Glassmorphism** (modern, blurred translucent UI elements) and **Brutalism** (bold borders, high contrast, neo-brutalist styling).
6. **Automatic Locale & Currency Detection**: Automatically formats currency values (e.g. `₹` INR, `$` USD, `£` GBP, `€` EUR) based on the user's browser locale and timezone settings.

---

## 🛠️ Technology Stack

*   **Framework/Bundler**: [React](https://react.dev/) + [Vite](https://vite.dev/)
*   **Styling**: Plain CSS (flexible CSS custom properties mapped to the custom themes)
*   **Animation**: [Framer Motion](https://www.framer.com/motion/) for micro-interactions, spring transitions, and modal animations
*   **Charts**: [Recharts](https://recharts.org/) for responsive graphs
*   **Storage**: [idb](https://github.com/jakearchibald/idb) (IndexedDB wrapper) for browser-based offline persistence
*   **Icons**: [React Icons (Feather Icons)](https://react-icons.github.io/react-icons/)

---

## 📁 Project Structure

Below is the layout of the project, highlighting key source files:

```
Expense Tracker/
├── index.html                   # HTML entry point containing Google Fonts links
├── package.json                 # Project manifest, scripts, and dependencies
├── vite.config.js               # Vite configurations
├── public/                      # Static assets
└── src/
    ├── main.jsx                 # Application entry point
    ├── App.jsx                  # Main application structure, sidebar, and theme logic
    ├── App.css                  # UI Layout styles & dynamic custom variables
    ├── index.css                # Global styles, fonts, and theme palettes
    ├── components/              # Interactive UI components
    │   ├── AddTransaction.jsx   # Form modal to add and validate transactions
    │   ├── Dashboard.jsx        # Summary cards, spending charts, and smart alerts
    │   ├── Insights.jsx         # Health score, savings targets, and financial tips
    │   ├── Toast.jsx            # Toast notifications container and alert alerts
    │   └── TransactionList.jsx  # History of transactions with filtering controls
    ├── context/                 # Global state management
    │   ├── ExpenseContext.jsx   # Context provider, state reducer, and database hydration
    │   ├── ExpenseContextCore.js# Context core definition
    │   └── useExpense.js        # Custom hook to consume the expense context
    └── utils/                   # Shared utility logic
        ├── categories.js        # Core transaction category configuration mapping
        └── helpers.js           # Spending analyzers, currency formatters, date formatters, and ID generators
```

---

## 🧩 Deep-Dive into Key Files

*   **Global State & Database**:
    *   [ExpenseContext.jsx](file:///d:/Projects/Spraveenmonu/Expense%20Tracker/src/context/ExpenseContext.jsx): Initializes IndexedDB (`SpendWiseDB`) on load. Employs a reducer pattern to dispatch actions (`ADD_TRANSACTION`, `DELETE_TRANSACTION`, `SET_LIMITS`, `SET_SAVINGS_GOAL`). Computes reactive variables like `balance`, `savedAmount`, and `savingsProgress`.
    *   [useExpense.js](file:///d:/Projects/Spraveenmonu/Expense%20Tracker/src/context/useExpense.js): Connects components to the global application state cleanly.
*   **Business Logic & Helpers**:
    *   [helpers.js](file:///d:/Projects/Spraveenmonu/Expense%20Tracker/src/utils/helpers.js): Houses the spending analyzer `analyzeSpending()`, region detector `detectUserRegion()`, currency formatter `formatCurrency()`, and relative date helper `formatDate()`.
    *   [categories.js](file:///d:/Projects/Spraveenmonu/Expense%20Tracker/src/utils/categories.js): Holds the object structure mapping for transactions (e.g., Rent, Utilities, Food, Freelance, Salary) with associated icons, hex colors, and categories.
*   **UI & Views**:
    *   [App.jsx](file:///d:/Projects/Spraveenmonu/Expense%20Tracker/src/App.jsx): Controls page routing (Dashboard vs. Transactions vs. Insights), mobile responsive sidebar menus, modal states, custom toast alerts, and theme switching.
    *   [Dashboard.jsx](file:///d:/Projects/Spraveenmonu/Expense%20Tracker/src/components/Dashboard.jsx): Displays summaries and builds Recharts graphs based on chosen filter types.
    *   [Insights.jsx](file:///d:/Projects/Spraveenmonu/Expense%20Tracker/src/components/Insights.jsx): Leverages algorithms from helpers to render financial guidance and advice card decks.

---

## ⚙️ Getting Started (Local Development)

To run the project locally, install dependencies and execute Vite's development server:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build the production application
npm run build

# 4. Preview the production build locally
npm run preview

# 5. Run the linter
npm run lint
```
