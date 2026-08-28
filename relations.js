/* Соционика — таблица интертипных отношений.
   Порядок колонок: ILE, SEI, ESE, LII, EIE, LSI, SLE, IEI, SEE, ILI, LIE, ESI, LSE, EII, IEE, SLI */

const RELATIONS = {
  ILE: ["idn", "dlt", "act", "mrr", "bn_g", "sp_g", "lkl", "ill", "ego", "cnt", "qid", "cnf", "bn_l", "sp_l", "cmp", "sdl"],
  SEI: ["dlt", "idn", "mrr", "act", "sp_g", "bn_g", "ill", "lkl", "cnt", "ego", "cnf", "qid", "sp_l", "bn_l", "sdl", "cmp"],
  ESE: ["act", "mrr", "idn", "dlt", "cmp", "sdl", "bn_l", "sp_l", "qid", "cnf", "ego", "cnt", "lkl", "ill", "bn_g", "sp_g"],
  LII: ["mrr", "act", "dlt", "idn", "sdl", "cmp", "sp_l", "bn_l", "cnf", "qid", "cnt", "ego", "ill", "lkl", "sp_g", "bn_g"],
  EIE: ["bn_l", "sp_l", "cmp", "sdl", "idn", "dlt", "act", "mrr", "bn_g", "sp_g", "lkl", "ill", "ego", "cnt", "qid", "cnf"],
  LSI: ["sp_l", "bn_l", "sdl", "cmp", "dlt", "idn", "mrr", "act", "sp_g", "bn_g", "ill", "lkl", "cnt", "ego", "cnf", "qid"],
  SLE: ["lkl", "ill", "bn_g", "sp_g", "act", "mrr", "idn", "dlt", "cmp", "sdl", "bn_l", "sp_l", "qid", "cnf", "ego", "cnt"],
  IEI: ["ill", "lkl", "sp_g", "bn_g", "mrr", "act", "dlt", "idn", "sdl", "cmp", "sp_l", "bn_l", "cnf", "qid", "cnt", "ego"],
  SEE: ["ego", "cnt", "qid", "cnf", "bn_l", "sp_l", "cmp", "sdl", "idn", "dlt", "act", "mrr", "bn_g", "sp_g", "lkl", "ill"],
  ILI: ["cnt", "ego", "cnf", "qid", "sp_l", "bn_l", "sdl", "cmp", "dlt", "idn", "mrr", "act", "sp_g", "bn_g", "ill", "lkl"],
  LIE: ["qid", "cnf", "ego", "cnt", "lkl", "ill", "bn_g", "sp_g", "act", "mrr", "idn", "dlt", "cmp", "sdl", "bn_l", "sp_l"],
  ESI: ["cnf", "qid", "cnt", "ego", "ill", "lkl", "sp_g", "bn_g", "mrr", "act", "dlt", "idn", "sdl", "cmp", "sp_l", "bn_l"],
  LSE: ["bn_g", "sp_g", "lkl", "ill", "ego", "cnt", "qid", "cnf", "bn_l", "sp_l", "cmp", "sdl", "idn", "dlt", "act", "mrr"],
  EII: ["sp_g", "bn_g", "ill", "lkl", "cnt", "ego", "cnf", "qid", "sp_l", "bn_l", "sdl", "cmp", "dlt", "idn", "mrr", "act"],
  IEE: ["cmp", "sdl", "bn_l", "sp_l", "qid", "cnf", "ego", "cnt", "lkl", "ill", "bn_g", "sp_g", "act", "mrr", "idn", "dlt"],
  SLI: ["sdl", "cmp", "sp_l", "bn_l", "cnf", "qid", "cnt", "ego", "ill", "lkl", "sp_g", "bn_g", "mrr", "act", "dlt", "idn"],
};

/* Отношения конкретного типа: [{ id, rel }, ...] в порядке TYPE_ORDER */
function relationsOf(typeId) {
  const row = RELATIONS[typeId];
  if (!row) return [];
  const out = [];
  for (let i = 0; i < TYPE_ORDER.length; i++) {
    const other = TYPE_ORDER[i];
    if (other === typeId) continue;
    out.push({ id: other, rel: row[i] });
  }
  return out;
}

/* Ключевые партнёры по коду отношения */
function findPartner(typeId, relCode) {
  const list = relationsOf(typeId);
  const found = list.filter((r) => r.rel === relCode);
  return found;
}

/* Проверка: дуалы симметричны и таблица корректна */
(function verifyRelations() {
  for (const a of TYPE_ORDER) {
    for (const b of TYPE_ORDER) {
      if (a === b) continue;
      const ra = RELATIONS[a][TYPE_ORDER.indexOf(b)];
      const rb = RELATIONS[b][TYPE_ORDER.indexOf(a)];
      const sym = { bn_g: "bn_l", bn_l: "bn_g", sp_g: "sp_l", sp_l: "sp_g" };
      const expected = sym[ra] || ra;
      if (expected !== rb) {
        console.error("Relation table asymmetry:", a, b, ra, rb);
      }
    }
  }
})();
