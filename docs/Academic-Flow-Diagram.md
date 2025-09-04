# Diagrama de Flujo Académico del Modelo de Simulación

## Diagrama Conceptual del Sistema de Gestión de RSU - Isla Holbox

```mermaid
flowchart TD
    subgraph "ETAPA 1: GENERACIÓN POR FUENTES"
        A1[Hoteles<br/>$G_{hoteles}(t) = U_h \cdot \frac{O_{temporada}}{100} \cdot \frac{G_h}{1000}$]
        A2[Restaurantes<br/>$G_{restaurantes}(t) = U_r \cdot \frac{G_r}{1000}$]
        A3[Hogares<br/>$G_{hogares}(t) = P_{fijo} \cdot \frac{G_{hogar}}{1000}$]
        A4[Comercios<br/>$G_{comercios}(t) = U_c \cdot \frac{G_c}{1000}$]
        
        A1 --> B1[Generación Total<br/>$G_{total}(t) = \sum_j G_j(t)$]
        A2 --> B1
        A3 --> B1
        A4 --> B1
    end

    subgraph "COMPOSICIÓN Y SEPARACIÓN"
        B1 --> C1[Generación por Material<br/>$G_i(t) = \sum_j G_j(t) \cdot \frac{C_{i,j}}{100}$]
        
        C1 --> D1[Separación Mejorada<br/>$S_{mejorada,j} = \min(S_j + \sum \Delta S_{programa,j} \cdot I_{programa}, 95)$]
        
        D1 --> D2{Programas Activos?}
        D2 -->|Sí| D3[Educación: $\Delta S_{educación,j}$<br/>Incentivos: $\Delta S_{incentivos,j}$<br/>Contenedores: $\Delta S_{contenedores,j}$]
        D2 -->|No| D4[Separación Base: $S_j$]
        D3 --> E1
        D4 --> E1[Material Separado y Mezclado]
    end

    subgraph "ETAPA 2: RECOLECCIÓN Y LOGÍSTICA"
        E1 --> F1{Capacidad Suficiente?<br/>$Cap_{recolección} = V \cdot Cap_v \cdot T_v$}
        
        F1 -->|Sí| F2[Material Recolectado<br/>$M_{recolectado}(t) = G_{total}(t)$]
        F1 -->|No| F3[Déficit de Recolección<br/>$D_{recolección}(t) = G_{total}(t) - Cap_{recolección}$]
        
        F2 --> G1[Recuperación Informal<br/>$R_{informal,recolección,k}(t) = G_k(t) \cdot \frac{R_{informal,recolección}}{100}$]
        F3 --> F4[Material Recolectado<br/>$M_{recolectado}(t) = Cap_{recolección}$] --> G1
        
        G1 --> H1[Fugas en Recolección<br/>$F_{recolección}(t) = M_{recolectado}(t) \cdot \frac{L_{recolección}}{100}$]
        
        H1 --> I1[Inventario Vehículos<br/>$Inv_{vehículos}(t+1) = Inv_{vehículos}(t) + M_{transferencia}(t) - M_{entregado}(t)$]
    end

    subgraph "ETAPA 3: ESTACIÓN DE TRANSFERENCIA"
        I1 --> J1[Material Procesado<br/>$M_{procesado}(t) = \min(Inv_{transferencia}(t) + M_{entregado}(t), R_{transferencia})$]
        
        J1 --> K1[Recuperación Alta Calidad<br/>$R_{alta,k}(t) = \sum_j G_j(t) \cdot \frac{C_{k,j}}{100} \cdot \frac{S_{mejorada,j}}{100} \cdot \frac{R_{captura}}{100}$]
        
        J1 --> K2[Recuperación Baja Calidad<br/>$R_{baja,k}(t) = (M_{procesado,k}(t) - R_{alta,k}(t)) \cdot \frac{E_{planta,k}}{100}$]
        
        J1 --> L1{Valorización Habilitada?}
        
        L1 -->|Compostaje| L2[Compostaje<br/>$M_{compost}(t) = M_{procesado,orgánicos}(t) \cdot \frac{E_{compost}}{100}$<br/>Costo: $C_{compost}$ | Ingreso: $I_{compost}$]
        
        L1 -->|Biogás| L3[Biogás<br/>$M_{biogas}(t) = (M_{procesado,orgánicos}(t) - M_{compost}(t)) \cdot \frac{E_{biogas}}{100}$<br/>Costo: $C_{biogas}$ | Ingreso: $I_{biogas}$]
        
        L1 -->|Pirólisis| L4[Pirólisis<br/>$M_{pirólisis}(t) = M_{procesado,PET}(t) \cdot \frac{E_{pirólisis}}{100}$<br/>Costo: $C_{pirólisis}$ | Ingreso: $I_{pirólisis}$]
        
        K1 --> M1
        K2 --> M1
        L2 --> M1
        L3 --> M1
        L4 --> M1
        
        M1[Fugas en Transferencia<br/>$F_{transferencia}(t) = M_{procesado}(t) \cdot \frac{L_{transferencia}}{100}$]
        
        M1 --> N1[Material para Transporte<br/>$M_{salida}(t) = M_{procesado}(t) - \sum_k(R_{alta,k} + R_{baja,k}) - \sum M_{valorización} - F_{transferencia}$]
        
        N1 --> O1[Inventario Transferencia<br/>$Inv_{transferencia}(t+1) = Inv_{transferencia}(t) + M_{entregado}(t) - M_{procesado}(t)$]
    end

    subgraph "ETAPA 4: TRANSPORTE FINAL"
        O1 --> P1{Capacidad Transporte?<br/>$Cap_{transporte}$}
        
        P1 -->|Suficiente| P2[Material Transportado<br/>$M_{transportado}(t) = M_{salida}(t)$]
        P1 -->|Insuficiente| P3[Inventario Transporte<br/>$Inv_{transporte}(t+1) = Inv_{transporte}(t) + M_{salida}(t) - Cap_{transporte}$]
        
        P2 --> Q1[Fugas en Transporte<br/>$F_{transporte}(t) = M_{transportado}(t) \cdot \frac{L_{transporte}}{100}$]
        P3 --> P4[Material Transportado<br/>$M_{transportado}(t) = Cap_{transporte}$] --> Q1
    end

    subgraph "ETAPA 5: DISPOSICIÓN FINAL"
        Q1 --> R1[Material en Disposición<br/>$M_{llegada}(t) = M_{transportado}(t) - F_{transporte}(t)$]
        
        R1 --> S1[Recuperación Informal<br/>$R_{informal,disposición}(t) = M_{llegada}(t) \cdot prop_{valorizables} \cdot \frac{R_{informal,disposición}}{100}$]
        
        S1 --> T1[Fugas en Disposición<br/>$F_{disposición}(t) = M_{llegada}(t) \cdot \frac{L_{disposición}}{100}$]
        
        T1 --> U1[Material Final Dispuesto<br/>$M_{final}(t) = M_{llegada}(t) - R_{informal,disposición}(t) - F_{disposición}(t)$]
        
        U1 --> V1[Inventario Disposición<br/>$Inv_{disposición}(t+1) = Inv_{disposición}(t) + M_{final}(t)$]
    end

    subgraph "MODELO ECONÓMICO"
        W1[Costos Operativos<br/>$C_{total}(t) = M_{recolectado} \cdot C_{recolección} + M_{procesado} \cdot C_{transferencia} + M_{transportado} \cdot C_{transporte} + M_{llegada} \cdot C_{disposición}$]
        
        W2[Costos Valorización<br/>$C_{valorización}(t) = \sum M_{proc} \cdot C_{proc}$]
        
        W3[Costos Programas<br/>$C_{programas}(t) = C_{educación} + C_{incentivos} + C_{contenedores}$]
        
        W4[Ingresos Materiales<br/>$I_{materiales}(t) = \sum_k (R_{alta,k} + R_{baja,k}) \cdot I_{material,k}$]
        
        W5[Ingresos Valorización<br/>$I_{valorización}(t) = \sum M_{proc} \cdot I_{proc}$]
        
        W1 --> X1[Costo Neto Sistema<br/>$C_{neto}(t) = C_{total} + C_{valorización} + C_{programas} - I_{materiales} - I_{valorización}$]
        W2 --> X1
        W3 --> X1
        W4 --> X1
        W5 --> X1
    end

    subgraph "INDICADORES DE DESEMPEÑO (KPIs)"
        Y1[Eficiencia Recolección<br/>$KPI_{recolección} = \frac{M_{recolectado}}{G_{total}} \times 100$]
        
        Y2[Tasa Recuperación Total<br/>$KPI_{recuperación} = \frac{\sum_k(R_{alta,k} + R_{baja,k}) + \sum M_{valorización} + R_{informal,total}}{G_{total}} \times 100$]
        
        Y3[Tiempo Espera<br/>$KPI_{espera} = \frac{Inv_{transferencia}}{R_{transferencia}}$]
        
        Y4[Pérdidas Totales<br/>$KPI_{pérdidas} = \frac{\sum F_{etapa} + D_{recolección}}{G_{total}} \times 100$]
        
        Y5[Retorno Inversión<br/>$ROI = \frac{I_{total} - C_{programas}}{C_{programas}} \times 100$]
    end

    %% Conexiones principales del flujo
    V1 -.-> W1
    K1 -.-> W4
    K2 -.-> W4
    L2 -.-> W2
    L3 -.-> W2
    L4 -.-> W2
    L2 -.-> W5
    L3 -.-> W5
    L4 -.-> W5
    D3 -.-> W3
    
    X1 -.-> Y1
    X1 -.-> Y2
    O1 -.-> Y3
    F1 -.-> Y4
    W5 -.-> Y5

    %% Estilos
    classDef generacion fill:#e1f5fe
    classDef recoleccion fill:#f3e5f5
    classDef transferencia fill:#e8f5e8
    classDef transporte fill:#fff3e0
    classDef disposicion fill:#ffebee
    classDef economia fill:#f0f4c3
    classDef kpis fill:#e0f2f1
    classDef valorization fill:#f8bbd9
    classDef separation fill:#dcedc1

    class A1,A2,A3,A4,B1,C1 generacion
    class F1,F2,F3,F4,G1,H1,I1 recoleccion
    class J1,K1,K2,M1,N1,O1 transferencia
    class L1,L2,L3,L4 valorization
    class D1,D2,D3,D4 separation
    class P1,P2,P3,P4,Q1 transporte
    class R1,S1,T1,U1,V1 disposicion
    class W1,W2,W3,W4,W5,X1 economia
    class Y1,Y2,Y3,Y4,Y5 kpis
```

