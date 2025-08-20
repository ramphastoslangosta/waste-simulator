# Waste Management Simulator - Isla Holbox

A comprehensive waste management simulation tool designed specifically for Isla Holbox, featuring interactive dashboards for modeling waste flows, KPI tracking, and financial analysis with scenario management capabilities.

## 🌊 About the Project

This application simulates complex waste management systems with three distinct waste streams:
- **RSU (Residuos Sólidos Urbanos)** - Urban Solid Waste with material separation and recovery
- **Sargassum** - Seasonal seaweed management 
- **RCD (Residuos de Construcción y Demolición)** - Construction and Demolition waste

The simulator models realistic waste flows including collection, processing, material recovery, valorization processes, and disposal across high and low tourist seasons with advanced circular economy strategies.

## ✨ Key Features

### Core Simulation
- 🔄 **Advanced Simulation Engine** - Complex 30-day waste flow calculations with multi-stage processing and inventory tracking
- 📊 **Interactive Dashboard** - Multiple analysis views (KPIs, Financial, Flow Diagrams, Process Analysis, Calculations Table)
- 🏖️ **Season-based Modeling** - Separate calculations for high/low tourist seasons with dynamic occupancy rates
- ♻️ **Circular Economy Integration** - Comprehensive valorization and separation enhancement modeling

### New Advanced Features
- 🌱 **Waste Valorization Scenarios** - Compostaje, biogas generation, and plastic pyrolysis with economic analysis
- 📚 **Separation Enhancement Programs** - Education, incentive, and container programs with effectiveness tracking
- 💰 **Cost-Benefit Analysis** - ROI calculations, waterfall charts, and program impact assessment
- 📈 **Enhanced Visualizations** - Dynamic charts, progress bars, and conditional rendering based on active scenarios
- 🔍 **Inventory Management** - Real-time tracking across all process stages with capacity utilization metrics

### Data & Scenarios
- 💾 **Advanced Scenario Management** - Save, load, compare up to 4 scenarios simultaneously with detailed comparison tools
- 🗄️ **Dual Data Persistence** - Client-side SQLite database with optional cloud Supabase integration
- 📤 **Comprehensive Export System** - High-resolution PNG/SVG chart export and detailed CSV data tables
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🎨 **Modern UI/UX** - Built with Tailwind CSS, Lucide icons, and interactive components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ramphastoslangosta/waste-simulator.git
cd waste-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 🏗️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: SQL.js (client-side SQLite)
- **Cloud Storage**: Supabase (optional)
- **Development**: ESLint for code quality

## 📁 Project Structure

```
src/
├── components/
│   ├── features/          # Main analysis views
│   │   ├── KPIDashboard.tsx
│   │   ├── FinancialAnalysis.tsx
│   │   ├── FlowDiagram.tsx
│   │   └── ...
│   ├── scenarios/         # Scenario management
│   ├── auth/             # Authentication components
│   ├── ui/               # Reusable UI components
│   └── admin/            # Admin tools
├── hooks/                # Custom React hooks
│   ├── useWasteSimulation.tsx  # Core simulation engine
│   ├── useAuth.ts
│   └── useScenarios.ts
├── lib/                  # External services
│   ├── database.ts       # SQLite database manager
│   └── supabase.ts       # Cloud database (optional)
├── constants/            # Configuration and initial data
├── utils/                # Helper functions
└── App.tsx              # Main application component
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Simulation Model

### Waste Streams

1. **Enhanced RSU Flow**: Collection → Transfer Station → Material Recovery + Valorization → Final Transport → Disposal
2. **Sargassum Flow**: Seasonal collection and disposal with capacity planning
3. **RCD Flow**: Construction waste management with cost tracking

### Advanced Simulation Features

- **Multi-Stage Inventory Tracking**: Real-time material accumulation across all process stages
- **Valorization Processes**: 
  - Compostaje (organic waste → compost with revenue generation)
  - Biogas generation (organic waste → energy with income tracking)  
  - Plastic pyrolysis (plastic waste → fuel with cost-benefit analysis)
- **Separation Enhancement Programs**:
  - Education programs (population-based costs and effectiveness)
  - Incentive programs (performance-based costs per ton separated)
  - Container programs (infrastructure costs with amortization)
- **Enhanced Material Recovery**: Source separation and plant-based recovery with program impacts
- **Comprehensive Economic Analysis**: Costs, revenues, ROI calculations, and program cost-effectiveness
- **Advanced Leak Analysis**: Waste losses at each stage with capacity utilization tracking

### Seasons

- **High Season**: Tourist peak period with increased occupancy rates
- **Low Season**: Off-peak period with baseline waste generation

## 💾 Data Management

### Local Storage
- Scenarios and results are stored in browser localStorage
- Uses SQL.js for client-side database operations
- Data persists between sessions
- Export/import functionality for data backup

### Cloud Storage (Optional)
- Supabase integration for multi-user scenarios
- User authentication and data sync
- Shareable scenarios between users

## 📊 Data Collection

For accurate simulation results, proper input data collection is essential:

- **📋 [Data Collection Guide](./DATA_COLLECTION_GUIDE.md)** - Comprehensive instructions for gathering input parameters with proper source citation
- **✅ [Data Collection Checklist](./DATA_COLLECTION_CHECKLIST.md)** - Quick reference and validation checklist

**Key Requirements:**
- All parameters must be supported by documented sources
- Approximations and assumptions must be clearly identified
- Local context should be prioritized over generic estimates
- Uncertainty ranges should be provided where available

## 🤝 Contributing

We welcome contributions! Please see our [Development Protocol](./DEVELOPMENT_PROTOCOL.md) for detailed guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Run linting (`npm run lint`)
5. Test your changes thoroughly
6. Commit using conventional commits (`git commit -m 'feat: add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 🎓 Academic Validation Status

