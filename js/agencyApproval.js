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

let educationalQualificationMap = new Map();
let educationalQualificationMaster;
let experienceTypeMap = new Map();
let experienceTypeMaster;

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
  CreateDatatableDetail.init();
  TimeDataTable.init();

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

  let loadEducationalQualification = function (defered) {
    $.ajax({
      url: "https://localhost:7063/api/educationalQualification/list",
      type: "GET",
      success: function (res) {
        if (res.status.code == 200) {
          educationalQualificationMaster = res.data;
          for (let data of res.data) {
            educationalQualificationMap.set(
              data.educationalQualificationCode,
              data
            );
          }
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูลวุฒิการศึกษาได้", "Error");
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูลวุฒิการศึกษาได้", "Error");
      },
    });
  };

  let loadExperienceType = function (defered) {
    $.ajax({
      url: "https://localhost:7063/api/experienceType/list",
      type: "GET",
      success: function (res) {
        if (res.status.code == 200) {
          experienceTypeMaster = res.data;
          for (let data of res.data) {
            experienceTypeMap.set(data.experienceTypeCode, data);
          }
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูลประเภทประสบการณ์ได้", "Error");
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูลประเภทประสบการณ์ได้", "Error");
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
      let educationalQualificationDefered = $.Deferred();
      let experienceTypeDefer = $.Deferred();
      loadHospital(hospitalDefered);
      loadLocation(locationDefered);
      loadDepartment(departmentDefered);
      loadUserData(userDataDefered);
      loadPosition(positionDefered);
      loadEducationalQualification(educationalQualificationDefered);
      loadExperienceType(experienceTypeDefer);

      $.when(
        hospitalDefered,
        locationDefered,
        departmentDefered,
        userDataDefered,
        positionDefered,
        educationalQualificationDefered,
        experienceTypeDefer
      ).done(function (
        hospitalResult,
        locationDefered,
        departmentDefered,
        userDataResult,
        positionResult,
        educationalQualificationResult,
        experienceTypeResult
      ) {
        if (
          hospitalResult &&
          locationDefered &&
          departmentDefered &&
          userDataResult &&
          positionResult &&
          educationalQualificationResult &&
          experienceTypeResult
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
  $.each(positionMaster, function (i, item) {
    $("select[name=positionCodeSearch]").append(
      $("<option>", {
        value: item.positionCode,
        text: item.positionDesc,
      })
    );
  });

  //   $("#navHospitalCode").html(
  //     hospitalMap.get(userData.hospitalCode).hospitalDesc
  //   );

  //   $("#navLocationCode").html(
  //     locationMap.get(userData.locationCode).locationDesc
  //   );

  //   $("#navDepartmentCode").html(
  //     departmentMap.get(userData.departmentCode).departmentDesc
  //   );
};

$("#generalSearch").on("click", function () {
  LoadDutyScheduleForIndividualApproval();
});

$("#sidebarToggle").on("click", function () {
  CreateDatatable.adjust();
});

$("#submit").off("click");
$("#submit").on("click", function () {
  let data = CreateDatatableDetail.getData();
  console.log(data);
  let objData = {
    dutyDate: $("#dutyDateDisplayModal").html(),
    approveDutyScheduleList: data,
  };
  $.ajax({
    url: "https://localhost:7063/api/dutySchedule/approvedutyScheduleByDepartment",
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: JSON.stringify(objData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        toastr.success("บันทึกสำเร็จ");
        modal.modal("hide");
        LoadDutyScheduleForIndividualApproval();
      } else {
        toastr.error(res.status.message);
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถบันทึกได้");
    },
  });
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
        { data: "hospitalCode", className: "text-center" },
        { data: "locationCode", className: "text-center" },
        { data: "departmentCode", className: "text-center" },
        { data: "positionCode", className: "text-center" },
        { data: "dutyScheduleRequestNumberDayOne", className: "text-center" },
        { data: "dutyScheduleRequestNumberDayTwo", className: "text-center" },
        { data: "dutyScheduleRequestNumberDayThree", className: "text-center" },
        { data: "dutyScheduleRequestNumberDayFour", className: "text-center" },
        { data: "dutyScheduleRequestNumberDayFive", className: "text-center" },
        { data: "dutyScheduleRequestNumberDaySix", className: "text-center" },
        { data: "dutyScheduleRequestNumberDaySeven", className: "text-center" },
        { data: "dutyScheduleRequestNumberDayEight", className: "text-center" },
        { data: "dutyScheduleRequestNumberDayNine", className: "text-center" },
        { data: "dutyScheduleRequestNumberDayTen", className: "text-center" },
        {
          data: "dutyScheduleRequestNumberDayEleven",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwelve",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayThirteen",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayFourteen",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayFifteen",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDaySixteen",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDaySeventeen",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayEighteen",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayNineteen",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwenty",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwentyOne",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwentyTwo",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwentyThree",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwentyFour",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwentyFive",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwentySix",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwentySeven",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwentyEight",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayTwentyNine",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayThirty",
          className: "text-center",
        },
        {
          data: "dutyScheduleRequestNumberDayThirtyOne",
          className: "text-center",
        },
        { data: "totalDutyScheduleRequestNumber", className: "text-center" },
        { data: "totalDutyScheduleApproveNumber", className: "text-center" },
        { data: "totalDuration", className: "text-center" },
        { data: "totalApproveDuration", className: "text-center" },
        // { data: "totalRealDuration", className: "text-center" },
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
          title: "โรงพยาบาล",
          render: function (data, type, full, meta) {
            return hospitalMap.get(data).hospitalDesc;
          },
        },
        {
          targets: 2,
          title: "Location",
          render: function (data, type, full, meta) {
            return locationMap.get(data).locationDesc;
          },
        },
        {
          targets: 3,
          title: "แผนก",
          render: function (data, type, full, meta) {
            return departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 4,
          title: "ตำแหน่ง",
          render: function (data, type, full, meta) {
            return positionMap.get(full.positionCode).positionDesc;
          },
        },
        {
          targets: 5,
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
          targets: 6,
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
          targets: 7,
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
          targets: 8,
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
          targets: 9,
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
          targets: 10,
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
          targets: 11,
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
          targets: 12,
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
          targets: 13,
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
          targets: 14,
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
          targets: 15,
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
          targets: 16,
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
          targets: 17,
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
          targets: 18,
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
          targets: 19,
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
          targets: 20,
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
          targets: 21,
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
          targets: 22,
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
          targets: 23,
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
          targets: 24,
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
          targets: 25,
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
          targets: 26,
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
          targets: 27,
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
          targets: 28,
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
          targets: 29,
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
          targets: 30,
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
          targets: 31,
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
          targets: 32,
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
          targets: 33,
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
          targets: 34,
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
          targets: 35,
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
          targets: 36,
          title: "จำนวนเวรที่ขอ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 37,
          title: "จำนวนเวรที่อนุมัติ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 38,
          title: "จำนวนชั่วโมงที่ขอ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 39,
          title: "จำนวนชั่วโมงที่อนุมัติ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        // {
        //   targets: 40,
        //   title: "จำนวนชั่วโมงเข้า",
        //   orderable: false,
        //   render: function (data, type, full, meta) {
        //     return data;
        //   },
        // },
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
  let positionCode = parseInt($("select[name=positionCodeSearch]").val());

  let objData = {
    dutyDate: dutyDate,
    name: searchName,
    positionCode: positionCode,
  };
  $.ajax({
    url: "https://localhost:7063/api/dutySchedule/searchDutyScheduleForAgencyApproval",
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
      toastr.error("ไม่สามารถดึงข้อมูลได้");
    },
  });
};

let loadUserDateForApproveModal = function (day, data) {
  let objData = {
    day: day,
    dutyDate: moment(data.dutyDate).format("DD/MM/YYYY"),
    positionCode: data.positionCode,
    hospitalCode: data.hospitalCode,
    locationCode: data.locationCode,
    departmentCode: data.departmentCode,
  };
  $.ajax({
    url: "https://localhost:7063/api/dutySchedule/searchDutyScheduleForAgencyApprovalDetail",
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: JSON.stringify(objData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        let approvalDetaildata = res.data;

        $("#dutyDateDisplayModal").html(
          moment(approvalDetaildata.dutyDate).format("DD/MM/YYYY")
        );

        $("#hospitalCodeModal").html(
          '<strong class="text-gray-900">โรงพยาบาล:  </strong> ' +
            hospitalMap.get(approvalDetaildata.hospitalCode).hospitalDesc
        );

        $("#locationCodeModal").html(
          '<strong class="text-gray-900">Location:  </strong> ' +
            locationMap.get(approvalDetaildata.locationCode).locationDesc
        );

        $("#departmentCodeModal").html(
          '<strong class="text-gray-900">แผนก:  </strong> ' +
            departmentMap.get(approvalDetaildata.departmentCode).departmentDesc
        );

        $("#positionCodeModal").html(
          '<strong class="text-gray-900">ตำแหน่ง:  </strong> ' +
            positionMap.get(approvalDetaildata.positionCode).positionDesc
        );

        $("#requestNumberModal").html(
          '<strong class="text-gray-900">จำนวนที่ขอ:  </strong> ' +
            approvalDetaildata.allRequestNumber
        );

        $("#approveNumberModal").html(
          '<strong class="text-gray-900">จำนวนที่อนุมัติแล้ว:  </strong> ' +
            approvalDetaildata.allApproveNumber
        );

        if (approvalDetaildata.dutyScheduleRequestItemList != null) {
          $("#requestNumber1").html(
            '<strong class="text-gray-900">07.00-15.00:&emsp;&emsp;&emsp;</strong> ' +
              approvalDetaildata.dutyScheduleRequestItemList[0].requestNumber +
              "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" +
              approvalDetaildata.dutyScheduleRequestItemList[0].approveNumber
          );

          $("#requestNumber2").html(
            '<strong class="text-gray-900">15.00-23.00:&emsp;&emsp;&emsp;</strong> ' +
              approvalDetaildata.dutyScheduleRequestItemList[1].requestNumber +
              "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" +
              approvalDetaildata.dutyScheduleRequestItemList[1].approveNumber
          );

          $("#requestNumber3").html(
            '<strong class="text-gray-900">23.00-07.00:&emsp;&emsp;&emsp;</strong> ' +
              approvalDetaildata.dutyScheduleRequestItemList[2].requestNumber +
              "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" +
              approvalDetaildata.dutyScheduleRequestItemList[2].approveNumber
          );

          $("#requestNumber4").html(
            '<strong class="text-gray-900">07.00-19.00:&emsp;&emsp;&emsp;</strong> ' +
              approvalDetaildata.dutyScheduleRequestItemList[3].requestNumber +
              "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" +
              approvalDetaildata.dutyScheduleRequestItemList[3].approveNumber
          );

          $("#requestNumber5").html(
            '<strong class="text-gray-900">19.00-07.00:&emsp;&emsp;&emsp;</strong> ' +
              approvalDetaildata.dutyScheduleRequestItemList[4].requestNumber +
              "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" +
              approvalDetaildata.dutyScheduleRequestItemList[4].approveNumber
          );

          $("#requestNumber6").html(
            '<strong class="text-gray-900">08.00-16.00:&emsp;&emsp;&emsp;</strong> ' +
              approvalDetaildata.dutyScheduleRequestItemList[5].requestNumber +
              "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" +
              approvalDetaildata.dutyScheduleRequestItemList[5].approveNumber
          );

          $("#requestNumber7").html(
            '<strong class="text-gray-900">08.00-20.00:&emsp;&emsp;&emsp;</strong> ' +
              approvalDetaildata.dutyScheduleRequestItemList[6].requestNumber +
              "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" +
              approvalDetaildata.dutyScheduleRequestItemList[6].approveNumber
          );

          $("#requestNumber8").html(
            '<strong class="text-gray-900">09.00-17.00:&emsp;&emsp;&emsp;</strong> ' +
              approvalDetaildata.dutyScheduleRequestItemList[7].requestNumber +
              "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" +
              approvalDetaildata.dutyScheduleRequestItemList[7].approveNumber
          );

          $("#shiftStartModal").html(
            approvalDetaildata.dutyScheduleRequestItemList[8].shiftStart +
              "-" +
              approvalDetaildata.dutyScheduleRequestItemList[8].shiftEnd
          );
          $("#requestNumberOther").html(
            approvalDetaildata.dutyScheduleRequestItemList[8].requestNumber +
              "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" +
              approvalDetaildata.dutyScheduleRequestItemList[8].approveNumber
          );
        }

        TimeDataTable.data(approvalDetaildata.dutyScheduleRequestItemList);

        // console.log(approvalDetaildata);

        CreateDatatableDetail.data(approvalDetaildata.dutyScheduleList);
        modal.modal("show");
      } else {
        toastr.error(res.status.message);
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถดึงข้อมูลได้");
    },
  });
};

modal.on("shown.bs.modal", function () {
  CreateDatatableDetail.adjust();
  TimeDataTable.adjust();
});

let CreateDatatableDetail = (function () {
  let table;
  let currentPage = 0;
  let initTable1 = function () {
    table = $("#dataTableDetail").DataTable({
      responsive: false,
      data: [],
      scrollY: "50vh",
      scrollX: true,
      scrollCollapse: true,
      columns: [
        { data: "", className: "text-center" },
        { data: "firstName", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "locationCode", className: "text-center" },
        { data: "departmentCode1", className: "text-center" },
        { data: "departmentCode2", className: "text-center" },
        { data: "departmentCode3", className: "text-center" },
        { data: "shiftStart", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "locationCode", className: "text-center" },
        { data: "departmentCode1", className: "text-center" },
        { data: "shiftStart", className: "text-center" },
        // { data: "hospitalCode", className: "text-center" },
        // { data: "hospitalCode", className: "text-center" },
        // { data: "hospitalCode", className: "text-center" },
        // { data: "hospitalCode", className: "text-center" },
        { data: "status", className: "text-center" },
        { data: "adminRemark", className: "text-center" },
        { data: "", className: "text-center" },
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
          title: "ชื่อ-นามสกุล",
          render: function (data, type, full, meta) {
            return full.firstName + " " + full.lastName;
          },
        },
        {
          targets: 2,
          title: "โรงพยาบาล",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : hospitalMap.get(data).hospitalDesc;
          },
        },
        {
          targets: 3,
          title: "Location",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : locationMap.get(data).locationDesc;
          },
        },
        {
          targets: 4,
          title: "แผนกลำดับที่ 1",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 5,
          title: "แผนกลำดับที่ 2",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 6,
          title: "แผนกลำดับที่ 3",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 7,
          title: "ช่วงเวลา",
          render: function (data, type, full, meta) {
            return full.shiftStart + "-" + full.shiftEnd;
          },
        },
        // {
        //   targets: 7,
        //   title: "โรงพยาบาลที่ขอ",
        //   render: function (data, type, full, meta) {
        //     if (full.dutyScheduleRequestList != null) {
        //       return hospitalMap.get(full.dutyScheduleRequestList.hospitalCode)
        //         .hospitalDesc;
        //     } else {
        //       return "-";
        //     }
        //   },
        // },
        // {
        //   targets: 8,
        //   title: "Locationที่ขอ",
        //   render: function (data, type, full, meta) {
        //     if (full.dutyScheduleRequestList != null) {
        //       return locationMap.get(full.dutyScheduleRequestList.locationCode)
        //         .locationDesc;
        //     } else {
        //       return "-";
        //     }
        //   },
        // },
        // {
        //   targets: 9,
        //   title: "แผนกที่ขอ",
        //   render: function (data, type, full, meta) {
        //     if (full.dutyScheduleRequestList != null) {
        //       return departmentMap.get(
        //         full.dutyScheduleRequestList.departmentCode
        //       ).departmentDesc;
        //     } else {
        //       return "-";
        //     }
        //   },
        // },
        // {
        //   targets: 10,
        //   title: "ช่วงเวลาที่ขอ",
        //   render: function (data, type, full, meta) {
        //     if (full.dutyScheduleRequestList != null) {
        //       return `<a href="#" class="btn btn-info btn-circle btn-sm choose-button">${full.dutyScheduleRequestList.dutyScheduleRequestItemList.length}</a>`;
        //     } else {
        //       return "-";
        //     }
        //   },
        // },
        {
          targets: 8,
          title: "โรงพยาบาลที่อนุมัติ",
          render: function (data, type, full, meta) {
            if (full.isUpdate === true) {
              return `<select class="custom-select hospitalCode" name="hospitalCode" id="hospitalCode" data-size="4">
                          <option selected disabled>ตำแหน่ง</option>
                      </select>`;
            } else {
              return full.approveHospitalCode == null ||
                isNaN(full.approveHospitalCode)
                ? "-"
                : hospitalMap.get(full.approveHospitalCode).hospitalDesc;
            }
          },
        },
        {
          targets: 9,
          title: "Locationที่อนุมัติ",
          render: function (data, type, full, meta) {
            if (full.isUpdate === true) {
              return `<select class="custom-select locationCode" name="locationCode" id="locationCode" data-size="4">
                            <option selected disabled>Location</option>
                        </select>`;
            } else {
              return full.approveLocationCode == null ||
                isNaN(full.approveLocationCode)
                ? "-"
                : locationMap.get(full.approveLocationCode).locationDesc;
            }
          },
        },
        {
          targets: 10,
          title: "แผนกที่อนุมัติ",
          render: function (data, type, full, meta) {
            if (full.isUpdate === true) {
              return `<select class="custom-select departmentCode" name="departmentCode" id="departmentCode" data-size="4">
                              <option selected disabled>แผนก</option>
                          </select>`;
            } else {
              return full.approveDepartmentCode == null ||
                isNaN(full.approveDepartmentCode)
                ? "-"
                : departmentMap.get(full.approveDepartmentCode).departmentDesc;
            }
          },
        },
        {
          targets: 11,
          title: "ช่วงเวลาที่อนุมัติ",
          render: function (data, type, full, meta) {
            if (full.isUpdate === true) {
              return `<input type="time" class="form-control form-control-sm" name="shiftStartEdit" id="shiftStartEdit" value="${full.approveShiftStart}" /> 
              <input type="time" class="form-control form-control-sm" name="shiftEndEdit" id="shiftEndEdit" value="${full.approveShiftEnd}" />`;
            } else {
              return full.approveShiftStart != null &&
                full.approveShiftEnd != null
                ? full.approveShiftStart + "-" + full.approveShiftEnd
                : "-";
            }
          },
        },
        {
          targets: 12,
          title: "สถานะ",
          render: function (data, type, full, meta) {
            if (full.isUpdate === true) {
              return `<select class="custom-select statusCode" name="statusCode" id="statusCode" data-size="4">
                  <option selected disabled>สถานะ</option>
              </select>`;
            } else {
              return `<a class="btn btn-${dutyScheduleSStatusMap[data].state}" style="width: 90px;">${dutyScheduleSStatusMap[data].desc}</a>`;
            }
          },
        },
        {
          targets: 13,
          title: "หมายเหตุ",
          render: function (data, type, full, meta) {
            if (full.isUpdate === true) {
              return `<input type="text" class="form-control form-control-sm" name="remarkEdit" id="remarkEdit" value="${
                data == null ? "" : data
              }" />`;
            } else {
              return data;
            }
          },
        },
        {
          targets: 14,
          title: "แก้ไข",
          render: function (data, type, full, meta) {
            if (
              full.status == dutyScheduleStatusConstant.Off ||
              full.status == dutyScheduleStatusConstant.Normal ||
              full.status == dutyScheduleStatusConstant.Approve
            ) {
              if (full.isUpdate == false) {
                return `<a class="btn btn-outline-dark btn-circle btn-sm edit-button" id="addEducation"><i class="fas fa-pencil-alt"></i></a>`;
              } else {
                return `
                  <a class="btn btn-success btn-circle btn-sm confirm-button"><i class="fas fa-check"></i></a>
                  <a class="btn btn-danger btn-circle btn-sm cancel-button" ><i class="fas fa-times"></i></a>`;
              }
            } else {
              return "-";
            }
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
        let row = $(this).closest("tr");
        if (row !== undefined) {
          let isChanged = table.table().row(row).data();
          if (isChanged !== undefined) {
            table.row(row).data({ ...isChanged, isUpdate: true });
            renderRowEdit(table);
            table.page(currentPage).draw(false);
          }
        }
      });

      table.on("click", ".cancel-button", function () {
        currentRow = $(this).closest("tr");
        currentRow.find("input,select").prop("disabled", true);
        let row = $(this).closest("tr");
        if (row !== undefined) {
          let isChanged = table.table().row(row).data();
          if (isChanged !== undefined) {
            table.row(row).data({ ...isChanged, isUpdate: false });
            // renderRowEdit(table);
            table.page(currentPage).draw(false);
          }
        }
      });
      table.off("click", ".confirm-button");
      table.on("click", ".confirm-button", function () {
        let row = $(this).closest("tr");
        if (row !== undefined) {
          updateDutySchedule(table, row);
        }
      });

      table.on("click", ".choose-button", function () {
        let tr = $(this).closest("tr");
        if (tr !== undefined) {
          let row = table.table().row(tr);
          let data = table.row(row).data();
          let dutyScheduleRequestItemList =
            data.dutyScheduleRequestList == null
              ? []
              : data.dutyScheduleRequestList.dutyScheduleRequestItemList;
          if (row.child.isShown()) {
            row.child.hide();
            $(this).closest("td").css("border-left", "none");
            tr.removeClass("shown");
          } else {
            row.child(CreateRowParentBody()).show();
            if (row.child() !== undefined) {
              let elementAccountParent1 = row.child().find(`#table-rowparent`);
              tr.addClass("shown");
              elementAccountParent1.DataTable({
                responsive: false,
                data: dutyScheduleRequestItemList,
                order: [0, "asc"],
                dom: `<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>`,
                language: {
                  emptyTable: "ไม่มีข้อมูล",
                },
                lengthChange: false,
                info: false,
                paginate: false,
                columns: [
                  { data: "", className: "text-center" },
                  { data: "shiftStart", className: "text-right" },
                  { data: "requestNumber", className: "text-right" },
                  { data: "approveNumber", className: "text-right" },
                ],
                columnDefs: [
                  {
                    targets: 0,
                    orderable: false,
                    render: function (data, type, full, meta) {
                      return parseInt(meta.row) + 1;
                    },
                  },
                  {
                    targets: 1,
                    orderable: false,
                    render: function (data, type, full, meta) {
                      return full.shiftStart + "-" + full.shiftEnd;
                    },
                  },
                  {
                    targets: 2,
                    orderable: false,
                    render: function (data, type, full, meta) {
                      return data;
                    },
                  },
                  {
                    targets: 3,
                    orderable: false,
                    render: function (data, type, full, meta) {
                      return data;
                    },
                  },
                ],
              });
            }
          }
          CreateDatatableDetail.adjust();
        }
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

let renderRowEdit = function (table) {
  table.rows().every(function (rowIdx, tableLoop, rowLoop) {
    var row = $(this.node());
    let isChanged = table.table().row(row).data();

    $.each(hospitalMaster, function (i, item) {
      row.find("select[name=hospitalCode]").append(
        $("<option>", {
          value: item.hospitalCode,
          text: item.hospitalDesc,
        })
      );
    });
    if (isChanged.approveHospitalCode != null) {
      row.find("select[name=hospitalCode]").val(isChanged.approveHospitalCode);
    }

    $.each(locationMaster, function (i, item) {
      row.find("select[name=locationCode]").append(
        $("<option>", {
          value: item.locationCode,
          text: item.locationDesc,
        })
      );
    });

    if (isChanged.approveLocationCode != null) {
      row.find("select[name=locationCode]").val(isChanged.approveLocationCode);
    }

    $.each(departmentMaster, function (i, item) {
      row.find("select[name=departmentCode]").append(
        $("<option>", {
          value: item.departmentCode,
          text: item.departmentDesc,
        })
      );
    });

    if (isChanged.approveDepartmentCode != null) {
      row
        .find("select[name=departmentCode]")
        .val(isChanged.approveDepartmentCode);
    }

    $.each(dutyScheduleStatusMasters, function (i, item) {
      if (item.statusCode != "C") {
        row.find("select[name=statusCode]").append(
          $("<option>", {
            value: item.statusCode,
            text: item.statusDesc,
          })
        );
      }
    });
    row.find("select[name=statusCode]").val(isChanged.status);
  });
};

let CreateRowParentBody = function () {
  let childRow = `
        <div class="row">
        <div class="col-lg-7"></div>
        <div class="col-lg-5">
        <div style="height : auto;">
        <table class="table table-striped-table-hover table-checkable" id="table-rowparent">
          <thead class="thead-light">
              <tr>
                  <th>ลำดับ</th>
                  <th>เวลา</th>
                  <th>จำนวนที่ขอ</th>
                  <th>จำนวนที่อนุมัติ</th>
              </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
        
        </div>
      
        </div>
        `;
  return childRow;
};

let updateDutySchedule = function (eTable, eRow) {
  let isChanged = eTable.table().row(eRow).data();
  if (isChanged !== undefined) {
    let newDutySchedule = {
      hospitalCode: parseInt(eRow.find("select[name=hospitalCode]").val()),
      locationCode: parseInt(eRow.find("select[name=locationCode]").val()),
      departmentCode: parseInt(eRow.find("select[name=departmentCode]").val()),
      shiftStart: eRow.find("input[name=shiftStartEdit]").val(),
      shiftEnd: eRow.find("input[name=shiftEndEdit]").val(),
      status: eRow.find("select[name=statusCode]").val(),
      adminRemark: eRow.find("input[name=remarkEdit]").val(),
    };

    if (
      newDutySchedule.hospitalCode == null ||
      newDutySchedule.locationCode == null ||
      newDutySchedule.departmentCode == null ||
      newDutySchedule.shiftStart == "" ||
      newDutySchedule.shiftEnd == "" ||
      newDutySchedule.status == ""
    ) {
      toastr.error("กรอกข้อมูลไม่ครบ");
    } else {
      eTable.row(eRow).data({
        ...isChanged,
        approveHospitalCode: newDutySchedule.hospitalCode,
        approveLocationCode: newDutySchedule.locationCode,
        approveDepartmentCode: newDutySchedule.departmentCode,
        approveShiftStart: newDutySchedule.shiftStart,
        approveShiftEnd: newDutySchedule.shiftEnd,
        status: newDutySchedule.status,
        adminRemark: newDutySchedule.adminRemark,
        isUpdate: false,
      });
      eTable.draw(false);
    }
  }
};

let TimeDataTable = (function () {
  let table;
  let currentPage = 0;
  let initTable1 = function () {
    table = $("#timeTable").DataTable({
      responsive: false,
      data: [],
      scrollY: "50vh",
      scrollX: true,
      scrollCollapse: true,
      //   order: [0, "asc"],
      language: {
        emptyTable: "ไม่มีข้อมูล",
      },
      dom: `<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>`,
      lengthChange: false,
      info: false,
      //   paginate: false,
      fixedColumns: {
        heightMatch: "none",
      },
      pageLength: 4,
      columns: [
        { data: "shiftStart", className: "text-right" },
        { data: "requestNumber", className: "text-right" },
        { data: "approveNumber", className: "text-right" },
      ],
      columnDefs: [
        {
          targets: 0,
          orderable: false,
          render: function (data, type, full, meta) {
            return full.shiftStart + "-" + full.shiftEnd;
          },
        },
        {
          targets: 1,
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 2,
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
