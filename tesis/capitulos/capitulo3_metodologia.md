# METODOLOGÍA

## Arquitectura del Modelo de Simulación

El núcleo metodológico es un **modelo matemático determinístico** que simula flujos de masa y económicos del sistema de gestión de residuos, implementado como simulador web interactivo en React+TypeScript para garantizar accesibilidad y reproducibilidad.

El modelo se estructura en **cinco módulos secuenciales** basados en conservación de masa: (1) **Generación** por sectores con variación estacional, (2) **Recolección** limitada por capacidad vehicular, (3) **Transporte** con restricción crítica de 9.6 ton/día, (4) **Valorización** mediante compostaje y separación, y (5) **Disposición final** con cálculos económicos integrados.

**Ecuaciones Fundamentales:** El sistema se rige por el balance de masa general (ver **Anexo B, Ec. 3.1**):

$$G_{total}(t) = \sum_{i=1}^{n} (U_i \times R_i \times O_i(t)) \qquad\qquad\qquad (Ec.3.1)$$

Donde:

- $G_{total}(t)$ es la generación diaria,
- $U_i$ las unidades por fuente,
- $R_i$ las tasas específicas,
- $O_i(t)$ los factores de ocupación estacional.

La **ecuación crítica de restricción de transporte** (ver **Anexo B, Ec.3.2**) establece que:

$$Transport_{real}(t) = \min(Demanda_{transport}(t), 9.6 \text{ ton/día}) \qquad\qquad\qquad (Ec.3.2)$$

Esta limitación genera el déficit sistémico del 79.6% identificado como causa raíz de la problemática. La restricción de transporte es la variable más crítica del sistema con **30.7% de impacto promedio ponderado**, dominando el comportamiento operacional y económico del sistema completo.

## Fuentes de Datos y Calibración Empírica

**Datos Primarios:** La base empírica proviene del **Estudio SUMA (2022)** que proporcionó **47 variables operacionales** medidas durante 4 semanas en temporada alta, incluyendo tasas de generación por sector (2.1 kg/unidad/día hoteles), composición por fuente (52% orgánicos en restaurantes), y capacidades operacionales actuales. Los **112 parámetros operacionales utilizados se detallan en el Anexo C**, proporcionando la base completa de configuración del modelo.

**Protocolo de Calibración de Tres Etapas:**

**Etapa 1 - Calibración Paramétrica:** Ajuste crítico de capacidad de transporte de estimación inicial (10.0 ton/día) al valor empírico SUMA (9.6 ton/día). Esta corrección de -0.4 ton/día incrementó la predicción de inventario acumulado en 13 toneladas, demostrando la sensibilidad sistémica al cuello de botella de transporte.

**Etapa 2 - Integridad Física:** Implementación de validador automático para conservación de masa en cada simulación de 30 días, garantizando error numérico <0.01% y cumplimiento de restricciones físicas (flujos no negativos, capacidades respetadas).

**Etapa 3 - Validación Empírica:** Comparación sistemática de predicciones del escenario base contra 8 KPIs medidos en campo, con criterio de aceptación de error relativo <25%. El **protocolo completo de validación se presenta en el Anexo D**.

## Validación Empírica y Resultados

El protocolo evalúa 8 KPIs críticos que caracterizan integralmente el desempeño del sistema:

- Indicadores de Flujo: Generación total de RSU, material recolectado, material procesado, y disposición final, medidos en toneladas por día.
- Indicadores de Capacidad: Capacidad de transporte y recuperación total de materiales, que reflejan las limitaciones operacionales del sistema.
- Indicadores Económicos: Costo operacional diario, que integra todos los componentes de gasto del sistema actual.
- Indicadores de Estado: Inventario acumulado durante el período de simulación, que refleja la sostenibilidad operacional del sistema.

