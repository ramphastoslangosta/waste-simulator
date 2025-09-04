# Capítulo 3: Formulación del Modelo de Simulación

## 3.1 Introducción

El presente capítulo describe la formulación matemática del modelo de simulación de gestión de residuos sólidos urbanos para Isla Holbox. El modelo integra múltiples flujos de residuos, procesos de valorización, y programas de mejora de separación en un sistema dinámico de 30 días con análisis diferenciado por temporadas turísticas.

### 3.1.1 Enfoque Determinístico del Modelo

Se optó por un enfoque determinístico, utilizando valores promedio para los parámetros de entrada, por tres razones fundamentales:

**1) Disponibilidad de Datos**: Los datos de campo disponibles (SUEMA, 2022) representan promedios consolidados de 4 semanas de mediciones, insuficientes para ajustar distribuciones de probabilidad confiables. La introducción de variabilidad estocástica requeriría datos de series temporales más extensas (idealmente 1-2 años) que no están disponibles para el sistema de Holbox.

**2) Objetivo Estratégico**: El propósito del modelo es analizar el comportamiento promedio y las tendencias del sistema a mediano plazo para la planificación estratégica, no la simulación de operaciones diarias. Las decisiones de política pública e inversión en infraestructura se basan en patrones consolidados, no en fluctuaciones diarias.

**3) Complejidad y Transparencia**: Un modelo determinista permite una interpretación más clara de las relaciones causa-efecto entre las variables, lo cual es fundamental para esta etapa de la investigación. La transparencia en los resultados facilita la comprensión por parte de tomadores de decisiones no técnicos.

La introducción de variabilidad estocástica se propone como una línea de trabajo futuro una vez que se disponga de series temporales más extensas (ver Capítulo 8).

**Figura 3.1: Diagrama de Flujo de Masa del Sistema RSU**

```
FUENTES DE GENERACIÓN                    PROCESOS DEL SISTEMA                    DESTINOS FINALES
┌─────────────────────┐                                                          
│  HOTELES            │    G_hoteles(t)                                         
│  U_h × O_temp × G_h │────────┐                                                
└─────────────────────┘        │                                                
                               ▼                                                
┌─────────────────────┐    ┌──────────────┐                                    
│  RESTAURANTES       │    │              │    M_recolectado(t)                
│  U_r × G_r          │───▶│  GENERACIÓN  │───────────────────┐                
└─────────────────────┘    │   TOTAL      │                   │                
                           │  G_total(t)  │                   ▼                
┌─────────────────────┐    │              │    D_recolección(t)               
│  HOGARES            │───▶│              │       │                            
│  P_fijo × G_hogar   │    └──────────────┘       ▼                            
└─────────────────────┘                      [DÉFICIT]                        
                                                 │                              
┌─────────────────────┐                         │                              
│  COMERCIOS          │                         │                              
│  U_c × G_c          │─────────────────────────┘                              
└─────────────────────┘                                                        
                                                                               
                               │                                                
                               ▼                                                
                    ┌─────────────────────┐                                    
                    │   RECOLECCIÓN       │                                    
                    │   M_recolectado(t)  │                                    
                    │                     │◄──R_informal,recolección(k)        
                    │  [Inv_vehículos]    │   [RECUPERACIÓN INFORMAL]          
                    └──────────┬──────────┘                                    
                               │ M_transferencia(t)                            
                               ▼                                                
                    ┌─────────────────────┐                                    
                    │  TRANSFERENCIA      │                                    
                    │  M_procesado(t)     │                                    
                    │                     │◄──R_alta,k(t) + R_baja,k(t)       
                    │ [Inv_transferencia] │   [RECUPERACIÓN MATERIALES]        
                    └──────────┬──────────┘                                    
                               │ M_salida(t)                                   
                               ▼                                                
                    ┌─────────────────────┐                                    
                    │   TRANSPORTE        │                                    
                    │   M_transportado(t) │                                    
                    │                     │                                    
                    │  [Inv_transporte]   │                                    
                    └──────────┬──────────┘                                    
                               │ M_llegada(t)                                  
                               ▼                                                
                    ┌─────────────────────┐                                    
                    │  DISPOSICIÓN FINAL  │                                    
                    │   M_final(t)        │◄──R_informal,disposición(t)        
                    │                     │   [RECUPERACIÓN INFORMAL]          
                    │  [Inv_disposición]  │                                    
                    └─────────────────────┘                                    

PROCESOS DE VALORIZACIÓN (Escenarios de Mejora)
┌──────────────────────────────────────────────────────────────────────────┐
│  M_compost(t)    │  M_biogas(t)     │  M_pirólisis(t)                    │
│  [COMPOSTAJE]    │  [BIOGÁS]        │  [PIRÓLISIS]                       │
│  V_compost=1     │  V_biogas=1      │  V_pirólisis=1                     │
└──────────────────────────────────────────────────────────────────────────┘

FLUJOS DE FUGA (F) EN CADA ETAPA:
• F_recolección(t) = M_recolectado(t) × L_recolección/100
• F_transferencia(t) = M_procesado(t) × L_transferencia/100  
• F_transporte(t) = M_transportado(t) × L_transporte/100
• F_disposición(t) = M_llegada(t) × L_disposición/100

INVENTARIOS DE ESTADO [Inv]:
• Inv_vehículos(t+1) = Inv_vehículos(t) + M_transferencia(t) - M_entregado(t)
• Inv_transferencia(t+1) = Inv_transferencia(t) + M_entregado(t) - M_procesado(t)
• Inv_transporte(t+1) = Inv_transporte(t) + M_salida(t) - M_transportado(t)
• Inv_disposición(t+1) = Inv_disposición(t) + M_llegada(t) - M_final(t)
```

