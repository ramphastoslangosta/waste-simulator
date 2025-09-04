#!/usr/bin/env python3
"""
Tornado Chart Generator for Waste Management Sensitivity Analysis
Creates professional academic-quality tornado charts for THESIS-004

Author: Claude Code Assistant
Date: August 2025
Purpose: Visualize sensitivity analysis results for Isla Holbox waste management model
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
from pathlib import Path

def create_charts_directory():
    """Create charts directory if it doesn't exist"""
    charts_dir = Path("charts")
    charts_dir.mkdir(exist_ok=True)
    return charts_dir

def load_sensitivity_data():
    """Load and process sensitivity analysis results"""
    df = pd.read_csv('data/sensitivity-summary-results.csv')
    return df

def create_parameter_impact_summary(df):
    """Create summary of parameter impacts across all KPIs"""
    
    # Calculate average impact across all KPIs for each parameter
    parameter_summary = df.groupby('Parameter').agg({
        'Relative_Sensitivity_%': 'mean',
        'Description': 'first'
    }).reset_index()
    
    parameter_summary = parameter_summary.sort_values('Relative_Sensitivity_%', ascending=False)
    
    return parameter_summary

def create_tornado_chart_overall(parameter_summary, charts_dir):
    """Create overall tornado chart showing average parameter impacts"""
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Prepare data
    params = parameter_summary['Description'].values
    impacts = parameter_summary['Relative_Sensitivity_%'].values
    
    # Create color gradient (red for high impact, blue for low impact)
    colors = plt.cm.RdYlBu_r(np.linspace(0.2, 0.8, len(params)))
    
    # Create horizontal bar chart
    y_pos = np.arange(len(params))
    bars = ax.barh(y_pos, impacts, color=colors, alpha=0.8, edgecolor='black', linewidth=0.5)
    
    # Customize chart
    ax.set_yticks(y_pos)
    ax.set_yticklabels([param[:50] + "..." if len(param) > 50 else param for param in params], fontsize=10)
    ax.set_xlabel('Average Sensitivity Impact (%)', fontsize=12, fontweight='bold')
    ax.set_title('Tornado Chart: Parameter Sensitivity Analysis\nImpact on System Performance (Average Across All KPIs)', 
                 fontsize=14, fontweight='bold', pad=20)
    
    # Add value labels on bars
    for i, (bar, impact) in enumerate(zip(bars, impacts)):
        ax.text(impact + 0.5, bar.get_y() + bar.get_height()/2, 
                f'{impact:.1f}%', ha='left', va='center', fontweight='bold', fontsize=9)
    
    # Add grid for better readability
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)
    
    # Improve layout
    plt.tight_layout()
    
    # Save high-resolution chart
    output_path = charts_dir / "tornado_chart_overall_sensitivity.png"
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    return output_path

def create_tornado_chart_by_kpi(df, charts_dir):
    """Create individual tornado charts for each KPI"""
    
    kpis = df['KPI'].unique()
    
    for kpi in kpis:
        kpi_data = df[df['KPI'] == kpi].sort_values('Relative_Sensitivity_%', ascending=False)
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Prepare data
        params = kpi_data['Description'].values
        impacts = kpi_data['Relative_Sensitivity_%'].values
        
        # Create color gradient
        colors = plt.cm.RdYlBu_r(np.linspace(0.2, 0.8, len(params)))
        
        # Create horizontal bar chart
        y_pos = np.arange(len(params))
        bars = ax.barh(y_pos, impacts, color=colors, alpha=0.8, edgecolor='black', linewidth=0.5)
        
        # Customize chart
        ax.set_yticks(y_pos)
        ax.set_yticklabels([param[:40] + "..." if len(param) > 40 else param for param in params], fontsize=9)
        ax.set_xlabel('Sensitivity Impact (%)', fontsize=11, fontweight='bold')
        ax.set_title(f'Parameter Sensitivity: {kpi}', fontsize=12, fontweight='bold', pad=15)
        
        # Add value labels on bars
        for i, (bar, impact) in enumerate(zip(bars, impacts)):
            if impact > 0:  # Only show labels for non-zero impacts
                ax.text(impact + max(impacts)*0.01, bar.get_y() + bar.get_height()/2, 
                        f'{impact:.1f}%', ha='left', va='center', fontweight='bold', fontsize=8)
        
        # Add grid for better readability
        ax.grid(axis='x', alpha=0.3, linestyle='--')
        ax.set_axisbelow(True)
        
        # Improve layout
        plt.tight_layout()
        
        # Save high-resolution chart
        safe_kpi_name = kpi.replace('/', '_').replace(' ', '_')
        output_path = charts_dir / f"tornado_chart_{safe_kpi_name}.png"
        plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        
        print(f"✅ Created tornado chart for {kpi}")

