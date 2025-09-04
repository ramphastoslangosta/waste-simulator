# Tesina: Gestión Integral de Residuos Sólidos - Isla Holbox

**Autor:** Rafael Lang  
**Institución:** Universidad  
**Fecha:** Septiembre 2024

## Descripción

Esta tesina presenta un análisis integral del sistema de gestión de residuos sólidos urbanos en Isla Holbox, Quintana Roo, México. El trabajo incluye el desarrollo de un modelo matemático determinístico para simular flujos de masa y evaluación económica del sistema actual, así como la propuesta de 8 escenarios alternativos de mejora.

## Estructura del Proyecto

```
tesis/
├── capitulos/                    # Capítulos principales de la tesina
│   ├── capitulo1_introduccion.md
│   ├── capitulo2_marco_teorico.md
│   ├── capitulo3_metodologia.md
│   ├── capitulo4_validacion_sensibilidad.md
│   ├── capitulo5_escenarios.md
│   └── capitulo6_resultados_recomendaciones.md
├── anexos/                       # Anexos técnicos
│   ├── anexo_a.md
│   ├── anexo_b.md
│   ├── anexo_c.md
│   ├── anexo_d.md
│   └── anexo_e.md
├── recursos/
│   ├── imagenes/                 # Imágenes y diagramas
│   └── charts/                   # Gráficos y visualizaciones
├── portada.md                    # Portada del documento
├── referencias.md                # Referencias bibliográficas
├── formato_tesina.css            # Estilos CSS para generación PDF
├── generate_pdf_fixed.py         # Script de generación PDF
└── TESINA_HOLBOX_FINAL.pdf      # Documento final
```

## Metodología

El núcleo metodológico es un **modelo matemático determinístico** que simula flujos de masa y económicos del sistema de gestión de residuos. El modelo se estructura en cinco módulos secuenciales basados en conservación de masa:

1. **Generación** por sectores con variación estacional
2. **Recolección** limitada por capacidad vehicular  
3. **Transporte** con restricción crítica de 9.6 ton/día
4. **Valorización** mediante compostaje y separación
5. **Disposición final** con cálculos económicos integrados

## Resultados Principales

- **Validación empírica:** Modelo validado con tasa del 100% (8/8 KPIs) y error promedio de 6.0%
- **Variable crítica:** Capacidad de transporte (30.7% de impacto sistémico)
- **Déficit sistémico:** 79.6% causado por restricción logística
- **Escenarios evaluados:** 8 alternativas con análisis costo-beneficio integral

## Generación del PDF

Para generar el documento PDF completo:

```bash
python generate_pdf_fixed.py
```

### Requisitos

- Python 3.8+
- Pandoc
- WeasyPrint
- Bibliotecas Python: `subprocess`, `re`, `os`

## Archivos de Respaldo

- **repo_backup_original/**: Respaldo completo del repositorio original
- **tesis_backup_completo/**: Respaldo del trabajo de tesis antes de la limpieza

## Licencia

Este trabajo es propiedad intelectual del autor y está protegido por derechos de autor académicos.