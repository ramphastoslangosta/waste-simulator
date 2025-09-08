# ANEXO B: FORMULARIO MATEMÁTICO ESENCIAL

## B.1 Ecuaciones Fundamentales del Modelo

### **Ecuación (B.1) - Generación Total por Día [CRÍTICA]**

$$G_{total}(t) = \sum_{i=1}^{n} (U_i \times R_i \times O_i(t)) \qquad\qquad\qquad (Ec.B.1)$$

**Descripción:** Calcula la generación diaria total como suma de todas las fuentes generadoras, ajustada por variaciones estacionales de ocupación turística.

**Variables críticas identificadas por análisis de sensibilidad:**

- $R_{restaurantes} = 46.7$ kg/unidad/día (Rank #3 en impacto sistémico: 11.5%)
- $R_{hoteles} = 2.1$ kg/unidad/día (Rank #5 en impacto sistémico: 5.2%)
- $O_{alta}(t) = 2.8 \times O_{baja}(t)$ (Rank #4 en impacto sistémico: 5.2%)

### **Ecuación (B.2) - Restricción de Transporte Final [CUELLO DE BOTELLA]**

$$Transport_{real}(t) = \min(Demanda_{transport}(t), 9.6 \text{ ton/día})\qquad\qquad\qquad (Ec.B.2)$$

**VARIABLE MÁS CRÍTICA DEL SISTEMA**

- Impacto promedio ponderado: **30.7%** (Rank #1)
- Sensibilidad en utilización de capacidad: **80.97%**
- Genera déficit sistémico del **79.6%** en escenario base

### **Ecuación (B.3) - Acumulación Forzada [EFECTO DEL CUELLO DE BOTELLA]**

$$Acumul_{forzada}(t) = \max(0, Demanda_{transport}(t) - 9.6)qquad\qquad\qquad (Ec.B.3)$$

**Resultado crítico:** 894.7 toneladas acumuladas en 30 días (escenario base)

### **Ecuación (B.4) - Costo Neto del Sistema [KPI PRINCIPAL]**

$$C_{neto}(t) = C_{total}(t) - I_{total}(t)qquad\qquad\qquad (Ec.B.4)$$

**Donde:**
$$C_{total}(t) = C_{recolec}(t) + C_{transport}(t) + C_{disposic}(t) + C_{valoriz}(t)$$

$$I_{total}(t) = \sum_{m \in valorizables} (Rec_{formal,m}(t) \times P_{venta,m}) + Prod_{valoriz}(t) \times P_{producto}$$

## B.2 Validación de Conservación de Masa

### **Ecuación (B.5) de Balance de Conservación de Masa [VALIDACIÓN FÍSICA]**

$$G_{total} = Material_{dispuesto} + Material_{recuperado} + Material_{valorizado} + Fugas_{total} + Deficit_{recoleccion} + Deficit_{transporte}qquad\qquad\qquad (Ec.B.5)$$

**Resultados de validación logrados:**

- Error promedio: **0.005%** ✓
- Error máximo: **0.011%** ✓  
- Cumplimiento: **100%** ✓

## B.3 Parámetroc Críticos del Sistema

### **Variables de Capacidad**

**Tabla B.1: Parámetros Críticos de Capacidad del Sistema**

| Símbolo | Descripción | Valor Crítico |
|---------|-------------|---------------|
| $Cap_{transport}$ | Capacidad de transporte | **9.6 ton/día** |
| $Cap_{recolec}$ | Capacidad de recolección | 15.0 ton/día |
| $Cap_{valoriz}$ | Capacidad de valorización | Variable por escenario |

*Fuente: Elaboración propia. Parámetros de entrada del simulador (src/constants/initialState.js), calibrados y validados con datos del estudio SUEMA (2022) (data/holbox-historical-data.csv).*

### **Tasas de Generación Validadas**

**Tabla B.2: Tasas de Generación Validadas por Sector**

| Símbolo | Descripción | Valor SUEMA 2022 |
|---------|-------------|-----------------|
| $R_{hoteles}$ | Tasa hotelera | **2.1 kg/unidad/día** |
| $R_{restaurantes}$ | Tasa gastronómica | **46.7 kg/unidad/día** |
| $R_{residencial}$ | Tasa residencial | 1.2 kg/persona/día |

*Fuente: Datos empíricos del estudio de caracterización SUEMA (2022), utilizados como parámetros de entrada en data/holbox-historical-data.csv.*

**Tabla B.3: Parámetros Económicos Clave**

### **Parámetros Económicos**

| Símbolo | Descripción | Valor |
|---------|-------------|-------|
| $P_{transporte}$ | Costo de transporte | **2,600 MXN/ton** |
| $P_{compost}$ | Precio de compost | 800 MXN/ton |
| $P_{disposicion}$ | Costo de disposición | 200 MXN/ton |

*Fuente: Elaboración propia. Parámetros económicos base para el motor de simulación, definidos en src/simulation/modules/economics.ts.*

## B.4 Métricas de Validación del Modelo

### **Criterios de Aceptación**

- **Error de conservación de masa:** < 0.01% ✓
- **Error empírico por KPI:** < 25% ✓  
- **Tasa de validación:** 100% (8/8 KPIs) ✓

### **Jerarquía de Variables por Análisis de Sensibilidad**

1. **Capacidad de Transporte Final:** 30.7% impacto (CRÍTICO)
2. **Costo de Recolección:** 11.9% impacto (ALTO)
3. **Tasa de Generación Restaurantes:** 11.5% impacto (ALTO)

**REFERENCIA DIGITAL COMPLETA**

Formulario matemático extendido con todas las ecuaciones, algoritmos detallados y pseudocódigo completo disponible en:
https://github.com/ramphastoslangosta/waste-simulator/docs/mathematical-formulation.md