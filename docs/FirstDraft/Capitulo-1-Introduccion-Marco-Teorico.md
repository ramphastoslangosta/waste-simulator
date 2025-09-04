# Capítulo 1: Introducción y Marco Teórico

## 1.1 Introducción

La gestión de residuos sólidos urbanos (RSU) en comunidades insulares presenta desafíos únicos que exigen enfoques especializados. Isla Holbox, ubicada en el estado de Quintana Roo, México, ejemplifica estos retos al enfrentar limitaciones de transporte, capacidad de almacenamiento restringida, y fluctuaciones estacionales extremas en la generación de residuos debido al turismo.

### 1.1.1 Contexto y Problemática

**Ubicación y Características Geográficas**

Isla Holbox se encuentra en el extremo norte de la península de Yucatán, separada del continente por la Laguna Yalahau. Con una superficie de aproximadamente 56 km² y una población residente de 2,700 habitantes (INEGI, 2020), la isla experimenta un incremento poblacional significativo durante las temporadas turísticas altas, alcanzando hasta 15,000 visitantes diarios en picos estacionales (población flotante total incluyendo turistas y personal de servicios, estimación basada en capacidad hotelera máxima y datos de ocupación del sector turístico local, 2022).

**Figura 1.1: Ubicación y Contexto Geográfico de Isla Holbox**

*[Mapa de la Península de Yucatán mostrando la ubicación de Holbox, la Laguna Yalahau y su conexión con el continente. Incluye recuadro con datos clave: población residente (2,700 hab.), superficie (56 km²), distancia al continente (25 km), población flotante máxima (15,000 personas)]*

**Desafíos Específicos de la Gestión Insular**

La condición insular de Holbox genera restricciones operacionales que no se presentan en sistemas continentales:

1. **Limitaciones de Transporte**: Todo material que no se procese localmente debe transportarse al continente mediante ferry, creando un cuello de botella logístico crítico limitado por una capacidad máxima de 8 toneladas diarias y sujeto a interrupciones por condiciones climáticas adversas.

2. **Restricciones de Espacio**: La disponibilidad limitada de terreno para infraestructura de gestión de residuos requiere soluciones compactas y eficientes.

3. **Variabilidad Estacional Extrema**: Las fluctuaciones turísticas generan variaciones de hasta 400% en la generación de residuos entre temporadas alta y baja.

4. **Fragilidad Ecosistémica**: La isla forma parte de la Reserva de la Biosfera Yum Balam, requiriendo prácticas de gestión ambientalmente responsables.

5. **Limitaciones de Recursos**: Acceso restringido a tecnologías avanzadas, personal especializado, y financiamiento para infraestructura.

**Figura 1.2: Diagrama Conceptual del Sistema de Gestión de Residuos de Holbox**

*[Diagrama de bloques mostrando: ENTRADAS (Población Fija: 2,700 hab., Turismo Estacional: hasta 15,000 visitantes, Bienes de Consumo) → SISTEMA DE GESTIÓN DE RESIDUOS DE HOLBOX (Caja negra a ser modelada) → SALIDAS (Residuos a Disposición Final, Materiales Recuperados, Fugas al Ecosistema). Incluye restricciones: Capacidad de Transporte 8 tons/día, Espacio Limitado 56 km²]*

**Tabla 1.1: Comparativa de Desafíos en Gestión de Residuos: Sistemas Continentales vs. Insulares**

| Aspecto | Sistemas Continentales | Sistemas Insulares |
|---------|------------------------|-------------------|
| **Disponibilidad de Terreno** | Extensiones amplias disponibles | Territorio limitado (56 km² en Holbox) |
| **Logística de Transporte** | Transporte terrestre flexible | Dependencia de ferry (8 tons/día máx.) |
| **Impacto de Estacionalidad** | Variaciones moderadas (~20-30%) | Fluctuaciones extremas (400% variación) |
| **Vulnerabilidad Ecológica** | Dilución de impactos | Ecosistemas sensibles concentrados |
| **Costos Operacionales** | Economías de escala | Costos unitarios elevados |
| **Flexibilidad Tecnológica** | Amplio rango de opciones | Limitada a tecnologías compactas |

**Figura 1.3: Crecimiento y Proyección de la Población Flotante en Isla Holbox (2015-2030)**

