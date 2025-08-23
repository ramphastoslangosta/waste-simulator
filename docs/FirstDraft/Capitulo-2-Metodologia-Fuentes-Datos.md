# Capítulo 2: Metodología y Fuentes de Datos

## 2.1 Metodología de Investigación

### 2.1.1 Diseño del Estudio

Esta investigación emplea un diseño basado en simulación, estructurado en cuatro fases secuenciales: caracterización, modelado, validación y análisis de escenarios. El diseño metodológico integra datos primarios del sistema real con modelado matemático computacional para desarrollar y validar un modelo de simulación del sistema de gestión de residuos sólidos de Isla Holbox.

**Figura 2.1: Diagrama de Flujo Metodológico de la Investigación**

```
FASE 1: CARACTERIZACIÓN DEL SISTEMA Y ADOPCIÓN DE DATOS PRIMARIOS
┌────────────────────────────────────────────────────────────────┐
│ • Participación en diagnóstico técnico SUEMA (2022)           │
│ • Adopción de datos primarios del estudio profesional         │
│ • Mapeo de stakeholders y caracterización operacional         │
│ • Análisis de documentación existente                         │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           ▼
FASE 2: DESARROLLO DEL MODELO Y PARAMETRIZACIÓN DEL ESCENARIO BASE
┌────────────────────────────────────────────────────────────────┐
│ • Formulación matemática del sistema                          │◄──┐
│ • Implementación computacional React/TypeScript               │   │
│ • Parametrización del escenario base                          │   │
│ • Documentación sistemática de fuentes                        │   │
└──────────────────────────┬─────────────────────────────────────┘   │
                           │                                         │
                           ▼                                         │
FASE 3: VALIDACIÓN EMPÍRICA Y CALIBRACIÓN DEL MODELO                │
┌────────────────────────────────────────────────────────────────┐   │
│ • Validación estadística inicial contra datos SUEMA (2022)    │   │
│ • Calibración mínima de parámetros críticos                   │───┘
│ • Análisis comprehensivo de sensibilidad                      │    
│ • Documentación de limitaciones y supuestos                   │    
│ • Establecimiento de credibilidad para planificación          │    
└──────────────────────────┬─────────────────────────────────────┘    
                           │                                          
                           ▼                                          
FASE 4: ANÁLISIS DE ESCENARIOS Y PROPUESTA DE MEJORA
┌────────────────────────────────────────────────────────────────┐
│ • Diseño de escenarios basado en análisis de sensibilidad     │
│ • Evaluación de viabilidad técnica y económica                │
│ • Recomendaciones de política pública                         │
│ • Hoja de ruta de implementación                              │
└────────────────────────────────────────────────────────────────┘

LEYENDA:
────► Flujo secuencial principal
◄─── Retroalimentación de calibración (validación → parametrización)
```

**Enfoque Metodológico Integrado**

El diseño metodológico se justifica por la naturaleza compleja y multidisciplinaria de los sistemas de gestión de residuos, que requieren:

- **Rigor Cuantitativo**: Para desarrollo de modelos matemáticos precisos y validación estadística
- **Integración de Datos Empíricos**: Para parametrización basada en mediciones reales del sistema
- **Validación Empírica**: Para establecer credibilidad y aplicabilidad práctica
- **Análisis Prospectivo**: Para diseñar escenarios de mejora basados en evidencia

### 2.1.2 Fases de la Investigación

#### Fase 1: Caracterización del Sistema y Adopción de Datos Primarios (Meses 1-3)

**Objetivos**:
- Documentar estructura y operación actual del sistema de gestión de residuos
- Adoptar datos primarios del estudio profesional SUEMA para fundamentar la investigación
- Identificar actores clave, flujos de materiales, y procesos operacionales

**Actividades Principales**:

