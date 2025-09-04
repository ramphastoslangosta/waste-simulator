# Capítulo 3: Formulación del Modelo de Simulación

## 3.1 Introducción

El presente capítulo describe la formulación matemática del modelo de simulación de gestión de residuos sólidos urbanos para Isla Holbox. El modelo integra múltiples flujos de residuos, procesos de valorización, y programas de mejora de separación en un sistema dinámico de 30 días con análisis diferenciado por temporadas turísticas.

## 3.2 Definición de Variables y Parámetros

### 3.2.1 Variables de Entrada (Parámetros del Sistema)

#### Parámetros Generales
- $P_{fijo}$: Población fija residente (habitantes)
- $O_{alta}$: Tasa de ocupación en temporada alta (%)
- $O_{baja}$: Tasa de ocupación en temporada baja (%)

#### Parámetros de Generación por Fuente
- $U_h$: Número de unidades hoteleras
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

#### Inventario en Vehículos de Recolección
$$Inv_{vehículos}(t+1) = Inv_{vehículos}(t) + M_{transferencia}(t) - \min(Inv_{vehículos}(t), Cap_{recolección})$$

#### Material Procesado en Transferencia
$$M_{procesado}(t) = \min(Inv_{transferencia}(t) + M_{entregado}(t), R_{transferencia})$$

donde $M_{entregado}(t) = \min(Inv_{vehículos}(t), Cap_{recolección})$

### 3.3.9 Recuperación de Materiales en Transferencia

#### Recuperación de Alta Calidad (Separación en Origen)
Para cada material valorizable $k$:

$$R_{alta,k}(t) = \sum_j G_{j}(t) \cdot \frac{C_{k,j}}{100} \cdot \frac{S_{mejorada,j}}{100} \cdot \frac{R_{captura}}{100} \cdot \text{ratio procesado} \cdot \left(1 - \frac{R_{rechazo,origen}}{100}\right)$$

#### Recuperación de Baja Calidad (Separación en Planta)
$$R_{baja,k}(t) = \left(M_{procesado,k}(t) - R_{alta,k}(t)\right) \cdot \frac{E_{planta,k}}{100}$$

### 3.3.10 Procesos de Valorización

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

### 3.4.1 Algoritmo Principal

```
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

## 3.5 Validación y Verificación del Modelo

El modelo será validado mediante:
1. **Verificación de conservación de masa**: Validar que el material total generado sea igual a la suma de material recuperado, valorizado, dispuesto y perdido por fugas
2. **Verificación de restricciones**: Asegurar que las capacidades no se excedan y los inventarios se mantengan dentro de límites físicos
3. **Validación contra datos reales**: Comparar resultados con datos históricos de Holbox cuando estén disponibles

---
*Documento generado como parte de THESIS-001: Mathematical Model Deconstruction*
*Fecha: Agosto 2025*