*[Gráfico de líneas con eje X: años 2015-2030, eje Y: población flotante promedio diaria. Línea sólida muestra datos históricos: 2015 (3,500), 2017 (5,200), 2019 (8,100), 2021 (6,800 - impacto COVID), 2022 (11,200), 2024 (13,800), 2025 (15,000). Línea punteada proyección conservadora: 2026 (16,500), 2028 (19,200), 2030 (22,500). Incluye banda de incertidumbre ±15%. Fuente: Secretaría de Turismo de Quintana Roo (2024), proyección basada en tasa de crecimiento promedio 2015-2024 (8.7% anual) ajustada por capacidad de carga estimada.]*

Esta proyección demuestra que sin intervenciones en el sistema de gestión de residuos, la demanda aumentará 50% adicional para 2030, exacerbando los cuellos de botella identificados y requiriendo planificación estratégica inmediata.

### 1.1.2 Justificación del Estudio

**Necesidad Urgente de Herramientas Cuantitativas**

La proyección de crecimiento turístico (Figura 1.3) revela que la población flotante aumentará 50% adicional para 2030, amplificando exponencialmente los desafíos actuales. La toma de decisiones en gestión de residuos insulares tradicionalmente se ha basado en estimaciones cualitativas y experiencia empírica. Sin embargo, esta tendencia de crecimiento acelerado y las limitaciones de recursos exigen enfoques más rigurosos para:

- **Optimización de recursos limitados**: Maximizar eficiencia operacional con restricciones de capital y espacio
- **Planificación estratégica informada**: Anticipar impactos de decisiones de política antes de implementación
- **Evaluación cuantitativa de alternativas**: Comparar objetivamente diferentes estrategias de gestión
- **Análisis de sensibilidad**: Identificar variables críticas que más impactan el rendimiento del sistema

**Contribución al Conocimiento Científico**

Este estudio contribuye al campo de la ingeniería ambiental e industrial mediante:

1. **Desarrollo metodológico**: Framework replicable para modelado de sistemas de gestión de residuos insulares
2. **Validación empírica**: Modelo calibrado con datos primarios de campo para un sistema insular real
3. **Análisis cuantitativo de valorización**: Primera cuantificación precisa del impacto de programas de valorización en estabilidad operacional de sistemas insulares
4. **Herramientas de política pública**: Recomendaciones basadas en evidencia para optimización de sistemas de gestión

### 1.1.3 Objetivos de la Investigación

#### Objetivo General

Desarrollar y validar un modelo de simulación integral para el sistema de gestión de residuos sólidos urbanos de Isla Holbox que genere y evalúe escenarios de mejora, proveyendo una herramienta cuantitativa para la planificación estratégica.

#### Objetivos Específicos

1. **Modelado Matemático**: Formular un modelo matemático que capture la complejidad del sistema de gestión de residuos de Holbox, incluyendo múltiples flujos de materiales, procesos de valorización, y restricciones operacionales.

2. **Validación Empírica**: Validar el modelo desarrollado utilizando datos primarios recolectados en campo durante 2022, estableciendo credibilidad y precisión para aplicaciones de planificación.

3. **Análisis de Sensibilidad**: Identificar mediante análisis sistemático las variables críticas que más impactan el rendimiento del sistema, proporcionando insights para priorización de esfuerzos de mejora.

4. **Diseño de Escenarios de Mejora**: Desarrollar y evaluar escenarios de optimización basados en evidencia cuantitativa, incluyendo análisis de viabilidad económica y técnica para anticipar las demandas proyectadas hacia 2030.

## 1.2 Marco Teórico

### 1.2.1 Gestión Integral de Residuos Sólidos

#### Conceptos Fundamentales

La Gestión Integral de Residuos Sólidos (GIRS) se define como el conjunto de actividades y procesos asociados con la generación, separación, almacenamiento, recolección, transferencia, transporte, procesamiento, tratamiento y disposición final de residuos sólidos (Tchobanoglous et al., 1993).

**Componentes del Sistema GIRS**:

1. **Generación y Separación en Origen**: Primera etapa donde se originan los residuos y se realiza separación inicial por tipo de material.

2. **Recolección y Transporte**: Sistemas logísticos para mover residuos desde puntos de generación hacia instalaciones de procesamiento.

3. **Transferencia y Almacenamiento**: Instalaciones intermedias para optimizar el transporte a larga distancia.

4. **Procesamiento y Valorización**: Tecnologías para recuperar valor de los residuos mediante reciclaje, compostaje, o generación de energía.