1. **Adopción de Datos Primarios mediante Participación en Estudio Profesional**
   
   La caracterización del sistema se fundamenta en los datos primarios recopilados durante el diagnóstico técnico "Documento Maestro del Sistema de Residuos" (SUEMA, 2022). Se participó en dicho estudio como observador invitado, lo que incluyó una visita técnica a la estación de transferencia de Holbox (julio 2022), una visita al sitio de disposición final en Kantunilkín, y la participación en las sesiones de trabajo remotas donde se analizaron los datos. Por tanto, los datos de campo utilizados en esta tesis son adoptados directamente de este estudio profesional, constituyendo la fuente de datos primarios de la investigación.
   
   **Componentes del Estudio SUEMA adoptados**:
   - **Datos de generación y composición**: Mediciones directas realizadas por el equipo técnico profesional
   - **Caracterización operacional**: Aforos, capacidades y eficiencias documentadas en campo
   - **Análisis económico**: Costos operacionales y estructura financiera del sistema
   - **Diagnóstico técnico**: Evaluación de infraestructura y procesos existentes
   
   Los datos derivados de este estudio constituyen la principal fuente de datos primarios para la presente investigación, debidamente documentados y referenciados como SUEMA (2022).

2. **Mapeo de Stakeholders**
   - Identificación de actores primarios y secundarios
   - Análisis de roles, responsabilidades, e interacciones
   - Documentación de cadena de custodia de residuos

3. **Análisis de Documentación Existente**
   - Revisión de reportes municipales y estudios previos
   - Análisis de presupuestos y costos operacionales
   - Evaluación de marco regulatorio aplicable

#### Fase 2: Desarrollo del Modelo y Parametrización del Escenario Base (Meses 4-8)

**Objetivos**:
- Formular modelo matemático que capture la complejidad del sistema
- Implementar modelo computacional con interfaz intuitiva
- Establecer parametrización inicial del escenario base

**Actividades Principales**:

1. **Formulación Matemática**
   - Desarrollo de ecuaciones de balance de masa
   - Modelado de procesos de valorización y separación
   - Incorporación de restricciones operacionales y capacidades

2. **Implementación Computacional**
   - Desarrollo usando React/TypeScript para interfaz web
   - Programación de algoritmos de simulación
   - Creación de herramientas de visualización de resultados

3. **Parametrización del Escenario Base**
   - Establecimiento de valores iniciales basados en datos primarios
   - Documentación sistemática de fuentes para cada parámetro
   - Construcción del escenario de referencia para validación

#### Fase 3: Validación Empírica y Calibración del Modelo (Meses 9-12)

**Objetivos**:
- Validar modelo contra datos empíricos recolectados
- Calibrar parámetros críticos para minimizar error
- Realizar análisis comprensivo de sensibilidad
- Identificar variables críticas del sistema

**Actividades Principales**:

1. **Validación Estadística Inicial**
   - Comparación de resultados simulados vs. datos observados de SUEMA (2022)
   - Análisis de error y correlación estadística
   - Identificación de discrepancias significativas

2. **Calibración de Parámetros**
   - Ajuste sistemático de parámetros con mayor impacto en error
   - Minimización de diferencias entre simulación y datos empíricos
   - Validación de ajustes dentro de rangos de incertidumbre documentados

3. **Análisis de Sensibilidad Local**
   - Evaluación sistemática de 7 variables críticas identificadas
   - Variaciones de ±10% y ±20% para cada parámetro (método OFAT)
   - Cuantificación de impactos relativos en KPIs del sistema

4. **Documentación de Supuestos y Limitaciones**
   - Análisis sistemático de simplificaciones del modelo
   - Cuantificación de impacto de supuestos en resultados
   - Documentación de aplicabilidad y limitaciones

#### Fase 4: Análisis de Escenarios y Propuesta de Mejora (Meses 13-15)

**Objetivos**:
- Diseñar escenarios de optimización basados en hallazgos de sensibilidad
- Evaluar viabilidad técnica y económica de mejoras propuestas
- Desarrollar recomendaciones de implementación

**Actividades Principales**:

1. **Diseño de Escenarios**
   - Desarrollo de 8 escenarios alternativos basados en variables críticas
   - Análisis comparativo de rendimiento y costos
   - Identificación de escenario óptimo

2. **Análisis de Viabilidad**
   - Evaluación económica de inversiones requeridas
   - Análisis de factibilidad técnica y operacional
   - Desarrollo de cronograma de implementación

3. **Recomendaciones de Política**
   - Formulación de recomendaciones específicas para Holbox
   - Desarrollo de lineamientos para aplicación regional
   - Identificación de factores críticos de éxito

### 2.1.3 Consideraciones Éticas y Metodológicas