Esta figura representa el viaje completo de una tonelada de residuo a través del modelo matemático, mostrando cada proceso como una etapa con sus variables correspondientes, las recuperaciones como flujos laterales, y los inventarios como elementos de almacenamiento temporal que controlan las restricciones de capacidad del sistema.

## 3.2 Definición de Variables y Parámetros

**Tabla 3.1: Resumen de Parámetros Clave y Variables de Estado del Modelo**

| **Categoría** | **Variable** | **Descripción** | **Unidades** | **Tipo** |
|---------------|-------------|-----------------|--------------|----------|
| **Generación** | $P_{fijo}$ | Población fija residente | habitantes | Parámetro |
| | $U_h$ | Unidades hoteleras (cuartos-noche) | unidades | Parámetro |
| | $G_h$ | Generación por unidad hotelera | kg/unidad/día | Parámetro |
| | $O_{alta/baja}$ | Tasa de ocupación por temporada | % | Parámetro |
| **Capacidades** | $Cap_{recolección}$ | Capacidad total de recolección | ton/día | Parámetro |
| | $R_{transferencia}$ | Tasa de procesamiento transferencia | ton/día | Parámetro |
| | $Cap_{transporte}$ | Capacidad transporte final | ton/día | Parámetro |
| **Eficiencias** | $L_{recolección}$ | Tasa de fuga en recolección | % | Parámetro |
| | $E_{compost}$ | Eficiencia proceso compostaje | % | Parámetro |
| | $R_{captura}$ | Eficiencia captura materiales | % | Parámetro |
| **Estados** | $Inv_{vehículos}(t)$ | Inventario en vehículos | ton | Variable |
| | $Inv_{transferencia}(t)$ | Inventario en transferencia | ton | Variable |
| | $Inv_{transporte}(t)$ | Inventario en transporte | ton | Variable |
| | $Inv_{disposición}(t)$ | Inventario en disposición | ton | Variable |
| **Flujos** | $G_{total}(t)$ | Generación total diaria | ton/día | Variable |
| | $M_{recolectado}(t)$ | Material efectivamente recolectado | ton/día | Variable |
| | $M_{final}(t)$ | Material finalmente dispuesto | ton/día | Variable |

