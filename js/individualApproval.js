/*!
 * Start Bootstrap - SB Admin 2 v4.1.3 (https://startbootstrap.com/theme/sb-admin-2)
 * Copyright 2013-2021 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin-2/blob/master/LICENSE)
 */
!(function (l) {
  "use strict";
  l("#sidebarToggle, #sidebarToggleTop").on("click", function (e) {
    l("body").toggleClass("sidebar-toggled"),
      l(".sidebar").toggleClass("toggled"),
      l(".sidebar").hasClass("toggled") &&
        l(".sidebar .collapse").collapse("hide");
  }),
    l(window).resize(function () {
      l(window).width() < 768 && l(".sidebar .collapse").collapse("hide"),
        l(window).width() < 480 &&
          !l(".sidebar").hasClass("toggled") &&
          (l("body").addClass("sidebar-toggled"),
          l(".sidebar").addClass("toggled"),
          l(".sidebar .collapse").collapse("hide"));
    }),
    l("body.fixed-nav .sidebar").on(
      "mousewheel DOMMouseScroll wheel",
      function (e) {
        var o;
        768 < l(window).width() &&
          ((o = (o = e.originalEvent).wheelDelta || -o.detail),
          (this.scrollTop += 30 * (o < 0 ? 1 : -1)),
          e.preventDefault());
      }
    ),
    l(document).on("scroll", function () {
      100 < l(this).scrollTop()
        ? l(".scroll-to-top").fadeIn()
        : l(".scroll-to-top").fadeOut();
    }),
    l(document).on("click", "a.scroll-to-top", function (e) {
      var o = l(this);
      l("html, body")
        .stop()
        .animate(
          { scrollTop: l(o.attr("href")).offset().top },
          1e3,
          "easeInOutExpo"
        ),
        e.preventDefault();
    });
})(jQuery);

let isInvalidClass = "is-invalid";
let validationErrorMessageClass = "validation-error-message";
let modal = $("#approveModal");

let hospitalMap = new Map();
let hospitalMaster;
let locationMap = new Map();
let locationMaster;
let departmentMap = new Map();
let departmentMaster;
let currentRow;
// let currentDutyScheduleRequestId;
let isValidate = 0;
let positionMap = new Map();
let positionMaster;
let userData;

let dutyScheduleStatusMasters = [
  { statusCode: "N", statusDesc: "Normal" },
  { statusCode: "A", statusDesc: "Approve" },
  { statusCode: "C", statusDesc: "Cancel" },
  { statusCode: "O", statusDesc: "Off" },
];

let dutyScheduleStatusMastersForUserUpdate = [
  { statusCode: "N", statusDesc: "Normal" },
  //   { statusCode: "A", statusDesc: "Approve" },
  { statusCode: "C", statusDesc: "Cancel" },
  //   { statusCode: "O", statusDesc: "Off" },
];

let dutyScheduleSStatusMap = {
  N: { desc: "Normal", state: "secondary" },
  A: { desc: "Approve", state: "success" },
  C: { desc: "Cancel", state: "danger" },
  O: { desc: "Off", state: "warning" },
  null: { desc: "New", state: "primary" },
};

let dutyScheduleStatusConstant = {
  Normal: "N",
  Approve: "A",
  Cancel: "C",
  Off: "O",
};

let locationCodeConstant = {
  OPD: 1,
  IPD: 2,
  Criticalcare: 3,
};

$(document).ready(function () {
  CreateDatatable.init();

  let setupDataDefered = $.Deferred();
  SetupData.init(setupDataDefered);

  $.when(setupDataDefered).done(function (success) {
    if (!success) {
      return;
    }

    renderPage();
  });
});

