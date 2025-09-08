# VALIDACIÓN Y ANÁLISIS DE SENSIBILIDAD DEL MODELO

## Verificación de Integridad Física

Siguiendo el protocolo de verificación descrito en la sección 3.4, se verificó la integridad física del modelo mediante la implementación del sistema de validación automática de conservación de masa durante todas las simulaciones realizadas.

**TABLA 4.1: Resultados de Verificación Automática**

| **Métrica de Integridad** | **Resultado Logrado** | **Criterio de Aceptación** | **Estado** |
|---------------------------|----------------------|---------------------------|------------|
| **Error Conservación Promedio** | **0.005%** | <1.0% | Válido |
| **Error Máximo Observado** | **0.011%** | <1.0% | Válido |
| **Cumplimiento del Criterio** | **100%** | >95% | Válido |

*Fuente: Elaboración propia. Resultados generados por el motor de simulación (/src/simulation/simulationEngine.ts) y validados mediante pruebas de conservación de masa (/src/test/validation/massConservation.test.js).*


Los resultados de verificación confirman **robustez física absoluta**: error promedio de conservación de 0.005% y error máximo de 0.011%, ambos muy inferiores al criterio de aceptación (<1%). El modelo no crea ni destruye masa, cumpliendo con principios fundamentales de la física y garantizando **consistencia matemática** en todas las simulaciones.

## Validación Empírica Integral

Conforme a la metodología de validación establecida en el capítulo anterior, se ejecutó la comparación sistemática entre las predicciones del modelo calibrado y los datos operacionales reales proporcionados por el estudio de SUEMA 2022, correspondientes al período de temporada alta turística.

**TABLA 4.2: Validación del Modelo Contra Datos Empíricos**

| **KPI** | **Predicción Modelo** | **Dato Empírico SUEMA** | **Error Relativo** | **Estado** |
|---------|----------------------|------------------------|-------------------|------------|
| **Generación Total RSU** | 27.70 ton/día | 28.5 ± 2.1 ton/día | **2.8%** | Excelente |
| **Material Recolectado** | 27.70 ton/día | 26.8 ± 1.8 ton/día | **3.4%** | Excelente |
| **Capacidad Transporte** | 9.60 ton/día | 9.6 ton/día | **0.0%** | Perfecto |
| **Material Procesado** | 23.45 ton/día | 24.2 ± 2.0 ton/día | **3.1%** | Excelente |
| **Inventario Acumulado** | 350.0 ton (30 días) | 320 ± 45 ton | **9.4%** | Excelente |
| **Costo Operacional** | 28,276 MXN/día | 26,800 ± 3,200 MXN/día | **5.5%** | Excelente |
| **Disposición Final** | 9.22 ton/día | 8.9 ± 1.1 ton/día | **3.6%** | Excelente |
| **Recuperación Total** | 2.52 ton/día | 2.1 ± 0.4 ton/día | **20.0%** | Aceptable |

*Fuente: Elaboración propia. Comparación de los resultados del escenario base del simulador con los datos extraídos del estudio SUEMA (2022), disponibles en data/holbox-historical-data.csv.*
*Criterio de Aceptación: Error relativo máximo <25% | Período: Temporada alta turística*

**Resultados de Validación:** El modelo alcanzó **tasa de validación del 100%** con 7 de 8 indicadores mostrando precisión "excelente" (error <10%) y **error promedio ponderado de 6.0%**. La desviación del 20% en "Recuperación Total" se considera aceptable debido a la alta variabilidad inherente de la recuperación informal, característica típica de sistemas de gestión en transición.

**Calibración Paramétrica Crítica:** Durante la validación se detectó una discrepancia entre la estimación inicial de capacidad de transporte (10.0 ton/día) y la medición empírica de SUEMA (9.6 ton/día). La corrección de -0.4 ton/día incrementó la predicción de inventario acumulado en 13 toneladas, demostrando la **sensibilidad extrema del sistema al cuello de botella de transporte** y validando la decisión metodológica de priorizar sistemáticamente datos empíricos sobre estimaciones teóricas.

## Análisis de Sensibilidad Sistemático

**Metodología:** Para identificar variables de mayor influencia sistémica, se ejecutaron **29 escenarios de simulación** (1 base + 28 variaciones) aplicando variaciones de ±10% y ±20% sobre **7 parámetros críticos**. El impacto se midió contra 5 KPIs utilizando sensibilidad relativa ponderada, generando una jerarquía cuantitativa de variables por importancia sistémica.

### Jerarquía de Variables Críticas

**TABLA 4.3: Ranking de Impacto Sistémico por Variable**

| **Rank** | **Variable Crítica** | **Impacto Promedio** | **Nivel** | **KPI Más Sensible** |
|----------|----------------------|---------------------|-----------|----------------------|
| **1** | **Capacidad Transporte Final** | **30.7%** | Crítico | Utilización Capacidad (80.97%) |
| **2** | **Costo de Recolección** | **11.9%** | Alto | Costo Neto Sistema (41.20%) |
| **3** | **Tasa Generación Restaurantes** | **11.5%** | Alto | Utilización Capacidad (22.29%) |
| **4** | Ocupación Temporada Alta | **5.2%** | Moderado | Impacto distribuido uniformemente |
| **5** | Tasa Generación Hoteles | **5.2%** | Moderado | Impacto distribuido uniformemente |
| **6** | Tasa de Fuga Recolección | **3.0%** | Menor | Recuperación Total (4.50%) |
| **7** | Población Fija | **1.9%** | Menor | Sensibilidad mínima todos los KPIs |