### 3.2.1 Variables de Entrada (Parámetros del Sistema)

#### Parámetros Generales
- $P_{fijo}$: Población fija residente (habitantes)
- $O_{alta}$: Tasa de ocupación en temporada alta (%)
- $O_{baja}$: Tasa de ocupación en temporada baja (%)

#### Parámetros de Generación por Fuente
- $U_h$: Número de unidades hoteleras (cuartos-noche disponibles)
- $U_r$: Número de restaurantes  
- $U_c$: Número de comercios
- $G_h$: Tasa de generación por unidad hotelera (kg/unidad/día)
- $G_r$: Tasa de generación por restaurante (kg/unidad/día)
- $G_c$: Tasa de generación por comercio (kg/unidad/día)
- $G_{hogar}$: Tasa de generación per cápita residencial (kg/persona/día)

#### Composición de Residuos por Fuente (%)
- $C_{i,j}$: Porcentaje del material $i$ en la fuente $j$, donde:
  - $i \in \{orgánicos, PET, aluminio, cartón, vidrio, rechazo, peligrosos\}$
  - $j \in \{hoteles, restaurantes, hogares, comercios\}$

#### Parámetros de Separación en Origen
- $S_{j}$: Tasa base de separación en la fuente $j$ (%)
- $\Delta S_{educación,j}$: Incremento por programa de educación en fuente $j$ (%)
- $\Delta S_{incentivos,j}$: Incremento por programa de incentivos en fuente $j$ (%)
- $\Delta S_{contenedores,j}$: Incremento por programa de contenedores en fuente $j$ (%)

### 3.2.2 Variables del Sistema de Recolección y Logística
- $V$: Número de vehículos de recolección
- $Cap_v$: Capacidad por vehículo (ton)
- $T_v$: Número de viajes por vehículo por día
- $Cap_{recolección}$: Capacidad total de recolección diaria (ton/día)

#### Parámetros de Pérdidas (Fugas) del Sistema
- $L_{recolección}$: Tasa de fuga en recolección (%)
- $L_{transferencia}$: Tasa de fuga en estación de transferencia (%)
- $L_{transporte}$: Tasa de fuga en transporte final (%)
- $L_{disposición}$: Tasa de fuga en disposición final (%)

### 3.2.3 Variables del Procesamiento y Valorización
- $R_{transferencia}$: Tasa de procesamiento en estación de transferencia (ton/día)
- $Cap_{transferencia}$: Capacidad de almacenamiento en transferencia (ton)
- $Cap_{transporte}$: Capacidad de transporte final (ton/día)

#### Parámetros de Recuperación de Materiales
- $R_{informal,recolección}$: Tasa de recuperación informal en recolección (%)
- $R_{informal,disposición}$: Tasa de recuperación informal en disposición (%)
- $R_{captura}$: Tasa de captura diferenciada (%)
- $R_{rechazo,origen}$: Tasa de rechazo en separación de origen (%)
- $E_{planta,i}$: Eficiencia de separación en planta para material $i$ (%)

#### Parámetros de Valorización
- $V_{compost,habilitado}$: Indicador binario de compostaje habilitado
- $E_{compost}$: Eficiencia del proceso de compostaje (%)
- $C_{compost}$: Costo del compostaje (MXN/ton)
- $I_{compost}$: Ingreso del compostaje (MXN/ton)

- $V_{biogas,habilitado}$: Indicador binario de biogás habilitado
- $E_{biogas}$: Eficiencia del proceso de biogás (%)
- $C_{biogas}$: Costo del biogás (MXN/ton)
- $I_{biogas}$: Ingreso del biogás (MXN/ton)

- $V_{pirólisis,habilitado}$: Indicador binario de pirólisis habilitada
- $E_{pirólisis}$: Eficiencia del proceso de pirólisis (%)
- $C_{pirólisis}$: Costo de pirólisis (MXN/ton)
- $I_{pirólisis}$: Ingreso de pirólisis (MXN/ton)

