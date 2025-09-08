#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de PDF para Tesina - v4.1 (Flujo Híbrido Corregido)

Este script utiliza la mejor estrategia para control total del formato:
1.  Usa PANDOC para convertir Markdown y LaTeX a un HTML intermedio de alta calidad.
2.  Usa WEASYPRINT para renderizar ese HTML con un archivo CSS, generando
    un PDF con formato exacto y predecible.

Corrección v4.1: Se reemplaza '--math-method=mathml' por '--mathjax' para
garantizar la compatibilidad con versiones más antiguas de Pandoc.
"""

import subprocess
import sys
from pathlib import Path
import re

# --- Dependencias Requeridas ---
# Asegúrate de tenerlas instaladas:
# pip install weasyprint
# También necesitas instalar Pandoc en tu sistema: https://pandoc.org/installing.html

def get_markdown_files(base_path):
    """Obtiene la lista ordenada de archivos Markdown para la tesina."""
    # Edita esta lista para que coincida con el orden y nombre de tus capítulos
    markdown_files_order = [
        "capitulos/capitulo1_introduccion.md",
        "capitulos/capitulo2_marco_teorico.md",
        "capitulos/capitulo3_metodologia.md",
        "capitulos/capitulo4_validacion_sensibilidad.md",
        "capitulos/capitulo5_escenarios.md",
        "capitulos/capitulo6_resultados_recomendaciones.md",
        "anexos/anexo_a.md",
        "anexos/anexo_b.md",
        "anexos/anexo_c.md",
        "anexos/anexo_d.md",
        "anexos/anexo_e.md",
        "referencias.md"
        # "anexo_x_....md", # Agrega tus anexos adicionales aquí
    ]

    existing_files = []
    print("📚 Verificando archivos para la compilación:")
    
    # Verificar si existe la portada
    portada_path = base_path / "portada.md"
    cover_content = ""
    if portada_path.exists():
        print(f"  [✓] portada.md (será incluida como portada)")
        with open(portada_path, 'r', encoding='utf-8') as f:
            cover_content = f.read()
    else:
        print(f"  [✗] portada.md (No encontrada)")
    
    # Verificar si existe la primera página
    primera_pagina_path = base_path / "primer_pagina.md"
    first_page_content = ""
    if primera_pagina_path.exists():
        print(f"  [✓] primer_pagina.md (será incluida como primera página después de portada)")
        with open(primera_pagina_path, 'r', encoding='utf-8') as f:
            first_page_content = f.read()
    else:
        print(f"  [✗] primer_pagina.md (No encontrada)")
    
    for file_name in markdown_files_order:
        file_path = base_path / file_name
        if file_path.exists():
            # Limpiamos la numeración manual de los archivos si existe
            clean_content(file_path)
            existing_files.append(str(file_path))
            print(f"  [✓] {file_name}")
        else:
            print(f"  [✗] {file_name} (No encontrado, se omitirá)")

    return existing_files, cover_content, first_page_content

def clean_content(file_path):
    """
    Elimina la numeración manual de los encabezados en un archivo Markdown
    para evitar la duplicación con la numeración automática de Pandoc.
    También corrige problemas de parsing con títulos que contienen caracteres especiales.
    """
    content = file_path.read_text(encoding='utf-8')
    original_content = content
    
    # Expresión regular para encontrar y reemplazar encabezados con numeración (ej. ## 1.1 ...)
    content = re.sub(r'^(#+\s*)(\d+(\.\d+)*\s*)', r'\1', content, flags=re.MULTILINE)
    
    # Corregir títulos problemáticos que Pandoc no numera correctamente
    # Asegurar que hay espacio después de ## para títulos complejos
    problematic_titles = [
        (r'^(##\s*)Hallazgo Central:', r'\1Hallazgo Central -'),
        (r'^(##\s*)Superioridad del Escenario 8:', r'\1Superioridad del Escenario 8 -'),
        (r'^(##\s*)Viabilidad Económica y Cronograma de Implementación', r'\1Viabilidad Económica y Cronograma de Implementación')
    ]
    
    for pattern, replacement in problematic_titles:
        new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
        if new_content != content:
            print(f"      - Corrigiendo título problemático en {file_path.name}")
            content = new_content
    
    if content != original_content:
        print(f"      - Aplicando correcciones en {file_path.name}")
        file_path.write_text(content, encoding='utf-8')

def wrap_tables_and_figures(content):
    """
    Envuelve tablas y figuras en contenedores CSS para evitar saltos de página
    """
    import re
    
    # Patrón para identificar títulos de tablas seguidos de tabla
    table_pattern = r'(\*\*Tabla \d+\.\d+:.*?\*\*.*?\n.*?\n)(\|.*?\|.*?\n(?:\|.*?\|.*?\n)*)'
    content = re.sub(table_pattern, r'<div class="table-container no-break">\n\1\2\n</div>\n', content, flags=re.MULTILINE | re.DOTALL)
    
    # Patrón para identificar figuras (título + imagen + descripción)
    figure_pattern = r'(\*\*Figura \d+\.\d+:.*?\*\*.*?\n.*?\n)(![\[\]()a-zA-Z0-9\s\-_./:]+.*?\n)(.*?Fuente:.*?\n)'
    content = re.sub(figure_pattern, r'<div class="figure-container no-break">\n\1\2\3\n</div>\n', content, flags=re.MULTILINE | re.DOTALL)
    
    return content

def preprocess_latex_formulas(content):
    """
    Convierte fórmulas LaTeX básicas a HTML que WeasyPrint puede renderizar
    """
    import re
    
    # Patrones de conversión LaTeX → HTML
    conversions = [
        (r'\\sum_{\s*([^}]+)\s*}\s*\^\s*{\s*([^}]+)\s*}', r'∑<sub>\1</sub><sup>\2</sup>'),  # \sum_{i=1}^{n} → ∑₁ⁿ
        (r'\\sum_{\s*([^}]+)\s*}', r'∑<sub>\1</sub>'),  # \sum_{i} → ∑ᵢ
        (r'\\sum', r'∑'),  # \sum → ∑
        (r'\\times', r'×'),  # \times → ×
        (r'\\min', r'min'),  # \min → min
        (r'\\max', r'max'),  # \max → max
        (r'\\frac{\s*([^}]+)\s*}{\s*([^}]+)\s*}', r'<span style="display: inline-block; vertical-align: middle; margin: 0 2px;"><span style="display: block; text-align: center; border-bottom: 1px solid black; padding: 0 2px;">\1</span><span style="display: block; text-align: center; padding: 0 2px;">\2</span></span>'),  # \frac{a}{b}
        (r'\\mu', r'μ'),    # \mu → μ
        (r'\\sigma', r'σ'), # \sigma → σ
        (r'\\alpha', r'α'), # \alpha → α  
        (r'\\beta', r'β'),  # \beta → β
        (r'\\sim', r'~'),   # \sim → ~
        (r'\\%', r'%'),     # \% → %
        (r'\\Delta', r'Δ'), # \Delta → Δ
        (r'_{\s*([^}]+)\s*}', r'<sub>\1</sub>'),  # _{subscript} → <sub>subscript</sub>
        (r'\^\s*{\s*([^}]+)\s*}', r'<sup>\1</sup>')   # ^{superscript} → <sup>superscript</sup>
    ]
    
    # Aplicar conversiones
    for pattern, replacement in conversions:
        content = re.sub(pattern, replacement, content)
    
    return content

def post_process_toc(html_path):
    """
    Post-procesa el HTML generado para mejorar el TOC y remover numeración de anexos
    """
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        import re
        
        # Agregar título "CONTENIDO" si no existe
        if not re.search(r'<h1[^>]*>CONTENIDO</h1>', content, re.IGNORECASE):
            # Buscar el TOC e insertar el título
            toc_pattern = r'(<nav[^>]*id="TOC"[^>]*>|<div[^>]*class="[^"]*toc[^"]*"[^>]*>)'
            replacement = r'\1\n<h1>CONTENIDO</h1>'
            content = re.sub(toc_pattern, replacement, content, flags=re.IGNORECASE)
        
        # Remover numeración de anexos con un enfoque más simple y directo
        print("🔧 Removiendo numeración de anexos...")
        
        # ANTES: Debug - buscar subtítulos de capítulos regulares para ver si están presentes
        regular_chapter_subtitles = re.findall(r'<h[2-6][^>]*>.*?<span[^>]*class="header-section-number"[^>]*>([1-6]\.\d+)</span>.*?</h[2-6]>', content, re.IGNORECASE)
        if regular_chapter_subtitles:
            print(f"🔍 ANTES: Encontrados {len(regular_chapter_subtitles)} subtítulos de capítulos regulares: {regular_chapter_subtitles[:10]}")
        
        # Debug específico para capítulos 4, 5, 6 usando data-number (más confiable)
        chapter4_subtitles = re.findall(r'data-number="(4\.\d+)"', content, re.IGNORECASE)
        chapter5_subtitles = re.findall(r'data-number="(5\.\d+)"', content, re.IGNORECASE)
        chapter6_subtitles = re.findall(r'data-number="(6\.\d+)"', content, re.IGNORECASE)
        
        print(f"🔍 CAPÍTULO 4 ANTES: {chapter4_subtitles if chapter4_subtitles else 'NINGUNO'}")
        print(f"🔍 CAPÍTULO 5 ANTES: {chapter5_subtitles if chapter5_subtitles else 'NINGUNO'}")
        print(f"🔍 CAPÍTULO 6 ANTES: {chapter6_subtitles if chapter6_subtitles else 'NINGUNO'}")
        
        # Buscar y remover spans de numeración que preceden a títulos con "ANEXO"
        # Patrón más simple: buscar <span class="header-section-number">NUMERO</span>ANEXO
        anexo_numbering_pattern = r'<span[^>]*class="header-section-number"[^>]*>[^<]*</span>\s*(ANEXO)'
        content = re.sub(anexo_numbering_pattern, r'\1', content, flags=re.IGNORECASE)
        
        # NOTA: Removido el patrón que eliminaba [A-Z]\.\d+ porque afectaba capítulos normales
        # La numeración específica de anexos se maneja más abajo con patrones más precisos
        
        # Remover numeración de anexos en el TOC también
        print("🔧 Removiendo numeración de anexos en el TOC...")
        
        # Debug: Buscar TOC para entender su estructura
        toc_section = re.search(r'<nav[^>]*id="TOC"[^>]*>.*?</nav>', content, re.DOTALL | re.IGNORECASE)
        if toc_section:
            print("📋 Estructura del TOC encontrada")
            # Buscar líneas que contengan ANEXO en el TOC
            anexo_lines = re.findall(r'.*ANEXO.*', toc_section.group(0), re.IGNORECASE)
            for line in anexo_lines:
                print(f"   TOC ANEXO: {line.strip()}")
        
        # Patrón correcto basado en la estructura real del TOC
        # Remover <span class="toc-section-number">NUMERO</span> antes de ANEXO
        toc_anexo_span_pattern = r'<span\s+class="toc-section-number">\d+</span>\s+(ANEXO[^<]*)'
        matches1 = re.findall(toc_anexo_span_pattern, content, flags=re.IGNORECASE)
        if matches1:
            print(f"   Encontrados {len(matches1)} anexos con spans de numeración")
            content = re.sub(toc_anexo_span_pattern, r'\1', content, flags=re.IGNORECASE)
        
        # Remover SOLO la numeración automática de subsecciones de anexos (que empiezan desde el capítulo 7)
        # Patrón específico para anexos: <span class="toc-section-number">7.X</span> A.X, 8.X B.X, etc.
        # donde X es cualquier número y la letra coincide con el número del anexo
        toc_anexo_double_pattern = r'<span\s+class="toc-section-number">[7-9]\.\d+</span>\s+([A-E]\.\d+[^<]*)'
        matches2 = re.findall(toc_anexo_double_pattern, content)
        if matches2:
            print(f"   Encontradas {len(matches2)} subsecciones de anexos con doble numeración en TOC")
            content = re.sub(toc_anexo_double_pattern, r'\1', content)
        
        # Patrón más específico para el caso donde hay 10+ anexos
        toc_anexo_double_pattern_10plus = r'<span\s+class="toc-section-number">1[0-5]\.\d+</span>\s+([A-E]\.\d+[^<]*)'
        matches2b = re.findall(toc_anexo_double_pattern_10plus, content)
        if matches2b:
            print(f"   Encontradas {len(matches2b)} subsecciones de anexos (10+) con doble numeración en TOC")
            content = re.sub(toc_anexo_double_pattern_10plus, r'\1', content)
            
        # También remover doble numeración en el contenido principal SOLO para anexos
        content_anexo_double_pattern = r'<span\s+class="header-section-number">[7-9]\.\d+</span>\s*([A-E]\.\d+)'
        matches3 = re.findall(content_anexo_double_pattern, content)
        if matches3:
            print(f"   Encontradas {len(matches3)} subsecciones de anexos con doble numeración en contenido")
            content = re.sub(content_anexo_double_pattern, r'\1', content)
            
        # Para anexos 10+
        content_anexo_double_pattern_10plus = r'<span\s+class="header-section-number">1[0-5]\.\d+</span>\s*([A-E]\.\d+)'
        matches3b = re.findall(content_anexo_double_pattern_10plus, content)
        if matches3b:
            print(f"   Encontradas {len(matches3b)} subsecciones de anexos (10+) con doble numeración en contenido")
            content = re.sub(content_anexo_double_pattern_10plus, r'\1', content)
            
        # DESPUÉS: Debug - verificar si los subtítulos de capítulos regulares siguen presentes
        regular_chapter_subtitles_after = re.findall(r'<h[2-6][^>]*>.*?<span[^>]*class="header-section-number"[^>]*>([1-6]\.\d+)</span>.*?</h[2-6]>', content, re.IGNORECASE)
        if regular_chapter_subtitles_after:
            print(f"🔍 DESPUÉS: Quedan {len(regular_chapter_subtitles_after)} subtítulos de capítulos regulares: {regular_chapter_subtitles_after[:10]}")
        else:
            print("⚠️  PROBLEMA: No se encontraron subtítulos de capítulos regulares después del procesamiento")
            
        # Debug específico para capítulos 4, 5, 6 DESPUÉS usando data-number
        chapter4_subtitles_after = re.findall(r'data-number="(4\.\d+)"', content, re.IGNORECASE)
        chapter5_subtitles_after = re.findall(r'data-number="(5\.\d+)"', content, re.IGNORECASE)
        chapter6_subtitles_after = re.findall(r'data-number="(6\.\d+)"', content, re.IGNORECASE)
        
        print(f"🔍 CAPÍTULO 4 DESPUÉS: {chapter4_subtitles_after if chapter4_subtitles_after else 'PERDIDOS'}")
        print(f"🔍 CAPÍTULO 5 DESPUÉS: {chapter5_subtitles_after if chapter5_subtitles_after else 'PERDIDOS'}")
        print(f"🔍 CAPÍTULO 6 DESPUÉS: {chapter6_subtitles_after if chapter6_subtitles_after else 'PERDIDOS'}")
            
        # Debug adicional: buscar si hay h2 o h3 sin numeración en capítulos 1-6
        unnumbered_subtitles = re.findall(r'<h[2-6][^>]*>(?!.*<span[^>]*class="header-section-number")([^<]+)</h[2-6]>', content, re.IGNORECASE)
        if unnumbered_subtitles:
            print(f"🔍 Subtítulos sin numeración encontrados: {unnumbered_subtitles[:5]}")
        
        # Procesar Referencias en el TOC - remover numeración y convertir a mayúsculas
        print("🔧 Procesando Referencias en TOC...")
        
        # Patrón 1: Referencias con span de numeración
        referencias_span_pattern = r'<span\s+class="toc-section-number">\d+</span>\s+Referencias'
        if re.search(referencias_span_pattern, content, flags=re.IGNORECASE):
            print("   Removiendo numeración de Referencias en TOC (con span)")
            content = re.sub(referencias_span_pattern, 'REFERENCIAS', content, flags=re.IGNORECASE)
        
        # Patrón 2: Referencias con numeración directa en el enlace
        referencias_direct_pattern = r'(<a[^>]*href[^>]*referencias[^>]*>)\s*\d+\s+Referencias</a>'
        if re.search(referencias_direct_pattern, content, flags=re.IGNORECASE):
            print("   Removiendo numeración directa de Referencias en TOC")
            content = re.sub(referencias_direct_pattern, r'\1REFERENCIAS</a>', content, flags=re.IGNORECASE)
        
        # Patrón 3: Solo convertir Referencias a mayúsculas si no tiene numeración
        referencias_simple_pattern = r'(<a[^>]*href[^>]*referencias[^>]*>)Referencias</a>'
        if re.search(referencias_simple_pattern, content, flags=re.IGNORECASE):
            print("   Convirtiendo Referencias a mayúsculas en TOC")
            content = re.sub(referencias_simple_pattern, r'\1REFERENCIAS</a>', content, flags=re.IGNORECASE)
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    except Exception as e:
        print(f"⚠️ Advertencia: No se pudo post-procesar el TOC: {e}")

def generate_figure_table_indices(html_path):
    """
    Genera índices de figuras, tablas y ecuaciones automáticamente
    """
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extraer figuras, tablas y ecuaciones usando regex
        import re
        
        # Buscar figuras: <p><strong>Figura X.Y: Título</strong> (puede tener saltos de línea)
        figures = re.findall(r'<p><strong>Figura (\d+\.\d+): (.*?)</strong>', content, re.IGNORECASE | re.DOTALL)
        
        # Buscar tablas: <p><strong>Tabla X.Y: Título</strong> (puede tener saltos de línea)
        tables = re.findall(r'<p><strong>Tabla (\d+\.\d+): (.*?)</strong>', content, re.IGNORECASE | re.DOTALL)
        
        print(f"📊 Encontrados: {len(figures)} figuras, {len(tables)} tablas")
        
        # Función para limpiar títulos (remover saltos de línea y espacios extra)
        def clean_title(title):
            return ' '.join(title.split())
        
        # Ecuaciones hardcodeadas para simplicidad y confiabilidad
        equations = [
            ("Ec.3.1", "Generación Total por Día"),
            ("Ec.3.2", "Restricción de Transporte Fina"), 
            ("Ec.3.3", "Balance de Conservación de Masa"),
            ("Ec.B.1", "Generación Total por Día"),
            ("Ec.B.2", "Restricción de Transporte Final"),
            ("Ec.B.3", "Acumulación Forzada"),
            ("Ec.B.4", "Costo Neto del Sistema"),
            ("Ec.B.5", "Balance de Conservación de Masa"),
        ]
        
        print(f"📊 Total: {len(figures)} figuras, {len(tables)} tablas, {len(equations)} ecuaciones")
        
        # Generar HTML para los índices
        indices_html = ""
        
        if figures:
            indices_html += """
