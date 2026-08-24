(function () {
  var resultsData = null;
  var API_BASE = window.MPBSE_API_BASE || "";

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

  function getSubjectCode(subject, studentClass) {
    if (subject && (subject.code || subject.subjectCode)) {
      return String(subject.code || subject.subjectCode);
    }

    var name = String((subject && subject.name) || "")
      .toLowerCase()
      .replace(/[^a-z]+/g, " ")
      .trim();

    var tenth = {
      hindi: "201",
      english: "202",
      sanskrit: "203",
      urdu: "209",
      mathematics: "210",
      maths: "210",
      science: "211",
      "social science": "212",
      "computer science": "218",
      computer: "218",
    };
    var twelfth = {
      hindi: "301",
      english: "302",
      sanskrit: "303",
      mathematics: "310",
      maths: "310",
      physics: "311",
      chemistry: "312",
      biology: "313",
      "computer science": "318",
      computer: "318",
      economics: "321",
      "business studies": "322",
      accountancy: "323",
      history: "330",
      geography: "331",
      "political science": "332",
      sociology: "333",
    };

    var map = studentClass === "10th" ? tenth : twelfth;
    return map[name] || "-";
  }

  function isBlueSubject(subject) {
    var name = String((subject && subject.name) || "").toLowerCase();
    return name.indexOf("computer") !== -1;
  }

  function formatPracticalMarks(value) {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      Number(value) === 0
    ) {
      return "-";
    }
    return formatMarks(value);
  }

  function formatDobSlash(value) {
    var parts = parseDobParts(value);
    if (!parts || !parts.day || !parts.month || !parts.year) {
      return displayValue(value, "-");
    }
    return (
      String(parts.day).padStart(2, "0") +
      "/" +
      String(parts.month).padStart(2, "0") +
      "/" +
      parts.year
    );
  }

  function formatResultDeclarationDate(student) {
    var issue = String(student.issueDate || "").trim();
    var dotted = issue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dotted) {
      return (
        dotted[1].padStart(2, "0") +
        "/" +
        dotted[2].padStart(2, "0") +
        "/" +
        dotted[3]
      );
    }
    var iso = issue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      return iso[3] + "/" + iso[2] + "/" + iso[1];
    }
    return displayValue(student.examinationYear, "2026");
  }

  function getNicExamHeading(student) {
    var year = student.examinationYear || "2026";
    if (student.class === "10th") {
      return (
        "High School Certificate Examination (HSC) - 10<sup>th</sup> Class Result - " +
        escapeHtml(year)
      );
    }
    return (
      "Higher Secondary School Certificate Examination (HSSC) - 12<sup>th</sup> Class Result - " +
      escapeHtml(year)
    );
  }

  function buildSubjectRows(subjects, studentClass) {
    return (subjects || [])
      .map(function (subject) {
        var nameClass = isBlueSubject(subject) ? "name blue" : "name";
        return (
          "<tr>" +
          '<td class="code">' +
          escapeHtml(getSubjectCode(subject, studentClass)) +
          "</td>" +
          '<td class="' +
          nameClass +
          '">' +
          escapeHtml(String(subject.name || "-").toUpperCase()) +
          "</td>" +
          '<td class="theory">' +
          formatMarks(subject.theory) +
          "</td>" +
          '<td class="practical">' +
          formatPracticalMarks(subject.practical) +
          "</td>" +
          '<td class="total">' +
          formatMarks(subject.total) +
          "</td>" +
          '<td class="remark"></td>' +
          "</tr>"
        );
      })
      .join("");
  }

  function renderMarksheet(student) {
    var examYear = student.examinationYear || "2026";
    var resultText =
      (student.resultStatus || "PASS") +
      (student.division
        ? " IN " + String(student.division).toUpperCase() + " DIVISION"
        : "");
    var obtained = displayValue(student.totalObtained, "-");
    var maximum = displayValue(student.maximumMarks, "600");
    var centreCode = displayValue(
      student.centreCode || student.centerCode || student.schoolCode,
      "-"
    );
    var applicationNo = displayValue(
      student.applicationNumber || student.applicationNo || student.serialNumber,
      "-"
    );
    var candidateType = displayValue(student.candidateType, "REGULAR");

    return (
      '<div class="ms-nic-wrap"><div class="ms-nic-canvas">' +
      '<div class="header">' +
      '<div class="title">BOARD OF SECONDARY EDUCATION, Madhya Pradesh</div>' +
      '<div class="subtitle">(Examination Results - ' +
      escapeHtml(examYear) +
      ")</div>" +
      '<div class="brought-by">Brought to you by National Informatics Centre</div>' +
      "</div>" +
      '<div class="exam-heading">' +
      getNicExamHeading(student) +
      "</div>" +
      '<table class="meta-table"><tr>' +
      '<th style="width:13%">Centre Code</th>' +
      '<th style="width:14%">School Code</th>' +
      '<th style="width:20%">Enrolment No</th>' +
      '<th style="width:18%">Regular/Private</th>' +
      '<th style="width:17%">Application No</th>' +
      '<th style="width:18%">Roll Number</th>' +
      "</tr><tr>" +
      "<td>" +
      centreCode +
      "</td>" +
      "<td>" +
      displayValue(student.schoolCode, "-") +
      "</td>" +
      "<td>" +
      displayValue(student.enrollmentNumber, "-") +
      "</td>" +
      "<td>" +
      escapeHtml(String(candidateType).toUpperCase()) +
      "</td>" +
      "<td>" +
      applicationNo +
      "</td>" +
      "<td>" +
      displayValue(student.rollNumber, "-") +
      "</td>" +
      "</tr></table>" +
      '<div class="student-info-wrap"><table class="student-info">' +
      '<tr><td class="label">Student Name</td><td class="value">' +
      escapeHtml(String(student.studentName || "-").toUpperCase()) +
      "</td></tr>" +
      '<tr><td class="label">Father\'s Name</td><td class="value">' +
      escapeHtml(String(student.fatherName || "-").toUpperCase()) +
      "</td></tr>" +
      '<tr><td class="label">Mother\'s Name</td><td class="value">' +
      escapeHtml(String(student.motherName || "-").toUpperCase()) +
      "</td></tr>" +
      '<tr><td class="label">Date of Birth</td><td class="value">' +
      formatDobSlash(student.dateOfBirth) +
      "</td></tr>" +
      "</table></div>" +
      '<div class="result-status">Result :- ' +
      escapeHtml(resultText) +
      "</div>" +
      '<div class="marks-wrap"><table class="marks-table"><tr>' +
      '<th style="width:16%">Subject Code</th>' +
      '<th style="width:20%">Subject Name</th>' +
      '<th style="width:17%">Theory Marks</th>' +
      '<th style="width:27%">Practical/Internal Marks</th>' +
      '<th style="width:13%">Total Marks</th>' +
      '<th style="width:7%">Remark</th>' +
      "</tr>" +
      buildSubjectRows(student.subjects || [], student.class) +
      '<tr class="grand-total"><td colspan="6">Grand Total ( Theory + Practical/Internal Marks ) : ' +
      obtained +
      "/" +
      maximum +
      "</td></tr>" +
      '<tr class="empty-row"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>' +
      "</table></div>" +
      '<div class="additional-info">' +
      "<div><u>Participated</u> in NCC 'A' Certificate Course and obtained Grade: XX</div>" +
      "<div>Environmental Education and Disaster Management: " +
      escapeHtml(calculateGrade(student)) +
      "</div>" +
      "<div>Awarded Bonus Marks for participation in State/National/International level games: XX</div>" +
      '<div class="hindi-note"># परीक्षा परिणाम नेट प्रदर्शित के आधार पर तैयार किया गया है। परीक्षा परिणाम में # से दर्शाये गए विषय के प्राप्तांक के महत्त्व में सम्मिलित नहीं किया गया है।</div>' +
      "</div>" +
      '<div class="retotal-notice"><p>Students may apply online for Re-totalling/copy of Answer-book within 15 days from the date of Result declaration<br>(i.e. ' +
      formatResultDeclarationDate(student) +
      ") through MPOnline only.</p></div>" +
      '<div class="disclaimer-line">!!! NOTE: This information should not be treated as Marksheet !!!</div>' +
      '<div class="links-section"><a href="#result-lookup-form">Back</a> &nbsp;&nbsp; <a href="result.html">Madhya Pradesh State Results</a></div>' +
      '<div class="warning-box">Note: Neither <b>NIC</b> nor <b><u>Board of Secondary Education, Madhya Pradesh</u></b> is responsible for any inadvertent error that may have crept in the results being published on NET. The results published on net are for immediate information to the examinees. It cann\'t be treated as original marks sheets. Original mark sheets are being issued by the Board separately.</div>' +
      '<div class="footer">Hosted By National Informatics Centre (NIC)<br>Data Provided By Board of Secondary Education, Madhya Pradesh</div>' +
      "</div></div>"
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

  function lookupFromApi(rollNumber, dob) {
    if (!API_BASE) {
      return Promise.reject(new Error("NO_API"));
    }

    return fetch(API_BASE.replace(/\/$/, "") + "/api/results/lookup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        rollNumber: rollNumber,
        dateOfBirth: dob,
      }),
    }).then(function (response) {
      return response.json().then(function (payload) {
        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Lookup failed.");
        }
        return payload.data;
      });
    });
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
      var showStudent = function (student) {
        output.innerHTML = renderMarksheet(student);
        output.scrollIntoView({ behavior: "smooth", block: "start" });
      };

      var fallbackLookup = function () {
        var student = findStudent(rollInput.value, dobInput.value);
        if (!student) {
          showMessage(
            output,
            "No marksheet found for the given Roll Number and Date of Birth.",
            true
          );
          return;
        }
        showStudent(student);
      };

      if (API_BASE) {
        lookupFromApi(rollInput.value, dobInput.value)
          .then(showStudent)
          .catch(function (error) {
            if (error && error.message === "NO_API") {
              fallbackLookup();
              return;
            }
            showMessage(
              output,
              (error && error.message) ||
                "Unable to fetch result from server. Please try again.",
              true
            );
          });
        return;
      }

      if (resultsData) {
        fallbackLookup();
      } else {
        showMessage(output, "Loading results data...", false);
        loadResultsData()
          .then(fallbackLookup)
          .catch(function () {
            showMessage(
              output,
              "Unable to load results data. Please refresh the page and try again.",
              true
            );
          });
      }
    };
    lookup();

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
