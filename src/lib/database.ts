import initSqlJs from 'sql.js';

// Database interface types
export interface SimulationScenario {
  id: string;
  name: string;
  description?: string;
  inputs: any;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface SimulationResult {
  id: string;
  scenario_id: string;
  season: 'high' | 'low';
  results: any;
  created_at: string;
}

class SQLiteDatabase {
  private db: any = null;
  private SQL: any = null;

  async init() {
    if (this.db) return;

    // Initialize SQL.js
    this.SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });

    // Try to load existing database from localStorage
    const savedDb = localStorage.getItem('waste_simulation_db');
    if (savedDb) {
      const uint8Array = new Uint8Array(JSON.parse(savedDb));
      this.db = new this.SQL.Database(uint8Array);
    } else {
      // Create new database
      this.db = new this.SQL.Database();
      this.createTables();
    }
  }

  private createTables() {
    // Create simulation_scenarios table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS simulation_scenarios (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        inputs TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT DEFAULT 'local_user'
      );
    `);

    // Create simulation_results table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS simulation_results (
        id TEXT PRIMARY KEY,
        scenario_id TEXT,
        season TEXT NOT NULL CHECK (season IN ('high', 'low')),
        results TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scenario_id) REFERENCES simulation_scenarios(id) ON DELETE CASCADE
      );
    `);

    this.saveToLocalStorage();
  }

  private saveToLocalStorage() {
    const data = this.db.export();
    const buffer = Array.from(data);
    localStorage.setItem('waste_simulation_db', JSON.stringify(buffer));
  }

  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Scenario methods
  async getScenarios(): Promise<SimulationScenario[]> {
    await this.init();
    
    const stmt = this.db.prepare('SELECT * FROM simulation_scenarios ORDER BY created_at DESC');
    const scenarios: SimulationScenario[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      scenarios.push({
        id: row.id as string,
        name: row.name as string,
        description: row.description as string,
        inputs: JSON.parse(row.inputs as string),
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
        user_id: row.user_id as string,
      });
    }
    
    stmt.free();
    return scenarios;
  }

  async saveScenario(name: string, inputs: any, description?: string): Promise<SimulationScenario> {
    await this.init();
    
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO simulation_scenarios (id, name, description, inputs, created_at, updated_at, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, name, description || null, JSON.stringify(inputs), now, now, 'local_user']);
    stmt.free();
    
    this.saveToLocalStorage();
    
    return {
      id,
      name,
      description,
      inputs,
      created_at: now,
      updated_at: now,
      user_id: 'local_user',
    };
  }

  async updateScenario(id: string, updates: Partial<SimulationScenario>): Promise<SimulationScenario> {
    await this.init();
    
    const now = new Date().toISOString();
    const setParts: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      setParts.push('name = ?');
      values.push(updates.name);
    }
    
    if (updates.description !== undefined) {
      setParts.push('description = ?');
      values.push(updates.description);
    }
    
    if (updates.inputs !== undefined) {
      setParts.push('inputs = ?');
      values.push(JSON.stringify(updates.inputs));
    }
    
    setParts.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE simulation_scenarios 
      SET ${setParts.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(values);
    stmt.free();
    
    this.saveToLocalStorage();
    
    // Return updated scenario
    const scenarios = await this.getScenarios();
    return scenarios.find(s => s.id === id)!;
  }

  async deleteScenario(id: string): Promise<void> {
    await this.init();
    
    const stmt = this.db.prepare('DELETE FROM simulation_scenarios WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    
    this.saveToLocalStorage();
  }

  async saveResults(scenarioId: string, season: 'high' | 'low', results: any): Promise<SimulationResult> {
    await this.init();
    
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO simulation_results (id, scenario_id, season, results, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, scenarioId, season, JSON.stringify(results), now]);
    stmt.free();
    
    this.saveToLocalStorage();
    
    return {
      id,
      scenario_id: scenarioId,
      season,
      results,
      created_at: now,
    };
  }

  // Export/Import functionality
  exportDatabase(): string {
    if (!this.db) return '';
    const data = this.db.export();
    return btoa(String.fromCharCode(...data));
  }

  async importDatabase(base64Data: string): Promise<void> {
    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      await this.init();
      this.db = new this.SQL.Database(bytes);
      this.saveToLocalStorage();
    } catch (error) {
      throw new Error('Invalid database file');
    }
  }
}

// Create singleton instance
export const database = new SQLiteDatabase();