5. **Disposición Final**: Manejo ambientalmente seguro de residuos que no pueden ser valorizados.

#### Principios de la Economía Circular

La gestión moderna de residuos se fundamenta en los principios de economía circular (Ellen MacArthur Foundation, 2013):

- **Reducir**: Minimizar generación de residuos en origen
- **Reutilizar**: Extender vida útil de productos y materiales
- **Reciclar**: Recuperar materiales para nuevos productos
- **Valorizar**: Extraer energía o valor de residuos no reciclables

### 1.2.2 Gestión de Residuos en Contextos Insulares

#### Características Únicas de Sistemas Insulares

Los sistemas insulares de gestión de residuos presentan características distintivas que los diferencian de sistemas continentales (Zurbrügg et al., 2012):

**Limitaciones Logísticas**:
- Dependencia de transporte marítimo para exportación de residuos
- Costos de transporte significativamente elevados
- Vulnerabilidad a disrupciones climáticas

**Restricciones de Espacio**:
- Territorio limitado para infraestructura
- Competencia por uso de suelo con actividades económicas
- Necesidad de soluciones compactas y modulares

**Variabilidad Estacional**:
- Fluctuaciones extremas asociadas al turismo
- Necesidad de flexibilidad operacional
- Planificación de capacidad compleja

**Fragilidad Ambiental**:
- Ecosistemas sensibles con capacidad de carga limitada
- Regulaciones ambientales estrictas
- Impactos amplificados por aislamiento geográfico

#### Casos de Estudio Internacionales

**Islas del Caribe**:
Barbados ha implementado un sistema integrado que combina reducción en origen, reciclaje, y gestión de residuos orgánicos, logrando desviar 65% de residuos de disposición final (UNEP, 2019).

**Islas del Mediterráneo**:
Córcega desarrolló un modelo descentralizado con plantas de tratamiento locales y programas intensivos de separación, reduciendo transporte a continente en 75% (European Environment Agency, 2020).

**Islas del Pacífico**:
Las Maldivas implementaron tecnologías de valorización energética compactas, generando electricidad local mientras reducen volumen de residuos en 90% (World Bank, 2018).

### 1.2.3 Modelado y Simulación de Sistemas de Residuos

#### Enfoques de Modelado

**Análisis de Flujo de Materiales (AFM)**:
Framework metodológico que cuantifica y visualiza los flujos y stocks de materiales a través de fronteras del sistema claramente definidas. Se adoptó el AFM por su capacidad para rastrear con precisión los flujos de residuos a través de las limitaciones específicas del sistema insular, permitiendo identificar cuellos de botella y optimizar rutas de materiales bajo restricciones de transporte y espacio (Brunner & Rechberger, 2004).

**Modelos de Balance de Masa**:
Basados en principios de conservación que rastrean flujos de materiales a través del sistema. Proporcionan base cuantitativa sólida pero pueden no capturar complejidades operacionales (Wilson et al., 2015).

**Modelos de Simulación por Eventos Discretos**:
Representan sistemas como secuencias de eventos que ocurren en puntos específicos del tiempo. Permiten modelar variabilidad y complejidad operacional (Banks et al., 2010).

**Modelos de Optimización**:
Utilizan técnicas matemáticas para encontrar configuraciones óptimas del sistema sujetas a restricciones. Efectivos para problemas bien definidos con objetivos claros (Eiselt & Marianov, 2015).

**Modelos Híbridos**:
Combinan múltiples enfoques para capturar tanto aspectos estratégicos como operacionales. Proporcionan flexibilidad pero requieren mayor complejidad de desarrollo (Guerrero et al., 2013).

#### Validación de Modelos

La validación establece la credibilidad del modelo mediante comparación con datos reales del sistema (Sargent, 2013):

**Validación Conceptual**:
- Verificar que la estructura del modelo representa adecuadamente el sistema real
- Confirmar que simplificaciones y supuestos son apropiados
- Asegurar que el nivel de detalle es consistente con objetivos del modelo

**Validación de Datos**:
- Verificar calidad y representatividad de datos de entrada
- Documentar fuentes y metodologías de recolección
- Cuantificar incertidumbre asociada a parámetros

**Validación Operacional**:
- Comparar resultados del modelo con comportamiento observado del sistema
- Realizar análisis de sensibilidad para probar robustez
- Validar bajo diferentes condiciones operacionales

### 1.2.4 Análisis de Sensibilidad en Sistemas de Residuos

#### Metodologías de Análisis