**Aspectos Éticos**:
- Consentimiento informado de todos los participantes en entrevistas
- Confidencialidad de información sensible comercial y operacional
- Transparencia en limitaciones y supuestos del modelo

**Rigor Metodológico**:
- Triangulación de fuentes de datos para verificación
- Documentación sistemática de procedimientos y decisiones
- Revisión peer de metodologías por expertos externos

**Limitaciones Reconocidas**:
- Periodo de observación limitado (4 semanas) puede no capturar variaciones anuales completas
- Disponibilidad de datos históricos limitada para validación temporal extendida
- Recursos limitados para mediciones de laboratorio de composición detallada

## 2.2 Recolección de Datos Primarios

### 2.2.1 Trabajo de Campo - Metodología

#### Diseño de Muestreo

**Periodo de Observación**: Febrero-Marzo 2022
- **Temporada Alta**: 2 semanas (14-27 febrero 2022)
- **Temporada Baja**: 2 semanas (14-27 marzo 2022)

**Justificación del Periodo**:
La selección de estos períodos se basó en:
- Maximizar contraste entre temporadas alta y baja
- Evitar períodos atípicos (Semana Santa, vacaciones especiales)
- Coordinar con disponibilidad de autoridades locales para acceso

#### Puntos de Medición

**Generación por Fuente**:
1. **Sector Hotelero**: 12 establecimientos representativos (40% del total)
2. **Sector Restaurantero**: 15 restaurantes de diferentes categorías (25% del total)
3. **Sector Residencial**: 8 colonias representativas (cobertura geográfica completa)
4. **Sector Comercial**: 10 comercios de diferentes tipos y tamaños

**Flujos del Sistema**:
1. **Recolección Primaria**: Seguimiento de 6 rutas de recolección
2. **Estación de Transferencia**: Monitoreo continuo de llegadas y salidas
3. **Transporte Final**: Registro de embarques al continente
4. **Recuperación Informal**: Observación en 4 puntos críticos

#### Metodología de Medición

**Mediciones de Volumen**:
- **Herramientas**: Balanza digital portátil (precisión ±0.1 kg), contenedores calibrados
- **Frecuencia**: Diaria para generación, 3 veces por semana para flujos del sistema
- **Protocolos**: Pesaje antes de recolección, separación por tipo cuando posible

**Mediciones de Composición**:
- **Metodología**: Caracterización por cuarteo según NOM-AA-15-1985
- **Categorías**: 7 tipos principales (orgánicos, PET, aluminio, cartón, vidrio, rechazo, peligrosos)
- **Muestras**: 24 caracterizaciones (12 por temporada, 6 por sector)

**Registro de Operaciones**:
- **Horarios y Rutas**: GPS tracking de vehículos de recolección
- **Tiempos de Proceso**: Cronometraje en estación de transferencia
- **Capacidades y Utilización**: Medición de llenado de contenedores y vehículos

### 2.2.2 Datos Recolectados

#### Generación de Residuos por Fuente

**Sector Hotelero**:
- **Generación Promedio Temporada Alta**: 45.2 kg/habitación/día (n=168 mediciones)
- **Generación Promedio Temporada Baja**: 28.7 kg/habitación/día (n=168 mediciones)
- **Variabilidad**: CV = 24% (coeficiente de variación entre establecimientos)
- **Composición Típica**: 68% orgánicos, 15% reciclables, 17% rechazo

**Sector Restaurantero**:
- **Generación Promedio**: 12.8 kg/local/día (temporada alta), 7.9 kg/local/día (temporada baja)
- **Correlación con Ocupación**: R² = 0.82 (fuerte correlación con índices de ocupación)
- **Composición Típica**: 72% orgánicos, 12% reciclables, 16% rechazo

**Sector Residencial**:
- **Generación Per Cápita**: 0.74 kg/persona/día (consistente entre temporadas)
- **Composición Típica**: 58% orgánicos, 18% reciclables, 24% rechazo
- **Variabilidad Geográfica**: Mínima (CV = 8% entre colonias)

**Sector Comercial**:
- **Generación Promedio**: 8.4 kg/local/día (temporada alta), 5.1 kg/local/día (temporada baja)
- **Composición Típica**: 45% orgánicos, 25% reciclables, 30% rechazo

#### Operaciones del Sistema