<nav id="LOF" role="doc-toc">
<h2>ÍNDICE DE FIGURAS</h2>
<ul>
"""
            for fig_num, fig_title in figures:
                # Limpiar título y crear ID
                clean_fig_title = clean_title(fig_title)
                fig_id = f"figura-{fig_num.replace('.', '-')}"
                indices_html += f'<li><a href="#{fig_id}">Figura {fig_num}: {clean_fig_title}</a></li>\n'
            indices_html += "</ul>\n</nav>\n"
        
        if tables:
            indices_html += """
<nav id="LOT" role="doc-toc">
<h2>ÍNDICE DE TABLAS</h2>
<ul>
"""
            for tab_num, tab_title in tables:
                # Limpiar título y crear ID
                clean_tab_title = clean_title(tab_title)
                tab_id = f"tabla-{tab_num.replace('.', '-')}"
                indices_html += f'<li><a href="#{tab_id}">Tabla {tab_num}: {clean_tab_title}</a></li>\n'
            indices_html += "</ul>\n</nav>\n"
            
        if equations:
            indices_html += """
<nav id="LOE" role="doc-toc">
<h2>ÍNDICE DE ECUACIONES</h2>
<ul>
"""
            for eq_num, eq_title in equations:
                # Crear ID único para cada ecuación
                if eq_num == "Balance":
                    # Para la ecuación de balance sin número específico
                    eq_id = f"ecuacion-balance-integral"
                    indices_html += f'<li><a href="#{eq_id}">Ecuación de {eq_title}</a></li>\n'
                else:
                    # Para ecuaciones numeradas normales
                    eq_id = f"ecuacion-{eq_num.replace('.', '-')}"
                    indices_html += f'<li><a href="#{eq_id}">Ecuación ({eq_num}): {eq_title}</a></li>\n'
            indices_html += "</ul>\n</nav>\n"
        
        # Insertar los índices después del TOC principal
        toc_end = content.find('</nav>')
        if toc_end != -1:
            # Encontrar el final del primer </nav> (TOC principal)
            insertion_point = toc_end + 6  # Después de </nav>
            content = content[:insertion_point] + indices_html + content[insertion_point:]
        
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            print("✅ Índices de figuras, tablas y ecuaciones generados")
        else:
            print("⚠️ No se encontró el TOC principal para insertar los índices")
            
    except Exception as e:
        print(f"⚠️ Error generando índices de figuras/tablas: {e}")

def add_table_figure_classes(html_path):
    """
    Agrega clases CSS a los títulos de tablas y figuras para centrarlos
    """
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        import re
        
        # Agregar clase table-title a párrafos con títulos de tablas
        content = re.sub(
            r'<p><strong>(TABLA \d+\.\d+:.*?)</strong></p>',
            r'<p class="table-title"><strong>\1</strong></p>',
            content,
            flags=re.IGNORECASE | re.DOTALL
        )
        
        # Agregar clase figure-title a párrafos con títulos de figuras
        content = re.sub(
            r'<p><strong>(FIGURA \d+\.\d+:.*?)</strong>',
            r'<p class="figure-title"><strong>\1</strong>',
            content,
            flags=re.IGNORECASE | re.DOTALL
        )
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print("✅ Clases CSS agregadas para centrar títulos de tablas y figuras")
        
    except Exception as e:
        print(f"⚠️ Error agregando clases CSS: {e}")

def format_source_citations(html_path):
    """
    Agrega clase CSS para formatear fuentes de figuras y tablas - versión simple y segura
    """
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        import re
        
        # Solo formatear párrafos independientes que contengan fuentes
        # Enfoque conservador para evitar dañar el HTML
        content = re.sub(
            r'<p><em>\*Fuente:(.*?)</em></p>',
            r'<p class="source-citation"><em>*Fuente:\1</em></p>',
            content,
            flags=re.IGNORECASE | re.DOTALL
        )
        
        content = re.sub(
            r'<p><em>Fuente:(.*?)</em></p>',
            r'<p class="source-citation"><em>Fuente:\1</em></p>',
            content,
            flags=re.IGNORECASE | re.DOTALL
        )
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print("✅ Formato aplicado a fuentes (modo seguro)")
        
    except Exception as e:
        print(f"⚠️ Error formateando fuentes: {e}")

def format_references_section(html_path):
    """
    Formatea la sección de referencias creando contenedores individuales para cada referencia
    """
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        import re
        
        # Eliminar numeración del título de referencias
        content = re.sub(
            r'<h1[^>]*id[^>]*referencias[^>]*>.*?<span class="header-section-number">[^<]*</span>\s*Referencias</h1>',
            r'<h1 id="referencias">Referencias</h1>',
            content,
            flags=re.IGNORECASE | re.DOTALL
        )
        
        # También manejar casos sin span pero con data-number
        content = re.sub(
            r'<h1([^>]*data-number="[^"]*"[^>]*id[^>]*referencias[^>]*)>Referencias</h1>',
            r'<h1 id="referencias">Referencias</h1>',
            content,
            flags=re.IGNORECASE | re.DOTALL
        )
        
        # Encontrar la sección de referencias y restructurarla
        references_pattern = r'(<h1[^>]*id[^>]*referencias[^>]*>Referencias</h1>)(.*?)(?=<h1|</body>|$)'
        
        def restructure_references(match):
            title = match.group(1)
            refs_content = match.group(2) if match.group(2) else ""
            
            # Extraer cada párrafo de referencia
            reference_paragraphs = re.findall(r'<p>([^<]*(?:<[^>]*>[^<]*)*?)</p>', refs_content, re.DOTALL)
            
            # Crear contenedores individuales para cada referencia
            individual_references = ""
            for i, ref_content in enumerate(reference_paragraphs):
                # Cada referencia va en su propio div con clase específica
                individual_references += f'<div class="single-reference">{ref_content.strip()}</div>\n'
            
            return f'<div id="referencias-section">{title}\n{individual_references}</div>'
        
        content = re.sub(references_pattern, restructure_references, content, flags=re.IGNORECASE | re.DOTALL)
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print("✅ Referencias restructuradas en contenedores individuales")
        
    except Exception as e:
        print(f"⚠️ Error formateando referencias: {e}")

def add_equation_numbering(html_path):
    """
    Agrega numeración a las ecuaciones del capítulo 3
    """
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        import re
        
        # Definir las ecuaciones específicas del capítulo 3 con sus números
        equations_to_number = [
            # Ecuación 3.1 - Generación total
            (r'<div class="math display">\s*<span class="katex-display">[^<]*G_{total}\(t\)[^<]*\\sum_{i=1}\^{n\}[^<]*</span>\s*</div>', '(3.1)'),
            
            # Ecuación 3.11 - Restricción de transporte  
            (r'<div class="math display">[^<]*Transport_{real}[^<]*\\min[^<]*9\.6[^<]*</div>', '(3.11)'),
            
            # Ecuación 3.12 - Balance de masa
            (r'<div class="math display">[^<]*G_{total}[^<]*Material_{dispuesto}[^<]*Material_{recuperado}[^<]*</div>', '(3.12)')
        ]
        
        # Contador para verificar cuántas ecuaciones se numeran
        equations_numbered = 0
        
        # Procesar cada ecuación
        for pattern, number in equations_to_number:
            # Buscar la ecuación y agregar numeración
            def add_number(match):
                nonlocal equations_numbered
                equations_numbered += 1
                # Envolver la ecuación con un div que incluye la numeración
                original = match.group(0)
                return f'<div class="numbered-equation">{original}<span class="equation-number">{number}</span></div>'
            
            content = re.sub(pattern, add_number, content, flags=re.IGNORECASE | re.DOTALL)
        
        # Si no encontramos las ecuaciones usando patrones específicos, usar un enfoque más general
        if equations_numbered == 0:
            print("⚠️ Patrones específicos no encontrados, usando enfoque general...")
            
            # Buscar todas las ecuaciones display en el capítulo 3
            chapter3_start = content.find('<h1 data-number="3"')
            chapter4_start = content.find('<h1 data-number="4"')
            
            if chapter3_start != -1:
                chapter3_content = content[chapter3_start:chapter4_start] if chapter4_start != -1 else content[chapter3_start:]
                
                # Buscar ecuaciones display en el capítulo 3
                display_equations = re.findall(r'<div class="math display">.*?</div>', chapter3_content, re.DOTALL)
                
                if len(display_equations) >= 3:
                    # Numerar las 3 ecuaciones principales
                    equation_numbers = ['(3.1)', '(3.11)', '(3.12)']
                    
                    for i, eq_num in enumerate(equation_numbers):
                        if i < len(display_equations):
                            original_eq = display_equations[i]
                            numbered_eq = f'<div class="numbered-equation">{original_eq}<span class="equation-number">{eq_num}</span></div>'
                            content = content.replace(original_eq, numbered_eq, 1)
                            equations_numbered += 1
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"✅ Numeración agregada a {equations_numbered} ecuaciones del capítulo 3")
        
    except Exception as e:
        print(f"⚠️ Error agregando numeración de ecuaciones: {e}")

def combine_cover_and_main(cover_html_path, main_html_path, output_html_path):
    """
    Combina el HTML de la portada con el HTML principal, colocando la portada como primera página
    """
    try:
        # Leer el HTML de la portada
        with open(cover_html_path, 'r', encoding='utf-8') as f:
            cover_html = f.read()
        
        # Leer el HTML principal
        with open(main_html_path, 'r', encoding='utf-8') as f:
            main_html = f.read()
        
        # Extraer el body de la portada
        import re
        cover_body_match = re.search(r'<body[^>]*>(.*?)</body>', cover_html, re.DOTALL)
        cover_body = cover_body_match.group(1) if cover_body_match else ""
        
        # Insertar la portada al inicio del body del documento principal
        def insert_cover(match):
            opening_tag = match.group(1)
            body_content = match.group(2)
            return f'{opening_tag}\n<div class="cover-page">{cover_body}</div>\n<div class="page-break"></div>\n{body_content}'
        
        combined_html = re.sub(r'(<body[^>]*>)(.*?)</body>', insert_cover, main_html, flags=re.DOTALL)
        
        # Escribir el HTML combinado
        with open(output_html_path, 'w', encoding='utf-8') as f:
            f.write(combined_html)
            
    except Exception as e:
        print(f"⚠️ Advertencia: No se pudo combinar la portada: {e}")

def markdown_to_html_with_formulas(markdown_files, cover_content, first_page_content, output_html_path, css_path):
    """
    Convierte Markdown a HTML procesando fórmulas LaTeX para WeasyPrint
    """
    if not markdown_files and not cover_content:
        print("❌ No hay archivos Markdown para procesar.", file=sys.stderr)
        return False

    print("\n🔄 Procesando Markdown con fórmulas LaTeX y paginación inteligente...")
    
    import re  # Mover import al inicio de la función

    # Empezar con el contenido de la portada si existe
    combined_content = ""
    if cover_content:
        # Procesar la portada para separar del contenido principal
        combined_content = cover_content + "\n\n<div class='page-break'></div>\n\n"
    
    # NOTA: La primera página ahora se procesa con el contenido principal, no aquí
    
    # Leer y procesar todos los archivos Markdown
    for markdown_file in markdown_files:
        with open(markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # PASO 0: Convertir rutas de imagen de GitHub a rutas para WeasyPrint
        # GitHub usa ../recursos/ pero WeasyPrint necesita recursos/ desde el directorio tesis/
        content = re.sub(r'\.\./recursos/', 'recursos/', content)
        
        # PASO 1: Agrupar tablas y figuras para evitar saltos de página
        content = wrap_tables_and_figures(content)
        
        # PASO 2: Procesar fórmulas LaTeX - primero display, luego inline
        
        # Procesar fórmulas de display $$...$$ (centradas)
        def process_display_formula(match):
            latex_content = match.group(1)
            processed = preprocess_latex_formulas(latex_content)
            return f'<div class="math-display">{processed}</div>'
        
        # Procesar fórmulas inline $...$ (en línea)
        def process_inline_formula(match):
            latex_content = match.group(1)
            processed = preprocess_latex_formulas(latex_content)
            return f'<span class="math-formula">{processed}</span>'
        
        # Convertir bloques $$...$$ a HTML centrado primero
        content = re.sub(r'\$\$([^$]+)\$\$', process_display_formula, content)
        
        # Luego convertir bloques $...$ a HTML inline
        content = re.sub(r'\$([^$]+)\$', process_inline_formula, content)
        combined_content += content + "\n\n"
    
    # Escribir archivo temporal combinado
    temp_md_file = output_html_path.parent / "temp_combined.md"
    with open(temp_md_file, 'w', encoding='utf-8') as f:
        f.write(combined_content)
    
    # Crear HTML de portada por separado para evitar numeración en TOC
    if cover_content:
        # Convertir SOLO la portada a HTML sin numeración ni TOC
        temp_cover_file = output_html_path.parent / "temp_cover.md"
        with open(temp_cover_file, 'w', encoding='utf-8') as f:
            f.write(cover_content)
        
        cover_html_file = output_html_path.parent / "cover.html"
        cover_command = [
            'pandoc',
            '--from=markdown',
            '--to=html5',
            '--standalone',
            '--css', str(css_path.name),
            '-o', str(cover_html_file),
            str(temp_cover_file)
        ]
        
        try:
            subprocess.run(cover_command, check=True, capture_output=True, text=True, encoding='utf-8')
        except (FileNotFoundError, subprocess.CalledProcessError):
            pass  # Continuar si falla la portada
        finally:
            if temp_cover_file.exists():
                temp_cover_file.unlink()
    
    # Crear contenido principal con numeración y TOC (incluyendo primera página pero excluyendo portada)
    main_content = ""
    
    # Agregar primera página al contenido principal (antes que los capítulos)
    if first_page_content:
        processed_first_page = re.sub(r'\.\./recursos/', 'recursos/', first_page_content)
        main_content += processed_first_page + "\n\n<div class='page-break'></div>\n\n"
    
    for markdown_file in markdown_files:
        with open(markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Convertir rutas de imagen de GitHub a rutas para WeasyPrint
        content = re.sub(r'\.\./recursos/', 'recursos/', content)
        content = wrap_tables_and_figures(content)
        
        # Procesar fórmulas de display $$...$$ (centradas)
        def process_display_formula(match):
            latex_content = match.group(1)
            processed = preprocess_latex_formulas(latex_content)
            return f'<div class="math-display">{processed}</div>'
        
        # Procesar fórmulas inline $...$ (en línea)
        def process_inline_formula(match):
            latex_content = match.group(1)
            processed = preprocess_latex_formulas(latex_content)
            return f'<span class="math-formula">{processed}</span>'
        
        # Convertir bloques $$...$$ a HTML centrado primero
        content = re.sub(r'\$\$([^$]+)\$\$', process_display_formula, content)
        
        # Luego convertir bloques $...$ a HTML inline
        content = re.sub(r'\$([^$]+)\$', process_inline_formula, content)
        main_content += content + "\n\n"
    
    temp_main_file = output_html_path.parent / "temp_main.md"
    with open(temp_main_file, 'w', encoding='utf-8') as f:
        f.write(main_content)
    
    # Usar Pandoc para convertir el contenido principal a HTML
    command = [
        'pandoc',
        '--from=markdown',
        '--to=html5',
        '--standalone',
        '--number-sections',
        '--toc',
        '--toc-depth=2',
        '--css', str(css_path.name),
        '-o', str(output_html_path),
        str(temp_main_file)
    ]

    try:
        subprocess.run(command, check=True, capture_output=True, text=True, encoding='utf-8')
        
        # Si hay portada, combinar los HTMLs
        if cover_content and (output_html_path.parent / "cover.html").exists():
            combine_cover_and_main(output_html_path.parent / "cover.html", output_html_path, output_html_path)
        
        # Post-procesar HTML para agregar números de página al TOC
        post_process_toc(output_html_path)
        
        # Generar índices de figuras, tablas y ecuaciones
        generate_figure_table_indices(output_html_path)
        
        # Agregar clases CSS para centrar títulos de tablas y figuras
        add_table_figure_classes(output_html_path)
        
        # Agregar formato a fuentes de figuras y tablas
        format_source_citations(output_html_path)
        
        # Formatear sección de referencias
        format_references_section(output_html_path)
        
        # Numeración de ecuaciones ahora se hace directamente en markdown
        # add_equation_numbering(output_html_path)
        
        print(f"✅ HTML con fórmulas procesadas generado: {output_html_path.name}")
        
        # Limpiar archivos temporales
        temp_md_file.unlink()
        temp_main_file.unlink()
        if (output_html_path.parent / "cover.html").exists():
            (output_html_path.parent / "cover.html").unlink()
        return True
    except FileNotFoundError:
        print("❌ ERROR: El comando 'pandoc' no se encontró.", file=sys.stderr)
        return False
    except subprocess.CalledProcessError as e:
        print("❌ ERROR durante la conversión a HTML:", file=sys.stderr)
        if e.stderr:
            print(e.stderr)
        return False

def html_to_pdf_with_weasyprint(html_path, output_pdf_path):
    """
    Paso 2: Usa WeasyPrint para convertir el archivo HTML a PDF, aplicando
    fielmente los estilos del CSS enlazado.
    """
    print("\n[Paso 2/2] 📄 Usando WeasyPrint para generar el PDF final...")
    try:
        from weasyprint import HTML
        # base_url es crucial para que encuentre las imágenes con rutas relativas
        base_url = html_path.parent
        html_doc = HTML(filename=str(html_path), base_url=str(base_url))
        html_doc.write_pdf(target=str(output_pdf_path))
        print(f"✅ PDF final generado exitosamente: {output_pdf_path.name}")
        return True
    except ImportError:
        print("❌ ERROR: La librería 'weasyprint' no está instalada.", file=sys.stderr)
        print("   Por favor, ejecute: pip install weasyprint", file=sys.stderr)
        return False
    except Exception as e:
        print(f"❌ ERROR durante la generación del PDF con WeasyPrint:", file=sys.stderr)
        print(e)
        return False

def main():
    """Función principal que orquesta el proceso de generación."""
    print("=" * 60)
    print("🏗️  GENERADOR DE PDF PARA TESINA (Hybrid LaTeX v5.1)")
    print("=" * 60)

    base_path = Path(__file__).resolve().parent
    css_path = base_path / 'formato_tesina.css'
    html_temp_path = base_path / 'tesina_completa.html'
    pdf_output_path = base_path / 'TESINA_HOLBOX_FINAL.pdf'

    if not css_path.exists():
        print(f"❌ ERROR: No se encuentra el archivo de estilos '{css_path.name}'.")
        return

    markdown_files, cover_content, first_page_content = get_markdown_files(base_path)
    if not markdown_files and not cover_content:
        return

    # Estrategia híbrida: Markdown → HTML (con fórmulas procesadas) → PDF
    success = False
    try:
        # Paso 1: Markdown → HTML con fórmulas LaTeX convertidas
        if markdown_to_html_with_formulas(markdown_files, cover_content, first_page_content, html_temp_path, css_path):
            # Paso 2: HTML → PDF con WeasyPrint
            if html_to_pdf_with_weasyprint(html_temp_path, pdf_output_path):
                success = True
    finally:
        # Limpieza temporal (comentado para diagnóstico)
        # if html_temp_path.exists():
        #     html_temp_path.unlink()
        print(f"\n🔍 HTML mantenido para diagnóstico: {html_temp_path}")

    if success:
        print(f"\n🎉 ¡Proceso completado exitosamente!")
        print(f"📄 Tu tesina está lista en: {pdf_output_path}")
        print(f"🧮 Las fórmulas LaTeX han sido convertidas a HTML matemático")
        print(f"📑 Tablas y figuras están agrupadas para evitar saltos de página")
    else:
        print(f"\n❌ No se pudo generar el PDF. Revisa los errores anteriores.")

if __name__ == "__main__":
    main()

