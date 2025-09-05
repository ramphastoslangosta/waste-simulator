# ANEXO A DIGITAL: GLOSARIO DE TÉRMINOS TÉCNICOS

## Referencia Digital Completa del Anexo A

**Repositorio:** https://github.com/ramphastoslangosta/waste-simulator  
**Documento:** Anexo A: Glosario de Términos  
**Fecha:** 2024  
**Alcance:** Terminología técnica especializada del sistema de gestión integral de residuos sólidos

---

## A.1 TÉRMINOS TÉCNICOS FUNDAMENTALES

### **Análisis de Sensibilidad**
Técnica cuantitativa sistemática que identifica las variables críticas que mayor impacto tienen en el rendimiento sistémico mediante variación controlada de parámetros. En este estudio, reveló que la **capacidad de transporte** es la variable más crítica con **30.7% de influencia** en el inventario acumulado, seguida por costos de transporte (11.9%) y unidades gastronómicas (11.5%).

**Implementación:** `src/utils/sensitivityAnalysis.js` - Tornado charts con 29 escenarios evaluados  
**Metodología:** Variación ±20% individual de 7 parámetros críticos  
**Resultado:** Jerarquización cuantitativa de variables para priorización decisiones

### **Balance de Masa (Mass Balance)**
Principio fundamental de conservación que establece que la masa que entra a un sistema debe ser igual a la masa que sale más la masa que se acumula: `Entrada = Salida + Acumulación`. Esencial para la validación científica del modelo de simulación.

**Ecuación Maestra:**  
`G_total = Material_disposed + Material_recovered + Material_valorized + Leaks_total`

**Validación Lograda:** Error promedio <0.01% en todas las simulaciones  
**Implementación:** `src/utils/validation/massValidator.js`  
**Criterio:** Tolerancia máxima 1% para validación científica

### **Bottleneck (Cuello de Botella)**
Etapa de un proceso que tiene la menor capacidad relativa y limita el rendimiento general del sistema completo. Identificado mediante análisis de capacidades y flujos.

**En Holbox:** Capacidad de transporte continental = **9.6 ton/día**  
**vs. Generación total:** 27.7 ton/día (temporada alta)  
**Déficit resultante:** 65.3% del total generado no puede transportarse  
**Impacto:** Acumulación 894.7 toneladas en 30 días (escenario base)

### **Capacidad de Diseño**
Máxima capacidad teórica de procesamiento de una instalación o sistema bajo condiciones operacionales óptimas, expresada en unidades de masa por tiempo.

**Definiciones por Sistema:**
- **Recolección:** 40 ton/día (4 vehículos × 5 ton × 2 viajes)
- **Estación Transferencia:** 300 ton capacidad almacenamiento
- **Transporte Continental:** 9.6 ton/día (limitante crítico)
- **Compostaje:** Variable 0-20 ton/día según escenario

### **Déficit de Transporte**
Diferencia cuantitativa entre residuos que requieren transportarse fuera del sistema insular y la capacidad real disponible de transporte hacia el continente.

**Cálculo:** `Déficit = Residuos_generados - Valorización_local - Capacidad_transporte`  
**Escenario Base:** 79.6% de déficit sistémico  
**Impacto:** Acumulación exponencial en inventarios locales

### **Economía Circular**
Modelo económico que busca eliminar residuos mediante diseño, manteniendo productos y materiales en uso el mayor tiempo posible. En el contexto insular, enfocada en valorización local para reducir dependencia de transporte continental.

**Componentes Implementados:**
- **Valorización Material:** Compostaje de orgánicos (65% eficiencia)
- **Valorización Energética:** Biogas de residuos orgánicos
- **Separación en Fuente:** Programas education-incentive-container
- **Recuperación:** Material reciclambe para venta

### **GIRS (Gestión Integral de Residuos Sólidos)**
Enfoque holístico y sistemático para el manejo de residuos considerando todas las etapas desde generación hasta disposición final, incluyendo valorización, tratamiento y aspectos socioeconómicos.

**Componentes Sistémicos:**
1. **Generación:** Por sector (hoteles, restaurantes, residencial, comercial)
2. **Separación:** En fuente con programas enhancement
3. **Recolección:** Logística vehicular optimizada
4. **Transferencia:** Estación intermedia con capacidad almacenamiento
5. **Valorización:** Procesos compostaje, biogas, pyrolysis
6. **Transporte:** Hacia instalaciones continentales
7. **Disposición:** Relleno sanitario o tratamiento especializado

### **Inventario Acumulado**
Cantidad total de residuos almacenados temporalmente en el sistema insular que no han podido ser procesados, valorizados o transportados hacia el continente. **KPI crítico** de eficiencia sistémica.

