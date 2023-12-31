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

let userRoleConstant = {
  User: "U",
  Admin: "A",
  Department: "D",
};

let dutyScheduleStatusMasters = [
  { statusCode: "N", statusDesc: "Wait" },
  { statusCode: "A", statusDesc: "Approve" },
  { statusCode: "C", statusDesc: "Cancel" },
  { statusCode: "O", statusDesc: "Off" },
];

let dutyScheduleStatusMastersForUserUpdate = [
  { statusCode: "N", statusDesc: "Wait" },
  //   { statusCode: "A", statusDesc: "Approve" },
  { statusCode: "C", statusDesc: "Cancel" },
  //   { statusCode: "O", statusDesc: "Off" },
];

let dutyScheduleSStatusMap = {
  N: { desc: "Wait", state: "secondary" },
  A: { desc: "Approve", state: "success" },
  C: { desc: "Cancel", state: "danger" },
  O: { desc: "Off", state: "warning" },
  null: { desc: "New", state: "primary" },
};

let dutyScheduleStatusConstant = {
  Wait: "N",
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
      url: link + "/api/hospital/list",
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
      url: link + "/api/location/list",
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
      url: link + "/api/department/list",
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
      url: link + "/api/user/details",
      type: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: function (res) {
        if (res.status.code == 200) {
          userData = res.data;
          $("#version").html("Version " + userData.version);
          $("#currentUserName").html(userData.firstName);
          if (
            userData.approveUserList != null &&
            userData.approveUserList.length > 0
          ) {
            $("#notifyCount").html(1);
            $("#notifyDropdown")
              .append(`<a class="dropdown-item d-flex align-items-center" href="userManagement.html?from=notification">
              <div class="mr-3">
                <div class="icon-circle" style="background-color: #0f6641">
                  <i class="fas fa-user text-white"></i>
                </div>
              </div>
              <div>
                <div class="small text-gray-500">${userData.notifyDateString}</div>
                <span class="font-weight-bold"
                  >มีผู้ใช้ที่ยังไม่ได้รับการอนุมัติจำนวน ${userData.approveUserList.length} รายการ</span
                >
              </div>
            </a>`);
          } else {
            $("#notifyDropdown").append(`<a
            class="dropdown-item text-center small text-gray-500"
            href="#"
            >ไม่พบรายการ</a
          >`);
          }
          $("#navProfileImg").attr(
            "src",
            `${link}/api/document/avatar/${userData.userId}`
          );
          if (userData.role != userRoleConstant.Admin) {
            localStorage.clear();
            window.location.href = "login.html";
          }
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้", "Error");
          localStorage.clear();
          window.location.href = "login.html";
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้", "Error");
        localStorage.clear();
        window.location.href = "login.html";
      },
    });
  };

  let loadPosition = function (defered) {
    $.ajax({
      url: link + "/api/position/list",
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
      url: link + "/api/educationalQualification/list",
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
      url: link + "/api/experienceType/list",
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
    url: link + "/api/dutySchedule/approvedutySchedule",
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: JSON.stringify(objData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        let isOverWrite = 0;
        for (let data of res.data) {
          if (data.isOverWrite == 1) {
            isOverWrite = 1;
          }
        }
        if (isOverWrite == 0) {
          toastr.success("บันทึกสำเร็จ");
          isOverWrite = 0;
        } else {
          toastr.warning(
            "มีรายการที่อนุมัติเวร โดยที่หน่วยงานไม่ได้มีการขออัตรากำลัง กรุณาตรวจสอบการทำรายการอีกครั้ง"
          );
          isOverWrite = 0;
        }
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
        { data: "firstName", className: "text-center" },
        { data: "positionCode", className: "text-center" },
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
          title: "ตำแหน่ง",
          render: function (data, type, full, meta) {
            return positionMap.get(full.positionCode).positionDesc;
          },
        },
        {
          targets: 3,
          title: "1",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayOne].state
                } btn-circle btn-sm edit-button" days="1"> ${data}</i></a>`;
          },
        },
        {
          targets: 4,
          title: "2",
          orderable: false,
          render: function (data, type, full, meta) {
            return data == 0
              ? "-"
              : `<a  class="btn btn-${
                  dutyScheduleSStatusMap[full.dutyScheduleStatusDayTwo].state
                } btn-circle btn-sm edit-button" days="2">${data}</i></a>`;
          },
        },
        {
          targets: 5,
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
          targets: 6,
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
          targets: 7,
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
          targets: 8,
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
          targets: 9,
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
          targets: 10,
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
          targets: 11,
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
          targets: 12,
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
          targets: 13,
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
          targets: 14,
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
          targets: 15,
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
          targets: 16,
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
          targets: 17,
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
          targets: 18,
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
          targets: 19,
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
          targets: 20,
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
          targets: 21,
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
          targets: 22,
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
          targets: 23,
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
          targets: 24,
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
          targets: 25,
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
          targets: 26,
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
          targets: 27,
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
          targets: 28,
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
          targets: 29,
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
          targets: 30,
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
          targets: 31,
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
          targets: 32,
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
          targets: 33,
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
          targets: 34,
          title: "จำนวนเวรที่ขอ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 35,
          title: "จำนวนเวรที่อนุมัติ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 36,
          title: "จำนวนเวรที่ยกเลิก หรือ Off",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 37,
          title: "จำนวนชั่วโมงที่ขอ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 38,
          title: "จำนวนชั่วโมงที่อนุมัติ",
          orderable: false,
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 39,
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
  let positionCode = parseInt($("select[name=positionCodeSearch]").val());

  let objData = {
    dutyDate: dutyDate,
    name: searchName,
    positionCode: positionCode,
  };
  $.ajax({
    url: link + "/api/dutySchedule/searchDutyScheduleForIndividualApproval",
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: JSON.stringify(objData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        console.log(res.data);
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
  //   console.log(day);
  //   console.log(moment(data.dutyDate).format("DD/MM/YYYY"));

  let objData = {
    day: day,
    dutyDate: moment(data.dutyDate).format("DD/MM/YYYY"),
    userId: data.insertUserId,
  };
  $.ajax({
    url:
      link + "/api/dutySchedule/searchDutyScheduleForIndividualApprovalDetail",
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
        // modal.find("label").text("");
        $("#previewProfile").attr(
          "href",
          "profilePreview.html?userId=" + approvalDetaildata.userId
        );
        $("#dutyDateDisplayModal").html(
          moment(approvalDetaildata.dutyDate).format("DD/MM/YYYY")
        );
        $("#profileImg").attr(
          "src",
          `${link}/api/document/avatar/${approvalDetaildata.userId}`
        );

        $("#firstNameModal").html(
          '<strong class="text-gray-900">ชื่อ:  </strong> ' +
            approvalDetaildata.firstName +
            " " +
            approvalDetaildata.lastName
        );

        $("#positionCodeModal").html(
          '<strong class="text-gray-900">ตำแหน่ง:  </strong> ' +
            approvalDetaildata.positionDesc
        );

        $("#workplaceModal").html(
          '<strong class="text-gray-900">สถานที่ทำงาน:  </strong> ' +
            approvalDetaildata.workplace
        );

        $("#userLevelCode").html(
          '<strong class="text-gray-900">Level:  </strong> ' +
            approvalDetaildata.userLevelCode
        );

        $("#phone").html(
          '<strong class="text-gray-900">หมายเลขโทรศพท์:  </strong> ' +
            approvalDetaildata.phone
        );

        $("#email").html(
          '<strong class="text-gray-900">Email:  </strong> ' +
            approvalDetaildata.email
        );

        console.log(approvalDetaildata);
        if (approvalDetaildata.educationList.length != 0) {
          $("#educationalQualificationCode").html(
            '<strong class="text-gray-900">วุฒิการศึกษา:  </strong> ' +
              educationalQualificationMap.get(
                approvalDetaildata.educationList[0].educationalQualificationCode
              ).educationalQualificationDesc
          );

          $("#majorCode").html(
            '<strong class="text-gray-900">สาขา:  </strong> ' +
              approvalDetaildata.educationList[0].majorCode
          );

          $("#graduationYear").html(
            '<strong class="text-gray-900">ปีที่จบ:  </strong> ' +
              approvalDetaildata.educationList[0].graduationYear
          );

          $("#university").html(
            '<strong class="text-gray-900">มหาวิทยาลัย:  </strong> ' +
              approvalDetaildata.educationList[0].university
          );
        }

        if (approvalDetaildata.experienceList.length != 0) {
          $("#experienceTypeCode").html(
            '<strong class="text-gray-900">ประสบการณ์:  </strong> ' +
              experienceTypeMap.get(
                approvalDetaildata.experienceList[0].experienceTypeCode
              ).experienceTypeDesc
          );

          $("#positionCode").html(
            '<strong class="text-gray-900">ตำแหน่ง:  </strong> ' +
              approvalDetaildata.experienceList[0].positionCode
          );

          $("#beginYear").html(
            '<strong class="text-gray-900">ปีที่เริ่ม:  </strong> ' +
              approvalDetaildata.experienceList[0].beginYear
          );

          $("#endYear").html(
            '<strong class="text-gray-900">ปีที่สิ้นสุด:  </strong> ' +
              approvalDetaildata.experienceList[0].endYear
          );
        }
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
        { data: "hospitalCode", className: "text-center" },
        { data: "locationCode", className: "text-center" },
        { data: "departmentCode1", className: "text-center" },
        { data: "departmentCode2", className: "text-center" },
        { data: "departmentCode3", className: "text-center" },
        { data: "positionCode", className: "text-center" },
        { data: "shiftStart", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "locationCode", className: "text-center" },
        { data: "departmentCode1", className: "text-center" },
        { data: "shiftStart", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
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
          title: "โรงพยาบาล",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : hospitalMap.get(data).hospitalDesc;
          },
        },
        {
          targets: 2,
          title: "Location",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : locationMap.get(data).locationDesc;
          },
        },
        {
          targets: 3,
          title: "แผนกลำดับที่ 1",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 4,
          title: "แผนกลำดับที่ 2",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 5,
          title: "แผนกลำดับที่ 3",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 6,
          title: "ตำแหน่ง",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : positionMap.get(data).positionDesc;
          },
        },
        {
          targets: 7,
          title: "ช่วงเวลา",
          render: function (data, type, full, meta) {
            return full.shiftStart + "-" + full.shiftEnd;
          },
        },
        {
          targets: 8,
          title: "โรงพยาบาลที่ขอ",
          render: function (data, type, full, meta) {
            if (full.dutyScheduleRequestList != null) {
              return hospitalMap.get(full.dutyScheduleRequestList.hospitalCode)
                .hospitalDesc;
            } else {
              return "-";
            }
          },
        },
        {
          targets: 9,
          title: "Locationที่ขอ",
          render: function (data, type, full, meta) {
            if (full.dutyScheduleRequestList != null) {
              return locationMap.get(full.dutyScheduleRequestList.locationCode)
                .locationDesc;
            } else {
              return "-";
            }
          },
        },
        {
          targets: 10,
          title: "แผนกที่ขอ",
          render: function (data, type, full, meta) {
            if (full.dutyScheduleRequestList != null) {
              return departmentMap.get(
                full.dutyScheduleRequestList.departmentCode
              ).departmentDesc;
            } else {
              return "-";
            }
          },
        },
        {
          targets: 11,
          title: "ตำแหน่งที่ขอ",
          render: function (data, type, full, meta) {
            if (full.dutyScheduleRequestList != null) {
              return positionMap.get(full.dutyScheduleRequestList.positionCode)
                .positionDesc;
            } else {
              return "-";
            }
          },
        },
        {
          targets: 12,
          title: "ช่วงเวลาที่ขอ",
          render: function (data, type, full, meta) {
            if (full.dutyScheduleRequestList != null) {
              return `<a href="#" class="btn btn-info btn-circle btn-sm choose-button">${full.dutyScheduleRequestList.dutyScheduleRequestItemList.length}</a>`;
            } else {
              return "-";
            }
          },
        },
        {
          targets: 13,
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
          targets: 14,
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
          targets: 15,
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
          targets: 16,
          title: "ช่วงเวลาที่อนุมัติ",
          render: function (data, type, full, meta) {
            if (full.isUpdate === true) {
              return `<input type="time" class="form-control form-control-sm" name="shiftStartEdit" id="shiftStartEdit" value="${full.approveShiftStart}" /> 
              <input type="time" class="form-control form-control-sm" name="shiftEndEdit" id="shiftEndEdit" value="${full.approveShiftEnd}" />
              <label class="small" style="color: red;" id="labelAlert">* กรุณาตรวจสอบก่อนทำการอนุมัติ </label>`;
            } else {
              return full.approveShiftStart != null &&
                full.approveShiftEnd != null
                ? full.approveShiftStart + "-" + full.approveShiftEnd
                : "-";
            }
          },
        },
        {
          targets: 17,
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
          targets: 18,
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
          targets: 19,
          title: "แก้ไข",
          render: function (data, type, full, meta) {
            if (
              full.status == dutyScheduleStatusConstant.Off ||
              full.status == dutyScheduleStatusConstant.Wait ||
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

      containerTable.on("change", ".hospitalCode", function () {
        currentRow = $(this).closest("tr");
        currentRow
          .find("select[name=locationCode]")
          .empty()
          .append("<option selected disabled hidden>กรุณาเลือก</option>");

        currentRow
          .find("select[name=departmentCode]")
          .empty()
          .append("<option selected disabled hidden>กรุณาเลือก</option>");

        $.each(locationMaster, function (i, item) {
          currentRow.find("select[name=locationCode]").append(
            $("<option>", {
              value: item.locationCode,
              text: item.locationDesc,
            })
          );
        });
      });

      containerTable.on("change", ".locationCode", function () {
        currentRow = $(this).closest("tr");

        currentRow
          .find("select[name=departmentCode]")
          .empty()
          .append("<option selected disabled hidden>กรุณาเลือก</option>");

        $.each(
          departmentMaster.filter(
            (e) =>
              e.hospitalCode == $("#hospitalCode").val() &&
              e.locationCode == $("#locationCode").val()
          ),
          function (i, item) {
            currentRow.find("select[name=departmentCode]").append(
              $("<option>", {
                value: item.departmentCode,
                text: item.departmentDesc,
              })
            );
          }
        );
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

    row
      .find("select[name=hospitalCode]")
      .empty()
      .append("<option selected disabled hidden>กรุณาเลือก</option>");

    $.each(hospitalMaster, function (i, item) {
      row.find("select[name=hospitalCode]").append(
        $("<option>", {
          value: item.hospitalCode,
          text: item.hospitalDesc,
        })
      );
    });
    if (isChanged.approveHospitalCode != null) {
      row
        .find("select[name=hospitalCode]")
        .val(isChanged.approveHospitalCode)
        .change();
    } else {
      if (isChanged.dutyScheduleRequestList != null) {
        row
          .find("select[name=hospitalCode]")
          .val(isChanged.dutyScheduleRequestList.hospitalCode)
          .change();
      }
    }

    if (isChanged.approveLocationCode != null) {
      row
        .find("select[name=locationCode]")
        .val(isChanged.approveLocationCode)
        .change();
    } else {
      if (isChanged.dutyScheduleRequestList != null) {
        row
          .find("select[name=locationCode]")
          .val(isChanged.dutyScheduleRequestList.locationCode)
          .change();
      }
    }

    if (isChanged.approveDepartmentCode != null) {
      row
        .find("select[name=departmentCode]")
        .val(isChanged.approveDepartmentCode)
        .change();
    } else {
      if (isChanged.dutyScheduleRequestList != null) {
        row
          .find("select[name=departmentCode]")
          .val(isChanged.dutyScheduleRequestList.departmentCode)
          .change();
      }
    }

    row.find("#labelAlert").hide();
    if (
      isChanged.status == dutyScheduleStatusConstant.Wait &&
      (isChanged.approveShiftStart == null || isChanged.approveShiftStart == "")
    ) {
      if (isChanged.dutyScheduleRequestList != null) {
        row.find("input[name=shiftStartEdit]").val(isChanged.shiftStart);
        row.find("input[name=shiftEndEdit]").val(isChanged.shiftEnd);
        if (
          isChanged.shiftStart != isChanged.mapShiftStart ||
          isChanged.shiftEnd != isChanged.mapShiftEnd
        ) {
          row.find("#labelAlert").show();
        }

        if (isChanged.shiftStart != isChanged.mapShiftStart) {
          row.find("input[name=shiftStartEdit]").css({
            color: "red",
          });
        } else {
          row.find("input[name=shiftStartEdit]").css({
            color: "green",
          });
        }

        if (isChanged.shiftEnd != isChanged.mapShiftEnd) {
          row.find("input[name=shiftEndEdit]").css({
            color: "red",
          });
        } else {
          row.find("input[name=shiftEndEdit]").css({
            color: "green",
          });
        }
      }
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
      dutyScheduleStatusConstant.Approve == newDutySchedule.status &&
      (newDutySchedule.hospitalCode == null ||
        isNaN(newDutySchedule.hospitalCode) ||
        newDutySchedule.locationCode == null ||
        isNaN(newDutySchedule.locationCode) ||
        newDutySchedule.departmentCode == null ||
        isNaN(newDutySchedule.departmentCode) ||
        newDutySchedule.shiftStart == "" ||
        newDutySchedule.shiftEnd == "" ||
        newDutySchedule.status == "")
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
