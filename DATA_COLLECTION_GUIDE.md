# Data Collection Guide for Waste Management Simulation

## 📊 **Purpose and Importance**

This guide provides detailed instructions for collecting accurate input data for the Waste Management Simulator. **Proper data collection and source documentation are critical for:**

- **Scientific rigor** in waste management analysis
- **Reproducibility** of simulation results
- **Credibility** with stakeholders and decision-makers
- **Validation** and peer review of methodology
- **Continuous improvement** of model accuracy

> ⚠️ **CRITICAL REQUIREMENT**: All data points must be supported by documented sources. Approximations and assumptions must be clearly identified with justification.

---

## 🎯 **Data Collection Principles**

### 1. **Source Hierarchy (Order of Preference)**
1. **Primary Data** - Direct measurements from your location
2. **Official Statistics** - Government agencies, municipal records
3. **Peer-Reviewed Studies** - Published research from similar contexts
4. **Industry Standards** - Established benchmarks from waste management sector
5. **Expert Estimates** - Professional judgment (clearly documented as such)

### 2. **Documentation Requirements**
- **Exact source citation** (author, title, date, page numbers)
- **Data collection methodology** used by source
- **Geographic and temporal relevance** to your context
- **Uncertainty ranges** when available
- **Assumptions made** in adapting data to your context

### 3. **Quality Standards**
- **Recent data preferred** (within 5 years for operational parameters)
- **Local context prioritized** over distant geographic sources
- **Multiple sources cross-referenced** when possible
- **Conservative estimates** for safety factors

---

## 📋 **Parameter Categories and Data Collection**

## **CATEGORY 1: General Population and Tourism**

### 1.1 Fixed Population (`general.fixedPopulation`)
**What**: Permanent residents of the study area
**Unit**: Number of people
**Default**: 2,500 people

**Data Collection Sources:**
- **Primary**: Municipal census data, civil registry
- **Secondary**: National statistical institutes (INEGI for Mexico)
- **Example Citation**: 
  > "Instituto Nacional de Estadística y Geografía (INEGI). (2020). Censo de Población y Vivienda 2020. Isla Holbox, Lázaro Cárdenas, Quintana Roo. Retrieved from https://www.inegi.org.mx"

**Documentation Template:**
```
Parameter: Fixed Population
Value: [NUMBER]
Source: [FULL CITATION]
Date of Data: [YYYY]
Collection Method: [Census/Survey/Administrative Records]
Geographic Coverage: [Exact boundaries]
Notes: [Any adjustments made, seasonal considerations]
```

### 1.2 Tourism Occupancy Rates
**What**: Hotel/accommodation occupancy during high and low seasons
**Unit**: Percentage (0-100%)
**Default**: High Season: 90%, Low Season: 20%

**Data Collection Sources:**
- **Primary**: Direct survey of hotel operators
- **Secondary**: Tourism boards, hospitality industry associations
- **Example Citation**:
  > "Secretaría de Turismo de Quintana Roo. (2023). Estadísticas de Ocupación Hotelera - Región Norte. Boletín Mensual Enero-Diciembre 2023."

---

## **CATEGORY 2: Waste Generation Rates**

### 2.1 Hotel Waste Generation
**Parameters**: 
- `generation.hotels.units` (Number of hotel rooms)
- `generation.hotels.rate` (kg/room/day)

**Data Collection Methods:**
1. **Direct Measurement (Preferred)**
   - Contact 3-5 representative hotels
   - Request 1-week waste generation logs
   - Weigh waste by material type if possible

2. **Industry Benchmarks**
   - Consult hospitality industry waste studies
   - Adjust for local context (food service level, demographics)

**Example Documentation:**
```
Parameter: Hotel Waste Generation Rate
Value: 1.5 kg/room/day
Source: Direct measurement at Hotel Paraíso Maya (July 2024)
Method: Daily waste weighing for 7 consecutive days during high season
Sample Size: 50 rooms, 85% occupancy
Validation: Compared with "Tourism Waste Generation in Caribbean Destinations" 
(López et al., 2023) - within 10% of reported range
Adjustment: None required
Uncertainty: ±0.2 kg/room/day
```

### 2.2 Restaurant Waste Generation
**Parameters**:
- `generation.restaurants.units` (Number of restaurants)
- `generation.restaurants.rate` (kg/establishment/day)

**Data Collection Strategy:**
1. **Categorize by Size**: Small/Medium/Large establishments
2. **Sample Representative Mix**: Tourist-oriented vs. local establishments
3. **Account for Seasonal Variation**

**Sources to Consider:**
- Local restaurant association
- Municipal waste collection records
- Food service industry studies

### 2.3 Residential Waste Generation
**Parameter**: `generation.homes.rate` (kg/person/day)

**Data Collection Options:**
1. **Household Survey** (Gold Standard)
   - Random sample of 30-50 households
   - Week-long waste weighing study
   - Include socioeconomic diversity