### 3.2.4 Variables Económicas
- $C_{recolección}$: Costo unitario de recolección (MXN/ton)
- $C_{transferencia}$: Costo unitario de transferencia (MXN/ton)
- $C_{transporte}$: Costo unitario de transporte final (MXN/ton)
- $C_{disposición}$: Costo unitario de disposición (MXN/ton)
- $I_{material,i}$: Ingreso por venta del material $i$ (MXN/ton)

### 3.2.5 Variables de Estado del Sistema
- $Inv_{vehículos}(t)$: Inventario en vehículos de recolección en día $t$ (ton)
- $Inv_{transferencia}(t)$: Inventario en estación de transferencia en día $t$ (ton)
- $Inv_{transporte}(t)$: Inventario en vehículos de transporte final en día $t$ (ton)
- $Inv_{disposición}(t)$: Inventario en sitio de disposición en día $t$ (ton)

#### Condiciones Iniciales del Sistema

Para todas las simulaciones del Escenario Base, se asume una condición inicial de sistema vacío, donde:

$$Inv_{vehículos}(0) = Inv_{transferencia}(0) = Inv_{transporte}(0) = Inv_{disposición}(0) = 0$$

Esta asunción se justifica porque: 1) representa el estado ideal de operación diaria del sistema, 2) permite observar la acumulación de inventarios desde condiciones controladas, y 3) facilita la interpretación de los resultados al eliminar efectos de condiciones iniciales arbitrarias.

## 3.3 Formulación Matemática del Modelo

### 3.3.1 Generación de Residuos por Fuente

La generación diaria de residuos por cada fuente se calcula como:

#### Generación en Hoteles
$$G_{hoteles}(t) = U_h \cdot \frac{O_{temporada}}{100} \cdot \frac{G_h}{1000}$$

#### Generación en Restaurantes
$$G_{restaurantes}(t) = U_r \cdot \frac{G_r}{1000}$$

#### Generación en Hogares
$$G_{hogares}(t) = P_{fijo} \cdot \frac{G_{hogar}}{1000}$$

#### Generación en Comercios
$$G_{comercios}(t) = U_c \cdot \frac{G_c}{1000}$$

#### Generación Total por Fuente
$$G_{total}(t) = G_{hoteles}(t) + G_{restaurantes}(t) + G_{hogares}(t) + G_{comercios}(t)$$

### 3.3.2 Generación por Tipo de Material

La generación de cada tipo de material $i$ se calcula aplicando las composiciones:

$$G_{i}(t) = \sum_{j \in \{hoteles,restaurantes,hogares,comercios\}} G_{j}(t) \cdot \frac{C_{i,j}}{100}$$

### 3.3.3 Separación Mejorada en Origen

La tasa de separación mejorada para cada fuente $j$ es:

$$S_{mejorada,j} = \min\left(S_{j} + \sum_{programa} \Delta S_{programa,j} \cdot I_{programa}, 95\right)$$

donde $I_{programa}$ es un indicador binario (1 si el programa está activo, 0 si no).

### 3.3.4 Capacidad y Déficit de Recolección

#### Capacidad Total de Recolección
$$Cap_{recolección} = V \cdot Cap_v \cdot T_v$$

#### Déficit de Recolección

La Ecuación (3.4) calcula el déficit de recolección diario, definido como la cantidad de residuos generados que excede la capacidad logística total del sistema. Si la generación es menor que la capacidad, el déficit es cero.

$$D_{recolección}(t) = \max(0, G_{total}(t) - Cap_{recolección})$$

#### Material Efectivamente Recolectado
$$M_{recolectado}(t) = G_{total}(t) - D_{recolección}(t)$$

### 3.3.5 Recuperación Informal en Recolección

Para materiales valorizables $k \in \{PET, aluminio, cartón, vidrio\}$:

$$R_{informal,recolección,k}(t) = G_{k}(t) \cdot \frac{M_{recolectado}(t)}{G_{total}(t)} \cdot \frac{R_{informal,recolección}}{100}$$

### 3.3.6 Pérdidas por Fugas en Recolección

$$F_{recolección}(t) = \left(M_{recolectado}(t) - \sum_k R_{informal,recolección,k}(t)\right) \cdot \frac{L_{recolección}}{100}$$

### 3.3.7 Material que Llega a Estación de Transferencia

$$M_{transferencia}(t) = M_{recolectado}(t) - \sum_k R_{informal,recolección,k}(t) - F_{recolección}(t)$$

### 3.3.8 Dinámica de Inventarios

La dinámica de inventarios se modela como un sistema de tanques en serie donde las restricciones de capacidad se propagan a través del sistema. Cada día, el material recolectado $M_{transferencia}(t)$ se añade al $Inv_{vehículos}$. De ahí, una cantidad $M_{entregado}(t)$, limitada por la capacidad de descarga, pasa al $Inv_{transferencia}$. Este, a su vez, alimenta el inventario de transporte, y así sucesivamente. Este enfoque asegura que las restricciones de capacidad en cada etapa se propaguen correctamente a través del sistema, representando fielmente las limitaciones operacionales del sistema real.

#### Inventario en Vehículos de Recolección
$$Inv_{vehículos}(t+1) = Inv_{vehículos}(t) + M_{transferencia}(t) - \min(Inv_{vehículos}(t), Cap_{recolección})$$

#### Material Procesado en Transferencia
$$M_{procesado}(t) = \min(Inv_{transferencia}(t) + M_{entregado}(t), R_{transferencia})$$

donde $M_{entregado}(t) = \min(Inv_{vehículos}(t), Cap_{recolección})$

### 3.3.9 Recuperación de Materiales en Transferencia

#### Recuperación de Alta Calidad (Separación en Origen)

Para calcular la recuperación de materiales de alta calidad, se utiliza un ratio de procesamiento diario, definido como:

$$\text{ratio procesado}(t) = \frac{M_{procesado}(t)}{M_{transferencia}(t)}$$

que representa la fracción del material llegado a la estación que es efectivamente procesado en el día $t$. Este ratio captura las limitaciones de capacidad de procesamiento en la estación de transferencia.

Para cada material valorizable $k$:

$$R_{alta,k}(t) = \sum_j G_{j}(t) \cdot \frac{C_{k,j}}{100} \cdot \frac{S_{mejorada,j}}{100} \cdot \frac{R_{captura}}{100} \cdot \text{ratio procesado}(t) \cdot \left(1 - \frac{R_{rechazo,origen}}{100}\right)$$

#### Recuperación de Baja Calidad (Separación en Planta)
$$R_{baja,k}(t) = \left(M_{procesado,k}(t) - R_{alta,k}(t)\right) \cdot \frac{E_{planta,k}}{100}$$

### 3.3.10 Procesos de Valorización

Las siguientes ecuaciones describen las capacidades de valorización implementadas en el modelo. Para el Escenario Base, el valor de los indicadores binarios ($V_{compost,habilitado}$, $V_{biogas,habilitado}$, $V_{pirólisis,habilitado}$) se establece en 0, reflejando la ausencia de estas tecnologías en el sistema actual. Estos parámetros se activan en los escenarios de mejora (ver Capítulo 6).

#### Compostaje
Si $V_{compost,habilitado} = 1$:
$$M_{compost}(t) = M_{procesado,orgánicos}(t) \cdot \frac{E_{compost}}{100}$$

#### Biogás
Si $V_{biogas,habilitado} = 1$:
$$M_{biogas}(t) = \left(M_{procesado,orgánicos}(t) - M_{compost}(t)\right) \cdot \frac{E_{biogas}}{100}$$

#### Pirólisis de Plásticos
Si $V_{pirólisis,habilitado} = 1$:
$$M_{pirólisis}(t) = M_{procesado,PET}(t) \cdot \frac{E_{pirólisis}}{100}$$