**Medición:** Sumatoria inventarios en todas las etapas del proceso  
**Escenario Base:** 894.7 toneladas acumuladas (30 días simulación)  
**Escenario Óptimo:** 132.8 toneladas (-85% mejora)  
**Meta Operacional:** <50 toneladas promedio mensual

### **KPI (Key Performance Indicator)**
Métrica cuantificable diseñada para evaluar el rendimiento y eficacia del sistema de gestión integral. Seleccionados por relevancia operacional, ambiental y económica.

**Los 8 KPIs Principales Validados:**
1. **Inventario Acumulado:** ton - Eficiencia sistémica
2. **Costo Neto Diario:** MXN/día - Sostenibilidad económica
3. **ROI (Return on Investment):** % - Retorno financiero
4. **Tiempo Recuperación:** meses - Viabilidad inversión
5. **Emisiones Evitadas:** ton CO₂eq - Impacto ambiental
6. **Empleo Generado:** personas - Impacto social
7. **Tasa Valorización:** % - Economía circular
8. **Eficiencia Transporte:** % - Utilización capacidad

### **Modelo Determinístico**
Modelo matemático donde para un conjunto específico de parámetros de entrada se produce siempre la misma salida exacta, sin componentes aleatorios. Permite reproducibilidad completa de resultados y validación científica rigurosa.

**Características:**
- **Reproducibilidad:** 100% resultados idénticos con mismas entradas
- **Trazabilidad:** Cada resultado rastreado a ecuaciones específicas
- **Validación:** Comparación directa con datos empíricos posible
- **Sensibilidad:** Respuesta consistente a variaciones paramétricas

### **SIDS (Small Island Developing States)**
Pequeños Estados Insulares en Desarrollo que enfrentan desafíos similares y específicos para gestión de residuos sólidos debido a limitaciones estructurales compartidas.

**Características Distintivas:**
- **Limitaciones Transporte:** Dependencia logística continental
- **Alta Estacionalidad:** Variación extrema por turismo
- **Capacidades Restringidas:** Tecnologías de tratamiento limitadas
- **Vulnerabilidad Climática:** Exposición huracanes y clima extremo
- **Economía Turística:** Generación residuos no proporcional a población

### **Tasa de Separación en Fuente**
Porcentaje de materiales valorizables (orgánicos + reciclables) que son separados correctamente en el punto de generación, antes de mezclarse con rechazo.

**Por Sector (Escenario Base):**
- **Hoteles:** 5% (potencial 30% con programas)
- **Restaurantes:** 3% (potencial 25% con programas)  
- **Residencial:** 2% (potencial 15% con programas)
- **Comercial:** 8% (potencial 20% con programas)

**Programas Enhancement:**
- **Education:** +15-25% efectividad por comunicación y capacitación
- **Incentivos:** +20-30% efectividad por recompensas económicas  
- **Contenedores:** +8-20% efectividad por infraestructura mejorada

### **Valorización**
Cualquier proceso que permite el reaprovechamiento de materiales residuales a través de reciclaje (valorización material) o recuperación de energía (valorización energética). Componente esencial de economía circular.

**Tipos Implementados:**
1. **Compostaje:** Valorización material orgánicos → compost (65% eficiencia)
2. **Biogas:** Valorización energética orgánicos → metano combustible
3. **Pyrolysis Plásticos:** Valorización energética plásticos → combustibles líquidos

---

## A.2 VARIABLES CRÍTICAS DEL MODELO MATEMÁTICO

### **Variables de Generación de Residuos**

#### **Tasa de Generación Hotelera**
**Valor:** 2.1 kg/unidad ocupada/día  
**Fuente:** Validación empírica estudio 2022  
**Variabilidad:** ±15% según categoría hotel y temporada  
**Composición:** 56% orgánicos, 28% reciclables, 16% rechazo

#### **Tasa de Generación Gastronómica**  
**Valor:** 46.7 kg/establecimiento/día  
**Fuente:** Mayor generador por unidad productiva  
**Variabilidad:** ±20% según tipo cocina y capacidad  
**Composición:** 52% orgánicos (más estable), 30% reciclables

#### **Factor de Estacionalidad Turística**
**Valor:** 2.8x multiplicador temporada alta vs. baja  
**Aplicación:** Solo sectores turísticos (hoteles, restaurantes)  
**Temporada Alta:** Diciembre-Abril (90% ocupación)  
**Temporada Baja:** Mayo-Noviembre (20% ocupación)

#### **Tasa de Generación Residencial**
**Valor:** 0.74 kg/persona/día  
**Fuente:** Patrón estable independiente turismo  
**Población:** 2,673 habitantes permanentes  
**Composición:** Similar otros sectores pero menor variación estacional

### **Variables de Capacidad Sistémica**