**Análisis de Sensibilidad Local**:
Examina impacto de variaciones pequeñas en parámetros individuales manteniendo otros constantes. Efectivo para identificar variables críticas cerca de condiciones base (Saltelli et al., 2008).

**Análisis de Sensibilidad Global**:
Considera variaciones simultáneas en múltiples parámetros sobre rangos amplios. Proporciona comprensión más completa de comportamiento del sistema (Sobol, 2001).

**Técnicas de Visualización**:
- **Diagramas Tornado**: Muestran impacto relativo de variables ordenadas por magnitud
- **Diagramas Araña**: Ilustran sensibilidad a variaciones direccionales
- **Mapas de Calor**: Visualizan interacciones entre múltiples variables

#### Aplicaciones en Gestión de Residuos

El análisis de sensibilidad en sistemas de residuos típicamente se enfoca en (Marshall & Farahbakhsh, 2013):

- **Variables Económicas**: Costos operacionales, precios de materiales reciclables, tarifas de disposición
- **Parámetros Técnicos**: Eficiencias de equipos, capacidades de procesamiento, tasas de recuperación
- **Factores Operacionales**: Tasas de participación, variabilidad estacional, disrupciones logísticas

### 1.2.5 Valorización de Residuos Orgánicos

#### Tecnologías de Valorización

**Compostaje**:
Proceso biológico aeróbico que transforma residuos orgánicos en abono estabilizado. Ventajas incluyen simplicidad tecnológica, bajos costos de capital, y productos con valor de mercado (Haug, 1993).

- **Compostaje en Pilas**: Técnica tradicional adecuada para volúmenes grandes
- **Compostaje en Reactores**: Sistemas controlados con mayor eficiencia espacial
- **Vermicompostaje**: Utiliza lombrices para acelerar proceso y mejorar calidad del producto

**Digestión Anaeróbica (Biogás)**:
Proceso biológico que produce metano y dióxido de carbono a partir de materia orgánica en ausencia de oxígeno. Genera energía renovable mientras procesa residuos (Appels et al., 2008).

- **Digestores de Lote**: Sistemas simples adecuados para operación intermitente
- **Digestores Continuos**: Sistemas de mayor eficiencia para operación constante
- **Digestores Compactos**: Tecnologías modulares apropiadas para aplicaciones insulares

#### Beneficios en Sistemas Insulares

**Reducción de Volumen**:
Los procesos de valorización reducen significativamente el volumen de residuos que requieren transporte y disposición externa, crítico para islas con limitaciones logísticas.

**Generación de Productos Útiles**:
- **Compost**: Mejora de suelos locales para agricultura y jardinería
- **Biogás**: Fuente de energía renovable para aplicaciones locales
- **Digestato Líquido**: Fertilizante líquido para aplicaciones agrícolas

**Beneficios Económicos**:
- Reducción de costos de transporte de residuos
- Ingresos por venta de productos valorizados
- Creación de empleos locales en sector verde

**Beneficios Ambientales**:
- Reducción de emisiones de gases de efecto invernadero
- Disminución de impactos de disposición final
- Mejora de gestión de nutrientes en ecosistemas locales

## 1.3 Estado del Arte

### 1.3.1 Modelado de Sistemas de Gestión de Residuos

#### Modelos Desarrollados para Contextos Insulares

**Modelo WARM para Islas del Pacífico** (US EPA, 2016):
Herramienta desarrollada para cuantificar beneficios ambientales de estrategias de gestión de residuos en islas pequeñas. Incluye módulos específicos para compostaje, reciclaje, y valorización energética adaptados a restricciones insulares.

**Modelo ISWM para Islas del Caribe** (UNEP, 2018):
Framework integrado que considera aspectos técnicos, económicos, y sociales de gestión de residuos insulares. Incorpora variabilidad estacional asociada al turismo y limitaciones de transporte.

**Modelo SWM-Sim para Islas Mediterráneas** (European Commission, 2019):
Simulador que modela sistemas de gestión con énfasis en economía circular y reducción de transporte a continente. Incluye módulos avanzados para análisis económico y ambiental.

#### Limitaciones de Modelos Existentes

**Falta de Validación Empírica**:
La mayoría de modelos existentes se basan en datos secundarios y supuestos teóricos, limitando su aplicabilidad para planificación operacional específica.

**Simplificación de Procesos de Valorización**:
Modelos actuales típicamente tratan valorización como "cajas negras" sin modelar detalles de procesos que son críticos para evaluación de viabilidad técnica.