### 3.3.11 Material para Disposición Final

#### Material que Sale de Transferencia
$$M_{salida}(t) = M_{procesado}(t) - \sum_k \left(R_{alta,k}(t) + R_{baja,k}(t)\right) - \sum_{proc} M_{proc}(t) - F_{transferencia}(t)$$

donde $F_{transferencia}(t) = M_{procesado}(t) \cdot \frac{L_{transferencia}}{100}$

#### Transporte Final con Inventario
$$M_{transportado}(t) = \min(Inv_{transporte}(t) + M_{salida}(t), Cap_{transporte})$$

$$Inv_{transporte}(t+1) = Inv_{transporte}(t) + M_{salida}(t) - M_{transportado}(t)$$

### 3.3.12 Disposición Final

#### Material que Llega a Disposición
$$M_{llegada}(t) = M_{transportado}(t) - F_{transporte}(t)$$

donde $F_{transporte}(t) = M_{transportado}(t) \cdot \frac{L_{transporte}}{100}$

#### Recuperación Informal en Disposición
$$R_{informal,disposición}(t) = M_{llegada}(t) \cdot \text{proporción valorizables} \cdot \frac{R_{informal,disposición}}{100}$$

#### Material Finalmente Dispuesto
$$M_{final}(t) = M_{llegada}(t) - R_{informal,disposición}(t) - F_{disposición}(t)$$

donde $F_{disposición}(t) = M_{llegada}(t) \cdot \frac{L_{disposición}}{100}$

### 3.3.13 Modelo Económico

#### Costos Operativos Diarios
$$C_{total}(t) = M_{recolectado}(t) \cdot C_{recolección} + M_{procesado}(t) \cdot C_{transferencia} + M_{transportado}(t) \cdot C_{transporte} + M_{llegada}(t) \cdot C_{disposición}$$

#### Costos de Valorización
$$C_{valorización}(t) = M_{compost}(t) \cdot C_{compost} + M_{biogas}(t) \cdot C_{biogas} + M_{pirólisis}(t) \cdot C_{pirólisis}$$

#### Ingresos por Materiales
$$I_{materiales}(t) = \sum_k \left(R_{alta,k}(t) + R_{baja,k}(t)\right) \cdot I_{material,k}$$

#### Ingresos por Valorización
$$I_{valorización}(t) = M_{compost}(t) \cdot I_{compost} + M_{biogas}(t) \cdot I_{biogas} + M_{pirólisis}(t) \cdot I_{pirólisis}$$

#### Costos de Programas de Separación
$$C_{programas}(t) = C_{educación}(t) + C_{incentivos}(t) + C_{contenedores}(t)$$

#### Costo Neto del Sistema
$$C_{neto}(t) = C_{total}(t) + C_{valorización}(t) + C_{programas}(t) - I_{materiales}(t) - I_{valorización}(t)$$

### 3.3.14 Indicadores de Desempeño (KPIs)

#### Tasa de Recuperación Total
$$KPI_{recuperación} = \frac{\sum_k (R_{alta,k} + R_{baja,k}) + \sum_{proc} M_{proc} + R_{informal,total}}{G_{total}} \times 100$$

#### Eficiencia de Recolección
$$KPI_{recolección} = \frac{M_{recolectado}}{G_{total}} \times 100$$

#### Tiempo de Espera en Transferencia
$$KPI_{espera} = \frac{Inv_{transferencia}}{R_{transferencia}}$$

#### Pérdidas Totales del Sistema
$$KPI_{pérdidas} = \frac{\sum F_{etapa} + D_{recolección}}{G_{total}} \times 100$$

## 3.4 Implementación Computacional

El modelo se implementa como un sistema dinámico discreto con paso temporal de 1 día durante 30 días de simulación. Los resultados finales se promedian sobre los últimos 7 días para obtener valores estables que representen el comportamiento de estado estacionario del sistema.