**Recolección Primaria**:
- **Capacidad Total**: 24 ton/día (3 vehículos × 8 ton/vehículo)
- **Eficiencia Promedio**: 85% (afectada por condiciones de acceso y clima)
- **Cobertura Geográfica**: 95% del área habitada

**Estación de Transferencia**:
- **Capacidad de Procesamiento**: 20 ton/día (operación de 8 horas)
- **Tiempo de Residencia Promedio**: 2.3 días
- **Eficiencia de Separación Manual**: 15% de materiales valorizables

**Transporte Final**:
- **Capacidad por Viaje**: 8 toneladas por embarque
- **Frecuencia**: 5-7 viajes por semana (variable según clima)
- **Costo Promedio**: 180 MXN/tonelada transportada

#### Costos Operacionales

**Estructura de Costos Identificada**:
1. **Recolección**: 1,250 MXN/ton (65% del costo total)
2. **Transferencia**: 320 MXN/ton (17% del costo total)
3. **Transporte Final**: 180 MXN/ton (9% del costo total)
4. **Disposición**: 175 MXN/ton (9% del costo total)

**Total Costo Sistema**: 1,925 MXN/tonelada procesada

### 2.2.3 Control de Calidad de Datos

#### Verificación y Validación

**Triangulación de Fuentes**:
- Mediciones directas vs. registros operacionales
- Entrevistas con múltiples actores para verificación
- Comparación con estudios previos disponibles

**Análisis de Consistencia**:
- Verificación de balance de masa diario
- Análisis de tendencias y valores atípicos
- Pruebas de consistencia temporal

**Documentación de Incertidumbre**:
- Error de medición estimado: ±5% para volúmenes, ±8% para composición
- Intervalos de confianza calculados para parámetros principales
- Documentación de limitaciones y sesgos potenciales

## 2.3 Fuentes de Datos Secundarios

### 2.3.1 Documentación de Parámetros del Sistema

Como parte fundamental de esta investigación, se desarrolló una documentación comprensiva de todos los parámetros utilizados en el modelo, registrada en el documento `Anexo-Fuentes-Datos.md`. Este anexo proporciona trazabilidad completa desde cada parámetro hasta su fuente de justificación académica o empírica.

#### Estadísticas de Documentación

**Cobertura Total**: 89/89 parámetros documentados (100%)

**Distribución por Tipo de Fuente**:

- **Nivel 1 - Datos Primarios**: 12 parámetros (13.5%)
  - Datos del estudio de campo de SUEMA (2022), a cuya recopilación se tuvo acceso directo
  - Mediciones, aforos y caracterizaciones presenciadas durante participación en el diagnóstico técnico
  - Observaciones directas del sistema operacional de Holbox

- **Nivel 2 - Datos Secundarios de Alta Calidad**: 42 parámetros (47.2%)
  - Reportes oficiales (INEGI, SEMARNAT), estudios académicos revisados por pares
  - Documentos técnicos de organismos internacionales reconocidos (UNEP, World Bank)
  - Literatura científica de sistemas insulares con contextos análogos

- **Nivel 3 - Datos Secundarios de Referencia y Estimaciones Ingenieriles**: 35 parámetros (39.3%)
  - Reportes industriales y estimaciones justificadas para parámetros no disponibles directamente
  - Extrapolaciones basadas en principios de ingeniería con documentación explícita del supuesto
  - Referencias técnicas de proveedores y asociaciones industriales especializadas

#### Metodología de Documentación

**Criterios de Calidad de Fuentes**:
1. **Datos Primarios**: Preferencia máxima por mediciones directas del sistema de Holbox (SUEMA, 2022)
2. **Literatura Académica**: Artículos en revistas indexadas con proceso peer-review
3. **Reportes Técnicos**: Documentos de organismos reconocidos (EPA, UNEP, World Bank)
4. **Estudios de Caso**: Sistemas insulares con características demográficas y climáticas similares

**Proceso de Triangulación de Fuentes**:
- Verificación cruzada de cada parámetro clave contra al menos dos tipos de fuentes cuando posible
- Preferencia por fuentes más recientes (últimos 10 años)
- Documentación explícita de supuestos y limitaciones para cada parámetro
- Cálculo de rangos de incertidumbre basados en variabilidad entre fuentes

### 2.3.2 Datos Demográficos y Socioeconómicos

#### Fuentes Oficiales