2. **Municipal Collection Data**
   - Total residential waste collected ÷ population
   - Adjust for collection efficiency

**Important Considerations:**
- Include seasonal residents/workers
- Account for informal waste disposal (burning, burial)
- Consider economic levels affecting consumption

### 2.4 Commercial Waste Generation
**Similar approach to restaurants but include:**
- Retail stores
- Services (banks, offices)
- Markets and small businesses

---

## **CATEGORY 3: Waste Composition**

### 3.1 Material Composition by Source
**Parameters**: Percentage breakdown by waste source
- Organics, PET, Aluminum, Cardboard, Glass, Residuals, Hazardous

**Data Collection Methods:**
1. **Waste Composition Study** (Most Accurate)
   - Physical sorting and weighing of samples
   - Minimum 30 samples per waste source
   - Different seasons if possible

2. **Literature Adaptation**
   - Find studies from similar contexts
   - Document adjustments made for local conditions

**Example Study Protocol:**
```
Waste Composition Study - Hotels
Date: July 15-21, 2024
Sample Size: 15 hotels, 3 samples each
Method: Physical sorting of 50kg samples
Categories: 7 material types per Mexican waste classification
Quality Control: Duplicate sorting for 20% of samples
Results Validation: Compared with regional studies
Uncertainty: ±5% for major categories, ±2% for minor categories
```

**Critical Sources for Composition Data:**
- Municipal solid waste characterization studies
- Regional environmental agencies
- University research projects
- Waste management company studies

**Example Citation Format:**
> "Hernández, M., García, R., & López, A. (2023). Caracterización de residuos sólidos en destinos turísticos del Caribe mexicano. Revista de Ingeniería Ambiental, 45(3), 123-140. DOI: 10.1234/ria.2023.45.3.123"

---

## **CATEGORY 4: Infrastructure and Operations**

### 4.1 Collection System Parameters
**Parameters**:
- Number of collection vehicles
- Vehicle capacity (tons)
- Trips per vehicle per day

**Data Sources**:
- Municipal waste management department
- Private waste collection contractors
- Vehicle manufacturer specifications

**Documentation Requirements:**
```
Parameter: Collection Vehicle Capacity
Value: 5 tons per vehicle
Source: Interview with Municipal Waste Manager + Vehicle specifications
Validation: Cross-checked with manufacturer specs (Truck Model XYZ, 5.2 ton capacity)
Date: August 2024
Assumptions: 90% load efficiency factor applied
```

### 4.2 Processing Infrastructure
**Parameters**:
- Transfer station processing rate
- Storage capacity
- Final transport capacity

**Primary Sources**: Site visits and operational records
**Secondary Sources**: Similar facility benchmarks

### 4.3 Material Recovery Rates
**Critical for Economic Analysis**
- Source separation rates by establishment type
- Plant separation efficiency by material
- Informal recovery rates

**Sources**:
- Facility operational data
- Material recovery facility studies
- Informal sector surveys (if applicable)

---

## **CATEGORY 5: Economic Parameters**

### 5.1 Operational Costs
**Parameters**: Collection, transfer, transport, disposal costs ($/ton)

**Data Sources**:
1. **Municipal Budget Documents** (Public records)
2. **Contractor Invoices** (If services are outsourced)
3. **Regional Cost Studies** (Adjusted for local conditions)

**Cost Components to Include:**
- Labor costs
- Fuel and vehicle maintenance
- Equipment depreciation
- Facility operational costs

### 5.2 Material Revenue Values
**Parameters**: Income from material sales ($/ton)

**Sources**:
- Local scrap dealers and recycling markets
- Regional material commodity prices
- Recycling industry reports

**Example Documentation:**
```
Parameter: PET Bottle Sale Price
Value: 2,500 MXN/ton
Source: Survey of 5 local recycling buyers (August 2024)
Price Range: 2,200-2,800 MXN/ton
Validation: Mexican Recycling Association Monthly Report (July 2024)
Seasonal Variation: ±10% based on market conditions
Currency: Mexican Pesos (MXN)
Exchange Rate: 17.5 MXN/USD (date of survey)
```

---

## **CATEGORY 6: Special Waste Streams**

### 6.1 Sargassum Seaweed
**Seasonal Generation Rates**: High/Low season (tons/day)

**Unique Data Collection Challenges:**
- Highly variable based on weather patterns
- Requires historical data analysis
- Seasonal and multi-year trends essential

**Sources**:
- Municipal beach cleaning records
- Tourism authority reports
- Oceanographic studies
- Satellite imagery analysis

### 6.2 Construction and Demolition Waste
**Generation Rate**: tons/day

**Sources**:
- Building permit data
- Construction waste disposal records
- Development project databases

---

## 📝 **Data Documentation Templates**

