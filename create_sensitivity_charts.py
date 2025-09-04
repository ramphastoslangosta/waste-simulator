#!/usr/bin/env python3
"""
Professional Tornado and Spider Chart Generator for Sensitivity Analysis
Creates publication-quality visualizations suitable for academic thesis presentation.

Requirements: matplotlib, pandas, numpy
Usage: python create_sensitivity_charts.py
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path
import os

# Set high DPI for publication quality
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['font.size'] = 10
plt.rcParams['font.family'] = 'serif'
plt.rcParams['axes.linewidth'] = 0.8

def load_sensitivity_data():
    """Load and process sensitivity analysis results."""
    data_path = Path("data/sensitivity-summary-results.csv")
    
    if not data_path.exists():
        raise FileNotFoundError(f"Sensitivity data file not found: {data_path}")
    
    df = pd.read_csv(data_path)
    return df

def clean_parameter_names(param_name):
    """Clean parameter names for better display."""
    # Create readable parameter names
    name_mapping = {
        'rsuSystem.processing.finalTransportCapacity': 'Final Transport Capacity',
        'rsuSystem.economics.collectionCost': 'Collection Cost',
        'generation.restaurants.rate': 'Restaurant Generation Rate',
        'general.highSeasonOccupancy': 'High Season Occupancy',
        'generation.hotels.rate': 'Hotel Generation Rate',
        'rsuSystem.leaks.collectionLeak': 'Collection Leak Rate',
        'general.fixedPopulation': 'Fixed Population'
    }
    
    return name_mapping.get(param_name, param_name)

def create_tornado_chart(df, kpi_name, save_dir):
    """Create a professional tornado chart for a specific KPI."""
    kpi_data = df[df['KPI'] == kpi_name].copy()
    
    if kpi_data.empty:
        print(f"No data found for KPI: {kpi_name}")
        return
    
    # Sort by sensitivity (descending)
    kpi_data = kpi_data.sort_values('Relative_Sensitivity_%', ascending=True)
    
    # Clean parameter names
    kpi_data['Clean_Parameter'] = kpi_data['Parameter'].apply(clean_parameter_names)
    
    # Create figure
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Extract data for plotting
    y_pos = np.arange(len(kpi_data))
    sensitivities = kpi_data['Relative_Sensitivity_%'].values
    parameters = kpi_data['Clean_Parameter'].values
    
    # Create horizontal bars (tornado style)
    # Use different colors for different sensitivity levels
    colors = []
    for sens in sensitivities:
        if sens > 40:
            colors.append('#d32f2f')  # High impact - red
        elif sens > 20:
            colors.append('#f57c00')  # Medium impact - orange
        elif sens > 5:
            colors.append('#1976d2')  # Low impact - blue
        else:
            colors.append('#388e3c')  # Very low impact - green
    
    bars = ax.barh(y_pos, sensitivities, color=colors, alpha=0.8, edgecolor='black', linewidth=0.5)
    
    # Customize chart
    ax.set_yticks(y_pos)
    ax.set_yticklabels(parameters, fontsize=10)
    ax.set_xlabel('Relative Sensitivity (%)', fontsize=12, fontweight='bold')
    ax.set_title(f'Parameter Sensitivity Analysis\n{kpi_name.replace("_", " ").title()}', 
                fontsize=14, fontweight='bold', pad=20)
    
    # Add value labels on bars
    for i, (bar, sens) in enumerate(zip(bars, sensitivities)):
        width = bar.get_width()
        ax.text(width + max(sensitivities) * 0.01, bar.get_y() + bar.get_height()/2,
                f'{sens:.1f}%', ha='left', va='center', fontweight='bold', fontsize=9)
    
    # Add grid for better readability
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)
    
    # Adjust layout
    plt.tight_layout()
    
    # Save chart
    filename = f"tornado_{kpi_name.lower()}.png"
    filepath = save_dir / filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    print(f"Tornado chart saved: {filepath}")

def create_overall_sensitivity_chart(df, save_dir):
    """Create an overall parameter impact chart showing average sensitivity across all KPIs."""
    
    # Calculate average sensitivity for each parameter across all KPIs
    param_avg = df.groupby('Parameter')['Relative_Sensitivity_%'].agg(['mean', 'std', 'count']).reset_index()
    param_avg = param_avg.sort_values('mean', ascending=True)
    
    # Clean parameter names
    param_avg['Clean_Parameter'] = param_avg['Parameter'].apply(clean_parameter_names)
    
    # Create figure
    fig, ax = plt.subplots(figsize=(14, 8))
    
    y_pos = np.arange(len(param_avg))
    means = param_avg['mean'].values
    stds = param_avg['std'].values
    parameters = param_avg['Clean_Parameter'].values
    
    # Create horizontal bars with error bars
    colors = []
    for mean_val in means:
        if mean_val > 30:
            colors.append('#d32f2f')  # High impact - red
        elif mean_val > 15:
            colors.append('#f57c00')  # Medium impact - orange
        elif mean_val > 5:
            colors.append('#1976d2')  # Low impact - blue
        else:
            colors.append('#388e3c')  # Very low impact - green
    
    bars = ax.barh(y_pos, means, xerr=stds, color=colors, alpha=0.8, 
                  edgecolor='black', linewidth=0.5, capsize=5)
    
    # Customize chart
    ax.set_yticks(y_pos)
    ax.set_yticklabels(parameters, fontsize=11)
    ax.set_xlabel('Average Relative Sensitivity (%) ± Std Dev', fontsize=12, fontweight='bold')
    ax.set_title('Overall Parameter Impact Ranking\nAverage Sensitivity Across All KPIs', 
                fontsize=14, fontweight='bold', pad=20)
    
    # Add value labels
    for i, (bar, mean_val, std_val) in enumerate(zip(bars, means, stds)):
        width = bar.get_width()
        ax.text(width + max(means) * 0.02, bar.get_y() + bar.get_height()/2,
                f'{mean_val:.1f}±{std_val:.1f}%', ha='left', va='center', 
                fontweight='bold', fontsize=9)
    
    # Add grid
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)
    
    # Add legend for impact levels
    from matplotlib.patches import Rectangle
    legend_elements = [
        Rectangle((0,0),1,1, facecolor='#d32f2f', alpha=0.8, label='High Impact (>30%)'),
        Rectangle((0,0),1,1, facecolor='#f57c00', alpha=0.8, label='Medium Impact (15-30%)'),
        Rectangle((0,0),1,1, facecolor='#1976d2', alpha=0.8, label='Low Impact (5-15%)'),
        Rectangle((0,0),1,1, facecolor='#388e3c', alpha=0.8, label='Minimal Impact (<5%)')
    ]
    ax.legend(handles=legend_elements, loc='lower right', framealpha=0.9)
    
    plt.tight_layout()
    
    # Save chart
    filename = "tornado_overall_impact.png"
    filepath = save_dir / filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    print(f"Overall impact chart saved: {filepath}")

def create_spider_chart(df, save_dir):
    """Create a spider/radar chart showing parameter impacts across multiple KPIs."""
    
    # Get unique parameters and KPIs
    parameters = df['Parameter'].unique()
    kpis = df['KPI'].unique()
    
    # Create a pivot table
    pivot_df = df.pivot(index='Parameter', columns='KPI', values='Relative_Sensitivity_%')
    pivot_df = pivot_df.fillna(0)
    
    # Clean parameter names
    clean_params = [clean_parameter_names(param) for param in pivot_df.index]
    
    # Set up the spider chart
    angles = np.linspace(0, 2 * np.pi, len(kpis), endpoint=False).tolist()
    angles += angles[:1]  # Complete the circle
    
    fig, ax = plt.subplots(figsize=(12, 12), subplot_kw=dict(projection='polar'))
    
    # Color palette for parameters
    colors = plt.cm.Set3(np.linspace(0, 1, len(parameters)))
    
    # Plot each parameter
    for i, (param_name, clean_name) in enumerate(zip(pivot_df.index, clean_params)):
        values = pivot_df.loc[param_name].tolist()
        values += values[:1]  # Complete the circle
        
        ax.plot(angles, values, 'o-', linewidth=2, label=clean_name, 
                color=colors[i], markersize=4)
        ax.fill(angles, values, alpha=0.1, color=colors[i])
    
    # Customize the chart
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels([kpi.replace('_', ' ').title() for kpi in kpis], fontsize=10)
    ax.set_ylim(0, max(df['Relative_Sensitivity_%']) * 1.1)
    
    ax.set_title('Multi-KPI Parameter Sensitivity Analysis\nSpider Chart', 
                fontsize=14, fontweight='bold', pad=30)
    
    # Add legend
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0), fontsize=9)
    
    # Add grid
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save chart
    filename = "spider_multi_kpi_sensitivity.png"
    filepath = save_dir / filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    print(f"Spider chart saved: {filepath}")

def create_sensitivity_heatmap(df, save_dir):
    """Create a heatmap showing sensitivity values across all parameters and KPIs."""
    
    # Create pivot table
    pivot_df = df.pivot(index='Parameter', columns='KPI', values='Relative_Sensitivity_%')
    pivot_df = pivot_df.fillna(0)
    
    # Clean parameter names
    clean_params = [clean_parameter_names(param) for param in pivot_df.index]
    clean_kpis = [kpi.replace('_', ' ').title() for kpi in pivot_df.columns]
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Create heatmap
    im = ax.imshow(pivot_df.values, cmap='RdYlBu_r', aspect='auto')
    
    # Set ticks and labels
    ax.set_xticks(np.arange(len(clean_kpis)))
    ax.set_yticks(np.arange(len(clean_params)))
    ax.set_xticklabels(clean_kpis, rotation=45, ha='right')
    ax.set_yticklabels(clean_params)
    
    # Add colorbar
    cbar = plt.colorbar(im, ax=ax)
    cbar.set_label('Relative Sensitivity (%)', rotation=270, labelpad=20, fontweight='bold')
    
    # Add value annotations
    for i in range(len(clean_params)):
        for j in range(len(clean_kpis)):
            text = ax.text(j, i, f'{pivot_df.iloc[i, j]:.1f}%',
                         ha="center", va="center", color="black", fontweight='bold', fontsize=8)
    
    ax.set_title('Parameter-KPI Sensitivity Heatmap', fontsize=14, fontweight='bold', pad=20)
    
    plt.tight_layout()
    
    # Save chart
    filename = "heatmap_sensitivity_matrix.png"
    filepath = save_dir / filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    print(f"Heatmap saved: {filepath}")

def main():
    """Main function to generate all sensitivity analysis charts."""
    
    print("🎯 Generating Professional Sensitivity Analysis Charts")
    print("=" * 60)
    
    # Create charts directory
    save_dir = Path("charts")
    save_dir.mkdir(exist_ok=True)
    
    try:
        # Load data
        print("📊 Loading sensitivity analysis data...")
        df = load_sensitivity_data()
        
        print(f"✅ Data loaded: {len(df)} records across {df['KPI'].nunique()} KPIs")
        print(f"📋 KPIs analyzed: {', '.join(df['KPI'].unique())}")
        
        # Generate individual tornado charts for each KPI
        print("\n🌪️  Generating tornado charts for individual KPIs...")
        for kpi in df['KPI'].unique():
            create_tornado_chart(df, kpi, save_dir)
        
        # Generate overall impact ranking
        print("\n📊 Generating overall parameter impact ranking...")
        create_overall_sensitivity_chart(df, save_dir)
        
        # Generate spider chart
        print("\n🕷️  Generating multi-KPI spider chart...")
        create_spider_chart(df, save_dir)
        
        # Generate heatmap
        print("\n🔥 Generating sensitivity heatmap...")
        create_sensitivity_heatmap(df, save_dir)
        
        print(f"\n✅ All charts generated successfully in: {save_dir.absolute()}")
        print("📁 Files created:")
        for chart_file in sorted(save_dir.glob("*.png")):
            print(f"   • {chart_file.name}")
        
        print("\n🎓 Charts are ready for thesis presentation!")
        
    except Exception as e:
        print(f"❌ Error generating charts: {str(e)}")
        raise

if __name__ == "__main__":
    main()