**INEGI (Instituto Nacional de Estadística y Geografía)**:
- Censo de Población y Vivienda 2020
- Población residente: 2,687 habitantes
- Número de viviendas: 1,243 unidades
- Estructura etaria y socioeconómica

**SECTUR Quintana Roo**:
- Estadísticas de ocupación hotelera mensual 2019-2022
- Índices de afluencia turística por temporada
- Registros de establecimientos de hospedaje y alimentación

**Municipio de Lázaro Cárdenas**:
- Registro de establecimientos comerciales
- Presupuestos municipales para gestión de residuos 2020-2022
- Reportes operacionales de servicios públicos

#### Datos de Sistemas Similares

**Islas del Caribe Mexicano**:
- **Isla Mujeres**: Comparación de tasas de generación per cápita y estacionalidad
- **Cozumel**: Datos de costos operacionales y tecnologías implementadas
- **Región Costa Maya**: Información sobre programas de valorización

**Literatura Internacional**:
- Estudios de gestión de residuos en islas del Mediterráneo y Pacífico
- Casos documentados de implementación de programas de compostaje insular
- Análisis económicos de sistemas de gestión descentralizados

### 2.3.3 Datos Técnicos y de Ingeniería

#### Parámetros de Equipos y Tecnologías

**Eficiencias de Equipos**:
- Datos de fabricantes de equipos de compostaje compacto
- Estudios de rendimiento de digestores anaeróbicos a pequeña escala
- Eficiencias de separación manual reportadas en literatura

**Costos de Tecnologías**:
- Cotizaciones de proveedores para equipos específicos
- Análisis de costos de operación y mantenimiento
- Estudios de viabilidad económica de tecnologías de valorización

**Parámetros de Proceso**:
- Tasas de descomposición de material orgánico en clima tropical
- Eficiencias de separación por tipo de material
- Factores de conversión para procesos de valorización

#### Datos Ambientales y Climáticos

**CONAGUA (Comisión Nacional del Agua)**:
- Datos climatológicos históricos de la estación Holbox
- Precipitación mensual, temperatura, y humedad relativa
- Eventos climáticos extremos y su frecuencia

**CONANP (Comisión Nacional de Áreas Naturales Protegidas)**:
- Información sobre restricciones ambientales en Reserva Yum Balam
- Lineamientos para actividades en áreas protegidas
- Estudios de impacto ambiental de actividades de gestión de residuos

## 2.4 Herramientas y Tecnologías Utilizadas

### 2.4.1 Desarrollo del Modelo Computacional

#### Plataforma de Desarrollo

**Frontend - React/TypeScript**:
- **Framework**: React 18 con hooks para gestión de estado
- **Lenguaje**: TypeScript para tipado estático y robustez
- **Herramientas de Build**: Vite para desarrollo y construcción optimizada

**Justificación de Tecnologías**:
- **Accesibilidad**: Aplicación web ejecutable en cualquier navegador
- **Interactividad**: Interfaz rica para exploración de escenarios
- **Mantenibilidad**: Código bien estructurado y documentado
- **Extensibilidad**: Arquitectura modular para futuras mejoras

#### Librerías y Componentes Principales

**Visualización de Datos**:
- **Recharts**: Gráficos interactivos para KPIs y resultados
- **Lucide React**: Iconografía consistente y profesional

**Gestión de Estado**:
- **React Hooks**: useState, useEffect, useMemo para estado local
- **Custom Hooks**: useWasteSimulation como motor principal de cálculo

**Persistencia de Datos**:
- **SQL.js**: Base de datos SQLite en navegador para escenarios
- **LocalStorage**: Respaldo de configuraciones y resultados

### 2.4.2 Herramientas de Análisis

#### Análisis Estadístico

**Framework de Validación**:
- Implementación en JavaScript de métricas estadísticas estándar
- Cálculo automático de MAPE, RMSE, y coeficientes de correlación
- Herramientas de análisis de sensibilidad con visualización tornado

**Procesamiento de Datos**:
- Scripts personalizados para procesamiento de datos de campo
- Herramientas de limpieza y validación de datos
- Generación automática de reportes de calidad de datos

#### Visualización y Reportes

**Dashboards Interactivos**:
- Panel principal con KPIs en tiempo real
- Gráficos de flujo de materiales (Sankey diagrams)
- Comparaciones de escenarios lado a lado