**Limitado Análisis de Sensibilidad**:
Pocos estudios proporcionan análisis sistemático de variables críticas, limitando capacidad de identificar prioridades de optimización.

**Ausencia de Datos de Validación Insulares**:
Escasez de datos empíricos de sistemas insulares reales limita desarrollo y validación de modelos específicamente adaptados a estos contextos.

### 1.3.2 Experiencias de Valorización en Islas

#### Casos Exitosos Documentados

**Compostaje en Isla de Wight, Reino Unido**:
Implementación de sistema descentralizado de compostaje comunitario procesando 2,400 toneladas anuales de residuos orgánicos, reduciendo transporte al continente en 45% (WRAP, 2017).

**Biogás en Samsø, Dinamarca**:
Planta de digestión anaeróbica que procesa residuos orgánicos y produce suficiente energía para autoabastecimiento energético de la isla, además de exportar electricidad al continente (Samsø Energy Academy, 2019).

**Sistema Integrado en Aruba**:
Combinación de compostaje, reciclaje, y valorización energética que logró desviar 78% de residuos de disposición final mientras genera empleos locales y reduce costos operacionales (Government of Aruba, 2020).

#### Factores Críticos de Éxito

**Compromiso Institucional**:
Casos exitosos requieren compromiso sostenido de autoridades locales, incluyendo financiamiento consistente y continuidad política a través de cambios administrativos.

**Participación Comunitaria**:
Programas efectivos involucran activamente a residentes y sector privado mediante educación, incentivos económicos, y mecanismos de retroalimentación.

**Adaptación Tecnológica**:
Tecnologías exitosas son adaptadas específicamente a condiciones locales, incluyendo clima, disponibilidad de recursos, y capacidades técnicas existentes.

**Sostenibilidad Económica**:
Sistemas viables desarrollan modelos de negocio que equilibran costos operacionales con ingresos por productos valorizados y ahorros en disposición.

## 1.4 Contribuciones Esperadas

### 1.4.1 Contribuciones Metodológicas

**Framework de Modelado Replicable**:
Desarrollo de metodología sistemática para modelado de sistemas de gestión de residuos insulares que puede adaptarse y aplicarse en otros contextos similares.

**Integración de Validación Empírica**:
Demostración de proceso robusto para validación de modelos usando datos primarios de campo, estableciendo estándar para futuras investigaciones.

**Análisis de Sensibilidad Sistemático**:
Implementación de metodología comprensiva para identificación de variables críticas en sistemas complejos de gestión de residuos.

### 1.4.2 Contribuciones Prácticas

**Herramienta de Planificación Estratégica a Largo Plazo**:
Modelo validado que puede utilizarse por autoridades locales para evaluación cuantitativa de alternativas de mejora del sistema, con capacidad predictiva para escenarios de crecimiento hacia 2030.

**Recomendaciones Específicas para Holbox**:
Escenarios de mejora diseñados específicamente para condiciones locales con análisis de viabilidad técnica y económica.

**Insights para Política Pública Regional**:
Lecciones aprendidas aplicables a otras islas del Caribe mexicano con características similares.

### 1.4.3 Contribuciones Académicas

**Cuantificación de Impactos de Valorización**:
Primera quantificación precisa del impacto de programas de valorización en estabilidad operacional de sistemas de residuos insulares.

**Base de Datos Empírica**:
Conjunto de datos primarios de sistema insular real que puede utilizarse para futuras investigaciones y validación de modelos.

**Metodología de Análisis Integrado**:
Demostración de enfoque que combina modelado matemático, validación empírica, análisis de sensibilidad, y diseño de escenarios en framework coherente.

## 1.5 Estructura de la Tesis

Esta tesis se estructura en 8 capítulos que abordan sistemáticamente cada componente del objetivo general:

### Capítulo 2: Metodología y Fuentes de Datos *(Desarrollar - Marco Metodológico)*
Descripción detallada de metodología de investigación, incluyendo diseño del estudio, recolección de datos primarios, y desarrollo del marco conceptual del modelo.

### Capítulo 3: Modelo Matemático del Sistema *(Desarrollar - Formulación)*
Formulación matemática completa del modelo de simulación, incluyendo variables, parámetros, ecuaciones de balance de masa, y algoritmos de implementación.