## Leyenda del Diagrama

### Símbolos y Notaciones

| Símbolo | Descripción |
|---------|-------------|
| $G_j(t)$ | Generación en fuente $j$ en día $t$ |
| $M_{proceso}(t)$ | Masa de material en proceso específico en día $t$ |
| $R_{tipo,k}(t)$ | Recuperación de tipo específico del material $k$ en día $t$ |
| $F_{etapa}(t)$ | Fugas en etapa específica en día $t$ |
| $Inv_{ubicación}(t)$ | Inventario en ubicación específica en día $t$ |
| $C_{proceso}$ | Costo unitario del proceso |
| $I_{proceso}$ | Ingreso unitario del proceso |
| $E_{proceso}$ | Eficiencia del proceso (%) |
| $Cap_{sistema}$ | Capacidad del sistema |

### Flujos Principales

1. **Flujo de Material**: Líneas sólidas muestran el flujo físico de residuos
2. **Flujo de Información**: Líneas punteadas muestran datos para cálculos económicos y KPIs
3. **Procesos de Decisión**: Rombos representan puntos de decisión basados en capacidades o configuraciones
4. **Procesos de Valorización**: Destacados en color especial, muestran procesos de economía circular

### Características del Modelo

- **Sistema Dinámico**: Cada ecuación depende del tiempo $t$ (30 días de simulación)
- **Conservación de Masa**: Todo material generado se contabiliza (recuperado, valorizado, dispuesto, o perdido)
- **Restricciones de Capacidad**: Capacidades físicas limitan el flujo en cada etapa
- **Inventarios Multi-etapa**: Acumulación temporal en vehículos, transferencia, transporte y disposición
- **Programas de Mejora**: Separación, valorización y programas educativos modifican tasas base
- **Modelo Económico Integral**: Costos e ingresos de todas las operaciones y programas

### Validación del Modelo

El diagrama permite verificar:
- **Balance de Masa**: $G_{total} = Material_{dispuesto} + Material_{recuperado} + Material_{valorizado} + Fugas_{totales}$
- **Restricciones Físicas**: Ningún flujo excede capacidades definidas
- **Coherencia Temporal**: Inventarios evolucionan correctamente día a día
- **Integración Económica**: Todos los costos e ingresos están contabilizados

---
*Diagrama generado como complemento del Capítulo 3: Formulación del Modelo de Simulación*
*Fecha: Agosto 2025*
*Parte de THESIS-001: Mathematical Model Deconstruction*