// Расчётный движок: байесовское распределение вероятностей по 16 ТИМам
// и расчёт отношений между двумя ТИМами.
"use strict";

var TYPE_COUNT = TYPES.length;
var DICHOTOMY_COUNT = DICHOTOMIES.length;

// Плотность распределения для одного признака.
// Возможные значения: от 1/2 - 4/9 до 1/2 + 4/9.
// При равномерном ответе (0) плотность равна 1/2 у всех ТИМов,
// поэтому нулевое положение всех ползунков даёт равномерное распределение 1/16.
function dichotomyDensity(timValue, answer) {
  if (answer > 1 || answer < -1) return 0;
  return (4 / 9) * timValue * answer + 1 / 2;
}

// f(s1..s15 | t) * P(t) для всех t, нормированное.
function computeDistribution(answers) {
  var weights = new Array(TYPE_COUNT).fill(1);
  var total = 0;

  for (var t = 0; t < TYPE_COUNT; t++) {
    for (var d = 0; d < DICHOTOMY_COUNT; d++) {
      weights[t] *= dichotomyDensity(DICHOTOMIES[d].tim[t], answers[d]);
    }
    total += weights[t];
  }

  return weights.map(function (w) {
    return w / total;
  });
}

function entropy(distribution) {
  return distribution.reduce(function (acc, p) {
    return acc - (p > 0 ? p * Math.log(p) : 0);
  }, 0);
}

// Доля информации о ТИМе: 1 при полностью определённом ответе, 0 при равномерном.
var MAX_ENTROPY = entropy(computeDistribution(new Array(DICHOTOMY_COUNT).fill(0)));

function informativeness(distribution) {
  return 1 - entropy(distribution) / MAX_ENTROPY;
}

// Ответ, в котором все признаки выставлены на ±1 строго по позиции ТИМа.
function answersForType(typeId) {
  return DICHOTOMIES.map(function (d) {
    return d.tim[typeId];
  });
}

/* ---------- Матрицы 3x3: отношения между ТИМами ---------- */

function transpose(matrix) {
  return matrix[0].map(function (_, col) {
    return matrix.map(function (row) {
      return row[col];
    });
  });
}

function multiply(a, b) {
  var rows = a.length;
  var inner = b.length;
  var cols = b[0].length;

  var result = [];
  for (var i = 0; i < rows; i++) {
    result[i] = [];
    for (var j = 0; j < cols; j++) {
      var sum = 0;
      for (var k = 0; k < inner; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

var relationIdByMatrix = (function () {
  var lookup = new Map();
  TYPES.forEach(function (type, id) {
    lookup.set(type.matrix.flat().join(","), id);
  });
  return lookup;
})();

// Отношение несимметрично: это «кем второй ТИМ приходится первому».
// relationIdByTimIds(вашТим, тимПартнёра).
function relationIdByTimIds(firstId, secondId) {
  var transform = multiply(TYPES[secondId].matrix, transpose(TYPES[firstId].matrix));
  var key = transform.flat().join(",");
  var id = relationIdByMatrix.get(key);
  if (id === undefined) {
    throw new Error("Матрица отношения не найдена среди 16 ТИМов: " + key);
  }
  return id;
}

function relationDistribution(yourDistribution, partnerDistribution) {
  var result = new Array(TYPE_COUNT).fill(0);

  for (var yourId = 0; yourId < TYPE_COUNT; yourId++) {
    for (var partnerId = 0; partnerId < TYPE_COUNT; partnerId++) {
      var relationId = relationIdByTimIds(yourId, partnerId);
      result[relationId] += yourDistribution[yourId] * partnerDistribution[partnerId];
    }
  }
  return result;
}