# Data Collection Quick Reference & Checklist

## 🚀 **Quick Start Guide**

**Before you begin**: Read the full [DATA_COLLECTION_GUIDE.md](./DATA_COLLECTION_GUIDE.md) for detailed instructions.

### **Step 1: Prepare Your Documentation System**
- [ ] Create a spreadsheet or database for tracking sources
- [ ] Set up folders for storing source documents
- [ ] Prepare citation templates for consistency

### **Step 2: Prioritize Your Data Collection**
Focus on **high-impact parameters first**:

1. **🔥 CRITICAL (Highest Impact)**
   - Waste generation rates (all sources)
   - Collection system capacity
   - Material composition percentages

2. **⚡ IMPORTANT (Medium Impact)**  
   - Economic parameters (costs/revenues)
   - Processing efficiency rates
   - Population and tourism data

3. **📊 VALUABLE (Lower Impact)**
   - Leak rates and losses
   - Special waste streams
   - Detailed operational parameters

---

## 📋 **Parameter Quick Reference**

### **Population & Tourism**
| Parameter | Current Default | Unit | Key Sources |
|-----------|----------------|------|-------------|
| Fixed Population | 2,500 | people | Census, municipal records |
| High Season Occupancy | 90% | % | Tourism boards, hotels |
| Low Season Occupancy | 20% | % | Tourism boards, hotels |

### **Waste Generation Rates**
| Source | Default Rate | Unit | Measurement Method |
|--------|--------------|------|-------------------|
| Hotels | 1.5 | kg/room/day | Direct weighing preferred |
| Restaurants | 30 | kg/establishment/day | Survey + collection records |
| Homes | 0.9 | kg/person/day | Household studies |
| Commerce | 8 | kg/unit/day | Business surveys |

### **Economic Parameters (MXN/ton)**
| Parameter | Default | Validation Source |
|-----------|---------|-------------------|
| Collection Cost | 800 | Municipal budgets |
| Transfer Cost | 150 | Facility operations |
| Final Transport | 250 | Contractor rates |
| Disposal Cost | 400 | Landfill fees |
| PET Revenue | 2,500 | Recycler prices |
| Aluminum Revenue | 15,000 | Scrap dealers |

---

## 🎯 **Data Quality Standards**

### **Minimum Requirements**
- [ ] **Source Citation**: Author, title, date, page/section
- [ ] **Collection Method**: How data was gathered
- [ ] **Geographic Relevance**: Location match to study area
- [ ] **Data Currency**: Preferably <3 years old
- [ ] **Units Specified**: Clear measurement units

### **Red Flags (Avoid These)**
- ⚠️ "Industry standard" without specific source
- ⚠️ "Similar to other places" without documentation
- ⚠️ Estimates without expert credentials
- ⚠️ Data >5 years old without justification
- ⚠️ Suspiciously round numbers without explanation

### **Gold Standard Indicators**
- ✅ Multiple independent sources agree
- ✅ Primary data from your specific location
- ✅ Peer-reviewed academic sources
- ✅ Official government statistics
- ✅ Uncertainty ranges provided

---

## 📊 **Source Hierarchy (Use in Order)**

1. **🥇 PRIMARY DATA** - Your own measurements
   - Direct weighing studies
   - Surveys you conducted
   - Official records you accessed

2. **🥈 LOCAL OFFICIAL DATA** - Government sources
   - Municipal waste management reports
   - Census and demographic data
   - Environmental agency studies

3. **🥉 PEER-REVIEWED STUDIES** - Academic research
   - Journal articles from similar contexts
   - University research projects
   - Technical reports with methodology

4. **📋 INDUSTRY BENCHMARKS** - Professional standards
   - Waste management industry reports
   - Engineering handbooks
   - Consultant studies (with methodology)

5. **🤝 EXPERT ESTIMATES** - Professional judgment
   - Experienced waste managers
   - Environmental engineers
   - Local experts with credentials

---

## 📝 **Documentation Templates (Copy & Paste)**

### **Template A: Primary Data**
```
Parameter: [Name]
Value: [Number + Units]
Source: Direct measurement/survey at [Location]
Date: [Collection dates]
Method: [How measured]
Sample Size: [Number of samples]
Collector: [Your name/organization]
Validation: [Cross-checks performed]
Uncertainty: ±[Range]
```