### **Template 1: Primary Data Collection**
```
=== PRIMARY DATA COLLECTION RECORD ===
Parameter Name: [Specific parameter]
Measured Value: [Number with units]
Collection Date: [Date range]
Collection Method: [Weighing/Survey/Observation]
Sample Size: [Number of observations]
Location: [Specific geographic area]
Collector: [Name and organization]
Equipment Used: [Scale model, survey instrument, etc.]
Quality Control: [Validation methods used]
Raw Data Location: [File/database reference]
Uncertainty/Error: [±range or confidence interval]
```

### **Template 2: Secondary Data Adaptation**
```
=== SECONDARY DATA ADAPTATION RECORD ===
Parameter Name: [Specific parameter]
Adapted Value: [Final value used in model]
Original Source: [Full citation]
Original Value: [As reported in source]
Original Context: [Geographic/temporal context of source]
Adaptation Method: [How value was adjusted for local context]
Adaptation Factor: [Multiplier or adjustment applied]
Justification: [Reasoning for adaptation]
Alternative Sources: [Other sources considered]
Validation: [How adaptation was validated]
```

### **Template 3: Expert Estimate Documentation**
```
=== EXPERT ESTIMATE RECORD ===
Parameter Name: [Specific parameter]
Estimated Value: [Number with units]
Expert(s): [Name, title, organization, contact]
Estimation Method: [Professional judgment basis]
Experience Basis: [Years of experience, similar projects]
Supporting Evidence: [Any data or studies referenced]
Confidence Level: [High/Medium/Low with explanation]
Range of Uncertainty: [Min-Max range]
Alternative Opinions: [Other expert views if available]
Validation Plan: [How estimate will be verified later]
```

---

## ⚠️ **Critical Documentation Requirements**

### **For Each Parameter, You MUST Document:**
1. **Exact Value Used** with units
2. **Primary Source** with full citation
3. **Collection/Estimation Method**
4. **Date of Data** and currency
5. **Geographic Relevance** to your study area
6. **Uncertainty Range** when available
7. **Assumptions Made** in applying the data
8. **Alternative Sources Considered**

### **Red Flags to Avoid:**
- ❌ "Estimated based on experience" (without documentation)
- ❌ "Similar to other studies" (without specific citation)
- ❌ "Default values seem reasonable" (without validation)
- ❌ Using data >10 years old without justification
- ❌ Mixing units or currencies without conversion notes

### **Quality Indicators:**
- ✅ Multiple independent sources agree within 20%
- ✅ Data collected within past 3 years
- ✅ Local context closely matches study area
- ✅ Methodology clearly documented
- ✅ Uncertainty quantified

---

## 📊 **Data Validation Checklist**

Before finalizing your data collection:

### **Completeness Check**
- [ ] All required parameters have values
- [ ] All values have documented sources
- [ ] Units are clearly specified and consistent
- [ ] Uncertainty ranges are provided where applicable

### **Quality Check**
- [ ] Sources are credible and recent
- [ ] Methods are appropriate for parameter type
- [ ] Local context is adequately represented
- [ ] Assumptions are clearly stated and justified

### **Consistency Check**
- [ ] Values are internally consistent (e.g., composition percentages sum to 100%)
- [ ] Orders of magnitude are reasonable
- [ ] Seasonal variations are logical
- [ ] Economic values reflect local market conditions

### **Documentation Check**
- [ ] Citations follow consistent format
- [ ] All sources are accessible and verifiable
- [ ] Adaptation methods are clearly explained
- [ ] Expert estimates include credentials and confidence levels

---

## 🔄 **Continuous Data Improvement**

### **After Initial Data Collection:**
1. **Run Preliminary Simulations** to identify sensitive parameters
2. **Prioritize Validation** of high-impact parameters
3. **Plan Follow-up Studies** for critical uncertainties
4. **Establish Monitoring Systems** for key operational parameters
5. **Document Lessons Learned** for future data collection

### **Annual Data Updates:**
- Review and update economic parameters (costs, revenues)
- Validate generation rates with current operational data
- Update infrastructure parameters as systems change
- Reassess composition data if waste streams change significantly

---

## 📞 **Support and Resources**

### **When You Need Help:**
1. **Municipal Environmental Offices** - Local waste management data
2. **University Environmental Programs** - Research partnerships
3. **Waste Management Companies** - Operational data access
4. **Tourism Industry Associations** - Sector-specific information
5. **Professional Organizations** - Waste management engineering societies

### **Useful Databases and Resources:**
- National statistical institutes
- Environmental protection agencies
- Industry association reports
- Peer-reviewed journal databases
- International waste management organizations

---

**Remember**: High-quality input data is the foundation of meaningful simulation results. Time invested in proper data collection and documentation will significantly improve the credibility and utility of your waste management analysis.

---

*This guide should be updated as new data collection methods are developed and additional parameter requirements are identified.*