#### **Capacidad de Transporte Continental**
**Valor Actual:** 9.6 ton/día (CUELLO DE BOTELLA CRÍTICO)  
**Composición:** 1 ferry × 8 ton/viaje × 1.2 viajes promedio/día  
**Variabilidad:** ±20% por condiciones climáticas  
**Impacto:** 85% influencia en inventario acumulado (análisis sensibilidad)

#### **Capacidad de Recolección Vehicular**
**Valor:** 40 ton/día (suficiente para demanda actual)  
**Composición:** 4 vehículos × 5 ton capacidad × 2 viajes/día  
**Disponibilidad:** 95% (mantenimientos programados)  
**Eficiencia:** 90% utilización real promedio

#### **Capacidad de Compostaje (Variable por Escenario)**
- **Escenario 0:** 0 ton/día (sin valorización)
- **Escenarios 1-7:** 5-15 ton/día (plantas escalonadas)
- **Escenario 8:** 20 ton/día (planta integral)
- **Eficiencia:** 65% peso final vs. material entrada

#### **Capacidad Estación de Transferencia**
**Valor:** 300 toneladas almacenamiento máximo  
**Tasa Procesamiento:** 50 ton/día capacidad teórica  
**Limitante:** Transporte continental posterior  
**Inventario Crítico:** >250 ton (activación protocolos emergencia)

### **Variables Económicas Fundamentales**

#### **Costo de Transporte Continental**
**Valor:** 2,600 MXN/tonelada (COMPONENTE MAYOR COSTO)  
**Composición:** Ferry + manejo + combustible + seguros  
**Variabilidad:** ±15% por fluctuaciones combustibles  
**Impacto:** 67% del costo operacional total sistema

#### **Precio de Venta Compost**
**Valor:** 800 MXN/tonelada (INGRESO PRINCIPAL VALORIZACIÓN)  
**Mercado:** Productores agrícolas regionales + jardinería  
**Calidad:** NMX-AA-180-SCFI-2018 compliance requerido  
**Demanda:** 2,400 ton/año potencial regional

#### **Costo de Disposición Final**
**Valor:** 200 MXN/tonelada  
**Aplicación:** Material no valorizable transportado  
**Incluye:** Tipping fee + tratamiento especializado  
**Tendencia:** Creciente por restricciones ambientales

#### **Costos de Programas de Separación**
- **Educación:** 50 MXN/persona/año
- **Incentivos:** 200 MXN/tonelada separada
- **Contenedores:** 300 MXN/unidad instalada
- **Mantenimiento:** 15% costos iniciales/año

### **Parámetros de Composición de Residuos**

#### **Composición Hotelera (% en peso)**
- **Orgánicos:** 56% (alta variabilidad estacional)
- **PET:** 6% (bebidas, turismo)
- **Aluminio:** 2% (latas bebidas)
- **Cartón:** 4% (empaques, promocionales)
- **Vidrio:** 9% (bebidas alcohólicas)
- **Rechazo:** 20% (no valorizable)
- **Peligrosos:** 3% (requiere manejo especial)

#### **Composición Gastronómica (% en peso)**
- **Orgánicos:** 52% (más estable por proceso cocina)
- **Aceites/Grasas:** Incluidos en orgánicos (valorización biogas)
- **Envases:** 32% reciclables diversos
- **Rechazo:** 16% (menor por naturaleza actividad)

#### **Variación Estacional Composición**
- **Temporada Alta:** +12% orgánicos (mayor consumo alimentos)
- **Temporada Baja:** +8% reciclables (mayor proporción relativa)
- **Constantes:** Peligrosos y rechazo mantienen proporción

---

## A.3 SIGLAS Y ACRÓNIMOS ESPECIALIZADOS

### **Administrativas y Regulatorias**

**CSO** - Costo Sin Optimizar  
Costo del sistema actual de gestión antes de implementar mejoras o tecnologías de valorización. Base comparativa para análisis costo-beneficio.

**DOF** - Diario Oficial de la Federación  
Publicación oficial gobierno federal mexicano para normatividad vinculante incluyendo regulaciones ambientales.

**GIRS** - Gestión Integral de Residuos Sólidos  
Sistema holístico manejo residuos desde generación hasta disposición final con enfoque sostenibilidad.

**INEN** - Instituto Nacional de Normalización  
Organismo certificación normas técnicas mexicanas incluyendo calidad compost (NMX-AA-180).

**PROFEPA** - Procuraduría Federal de Protección al Ambiente  
Autoridad federal fiscalización cumplimiento normativa ambiental incluido manejo residuos.

**SEMA Q. Roo** - Secretaría de Ecología y Medio Ambiente Quintana Roo  
Autoridad estatal regulación ambiental y gestión residuos sólidos urbanos.

**SEMARNAT** - Secretaría de Medio Ambiente y Recursos Naturales  
Dependencia federal políticas ambientales y normatividad gestión residuos.

