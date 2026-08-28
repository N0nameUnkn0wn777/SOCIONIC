/* Дело № 16 — рендеринг обложки, оглавления и личных дел фигурантов */

(function () {
  "use strict";

  var app = document.getElementById("app");
  var page = document.body.dataset.page;
  var isType = page === "type";

  var ANALYSIS = {
    ILE: "donkihot", SEI: "duma", ESE: "gugo", LII: "robespierre",
    EIE: "gamlet", LSI: "maksim", SLE: "zhukov", IEI: "esenin",
    SEE: "napoleon", ILI: "balzak", LIE: "jack", ESI: "draizer",
    LSE: "shtirlits", EII: "dostoevsky", IEE: "geksli", SLI: "gaben"
  };

  var ROMAN = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII",
    "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"
  ];

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function caseNo(id) {
    return pad(TYPE_ORDER.indexOf(id) + 1);
  }

  function typeHref(id) {
    return id.toLowerCase() + ".html";
  }

  function analysisHref(id) {
    return ANALYSIS[id] + "-analysis.html";
  }

  function homeHref() {
    return "index.html";
  }

  function initials(name) {
    return name.split(" ").map(function (w) { return w.charAt(0); }).join("");
  }

  var REL_GROUPS = {
    best: { label: "Гармония", order: 0, color: "#15803d" },
    good: { label: "Хорошие", order: 1, color: "#b45309" },
    ok: { label: "Нейтральные", order: 2, color: "#6b7280" },
    tense: { label: "Напряжённые", order: 3, color: "#0e7490" },
    bad: { label: "Трудные", order: 4, color: "#991b1b" }
  };

  var REL_ORDER = [
    "dlt", "idn", "act", "mrr",
    "sdl", "ill", "lkl", "cmp", "bn_g", "bn_l",
    "ego", "qid", "cnt", "sp_g", "sp_l",
    "cnf"
  ];

  var DIRECTIONAL = { bn_g: true, bn_l: true, sp_g: true, sp_l: true };

  function relMeta(rel) { return RELATIONS_META[rel]; }

  function relMark(rel) {
    var meta = relMeta(rel);
    if (DIRECTIONAL[rel]) return meta.short;
    return REL_GROUPS[meta.group].label;
  }

  function relName(rel) {
    var meta = relMeta(rel);
    if (DIRECTIONAL[rel]) return meta.name + " — " + meta.short;
    return meta.name;
  }

  function relDesc(rel) { return RELATIONS_DESC[rel]; }

  function typeLabel(t) { return t.code + " " + t.name; }

  /* ---------- обложка и оглавление ---------- */

  function chapterCard(num, label, title, desc, href) {
    return (
      '<a class="chapter-card" href="' + href + '">' +
      '<div class="cc-num">' + num + "</div>" +
      '<div class="cc-body">' +
      '<div class="cc-label">' + label + "</div>" +
      '<div class="cc-title">' + title + "</div>" +
      '<p class="cc-desc">' + desc + "</p>" +
      '<div class="cc-goto">Открыть →</div>' +
      "</div></a>"
    );
  }

  function renderIndex() {
    var html = "";

    html +=
      '<section class="hero"><div class="container">' +
      '<div class="cover-stamps"><span class="stamp">Архивное дело № 16</span><span class="stamp stamp-blue">Рассекречено</span></div>' +
      '<p class="kicker">Отдел наблюдений · папка «личность»</p>' +
      "<h1>Дело о шестнадцати типах личности</h1>" +
      '<p class="lead">Перед вами архивное досье по соционике. Шестнадцать фигурантов — их почерк, сильные стороны и уязвимости, круг общения и полная карта связей между ними. Материалы сгруппированы в четыре главы и три приложения.</p>' +
      '<div class="meta-line">' +
      "<span>фигурантов: 16</span><span>эпизодов: 4 квадры</span><span>связей установлено: 240</span><span>метод: модель А</span>" +
      "</div>" +
      '<p class="redact-line">Объект наблюдения: <span class="redact" title="человек">человек</span> — встречается повсеместно.</p>' +
      "</div></section>";

    html += '<section class="section" id="oglavlenie"><div class="container">';
    html +=
      '<div class="section-head"><span class="num">§</span><div><h2>Оглавление дела</h2><p>Четыре главы и три приложения. Начните с методики — или сразу переходите к личным делам.</p></div></div>';
    html += '<div class="chapter-grid">';
    html += chapterCard("I", "Глава · методика опознания", "Дихотомии: по каким признакам составлен фоторобот", "Восемь парных признаков — улики, из которых складывается портрет каждого типа.", "dichotomies.html");
    html += chapterCard("II", "Глава · анатомия психики", "Модель А: восемь функций психики", "Устройство внутреннего механизма: от осознанной силы до теневой компетентности.", "model-a.html");
    html += chapterCard("III", "Глава · личные дела", "Фигуранты: шестнадцать досье", "Почерк, сильные и слабые стороны, ключевые контакты каждого типа.", "#figurants");
    html += chapterCard("IV", "Глава · карта контактов", "Связи: как взаимодействуют типы", "Стратегии дистанции и речи для всех 16 видов интертипных отношений.", "interactions.html");
    html += "</div></div></section>";

    html += '<section class="section" id="figurants"><div class="container">';
    html +=
      '<div class="section-head"><span class="num">III</span><div><h2>Фигуранты дела</h2><p>Шестнадцать личных дел, сгруппированных по четырём квадрам — «группировкам» со своими запросами.</p></div></div>';

    for (var qi = 0; qi < QUADRAS.length; qi++) {
      var q = QUADRAS[qi];
      html += '<div class="quadra-block">';
      html +=
        '<div class="quadra-intro">' +
        '<span class="quadra-tag"><span class="dot" style="background:' + q.color + '"></span><span class="qname">Группировка «' + q.name + "»</span></span>" +
        '<span class="q-idea-meta">' + q.idea.toLowerCase() + "</span>" +
        "</div>";
      html += '<p class="q-motto-line">«' + q.motto + "»</p>";
      html += '<p class="q-idea">' + q.intro + "</p>";
      html += '<div class="type-grid">';
      for (var ti = 0; ti < q.order.length; ti++) {
        var t = getType(q.order[ti]);
        html +=
          '<a class="type-card" href="' + typeHref(t.id) + '">' +
          '<div class="tc-top"><span class="tc-no">Дело № ' + caseNo(t.id) + "/16</span>" + '<span class="t-code">' + t.code + "</span></div>" +
          '<div class="t-name">' + t.name + "</div>" +
          '<div class="t-formula">' + t.formula + '<span class="t-role">роль: ' + t.role.toLowerCase() + "</span></div>" +
          '<div class="t-motto">' + t.motto + "</div>" +
          '<div class="t-goto">Открыть дело →</div>' +
          "</a>";
      }
      html += "</div></div>";
    }
    html += "</div></section>";

    html += '<section class="section" id="app-a"><div class="container">';
    html +=
      '<div class="section-head"><span class="num">А</span><div><h2>Приложение А · Клубы</h2><p>Четыре круга общения по двум признакам: логика/этика и сенсорика/интуиция.</p></div></div>';
    html += '<div class="legend-list">';
    var clubOrder = ["researcher", "socializer", "pragmatist", "humanist"];
    for (var ci = 0; ci < clubOrder.length; ci++) {
      var cl = getClub(clubOrder[ci]);
      var members = TYPE_ORDER.filter(function (id) { return getType(id).club === clubOrder[ci]; });
      html +=
        '<div class="legend-item">' +
        '<span class="rname">' + cl.name + "</span>" +
        '<span class="rdesc">' + cl.desc + " Состав: " + members.map(function (id) { return getType(id).code; }).join(", ") + ".</span>" +
        "</div>";
    }
    html += "</div></div></section>";

    html += '<section class="section" id="app-b"><div class="container">';
    html +=
      '<div class="section-head"><span class="num">Б</span><div><h2>Приложение Б · Виды связей</h2><p>Все пятнадцать интертипных отношений — от дуальности до конфликта.</p></div></div>';
    html +=
      '<div class="rel-scale">' +
      "<span>Дуальные — лучшие</span>" +
      '<span class="good">Хорошие: тождество, активация, зеркальные</span>' +
      "<span>Нейтральные: полудуальные, миражные, деловые, родственные, заказ</span>" +
      "<span>Напряжённые: суперэго, квазитождество, контрарные, контроль</span>" +
      '<span class="bad">Трудные: конфликтные</span>' +
      "</div>";
    html += '<div class="legend-list">';
    for (var ri = 0; ri < REL_ORDER.length; ri++) {
      var rel = REL_ORDER[ri];
      html +=
        '<div class="legend-item">' +
        '<span class="rname">' + relName(rel) + "</span>" +
        '<span class="rdesc">' + relDesc(rel) + "</span>" +
        "</div>";
    }
    html += "</div></div></section>";

    html += '<section class="section" id="app-v"><div class="container">';
    html +=
      '<div class="section-head"><span class="num">В</span><div><h2>Приложение В · Темпераменты</h2><p>Поведенческие профили (по Гуленко) и их классические параллели.</p></div></div>';
    html += '<div class="legend-list">';
    var tempOrder = ["assertive", "mobile", "stable", "adaptive"];
    for (var ti2 = 0; ti2 < tempOrder.length; ti2++) {
      var tm = getTemperament(tempOrder[ti2]);
      var tmembers = TYPE_ORDER.filter(function (id) { return getType(id).temperament === tempOrder[ti2]; });
      html +=
        '<div class="legend-item">' +
        '<span class="rname">' + tm.name + ' <em style="font-style:normal;color:var(--muted)">· ' + tm.classic + "</em></span>" +
        '<span class="rdesc">' + tm.desc + " Типы: " + tmembers.map(function (id) { return getType(id).code; }).join(", ") + ".</span>" +
        "</div>";
    }
    html += "</div></div></section>";

    html += '<div class="container"><p class="protocol-end">Протокол составлен · архивный отдел · дело № 16</p></div>';

    app.innerHTML = html;
  }

  /* ---------- личное дело ---------- */

  function mugData(rows) {
    var h = '<div class="mug-data">';
    for (var i = 0; i < rows.length; i++) {
      h += "<div><span>" + rows[i][1] + '</span><span class="md-lab">' + rows[i][0] + "</span></div>";
    }
    return h + "</div>";
  }

  function genderCol(symbol, title, portrait, strengths, weaknesses) {
    var h = '<div class="gender-col">';
    h +=
      '<div class="g-head"><div class="g-icon">' + symbol + "</div><div>" +
      '<div class="g-title">' + title + "</div>" +
      '<div class="g-sub">наблюдение · сила · уязвимости</div></div></div>';
    if (portrait) h += '<p class="g-portrait">' + portrait + "</p>";
    h += '<div class="g-label">Сильные стороны</div><ul>';
    for (var i = 0; i < strengths.length; i++) h += "<li>" + strengths[i] + "</li>";
    h += "</ul>";
    h += '<div class="g-label weak">Уязвимости</div><ul class="weak">';
    for (var j = 0; j < weaknesses.length; j++) h += "<li>" + weaknesses[j] + "</li>";
    h += "</ul>";
    h += "</div>";
    return h;
  }

  function renderType() {
    var id = document.body.dataset.type;
    var t = getType(id);
    if (!t) {
      app.innerHTML = '<div class="container"><p style="padding:40px 0">Тип не найден.</p></div>';
      return;
    }
    var c = CONTENT[id] || {};
    var q = getQuadra(t.quadra);
    var club = getClub(t.club);
    var temp = getTemperament(t.temperament);

    var html = "";

    html +=
      '<section class="type-hero"><div class="container">' +
      '<div class="breadcrumb"><a href="' + homeHref() + '#figurants">Глава III · Фигуранты</a> · ' + q.name + "-квадра · " + club.name + "</div>" +
      '<div class="case-head">' +
      "<div>" +
      '<div class="th-code">Личное дело № ' + caseNo(id) + " · код " + t.code + " · Юнг " + t.jung + "</div>" +
      "<h1>" + t.name + "</h1>" +
      '<div class="th-formula">' + t.formula + "</div>" +
      '<div class="th-motto">' + t.motto + "</div>" +
      '<div class="chips">' +
      '<span class="chip"><span class="dot" style="background:' + q.color + '"></span><span class="lab">квадра</span> <strong>' + q.name + "</strong></span>" +
      '<span class="chip"><span class="lab">клуб</span> <strong>' + club.name + "</strong></span>" +
      '<span class="chip"><span class="lab">темперамент</span> <strong>' + temp.name + "</strong></span>" +
      '<span class="chip"><span class="lab">роль</span> <strong>' + t.role + "</strong></span>" +
      "</div>" +
      "</div>" +
      '<aside class="mug">' +
      '<div class="mug-frame"><b>' + initials(t.name) + "</b></div>" +
      '<span class="stamp stamp-sm">Идентифицирован</span>' +
      mugData([
        ["дело", "№ " + caseNo(id) + "/16"],
        ["код", t.code],
        ["юнга", t.jung],
        ["квадра", q.name]
      ]) +
      "</aside>" +
      "</div>" +
      '<div class="funcs">' +
      '<div class="func-card"><span class="f-label">Базовая функция</span><div class="f-name">' + t.baseName + '</div><span class="f-code">' + t.base + "</span></div>" +
      '<div class="func-card"><span class="f-label">Творческая функция</span><div class="f-name">' + t.creativeName + '</div><span class="f-code">' + t.creative + "</span></div>" +
      "</div>" +
      '<a class="materials-link" href="' + analysisHref(id) + '"><span class="ml-tag">Материалы дела</span><span>Экспертиза по модели А: все восемь функций этого типа, разбор позиций и рекомендации →</span></a>' +
      "</div></section>";

    html += '<section class="tp-section"><div class="container">';
    html += '<div class="section-head"><span class="num">I</span><div><h2>Протокол наблюдения</h2><p>Ключевая формула: ' + t.baseName + " в базе и " + t.creativeName.toLowerCase() + " в творческой функции.</p></div></div>";
    html += '<div class="prose"><p>' + (c.description || "") + "</p></div>";
    html += "</div></section>";

    html += '<section class="tp-section"><div class="container">';
    html += '<div class="section-head"><span class="num">II</span><div><h2>Характеристика с мест</h2><p>Показания по двум профилям: что наблюдается у мужчин и у женщин этого типа.</p></div></div>';
    html += '<div class="gender-grid">';
    html += genderCol("♂", "Мужчина", c.male || "", c.strengthsMale || [], c.weaknessesMale || []);
    html += genderCol("♀", "Женщина", c.female || "", c.strengthsFemale || [], c.weaknessesFemale || []);
    html += "</div></div></section>";

    var keyRels = [
      { rel: "dlt", title: "Дуальные", color: REL_GROUPS.best.color },
      { rel: "act", title: "Активация", color: REL_GROUPS.good.color },
      { rel: "mrr", title: "Зеркальные", color: REL_GROUPS.good.color },
      { rel: "cnf", title: "Конфликтные", color: REL_GROUPS.bad.color }
    ];

    html += '<section class="tp-section"><div class="container">';
    html += '<div class="section-head"><span class="num">III</span><div><h2>Установленные связи</h2><p>Ключевые фигуры в окружении этого типа.</p></div></div>';
    if (c.partners) {
      html += '<div class="prose"><p>' + c.partners + "</p></div>";
    }
    html += '<div class="keyrels">';
    for (var ki = 0; ki < keyRels.length; ki++) {
      var kr = keyRels[ki];
      var partners = findPartner(t.id, kr.rel);
      if (!partners.length) continue;
      var p = partners[0];
      var pt = getType(p.id);
      html +=
        '<div class="keyrel">' +
        '<div class="k-head"><span class="k-dot" style="background:' + kr.color + '"></span><div class="k-title">' + kr.title + "</div></div>" +
        "<p><strong>" + typeLabel(pt) + "</strong> — " + relDesc(kr.rel) + "</p>" +
        "</div>";
    }
    html += "</div></div></section>";

    html += '<section class="tp-section"><div class="container">';
    html += '<div class="section-head"><span class="num">IV</span><div><h2>Полная карта связей</h2><p>Отношения со всеми пятнадцатью остальными типами — от лучших к трудным.</p></div></div>';
    html += '<div class="rel-scale">';
    for (var g in REL_GROUPS) {
      if (!Object.prototype.hasOwnProperty.call(REL_GROUPS, g)) continue;
      var gr = REL_GROUPS[g];
      var cls = g === "bad" ? "bad" : g === "good" ? "good" : "";
      html += '<span class="' + cls + '">' + gr.label + "</span>";
    }
    html += "</div>";
    html += '<div class="relations">';

    var list = relationsOf(t.id);
    list.sort(function (a, b) {
      var ga = REL_GROUPS[relMeta(a.rel).group].order;
      var gb = REL_GROUPS[relMeta(b.rel).group].order;
      if (ga !== gb) return ga - gb;
      return TYPE_ORDER.indexOf(a.id) - TYPE_ORDER.indexOf(b.id);
    });

    for (var li = 0; li < list.length; li++) {
      var item = list[li];
      var other = getType(item.id);
      var meta = relMeta(item.rel);
      html +=
        '<div class="relation-row">' +
        '<div class="rr-rel">' + meta.name + '<span class="mark">' + relMark(item.rel) + "</span></div>" +
        '<div class="rr-type"><span class="tcode">' + other.code + "</span> " + other.name + "</div>" +
        '<div class="rr-desc">' + relDesc(item.rel) + "</div>" +
        "</div>";
    }
    html += "</div></div></section>";

    var idx = TYPE_ORDER.indexOf(t.id);
    var prev = TYPE_ORDER[(idx + 15) % 16];
    var next = TYPE_ORDER[(idx + 1) % 16];
    var ptPrev = getType(prev);
    var ptNext = getType(next);
    html +=
      '<div class="container"><div class="pager">' +
      '<a href="' + typeHref(ptPrev.id) + '"><div class="dir">← Предыдущее дело</div><div class="t"><small>' + ptPrev.code + " · № " + caseNo(ptPrev.id) + "</small> " + ptPrev.name + "</div></a>" +
      '<a class="next" href="' + typeHref(ptNext.id) + '"><div class="dir">Следующее дело →</div><div class="t"><small>' + ptNext.code + " · № " + caseNo(ptNext.id) + "</small> " + ptNext.name + "</div></a>" +
      "</div></div>";

    app.innerHTML = html;
  }

  if (app) {
    if (isType) renderType();
    else renderIndex();
  }
})();
