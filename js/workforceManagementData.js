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
let chartdata;
var workforceChart;
var workforceDurationChart;
var approvechartApex;
var requestchartApex;

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
  { statusCode: "C", statusDesc: "Cancel" },
];

let dutyScheduleStatusMastersForDashboard = [
  { statusCode: "N", statusDesc: "Wait" },
  { statusCode: "A", statusDesc: "Approve" },
  { statusCode: "O", statusDesc: "Off" },
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
  CreateDatatableRequest.init();
  let setupDataDefered = $.Deferred();
  SetupData.init(setupDataDefered);

  $.when(setupDataDefered).done(function (success) {
    if (!success) {
      return;
    }

    renderPage();
    renderChart();
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
                <div class="icon-circle bg-primary">
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

  $("#endDate")
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

  //   $.each(departmentMaster, function (i, item) {
  //     $("select[name=departmentCode]").append(
  //       $("<option>", {
  //         value: item.departmentCode,
  //         text: item.departmentDesc,
  //       })
  //     );
  //   });
};

$("#hospitalCode").on("change", function () {
  $("#locationCode")
    .empty()
    .append(`<option selected value="-1">ทั้งหมด</option>`);

  $("#departmentCode")
    .empty()
    .append(`<option selected value="-1">ทั้งหมด</option>`);

  $.each(locationMaster, function (i, item) {
    $("#locationCode").append(
      $("<option>", {
        value: item.locationCode,
        text: item.locationDesc,
      })
    );
  });
});

$("#locationCode").on("change", function () {
  $("#departmentCode")
    .empty()
    .append(`<option selected value="-1">ทั้งหมด</option>`);

  $.each(
    departmentMaster.filter(
      (e) =>
        e.hospitalCode == $("#hospitalCode").val() &&
        e.locationCode == $("#locationCode").val()
    ),
    function (i, item) {
      $("#departmentCode").append(
        $("<option>", {
          value: item.departmentCode,
          text: item.departmentDesc,
        })
      );
    }
  );
});

$("#generalSearch").on("click", function () {
  LoadDutyScheduleRequest();
});

$("#sidebarToggle").on("click", function () {
  CreateDatatable.adjust();
  CreateDatatableRequest.adjust();
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
  let dutyDateTo = $("#endDate").val();
  let hospitalCode = parseInt($("#hospitalCode").val());
  let locationCode = parseInt($("#locationCode").val());
  let departmentCode = parseInt($("#departmentCode").val());
  let positionCode = parseInt($("#positionCode").val());
  let statusCode = $("#statusCode").val();

  let objData = {
    dutyDate: dutyDate,
    dutyDateTo: dutyDateTo,
    hospitalCode: hospitalCode,
    locationCode: locationCode,
    departmentCode: departmentCode,
    positionCode: positionCode,
    statusCode: statusCode,
  };
  console.log(objData);
  $.ajax({
    url: link + "/api/dutySchedule/searchWorkforceManagementData",
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

        //allRequest
        $("#allRequestNumberCard").html(
          dashboardData.allRequestNumber + " อัตรา"
        );
        $("#totalDurationCard").html(
          "คิดเป็นจำนวนชั่วโมง : " + dashboardData.totalDuration + " ชัวโมง"
        );
        // $("#allRequestNumber").html(dashboardData.allRequestNumber);
        // $("#totalDuration").html(
        //   "คิดเป็นจำนวนชั่วโมง : " + dashboardData.totalDuration + " ชัวโมง"
        // );

        //approve
        $("#allApproveNumberCard").html(
          dashboardData.allApproveNumber + " อัตรา"
        );
        $("#totalApproveDurationCard").html(
          "คิดเป็นจำนวนชั่วโมง : " +
            dashboardData.totalApproveDuration +
            " ชัวโมง"
        );
        // $("#approveNumberProgress").attr(
        //   "style",
        //   `width: ${FindPercenOf(
        //     dashboardData.allApproveNumber,
        //     dashboardData.allRequestNumber
        //   )}%`
        // );
        // $("#allApproveNumber").html(dashboardData.allApproveNumber);
        // $("#totalApproveDuration").html(
        //   "คิดเป็นจำนวนชั่วโมง : " +
        //     dashboardData.totalApproveDuration +
        //     " ชัวโมง"
        // );

        //real
        $("#allRealNumberCard").html(dashboardData.allRealNumber + " อัตรา");
        $("#totalAllRealDurationCard").html(
          "คิดเป็นจำนวนชั่วโมง : " +
            dashboardData.totalAllRealDuration +
            " ชัวโมง"
        );
        // $("#allRealNumberProgress").attr(
        //   "style",
        //   `width: ${FindPercenOf(
        //     dashboardData.allRealNumber,
        //     dashboardData.allRequestNumber
        //   )}%`
        // );
        // $("#allRealNumber").html(dashboardData.allRealNumber);
        // $("#totalAllRealDuration").html(
        //   "คิดเป็นจำนวนชั่วโมง : " +
        //     dashboardData.totalAllRealDuration +
        //     " ชัวโมง"
        // );

        //off
        $("#allOffNumberCard").html(dashboardData.allOffNumber + " อัตรา");
        $("#totalOffDurationCard").html(
          "คิดเป็นจำนวนชั่วโมง : " + dashboardData.totalOffDuration + " ชัวโมง"
        );
        // $("#allOffNumberProgress").attr(
        //   "style",
        //   `width: ${FindPercenOf(
        //     dashboardData.allOffNumber,
        //     dashboardData.allRequestNumber
        //   )}%`
        // );
        // $("#allOffNumber").html(dashboardData.allOffNumber);
        // $("#totalOffDuration").html(
        //   "คิดเป็นจำนวนชั่วโมง : " + dashboardData.totalOffDuration + " ชัวโมง"
        // );

        chartdata = dashboardData;
        console.log(dashboardData.workforceManagementApexChartTableList);
        CreateDatatableRequest.data(
          dashboardData.workforceManagementApexChartTableList
        );
        let workforceChartLabel = [];
        let workforceChartRequestNumber = [];
        let workforceChartApproveNumber = [];
        let workforceChartRealNumber = [];
        let requestChartSeries = [];
        let approveChartSeries = [];

        let workforceChartRequestDuration = [];
        let workforceChartApproveDuration = [];
        let workforceChartRealDuration = [];

        if (chartdata != null) {
          for (let data of chartdata.workforceManagementItemList) {
            workforceChartLabel.push(data.dutyDate);
            workforceChartRequestNumber.push(data.requestNumber);
            workforceChartApproveNumber.push(data.approveNumber);
            workforceChartRealNumber.push(data.realNumber);

            workforceChartRequestDuration.push(data.requestDuration);
            workforceChartApproveDuration.push(data.approveDuration);
            workforceChartRealDuration.push(data.realDuration);
          }

          for (let data of chartdata.workforceManagementApexChartSeriesList) {
            requestChartSeries.push({
              name: data.name,
              data: data.requestList,
            });
            approveChartSeries.push({
              name: data.name,
              data: data.approveList,
            });
          }
        }

        workforceChart.data.labels = workforceChartLabel;
        workforceChart.data.datasets[0].data = workforceChartRequestNumber;
        workforceChart.data.datasets[1].data = workforceChartApproveNumber;
        workforceChart.data.datasets[2].data = workforceChartRealNumber;
        workforceChart.update();

        workforceDurationChart.data.labels = workforceChartLabel;
        workforceDurationChart.data.datasets[0].data =
          workforceChartRequestDuration;
        workforceDurationChart.data.datasets[1].data =
          workforceChartApproveDuration;
        workforceDurationChart.data.datasets[2].data =
          workforceChartRealDuration;
        workforceDurationChart.update();

        requestchartApex.updateOptions({
          xaxis: {
            categories: workforceChartLabel,
          },
          series: requestChartSeries,
        });

        approvechartApex.updateOptions({
          xaxis: {
            categories: workforceChartLabel,
          },
          series: approveChartSeries,
        });
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

let renderChart = function () {
  // Set new default font family and font color to mimic Bootstrap's default styling
  (Chart.defaults.global.defaultFontFamily = "Nunito"),
    '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = "#858796";

  function number_format(number, decimals, dec_point, thousands_sep) {
    // *     example: number_format(1234.56, 2, ',', ' ');
    // *     return: '1 234,56'
    number = (number + "").replace(",", "").replace(" ", "");
    var n = !isFinite(+number) ? 0 : +number,
      prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
      sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
      dec = typeof dec_point === "undefined" ? "." : dec_point,
      s = "",
      toFixedFix = function (n, prec) {
        var k = Math.pow(10, prec);
        return "" + Math.round(n * k) / k;
      };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || "").length < prec) {
      s[1] = s[1] || "";
      s[1] += new Array(prec - s[1].length + 1).join("0");
    }
    return s.join(dec);
  }

  // Area Chart Example
  var ctx = document.getElementById("myAreaChart");

  workforceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "จำนวนที่ขอ",
          backgroundColor: "rgba(78, 115, 223, 1)",
          borderColor: "rgba(78, 115, 223, 1)",
          hoverBackgroundColor: "rgba(78, 115, 223, 1)",
          hoverBorderColor: "rgba(78, 115, 223, 1)",
          data: [],
          barPercentage: 0.75,
          categoryPercentage: 0.5,
        },
        {
          label: "จำนวนที่อนุมัติ",
          backgroundColor: "#14A44D",
          borderColor: "#14A44D",
          hoverBackgroundColor: "#14A44D",
          hoverBorderColor: "#14A44D",
          data: [],
          barPercentage: 0.75,
          categoryPercentage: 0.5,
        },
        {
          label: "จำนวนที่เข้างาน",
          backgroundColor: "#54B4D3",
          borderColor: "#54B4D3",
          hoverBackgroundColor: "#54B4D3",
          hoverBorderColor: "#54B4D3",
          data: [],
          barPercentage: 0.75,
          categoryPercentage: 0.5,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0,
        },
      },
      scales: {
        xAxes: [
          {
            time: {
              unit: "date",
            },
            gridLines: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              maxTicksLimit: 7,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              maxTicksLimit: 5,
              padding: 10,
              // Include a dollar sign in the ticks
              callback: function (value, index, values) {
                return "จำนวน " + number_format(value);
              },
            },
            gridLines: {
              color: "rgb(234, 236, 244)",
              zeroLineColor: "rgb(234, 236, 244)",
              drawBorder: false,
              borderDash: [2],
              zeroLineBorderDash: [2],
            },
          },
        ],
      },
      legend: {
        display: true,
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: "#6e707e",
        titleFontSize: 14,
        borderColor: "#dddfeb",
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: "index",
        caretPadding: 10,
        callbacks: {
          label: function (tooltipItem, chart) {
            var datasetLabel =
              chart.datasets[tooltipItem.datasetIndex].label || "";
            return (
              datasetLabel + " " + number_format(tooltipItem.yLabel) + " อัตรา"
            );
          },
        },
      },
    },
  });

  // Area Chart Example2
  var ctx = document.getElementById("myAreaChart4");

  workforceDurationChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "จำนวนที่ขอ",
          backgroundColor: "rgba(78, 115, 223, 1)",
          borderColor: "rgba(78, 115, 223, 1)",
          hoverBackgroundColor: "rgba(78, 115, 223, 1)",
          hoverBorderColor: "rgba(78, 115, 223, 1)",
          data: [],
          barPercentage: 0.75,
          categoryPercentage: 0.5,
        },
        {
          label: "จำนวนที่อนุมัติ",
          backgroundColor: "#14A44D",
          borderColor: "#14A44D",
          hoverBackgroundColor: "#14A44D",
          hoverBorderColor: "#14A44D",
          data: [],
          barPercentage: 0.75,
          categoryPercentage: 0.5,
        },
        {
          label: "จำนวนที่เข้างาน",
          backgroundColor: "#54B4D3",
          borderColor: "#54B4D3",
          hoverBackgroundColor: "#54B4D3",
          hoverBorderColor: "#54B4D3",
          data: [],
          barPercentage: 0.75,
          categoryPercentage: 0.5,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0,
        },
      },
      scales: {
        xAxes: [
          {
            time: {
              unit: "date",
            },
            gridLines: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              maxTicksLimit: 7,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              maxTicksLimit: 5,
              padding: 10,
              // Include a dollar sign in the ticks
              callback: function (value, index, values) {
                return "จำนวน " + number_format(value);
              },
            },
            gridLines: {
              color: "rgb(234, 236, 244)",
              zeroLineColor: "rgb(234, 236, 244)",
              drawBorder: false,
              borderDash: [2],
              zeroLineBorderDash: [2],
            },
          },
        ],
      },
      legend: {
        display: true,
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: "#6e707e",
        titleFontSize: 14,
        borderColor: "#dddfeb",
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: "index",
        caretPadding: 10,
        callbacks: {
          label: function (tooltipItem, chart) {
            var datasetLabel =
              chart.datasets[tooltipItem.datasetIndex].label || "";
            return (
              datasetLabel +
              " " +
              number_format(tooltipItem.yLabel) +
              " ชั่วโมง"
            );
          },
        },
      },
    },
  });

  //apex
  var options = {
    chart: {
      height: 350,
      type: "bar",
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    series: [],
    xaxis: {
      categories: [],
      labels: {
        formatter: function (val) {
          return val + " อัตรา";
        },
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " อัตรา";
        },
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      offsetX: 40,
    },
  };
  requestchartApex = new ApexCharts(
    document.querySelector("#myAreaChart2"),
    options
  );
  requestchartApex.render();

  //
  var options = {
    chart: {
      height: 350,
      type: "bar",
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    series: [],
    xaxis: {
      categories: [],
      labels: {
        formatter: function (val) {
          return val + " อัตรา";
        },
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " อัตรา";
        },
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      offsetX: 40,
    },
  };
  approvechartApex = new ApexCharts(
    document.querySelector("#myAreaChart3"),
    options
  );
  approvechartApex.render();
};

let CreateDatatableRequest = (function () {
  let table;
  let currentPage = 0;
  let initTable1 = function () {
    table = $("#dataTableRequest").DataTable({
      responsive: false,
      data: [],
      // scrollY: "50vh",
      scrollX: true,
      scrollCollapse: true,
      columns: [
        { data: "", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "locationCode", className: "text-center" },
        { data: "departmentCode", className: "text-center" },
        { data: "positionCode", className: "text-center" },
        { data: "date", className: "text-center" },
        { data: "requestNumber", className: "text-center" },
        { data: "approveNumber", className: "text-center" },
        { data: "realNumber", className: "text-center" },
        { data: "requestDuration", className: "text-center" },
        { data: "approveDuration", className: "text-center" },
        { data: "realDuration", className: "text-center" },
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
          title: "แผนก",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 4,
          title: "ตำแหน่ง",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : positionMap.get(data).positionDesc;
          },
        },
        {
          targets: 5,
          title: "วันเดือนปี",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 6,
          title: "จำนวนที่ขอ",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 7,
          title: "จำนวนที่อนุมัติ",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 8,
          title: "จำนวนที่เข้าจริง",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 9,
          title: "ชั่วโมงที่ขอ",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 10,
          title: "ชั่วโมงที่อนุมัติ",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 11,
          title: "ชั่วโมงที่เข้าจริง",
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
        currentDutyScheduleId = data.dutyScheduleId;
        currentRow = $(this).closest("tr");
        globalScore = 0;
        removeStar();
        $("#editScheduleModal").modal();
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
