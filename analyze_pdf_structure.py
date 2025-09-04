#!/usr/bin/env python3
"""
PDF Structure Analyzer for Holbox Waste Management Document
Extracts table of contents, headings, and identifies key sections for data extraction
"""

import fitz  # PyMuPDF
import re
import sys

def analyze_pdf_structure(pdf_path):
    """Analyze PDF structure and extract headings/sections"""
    try:
        doc = fitz.open(pdf_path)
        print(f"Document: {pdf_path}")
        print(f"Total pages: {doc.page_count}")
        print(f"Document size: {doc.metadata}")
        print("\n" + "="*80)
        
        # Try to extract table of contents if available
        toc = doc.get_toc()
        if toc:
            print("TABLE OF CONTENTS:")
            print("-" * 40)
            for level, title, page_num in toc:
                indent = "  " * (level - 1)
                print(f"{indent}{title} ... page {page_num}")
            print("\n" + "="*80)
        
        # Search for heading patterns in first few pages
        print("DETECTED HEADINGS (First 10 pages):")
        print("-" * 40)
        
        heading_patterns = [
            r'^[0-9]+\.?\s+[A-ZÁÉÍÓÚÑÜ][A-Za-z\s]{10,}',  # Numbered sections
            r'^[A-ZÁÉÍÓÚÑÜ][A-Za-z\s]{5,}:?\s*$',        # Title case headings
            r'^\d+\.\d+\.?\s+[A-Za-z]',                   # Subsections
        ]
        
        headings_found = []
        
        for page_num in range(min(15, doc.page_count)):  # Check first 15 pages
            page = doc[page_num]
            text = page.get_text()
            lines = text.split('\n')
            
            for line_num, line in enumerate(lines):
                line = line.strip()
                if len(line) < 5:
                    continue
                    
                for pattern in heading_patterns:
                    if re.match(pattern, line):
                        # Check if it looks like a heading (not too long, proper case)
                        if len(line) < 100 and not line.islower():
                            headings_found.append({
                                'page': page_num + 1,
                                'text': line,
                                'line': line_num
                            })
                            print(f"Page {page_num + 1}: {line}")
                            break
        
        print(f"\nFound {len(headings_found)} potential headings")
        print("\n" + "="*80)
        
        # Look for data-rich sections (tables, numbers)
        print("SECTIONS WITH QUANTITATIVE DATA:")
        print("-" * 40)
        
        data_indicators = [
            r'ton(elada)?s?',
            r'peso?s?',
            r'costo?s?',
            r'\d+[.,]\d+',
            r'presupuesto',
            r'kg\s',
            r'm3\s',
            r'habitantes',
            r'población',
            r'generación',
            r'recolección',
            r'transport'
        ]
        
        data_pages = {}
        
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text = page.get_text().lower()
            
            score = 0
            matches = []
            for indicator in data_indicators:
                found = re.findall(indicator, text)
                if found:
                    score += len(found)
                    matches.extend(found[:3])  # Limit matches shown
            
            if score > 3:  # Threshold for data-rich pages
                data_pages[page_num + 1] = {'score': score, 'matches': matches}
        
        # Show top data-rich pages
        sorted_pages = sorted(data_pages.items(), key=lambda x: x[1]['score'], reverse=True)
        for page_num, info in sorted_pages[:10]:
            print(f"Page {page_num}: {info['score']} data indicators - {info['matches'][:5]}")
        
        print("\n" + "="*80)
        
        # Search for specific sections we need for validation
        print("SEARCHING FOR KEY VALIDATION SECTIONS:")
        print("-" * 40)
        
        key_sections = {
            'Diagnóstico': r'diagnóstico|situación actual|estado actual',
            'Generación': r'generación.*residuos|producción.*residuos',
            'Costos': r'costos?|presupuesto|económic|financier',
            'Recolección': r'recolección|recolecta|sistema.*recolec',
            'Población': r'población|habitantes|demograf',
            'Turismo': r'turismo|turista|ocupación hotelera',
            'Capacidades': r'capacidad|infraestructura|equipamiento'
        }
        
        section_pages = {}
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text = page.get_text().lower()
            
            for section_name, pattern in key_sections.items():
                if re.search(pattern, text):
                    if section_name not in section_pages:
                        section_pages[section_name] = []
                    section_pages[section_name].append(page_num + 1)
        
        for section, pages in section_pages.items():
            pages_str = ', '.join(map(str, pages[:5]))  # Show first 5 pages
            if len(pages) > 5:
                pages_str += f" ... (+{len(pages)-5} more)"
            print(f"{section}: Pages {pages_str}")
        
        doc.close()
        return headings_found, data_pages, section_pages
        
    except Exception as e:
        print(f"Error analyzing PDF: {e}")
        return None, None, None

def suggest_extraction_plan(headings, data_pages, section_pages):
    """Suggest optimal extraction strategy"""
    print("\n" + "="*80)
    print("SUGGESTED EXTRACTION PLAN:")
    print("-" * 40)
    
    if section_pages:
        priority_sections = ['Diagnóstico', 'Generación', 'Costos', 'Recolección']
        
        for section in priority_sections:
            if section in section_pages:
                pages = section_pages[section][:3]  # Focus on first 3 pages per section
                print(f"1. Extract '{section}' section: Pages {pages}")
                print(f"   - Focus on quantitative data and tables")
                print(f"   - Look for specific metrics and units")
    
    if data_pages:
        top_data_pages = sorted(data_pages.items(), key=lambda x: x[1]['score'], reverse=True)[:5]
        print(f"\n2. Priority pages for data extraction:")
        for page_num, info in top_data_pages:
            print(f"   - Page {page_num} (score: {info['score']}) - {info['matches'][:3]}")
    
    print(f"\n3. Recommended approach:")
    print(f"   - Start with highest-scoring pages for quantitative data")
    print(f"   - Extract tables and numerical data systematically") 
    print(f"   - Document methodology and limitations")
    print(f"   - Focus on waste generation, costs, and operational metrics")

if __name__ == "__main__":
    pdf_path = "/Users/rafaellang/Library/Mobile Documents/com~apple~CloudDocs/Proyectos/waste-simulator/docs/Holbox.WP2E.DocumentoMaestro.pdf"
    
    print("HOLBOX WASTE MANAGEMENT DOCUMENT ANALYSIS")
    print("="*80)
    
    headings, data_pages, section_pages = analyze_pdf_structure(pdf_path)
    
    if headings is not None:
        suggest_extraction_plan(headings, data_pages, section_pages)
    
    print(f"\nNext steps:")
    print(f"1. Use this analysis to identify specific pages to extract")
    print(f"2. Create smaller PDF sections from priority pages") 
    print(f"3. Extract quantitative data for validation framework")