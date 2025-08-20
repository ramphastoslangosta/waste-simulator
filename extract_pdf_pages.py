#!/usr/bin/env python3
"""
PDF Page Extractor for Holbox Document
Creates smaller PDF files from high-priority pages for analysis
"""

import PyPDF2
import os

def extract_pages(input_pdf, output_dir, page_groups):
    """Extract specific pages into separate PDF files"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        with open(input_pdf, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            
            print(f"Source PDF: {total_pages} pages")
            print(f"Output directory: {output_dir}")
            print("=" * 50)
            
            for group_name, pages in page_groups.items():
                # Create a new PDF writer for this group
                pdf_writer = PyPDF2.PdfWriter()
                
                valid_pages = []
                for page_num in pages:
                    # Convert to 0-indexed
                    page_idx = page_num - 1
                    
                    if 0 <= page_idx < total_pages:
                        pdf_writer.add_page(pdf_reader.pages[page_idx])
                        valid_pages.append(page_num)
                    else:
                        print(f"Warning: Page {page_num} out of range (max: {total_pages})")
                
                if valid_pages:
                    # Write the extracted pages to a new file
                    output_file = os.path.join(output_dir, f"{group_name}.pdf")
                    
                    with open(output_file, 'wb') as output:
                        pdf_writer.write(output)
                    
                    file_size = os.path.getsize(output_file) / (1024 * 1024)  # Size in MB
                    print(f"✓ Created: {group_name}.pdf")
                    print(f"  Pages: {valid_pages}")
                    print(f"  Size: {file_size:.1f} MB")
                    print(f"  File: {output_file}")
                    print()
                else:
                    print(f"✗ No valid pages for {group_name}")
            
            return True
            
    except Exception as e:
        print(f"Error extracting pages: {e}")
        return False

def main():
    # Input PDF file
    input_pdf = "/Users/rafaellang/Library/Mobile Documents/com~apple~CloudDocs/Proyectos/waste-simulator/docs/Holbox.WP2E.DocumentoMaestro.pdf"
    
    # Output directory for extracted files
    output_dir = "/Users/rafaellang/Library/Mobile Documents/com~apple~CloudDocs/Proyectos/waste-simulator/docs/extracted_sections"
    
    # Define page groups based on analysis results
    page_groups = {
        # Top priority - highest scoring pages with quantitative data
        "01_Priority_Generation_Data": [22, 23],  # Highest scores: 75, 77
        
        # Secondary priority - waste flows and collection
        "02_Waste_Flows_Collection": [47, 49, 20],  # Scores: 45, 45, 42
        
        # Supporting data - context and methodology
        "03_Context_Demographics": [12, 13, 2],  # Economic, population context
        
        # Additional quantitative pages
        "04_Additional_Metrics": [24, 27, 50],  # More tonnage and collection data
        
        # Background/introduction (if needed)
        "05_Background": [1, 2, 3]  # Introduction and overview
    }
    
    print("HOLBOX PDF PAGE EXTRACTION")
    print("=" * 50)
    print("Extracting high-priority pages for validation analysis...")
    print()
    
    success = extract_pages(input_pdf, output_dir, page_groups)
    
    if success:
        print("EXTRACTION COMPLETE!")
        print("=" * 50)
        print("Next steps:")
        print("1. Review extracted PDFs (should be <32MB each)")
        print("2. Start with 01_Priority_Generation_Data.pdf")
        print("3. Extract quantitative data systematically")
        print("4. Use the Existing-Reports-Analysis-Template.md")
        print()
        print("File locations:")
        for group_name in page_groups.keys():
            file_path = os.path.join(output_dir, f"{group_name}.pdf")
            print(f"  - {file_path}")
    else:
        print("Extraction failed. Check error messages above.")

if __name__ == "__main__":
    main()