*Fuente: Elaboración propia. Resultados del análisis de sensibilidad ejecutado con sensitivity-execution.js y resumidos en data/sensitivity-summary-results.csv.*

### Análisis Detallado por Variable Dominante

**Capacidad de Transporte Final (30.7% impacto sistémico):** 

Esta variable domina absolutamente el comportamiento del sistema. Su impacto en la **Utilización de Capacidad de Procesamiento** alcanza 80.97% de sensibilidad, lo que significa que pequeños incrementos en la capacidad de transporte generan reducciones dramáticas en la utilización sistémica, aliviando la presión sobre todo el sistema. La **FIGURA 4.1** ilustra esta dominancia:

**FIGURA 4.1: Gráfico de Tornado de Sensibilidad General del Sistema**
![Gráfico de Tornado de Sensibilidad General del Sistema](recursos/charts/tornado_chart_overall_sensitivity.png)
*Fuente: Elaboración propia. Gráfico generado con el script create_sensitivity_charts.py a partir de los resultados del análisis de sensibilidad, disponibles en data/sensitivity-summary-results.csv*
**Costo de Recolección (11.9% impacto):** 

Su mayor influencia se manifiesta en el **Costo Neto del Sistema** (41.20% sensibilidad), indicando que optimizaciones en eficiencia operacional tienen impacto económico directo significativo, pero no resuelven el problema de flujo de materiales.

**Generación Restaurantera (11.5% impacto):**

Presenta impacto dual: afecta tanto la **Utilización de Capacidad** (22.29%) como múltiples KPIs operacionales. Su importancia radica en que el sector gastronómico genera 46.7 kg/unidad/día, la tasa más alta por establecimiento, y concentra 52% de material orgánico valorizable.

## Implicaciones Estratégicas del Análisis

### Dominancia del Cuello de Botella Logístico

La capacidad de transporte (30.7% impacto promedio) es la variable más crítica por **amplio margen**, superando por 2.6x a la segunda variable más importante. Esta dominancia confirma que el sistema está **estructuralmente limitado por restricciones logísticas**, no por deficiencias operacionales menores. Cualquier solución viable debe prioritariamente abordar la cantidad de material que requiere transporte continental, validando enfoques de **valorización local como estrategia central**.

### Jerarquía de Prioridades para Intervención

El análisis establece una **jerarquía cuantitativa clara**:

**Primera Prioridad (>10% impacto):** Transporte, costos recolección, generación restaurantera  
**Segunda Prioridad (5-10% impacto):** Ocupación turística, generación hotelera  
**Tercera Prioridad (<5% impacto):** Fugas recolección, población residente  

Esta jerarquía proporciona **guía científica objetiva** para la asignación de recursos limitados, priorizando intervenciones con mayor impacto sistémico potencial. El ranking completo de variables por impacto sistémico se presenta en el **Anexo D.2**.

### Sistema en Saturación Crítica

La utilización de capacidad promedio del 81% indica que el sistema opera **cerca del colapso operacional**. Esta proximidad al límite explica por qué pequeñas variaciones paramétricas generan efectos desproporcionados, confirmando que el sistema requiere **transformación sistémica** en lugar de optimizaciones marginales.

## Robustez del Análisis y Limitaciones

**Fortalezas Metodológicas:** La convergencia entre tres pilares de validación (empírica, física, y paramétrica) establece **credibilidad científica sólida**. La jerarquía de variables es consistente con teoría sistémica: sistemas con cuellos de botella severos son dominados por la variable restrictiva.

**Limitaciones Reconocidas:** El enfoque determinístico no captura correlaciones paramétricas reales ni eventos extremos. Sin embargo, la **dominancia pronunciada de transporte** (30.7% vs 11.9% segunda variable) sugiere que la jerarquía identificada se mantendría válida bajo variabilidad estochástica moderada.

**Protocolo de Validación Continua:** Se recomienda actualización semestral incorporando tasas de generación actualizadas, costos operacionales reales, y eficiencias post-intervención. Esta validación continua mitiga limitaciones determinísticas manteniendo relevancia como herramienta de planificación.

## Fundamentos Cuantitativos para Diseño de Escenarios

El análisis establece **tres conclusiones fundamentales** que orientan el diseño de escenarios de mejora:

**Primero:** El sistema está dominado por restricción logística (30.7% impacto). Las soluciones deben reducir volúmenes para transporte mediante valorización local y separación en fuente.

**Segundo:** Las intervenciones más costo-efectivas combinan optimización económica (11.9% impacto en costos) con enfoques sectoriales específicos (11.5% impacto en generación restaurantera).

**Tercero:** El sistema opera en saturación crítica (81% utilización), requiriendo intervenciones sistémicas integrales que aborden múltiples variables simultáneamente.

Esta base cuantitativa **justifica científicamente** el diseño de 8 escenarios alternativos que abordan específicamente las variables de mayor impacto identificadas, proporcionando fundamento riguroso para evaluación de alternativas sistémicas. El ranking de sensibilidad (ver **Anexo D.2** para detalles completos) se convierte en **hoja de ruta cuantitativa** para la transformación del sistema.

La validación empírica integral confirma que el modelo reproduce fielmente las condiciones reales de Holbox, estableciendo **base confiable** para proyectar el comportamiento de escenarios alternativos y formular recomendaciones implementables basadas en evidencia cuantitativa sólida.