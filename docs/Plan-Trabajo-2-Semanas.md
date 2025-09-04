# Plan de Trabajo - Próximas 2 Semanas
## Validación y Verificación del Modelo + Fundamentos Académicos

**Período**: 19 Agosto - 1 Septiembre 2025  
**Estrategia**: Rigor Científico Primero → Fundamentos Académicos  
**Objetivo**: Establecer credibilidad científica del modelo antes de documentación teórica

---

## 📅 **SEMANA 1: Validación y Verificación Científica** 
*19-25 Agosto 2025*

### 🔬 **Día 1-2: VALIDATION-001 - Mass Conservation Verification**
**Objetivo**: Implementar validación automatizada de conservación de masa

#### **Día 1 (Lunes 19 Agosto) - VALIDATION-001 Setup**

**🔄 Protocol Setup:**
```bash
# Morning startup protocol
git checkout main && git pull origin main
git checkout -b validation/mass-conservation
npm install && npm run dev  # Keep running in background
```

**📋 Tasks:**
- [ ] **AM**: Crear estructura de validación en `src/test/validation/`
- [ ] **AM**: Implementar `massConservation.test.js` con casos de prueba
- [ ] **PM**: Desarrollar `src/utils/validation.js` con funciones de balance de masa
- [ ] **PM**: Ecuación central: `G_total = Material_disposed + Material_recovered + Material_valorized + Leaks_total`

**🔍 Quality Gates:**
```bash
# Before each commit
npm run lint && npm run build && npm run test
git add . && git commit -m "feat: Add mass conservation validation structure"
```

#### **Día 2 (Martes 20 Agosto)**
- [ ] **AM**: Probar validación contra escenarios base (temporada alta/baja)
- [ ] **AM**: Implementar reportes detallados de discrepancias
- [ ] **PM**: Crear dashboard de validación en tiempo real
- [ ] **PM**: Documentar hallazgos y fix problemas detectados
- [ ] **EOD**: Commit: `test: Add automated mass conservation validation`

**Entregables**: Suite de tests automatizada, reporte de conservación de masa

---

### ⚖️ **Día 3-4: VALIDATION-002 - Physical Constraints Verification**
**Objetivo**: Verificar que capacidades físicas no se excedan nunca

#### **Día 3 (Miércoles 21 Agosto)**
- [ ] **AM**: Implementar `physicalConstraints.test.js`
- [ ] **AM**: Validar límites de capacidad: `Cap_collection`, `Cap_transfer`, `Cap_transport`
- [ ] **PM**: Verificar inventarios: `Inventories >= 0` y `<= Physical_limits`
- [ ] **PM**: Crear `constraintValidator.js` con validaciones en tiempo real

#### **Día 4 (Jueves 22 Agosto)**
- [ ] **AM**: Probar límites extremos (generación 5x, capacidades mínimas)
- [ ] **AM**: Implementar alertas cuando constraints se violan
- [ ] **PM**: Integrar validación en simulación principal
- [ ] **PM**: Crear visualización de utilización de capacidades
- [ ] **EOD**: Commit: `test: Add physical constraints validation with real-time monitoring`

**Entregables**: Validador de restricciones físicas, alertas de límites

---

### 📊 **Día 5: VALIDATION-003 - Real Data Comparison Framework**
**Objetivo**: Preparar framework estadístico para comparación con datos reales

#### **Día 5 (Viernes 23 Agosto)**
- [ ] **AM**: Crear `realDataComparison.js` con funciones estadísticas
- [ ] **AM**: Implementar cálculos: % error, intervalos de confianza, significancia
- [ ] **PM**: Diseñar estructura de `data/holbox-comparison.csv`
- [ ] **PM**: Crear template para `docs/Validation-Results.md`
- [ ] **EOD**: Framework listo para recibir datos históricos
- [ ] **EOD**: Commit: `feat: Add statistical framework for real data comparison`

**Entregables**: Framework estadístico, templates para validación

---

