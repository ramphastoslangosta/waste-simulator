# ANEXO D: VALIDACIÓN DEL MODELO RESUMIDA

## D.1 VALIDACIÓN EMPÍRICA PRINCIPAL

**Criterio:** Error relativo máximo <25% | **Período:** Temporada alta turística

**Tabla D.1: Validación Modelo vs. Datos Reales SUEMA 2022**

| **KPI** | **Predicción Modelo** | **Dato Empírico SUEMA** | **Error Relativo** | **Estado** |
|---------|----------------------|------------------------|-------------------|------------|
| **Generación Total RSU** | 27.70 ton/día | 28.5 ± 2.1 ton/día | **2.8%** | Excelente |
| **Material Recolectado** | 27.70 ton/día | 26.8 ± 1.8 ton/día | **3.4%** | Excelente |
| **Capacidad Transporte** | 9.60 ton/día | 9.6 ton/día | **0.0%** | Perfecto |
| **Material Procesado** | 23.45 ton/día | 24.2 ± 2.0 ton/día | **3.1%** | Excelente |
| **Recuperación Total** | 2.52 ton/día | 2.1 ± 0.4 ton/día | **20.0%** | Aceptable |
| **Inventario Acumulado** | 350.0 ton (30 días) | 320 ± 45 ton | **9.4%** | Excelente |
| **Costo Operacional** | 28,276 MXN/día | 26,800 ± 3,200 MXN/día | **5.5%** | Excelente |
| **Disposición Final** | 9.22 ton/día | 8.9 ± 1.1 ton/día | **3.6%** | Excelente |

*Fuente: Elaboración propia. Comparación de los resultados del simulador con los datos de data/holbox-historical-data.csv.*

### **Métricas de Robustez del Modelo**

- **Tasa de Validación Exitosa:** 100% (8 de 8 KPIs dentro del criterio)
- **Error Promedio Ponderado:** 6.0% (muy inferior al umbral de 25%)
- **Precisión Excelente:** 7 de 8 KPIs con error <10%

## D.2 Jerarquía De Variables Críticas

**Metodología:** 29 simulaciones (1 base + 28 variaciones) con variaciones ±10% y ±20%

**Tabla D.2: Ranking de Impacto Sistémico - Análisis de Sensibilidad**

| **Rank** | **Variable Crítica** | **Impacto Promedio** | **Nivel** | **KPI Más Sensible** |
|----------|----------------------|---------------------|-----------|----------------------|
| **1** | **Capacidad Transporte Final** | **30.7%** | Crítico | Utilización Capacidad (80.97%) |
| **2** | **Costo de Recolección** | **11.9%** | Alto | Costo Neto Sistema (41.20%) |
| **3** | **Tasa Generación Restaurantes** | **11.5%** | Alto | Utilización Capacidad (22.29%) |
| **4** | Ocupación Temporada Alta | **5.2%** | Moderado | Impacto distribuido |
| **5** | Tasa Generación Hoteles | **5.2%** | Moderado | Impacto distribuido |
| **6** | Tasa de Fuga Recolección | **3.0%** | Menor | Recuperación Total (4.50%) |
| **7** | Población Fija | **1.9%** | Menor | Sensibilidad mínima |

*Fuente: Elaboración propia. Resultados del análisis de sensibilidad, disponibles en data/sensitivity-summary-results.csv.*

### **Implicaciones Estratégicas**

**Dominancia del Cuello de Botella:** La capacidad de transporte (30.7% impacto) es la variable más crítica por amplio margen, confirmando que cualquier solución viable debe prioritariamente abordar la cantidad de material que requiere transporte continental.

**Palancas Económicas:** Después de logística, las variables más influyentes son costo de recolección (11.9%) y generación restaurantera (11.5%), sugiriendo que intervenciones costo-efectivas deben enfocar reducción de volúmenes en origen y optimización operacional.

## D.3 Verificación De Integridad Física

### **Conservación de Masa Verificada**

**Tabla D.3: Resultados de la Verificación de Conservación de Masa**

| **Métrica** | **Resultado** | **Criterio** | **Estado** |
|-------------|---------------|--------------|------------|
| Error Conservación Promedio | **0.005%** | <1.0% | Válido |
| Error Máximo Observado | **0.011%** | <1.0% | Válido |
| Cumplimiento del Criterio | **100%** | >95% | Válido |

*Fuente: Elaboración propia. Resultados generados por el sistema de validación automática del simulador, definido en src/test/validation/massConservation.test.js.*

**Confirmación:** El modelo no crea ni destruye masa, cumpliendo principios fundamentales de la física con error numérico inferior al 0.01%.

## D.4 Calibración Paramétrica Crítica

### **Ajuste Empírico Clave**

**Discrepancia Detectada:**

- Estimación inicial: Capacidad transporte = 10.0 ton/día
- Medición SUEMA 2022: Capacidad transporte = 9.6 ton/día
- **Corrección aplicada:** -0.4 ton/día (-4.0% ajuste)

**Impacto Sistémico:** Esta corrección de un único parámetro incrementó la predicción de inventario acumulado en 13 toneladas, demostrando la sensibilidad sistémica al cuello de botella identificado.

**Decisión Metodológica:** Priorización sistemática del dato empírico sobre estimaciones teóricas, garantizando que las conclusiones reflejen condiciones reales.

## D.5 Síntesis De Validación

### **Confirmación de Robustez Científica**

**Tres Pilares Validados:**

1. **Validación Empírica:** 100% tasa éxito, 6.0% error promedio
2. **Integridad Física:** 0.005% error conservación masa  
3. **Sensibilidad Paramétrica:** Jerarquía consistente con teoría sistémica

**Credibilidad Establecida:** El modelo demuestra ser base robusta y científicamente sólida para análisis de escenarios y toma de decisiones.

**Aplicabilidad Práctica:** La convergencia entre predicciones del modelo y datos empíricos valida que las conclusiones derivadas reflejan condiciones reales del sistema de gestión de residuos de Isla Holbox.

**REFERENCIA DIGITAL COMPLETA**
Protocolos detallados de validación, datasets de sensibilidad, y reportes de verificación disponibles en:
https://github.com/ramphastoslangosta/waste-simulator/docs/validation-protocols.md