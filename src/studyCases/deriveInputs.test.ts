/**
 * Conservación de masa en la proyección inventario → motor.
 *
 * La apuesta de B1 es que `deriveInputsFromInventory` re-expresa el inventario en el
 * vocabulario del motor SIN cambiar ningún total. Si estos tests pasan, el número que
 * el motor reporta es el mismo que la tabla de reconciliación del Track A0 defiende
 * ante el sínodo. Si fallan, el motor está inventando o perdiendo masa.
 */
import { describe, test, expect } from 'vitest';
import { INITIAL_INPUTS } from '../constants/initialState';
import { HOLBOX_INVENTORY } from './holbox/inventory';
import {
  deriveInputsFromInventory,
  projectedMassTDia,
  type BandKey,
} from './deriveInputs';

const BANDS: BandKey[] = ['low', 'base', 'high'];
const occRefPct = HOLBOX_INVENTORY.occupancyRef * 100;

describe('deriveInputsFromInventory — conservación de masa', () => {
  test.each(BANDS)('la banda %s conserva el total del inventario', (band) => {
    const { inputs, provenance } = deriveInputsFromInventory(
      INITIAL_INPUTS,
      HOLBOX_INVENTORY,
      band,
    );
    const motor = projectedMassTDia(inputs, occRefPct);
    // A la ocupación de referencia el motor debe reproducir el inventario exacto.
    expect(motor).toBeCloseTo(HOLBOX_INVENTORY.totals[band], 6);
    expect(provenance.totalTDia).toBeCloseTo(HOLBOX_INVENTORY.totals[band], 6);
  });

  test.each(BANDS)('cada bucket conserva su masa por separado (%s)', (band) => {
    const { provenance } = deriveInputsFromInventory(
      INITIAL_INPUTS,
      HOLBOX_INVENTORY,
      band,
    );
    for (const b of provenance.buckets) {
      const esperado = HOLBOX_INVENTORY.classes
        .filter((c) => c.bucket === b.bucket)
        .reduce((s, c) => s + c.gen_kg[band], 0);
      expect(b.totalKg).toBeCloseTo(esperado, 6);
      // units × rate reproduce el bucket (hotels lleva la ocupación de referencia).
      const reexpresado =
        b.bucket === 'hotels'
          ? b.units * HOLBOX_INVENTORY.occupancyRef * b.rate
          : b.units * b.rate;
      expect(reexpresado).toBeCloseTo(esperado, 6);
    }
  });

  test('ninguna clase del inventario se queda fuera de un bucket', () => {
    const { provenance } = deriveInputsFromInventory(INITIAL_INPUTS, HOLBOX_INVENTORY);
    const proyectadas = new Set(
      provenance.buckets.flatMap((b) => [...b.countedClasses, ...b.massOnlyClasses]),
    );
    for (const c of HOLBOX_INVENTORY.classes) {
      expect(proyectadas.has(c.id)).toBe(true);
    }
  });

  test('las clases de sólo-masa aportan kg pero no inflan units', () => {
    const { provenance } = deriveInputsFromInventory(INITIAL_INPUTS, HOLBOX_INVENTORY);
    const commerce = provenance.buckets.find((b) => b.bucket === 'commerce')!;
    // barrido, day-trippers y tours no son establecimientos: su driver no es contable.
    expect(commerce.massOnlyClasses).toEqual(
      expect.arrayContaining(['servicio_limpia', 'day_trippers', 'tour_operadoras']),
    );
    expect(commerce.massOnlyKg).toBeGreaterThan(0);
    const unitsContables = HOLBOX_INVENTORY.classes
      .filter((c) => c.bucket === 'commerce' && c.units_countable)
      .reduce((s, c) => s + c.counts.base, 0);
    expect(commerce.units).toBeCloseTo(unitsContables, 6);
  });
});