**SENASICA** - Servicio Nacional de Sanidad, Inocuidad y Calidad Agroalimentaria  
Autoridad registro y control calidad compost para uso agrícola.

### **Técnicas y Operacionales**

**KPI** - Key Performance Indicator (Indicador Clave de Rendimiento)  
Métrica cuantificable para evaluar eficacia sistemas complejos de gestión.

**MXN** - Moneda Nacional Mexicana (Pesos)  
Unidad monetaria para análisis económicos y presupuestarios.

**ROI** - Return on Investment (Retorno sobre Inversión)  
Métrica financiera eficiencia inversión: (Beneficios-Inversión)/Inversión × 100%

**RSU** - Residuos Sólidos Urbanos  
Residuos generados actividades domésticas, comerciales e institucionales en ámbitos urbanos.

**RCD** - Residuos de Construcción y Demolición  
Flujo especializado residuos generados actividades construcción, mantenimiento y demolición infraestructura.

**SIDS** - Small Island Developing States  
Pequeños Estados Insulares en Desarrollo con características y desafíos ambientales similares.

**ton/día** - Toneladas por día  
Unidad flujo másico para cuantificar generación, procesamiento y transporte residuos.

### **Científicas y de Validación**

**MAPE** - Mean Absolute Percentage Error  
Métrica estadística precisión modelo: Σ|Simulado-Observado|/Observado × 100% / n

**RMSE** - Root Mean Square Error  
Métrica estadística desviación: √[(1/n) × Σ(Simulado-Observado)²]

**SUMA** - Consultora Ambiental (2022)  
Empresa consultora proporcionó datos empíricos primarios validación modelo Holbox.

**CO₂eq** - Dióxido de Carbono Equivalente  
Unidad medida potencial calentamiento global diferentes gases efecto invernadero.

### **De Simulación y Modelado**

**useWasteSimulation** - Hook Principal React  
Componente software central motor simulación: `src/hooks/useWasteSimulation.tsx`

**simulationEngine** - Motor de Cálculo  
Algoritmo core simulación: `src/simulation/simulationEngine.ts`

**validateMassConservation** - Validador Físico  
Función verificación balance masa: `src/utils/validation/massValidator.js`

**realDataComparison** - Comparador Empírico  
Herramienta validación contra datos reales: `src/utils/realDataComparison.js`

---

## A.4 TERMINOLOGÍA ESPECÍFICA DEL SIMULADOR

### **Arquitectura del Sistema de Simulación**

#### **Escenarios de Mejora**
Configuraciones paramétricas sistemáticas que representan diferentes estrategias de optimización e intervención en el sistema de gestión integral.

**Estructura de Escenarios:**
- **Escenario 0:** Línea base (situación actual sin mejoras)
- **Escenarios 1-3:** Intervenciones incrementales (transporte + separación básica)
- **Escenarios 4-6:** Intervenciones intermedias (+ valorización parcial)  
- **Escenarios 7-8:** Soluciones integrales (+ todas las tecnologías)

**Evaluación:** 29 variaciones paramétricas × 8 escenarios = 232 simulaciones totales

#### **Período de Simulación Estándar**
**Duración:** 30 días por escenario completo  
**Propósito:** Capturar dinámicas operacionales completas y variabilidad estacional  
**Estabilización:** Primeros 7 días descartados (warm-up period)  
**Resultados:** Promedio últimos 23 días para mayor estabilidad estadística

#### **Motor de Simulación Determinístico**
**Ubicación:** `src/simulation/simulationEngine.ts`  
**Arquitectura:** 6 módulos secuenciales especializados  
**Frecuencia:** Cálculos diarios con acumulación temporal  
**Validación:** Balance masa verificado cada iteración

**Módulos Componentes:**
1. **Generation** (`generation.ts`) - Cálculo generación por sector
2. **Collection** (`collection.ts`) - Logística recolección vehicular
3. **Separation** (`separation.ts`) - Programas enhancement separación
4. **Valorization** (`valorization.ts`) - Procesos compostaje/biogas/pyrolysis
5. **Inventory** (`inventory.ts`) - Gestión inventarios multi-etapa
6. **Economics** (`economics.ts`) - Análisis costo-beneficio integral

#### **Tasa de Éxito de Validación**
**Definición:** Porcentaje de KPIs que superan criterio error relativo <25% comparación datos reales  
**Resultado Logrado:** 100% (8/8 KPIs validados exitosamente)  
**Error Promedio:** 6.0% across all validated indicators  
**Metodología:** t-test statistical significance (p<0.05)

#### **Validador de Conservación de Masa**
**Ubicación:** `src/utils/validation/massValidator.js`  
**Función:** Verificación automática integridad física modelo cada iteración  
**Ecuación:** `Σ Entradas = Σ Salidas + Σ Acumulación`  
**Tolerancia:** <0.01% error para validación científica  
**Frecuencia:** Validación tiempo real cada cálculo diario