let SetupData = (function () {
  let loadHospital = function (defered) {
    $.ajax({
      url: "https://localhost:7063/api/hospital/list",
      type: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: function (res) {
        if (res.status.code == 200) {
          hospitalMaster = res.data;
          for (let data of res.data) {
            hospitalMap.set(data.hospitalCode, data);
          }
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูลโรงพยาบาลได้ได้", "Error");
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูลโรงพยาบาลได้ได้", "Error");
      },
    });
  };

  let loadLocation = function (defered) {
    $.ajax({
      url: "https://localhost:7063/api/location/list",
      type: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: function (res) {
        if (res.status.code == 200) {
          locationMaster = res.data;
          for (let data of res.data) {
            locationMap.set(data.locationCode, data);
          }
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูล Locaion ได้", "Error");
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูล Locaion ได้", "Error");
      },
    });
  };

  let loadDepartment = function (defered) {
    $.ajax({
      url: "https://localhost:7063/api/department/list",
      type: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: function (res) {
        if (res.status.code == 200) {
          departmentMaster = res.data;
          for (let data of res.data) {
            departmentMap.set(data.departmentCode, data);
          }
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูล Locaion ได้", "Error");
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูล Locaion ได้", "Error");
      },
    });
  };

  let loadUserData = function (defered) {
    $.ajax({
      url: "https://localhost:7063/api/user/details",
      type: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: function (res) {
        if (res.status.code == 200) {
          userData = res.data;
          $("#currentUserName").html(userData.firstName);
          $("#navProfileImg").attr(
            "src",
            `https://localhost:7063/api/document/avatar/${userData.userId}`
          );
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้", "Error");
          window.location.href = "login.html";
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้", "Error");
        window.location.href = "login.html";
      },
    });
  };

  let loadPosition = function (defered) {
    $.ajax({
      url: "https://localhost:7063/api/position/list",
      type: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: function (res) {
        if (res.status.code == 200) {
          positionMaster = res.data;
          for (let data of res.data) {
            positionMap.set(data.positionCode, data);
          }
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูลตำแหน่งได้", "Error");
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูลตำแหน่งได้", "Error");
      },
    });
  };
  return {
    init: function (defered) {
      let hospitalDefered = $.Deferred();
      let locationDefered = $.Deferred();
      let departmentDefered = $.Deferred();
      let userDataDefered = $.Deferred();
      let positionDefered = $.Deferred();
      loadHospital(hospitalDefered);
      loadLocation(locationDefered);
      loadDepartment(departmentDefered);
      loadUserData(userDataDefered);
      loadPosition(positionDefered);

      $.when(
        hospitalDefered,
        locationDefered,
        departmentDefered,
        userDataDefered,
        positionDefered
      ).done(function (
        hospitalResult,
        locationDefered,
        departmentDefered,
        userDataResult,
        positionResult
      ) {
        if (
          hospitalResult &&
          locationDefered &&
          departmentDefered &&
          userDataResult &&
          positionResult
        ) {
          defered.resolve(true);
        } else {
          defered.resolve(false);
        }
      });
    },
  };
})();

let renderPage = function () {
  $("#beginDate").datepicker({
    format: "MM yyyy",
    startView: "months",
    viewMode: "months",
    minViewMode: "months",
    autoclose: true,
  });
  let currentDate = new Date();
  $("#beginDate").datepicker(
    "setDate",
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );
  // .datepicker({
  //   format: "dd/mm/yyyy",
  //   autoclose: true,
  //   todayHighlight: true,
  //   todayBtn: true,
  // })
  // .datepicker("setDate", new Date());

  $("#navHospitalCode").html(
    hospitalMap.get(userData.hospitalCode).hospitalDesc
  );

  $("#navLocationCode").html(
    locationMap.get(userData.locationCode).locationDesc
  );

  $("#navDepartmentCode").html(
    departmentMap.get(userData.departmentCode).departmentDesc
  );
};

$("#generalSearch").on("click", function () {
  LoadDutyScheduleForIndividualApproval();
});

$("#sidebarToggle").on("click", function () {
  CreateDatatable.adjust();
});

let CreateDatatable = (function () {
  let table;
  let currentPage = 0;
  let initTable1 = function () {
    table = $("#dataTable").DataTable({
      responsive: false,
      data: [],
      scrollY: "50vh",
      scrollX: true,
      scrollCollapse: true,
      columns: [
        { data: "", className: "text-center" },
        { data: "firstName", className: "text-center" },
        { data: "dutyScheduleNumberDayOne", className: "text-center" },
        { data: "dutyScheduleNumberDayTwo", className: "text-center" },
        { data: "dutyScheduleNumberDayThree", className: "text-center" },
        { data: "dutyScheduleNumberDayFour", className: "text-center" },
        { data: "dutyScheduleNumberDayFive", className: "text-center" },
        { data: "dutyScheduleNumberDaySix", className: "text-center" },
        { data: "dutyScheduleNumberDaySeven", className: "text-center" },
        { data: "dutyScheduleNumberDayEight", className: "text-center" },
        { data: "dutyScheduleNumberDayNine", className: "text-center" },
        { data: "dutyScheduleNumberDayTen", className: "text-center" },
        { data: "dutyScheduleNumberDayEleven", className: "text-center" },
        { data: "dutyScheduleNumberDayTwelve", className: "text-center" },
        { data: "dutyScheduleNumberDayThirteen", className: "text-center" },
        { data: "dutyScheduleNumberDayFourteen", className: "text-center" },
        { data: "dutyScheduleNumberDayFifteen", className: "text-center" },
        { data: "dutyScheduleNumberDaySixteen", className: "text-center" },
        { data: "dutyScheduleNumberDaySeventeen", className: "text-center" },
        { data: "dutyScheduleNumberDayEighteen", className: "text-center" },
        { data: "dutyScheduleNumberDayNineteen", className: "text-center" },
        { data: "dutyScheduleNumberDayTwenty", className: "text-center" },
        { data: "dutyScheduleNumberDayTwentyOne", className: "text-center" },
        { data: "dutyScheduleNumberDayTwentyTwo", className: "text-center" },
        { data: "dutyScheduleNumberDayTwentyThree", className: "text-center" },
        { data: "dutyScheduleNumberDayTwentyFour", className: "text-center" },
        { data: "dutyScheduleNumberDayTwentyFive", className: "text-center" },
        { data: "dutyScheduleNumberDayTwentySix", className: "text-center" },
        { data: "dutyScheduleNumberDayTwentySeven", className: "text-center" },
        { data: "dutyScheduleNumberDayTwentyEight", className: "text-center" },
        { data: "dutyScheduleNumberDayTwentyNine", className: "text-center" },
        { data: "dutyScheduleNumberDayThirty", className: "text-center" },
        { data: "dutyScheduleNumberDayThirtyOne", className: "text-center" },
        { data: "totalDutyScheduleNumber", className: "text-center" },
        { data: "totalApproveDutyScheduleNumber", className: "text-center" },
        {
          data: "totalCancelAndOffDutyScheduleNumber",
          className: "text-center",
        },
        { data: "totalDuration", className: "text-center" },
        { data: "totalApproveDuration", className: "text-center" },
        { data: "totalRealDuration", className: "text-center" },
      ],
      order: [[0, "asc"]],
      columnDefs: [
        {
          targets: 0,
          title: "No.",
          render: function (data, type, full, meta) {
            return parseInt(meta.row) + 1;
          },
        },
        {
          targets: 1,
          title: "ชื่อ - นามสกุล",
          render: function (data, type, full, meta) {
            return full.firstName + " " + full.lastName;
          },
        },
        {
          targets: 2,
          title: "1",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayOne].state
                } btn-circle btn-sm edit-button" days="1" ${data}</i></a>`;
          },
        },
        {
          targets: 3,
          title: "2",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwo].state
                } btn-circle btn-sm edit-button" days="2" ${data}</i></a>`;
          },
        },
        {
          targets: 4,
          title: "3",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayThree].state
                } btn-circle btn-sm edit-button" days="3"> ${data}</i></a>`;
          },
        },
        {
          targets: 5,
          title: "4",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayFour].state
                } btn-circle btn-sm edit-button" days="4"> ${data}</i></a>`;
          },
        },
        {
          targets: 6,
          title: "5",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayFive].state
                } btn-circle btn-sm edit-button" days="5"> ${data}</i></a>`;
          },
        },
        {
          targets: 7,
          title: "6",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDaySix].state
                } btn-circle btn-sm edit-button" days="6"> ${data}</i></a>`;
          },
        },
        {
          targets: 8,
          title: "7",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDaySeven].state
                } btn-circle btn-sm edit-button" days="7"> ${data}</i></a>`;
          },
        },
        {
          targets: 9,
          title: "8",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayEight].state
                } btn-circle btn-sm edit-button" days="8"> ${data}</i></a>`;
          },
        },
        {
          targets: 10,
          title: "9",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayNine].state
                } btn-circle btn-sm edit-button" days="9"> ${data}</i></a>`;
          },
        },
        {
          targets: 11,
          title: "10",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTen].state
                } btn-circle btn-sm edit-button" days="10"> ${data}</i></a>`;
          },
        },
        {
          targets: 12,
          title: "11",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayEleven].state
                } btn-circle btn-sm edit-button" days="11"> ${data}</i></a>`;
          },
        },
        {
          targets: 13,
          title: "12",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwelve].state
                } btn-circle btn-sm edit-button" days="12"> ${data}</i></a>`;
          },
        },
        {
          targets: 14,
          title: "13",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayThirteen]
                    .state
                } btn-circle btn-sm edit-button" days="13"> ${data}</i></a>`;
          },
        },
        {
          targets: 15,
          title: "14",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayFourteen]
                    .state
                } btn-circle btn-sm edit-button" days="14"> ${data}</i></a>`;
          },
        },
        {
          targets: 16,
          title: "15",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayFifteen]
                    .state
                } btn-circle btn-sm edit-button" days="15"> ${data}</i></a>`;
          },
        },
        {
          targets: 17,
          title: "16",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDaySixteen]
                    .state
                } btn-circle btn-sm edit-button" days="16"> ${data}</i></a>`;
          },
        },
        {
          targets: 18,
          title: "17",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDaySeventeen]
                    .state
                } btn-circle btn-sm edit-button" days="17"> ${data}</i></a>`;
          },
        },
        {
          targets: 19,
          title: "18",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayEighteen]
                    .state
                } btn-circle btn-sm edit-button" days="18"> ${data}</i></a>`;
          },
        },
        {
          targets: 20,
          title: "19",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayNineteen]
                    .state
                } btn-circle btn-sm edit-button" days="19"> ${data}</i></a>`;
          },
        },
        {
          targets: 21,
          title: "20",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwenty].state
                } btn-circle btn-sm edit-button" days="20"> ${data}</i></a>`;
          },
        },
        {
          targets: 22,
          title: "21",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwentyOne]
                    .state
                } btn-circle btn-sm edit-button" days="21"> ${data}</i></a>`;
          },
        },
        {
          targets: 23,
          title: "22",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwentyTwo]
                    .state
                } btn-circle btn-sm edit-button" days="22"> ${data}</i></a>`;
          },
        },
        {
          targets: 24,
          title: "23",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwentyThree]
                    .state
                } btn-circle btn-sm edit-button" days="23"> ${data}</i></a>`;
          },
        },
        {
          targets: 25,
          title: "24",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwentyFour]
                    .state
                } btn-circle btn-sm edit-button" days="24"> ${data}</i></a>`;
          },
        },
        {
          targets: 26,
          title: "25",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwentyFive]
                    .state
                } btn-circle btn-sm edit-button" days="25"> ${data}</i></a>`;
          },
        },
        {
          targets: 27,
          title: "26",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwentySix]
                    .state
                } btn-circle btn-sm edit-button" days="26"> ${data}</i></a>`;
          },
        },
        {
          targets: 28,
          title: "27",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwentySeven]
                    .state
                } btn-circle btn-sm edit-button" days="27"> ${data}</i></a>`;
          },
        },
        {
          targets: 29,
          title: "28",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwentyEight]
                    .state
                } btn-circle btn-sm edit-button" days="28"> ${data}</i></a>`;
          },
        },
        {
          targets: 30,
          title: "29",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwentyNine]
                    .state
                } btn-circle btn-sm edit-button" days="29"> ${data}</i></a>`;
          },
        },
        {
          targets: 31,
          title: "30",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayThirty].state
                } btn-circle btn-sm edit-button" days="30"> ${data}</i></a>`;
          },
        },
        {
          targets: 32,
          title: "31",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayThirtyOne]
                    .state
                } btn-circle btn-sm edit-button" days="31"> ${data}</i></a>`;
          },
        },
        {
          targets: 33,
          title: "จำนวนเวรที่ขอ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 34,
          title: "จำนวนเวรที่อนุมัติ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 35,
          title: "จำนวนเวรที่ยกเลิก หรือ Off",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 36,
          title: "จำนวนชั่วโมงที่ขอ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 37,
          title: "จำนวนชั่วโมงที่อนุมัติ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 38,
          title: "จำนวนชั่วโมงเข้า",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
      ],
    });
  };

  return {
    init: function () {
      initTable1();
      let containerTable = $(table.table().container());

      containerTable.on("click", ".edit-button", function () {
        let rowIndex = table.row($(this).closest("tr")).index();
        let data = table.row($(this).closest("tr")).data();
        currentRow = $(this).closest("tr");
        // console.log(data);
        // console.log($(this).attr("days"));
        // console.log(data.updateDateTime);
        // console.log(moment(data.updateDateTime).format("DD/MM/YYYY"));

        loadUserDateForApproveModal($(this).attr("days"), data);
      });
    },
    data: function (data) {
      table.clear();
      table.rows.add(data);
      table.draw();
    },
    addData: function (data) {
      table.rows.add(data);
      table.draw();
    },
    getData: function (index) {
      if (index) {
        return table.row(index).data();
      }
      return table.rows().data().toArray();
    },
    datatable: function () {
      return table;
    },
    adjust: function () {
      table.columns.adjust();
    },
  };
})();

