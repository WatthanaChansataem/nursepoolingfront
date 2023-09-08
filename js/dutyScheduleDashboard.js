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
let modalEdit = $("#editScheduleModal");

let hospitalMap = new Map();
let hospitalMaster;
let locationMap = new Map();
let locationMaster;
let departmentMap = new Map();
let departmentMaster;
let currentRow;
let isValidate = 0;
let positionMap = new Map();
let positionMaster;
let userData;
let currentDutyScheduleId;

let userRoleConstant = {
  User: "U",
  Admin: "A",
  Department: "D",
};

let dutyScheduleStatusMasters = [
  { statusCode: "N", statusDesc: "Normal" },
  { statusCode: "A", statusDesc: "Approve" },
  { statusCode: "C", statusDesc: "Cancel" },
  { statusCode: "O", statusDesc: "Off" },
];

let dutyScheduleStatusMastersForUserUpdate = [
  { statusCode: "N", statusDesc: "Normal" },
  { statusCode: "C", statusDesc: "Cancel" },
];

let dutyScheduleStatusMastersForDashboard = [
  { statusCode: "N", statusDesc: "Normal" },
  { statusCode: "A", statusDesc: "Approve" },
  { statusCode: "O", statusDesc: "Off" },
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

let scoreConstant = {
  1: { desc: "แย่มาก", state: "danger" },
  2: { desc: "แย่", state: "warning" },
  3: { desc: "พอใช้", state: "primary" },
  4: { desc: "ดี", state: "info" },
  5: { desc: "ดีมาก", state: "success" },
  null: { desc: "ไม่มี", state: "light" },
};
let locationCodeConstant = {
  OPD: 1,
  IPD: 2,
  Criticalcare: 3,
};
let globalScore = 0;
$(document).ready(function () {
  const stars = document.querySelectorAll(".stars i");
  stars.forEach((star, index1) => {
    star.addEventListener("click", () => {
      stars.forEach((star, index2) => {
        globalScore = index1 + 1;
        index1 >= index2
          ? star.classList.add("active")
          : star.classList.remove("active");
      });
    });
  });

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
            `http://10.104.10.243:8082/api/document/avatar/${userData.userId}`
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
  $.each(dutyScheduleStatusMastersForDashboard, function (i, item) {
    $("select[name=statusCode]").append(
      $("<option>", {
        value: item.statusCode,
        text: item.statusDesc,
      })
    );
  });
  $("#beginDate")
    .datepicker({
      format: "dd/mm/yyyy",
      autoclose: true,
      todayHighlight: true,
      todayBtn: true,
    })
    .datepicker("setDate", new Date());

  $.each(positionMaster, function (i, item) {
    $("select[name=positionCode]").append(
      $("<option>", {
        value: item.positionCode,
        text: item.positionDesc,
      })
    );
  });

  $.each(hospitalMaster, function (i, item) {
    $("select[name=hospitalCode]").append(
      $("<option>", {
        value: item.hospitalCode,
        text: item.hospitalDesc,
      })
    );
  });

  $.each(locationMaster, function (i, item) {
    $("select[name=locationCode]").append(
      $("<option>", {
        value: item.locationCode,
        text: item.locationDesc,
      })
    );
  });

  $.each(departmentMaster, function (i, item) {
    $("select[name=departmentCode]").append(
      $("<option>", {
        value: item.departmentCode,
        text: item.departmentDesc,
      })
    );
  });
};

$("#generalSearch").on("click", function () {
  LoadDutyScheduleRequest();
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
      // scrollY: "50vh",
      scrollX: true,
      scrollCollapse: true,
      columns: [
        { data: "", className: "text-center" },
        { data: "firstName", className: "text-center" },
        { data: "dutyDate", className: "text-center" },
        { data: "approveHospitalCode", className: "text-center" },
        { data: "approveLocationCode", className: "text-center" },
        { data: "approveDepartmentCode", className: "text-center" },
        { data: "positionCode", className: "text-center" },
        { data: "approveShiftStart", className: "text-center" },
        { data: "realShiftStart", className: "text-center" },
        { data: "totalRealDuration", className: "text-center" },
        { data: "status", className: "text-center" },
        { data: "score", className: "text-center" },
        { data: "departmentRemark", className: "text-center" },
        // { data: "", className: "text-center" },
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
            return `<a class="" href="profilePreview.html?userId=${
              full.userId
            }" target="_blank">${full.firstName + " " + full.lastName}</a>`;
          },
        },
        {
          targets: 2,
          title: "วันเดือนปี",
          render: function (data, type, full, meta) {
            return isDateTime(data) ? moment(data).format("DD/MM/YYYY") : data;
          },
        },
        {
          targets: 3,
          title: "โรงพยาบาล",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : hospitalMap.get(data).hospitalDesc;
          },
        },
        {
          targets: 4,
          title: "Location",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : locationMap.get(data).locationDesc;
          },
        },
        {
          targets: 5,
          title: "แผนก",
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
          title: "ช่วงเวลาที่อนุมัติ",
          render: function (data, type, full, meta) {
            return full.approveShiftStart == null
              ? "-"
              : full.approveShiftStart + "-" + full.approveShiftEnd;
          },
        },
        {
          targets: 8,
          title: "ช่วงเวลาที่เข้างานจริง",
          render: function (data, type, full, meta) {
            return full.realShiftStart == null
              ? "-"
              : full.realShiftStart + "-" + full.realShiftEnd;
          },
        },
        {
          targets: 9,
          title: "จำนวนชั่วโมงที่เข้างาน",
          render: function (data, type, full, meta) {
            return data == null ? "-" : data;
          },
        },
        {
          targets: 10,
          title: "สถานะ",
          render: function (data, type, full, meta) {
            return `<a class="btn btn-${dutyScheduleSStatusMap[data].state}" style="width: 90px;">${dutyScheduleSStatusMap[data].desc}</a>`;
          },
        },
        {
          targets: 11,
          title: "ผลประเมิน",
          render: function (data, type, full, meta) {
            return `<a class="btn btn-${scoreConstant[data].state}" style="width: 90px;">${scoreConstant[data].desc}</a>`;
          },
        },
        {
          targets: 12,
          title: "หมายเหตุจากหน่วยงาน",
          render: function (data, type, full, meta) {
            return data == null ? "-" : data;
          },
        },
        // {
        //   targets: 11,
        //   title: "แก้ไข",
        //   render: function (data, type, full, meta) {
        //     return `<a class="btn btn-outline-dark btn-circle btn-sm edit-button" id="addEducation"><i class="fas fa-pencil-alt"></i></a>`;
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
        currentDutyScheduleId = data.dutyScheduleId;
        currentRow = $(this).closest("tr");
        globalScore = 0;
        removeStar();
        $("#editScheduleModal").modal();
      });

      $("#editScheduleBtnModal").on("click", function () {
        let realShiftStart = $("#realShiftStartModal").val();
        let realShiftEnd = $("#realShiftEndModal").val();
        let remark = $("#remarkEditModal").val();
        let objadddata = {
          departmentRemark: remark,
          realShiftStart: realShiftStart,
          realShiftEnd: realShiftEnd,
          score: globalScore,
          dutyScheduleId: currentDutyScheduleId,
        };
        console.log(objadddata);
        isValidate = 0;

        if (
          objadddata["realShiftStart"] == null ||
          objadddata["realShiftStart"] == ""
        ) {
          modalEdit
            .find(`.div-input-realShiftStartModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-realShiftStartModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ`);
          isValidate = 1;
        } else {
          modalEdit
            .find(`.div-input-realShiftStartModal .form-control`)
            .removeClass(isInvalidClass);
        }

        if (
          objadddata["realShiftEnd"] == null ||
          objadddata["realShiftEnd"] == ""
        ) {
          modalEdit
            .find(`.div-input-realShiftEndModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-realShiftEndModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ`);
          isValidate = 1;
        } else {
          modalEdit
            .find(`.div-input-realShiftEndModal .form-control`)
            .removeClass(isInvalidClass);
        }

        if (isValidate == 1) {
          return;
        }

        $.ajax({
          url: "https://localhost:7063/api/dutySchedule/updateEmployeeAppraisal",
          type: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          data: JSON.stringify(objadddata),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function (res) {
            if (res.status.code == 200) {
              toastr.success("อัพเดทรายการสำเร็จ");
              $("#editScheduleModal").modal("hide");
              LoadDutyScheduleRequest();
            } else {
              toastr.error(res.status.message);
            }
          },
          error: function (res) {
            toastr.error("ไม่สามารถอัพเดทรายการได้");
          },
        });
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

let LoadDutyScheduleRequest = function () {
  let dutyDate = $("#beginDate").val();
  let hospitalCode = parseInt($("#hospitalCode").val());
  let locationCode = parseInt($("#locationCode").val());
  let departmentCode = parseInt($("#departmentCode").val());
  let positionCode = parseInt($("#positionCode").val());
  let isJustMonth = $(`#isJustMonth`).is(":checked") ? 1 : 0;
  let statusCode = $("#statusCode").val();

  let objData = {
    dutyDate: dutyDate,
    hospitalCode: hospitalCode,
    locationCode: locationCode,
    departmentCode: departmentCode,
    positionCode: positionCode,
    isJustMonth: isJustMonth,
    statusCode: statusCode,
  };
  console.log(objData);
  $.ajax({
    url: "https://localhost:7063/api/dutySchedule/searchDutyScheduleDashboard",
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: JSON.stringify(objData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        let dashboardData = res.data;
        CreateDatatable.data(dashboardData.dutyScheduleList);

        $("#requestNumberProgress").attr("style", "width: 100%");
        $("#allRequestNumber").html(dashboardData.allRequestNumber);
        $("#totalDuration").html(
          "คิดเป็นจำนวนชั่วโมง : " + dashboardData.totalDuration + " ชัวโมง"
        );

        $("#approveNumberProgress").attr(
          "style",
          `width: ${FindPercenOf(
            dashboardData.allApproveNumber,
            dashboardData.allRequestNumber
          )}%`
        );
        $("#allApproveNumber").html(dashboardData.allApproveNumber);
        $("#totalApproveDuration").html(
          "คิดเป็นจำนวนชั่วโมง : " +
            dashboardData.totalApproveDuration +
            " ชัวโมง"
        );

        $("#allRealNumberProgress").attr(
          "style",
          `width: ${FindPercenOf(
            dashboardData.allRealNumber,
            dashboardData.allRequestNumber
          )}%`
        );
        $("#allRealNumber").html(dashboardData.allRealNumber);
        $("#totalAllRealDuration").html(
          "คิดเป็นจำนวนชั่วโมง : " +
            dashboardData.totalAllRealDuration +
            " ชัวโมง"
        );

        $("#allOffNumberProgress").attr(
          "style",
          `width: ${FindPercenOf(
            dashboardData.allOffNumber,
            dashboardData.allRequestNumber
          )}%`
        );
        $("#allOffNumber").html(dashboardData.allOffNumber);
        $("#totalOffDuration").html(
          "คิดเป็นจำนวนชั่วโมง : " + dashboardData.totalOffDuration + " ชัวโมง"
        );
      } else {
        toastr.error(res.status.message);
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถดึงข้อมูลเจ้าหน้าที่ที่เข้าเวรได้");
    },
  });
};

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

let removeStar = function () {
  const stars = document.querySelectorAll(".stars i");
  // stars.forEach((star, index1) => {
  //   star.addEventListener("click", () => {
  stars.forEach((star, index2) => {
    star.classList.remove("active");
  });
  //   });
  // });
};

let FindPercenOf = function (x, y) {
  return (x * 100) / y;
};