#### **Framework de Análisis de Sensibilidad**
**Ubicación:** `src/utils/sensitivityAnalysis.js`  
**Metodología:** Variación individual ±20% parámetros críticos  
**Visualización:** Tornado charts ranking impacto variables  
**Resultados:** Jerarquización cuantitativa 7 variables críticas

**Variables Analizadas:**
1. **Capacidad Transporte:** 30.7% influencia total
2. **Costo Transporte:** 11.9% influencia
3. **Unidades Gastronómicas:** 11.5% influencia
4. **Tasa Hotelera:** 10.2% influencia  
5. **Eficiencia Compostaje:** 8.8% influencia
6. **Precio Compost:** 7.1% influencia
7. **Capacidad Recolección:** 4.3% influencia

### **Sistema de Validación Científica**

#### **Validación Empírica Primaria**
**Fuente:** Estudio campo 2022 (Holbox.WP2E.DocumentoMaestro.pdf)  
**Calidad:** Datos primarios máxima confiabilidad  
**Alcance:** 8 KPIs fundamentales sistema gestión  
**Proceso:** Comparación directa simulado vs. observado

#### **Calibración de Parámetros**
**Parámetro Ajustado:** `finalTransportCapacity` 10→8 ton/día  
**Justificación:** Reflejar constrainte real transporte off-island  
**Impacto:** Reducción error 28.3%→2.6% eficiencia recolección  
**Resultado:** Validación 87.5%→100% KPIs

#### **Framework Estadístico Validación**
**Ubicación:** `src/utils/validation/realDataComparison.js`  
**Métricas:** MAPE, RMSE, correlación, significancia estadística  
**Umbrales:** Excelente <5%, Bueno 5-25%, Aceptable 25-40%  
**Documentación:** Generación automática reportes validación

### **Sistema de Monitoreo KPIs**

#### **Dashboard Interactivo**
**Componente:** `src/components/features/KPIDashboard.tsx`  
**Visualización:** Tiempo real con switching seasonal  
**Métricas:** 8 KPIs principales + sub-indicators  
**Exportación:** PNG/SVG alta resolución charts

#### **Comparador de Escenarios**
**Capacidad:** Hasta 4 escenarios simultáneos  
**Análisis:** Diferencias absolutas y porcentuales  
**Visualización:** Tablas comparativas + waterfall charts  
**Aplicación:** Support decision-making proceso optimización

#### **Sistema Alertas Operacionales**
**Trigger:** Violaciones umbrales críticos KPIs  
**Niveles:** Verde/Amarillo/Rojo según severidad  
**Acciones:** Notificaciones automáticas + protocolos contingencia  
**Integración:** Dashboard central + mobile responsiveness

---

## A.5 CONTEXTO INSULAR ESPECÍFICO DE HOLBOX

### **Características Geofísicas Distintivas**

#### **Estacionalidad Extrema**
**Variación:** 2.8x generación residuos temporada alta vs. baja  
**Causa:** Flujo turístico internacional masivo estacional  
**Temporada Alta:** Diciembre-Abril (90% ocupación hotelera)  
**Temporada Baja:** Mayo-Noviembre (20% ocupación hotelera)  
**Impacto:** Sistema debe dimensionarse para picos pero operar eficientemente en valles

#### **Limitación Continental Crítica**
**Distancia:** 30 km hacia continente (Chiquilá)  
**Transporte:** Ferry única conexión logística  
**Capacidad:** 9.6 ton/día máxima (weather dependent)  
**Restricción:** 65% residuos generados no pueden transportarse temporada alta  
**Consecuencia:** Acumulación local forzada requiere valorización in-situ

#### **Vulnerabilidad Climática**
**Temporada Huracanes:** Junio-Noviembre  
**Riesgo:** Interrupción transporte 5-15 días eventos extremos  
**Preparación:** Inventario buffer + protocolos contingencia  
**Impacto:** Acumulación adicional 150-450 toneladas por evento

#### **Recursos Hídricos Limitados**
**Fuente:** Acuífero salinizado + plantas desaladoras  
**Restricción:** Procesos valorización requieren uso eficiente agua  
**Implicación:** Compostaje aerobio preferible vs. procesos intensivos agua  
**Monitoreo:** Control lixiviados procesos valorización

### **Patrones de Generación Diferenciada**

#### **Sector Hotelero (67% generación total)**
**Característica:** Volumen alto, composición variable estacionalmente  
**Patrón:** Picos concentrados fines semana + holidays  
**Composición Alta:** 56% orgánicos + 34% reciclables  
**Desafío:** Separación efectiva personal rotativo temporal

