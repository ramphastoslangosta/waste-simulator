# ANEXO A: GLOSARIO DE TÉRMINOS

## A.1 Términos Técnicos Escenciales

- **Análisis de Sensibilidad**: Técnica cuantitativa que identifica las variables críticas que mayor impacto tienen en el rendimiento sistémico. En este estudio, reveló que la capacidad de transporte es la variable más crítica (85% de influencia en el inventario acumulado).

- **Balance de Masa**: Principio de conservación que establece que la masa que entra a un sistema debe ser igual a la masa que sale más la masa que se acumula. Fundamental para la validación del modelo de simulación (error <0.01%).

- **Cuello de Botella (Bottleneck)**: Etapa de un proceso que tiene la menor capacidad y limita el rendimiento general del sistema. En Holbox es la capacidad de transporte continental (9.6 ton/día vs. 47.6 ton/día generadas).

- **Déficit de Transporte**: Diferencia cuantitativa entre residuos que necesitan transportarse y la capacidad real disponible. En el escenario base: 79.6% de déficit sistémico.

- **GIRS (Gestión Integral de Residuos Sólidos)**: Enfoque holístico para el manejo de residuos considerando todas las etapas desde generación hasta disposición final, incluyendo valorización y tratamiento.

- **Inventario Acumulado**: Cantidad total de residuos almacenados en el sistema que no han podido ser procesados o transportados. KPI crítico: 894.7 toneladas en escenario base vs. 132.8 toneladas en escenario óptimo.

- **KPI (Indicador Clave de Rendimiento)**: Métrica cuantificable para evaluar rendimiento del sistema. Los 8 KPIs principales incluyen: inventario acumulado, costo neto, ROI, tiempo de recuperación, emisiones, empleo generado.

- **Modelo Determinístico**: Modelo matemático donde para un conjunto dado de entradas se produce siempre la misma salida, sin componentes de aleatoriedad. Permite reproducibilidad exacta de resultados.

- **SIDS (Small Island Developing States)**: Pequeños Estados Insulares en Desarrollo que enfrentan desafíos similares de gestión de residuos: limitaciones de transporte, alta estacionalidad turística, capacidades tecnológicas restringidas.

- **Valorización**: Cualquier proceso que permite reaprovechamiento de residuos a través de reciclaje (valorización material) o recuperación de energía. El compostaje es valorización material con 65% de eficiencia en el modelo.

## A.2 Variables Críticas del Modelo

### **Variables de Generación**

- **Tasa hotelera:** 2.1 kg/unidad/día (validado empíricamente)
- **Tasa gastronómica:** 46.7 kg/unidad/día (mayor generador por unidad)
- **Factor estacional:** 2.8x variación entre temporada alta y baja

### **Variables de Capacidad**

- **Capacidad de transporte:** 9.6 ton/día (cuello de botella crítico)
- **Capacidad de recolección:** 15.0 ton/día (suficiente)
- **Capacidad de compostaje:** Variable por escenario (0-20 ton/día)

### **Variables Económicas**

- **Costo de transporte:** 2,600 MXN/tonelada (mayor componente de costo)
- **Precio de compost:** 800 MXN/tonelada (ingreso principal)
- **Costo de disposición:** 200 MXN/tonelada

### **Parámetros de Composición**

- **Orgánicos hoteles:** 46% (alta variabilidad estacional)
- **Orgánicos restaurantes:** 52% (composición más estable)
- **Reciclables totales:** 28% promedio del flujo

## A.3 Siglas y Acrónimos Principales

- **CSO:** Costo Sin Optimizar - Costo del sistema actual antes de mejoras  
- **GIRS:** Gestión Integral de Residuos Sólidos  
- **KPI:** Key Performance Indicator (Indicador Clave de Rendimiento)  
- **MXN:** Moneda Nacional Mexicana (Pesos)  
- **ROI:** Return on Investment (Retorno sobre Inversión)  
- **RSU:** Residuos Sólidos Urbanos  
- **SIDS:** Small Island Developing States  
- **SUMA:** Consultora ambiental que proporcionó datos empíricos (2022)  
- **ton/día:** Toneladas por día (unidad de flujo másico)  

## A.4 Terminología Especifica del Simulador

- **Escenarios de Mejora**: Configuraciones paramétricas que representan diferentes estrategias de optimización. 8 escenarios evaluados desde intervenciones mínimas hasta solución integral.

- **Período de Simulación**: 30 días por escenario para capturar dinámicas operacionales completas y variabilidad estacional.

- **Tasa de Éxito de Validación**: Porcentaje de KPIs que pasan criterio de error relativo <25%. Modelo logra 100% (8/8 KPIs validados).

- **Validador de Conservación de Masa**: Sistema automático que verifica integridad física del modelo en cada iteración, garantizando balance exacto de entradas-salidas-acumulación.

## A.5 CONTEXTO INSULAR ESPECÍFICO

- **Estacionalidad Extrema**: Variación 2.8x en generación entre temporada alta (diciembre-abril) y baja (mayo-noviembre) debido a flujo turístico.

- **Limitación Continental**: Restricción física de transporte por distancia (30 km) y disponibilidad logística limitada a ferry con capacidad fija.

- **Generación Diferenciada**: Tres sectores principales con patrones distintos: hotelero (volumen alto, composición variable), gastronómico (densidad alta, 52% orgánicos), residencial (patrón estable).

**Referencia Digital:** Glosario completo disponible en: https://github.com/ramphastoslangosta/waste-simulator/docs/glossary.md