### 🧪 **Fin de Semana 1: Consolidación**
- [ ] **Review**: Ejecutar todas las validaciones en batch
- [ ] **Fix**: Resolver cualquier problema encontrado
- [ ] **Document**: Crear resumen de validaciones para tesis

---

## 📚 **SEMANA 2: Fundamentos Académicos**
*26 Agosto - 1 Septiembre 2025*

### 📋 **Día 1-4: THESIS-002 - Base Scenario Data Traceability**
**Objetivo**: Documentar y justificar cada parámetro con fuentes académicas

#### **Día 1 (Lunes 26 Agosto)** ✅ **COMPLETADO**
- [x] **AM**: Analizar `src/constants/initialState.js` línea por línea
- [x] **AM**: Crear estructura de `docs/Anexo-Fuentes-Datos.md`
- [x] **PM**: Comenzar tabla: Parámetro | Valor | Unidades | Fuente/Justificación
- [x] **PM**: Documentar primeros 29.2% de parámetros (26/89 parámetros completos)

**✅ RESULTADO DÍA 1:**
- **Anexo-Fuentes-Datos.md creado** con estructura académica completa
- **26 parámetros documentados** (superado objetivo del 25%)
- **Fuentes clasificadas**: 4 primarias, 14 secundarias, 8 ingenieriles
- **Metodología de 3 niveles** establecida con incertidumbre cuantificada
- **Branch docs/data-traceability** creado y commit realizado
- **Estado**: Adelantados al cronograma planificado

#### **Día 2 (Martes 27 Agosto)**
- [ ] **AM**: Continuar documentación: parámetros de logística y capacidades
- [ ] **AM**: Investigar fuentes: reportes municipales, estudios SEMARNAT
- [ ] **PM**: Documentar: parámetros económicos (costos, ingresos, tarifas)
- [ ] **PM**: Seguir guidelines de `DATA_COLLECTION_GUIDE.md`

#### **Día 3 (Miércoles 28 Agosto)**
- [ ] **AM**: Finalizar: parámetros de valorización y separación
- [ ] **AM**: Documentar: tasas de fuga, eficiencias, recuperación informal
- [ ] **PM**: Review completo: **0 parámetros sin justificación**
- [ ] **PM**: Validar citations con formato académico

#### **Día 4 (Jueves 29 Agosto)**
- [ ] **AM**: Crear summary table con estadísticas de fuentes
- [ ] **AM**: Identificar parámetros con mayor incertidumbre
- [ ] **PM**: Preparar recommendations para investigación adicional
- [ ] **PM**: Format final del anexo para thesis
- [ ] **EOD**: Commit: `docs: Complete base scenario data traceability with academic citations`

**Entregables**: Anexo completo con justificación de 100% de parámetros

---

### 🔍 **Día 5: THESIS-003 - Model Validation Research (Inicio)**
**Objetivo**: Comenzar investigación de datos históricos de Holbox

#### **Día 5 (Viernes 30 Agosto)**
- [ ] **AM**: Research plan: identificar fuentes de datos históricos
- [ ] **AM**: Contactar: Municipio de Lázaro Cárdenas, SEMARNAT Q. Roo
- [ ] **PM**: Buscar: reportes de limpia pública, estudios ambientales
- [ ] **PM**: Target: 2-3 KPIs verificables (toneladas/mes, costos anuales)
- [ ] **EOD**: Lista de fuentes identificadas y contactos iniciados

**Entregables**: Plan de investigación, contactos establecidos

---

## 🎯 **Métricas de Éxito por Semana**

### **Semana 1 Success Criteria:**
- ✅ **100% Mass Conservation**: Todas las simulaciones balancean masa
- ✅ **0 Constraint Violations**: No se exceden capacidades físicas
- ✅ **Framework Ready**: Listo para recibir datos reales
- ✅ **Automated Testing**: Suite de validación ejecutándose
- ✅ **VALIDATION-001**: Mass Conservation completado
- ✅ **VALIDATION-002**: Physical Constraints completado  
- ✅ **VALIDATION-003**: Real Data Framework completado
- ✅ **Test Dashboard**: Framework integral funcionando en Vercel