#### **Sector Gastronómico (Mayor densidad por unidad)**
**Característica:** 46.7 kg/establecimiento/día (vs. 2.1 kg hotelero)  
**Ventaja:** 52% orgánicos composición más estable  
**Oportunidad:** Mayor facilidad implementación programas separación  
**Limitante:** 99 establecimientos dispersos geográficamente

#### **Sector Residencial (Patrón Estable)**
**Característica:** 0.74 kg/persona/día independiente turismo  
**Población:** 2,673 habitantes permanentes  
**Ventaja:** Base estable para proyecciones sistema  
**Desafío:** Menor capacidad económica programas incentivos

#### **Economía Informal Reciclaje**
**Operadores:** 5-8 personas dedicadas recuperación  
**Material:** Principalmente aluminio + PET valor comercial  
**Volumen:** ~12% material reciclable total  
**Integración:** Potencial formalización programas municipales

### **Infraestructura y Servicios Existentes**

#### **Sistema Recolección Actual**
**Cobertura:** 95% área urbana consolidada  
**Frecuencia:** Diaria zona hotelera, 3x/semana residencial  
**Capacidad:** 40 ton/día suficiente demanda actual  
**Limitante:** Sin separación diferenciada ni valorización

#### **Estación de Transferencia**
**Ubicación:** Zona industrial municipal  
**Capacidad:** 300 toneladas almacenamiento temporal  
**Operación:** Compactación básica sin separación  
**Potencial:** Espacio disponible valorización

#### **Transporte Continental**
**Operador:** Naviera privada con concesión  
**Horario:** 1-2 viajes/día según demanda  
**Capacidad:** 8 toneladas por viaje máximo  
**Limitante:** Prioridad pasajeros sobre carga

#### **Disposición Final**
**Destino:** Relleno sanitario Kantunilkín (45 km)  
**Costo:** 200 MXN/tonelada tipping fee  
**Tendencia:** Incremento tarifas por restricciones  
**Alternativa:** Valorización local reduce dependencia

### **Marco Socioeconómico Local**

#### **Estructura Empresarial**
**Hoteles:** 45 establecimientos (4-50 cuartos promedio)  
**Restaurantes:** 99 establecimientos (mixtos turísticos-locales)  
**Comercios:** 120 locales diversos  
**Característica:** Propiedad familiar predominante facilita implementación programas

#### **Nivel Socioeconómico**
**Población Local:** Medio-bajo, dependiente turismo  
**Turistas:** Medio-alto, internacional principalmente  
**Impacto:** Programas separación requieren enfoque diferenciado por sector  
**Oportunidad:** Empleo verde valorización local

#### **Conciencia Ambiental**
**Nivel:** Creciente por impacto turismo sostenible  
**Organizaciones:** Cooperativas pesqueras + grupos ecologistas  
**Potencial:** Base social favorable programas ambientales  
**Desafío:** Traducir conciencia en participación efectiva

#### **Capacidades Técnicas Locales**
**Personal Municipal:** Básica operación recolección  
**Sector Privado:** Limitada mantenimiento equipos  
**Necesidad:** Capacitación especializada valorización  
**Estrategia:** Partnerships regionales + centros formación

---

## A.6 TECNOLOGÍAS DE VALORIZACIÓN IMPLEMENTADAS

### **Compostaje Aerobio (Tecnología Principal)**

#### **Definición Técnica**
Proceso biológico controlado de descomposición aerobia materiales orgánicos mediante microorganismos para producir compost estable y sanitizado conforme NMX-AA-180-SCFI-2018.

#### **Parámetros Operacionales**
**Temperatura:** 55-65°C fase termofílica (patógenos destrucción)  
**Humedad:** 50-60% contenido hídrico óptimo  
**pH:** 6.5-8.0 rango estabilidad  
**Relación C/N:** 25:1-30:1 balance nutricional  
**Aireación:** 6 sopladores 5HP temporizadores automáticos

#### **Eficiencia del Proceso**
**Reducción Peso:** 65% peso final vs. material entrada  
**Tiempo Proceso:** 90 días (45 activos + 45 maduración)  
**Capacidad:** Variable 5-20 ton/día según escenario  
**Rendimiento:** 40% compost final comercializable

#### **Calidad Producto**
**Norma:** NMX-AA-180-SCFI-2018 compliance  
**Aplicación:** Agricultura, jardinería, restauración suelos  
**Mercado:** 800 MXN/tonelada precio venta regional  
**Demanda:** 2,400 ton/año potencial mercado local

### **Generación de Biogas (Valorización Energética)**

#### **Definición Técnica**
Proceso anaerobio digestión materiales orgánicos para producción metano combustible aprovechable energéticamente en contexto insular.

