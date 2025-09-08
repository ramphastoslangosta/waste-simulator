# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks

### Testing
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run all tests once
- `npm run test:ui` - Launch Vitest UI
- `npm run test:coverage` - Generate test coverage report

### Validation & Research
- Tests are located in `/src/test/validation/` for model validation
- Run `npm run test:run` to execute validation tests including mass conservation, physical constraints, and real data comparison
- Mathematical validation uses primary field data from Holbox 2022 study

## Architecture Overview

This is a **React 18 + TypeScript + Vite** waste management simulation application with a sophisticated scientific modeling engine.

### Core Architecture
The application follows a **modular simulation architecture** with clear separation between:

1. **Simulation Engine** (`src/simulation/`): 
   - Central orchestrator (`simulationEngine.ts`) coordinates 6 specialized modules
   - **Generation Module**: Calculates waste production by source (hotels, restaurants, homes, commerce)
   - **Collection Module**: Models collection logistics and capacity constraints
   - **Separation Module**: Handles source separation and material recovery facility operations
   - **Valorization Module**: Processes composting, biogas, and plastic pyrolysis scenarios
   - **Inventory Module**: Tracks material flows and storage across all stages
   - **Economics Module**: Computes costs, revenues, and ROI for all processes

2. **React Hook Interface** (`src/hooks/useWasteSimulation.tsx`):
   - Provides React integration using `useMemo` for performance
   - Triggers simulations for both high/low tourist seasons simultaneously

3. **Component Architecture**:
   - **Features**: Main analysis dashboards (`KPIDashboard`, `FinancialAnalysis`, `FlowDiagram`, `ProcessAnalysis`)
   - **Scenarios**: Advanced scenario management with save/load/compare functionality
   - **UI Components**: Reusable components with Tailwind CSS styling
   - **Auth**: Optional Supabase cloud authentication

### Key Technical Concepts

**Simulation Model**: 
- **30-day simulation** with 7-day stabilization period for averaged results
- **Dual-season modeling** (high/low tourist seasons) with different occupancy rates
- **5 waste streams**: RSU, Sargassum, Construction waste with seasonal variations
- **Multi-stage inventory tracking** with capacity utilization monitoring

**Data Management**:
- **Dual persistence**: Client-side SQLite (sql.js) + optional cloud Supabase
- **Scenario system**: Save, load, and compare up to 4 scenarios simultaneously
- **Export capabilities**: High-resolution PNG/SVG charts and detailed CSV data

**Validation Framework**:
- **100% model validation** against primary field data (8/8 KPIs validated)
- **Sensitivity analysis** across 29 scenarios testing 7 critical parameters
- **Mass conservation validation** and physical constraint testing

### State Management
- Uses React's built-in state management with custom hooks
- `useWasteSimulation` hook provides simulation results via memoization
- `useScenarios` manages scenario persistence and comparison
- `useAuth` handles optional cloud authentication

### Styling & UI
- **Tailwind CSS** for styling with responsive design
- **Lucide React** for icons
- **Recharts** for data visualization
- **Modern UI patterns** with cards, modals, and conditional rendering

## Project Structure Specifics

```
src/
├── simulation/           # Core simulation engine (6 modules + orchestrator)
├── hooks/               # React integration layer (useWasteSimulation, useScenarios, useAuth)
├── components/
│   ├── features/        # Main analysis dashboards and comparison tools
│   ├── scenarios/       # Scenario management UI
│   ├── ui/             # Reusable UI components
│   └── auth/           # Authentication components
├── constants/          # Default parameters and initial state configuration
├── lib/               # External integrations (database.ts, supabase.ts)
├── utils/             # Helper functions (validation, CSV export, formatting)
└── test/              # Comprehensive validation and unit test suite
```

## Development Guidelines

### Code Quality
- **TypeScript strict mode** enabled with comprehensive type checking
- **ESLint configuration** allows `any` types but enforces unused variable checking
- **React Hooks** and **React Refresh** plugins configured
- **Vitest + Testing Library** for unit and integration testing

### Scientific Accuracy
- All simulation calculations must maintain **mass conservation principles**
- Parameter changes require **validation against academic standards**
- New features must include **appropriate error bounds** and **uncertainty handling**
- **Source documentation required** for all waste generation rates and cost parameters

### Performance Considerations
- Simulation runs are **memoized** to prevent unnecessary recalculations
- **30-day simulation cycles** can be computationally intensive
- **Large datasets** with extensive valorization scenarios may impact browser performance
- Consider **optimization** for scenarios with >4 comparison modes

### Testing Requirements
- **Validation tests** must pass for any simulation engine changes
- **Mass conservation** tests validate material balance across all stages
- **Physical constraint** tests ensure realistic capacity limitations
- **Real data comparison** tests maintain model accuracy against field data

## Academic Context

This is a **research-grade simulation tool** developed for academic thesis work on waste management in Isla Holbox, Mexico. The model has been:

- **Validated against primary field research** (2022 Holbox study)
- **Calibrated** with transport capacity parameter adjustment (10→8 tons/day)
- **Peer-reviewed** through academic validation protocols
- **Documented** in comprehensive technical annexes

When making changes, maintain the scientific rigor and documentation standards expected for academic research tools.