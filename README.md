# Waste Management Simulator - Isla Holbox

A comprehensive waste management simulation tool designed specifically for Isla Holbox, featuring interactive dashboards for modeling waste flows, KPI tracking, and financial analysis with scenario management capabilities.

## 🌊 About the Project

This application simulates complex waste management systems with three distinct waste streams:
- **RSU (Residuos Sólidos Urbanos)** - Urban Solid Waste with material separation and recovery
- **Sargassum** - Seasonal seaweed management 
- **RCD (Residuos de Construcción y Demolición)** - Construction and Demolition waste

The simulator models realistic waste flows including collection, processing, material recovery, and disposal across high and low tourist seasons.

## ✨ Key Features

- 🔄 **Real-time Simulation Engine** - Complex 30-day waste flow calculations with multi-stage processing
- 📊 **Interactive Dashboard** - Multiple analysis views (KPIs, Financial, Flow Diagrams, Process Analysis)
- 🏖️ **Season-based Modeling** - Separate calculations for high/low tourist seasons
- 💾 **Scenario Management** - Save, load, and compare different simulation scenarios
- 🗄️ **Local Data Persistence** - Client-side SQLite database with export/import capabilities
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🎨 **Modern UI** - Built with Tailwind CSS and Lucide icons

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

1. **RSU Flow**: Collection → Transfer Station → Material Recovery → Final Transport → Disposal
2. **Sargassum Flow**: Seasonal collection and disposal
3. **RCD Flow**: Construction waste management

### Key Calculations

- **Material Composition**: Different waste compositions by source (hotels, restaurants, homes, commerce)
- **Collection Logistics**: Vehicle capacity, trips, and collection efficiency
- **Material Recovery**: Source separation and plant-based material recovery
- **Economic Analysis**: Costs, revenues, and net system costs
- **Leak Analysis**: Waste losses at each processing stage

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

## 📋 Roadmap

- [ ] **Sankey Diagram Implementation** - Visual flow representation
- [ ] **Advanced Analytics** - Trend analysis and forecasting
- [ ] **Multi-language Support** - English and Spanish interfaces
- [ ] **Mobile App** - React Native version
- [ ] **API Integration** - Real-time data feeds
- [ ] **Reporting System** - PDF/Excel report generation

## 🐛 Known Issues

- Sankey diagram component is placeholder (needs implementation)
- Mobile responsiveness could be improved for complex tables
- Large scenario datasets may impact browser performance

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