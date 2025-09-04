# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A comprehensive waste management simulation application for Isla Holbox built with React, TypeScript, and Vite. The app simulates complex waste flows (RSU - Urban Solid Waste, Sargassum, and Construction/Demolition waste) across high and low seasons with detailed KPI tracking, advanced valorization scenarios (compostaje, biogas, plastic pyrolysis), separation enhancement programs (education, incentives, containers), multi-stage inventory management, and comprehensive scenario comparison tools.

## Essential Commands

- **Development**: `npm run dev` - Start development server
- **Build**: `npm run build` - Create production build  
- **Lint**: `npm run lint` - Run ESLint on the codebase
- **Preview**: `npm run preview` - Preview production build locally
- **Test**: `npm run test` - Run tests in watch mode
- **Test (CI)**: `npm run test:run` - Run all tests once
- **Test UI**: `npm run test:ui` - Open Vitest UI for interactive testing
- **Test Coverage**: `npm run test:coverage` - Run tests with coverage report

## Architecture Overview

### Core Simulation Logic
- **`useWasteSimulation` hook** (`src/hooks/useWasteSimulation.tsx`): Contains the advanced simulation engine that calculates waste flows, processing, valorization, separation programs, and comprehensive KPIs for both seasons over a 30-day simulation period
- **Multi-flow system**: Handles 3 waste streams (RSU, Sargassum, RCD) with complex processing chains including collection, transfer, processing, valorization, and disposal
- **Valorization integration**: Compostaje, biogas generation, and plastic pyrolysis processes with economic modeling
- **Separation enhancement**: Education, incentive, and container programs with cumulative effectiveness tracking
- **Multi-stage inventory tracking**: Real-time monitoring across all process stages with capacity utilization
- **Season-based calculations**: Differentiates between high/low tourist seasons affecting occupancy rates and waste generation

### Data Management
- **Local SQLite database** (`src/lib/database.ts`): Browser-based persistence using SQL.js with localStorage backup for scenarios and results
- **Supabase integration** (`src/lib/supabase.ts`): Cloud database option for multi-user scenarios
- **Scenario management**: Save/load different simulation configurations for comparison

### Component Structure
- **Feature components** (`src/components/features/`): Main analysis views (KPIDashboard, FinancialAnalysis, FlowDiagram, etc.)
- **UI components** (`src/components/ui/`): Reusable components (Card, InputField, KPICard)
- **Auth system** (`src/components/auth/`): User authentication with modal interface

### Key Patterns
- **Tab-based navigation**: Single-page app with multiple analysis views controlled by `activeTab` state
- **Season switching**: Toggle between high/low season results with `season` state
- **Input validation**: Complex form handling for simulation parameters in `InputPanel`
- **Real-time calculations**: Simulation runs automatically when inputs change via `useMemo`

## Important Files

- `src/constants/initialState.js` - Default simulation parameters and input structure
- `src/constants/layoutConstants.js` - UI configuration including tab definitions
- `src/hooks/useAuth.ts` - Authentication state management
- `src/hooks/useScenarios.ts` - Scenario CRUD operations

## Technology Stack

- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- Recharts for data visualization
- SQL.js for client-side database
- Supabase for cloud persistence (optional)
- Vitest + React Testing Library for testing

## Development Notes

- The simulation engine performs complex multi-step calculations including waste generation by source, collection logistics, material recovery, and cost analysis
- Database operations use both local SQLite and cloud Supabase depending on user authentication status  
- All numerical results are averaged over the final 7 days of simulation for stability
- Component styling follows Tailwind conventions with responsive design patterns

## Testing

The project uses **Vitest** with **React Testing Library** for comprehensive testing:

### Test Structure
- **Unit Tests**: Core simulation logic (`useWasteSimulation` hook)
- **Component Tests**: UI components (`KPICard`, `KPIDashboard`)
- **Utility Tests**: Helper functions (`formatNumber`)

### Running Tests
- `npm run test` - Interactive test watcher
- `npm run test:run` - Single test run for CI/CD
- `npm run test:ui` - Visual test interface
- `npm run test:coverage` - Generate coverage reports

### Test Files Location
- Test files use `.test.tsx` or `.test.js` suffix
- Located alongside source files or in `src/test/` directory
- Mock setup in `src/test/setup.ts`

### Coverage Areas
- ✅ Simulation engine calculations and edge cases
- ✅ Component rendering and user interactions  
- ✅ Data formatting and validation
- ✅ Season-based calculation differences
- ✅ Error handling and edge cases