**Exportación de Resultados**:
- Funcionalidad de exportación CSV para análisis adicional
- Generación de reportes PDF con resultados clave
- Capturas de pantalla automáticas para documentación

### 2.4.3 Control de Versiones y Documentación

#### Gestión de Código

**Git + GitHub**:
- Control de versiones distribuido para seguimiento de cambios
- Ramas separadas para desarrollo de características
- Historial completo de decisiones de desarrollo

**Documentación Técnica**:
- README.md comprensivo con instrucciones de instalación y uso
- Comentarios en código para explicar lógica compleja
- Documentación de API para funciones principales

#### Reproducibilidad

**Datos de Entrada**:
- Archivos CSV con datos de campo procesados y validados
- Scripts de procesamiento documentados y versionados
- Metadatos completos sobre metodología de recolección

**Configuración del Modelo**:
- Archivo de configuración centralizado (initialState.js)
- Documentación de cada parámetro en Anexo-Fuentes-Datos.md
- Procedimientos de calibración documentados paso a paso

## 2.5 Limitaciones Metodológicas

### 2.5.1 Limitaciones de Datos

#### Limitaciones Temporales

**Periodo de Observación**:
- **Duración**: 4 semanas de campo pueden no capturar variaciones anuales completas
- **Eventos Atípicos**: Periodo no incluye eventos climáticos extremos (huracanes, nortes intensos)
- **Ciclos Económicos**: Observación durante periodo específico del ciclo económico turístico

**Datos Históricos**:
- **Disponibilidad Limitada**: Registros operacionales municipales incompletos antes de 2020
- **Calidad Variable**: Inconsistencias en metodologías de registro previas
- **Falta de Detalle**: Datos históricos agregados sin desagregación por sector o tipo de residuo

#### Limitaciones de Escala

**Muestreo**:
- **Representatividad**: Muestra representa 25-40% de establecimientos por sector
- **Sesgo de Selección**: Participación voluntaria puede introducir sesgo hacia operadores más organizados
- **Variabilidad Individual**: Alta variabilidad entre establecimientos del mismo sector

**Precisión de Mediciones**:
- **Equipos**: Limitaciones de precisión de balanzas portátiles en campo
- **Condiciones**: Mediciones afectadas por condiciones climáticas (humedad, viento)
- **Protocolos**: Variabilidad en aplicación de protocolos por diferentes observadores

### 2.5.2 Limitaciones del Modelo

#### Simplificaciones Inherentes

**Supuestos de Estado Estacionario**:
- Operaciones diarias modeladas como consistentes y predecibles
- No incorpora variabilidad estocástica en eficiencias operacionales
- Supone información perfecta y control operacional

**Composición de Residuos**:
- Composición tratada como constante entre fuentes y temporadas
- No modela variaciones diarias o semanales en composición
- Simplifica interacciones entre diferentes tipos de residuos

**Procesos de Valorización**:
- Modelos simplificados de procesos biológicos complejos
- No incorpora variabilidad en condiciones ambientales
- Supone operación óptima de tecnologías

#### Limitaciones de Validación

**Datos de Comparación**:
- **Fuente Única**: Validación basada principalmente en datos propios de 2022
- **Periodo Limitado**: Validación no incluye validación temporal extendida
- **Sistemas Comparables**: Pocos datos de sistemas insulares similares para validación cruzada

**Métricas de Validación**:
- Enfoque en métricas agregadas puede ocultar errores en componentes específicos
- Algunas variables difíciles de medir directamente (ej. recuperación informal)
- Balanza entre precisión del modelo y disponibilidad de datos de validación

### 2.5.3 Limitaciones de Recursos

#### Recursos Humanos

**Equipo de Investigación**:
- **Tamaño**: Investigación realizada principalmente por estudiante de tesis con apoyo limitado
- **Especialización**: Limitaciones en experticia en áreas específicas (ej. microbiología, economía)
- **Tiempo**: Restricciones de tiempo para observaciones más extensas

#### Recursos Financieros

**Presupuesto de Investigación**:
- **Viajes de Campo**: Número limitado de visitas a terreno
- **Equipos**: Uso de equipos básicos vs. instrumentación avanzada
- **Análisis de Laboratorio**: Análisis de composición limitado a caracterización visual