### **Template B: Literature Source**
```
Parameter: [Name]
Value: [Number + Units]
Source: [Author]. ([Year]). [Title]. [Journal/Report]. [Pages].
Original Context: [Geographic/temporal context]
Adaptation: [Any adjustments made]
Justification: [Why this source is appropriate]
Alternative Sources: [Others considered]
```

### **Template C: Expert Estimate**
```
Parameter: [Name]  
Value: [Number + Units]
Expert: [Name], [Title], [Organization]
Experience: [Years in field, relevant projects]
Method: [Basis for estimate]
Confidence: [High/Medium/Low + reasoning]
Supporting Data: [Any references used]
Range: [Min-Max uncertainty]
```

---

## ⚡ **Rapid Data Collection Strategies**

### **When Time is Limited:**

1. **Contact Local Authorities First**
   - Municipality environmental office
   - Tourism development office  
   - Regional planning agencies

2. **Leverage Existing Networks**
   - Hotel associations for tourism data
   - Restaurant associations for food service
   - Chamber of commerce for business data

3. **Use Proxy Methods**
   - Population × regional per-capita rates
   - Tourism bed count × occupancy rates
   - Economic data from similar destinations

### **Quick Validation Techniques:**
- **Sanity Check**: Do totals make sense for population size?
- **Cross-Reference**: Do independent sources roughly agree?
- **Order of Magnitude**: Are values in reasonable ranges?
- **Seasonal Logic**: Do high/low season ratios make sense?

---

## 🔍 **Common Data Sources by Country/Region**

### **Mexico**
- **INEGI**: National statistics and census data
- **SEMARNAT**: Environmental and waste data
- **SECTUR**: Tourism statistics
- **Municipal websites**: Local waste management info

### **Caribbean Region**
- **Caribbean Tourism Organization**: Regional tourism data
- **UN Environment**: Regional environmental studies
- **Regional universities**: Local research projects

### **International**
- **World Bank**: Development indicators
- **UNEP**: Global waste management studies
- **ISWA**: International waste management benchmarks

---

## ✅ **Final Checklist Before Running Simulation**

### **Data Completeness**
- [ ] All 40+ parameters have values
- [ ] Units are consistent throughout
- [ ] Percentages sum to 100% where required
- [ ] Economic values in same currency

### **Source Documentation**
- [ ] Every parameter has source citation
- [ ] Collection methods documented
- [ ] Assumptions clearly stated
- [ ] Expert estimates include credentials

### **Quality Validation**
- [ ] Values within reasonable ranges
- [ ] Internal consistency checked
- [ ] Multiple sources cross-referenced where possible
- [ ] High-impact parameters prioritized for quality

### **Transparency**
- [ ] Uncertainties acknowledged
- [ ] Approximations clearly labeled
- [ ] Methodology limitations noted
- [ ] Data gaps identified for future collection

---

## 🆘 **When You're Stuck**

### **Can't Find Specific Data?**
1. **Look for regional/national averages** and document adaptation
2. **Contact academic researchers** in environmental engineering
3. **Use conservative estimates** with wide uncertainty ranges
4. **Document data gaps** for future improvement priority

### **Sources Contradict Each Other?**
1. **Evaluate source quality** using hierarchy above
2. **Document the range** and use middle value
3. **Weight by source credibility** if possible
4. **Plan validation study** to resolve discrepancy

### **Data Seems Unrealistic?**
1. **Double-check units** and conversions
2. **Verify calculation methods** in source
3. **Compare with similar studies** globally
4. **Consider local context factors** that might explain differences

---

## 📞 **Support Resources**

- **Full Guide**: [DATA_COLLECTION_GUIDE.md](./DATA_COLLECTION_GUIDE.md)
- **Technical Support**: Check repository issues or discussions
- **Academic Collaboration**: Consider partnering with local universities
- **Professional Networks**: Waste management engineering associations

---

**Remember**: Perfect data doesn't exist. Well-documented, reasonable approximations with clear uncertainty ranges are far better than undocumented assumptions. Focus on transparency and continuous improvement!