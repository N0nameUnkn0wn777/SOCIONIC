"use strict";

(function () {

  /* ---------- вспомогательные функции ---------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function percent(value) {
    return (Math.round(value * 1000) / 10).toFixed(1).replace(".", ",") + "%";
  }

  // Положение полюса: -1, 0 или +1.
  function poleLabel(value) {
    return value > 0.5 ? "+" : value < -0.5 ? "−" : "0";
  }

  function neutrals(answers) {
    return answers.reduce(function (count, value, i) {
      return value === 0 ? count + 1 : count;
    }, 0);
  }

  /* ---------- набор ползунков ---------- */

  function SliderSet(container, onChange) {
    var answers = new Array(DICHOTOMY_COUNT).fill(0);
    var inputs = [];
    var leftValues = [];
    var rightValues = [];

    var rows = DICHOTOMIES.map(function (dichotomy, index) {
      var row = el("div", "dichotomy");

      var label = el("div", "dichotomy-labels");
      var left = el("div", "pole pole-left");
      left.appendChild(el("span", "pole-name", dichotomy.alt[0]));
      left.appendChild(el("span", "pole-mark", "−"));
      var right = el("div", "pole pole-right");
      right.appendChild(el("span", "pole-mark", "+"));
      right.appendChild(el("span", "pole-name", dichotomy.alt[1]));
      label.appendChild(left);
      label.appendChild(right);
      leftValues.push(left);
      rightValues.push(right);

      var scale = el("div", "scale");
      scale.appendChild(el("span", "scale-mark", "−1"));
      scale.appendChild(el("span", "scale-mark", "0"));
      scale.appendChild(el("span", "scale-mark", "+1"));

      var input = document.createElement("input");
      input.type = "range";
      input.min = "-100";
      input.max = "100";
      input.step = "1";
      input.value = "0";
      input.className = "slider";
      input.setAttribute(
        "aria-label",
        dichotomy.alt[0] + " (−1) … " + dichotomy.alt[1] + " (+1). " + dichotomy.hint
      );
      input.title = dichotomy.hint;
      input.addEventListener("input", function () {
        answers[index] = input.valueAsNumber / 100;
        render();
        onChange(getAnswers());
      });

      var hint = el("div", "dichotomy-hint", dichotomy.hint);

      row.appendChild(label);
      row.appendChild(scale);
      row.appendChild(input);
      row.appendChild(hint);

      inputs.push(input);
      return row;
    });

    rows.forEach(function (row) {
      container.appendChild(row);
    });

    function render() {
      DICHOTOMIES.forEach(function (dichotomy, i) {
        var value = answers[i];
        var strength = Math.abs(value);
        leftValues[i].querySelector(".pole-mark").textContent =
          value < 0 ? "−" + Math.round(strength * 100) : "0";
        rightValues[i].querySelector(".pole-mark").textContent =
          value > 0 ? "+" + Math.round(strength * 100) : "0";
        leftValues[i].classList.toggle("is-active", value < 0);
        rightValues[i].classList.toggle("is-active", value > 0);
      });
    }

    function getAnswers() {
      return answers.slice();
    }

    function setAnswers(next) {
      answers = next.slice();
      DICHOTOMIES.forEach(function (_, i) {
        inputs[i].value = String(Math.round(answers[i] * 100));
      });
      render();
    }

    function setType(typeId) {
      setAnswers(answersForType(typeId));
      onChange(getAnswers());
    }

    render();

    return {
      getAnswers: getAnswers,
      setAnswers: setAnswers,
      setType: setType,
      reset: function () {
        setAnswers(new Array(DICHOTOMY_COUNT).fill(0));
        onChange(getAnswers());
      }
    };
  }

  /* ---------- таблица вероятностей ТИМов ---------- */

  function renderTypeResults(tbody, distribution, answers) {
    var ranked = distribution
      .map(function (probability, id) {
        return { id: id, probability: probability };
      })
      .sort(function (a, b) {
        return b.probability - a.probability;
      });

    tbody.textContent = "";
    ranked.forEach(function (entry, position) {
      var type = TYPES[entry.id];
      var row = el("tr");
      if (position === 0) row.className = "is-top";

      row.appendChild(el("td", "col-rank", String(position + 1)));

      var nameCell = el("td");
      var nameButton = el("button", "type-name", type.nick);
      nameButton.title = "Выставить все признаки строго по профилю " + type.nick;
      nameButton.addEventListener("click", function () {
        onSelectType(entry.id);
      });
      nameCell.appendChild(nameButton);
      row.appendChild(nameCell);

      row.appendChild(el("td", "type-jung", type.jung));
      row.appendChild(el("td", "col-mbti", type.mbti));

      var probCell = el("td", "col-prob");
      var bar = el("div", "bar");
      var fill = el("div", "bar-fill");
      fill.style.width = Math.max(entry.probability * 100, 0.4) + "%";
      bar.appendChild(fill);
      probCell.appendChild(bar);
      probCell.appendChild(el("span", "bar-value", percent(entry.probability)));
      row.appendChild(probCell);

      tbody.appendChild(row);
    });

    void answers;
  }

  /* ---------- профиль по 15 признакам ---------- */

  function renderProfile(container, answers) {
    container.textContent = "";
    DICHOTOMIES.forEach(function (dichotomy, i) {
      var value = answers[i];
      var name = value === 0 ? "—" : dichotomy.alt[value > 0 ? 1 : 0];
      var cell = el("div", "profile-cell");
      cell.appendChild(el("span", "profile-name", name));
      var track = el("div", "profile-track");
      var dot = el("div", "profile-dot");
      dot.style.left = ((value + 1) / 2) * 100 + "%";
      if (value !== 0) dot.classList.add("is-set");
      track.appendChild(dot);
      cell.appendChild(track);
      container.appendChild(cell);
    });
  }

  /* ---------- вкладка «Определение ТИМа» ---------- */

  var singleAnswers = new Array(DICHOTOMY_COUNT).fill(0);

  var singleSliders = SliderSet(document.getElementById("single-sliders"), function (answers) {
    singleAnswers = answers;
    renderSingle();
  });

  function renderSingle() {
    var distribution = computeDistribution(singleAnswers);
    renderTypeResults(
      document.getElementById("single-results"),
      distribution,
      singleAnswers
    );
    renderProfile(document.getElementById("single-profile"), singleAnswers);

    var neutralCount = neutrals(singleAnswers);
    var info = document.getElementById("single-info");
    info.textContent = "";
    info.appendChild(el("span", "chip", "информативность " + percent(informativeness(distribution))));
    info.appendChild(
      el("span", "chip" + (neutralCount > 2 ? " chip-warn" : ""), "нейтральных признаков: " + neutralCount)
    );
  }

  var onSelectType = function (typeId) {
    singleSliders.setType(typeId);
  };

  /* ---------- вкладка «Отношения» ---------- */

  var yourAnswers = new Array(DICHOTOMY_COUNT).fill(0);
  var partnerAnswers = new Array(DICHOTOMY_COUNT).fill(0);

  function updateRelations() {
    var yourDistribution = computeDistribution(yourAnswers);
    var partnerDistribution = computeDistribution(partnerAnswers);
    var relations = relationDistribution(yourDistribution, partnerDistribution);

    renderBest(document.getElementById("relations-best-yours"), yourDistribution);
    renderBest(document.getElementById("relations-best-partner"), partnerDistribution);
    renderRelations(document.getElementById("relations-results"), relations);
  }

  function renderBest(container, distribution) {
    var best = 0;
    for (var i = 1; i < distribution.length; i++) {
      if (distribution[i] > distribution[best]) best = i;
    }
    container.textContent = "";
    container.appendChild(el("span", "best-label", "Наиболее вероятный ТИМ:"));
    container.appendChild(el("span", "best-name", TYPES[best].nick));
    container.appendChild(el("span", "best-mbti", TYPES[best].mbti));
    container.appendChild(el("span", "best-prob", percent(distribution[best])));
  }

  function renderRelations(tbody, relations) {
    var ranked = relations
      .map(function (probability, id) {
        return { id: id, probability: probability };
      })
      .sort(function (a, b) {
        return b.probability - a.probability;
      });

    tbody.textContent = "";
    ranked.forEach(function (entry, position) {
      var row = el("tr");
      if (position === 0) row.className = "is-top";

      row.appendChild(el("td", "col-rank", String(position + 1)));
      row.appendChild(el("td", "rel-name", TYPES[entry.id].rel));
      row.appendChild(el("td", "type-jung", TYPES[entry.id].jung));
      row.appendChild(el("td", "col-mbti", TYPES[entry.id].mbti));

      var probCell = el("td", "col-prob");
      var bar = el("div", "bar");
      var fill = el("div", "bar-fill");
      fill.style.width = Math.max(entry.probability * 100, 0.4) + "%";
      bar.appendChild(fill);
      probCell.appendChild(bar);
      probCell.appendChild(el("span", "bar-value", percent(entry.probability)));
      row.appendChild(probCell);

      tbody.appendChild(row);
    });
  }

  var yourSliders = SliderSet(document.getElementById("relations-sliders-yours"), function (answers) {
    yourAnswers = answers;
    updateRelations();
  });

  var partnerSliders = SliderSet(document.getElementById("relations-sliders-partner"), function (answers) {
    partnerAnswers = answers;
    updateRelations();
  });

  /* ---------- вкладки и кнопки ---------- */

  var tabButtons = document.querySelectorAll(".tab");
  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var name = button.dataset.tab;
      tabButtons.forEach(function (other) {
        var active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-selected", String(active));
      });
      document.querySelectorAll(".panel").forEach(function (panel) {
        panel.classList.toggle("is-active", panel.id === "panel-" + name);
      });
    });
  });

  document.querySelector('[data-action="reset-single"]').addEventListener("click", function () {
    singleSliders.reset();
  });
  document.querySelector('[data-action="reset-yours"]').addEventListener("click", function () {
    yourSliders.reset();
  });
  document.querySelector('[data-action="reset-partner"]').addEventListener("click", function () {
    partnerSliders.reset();
  });

  /* ---------- старт ---------- */

  renderSingle();
  updateRelations();
})();