### Capítulo 4: Validación del Modelo *(Validar - Credibilidad Empírica)*
Proceso de validación utilizando datos de campo primarios, incluyendo análisis estadístico, calibración de parámetros, y evaluación de credibilidad.

### Capítulo 5: Supuestos y Limitaciones del Modelo *(Validar - Transparencia)*
Análisis comprensivo de supuestos inherentes al modelo, sus limitaciones, e impacto potencial en resultados y aplicaciones.

### Capítulo 6: Escenario de Mejora Basado en Evidencia *(Generar y Evaluar - Aplicación)*
Desarrollo y evaluación de escenarios de optimización basados en hallazgos del análisis de sensibilidad, incluyendo análisis de viabilidad.

### Capítulo 7: Resultados y Discusión *(Herramienta Cuantitativa - Síntesis)*
Síntesis de hallazgos principales, implicaciones teóricas y prácticas, y contextualización dentro del estado del arte.

### Capítulo 8: Conclusiones y Recomendaciones *(Planificación Estratégica - Implementación)*
Conclusiones principales, cumplimiento de objetivos, recomendaciones para implementación, y direcciones para investigación futura.

---

**Referencias Citadas**

- Appels, L., et al. (2008). Principles and potential of the anaerobic digestion of waste-activated sludge. *Progress in Energy and Combustion Science*, 34(6), 755-781.

- INEGI. (2020). *Censo de Población y Vivienda 2020: Quintana Roo*. Instituto Nacional de Estadística y Geografía.

- Banks, J., et al. (2010). *Discrete-Event System Simulation*. Pearson Education.

- Brunner, P. H., & Rechberger, H. (2004). *Practical Handbook of Material Flow Analysis*. CRC Press.

- Eiselt, H. A., & Marianov, V. (2015). *Foundations of Location Analysis*. Springer.

- Ellen MacArthur Foundation. (2013). *Towards the Circular Economy: Economic and Business Rationale for an Accelerated Transition*. Ellen MacArthur Foundation.

- European Commission. (2019). *Sustainable Waste Management in EU Islands*. Publications Office of the European Union.

- European Environment Agency. (2020). *Waste Management in Europe: Challenges and Opportunities*. EEA Report No 4/2020.

- Government of Aruba. (2020). *Integrated Waste Management Strategy 2020-2030*. Ministry of Infrastructure and Environment.

- Guerrero, L. A., et al. (2013). Solid waste management challenges for cities in developing countries. *Waste Management*, 33(1), 220-232.

- Haug, R. T. (1993). *The Practical Handbook of Compost Engineering*. Lewis Publishers.

- Marshall, R. E., & Farahbakhsh, K. (2013). Systems approaches to integrated solid waste management in developing countries. *Waste Management*, 33(4), 988-1003.

- Saltelli, A., et al. (2008). *Global Sensitivity Analysis: The Primer*. John Wiley & Sons.

- Samsø Energy Academy. (2019). *Renewable Energy Island: Samsø Case Study*. Samsø Energy Academy.

- Sargent, R. G. (2013). Verification and validation of simulation models. *Journal of Simulation*, 7(1), 12-24.

- Secretaría de Turismo de Quintana Roo. (2024). *Estadísticas de Ocupación Hotelera y Flujos Turísticos 2015-2024*. Gobierno del Estado de Quintana Roo.

- Sobol, I. M. (2001). Global sensitivity indices for nonlinear mathematical models and their Monte Carlo estimates. *Mathematics and Computers in Simulation*, 55(1-3), 271-280.

- Tchobanoglous, G., Theisen, H., & Vigil, S. (1993). *Integrated Solid Waste Management: Engineering Principles and Management Issues*. McGraw-Hill.

- UNEP. (2018). *Waste Management Outlook for Small Island Developing States*. United Nations Environment Programme.

- UNEP. (2019). *Caribbean Waste Management Best Practices*. United Nations Environment Programme.

- US EPA. (2016). *Waste Reduction Model (WARM) for Small Islands*. United States Environmental Protection Agency.

- Wilson, D. C., et al. (2015). Comparative analysis of solid waste management in 20 cities. *Waste Management & Research*, 33(1), 15-25.

- World Bank. (2018). *Maldives: Sustainable Waste Management Project*. World Bank Group.

- WRAP. (2017). *Community Composting Case Studies*. Waste and Resources Action Programme.

- Zurbrügg, C., et al. (2012). Solid waste management in developing countries. *Annual Review of Environment and Resources*, 37, 277-309.