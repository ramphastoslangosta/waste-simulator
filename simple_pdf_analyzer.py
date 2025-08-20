#!/usr/bin/env python3
"""
Simple PDF Analyzer for Holbox Document using PyPDF2
Extracts text and identifies key sections for manual extraction
"""

import PyPDF2
import re
import sys

def analyze_holbox_pdf(pdf_path):
    """Analyze the Holbox PDF and identify key sections"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            print("HOLBOX WASTE MANAGEMENT DOCUMENT ANALYSIS")
            print("="*80)
            print(f"Total pages: {num_pages}")
            print(f"Document: {pdf_path}")
            
            # Search for key terms across all pages
            key_terms = {
                'generation': ['generación', 'producción', 'ton', 'kg', 'residuos generados'],
                'costs': ['costo', 'presupuesto', 'peso', 'económico', 'financiero'],
                'collection': ['recolección', 'recolecta', 'camión', 'vehículo'],
                'population': ['población', 'habitantes', 'demográfico'],
                'tourism': ['turismo', 'turista', 'ocupación', 'hotelera'],
                'infrastructure': ['infraestructura', 'capacidad', 'equipamiento']
            }
            
            # Track pages with relevant content
            relevant_pages = {}
            section_pages = {}
            
            print("\nSCANNING DOCUMENT FOR RELEVANT CONTENT:")
            print("-" * 40)
            
            for page_num in range(min(50, num_pages)):  # Analyze first 50 pages
                try:
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text().lower()
                    
                    if len(text) < 50:  # Skip mostly empty pages
                        continue
                    
                    page_score = 0
                    found_terms = []
                    
                    # Score pages based on key terms
                    for category, terms in key_terms.items():
                        for term in terms:
                            count = len(re.findall(term, text))
                            if count > 0:
                                page_score += count
                                found_terms.append(f"{term}({count})")
                    
                    # Look for numerical data patterns
                    numbers = re.findall(r'\d+[.,]\d+|\d+\s*(ton|kg|peso|habitante)', text)
                    if numbers:
                        page_score += len(numbers) * 2  # Weight numerical data highly
                        found_terms.extend([f"números({len(numbers)})"])
                    
                    if page_score > 5:  # Threshold for relevance
                        relevant_pages[page_num + 1] = {
                            'score': page_score,
                            'terms': found_terms[:10],  # Limit displayed terms
                            'has_numbers': len(numbers) > 0
                        }
                    
                    # Look for section headers
                    lines = text.split('\n')
                    for line in lines[:10]:  # Check first 10 lines for headers
                        line = line.strip()
                        if len(line) > 5 and len(line) < 100:
                            for category, terms in key_terms.items():
                                if any(term in line for term in terms):
                                    if category not in section_pages:
                                        section_pages[category] = []
                                    section_pages[category].append(page_num + 1)
                                    break
                
                except Exception as e:
                    print(f"Error processing page {page_num + 1}: {e}")
                    continue
            
            # Display results
            print(f"Found {len(relevant_pages)} pages with relevant content\n")
            
            print("TOP PRIORITY PAGES FOR EXTRACTION:")
            print("-" * 40)
            sorted_pages = sorted(relevant_pages.items(), key=lambda x: x[1]['score'], reverse=True)
            
            for page_num, info in sorted_pages[:15]:  # Show top 15 pages
                numbers_indicator = " 📊" if info['has_numbers'] else ""
                print(f"Page {page_num:3d} (score: {info['score']:2d}): {', '.join(info['terms'][:5])}{numbers_indicator}")
            
            print(f"\nSECTION DISTRIBUTION:")
            print("-" * 40)
            for category, pages in section_pages.items():
                pages_unique = list(set(pages))[:5]  # Remove duplicates, show first 5
                pages_str = ', '.join(map(str, pages_unique))
                print(f"{category.capitalize():12}: Pages {pages_str}")
            
            return relevant_pages, section_pages
            
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None, None

def suggest_extraction_strategy(relevant_pages, section_pages):
    """Suggest manual extraction strategy"""
    print(f"\n" + "="*80)
    print("RECOMMENDED EXTRACTION STRATEGY:")
    print("-" * 40)
    
    if relevant_pages:
        # Get top pages
        top_pages = sorted(relevant_pages.items(), key=lambda x: x[1]['score'], reverse=True)[:10]
        high_value_pages = [page for page, info in top_pages if info['has_numbers']][:5]
        
        if high_value_pages:
            print("1. PRIORITY EXTRACTION - Pages with quantitative data:")
            for page in high_value_pages:
                print(f"   → Page {page} - Look for tables, numbers, specific metrics")
        
        print(f"\n2. SECTION-BY-SECTION APPROACH:")
        priority_sections = ['generation', 'costs', 'collection', 'population']
        for section in priority_sections:
            if section in section_pages:
                pages = list(set(section_pages[section]))[:3]
                print(f"   → {section.capitalize()}: Focus on pages {pages}")
        
        print(f"\n3. MANUAL SPLITTING SUGGESTIONS:")
        print(f"   → Extract pages {high_value_pages} as priority section")
        print(f"   → Create separate files for major sections")
        print(f"   → Focus on tables and numerical data first")
        
        print(f"\n4. DATA TO LOOK FOR:")
        print(f"   → Waste generation: tons/day, tons/month, kg/person/day")
        print(f"   → Costs: annual budget, cost per ton, operational costs")
        print(f"   → Population: permanent residents, tourist capacity")
        print(f"   → Collection: frequency, coverage, efficiency rates")

if __name__ == "__main__":
    pdf_path = "/Users/rafaellang/Library/Mobile Documents/com~apple~CloudDocs/Proyectos/waste-simulator/docs/Holbox.WP2E.DocumentoMaestro.pdf"
    
    relevant_pages, section_pages = analyze_holbox_pdf(pdf_path)
    
    if relevant_pages:
        suggest_extraction_strategy(relevant_pages, section_pages)
        
        print(f"\nNEXT STEPS:")
        print(f"1. Manually extract data from high-priority pages")
        print(f"2. Use PDF viewer to copy specific tables/numbers")
        print(f"3. Fill in the Existing-Reports-Analysis-Template.md")
        print(f"4. Format data for validation framework")