describe('deriveInputsFromInventory — es proyección, no mutación', () => {
  test('no muta los inputs base', () => {
    const antes = JSON.stringify(INITIAL_INPUTS);
    deriveInputsFromInventory(INITIAL_INPUTS, HOLBOX_INVENTORY, 'high');
    expect(JSON.stringify(INITIAL_INPUTS)).toBe(antes);
  });

  test('conserva los parámetros que no son de generación', () => {
    const { inputs } = deriveInputsFromInventory(INITIAL_INPUTS, HOLBOX_INVENTORY);
    expect(inputs.composition).toEqual(INITIAL_INPUTS.composition);
    expect(inputs.rsuSystem).toEqual(INITIAL_INPUTS.rsuSystem);
    // Las tasas de separación en fuente son política, no inventario: no se tocan.
    expect(inputs.generation.hotels.sourceSeparationRate).toBe(
      INITIAL_INPUTS.generation.hotels.sourceSeparationRate,
    );
  });
});

describe('deriveInputsFromInventory — el hotel no cuenta la ocupación dos veces', () => {
  test('el rate emitido es por cuarto OCUPADO, no disponible', () => {
    const { inputs, provenance } = deriveInputsFromInventory(
      INITIAL_INPUTS,
      HOLBOX_INVENTORY,
    );
    const hotels = provenance.buckets.find((b) => b.bucket === 'hotels')!;
    const porCuartoDisponible = hotels.totalKg / hotels.units;
    expect(inputs.generation.hotels.rate).toBeCloseTo(
      porCuartoDisponible / HOLBOX_INVENTORY.occupancyRef,
      6,
    );
    // El factor local de AM20 es 1.62 kg/cuarto disponible para el formal; la mezcla
    // con informal (0.78) tiene que caer por debajo de ese techo.
    expect(porCuartoDisponible).toBeLessThan(1.62);
  });

  test('la masa hotelera escala con la ocupación del escenario', () => {
    const { inputs } = deriveInputsFromInventory(INITIAL_INPUTS, HOLBOX_INVENTORY);
    const alta = projectedMassTDia(inputs, 90);
    const baja = projectedMassTDia(inputs, 20);
    expect(alta).toBeGreaterThan(baja);
    // Sólo el bucket hotelero responde a la ocupación; el delta debe ser exactamente
    // el suyo, no el del sistema completo.
    const deltaEsperado =
      (inputs.generation.hotels.units * (90 - 20) * inputs.generation.hotels.rate) /
      100 /
      1000;
    expect(alta - baja).toBeCloseTo(deltaEsperado, 6);
  });
});

/**
 * La línea base de "campo" del motor NO reproduce el estudio de campo.
 *
 * `data/holbox-historical-data.csv` declara `total_waste_generation_daily = 34.8`
 * citando el WP2E. Pero `INITIAL_INPUTS` sólo tiene cuatro buckets y el estudio tiene
 * cinco categorías: al mapear se perdieron las **fondas** (170 u × 38.5 = 6.55 t/d).
 * El motor nunca las tuvo.
 *
 * Estos tests no arreglan el hueco — cambiar la línea base validada es decisión de
 * A1/B2. Lo fijan por escrito para que no vuelva a pasar desapercibido y para que
 * cualquier cambio futuro rompa el test en vez de moverse en silencio.
 */
describe('línea base de campo — el hueco de fondas', () => {
  const REFERENCIA_WP2E = 34.8; // holbox-historical-data.csv, total_waste_generation_daily
  const FONDAS_WP2E = 170 * 38.5; // kg/día, tabla 6 del WP2E

  test('el motor con inputs de campo se queda corto contra su propia referencia', () => {
    // A ocupación 100% el motor no aplica descuento hotelero, que es como el WP2E
    // calculó su total (sobre cuartos disponibles).
    const campo = projectedMassTDia(INITIAL_INPUTS, 100);
    expect(campo).toBeLessThan(REFERENCIA_WP2E);
    // Y el faltante es exactamente las fondas.
    expect(REFERENCIA_WP2E - campo).toBeCloseTo(FONDAS_WP2E / 1000, 1);
  });

  test('el inventario sí las tiene, como clase propia', () => {
    const fondas = HOLBOX_INVENTORY.classes.find((c) => c.id === 'fondas');
    expect(fondas).toBeDefined();
    expect(fondas!.bucket).toBe('restaurants');
    expect(fondas!.units_countable).toBe(true);
  });
});
