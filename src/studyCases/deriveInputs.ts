// Proyección del inventario de generadores a los inputs del motor.
//
// El motor tiene cuatro buckets (`hotels`, `restaurants`, `homes`, `commerce`) y
// consume `units × rate`. El inventario tiene once clases con control total citable.
// Esta función es el puente, y es una PROYECCIÓN, NO UNA MUTACIÓN: devuelve un
// `inputs` nuevo, no toca el motor, y se puede apagar volviendo al agregado de campo.
//
// La regla que la gobierna: **conservar la masa exacta**. Lo que el inventario dice
// que se genera es lo que el motor tiene que recibir. `deriveInputsFromInventory`
// nunca debe cambiar un total; sólo re-expresarlo en el vocabulario del motor.

export type Band = { low: number; base: number; high: number };
export type BandKey = keyof Band;

/** Bucket del motor al que va una clase del inventario. */
export type EngineBucket = 'hotels' | 'restaurants' | 'homes' | 'commerce';

export interface InventoryClass {
  id: string;
  task: string;
  status: 'modelado' | 'nuevo_A0' | 'corregido';
  label: string;
  driver: string;
  bucket: EngineBucket;
  /** ¿El conteo de esta clase es sumable como `units` de su bucket?
   *  false para clases cuyo driver no es un establecimiento (barrenderos,
   *  excursionistas, pax de tour): entran por masa, no por conteo. */
  units_countable: boolean;
  counts: Band;
  gen_kg: Band;
  seasonality: 'flat' | 'sedetur' | 'restaurant_coupling' | 'whale_shark';
}

export interface CaseInventory {
  case: string;
  targetYear: number;
  /** Ocupación anual sobre la que se midieron los factores kg/cuarto/día. */
  occupancyRef: number;
  classes: InventoryClass[];
  totals: Band;
  witnesses?: Record<string, unknown>;
}

/** De dónde salió cada bucket — para que la UI pueda ser honesta sobre la procedencia. */
export interface BucketProvenance {
  bucket: EngineBucket;
  units: number;
  rate: number;
  /** kg/día que el bucket debe producir según el inventario. */
  totalKg: number;
  /** Clases que aportan conteo Y masa. */
  countedClasses: string[];
  /** Clases que aportan SÓLO masa (su driver no es un establecimiento). */
  massOnlyClasses: string[];
  massOnlyKg: number;
}

export interface DerivedInputs {
  inputs: any;
  provenance: {
    source: 'inventory';
    case: string;
    targetYear: number;
    band: BandKey;
    occupancyRef: number;
    totalTDia: number;
    buckets: BucketProvenance[];
  };
}

const BUCKETS: EngineBucket[] = ['hotels', 'restaurants', 'homes', 'commerce'];

/**
 * Proyecta un `CaseInventory` a los inputs del motor.
 *
 * @param baseInputs  inputs del caso (se clona; no se muta)
 * @param inv         inventario del caso
 * @param band        cota del inventario a usar (default 'base')
 *
 * Matemática por bucket:
 *   units  = Σ counts de las clases con `units_countable`
 *   totalKg= Σ gen_kg de TODAS las clases del bucket (incluidas las de sólo-masa)
 *   rate   = totalKg / units
 *
 * `hotels` lleva un ajuste extra. El motor calcula `units × ocupación × rate`, pero
 * los factores del inventario (AM20) se midieron sobre cuartos DISPONIBLES — la
 * ocupación ya está adentro. Sin dividir entre `occupancyRef` se contaría dos veces.
 * El `rate` que se emite es entonces kg por cuarto OCUPADO, que es lo que el motor
 * espera, y reproduce el total del inventario exactamente cuando la ocupación del
 * escenario iguala la de referencia.
 *
 * `homes` no tiene `units` en el motor: usa `general.fixedPopulation`.
 */
export function deriveInputsFromInventory(
  baseInputs: any,
  inv: CaseInventory,
  band: BandKey = 'base',
): DerivedInputs {
  const inputs = JSON.parse(JSON.stringify(baseInputs));
  const provenance: BucketProvenance[] = [];

  for (const bucket of BUCKETS) {
    const classes = inv.classes.filter((c) => c.bucket === bucket);
    if (classes.length === 0) continue;

    const counted = classes.filter((c) => c.units_countable);
    const massOnly = classes.filter((c) => !c.units_countable);

    const units = counted.reduce((s, c) => s + c.counts[band], 0);
    const totalKg = classes.reduce((s, c) => s + c.gen_kg[band], 0);
    const massOnlyKg = massOnly.reduce((s, c) => s + c.gen_kg[band], 0);

    // Un bucket sin unidades contables no se puede expresar como units × rate.
    // Se deja el valor del caso base antes que emitir una división por cero.
    if (units <= 0) continue;

    // hotels: el motor vuelve a aplicar la ocupación, así que el rate se expresa
    // por cuarto ocupado. El resto de los buckets no lleva ocupación en el motor.
    const rate =
      bucket === 'hotels' ? totalKg / units / inv.occupancyRef : totalKg / units;

    if (bucket === 'homes') {
      inputs.general.fixedPopulation = units;
      inputs.generation.homes.rate = rate;
    } else {
      inputs.generation[bucket].units = units;
      inputs.generation[bucket].rate = rate;
    }

    provenance.push({
      bucket,
      units,
      rate,
      totalKg,
      countedClasses: counted.map((c) => c.id),
      massOnlyClasses: massOnly.map((c) => c.id),
      massOnlyKg,
    });
  }

  return {
    inputs,
    provenance: {
      source: 'inventory',
      case: inv.case,
      targetYear: inv.targetYear,
      band,
      occupancyRef: inv.occupancyRef,
      totalTDia: inv.totals[band],
      buckets: provenance,
    },
  };
}

/**
 * Masa que el motor va a producir con estos inputs, a una ocupación dada, en t/día.
 * Réplica exacta de `calculateGeneration` en su parte de masa — existe para poder
 * verificar la conservación sin instanciar el motor completo.
 */
export function projectedMassTDia(inputs: any, occupancyPct: number): number {
  const g = inputs.generation;
  const kg =
    ((g.hotels.units * occupancyPct) / 100) * g.hotels.rate +
    g.restaurants.units * g.restaurants.rate +
    inputs.general.fixedPopulation * g.homes.rate +
    g.commerce.units * g.commerce.rate;
  return kg / 1000;
}