let isDateTime = function (dutyDate) {
  // Try to parse the date string
  const timestamp = Date.parse(dutyDate);

  // Check if the parsing was successful and not NaN
  if (!isNaN(timestamp)) {
    return true;
  }

  return false;
};

$("#logoutConfirm").on("click", function () {
  localStorage.clear();
  window.location.href = "login.html";
});

let scrollToElement = function (element) {
  let windowHeight = $(window).height();
  let offset = element.offset().top;
  let scrollOffset = offset - windowHeight / 2;
  $("html, body").animate({ scrollTop: scrollOffset }, 1000);
};

let LoadDutyScheduleForIndividualApproval = function () {
  let dutyDate = $("#beginDate").val();
  let searchName = $("#searchName").val();

  let objData = {
    dutyDate: dutyDate,
    name: searchName,
  };
  $.ajax({
    url: "https://localhost:7063/api/dutySchedule/searchDutyScheduleForIndividualApproval",
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: JSON.stringify(objData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        CreateDatatable.data(res.data);
      } else {
        toastr.error(res.status.message);
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถดึงข้อมูลรายการขออัตรากำลังได้");
    },
  });
};

let loadUserDateForApproveModal = function (day, data) {
  //   console.log(day);
  //   console.log(moment(data.dutyDate).format("DD/MM/YYYY"));

  let objData = {
    day: day,
    dutyDate: moment(data.dutyDate).format("DD/MM/YYYY"),
    userId: data.insertUserId,
  };
  modal.modal("show");
};
