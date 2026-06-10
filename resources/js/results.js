(function () {
  var resultsData = null;

  function escapeHtml(value) {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function displayValue(value, fallback) {
    if (value === null || value === undefined || value === "") {
      return fallback || "-";
    }
    return escapeHtml(value);
  }

  function formatMarks(value) {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    var num = Number(value);
    if (isNaN(num)) {
      return escapeHtml(value);
    }
    return String(num).padStart(3, "0");
  }

  function numberToWords(num) {
    var ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    var tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function belowThousand(n) {
      if (n < 20) {
        return ones[n];
      }
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      }
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + belowThousand(n % 100) : "")
      );
    }

    if (!num || isNaN(num)) {
      return "";
    }
    num = Math.floor(Number(num));
    if (num === 0) {
      return "Zero";
    }

    var parts = [];
    if (num >= 10000000) {
      parts.push(belowThousand(Math.floor(num / 10000000)) + " Crore");
      num %= 10000000;
    }
    if (num >= 100000) {
      parts.push(belowThousand(Math.floor(num / 100000)) + " Lakh");
      num %= 100000;
    }
    if (num >= 1000) {
      parts.push(belowThousand(Math.floor(num / 1000)) + " Thousand");
      num %= 1000;
    }
    if (num > 0) {
      parts.push(belowThousand(num));
    }
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function normalizeRoll(value) {
    return String(value || "").trim().replace(/^0+/, "");
  }

  function formatDobForDisplay(value) {
    if (!value) {
      return "-";
    }
    var parts = String(value).split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return parts[2] + "." + parts[1] + "." + parts[0];
    }
    return value;
  }

  var LOGO_SRC = "resources/images/mp-board-marksheet-logo.png";
  var SECRETARY_SIGNATURE_SRC = "resources/images/secretary-signature.png?v=2";

  function getExamTitles(student) {
    var year = student.examinationYear || "2026";
    if (student.class === "10th") {
      return {
        hindi: "हाई स्कूल सर्टिफिकेट परीक्षा " + year,
        english: "HIGH SCHOOL CERTIFICATE EXAMINATION " + year,
      };
    }
    return {
      hindi: "हायर स्कूल सर्टिफिकेट परीक्षा (10+2) " + year,
      english: "HIGHER SECONDARY SCHOOL CERTIFICATE EXAMINATION (10+2) " + year,
    };
  }

  function getExamSessionLabel(student) {
    return "JUNE " + (student.examinationYear || "2026");
  }

  function getStudentPercentage(student) {
    if (
      student.percentage !== null &&
      student.percentage !== undefined &&
      student.percentage !== ""
    ) {
      var pct = Number(student.percentage);
      if (!isNaN(pct)) {
        return pct <= 1 ? pct * 100 : pct;
      }
    }

    var obtained = Number(student.totalObtained);
    var maximum = Number(student.maximumMarks);
    if (!isNaN(obtained) && !isNaN(maximum) && maximum > 0) {
      return (obtained / maximum) * 100;
    }

    return null;
  }

  function calculateGrade(student) {
    var pct = getStudentPercentage(student);
    if (pct === null || isNaN(pct)) {
      return "-";
    }

    if (pct >= 81) {
      return "A+";
    }
    if (pct >= 60) {
      return "A";
    }
    if (pct >= 41) {
      return "B";
    }
    if (pct >= 31) {
      return "C";
    }
    if (pct >= 1) {
      return "D";
    }
    return "-";
  }

  var MONTH_NAMES = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  function parseDobParts(value) {
    if (!value) {
      return null;
    }
    var text = String(value).trim();
    var iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      return {
        day: Number(iso[3]),
        month: Number(iso[2]),
        year: Number(iso[1]),
      };
    }
    var dotted = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dotted) {
      return {
        day: Number(dotted[1]),
        month: Number(dotted[2]),
        year: Number(dotted[3]),
      };
    }
    return null;
  }

  function getOrdinalSuffix(day) {
    var num = Number(day);
    if (num >= 11 && num <= 13) {
      return "TH";
    }
    switch (num % 10) {
      case 1:
        return "ST";
      case 2:
        return "ND";
      case 3:
        return "RD";
      default:
        return "TH";
    }
  }

  function yearToWordsUpper(year) {
    var ones = [
      "",
      "ONE",
      "TWO",
      "THREE",
      "FOUR",
      "FIVE",
      "SIX",
      "SEVEN",
      "EIGHT",
      "NINE",
      "TEN",
      "ELEVEN",
      "TWELVE",
      "THIRTEEN",
      "FOURTEEN",
      "FIFTEEN",
      "SIXTEEN",
      "SEVENTEEN",
      "EIGHTEEN",
      "NINETEEN",
    ];
    var tens = [
      "",
      "",
      "TWENTY",
      "THIRTY",
      "FORTY",
      "FIFTY",
      "SIXTY",
      "SEVENTY",
      "EIGHTY",
      "NINETY",
    ];

    function belowThousand(n) {
      if (n < 20) {
        return ones[n];
      }
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      }
      return (
        ones[Math.floor(n / 100)] +
        " HUNDRED" +
        (n % 100 ? " " + belowThousand(n % 100) : "")
      );
    }

    year = Math.floor(Number(year));
    if (!year || isNaN(year)) {
      return "";
    }
    if (year >= 1000) {
      var thousands = Math.floor(year / 1000);
      var remainder = year % 1000;
      var parts = [belowThousand(thousands) + " THOUSAND"];
      if (remainder > 0) {
        parts.push(belowThousand(remainder));
      }
      return parts.join(" ").replace(/\bNINETY\b/g, "NINTY");
    }
    return belowThousand(year).replace(/\bNINETY\b/g, "NINTY");
  }

  function formatDobLongHtml(value) {
    var parts = parseDobParts(value);
    if (!parts || !parts.day || !parts.month || !parts.year) {
      return escapeHtml(formatDobForDisplay(value) || "-");
    }

    var numeric =
      String(parts.day).padStart(2, "0") +
      "." +
      String(parts.month).padStart(2, "0") +
      "." +
      parts.year;
    var monthName = MONTH_NAMES[parts.month - 1] || "";
    var yearWords = yearToWordsUpper(parts.year);

    return (
      numeric +
      " - " +
      parts.day +
      "<sup>" +
      getOrdinalSuffix(parts.day) +
      "</sup> " +
      monthName +
      " " +
      yearWords
    );
  }

  function buildSubjectRows(subjects) {
    return subjects
      .map(function (subject, index) {
        var hasPractical =
          subject.practical !== null &&
          subject.practical !== undefined &&
          subject.practical !== "" &&
          Number(subject.practical) > 0;
        var rowStyle = index % 2 === 1 ? ' style="background:#f9f9f5;"' : "";

        return (
          "<tr" +
          rowStyle +
          ">" +
          '<td class="subject-col">' +
          escapeHtml(String(subject.name || "").toUpperCase()) +
          "</td>" +
          '<td class="max-marks">100</td>' +
          "<td>33</td>" +
          "<td>" +
          (hasPractical ? "10" : "-") +
          "</td>" +
          '<td class="marks-val">' +
          formatMarks(subject.theory) +
          "</td>" +
          "<td>" +
          (hasPractical ? formatMarks(subject.practical) : "-") +
          "</td>" +
          '<td class="marks-val">' +
          formatMarks(subject.total) +
          "</td>" +
          "<td></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderMarksheet(student) {
    var titles = getExamTitles(student);
    var examYear = student.examinationYear || "2026";
    var resultText =
      (student.resultStatus || "PASS") +
      (student.division ? " IN " + String(student.division).toUpperCase() + " DIVISION" : "");
    var words = numberToWords(student.totalObtained).toUpperCase();

    return (
      '<div class="ms-wrap">' +
      '<div class="ms-sheet-bg" style="position:relative; background: linear-gradient(160deg, #f5d8d8 0%, #faeaea 25%, #f8f4e6 55%, #d8edd8 100%);">' +
      '<div class="ms-logo-watermark" aria-hidden="true"><img src="' +
      LOGO_SRC +
      '" alt=""></div>' +
      '<div class="ms-inner-content">' +
      '<div class="ms-header">' +
      '<div class="ms-header-inner">' +
      '<div class="ms-logo"><img src="' +
      LOGO_SRC +
      '" style="width:80px;height:80px;object-fit:contain;" alt="MP Board Logo"></div>' +
      '<div class="ms-header-text">' +
      '<div class="ms-title-hi">माध्यमिक शिक्षा मण्डल, मध्यप्रदेश, भोपाल</div>' +
      '<div class="ms-title-en">BOARD OF SECONDARY EDUCATION, MADHYA PRADESH, BHOPAL</div>' +
      '<div style="margin-top:4px;">' +
      '<div class="ms-subtitle-hi">' +
      titles.hindi +
      "</div>" +
      '<div class="ms-subtitle-en">' +
      titles.english +
      "</div></div></div>" +
      '<div class="ms-logo" style="visibility:hidden;"></div></div>' +
      '<div class="ms-header-bottom">' +
      '<div style="font-size:10px;font-weight:700;">' +
      getExamSessionLabel(student) +
      ' &nbsp; <span style="font-family:\'Noto Sans Devanagari\',sans-serif;font-size:9px;">अंकसूची सह-प्रमाणपत्र</span></div>' +
      '<div class="ms-marksheet-label">MARKSHEET CUM-CERTIFICATE</div>' +
      '<div><span class="ms-sno">स.क्र./ S.NO. </span><span class="ms-sno-val">' +
      displayValue(student.serialNumber, "-") +
      "</span></div></div></div>" +
      '<div class="ms-grid-top">' +
      '<div class="ms-grid-top-cell"><div class="ms-cell-label">केन्द्र क्रमांक</div><div class="ms-cell-label-en">CENTER NO.</div><div class="ms-cell-val">' +
      displayValue(student.schoolCode, "-") +
      "</div></div>" +
      '<div class="ms-grid-top-cell"><div class="ms-cell-label">संस्था क्रमांक</div><div class="ms-cell-label-en">SCHOOL NO.</div><div class="ms-cell-val">' +
      displayValue(student.schoolCode, "-") +
      "</div></div>" +
      '<div class="ms-grid-top-cell"><div class="ms-cell-label">नामांकन क्रमांक</div><div class="ms-cell-label-en">ENROLLMENT NUMBER</div><div class="ms-cell-val">' +
      displayValue(student.enrollmentNumber, "-") +
      "</div></div>" +
      '<div class="ms-grid-top-cell"><div class="ms-cell-label">नियमित/स्वाध्यायी</div><div class="ms-cell-label-en">REGULAR / PRIVATE</div><div class="ms-cell-val">REGULAR</div></div>' +
      '<div class="ms-grid-top-cell" style="border-right:none;"><div class="ms-cell-label">रोल नंबर</div><div class="ms-cell-label-en">ROLL NUMBER</div><div class="ms-cell-val">' +
      displayValue(student.rollNumber, "-") +
      "</div></div></div>" +
      '<div class="ms-certified-bar"><span style="font-size:10px;">प्रमाणित किया जाता है कि</span><span class="ms-certified-en">&nbsp;/ &nbsp;CERTIFIED THAT</span></div>' +
      '<div class="ms-person-section"><div class="ms-person-left">' +
      '<div class="ms-person-row"><div class="ms-person-label">श्री/सुश्री<span class="ms-person-label-en">SHRI / SUSHRI</span></div>' +
      '<div style="flex:1; display:flex; justify-content:space-between; align-items:baseline;">' +
      '<div class="ms-person-val">' +
      escapeHtml(String(student.studentName || "-").toUpperCase()) +
      '</div><div style="font-size:9px; color:#333;">जिनके / WHOSE</div></div></div>' +
      '<div class="ms-person-row"><div class="ms-person-label">पिता/पति का नाम<span class="ms-person-label-en">FATHER\'S HUSBAND\'S NAME IS</span></div>' +
      '<div class="ms-person-val">' +
      escapeHtml(String(student.fatherName || "-").toUpperCase()) +
      "</div></div>" +
      '<div class="ms-person-row"><div class="ms-person-label">व माता का नाम<span class="ms-person-label-en">AND MOTHER\'S NAME IS</span></div>' +
      '<div class="ms-person-val">' +
      escapeHtml(String(student.motherName || "-").toUpperCase()) +
      "</div></div>" +
      '<div class="ms-person-row" style="align-items:flex-start;"><div class="ms-person-label">तथा जन्म तिथि<span class="ms-person-label-en">AND DATE OF BIRTH IS</span></div>' +
      '<div class="ms-person-val" style="font-size:10px; line-height:1.4;">' +
      formatDobLongHtml(student.dateOfBirth) +
      "</div></div></div></div>" +
      '<div class="ms-appeared-text">' +
      '<span style="font-size:9.5px;">इस मण्डल की हाईस्कूल सर्टिफिकेट परीक्षा वर्ष - ' +
      examYear +
      " में संस्था/केन्द्र** से सम्मिलित हुए एवं विषयवार प्राप्तांक निम्नानुसार अर्जित किए हैं :-</span><br>" +
      '<span style="font-size:9px; color:#333;">APPEARED IN THE HIGHER SECONDARY SCHOOL CERTIFICATE EXAMINATION OF THIS BOARD IN THE YEAR ' +
      examYear +
      " FROM (SCHOOL / CENTRE)** AND SUBJECT WISE MARKS OBTAINED ARE AS UNDERL:-</span></div>" +
      '<div class="ms-school-name">' +
      escapeHtml(String(student.schoolName || "-").toUpperCase()) +
      "</div>" +
      '<table class="ms-marks-table"><thead><tr>' +
      '<th rowspan="2" style="width:160px; text-align:left; padding-left:8px; vertical-align:middle;"><div class="ms-th-label" style="align-items:flex-start;"><span class="th-hi">विषय</span><span class="th-en">/ SUBJECTS</span></div></th>' +
      '<th rowspan="2" style="width:55px;"><div class="ms-th-label"><span class="th-hi">अधिकतम अंक</span><span class="th-en">MAX MARKS</span></div></th>' +
      '<th rowspan="2" style="width:45px;"><div class="ms-th-label"><span class="th-hi">न्यूनतम सैद्धांतिक</span><span class="th-en">MIN THEORY</span></div></th>' +
      '<th rowspan="2" style="width:45px;"><div class="ms-th-label"><span class="th-hi">न्यूनतम प्रायोगिक</span><span class="th-en">MIN PRACTICAL</span></div></th>' +
      '<th colspan="3" style="background:#d4c888;"><div class="ms-th-label"><span class="th-hi">प्राप्तांक</span><span class="th-en">/ MARKS OBTAINED</span></div></th>' +
      '<th rowspan="2" style="width:55px;"><div class="ms-th-label"><span class="th-hi">विशेष</span><span class="th-en">REMARKS</span></div></th></tr><tr>' +
      '<th style="width:55px; background:#e0d898;"><div class="ms-th-label"><span class="th-hi">सैद्धांतिक</span><span class="th-en">THEORY</span></div></th>' +
      '<th style="width:55px; background:#e0d898;"><div class="ms-th-label"><span class="th-hi">प्रायोगिक</span><span class="th-en">PRACTICAL</span></div></th>' +
      '<th style="width:45px; background:#e0d898;"><div class="ms-th-label"><span class="th-hi">योग</span><span class="th-en">TOTAL</span></div></th></tr></thead><tbody>' +
      buildSubjectRows(student.subjects || []) +
      '<tr class="ms-grand-total-row"><td colspan="1" style="text-align:right; padding-right:8px; font-family:\'Noto Sans Devanagari\',sans-serif;"></td>' +
      '<td style="font-weight:700;">' +
      displayValue(student.maximumMarks, "-") +
      '</td><td colspan="4" style="font-family:\'Noto Sans Devanagari\',sans-serif; font-size:11px;">महायोग / GRAND TOTAL</td>' +
      '<td style="font-size:13px; font-weight:900; color:#8B0000;">' +
      displayValue(student.totalObtained, "-") +
      "</td><td></td></tr></tbody></table>" +
      '<div class="ms-total-words"><span style="font-family:\'Noto Sans Devanagari\',sans-serif; font-size:9.5px;">महायोग शब्दों में:</span>' +
      "&nbsp; GRAND TOTAL IN WORDS : <span>" +
      escapeHtml(words) +
      "</span></div>" +
      '<div class="ms-result-row"><span class="ms-result-label">परीक्षाफल / RESULT</span>' +
      '<span class="ms-result-val">&nbsp;&nbsp;&nbsp; ' +
      escapeHtml(resultText) +
      "</span></div>" +
      '<div class="ms-add-subject" style="display:flex; align-items:center; gap:8px; min-height:22px;"><span>अतिरिक्त विषय / ADDITIONAL SUBJECT</span></div>' +
      '<div class="ms-env-row"><div class="ms-env-text">' +
      '<div class="ms-bi-stack" style="font-size:9.5px; margin-bottom:3px;"><span class="ms-bi-hi">पर्यावरण शिक्षा एवं आपदा प्रबंधन</span><span class="ms-bi-en" style="font-size:9px;">Environment Education &amp; Disaster Management</span></div>' +
      '<div class="ms-bi-stack" style="font-size:9px; color:#8B0000;"><span class="ms-bi-hi">+ राज्य/राष्ट्रीय/अन्तरार्ष्ट्रीय स्तरपर खेलने पर प्राप्त बोनस अंक</span><span class="ms-bi-en" style="font-size:8.5px;">AWARDED BONUS MARKS FOR PARTICIPATION IN STATE / NATIONAL / INTERNATIONAL LEVEL GAMES: <strong>-</strong></span></div></div>' +
      '<div style="text-align:center;"><div class="ms-bi-stack" style="font-weight:700;"><span class="ms-bi-hi" style="font-size:10px;">ग्रेड</span><span class="ms-bi-en" style="font-size:9px;">GRADE</span></div><div class="ms-grade-box">' +
      escapeHtml(calculateGrade(student)) +
      "</div></div></div>" +
      '<div class="ms-bottom-section"><div class="ms-bottom-left">' +
      '<div class="ms-date-stamp">' +
      displayValue(student.issueDate, "-") +
      "</div>" +
      '<div class="ms-regular-note">(केवल नियमित परीक्षार्थियों के लिए For Regular Candidates only)</div>' +
      '<div class="ms-bi-stack" style="font-size:9px; margin-bottom:3px;"><span class="ms-bi-hi">निम्नांकित आंत्रिक विषयों में निपुणता प्राप्त की:</span><span class="ms-bi-en" style="font-size:8.5px; color:#333;">Attained Proficiency in the following internal subjects:-</span></div>' +
      '<div style="font-size:9px;">(1) <span style="font-family:\'Noto Sans Devanagari\',sans-serif;">समाजोपयोगी उत्पादक कार्य</span> Socialy Daeus Productive wors</div>' +
      '<div style="font-size:9px;">(2) <span style="font-family:\'Noto Sans Devanagari\',sans-serif;">शारीरिक, योगा एवं नैतिक शिक्षा</span> Physical Yoga &amp; Monal Education</div></div>' +
      '<div class="ms-bottom-right" style="display:flex; flex-direction:column; justify-content:space-between;"><div class="ms-bi-stack" style="color:#333;">' +
      '<span class="ms-bi-hi" style="font-size:9px; text-align:center;">प्राचार्य के स्याही से हस्ताक्षर एवं पद मुद्रा</span>' +
      '<span class="ms-bi-en" style="font-size:8.5px; text-align:center;">SEAL AND SIGNATURE OF THE PRINCIPAL</span></div>' +
      '<div class="ms-secretary-block">' +
      '<img src="' +
      SECRETARY_SIGNATURE_SRC +
      '" alt="Secretary signature" class="ms-secretary-sign">' +
      '<div class="ms-secretary-label">सचिव/ SECRETARY</div></div></div></div>' +
      '<div class="ms-bottom-ids"><span>' +
      displayValue(student.serialNumber, "-") +
      "</span><span>" +
      displayValue(student.rollNumber, "-") +
      "</span></div></div></div></div>"
    );
  }

  function showMessage(container, message, isError) {
    container.innerHTML =
      '<div class="result-message ' +
      (isError ? "result-message-error" : "result-message-info") +
      '">' +
      escapeHtml(message) +
      "</div>";
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function findStudent(rollNumber, dob) {
    var normalizedRoll = normalizeRoll(rollNumber);
    return (resultsData || []).find(function (student) {
      return (
        normalizeRoll(student.rollNumber) === normalizedRoll &&
        student.dateOfBirth === dob
      );
    });
  }

  function loadResultsData() {
    return fetch("resources/data/results-2026-jun.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Results data could not be loaded.");
        }
        return response.json();
      })
      .then(function (data) {
        resultsData = data;
      });
  }

  function handleSubmit(event) {
    event.preventDefault();

    var form = event.target;
    var rollInput = form.querySelector('[name="rollnumber"]');
    var dobInput = form.querySelector('[name="dob"]');
    var output = document.getElementById("marksheet-output");

    if (!rollInput.value.trim()) {
      showMessage(output, "Please enter your Roll Number.", true);
      return false;
    }
    if (!dobInput.value) {
      showMessage(output, "Please enter your Date of Birth.", true);
      return false;
    }

    var lookup = function () {
      var student = findStudent(rollInput.value, dobInput.value);
      if (!student) {
        showMessage(
          output,
          "No marksheet found for the given Roll Number and Date of Birth.",
          true
        );
        return;
      }
      output.innerHTML = renderMarksheet(student);
      output.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (resultsData) {
      lookup();
    } else {
      showMessage(output, "Loading results data...", false);
      loadResultsData()
        .then(lookup)
        .catch(function () {
          showMessage(
            output,
            "Unable to load results data. Please refresh the page and try again.",
            true
          );
        });
    }

    return false;
  }

  function handleReset() {
    var output = document.getElementById("marksheet-output");
    if (output) {
      output.innerHTML = "";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("result-lookup-form");
    if (!form) {
      return;
    }

    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", function () {
      window.setTimeout(handleReset, 0);
    });

    loadResultsData().catch(function () {
      /* Data will be retried on submit */
    });
  });
})();