### 3.4.1 Justificación del Paso Temporal Diario

Se seleccionó un paso de tiempo discreto de un día ($\Delta t = 1$ día) como la resolución temporal adecuada por las siguientes razones:

**1) Alineación con Datos Disponibles**: Los datos de entrada disponibles (SUEMA, 2022) se consolidaron a nivel diario (ej. generación diaria, viajes por día, capacidades diarias), haciendo que la resolución diaria sea la más natural y precisa.

**2) Objetivo de Planificación Estratégica**: El modelo está diseñado para análisis de política pública e inversión en infraestructura, donde las decisiones se toman en base a patrones y tendencias consolidadas, no fluctuaciones horarias.

**3) Operación del Sistema Real**: Las operaciones críticas del sistema (recolección, transporte, disposición) se ejecutan en ciclos diarios completos, haciendo que la resolución diaria capture adecuadamente la dinámica operacional relevante.

**4) Estabilidad Numérica**: Un paso temporal diario evita oscilaciones artificiales que podrían introducirse con resoluciones temporales menores en un modelo determinista.

### 3.4.2 Algoritmo Principal

```javascript
Para t = 1 hasta 30:
    1. Calcular generación por fuente según temporada
    2. Aplicar composición y obtener generación por material
    3. Aplicar separación mejorada y recuperación
    4. Procesar recolección con capacidades y fugas
    5. Actualizar inventarios en cada etapa
    6. Procesar en estación de transferencia
    7. Aplicar procesos de valorización
    8. Transportar y disponer material final
    9. Calcular costos, ingresos y KPIs
    10. Almacenar resultados del día

Promediar resultados de días 24-30 para KPIs finales
```

### 3.4.2 Estructura de Datos

#### Variables de Estado
```javascript
const estadoSistema = {
  inventarios: {
    vehiculos: Array(31).fill(0),
    transferencia: Array(31).fill(0),
    transporte: Array(31).fill(0),
    disposicion: Array(31).fill(0)
  },
  flujos: {
    generacion: Array(31).fill({}),
    recoleccion: Array(31).fill({}),
    procesamiento: Array(31).fill({}),
    valorizacion: Array(31).fill({}),
    disposicion: Array(31).fill({})
  },
  kpis: Array(31).fill({})
};
```

#### Parámetros de Configuración
```javascript
const parametrosModelo = {
  poblacion: {
    fija: 2687,
    ocupacionAlta: 85,
    ocupacionBaja: 35
  },
  infraestructura: {
    vehiculos: 3,
    capacidadVehiculo: 8,
    viajesPorDia: 1,
    capacidadTransferencia: 50,
    capacidadTransporte: 8
  },
  eficiencias: {
    separacionOrigen: {...},
    recuperacionPlanta: {...},
    valorizacion: {...}
  },
  costos: {...},
  ingresos: {...}
};
```

### 3.4.3 Módulos Principales

#### Módulo de Generación
```javascript
function calcularGeneracion(dia, temporada, parametros) {
  const ocupacion = temporada === 'alta' ? 
    parametros.ocupacionAlta : parametros.ocupacionBaja;
  
  const generacion = {
    hoteles: parametros.unidadesHoteleras * ocupacion/100 * parametros.tasaHotelera/1000,
    restaurantes: parametros.restaurantes * parametros.tasaRestaurante/1000,
    hogares: parametros.poblacionFija * parametros.tasaResidencial/1000,
    comercios: parametros.comercios * parametros.tasaComercial/1000
  };
  
  return {
    total: Object.values(generacion).reduce((a, b) => a + b, 0),
    porFuente: generacion,
    porMaterial: aplicarComposicion(generacion, parametros.composicion)
  };
}
```