### **Semana 2 Success Criteria:**
- 🔄 **100% Parameter Documentation**: Cada valor justificado académicamente (29.2% completado)
- 🔄 **Academic Citations**: Fuentes formales para todos los parámetros (26/89 completados)
- ⏳ **Research Initiated**: Contactos establecidos para datos históricos
- 🔄 **Thesis Ready**: Anexo formateado para inclusión en tesis (estructura completa)

**Progreso THESIS-002 (Día 1/4):**
- ✅ **Día 1 completado** - 29.2% de parámetros documentados  
- ⏳ **Día 2 pendiente** - Logística y parámetros económicos
- ⏳ **Día 3 pendiente** - Valorización y separación  
- ⏳ **Día 4 pendiente** - Review final y formato académico

---

## 🛠️ **Protocolo de Desarrollo Integrado**

### **🔄 Git Workflow Siguiendo DEVELOPMENT_PROTOCOL.md**

#### **Por Cada Tarea (VALIDATION-001, THESIS-002, etc.):**

**1. Pre-Desarrollo:**
```bash
# Sincronizar main branch
git checkout main
git pull origin main

# Crear feature branch con naming convention
git checkout -b validation/mass-conservation  # Para VALIDATION-001
git checkout -b docs/data-traceability        # Para THESIS-002
```

**2. Durante Desarrollo:**
```bash
# Desarrollo incremental con commits frecuentes
npm run dev  # Servidor corriendo en background

# Testing continuo
npm run lint      # Code quality
npm run build     # Production build test
npm run test      # Run test suite

# Commits usando Conventional Commits
git add .
git commit -m "feat: Add mass conservation validation framework"
git commit -m "test: Add automated mass balance verification"
git commit -m "docs: Document validation methodology"
```

**3. Finalización de Tarea:**
```bash
# Push feature branch
git push origin validation/mass-conservation

# Merge to main (para development rápido)
git checkout main
git merge validation/mass-conservation
git push origin main

# Cleanup branch
git branch -d validation/mass-conservation
```

### **📊 Branch Naming por Tipo de Tarea:**
- `validation/mass-conservation` - VALIDATION-001
- `validation/physical-constraints` - VALIDATION-002  
- `validation/real-data-framework` - VALIDATION-003
- `docs/data-traceability` - THESIS-002
- `docs/model-validation` - THESIS-003

### **🧪 Testing Protocol Específico:**

#### **Para Tareas de Validación (VALIDATION-*):**
```bash
# Estructura requerida
src/test/validation/
├── massConservation.test.js
├── physicalConstraints.test.js
└── realDataComparison.test.js

src/utils/validation/
├── massValidator.js
├── constraintValidator.js
└── statisticalComparison.js

# Ejecutar tests específicos
npm run test -- --testPathPattern=validation
npm run test:coverage -- validation/
```

#### **Para Tareas de Documentación (THESIS-*):**
```bash
# Estructura requerida
docs/
├── Chapter3-Mathematical-Model.md     ✅ (Ya creado)
├── Academic-Flow-Diagram.md           ✅ (Ya creado)
├── Anexo-Fuentes-Datos.md            # THESIS-002
├── Chapter-Validation.md              # THESIS-003
└── Plan-Trabajo-2-Semanas.md         ✅ (Este documento)

# Validación de documentos
npm run lint:docs  # Si existe
# Verificar markdown formatting
```

### **🔍 Code Quality Gates por Día:**

#### **Diario (Antes de cada commit):**
- [ ] `npm run lint` - Sin errores de ESLint
- [ ] `npm run build` - Build exitoso
- [ ] `npm run test` - Tests pasando
- [ ] Manual testing en `http://localhost:5173`

#### **Por Tarea Completada:**
- [ ] Todos los tests específicos pasando
- [ ] Documentación actualizada
- [ ] Cambios probados en múltiples escenarios
- [ ] Tasks.csv actualizado con status

### **📦 Dependency Management:**