#### Recursos Técnicos

**Acceso a Información**:
- Información comercial sensible no siempre disponible
- Limitaciones en acceso a tecnologías propietarias
- Dependencia de cooperación voluntaria de actores locales

### 2.5.4 Implicaciones para Interpretación de Resultados

#### Aplicabilidad de Resultados

**Contexto Específico**:
- Resultados específicamente calibrados para Holbox en condiciones de 2022
- Extrapolación a otros contextos requiere validación adicional
- Cambios en condiciones locales pueden afectar validez de recomendaciones

**Horizonte Temporal**:
- Modelo optimizado para análisis de planificación a mediano plazo (1-5 años)
- Proyecciones a largo plazo requieren actualización de parámetros
- No incorpora cambios tecnológicos o socioeconómicos futuros

#### Incertidumbre y Sensibilidad

**Propagación de Incertidumbre**:
- Incertidumbre en parámetros individuales se propaga a través del sistema
- Algunos resultados más sensibles a incertidumbre que otros
- Análisis de sensibilidad identifica variables críticas pero no elimina incertidumbre

**Recomendaciones de Uso**:
- Usar modelo para comparación relativa de alternativas más que predicciones absolutas
- Aplicar factores de seguridad apropiados en decisiones de inversión
- Complementar resultados del modelo con juicio experto y validación continua

## 2.6 Consideraciones Éticas

### 2.6.1 Aspectos Éticos de la Investigación

#### Consentimiento y Participación

**Consentimiento Informado**:
- Todos los participantes en entrevistas recibieron explicación clara del propósito y uso de información
- Participación completamente voluntaria sin incentivos económicos
- Derecho a retirar participación en cualquier momento

**Transparencia de Objetivos**:
- Objetivos académicos de la investigación comunicados claramente
- Potenciales usos de resultados para política pública explicados
- Compromiso de compartir resultados con participantes y comunidad

#### Confidencialidad y Privacidad

**Protección de Información Sensible**:
- Información comercial específica mantenida confidencial
- Datos de establecimientos individuales agregados para análisis
- Nombres de participantes anonimizados en documentación

**Uso Responsable de Datos**:
- Datos utilizados exclusivamente para propósitos académicos declarados
- Almacenamiento seguro de información recolectada
- Compromiso de no uso comercial de información privada

### 2.6.2 Responsabilidad Social

#### Beneficio Comunitario

**Retorno de Resultados**:
- Compromiso de presentar resultados a autoridades locales
- Disponibilidad de herramienta desarrollada para uso municipal
- Capacitación en uso e interpretación de resultados

**Impacto Positivo**:
- Enfoque en soluciones que beneficien tanto al ambiente como a la economía local
- Consideración de impactos sociales en recomendaciones
- Promoción de tecnologías apropiadas y sostenibles

#### Objetividad Científica

**Independencia de Resultados**:
- Análisis objetivo sin sesgo hacia soluciones específicas
- Documentación transparente de limitaciones y supuestos
- Reconocimiento explícito de áreas donde evidencia es limitada

**Rigor Metodológico**:
- Aplicación consistente de métodos científicos estándar
- Validación estadística rigurosa de resultados
- Peer review de metodologías por expertos externos

---

**Referencias del Capítulo**

- Creswell, J. W., & Plano Clark, V. L. (2017). *Designing and Conducting Mixed Methods Research*. Sage Publications.

- SUEMA. (2022). *Documento Maestro del Sistema de Residuos - Isla Holbox*. Consultora SUEMA, Diagnóstico Técnico WP2E.

- Flick, U. (2018). *An Introduction to Qualitative Research*. Sage Publications.

- Kumar, R. (2019). *Research Methodology: A Step-by-Step Guide for Beginners*. Sage Publications.

- NOM-AA-15-1985. Protección al ambiente - Contaminación del suelo - Residuos sólidos municipales - Muestreo - Método de cuarteo. Diario Oficial de la Federación.

- Patton, M. Q. (2014). *Qualitative Research & Evaluation Methods: Integrating Theory and Practice*. Sage Publications.

- Saunders, M., Lewis, P., & Thornhill, A. (2019). *Research Methods for Business Students*. Pearson Education.

- Yin, R. K. (2017). *Case Study Research and Applications: Design and Methods*. Sage Publications.