Se estableció un criterio de aceptación de error relativo máximo <25% por indicador, basado en estándares internacionales para validación de modelos de gestión de residuos en contextos con variabilidad operacional. El modelo se considera empíricamente validado si alcanza tasa de validación exitosa ≥75% (6 de 8 KPIs dentro del criterio) con error promedio ponderado <15%. La validación utiliza como referencia el Estudio SUEMA (2022). Los resultados específicos de esta validación empírica se presentan y analizan detalladamente en la Sección 4.2 del siguiente capítulo.

### **Métricas de Precisión del Modelo**

**Distribución de Precisión:**

- **Precisión Perfecta** (0-1% error)
- **Precisión Excelente** (1-10% error)
- **Precisión Aceptable** (10-25% error)
- **Precisión Insuficiente** (>25% error)

## Verificación de Integridad Física

Para garantizar la consistencia física del modelo, se implementó un sistema de verificación automática de conservación de masa que opera en cada iteración de simulación. Este método confirma que el modelo cumple con principios fundamentales de la física, específicamente que la masa no se crea ni se destruye durante el proceso de simulación.

La verificación se basa en la ecuación de balance de masa general (ver Anexo B, Sección B.2):

$$G_{total} = Material_{dispuesto} + Material_{recuperado} + Material_{valorizado} + Fugas_{total} + Deficit_{recoleccion} + Deficit_{transporte} \qquad\qquad\qquad (Ec.3.3)$$

Donde:

- $Gtotal_{total}$​: Generación total de residuos durante el período

- $Material_{dispuesto}$: Cantidad enviada a disposición final

- $Material_{recuperado}$​: Materiales recuperados para reciclaje

- $Material_{valorizado}$: Residuos procesados por compostaje u otros métodos

- $Fugas_{total}$: Pérdidas en el proceso de recolección

- $Deficit_{recoleccion}$​: Material generado pero no recolectado

- $Deficit_{transporte}$​: Material recolectado pero no transportado

Se estableció un criterio estricto de error de conservación <1.0% para confirmar integridad física. Los resultados específicos de esta verificación de integridad física se confirman y presentan en la Sección 4.1 del siguiente capítulo.

## Análisis de Sensibilidad Sistemático

Para identificar variables de mayor influencia sistémica, se ejecutaron **29 escenarios de simulación** (1 base + 28 variaciones) aplicando variaciones de ±10% y ±20% sobre **7 parámetros críticos**. La jerarquía resultante establece las prioridades para intervención:

**Jerarquía de Variables Críticas:**

1. **Capacidad de Transporte Final:** 30.7% impacto (CRÍTICO)
2. **Costo de Recolección:** 11.9% impacto (ALTO)  
3. **Tasa de Generación Restaurantes:** 11.5% impacto (ALTO)

Esta jerarquía valida que las variables más críticas están relacionadas con **limitaciones logísticas y características sectoriales específicas**, orientando el diseño de escenarios de mejora hacia soluciones que aborden primariamente la restricción de transporte y optimización de generación por sector.

## Robustez Metodológica y Aplicación a Escenarios

**Convergencia Predicciones-Datos:** La convergencia entre predicciones del modelo y datos empíricos valida tanto las ecuaciones fundamentales como los parámetros calibrados, garantizando que las conclusiones derivadas reflejen condiciones reales del sistema.

**Base Confiable para Evaluación:** Esta metodología validada permite evaluar 8 escenarios alternativos mediante modificación controlada de parámetros específicos (capacidades, tasas de separación, procesos de valorización) manteniendo la integridad del modelo base.

**Garantía de Representatividad:** Las conclusiones derivadas del modelo reflejan condiciones reales del sistema de gestión de residuos de Isla Holbox, proporcionando base cientifica sólida para recomendaciones implementables.

La aplicación sistemática de esta metodología a múltiples configuraciones del sistema genera evidencia cuantitativa que orienta la selección de la estrategia óptima de intervención, balanceando efectividad operacional, viabilidad económica y sustentabilidad ambiental.