### ✅ **Model Validation Complete - 100% Success Rate**

**TAREA 1 COMPLETED**: Model validation and calibration using primary source field data from 2022 Holbox study.

| Validation Metric | Result | Status |
|------------------|--------|--------|
| **Total KPIs Validated** | 8/8 (100%) | ✅ **Excellent** |
| **Mean Absolute Error** | 13.1% | ✅ **Academic Standard** |
| **Excellent Predictions** (<5% error) | 4 KPIs | ✅ **High Precision** |
| **Good Predictions** (5-25% error) | 4 KPIs | ✅ **Engineering Acceptable** |
| **Requires Calibration** (>25% error) | 0 KPIs | ✅ **Fully Calibrated** |

**Key Achievements:**
- ✅ **Primary Source Validation**: Using own 2022 Holbox field study data
- ✅ **Successful Calibration**: Transport capacity parameter adjusted (10→8 tons/day)
- ✅ **Complete Documentation**: Table 4.1 in Chapter-Validation.md with all error analyses
- ✅ **Academic Rigor**: Explicit calibration process documented for thesis defense

**Data Source**: Holbox.WP2E.DocumentoMaestro.pdf (Primary field research, highest quality)

## 📋 Roadmap

### Recently Completed ✅
- ✅ **Model Validation & Calibration** - 100% validation rate with primary source data
- ✅ **Waste Valorization Scenarios** - Compostaje, biogas, plastic pyrolysis 
- ✅ **Separation Enhancement Programs** - Education, incentive, container programs
- ✅ **Enhanced Visualizations** - Dynamic charts with program impact tracking
- ✅ **Advanced Cost-Benefit Analysis** - ROI calculations and waterfall charts
- ✅ **Comprehensive Export System** - High-resolution chart export and detailed CSV tables
- ✅ **Multi-Stage Inventory Tracking** - Real-time capacity utilization monitoring

### In Progress 🚀
- 🎯 **TAREA 2: Sensitivity Analysis** - Parameter variation analysis (+/-10%, +/-20%) with tornado charts
- 🎯 **Critical Variable Identification** - Identify 5-7 most influential system parameters
- 🎯 **Academic Documentation** - Sensitivity analysis chapter for thesis

### Upcoming Features
- [ ] **Sankey Diagram Implementation** - Visual flow representation with valorization branches
- [ ] **Advanced Analytics** - Trend analysis and forecasting with program effectiveness tracking
- [ ] **Multi-language Support** - English and Spanish interfaces
- [ ] **Mobile App** - React Native version with core simulation features
- [ ] **API Integration** - Real-time data feeds and external system integration
- [ ] **PDF Reporting System** - Comprehensive report generation with charts and analysis

## 🐛 Known Issues

- Sankey diagram component is placeholder (needs implementation)
- Mobile responsiveness could be improved for complex comparison tables
- Large scenario datasets with extensive valorization data may impact browser performance
- Some advanced charts may require horizontal scrolling on smaller screens

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Developed for environmental impact assessment in Isla Holbox
- Built with modern React ecosystem and best practices
- Inspired by sustainable waste management principles

## 📞 Contact

For questions, suggestions, or collaboration opportunities, please open an issue on GitHub.

---

**Made with ❤️ for sustainable waste management**