#### **Si Necesitas Nuevas Dependencias:**
```bash
# Para testing/validation
npm install --save-dev jest-statistical-testing
npm install --save-dev math-statistics-lib

# Para utilities
npm install lodash.clonedeep
npm install statistical-analysis-lib

# Automáticamente actualiza package.json
```

### **🚀 Deployment Verification:**

#### **Después de Merge a Main:**
```bash
# Verificar que todo funciona en producción
npm run build
npm run preview

# Verificar URLs específicas
curl -I https://waste-simulator.vercel.app/
# Check console for errors
# Test validation features manually
```

### **🔄 Continuous Integration Mindset:**

#### **Por Cada Push a Main:**
- [ ] Automatic deployment a Vercel
- [ ] Verificar que la app carga sin errores
- [ ] Smoke test de funcionalidades críticas
- [ ] Verificar que nuevas validaciones aparecen en UI

### **📋 Daily Checklist Protocol:**

#### **Inicio de Día:**
1. [ ] `git checkout main && git pull origin main`
2. [ ] `npm install` (por si hay nuevas dependencias)
3. [ ] `npm run dev` (mantener corriendo)
4. [ ] Revisar todo list del día anterior

#### **Durante Desarrollo:**
1. [ ] Commit cada 1-2 horas de trabajo
2. [ ] `npm run lint` antes de cada commit
3. [ ] Test manual de cambios cada commit
4. [ ] Actualizar todo list con progreso

#### **Final de Día:**
1. [ ] `npm run build && npm run preview` - Test final
2. [ ] Push all commits: `git push origin [branch-name]`
3. [ ] Update tasks.csv si tarea completada
4. [ ] Merge to main si tarea terminada
5. [ ] Update todo list para próximo día

### **🛠️ Herramientas y Recursos Específicos:**

#### **Técnicas:**
- **Testing**: Vitest + React Testing Library (ya configurado)
- **Statistics**: Implementación nativa JS + mathematical libraries
- **Validation**: Custom validators integrados en `useWasteSimulation.tsx`
- **Documentation**: Markdown + MathJax para ecuaciones

#### **Académicas:**
- `DATA_COLLECTION_GUIDE.md` como referencia obligatoria
- Databases: SEMARNAT, INEGI, reportes municipales
- Academic formatting: IEEE/APA style para citations
- Mathematical notation: LaTeX/MathJax compatible

#### **Monitoring:**
- **Git**: Branch per task, conventional commits, daily pushes
- **Progress**: Todo list diario, tasks.csv semanal
- **Quality**: Linting, testing, manual verification
- **Documentation**: Inline comments, academic docs, README updates

---

## 🚨 **Riesgos y Mitigaciones**

### **Riesgo 1**: Validaciones detectan problemas mayores del modelo
**Mitigación**: Fix inmediato, ajuste de timeline si necesario

### **Riesgo 2**: Datos históricos de Holbox no disponibles
**Mitigación**: Usar proxies de islas similares, documentar limitaciones

### **Riesgo 3**: Algunos parámetros sin fuentes confiables
**Mitigación**: Usar estimaciones justificadas, marcar como assumptions

---

## 📞 **Check-in Points**

### **Mid-Week 1** (Miércoles 21 Agosto - EOD):
- Review validation results
- Assess model integrity
- Adjust plan if needed

### **End-Week 1** (Viernes 23 Agosto - EOD):
- Complete validation suite demo
- Plan Week 2 based on findings

### **Mid-Week 2** (Miércoles 28 Agosto - EOD):
- Review data traceability progress
- Assess research progress for historical data

### **End-Week 2** (Viernes 30 Agosto - EOD):
- Complete deliverables review
- Plan next phase (THESIS-003 full execution)

---

## 🎓 **Impacto en la Tesis**

Al final de estas 2 semanas tendrás:

1. **Credibilidad Científica Sólida**: Modelo validado matemáticamente
2. **Fundamento Académico Completo**: Cada parámetro justificado
3. **Framework de Validación**: Listo para comparar con datos reales
4. **Base para Defensa**: Respaldo técnico para cualquier pregunta

Este plan te posiciona para una tesis de ingeniería industrial rigurosa y defendible.