#### Módulo de Recolección y Transporte
```javascript
function procesarRecoleccion(generacionDia, inventarioAnterior, parametros) {
  const capacidadTotal = parametros.vehiculos * parametros.capacidadVehiculo * parametros.viajesPorDia;
  const deficit = Math.max(0, generacionDia.total - capacidadTotal);
  const recolectado = generacionDia.total - deficit;
  
  // Aplicar recuperación informal y fugas
  const recuperacionInformal = calcularRecuperacionInformal(recolectado, parametros);
  const fugas = (recolectado - recuperacionInformal) * parametros.fugasRecoleccion / 100;
  
  return {
    recolectado,
    deficit,
    recuperacionInformal,
    fugas,
    aTransferencia: recolectado - recuperacionInformal - fugas
  };
}
```

#### Módulo de Valorización
```javascript
function procesarValorizacion(materialProcesado, parametros) {
  let resultados = {
    compost: 0,
    biogas: 0,
    pirolisis: 0
  };
  
  if (parametros.compostHabilitado) {
    resultados.compost = materialProcesado.organicos * parametros.eficienciaCompost / 100;
  }
  
  if (parametros.biogasHabilitado) {
    const organicosSobrantes = materialProcesado.organicos - resultados.compost;
    resultados.biogas = organicosSobrantes * parametros.eficienciaBiogas / 100;
  }
  
  if (parametros.pirolisisHabilitada) {
    resultados.pirolisis = materialProcesado.PET * parametros.eficienciaPirolisis / 100;
  }
  
  return resultados;
}
```

## 3.5 Validación y Verificación del Modelo

### 3.5.1 Verificación Matemática

#### Conservación de Masa
El modelo verifica en cada paso temporal que:
$$G_{total}(t) = R_{recuperado}(t) + M_{valorizado}(t) + M_{dispuesto}(t) + F_{total}(t) + \Delta Inv(t)$$

donde:
- $R_{recuperado}(t)$: Total de materiales recuperados
- $M_{valorizado}(t)$: Total de material valorizado
- $M_{dispuesto}(t)$: Total de material dispuesto finalmente
- $F_{total}(t)$: Total de fugas en todas las etapas
- $\Delta Inv(t)$: Cambio en inventarios totales

#### Restricciones de Capacidad
El modelo verifica que en ningún momento se excedan las capacidades físicas:
- $M_{recolectado}(t) \leq Cap_{recolección}$
- $Inv_{transferencia}(t) \leq Cap_{transferencia}$
- $M_{transportado}(t) \leq Cap_{transporte}$

### 3.5.2 Pruebas de Consistencia

#### Casos Límite
- **Generación Cero**: Sistema debe mostrar inventarios y costos cero
- **Capacidad Infinita**: Sin limitaciones, no debe haber déficits ni inventarios acumulados
- **Eficiencia 100%**: No debe haber fugas ni rechazos en el sistema

#### Análisis de Sensibilidad Interno
- Variaciones pequeñas en parámetros deben producir cambios proporcionales en resultados
- El modelo debe ser estable numéricamente sin oscilaciones artificiales
- Convergencia a estado estacionario en período razonable (15-20 días)

### 3.5.3 Validación contra Datos Empíricos

El modelo será validado sistemáticamente contra los datos de campo recolectados, utilizando métricas estadísticas estándar para cuantificar precisión y confiabilidad. Esta validación se presenta en detalle en el Capítulo 4.

---

**Referencias del Capítulo**

- Banks, J., et al. (2010). *Discrete-Event System Simulation*. 5th Edition. Pearson Education.

- Law, A. M. (2015). *Simulation Modeling and Analysis*. 5th Edition. McGraw-Hill Education.

- Robinson, S. (2014). *Simulation: The Practice of Model Development and Use*. 2nd Edition. Palgrave Macmillan.

- Sargent, R. G. (2013). Verification and validation of simulation models. *Journal of Simulation*, 7(1), 12-24.

- Tchobanoglous, G., Theisen, H., & Vigil, S. (1993). *Integrated Solid Waste Management: Engineering Principles and Management Issues*. McGraw-Hill.

---

*Documento generado como parte de THESIS-001: Mathematical Model Deconstruction*  
*Fecha: Agosto 2025*