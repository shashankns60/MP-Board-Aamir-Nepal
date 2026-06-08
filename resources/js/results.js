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

  function getExamTitles(student) {
    if (student.class === "10th") {
      return {
        hindi: "हाई स्कूल सर्टिफिकेट परीक्षा 2026",
        english: "HIGH SCHOOL CERTIFICATE EXAMINATION 2026",
      };
    }
    return {
      hindi: "हायर सेकेण्डरी स्कूल सर्टिफिकेट परीक्षा (10+2) 2026",
      english: "HIGHER SECONDARY SCHOOL CERTIFICATE EXAMINATION (10+2) 2026",
    };
  }

  function buildSubjectRows(subjects) {
    return subjects
      .map(function (subject) {
        var theory = subject.theory;
        var practical = subject.practical;
        var total = subject.total;
        var hasPractical =
          practical !== null && practical !== undefined && practical !== "" && Number(practical) > 0;
        var maxMarks = hasPractical ? 100 : 100;
        var theoryMax = hasPractical ? 70 : 100;
        var practicalMax = hasPractical ? 30 : null;

        return (
          "<tr>" +
          '<td class="subject-col">' +
          escapeHtml(subject.name) +
          "</td>" +
          "<td>" +
          maxMarks +
          "</td>" +
          "<td>" +
          (hasPractical ? theoryMax : maxMarks) +
          "</td>" +
          "<td>33</td>" +
          "<td>" +
          formatMarks(theory) +
          "</td>" +
          "<td>" +
          (hasPractical ? practicalMax : "-") +
          "</td>" +
          "<td>" +
          (hasPractical ? "10" : "-") +
          "</td>" +
          "<td>" +
          (hasPractical ? formatMarks(practical) : "-") +
          "</td>" +
          "<td>" +
          formatMarks(total) +
          "</td>" +
          "<td>-</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderMarksheet(student) {
    var titles = getExamTitles(student);
    var resultText =
      (student.resultStatus || "PASS") +
      (student.division ? " IN " + student.division + " Division" : "");
    var words = numberToWords(student.totalObtained);

    return (
      '<div class="marksheet-wrapper">' +
      '<div class="certificate">' +
      '<div class="inner-border">' +
      '<div class="header-main">' +
      '<div style="text-align:center; width:78px;">' +
      '<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="36" cy="36" r="34" fill="none" stroke="#8B0000" stroke-width="2.5"/>' +
      '<circle cx="36" cy="36" r="28" fill="none" stroke="#8B0000" stroke-width="1"/>' +
      '<text x="36" y="21" text-anchor="middle" font-size="7.5" font-weight="bold" fill="#8B0000" font-family="serif">माध्यमिक</text>' +
      '<text x="36" y="31" text-anchor="middle" font-size="7.5" font-weight="bold" fill="#8B0000" font-family="serif">शिक्षा मंडल</text>' +
      '<text x="36" y="41" text-anchor="middle" font-size="7" fill="#8B0000" font-family="serif">म.प्र. भोपाल</text>' +
      '<circle cx="36" cy="55" r="9" fill="#8B0000"/>' +
      '<text x="36" y="58.5" text-anchor="middle" font-size="7.5" font-weight="bold" fill="white" font-family="sans-serif">MP</text>' +
      "</svg></div>" +
      '<div style="flex:1; text-align:center;">' +
      '<div class="hindi-title">माध्यमिक शिक्षा मण्डल, मध्यप्रदेश, भोपाल</div>' +
      '<div class="english-title">BOARD OF SECONDARY EDUCATION, MADHYA PRADESH, BHOPAL</div>' +
      '<div class="sub-title">' +
      titles.hindi +
      "</div>" +
      '<div class="sub-title" style="font-size:10.5px; font-weight:normal;">' +
      titles.english +
      "</div>" +
      "</div>" +
      '<div style="text-align:center; width:78px;">' +
      '<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="36" cy="36" r="34" fill="none" stroke="#8B0000" stroke-width="2.5"/>' +
      '<circle cx="36" cy="36" r="28" fill="none" stroke="#8B0000" stroke-width="1"/>' +
      '<text x="36" y="21" text-anchor="middle" font-size="7.5" font-weight="bold" fill="#8B0000" font-family="serif">माध्यमिक</text>' +
      '<text x="36" y="31" text-anchor="middle" font-size="7.5" font-weight="bold" fill="#8B0000" font-family="serif">शिक्षा मंडल</text>' +
      '<text x="36" y="41" text-anchor="middle" font-size="7" fill="#8B0000" font-family="serif">म.प्र. भोपाल</text>' +
      '<circle cx="36" cy="55" r="9" fill="#8B0000"/>' +
      '<text x="36" y="58.5" text-anchor="middle" font-size="7.5" font-weight="bold" fill="white" font-family="sans-serif">MP</text>' +
      "</svg></div></div>" +
      '<div class="divider"></div>' +
      '<div class="month-sno-row">' +
      "<span>JUNE - 2026</span>" +
      '<span style="font-size:13px; text-align:center;">अंकसूची सह-प्रमाणपत्र &nbsp;&nbsp;&nbsp; S.NO. / क्र.सं. &nbsp; <b style="font-size:15px;">' +
      displayValue(student.serialNumber, "-") +
      "</b></span></div>" +
      '<div class="divider"></div>' +
      '<div class="certificate-title-center">MARKSHEET CUM-CERTIFICATE</div>' +
      '<div class="divider-thin"></div>' +
      '<div class="info-grid">' +
      '<div class="info-grid-cell"><div class="info-grid-label">केन्द्र क्रमांक<br>CENTRE NO.</div><div class="info-grid-value">' +
      displayValue(student.schoolCode, "-") +
      "</div></div>" +
      '<div class="info-grid-cell"><div class="info-grid-label">विद्यालय क्र.<br>SCHOOL NO.</div><div class="info-grid-value">' +
      displayValue(student.schoolCode, "-") +
      "</div></div>" +
      '<div class="info-grid-cell"><div class="info-grid-label">नामांकन क्रमांक<br>ENROLLMENT NUMBER</div><div class="info-grid-value">' +
      displayValue(student.enrollmentNumber, "-") +
      "</div></div>" +
      '<div class="info-grid-cell"><div class="info-grid-label">नियमित/स्वाध्यायी<br>REGULAR / PRIVATE</div><div class="info-grid-value">REGULAR</div></div>' +
      '<div class="info-grid-cell"><div class="info-grid-label">अनुक्रमांक<br>ROLL NUMBER</div><div class="info-grid-value">' +
      displayValue(student.rollNumber, "-") +
      "</div></div></div>" +
      '<div class="certified-row">CERTIFIED THAT</div>' +
      '<div class="info-section"><div class="info-left">' +
      '<div class="student-name-row">' +
      '<div class="student-label">श्री / सुश्री<br><span style="font-size:9.5px;">SHRI / SUSHRI</span></div>' +
      '<div class="student-name">' +
      displayValue(student.studentName, "-") +
      "</div>" +
      '<div class="student-gender">लिंग<br>GENDER<br><b>-</b></div></div>' +
      '<div class="field-row"><span class="field-label">पिता / पति का नाम<br><span style="font-size:9.5px;">FATHER\'S / HUSBAND\'S NAME IS</span></span><span class="field-colon">:</span><span class="field-value">' +
      displayValue(student.fatherName, "-") +
      "</span></div>" +
      '<div class="field-row"><span class="field-label">माता का नाम<br><span style="font-size:9.5px;">AND MOTHER\'S NAME IS</span></span><span class="field-colon">:</span><span class="field-value">' +
      displayValue(student.motherName, "-") +
      '</span><span style="margin-left:12px; font-size:13px; font-weight:bold;">है</span></div></div>' +
      '<div class="photo-box"><svg width="60" height="80" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="80" fill="#ccc"/><circle cx="30" cy="25" r="16" fill="#999"/><ellipse cx="30" cy="65" rx="26" ry="20" fill="#999"/></svg></div></div>' +
      '<div class="notice-text">इस छात्र की उक्त परीक्षाफल उच्चतर माध्यमिक प्रमाण पत्र परीक्षा वर्ष 2019 से लागू संशोधित पाठ्यक्रम के आधार पर <b>शैक्षणिक वर्ष</b> पूर्व<br>THE HIGHER SECONDARY SCHOOL CERTIFICATE EXAMINATION OF THE BOARD IN THE YEAR 2019 FROM SCHOOL / CENTRE<br>AND SUBJECT WISE MARKS OBTAINED ARE AS UNDER:</div>' +
      '<div style="font-size:10px; font-weight:bold; margin:2px 0;">' +
      displayValue(student.schoolName, "-") +
      "</div>" +
      '<div class="divider-thin"></div>' +
      '<table class="marks-table"><thead><tr>' +
      '<th rowspan="2" class="subject-col" style="width:145px;">विषय<br>SUBJECTS</th>' +
      '<th rowspan="2" style="width:55px;">अधिकतम अंक<br>MAXIMUM MARKS</th>' +
      '<th colspan="3">सैद्धान्तिक / THEORY</th><th colspan="3">प्रयोगात्मक / PRACTICAL</th>' +
      '<th rowspan="2" style="width:55px;">प्राप्तांक<br>MARKS OBTAINED</th>' +
      '<th rowspan="2" style="width:45px;">विभाग<br>DIVISION</th></tr><tr>' +
      '<th style="width:48px; font-size:9px;">अधिकतम अंक<br>MAXIMUM MARKS</th>' +
      '<th style="width:48px; font-size:9px;">न्यूनतम अंक<br>MINIMUM MARKS</th>' +
      '<th style="width:48px; font-size:9px;">प्राप्तांक<br>MARKS OBTAINED</th>' +
      '<th style="width:48px; font-size:9px;">अधिकतम अंक<br>MAXIMUM MARKS</th>' +
      '<th style="width:48px; font-size:9px;">न्यूनतम अंक<br>MINIMUM MARKS</th>' +
      '<th style="width:48px; font-size:9px;">प्राप्तांक<br>MARKS OBTAINED</th></tr></thead><tbody>' +
      buildSubjectRows(student.subjects || []) +
      '<tr class="grand-total-row"><td class="subject-col" colspan="8" style="text-align:right; font-weight:bold; padding-right:8px;">महायोग / GRAND TOTAL</td><td>' +
      displayValue(student.maximumMarks, "-") +
      "</td><td>" +
      displayValue(student.totalObtained, "-") +
      "</td></tr></tbody></table>" +
      '<div class="divider-thin"></div>' +
      '<div class="words-section"><div style="display:flex; gap:8px; align-items:baseline; margin-bottom:2px;"><span style="min-width:150px;">महायोग शब्दों में :</span><span style="font-weight:bold;">' +
      escapeHtml(words) +
      '</span></div><div style="display:flex; gap:8px; align-items:baseline;"><span style="min-width:150px;">GRAND TOTAL IN WORDS :</span><span style="font-weight:bold;">' +
      escapeHtml(words) +
      "</span></div></div>" +
      '<div class="divider-thin"></div>' +
      '<div class="result-row"><b>परिणाम / RESULT :</b> &nbsp; ' +
      escapeHtml(resultText) +
      "</div>" +
      '<div class="divider-thin"></div>' +
      '<div class="activities-section"><div class="activities-title">अतिरिक्त विषय / ADDITIONAL SUBJECT</div>' +
      '<div class="activity-row"><span style="min-width:280px;">Date of Birth / जन्म तिथि :</span><span style="font-weight:bold;">' +
      escapeHtml(formatDobForDisplay(student.dateOfBirth)) +
      "</span></div>" +
      '<div style="font-size:9px; font-weight:bold; margin-top:1px;">Issue Date: ' +
      displayValue(student.issueDate, "-") +
      "</div></div>" +
      '<div class="divider-thin"></div>' +
      '<div class="footer-section"><div style="flex:1;"><div style="font-size:9.5px; line-height:1.5;">' +
      displayValue(student.schoolName, "-") +
      " For Regular Candidates only<br>नाम स्थान व हस्ताक्षर प्रधानाचार्य / Signature &amp; Stamp</div>" +
      '<div class="sign-box">Principal<br>' +
      displayValue(student.schoolName, "-") +
      '</div></div><div style="text-align:right; min-width:140px;"><div style="font-size:9.5px; margin-bottom:2px;">सचिव / SECRETARY</div>' +
      '<div class="sign-box" style="text-align:center;">सचिव / SECRETARY</div></div></div>' +
      "</div></div></div>"
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