def create_spider_chart(parameter_summary, charts_dir):
    """Create spider/radar chart showing parameter impacts"""
    
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
    
    # Prepare data
    params = parameter_summary['Description'].values[:7]  # Top 7 parameters
    impacts = parameter_summary['Relative_Sensitivity_%'].values[:7]
    
    # Number of variables
    N = len(params)
    
    # Compute angle for each parameter
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]  # Complete the circle
    
    # Add impacts and close the polygon
    impacts_plot = list(impacts) + [impacts[0]]
    
    # Plot
    ax.plot(angles, impacts_plot, 'o-', linewidth=2, label='Parameter Impact', color='red')
    ax.fill(angles, impacts_plot, alpha=0.25, color='red')
    
    # Add labels
    ax.set_xticks(angles[:-1])
    short_labels = [param[:20] + "..." if len(param) > 20 else param for param in params]
    ax.set_xticklabels(short_labels, fontsize=10)
    
    # Set y-axis
    ax.set_ylim(0, max(impacts) * 1.1)
    ax.set_yticks(np.linspace(0, max(impacts), 5))
    ax.set_yticklabels([f'{val:.1f}%' for val in np.linspace(0, max(impacts), 5)], fontsize=8)
    
    # Add title
    ax.set_title('Spider Chart: Top 7 Most Influential Parameters\nAverage Impact Across All KPIs', 
                 fontsize=14, fontweight='bold', pad=30)
    
    # Add grid
    ax.grid(True, alpha=0.3)
    
    # Save high-resolution chart
    output_path = charts_dir / "spider_chart_parameter_sensitivity.png"
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    return output_path

def create_comparison_chart(parameter_summary, charts_dir):
    """Create comparison chart showing top vs bottom parameters"""
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # Top 5 parameters
    top_params = parameter_summary.head(5)
    ax1.barh(range(len(top_params)), top_params['Relative_Sensitivity_%'], 
             color='red', alpha=0.7, edgecolor='black')
    ax1.set_yticks(range(len(top_params)))
    ax1.set_yticklabels([param[:30] + "..." if len(param) > 30 else param 
                         for param in top_params['Description']], fontsize=9)
    ax1.set_xlabel('Sensitivity Impact (%)', fontsize=11)
    ax1.set_title('Most Influential Parameters\n(Top 5)', fontsize=12, fontweight='bold')
    ax1.grid(axis='x', alpha=0.3)
    
    # Add value labels
    for i, impact in enumerate(top_params['Relative_Sensitivity_%']):
        ax1.text(impact + 0.5, i, f'{impact:.1f}%', va='center', fontweight='bold')
    
    # Bottom parameters (with some impact)
    bottom_params = parameter_summary.tail(5)
    bottom_params = bottom_params[bottom_params['Relative_Sensitivity_%'] > 0]
    
    if len(bottom_params) > 0:
        ax2.barh(range(len(bottom_params)), bottom_params['Relative_Sensitivity_%'], 
                 color='blue', alpha=0.7, edgecolor='black')
        ax2.set_yticks(range(len(bottom_params)))
        ax2.set_yticklabels([param[:30] + "..." if len(param) > 30 else param 
                             for param in bottom_params['Description']], fontsize=9)
        ax2.set_xlabel('Sensitivity Impact (%)', fontsize=11)
        ax2.set_title('Least Influential Parameters\n(Bottom 5)', fontsize=12, fontweight='bold')
        ax2.grid(axis='x', alpha=0.3)
        
        # Add value labels
        for i, impact in enumerate(bottom_params['Relative_Sensitivity_%']):
            ax2.text(impact + max(bottom_params['Relative_Sensitivity_%'])*0.02, i, 
                     f'{impact:.1f}%', va='center', fontweight='bold')
    
    plt.tight_layout()
    
    # Save high-resolution chart
    output_path = charts_dir / "comparison_chart_top_vs_bottom.png"
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    return output_path

def main():
    """Main function to generate all tornado charts"""
    
    print("🎯 Generando gráficos tornado para análisis de sensibilidad...")
    
    # Create output directory
    charts_dir = create_charts_directory()
    
    # Load data
    df = load_sensitivity_data()
    
    # Create parameter impact summary
    parameter_summary = create_parameter_impact_summary(df)
    
    print("\n📊 Resumen de parámetros más influyentes:")
    for i, row in parameter_summary.head(7).iterrows():
        print(f"{row.name + 1}. {row['Description'][:50]}... : {row['Relative_Sensitivity_%']:.1f}%")
    
    # Generate charts
    print("\n🎨 Creando visualizaciones...")
    
    # Overall tornado chart
    overall_path = create_tornado_chart_overall(parameter_summary, charts_dir)
    print(f"✅ Gráfico tornado general: {overall_path}")
    
    # Individual KPI tornado charts
    print("\n📈 Creando gráficos tornado por KPI...")
    create_tornado_chart_by_kpi(df, charts_dir)
    
    # Spider chart
    spider_path = create_spider_chart(parameter_summary, charts_dir)
    print(f"✅ Gráfico araña: {spider_path}")
    
    # Comparison chart
    comparison_path = create_comparison_chart(parameter_summary, charts_dir)
    print(f"✅ Gráfico comparativo: {comparison_path}")
    
    print(f"\n🎯 ¡Todos los gráficos generados exitosamente en {charts_dir}/!")
    print("\n📋 Archivos generados:")
    for chart_file in sorted(charts_dir.glob("*.png")):
        print(f"   - {chart_file.name}")
    
    print("\n🏆 Listo para presentación académica THESIS-004!")

if __name__ == "__main__":
    main()