---

---

## 📋 **Templates de Ejecución Diaria**

### **🔄 Daily Protocol Template**

#### **Inicio de Cada Día:**
```bash
# 1. Sync and setup
git checkout main && git pull origin main
git checkout -b [task-branch-name]  # Ver naming conventions arriba
npm install  # Check for new dependencies
npm run dev  # Keep server running

# 2. Review previous work
# Check todo list from previous day
# Review any failed tests or pending issues
```

#### **Durante el Día (Cada 1-2 horas):**
```bash
# 1. Quality check
npm run lint
npm run build
npm run test

# 2. Commit progress
git add .
git commit -m "[type]: [description]"  # Conventional Commits

# 3. Manual verification
# Test changes in browser at localhost:5173
# Verify functionality works as expected
```

#### **Final del Día:**
```bash
# 1. Final quality gate
npm run build && npm run preview
npm run test -- --coverage

# 2. Push progress
git push origin [branch-name]

# 3. If task complete: merge to main
git checkout main
git merge [branch-name]
git push origin main
git branch -d [branch-name]

# 4. Update tracking
# Update tasks.csv if task completed
# Update todo list for next day
```

### **🧪 Validation Task Template (VALIDATION-001, 002, 003)**

#### **File Structure to Create:**
```
src/test/validation/
├── [taskName].test.js          # Main test file
├── helpers/
│   ├── testScenarios.js       # Test data scenarios
│   └── validationHelpers.js   # Shared test utilities

src/utils/validation/
├── [taskName]Validator.js     # Core validation logic
├── types.js                   # TypeScript interfaces
└── constants.js               # Validation constants
```

#### **Test Template Structure:**
```javascript
// src/test/validation/[taskName].test.js
describe('[Task Name] Validation', () => {
  test('validates baseline scenario', () => {
    // Test against known good scenario
  });
  
  test('catches constraint violations', () => {
    // Test edge cases that should fail
  });
  
  test('handles extreme values', () => {
    // Stress test with 5x generation, minimal capacities
  });
});
```

### **📚 Documentation Task Template (THESIS-002, 003, etc.)**

#### **File Structure to Create:**
```
docs/
├── [ChapterName].md           # Main documentation
├── data/
│   ├── [task-data].csv       # Supporting data
│   └── sources.json          # Citation sources
└── appendices/
    └── [TaskName]-Details.md  # Detailed appendix
```

#### **Academic Documentation Template:**
```markdown
# [Chapter/Section Name]

## Abstract
Brief summary of content and findings

## Methodology
How data was collected/analysis performed

## Results
Tables, figures, quantitative results

## Discussion
Interpretation and implications

## References
Academic citations in standard format
```

### **🔄 Git Branch Strategy per Task:**

| Task | Branch Name | Description |
|------|-------------|-------------|
| VALIDATION-001 | `validation/mass-conservation` | Mass balance verification |
| VALIDATION-002 | `validation/physical-constraints` | Capacity limits validation |
| VALIDATION-003 | `validation/real-data-framework` | Statistical comparison framework |
| THESIS-002 | `docs/data-traceability` | Parameter documentation |
| THESIS-003 | `docs/model-validation` | Historical data validation |

### **📊 Success Criteria Checklist per Task Type:**

#### **✅ Validation Tasks (VALIDATION-*):**
- [ ] All tests passing with >95% coverage
- [ ] Validation runs automatically on scenario changes
- [ ] Clear error messages for validation failures
- [ ] Integration with main simulation loop
- [ ] Documentation of validation methodology

#### **✅ Documentation Tasks (THESIS-*):**
- [ ] Academic formatting consistent
- [ ] All citations properly formatted
- [ ] Mathematical notation consistent with Chapter 3
- [ ] Figures/tables properly labeled
- [ ] Content ready for thesis inclusion

---

*Plan creado: 19 Agosto 2025*  
*Actualizado con DEVELOPMENT_PROTOCOL.md: 19 Agosto 2025*  
*Próxima revisión: 23 Agosto 2025*  
*Responsible: Thesis Development Team*