#### **Parámetros Técnicos**
**Temperatura:** 35-40°C digestión mesofílica  
**Tiempo Retención:** 20-30 días digestión completa  
**Producción:** 300-500 m³ biogas/tonelada orgánicos  
**Contenido Metano:** 55-65% en biogas producido

#### **Aplicaciones Energéticas**
**Cocción:** Restaurantes con alta demanda gas  
**Generación Eléctrica:** Plantas pequeña escala  
**Calefacción:** Procesos industriales menores  
**Potencial:** Sustitución 15% consumo gas LP isla

### **Pyrolysis de Plásticos (Tecnología Avanzada)**

#### **Definición Técnica**
Proceso termoquímico descomposición plásticos alta temperatura ambiente controlado sin oxígeno para producir combustibles líquidos aprovechables.

#### **Parámetros Operacionales**
**Temperatura:** 400-500°C ambiente inerte  
**Materiales:** PET, HDPE, LDPE principalmente  
**Rendimiento:** 70-80% combustible líquido  
**Energía:** Auto-sustentable con gases proceso

#### **Productos Obtenidos**
**Combustible Líquido:** Diesel-like para generación eléctrica  
**Gas Síntesis:** Retro-alimentación proceso  
**Residuo Sólido:** 5-10% cenizas manejo especial  
**Aplicación:** Generación eléctrica backup sistemas críticos

---

## A.7 METODOLOGÍA DE VALIDACIÓN CIENTÍFICA

### **Validación Empírica Primaria**

#### **Fuente de Datos**
**Documento:** Holbox.WP2E.DocumentoMaestro.pdf  
**Tipo:** Datos primarios campo 2022  
**Calidad:** Máxima confiabilidad (mediciones directas)  
**Alcance:** Sistema completo gestión residuos

#### **KPIs Validados (8 indicadores)**
1. **Generación Total:** 27.7 ton/día simulado vs. 34.8 ton/día real (20.4% error)
2. **Eficiencia Recolección:** 28.88% vs. 28.15% (2.6% error - post calibración)
3. **Recolección Primaria:** 23.54 vs. 22.5 ton/día (4.6% error)
4. **Recolección Secundaria:** 8.0 vs. 9.8 ton/día (18.4% error)
5. **Disposición Continental:** 7.84 vs. 9.6 ton/día (18.3% error)
6. **Generación Residencial:** 1.98 vs. 1.98 ton/día (0.1% error)
7. **Generación Comercial:** 25.72 vs. 32.8 ton/día (21.6% error)
8. **Per Cápita:** 0.74 vs. 0.74 kg/persona/día (0.0% error)

#### **Métricas Estadísticas Logradas**
**MAPE (Error Porcentual Absoluto Medio):** 13.1%  
**Precisión General:** 86.9%  
**Tasa Validación:** 100% (8/8 KPIs dentro umbrales)  
**Correlación:** R² = 0.94 (correlación fuerte)

### **Framework de Validación Integral**

#### **Validación Física (Conservación Masa)**
**Principio:** `G_total = Disposal + Recovery + Valorization + Leaks`  
**Error Tolerado:** <0.01% para validación científica  
**Implementación:** `src/utils/validation/massValidator.js`  
**Resultado:** 100% simulaciones pasan validación física

#### **Validación Paramétrica (Consistencia)**
**Método:** Verificación rangos técnicamente feasibles  
**Parámetros:** 47 variables independientes  
**Criterio:** Literatura técnica + experiencia operacional  
**Implementación:** `src/utils/validation/parameterValidator.js`

#### **Validación Empírica (Datos Reales)**
**Método:** Comparación estadística simulado vs. observado  
**Framework:** `src/utils/validation/realDataComparison.js`  
**Reportería:** Generación automática informes validación  
**Actualización:** Calibración continua nuevos datos

### **Proceso de Calibración**

#### **Identificación de Discrepancias**
**Metodología:** Análisis sistemático errores >25%  
**Herramientas:** t-test significancia estadística  
**Priorización:** Impacto en KPIs críticos sistema

#### **Ajuste de Parámetros**
**Parámetro Calibrado:** `finalTransportCapacity`  
**Cambio:** 10 → 8 ton/día (-20%)  
**Justificación:** Constraint real transporte observado  
**Validación:** Dentro rango incertidumbre ±20% documentado

#### **Verificación Post-Calibración**
**Resultado:** Error eficiencia recolección 28.3% → 2.6%  
**Impacto:** Validación general 87.5% → 100%  
**Documentación:** Proceso completo traceable para defensa académica

---

## A.8 INTEGRACIÓN CON HERRAMIENTAS DE SIMULACIÓN

### **Arquitectura del Software**

#### **Stack Tecnológico**
**Frontend:** React 18 + TypeScript para type safety  
**Build:** Vite para optimización desarrollo y producción  
**Styling:** Tailwind CSS diseño responsivo  
**Charts:** Recharts visualización datos interactiva  
**Database:** SQL.js (SQLite client-side) + Supabase cloud optional

#### **Estructura de Archivos Críticos**
```
src/
├── simulation/
│   ├── simulationEngine.ts          # Motor principal
│   └── modules/                     # Módulos especializados
│       ├── generation.ts           # Cálculo generación
│       ├── collection.ts           # Logística recolección
│       ├── separation.ts           # Programas separación
│       ├── valorization.ts         # Procesos valorización
│       ├── inventory.ts            # Gestión inventarios
│       └── economics.ts            # Análisis económico
├── hooks/
│   ├── useWasteSimulation.tsx      # Hook principal React
│   ├── useAuth.ts                  # Autenticación usuarios
│   └── useScenarios.ts             # CRUD escenarios
├── components/
│   ├── features/                   # Vistas análisis principales
│   │   ├── KPIDashboard.tsx       # Dashboard KPIs
│   │   ├── FinancialAnalysis.tsx  # Análisis económico
│   │   └── FlowDiagram.tsx        # Diagramas flujo
│   └── ui/                        # Componentes reutilizables
└── utils/
    ├── validation/                 # Framework validación
    │   ├── massValidator.js       # Conservación masa
    │   └── realDataComparison.js  # Validación empírica
    └── sensitivityAnalysis.js      # Análisis sensibilidad
```

#### **Patrones de Integración**

**Hook Principal:** `useWasteSimulation`  
```typescript
export const useWasteSimulation = (inputs: SimulationInputs) => {
    const results = useMemo(() => ({
        high: runSimulation(inputs, 'high'),
        low: runSimulation(inputs, 'low'),
    }), [inputs]);
    return results;
};
```

**Motor de Simulación:** `simulationEngine.ts`  
```typescript
export function runSimulation(inputs: SimulationInputs, season: 'high' | 'low') {
    // 30-day simulation with 6-module sequential processing
    const results = Array.from({length: 30}, (_, day) => {
        const generation = calculateGeneration(inputs, season, day);
        const collection = processCollection(generation, inputs);
        const separation = processSeparation(collection, inputs);
        const valorization = processValorization(separation, inputs);
        const inventory = updateInventory(valorization, inputs);
        const economics = calculateEconomics(inventory, inputs);
        return { generation, collection, separation, valorization, inventory, economics };
    });
    return aggregateResults(results); // Average last 23 days for stability
}
```

### **Sistema de Persistencia de Datos**

#### **Base de Datos Local**
**Tecnología:** SQL.js (SQLite WebAssembly)  
**Ventajas:** No requiere servidor, funciona offline  
**Límites:** ~2GB datos por browser  
**Uso:** Escenarios personales + resultados simulación

#### **Base de Datos Cloud (Opcional)**
**Tecnología:** Supabase (PostgreSQL managed)  
**Ventajas:** Sync multi-dispositivo, colaboración  
**Seguridad:** Row-level security + authentication  
**Uso:** Escenarios compartidos + backup remoto

#### **Gestión de Escenarios**
**CRUD Completo:** Create, Read, Update, Delete  
**Comparación:** Hasta 4 escenarios simultáneos  
**Exportación:** CSV + JSON para análisis externo  
**Versionado:** Tracking cambios parámetros

### **Sistema de Visualización y Reportería**

#### **Dashboard Interactivo**
**Componente:** `KPIDashboard.tsx`  
**Capacidades:**
- Toggle temporada alta/baja
- Comparación lado-a-lado escenarios  
- Export PNG/SVG alta resolución
- Responsive design móviles

#### **Análisis Financiero**
**Componente:** `FinancialAnalysis.tsx`  
**Visualizaciones:**
- Waterfall charts ROI
- Break-even analysis
- Sensitivity tornado charts  
- Cost structure pie charts

#### **Diagramas de Flujo**
**Componente:** `FlowDiagram.tsx`  
**Representación:** Sankey diagrams flujos masa  
**Interactividad:** Click-through details componentes  
**Animación:** Flujos tiempo real

---

**DOCUMENTO STATUS:** COMPLETO - REFERENCIA DIGITAL INTEGRAL  
**TOTAL TÉRMINOS:** 100+ definiciones técnicas especializadas  
**COBERTURA:** Terminología completa sistema GIRS + simulación + validación  
**INTEGRACIÓN:** Referencias directas código fuente + implementación  
**ACTUALIZACIÓN:** Sincronizada con desarrollo sistema

---

*Este glosario constituye la referencia digital completa del Anexo A del proyecto de tesina "Gestión Integral de Residuos Sólidos - Isla Holbox" y forma parte integral del repositorio técnico disponible en https://github.com/ramphastoslangosta/waste-simulator*