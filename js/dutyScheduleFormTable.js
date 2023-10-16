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
let modal = $("#addScheduleModal");
let modalEdit = $("#editScheduleModal");

let hospitalMap = new Map();
let hospitalMaster;
let locationMap = new Map();
let locationMaster;
let departmentMap = new Map();
let departmentMaster;
let currentRow;
let currentDutyScheduleId;
let userData;
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

let dutyScheduleSStatusMap = {
  N: { desc: "Wait", state: "secondary" },
  A: { desc: "Approve", state: "success" },
  C: { desc: "Cancel", state: "danger" },
  O: { desc: "Off", state: "warning" },
  null: { desc: "New", state: "primary" },
};

let dutyScheduleSStatusConstant = {
  Wait: "N",
  Approve: "A",
  Cancel: "C",
  Off: "O",
};

let dutyScheduleStatusMastersForUserUpdate = [
  { statusCode: "N", statusDesc: "Wait" },
  //   { statusCode: "A", statusDesc: "Approve" },
  { statusCode: "C", statusDesc: "Cancel" },
  //   { statusCode: "O", statusDesc: "Off" },
];

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
          $("#currentUserName").html(
            userData.firstName + " " + userData.lastName
          );
          $("#navProfileImg").attr(
            "src",
            `${link}/api/document/avatar/${userData.userId}`
          );
          if (userData.role != userRoleConstant.User) {
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
  return {
    init: function (defered) {
      let hospitalDefered = $.Deferred();
      let locationDefered = $.Deferred();
      let departmentDefered = $.Deferred();
      let userDataDefered = $.Deferred();
      loadHospital(hospitalDefered);
      loadLocation(locationDefered);
      loadDepartment(departmentDefered);
      loadUserData(userDataDefered);

      $.when(
        hospitalDefered,
        locationDefered,
        departmentDefered,
        userDataDefered
      ).done(function (
        hospitalResult,
        locationDefered,
        departmentDefered,
        userDataResult
      ) {
        if (
          (hospitalResult && locationDefered && departmentDefered,
          userDataResult)
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
  //   CreateDatatable.adjust();
  LoadDutySchedule();
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

  $.each(dutyScheduleStatusMasters, function (i, item) {
    $("select[name=statusCode]").append(
      $("<option>", {
        value: item.statusCode,
        text: item.statusDesc,
      })
    );
  });

  $.each(hospitalMaster, function (i, item) {
    $("select[name=hospitalCodeModal]").append(
      $("<option>", {
        value: item.hospitalCode,
        text: item.hospitalDesc,
      })
    );
  });

  $.each(locationMaster, function (i, item) {
    $("select[name=locationCodeModal]").append(
      $("<option>", {
        value: item.locationCode,
        text: item.locationDesc,
      })
    );
  });

  $.each(departmentMaster, function (i, item) {
    $("select[name=departmentCode1Modal]").append(
      $("<option>", {
        value: item.departmentCode,
        text: item.departmentDesc,
      })
    );
  });

  $.each(departmentMaster, function (i, item) {
    $("select[name=departmentCode2Modal]").append(
      $("<option>", {
        value: item.departmentCode,
        text: item.departmentDesc,
      })
    );
  });

  $.each(departmentMaster, function (i, item) {
    $("select[name=departmentCode3Modal]").append(
      $("<option>", {
        value: item.departmentCode,
        text: item.departmentDesc,
      })
    );
  });

  $.each(hospitalMaster, function (i, item) {
    $("select[name=hospitalCodeEditModal]").append(
      $("<option>", {
        value: item.hospitalCode,
        text: item.hospitalDesc,
      })
    );
  });

  $.each(dutyScheduleStatusMastersForUserUpdate, function (i, item) {
    $("select[name=statusCodeModal]").append(
      $("<option>", {
        value: item.statusCode,
        text: item.statusDesc,
      })
    );
  });

  $("#dutyDateEditModal")
    .datepicker({
      format: "dd/mm/yyyy",
      autoclose: true,
      todayHighlight: true,
      todayBtn: true,
    })
    .datepicker("setDate", new Date());
};

$("#hospitalCodeEditModal").on("change", function () {
  $("#locationCodeEditModal")
    .empty()
    .append("<option selected disabled hidden>กรุณาเลือก</option>");

  $("#departmentCode1EditModal")
    .empty()
    .append("<option selected disabled hidden>กรุณาเลือก</option>");

  $("#departmentCode2EditModal")
    .empty()
    .append("<option selected disabled hidden>กรุณาเลือก</option>");

  $("#departmentCode31EditModal")
    .empty()
    .append("<option selected disabled hidden>กรุณาเลือก</option>");

  $.each(locationMaster, function (i, item) {
    $("select[name=locationCodeEditModal]").append(
      $("<option>", {
        value: item.locationCode,
        text: item.locationDesc,
      })
    );
  });
});
$("#locationCodeEditModal").on("change", function () {
  $("#departmentCode1EditModal")
    .empty()
    .append("<option selected disabled hidden>กรุณาเลือก</option>");

  $("#departmentCode2EditModal")
    .empty()
    .append("<option selected disabled hidden>กรุณาเลือก</option>");

  $("#departmentCode3EditModal")
    .empty()
    .append("<option selected disabled hidden>กรุณาเลือก</option>");

  let changeDepartment = departmentMaster.filter(
    (e) =>
      e.hospitalCode == $("#hospitalCodeEditModal").val() &&
      e.locationCode == $("#locationCodeEditModal").val()
  );

  $.each(changeDepartment, function (i, item) {
    $("select[name=departmentCode1EditModal]").append(
      $("<option>", {
        value: item.departmentCode,
        text: item.departmentDesc,
      })
    );
  });

  $.each(changeDepartment, function (i, item) {
    $("select[name=departmentCode2EditModal]").append(
      $("<option>", {
        value: item.departmentCode,
        text: item.departmentDesc,
      })
    );
  });

  $.each(changeDepartment, function (i, item) {
    $("select[name=departmentCode3EditModal]").append(
      $("<option>", {
        value: item.departmentCode,
        text: item.departmentDesc,
      })
    );
  });
});

// $("#addSchedule").on("click", function () {
//   $("#dutyDateModal")
//     .datepicker({
//       format: "dd/mm/yyyy",
//       autoclose: true,
//       todayHighlight: true,
//       todayBtn: true,
//     })
//     .datepicker("setDate", new Date());

//   //   $("#shiftStartModal").val("12:16");

//   $("#addScheduleModal").modal();
// });

$("#addScheduleBtnModal").on("click", function () {
  let dutyDate = $("#dutyDateModal").val();
  let shiftStart = $("#shiftStartModal").val();
  let shiftEnd = $("#shiftEndModal").val();
  let hospitalCode = parseInt($("#hospitalCodeModal").val());
  let locationCode = parseInt($("#locationCodeModal").val());
  let departmentCode1 = parseInt($("#departmentCode1Modal").val());
  let departmentCode2 = parseInt($("#departmentCode2Modal").val());
  let departmentCode3 = parseInt($("#departmentCode3Modal").val());
  let remark = $("#remarkModal").val();

  let objadddata = {
    dutyDate: dutyDate,
    shiftStart: shiftStart,
    shiftEnd: shiftEnd,
    hospitalCode: hospitalCode,
    locationCode: locationCode,
    departmentCode1: departmentCode1,
    departmentCode2: departmentCode2,
    departmentCode3: departmentCode3,
    remark: remark,
  };

  if (objadddata["hospitalCode"] == "" || objadddata["hospitalCode"] == null) {
    // modal
    //   .find(`.div-input-hospitalCodeModal .custom-select`)
    //   .addClass(isInvalidClass);
    // modal
    //   .find(`.div-input-hospitalCodeModal .${validationErrorMessageClass}`)
    //   .html(`กรุณาระบุ`);
    return;
  }

  let listObj = [];
  listObj.push(objadddata);
  //   console.log(listObj);
  CreateDatatable.addData(listObj);

  $("#addScheduleModal").modal("hide");
});

// $("#submit").on("click", function () {
//   let data = CreateDatatable.getData();
//   //   console.log("submit: ", data);

//   let objData = {
//     dutyScheduleList: data,
//   };

//   $.ajax({
//     url: link + "/api/dutySchedule/create",
//     type: "POST",
//     data: JSON.stringify(objData),
//     contentType: "application/json; charset=utf-8",
//     dataType: "json",
//     success: function (res) {
//       if (res.status.code == 200) {
//         toastr.success("บันทึกสำเร็จ");
//       } else {
//         toastr.error(res.status.message);
//       }
//     },
//     error: function (res) {
//       toastr.error("ไม่สามารถบันทึกได้");
//     },
//   });
// });

$("#sidebarToggle").on("click", function () {
  CreateDatatable.adjust();
});

$("#addSchedule").on("click", function () {
  LoadDutySchedule();
});

let CreateDatatable = (function () {
  let table;
  let currentPage = 0;
  let initTable1 = function () {
    table = $("#dataTable").DataTable({
      //   responsive: false,
      fixedHeader: true,
      responsive: true,
      data: [],
      scrollY: "50vh",
      scrollX: true,
      scrollCollapse: true,
      columns: [
        { data: "", className: "text-center" },
        { data: "dutyDate", className: "text-center" },
        { data: "status", className: "text-center" },
        { data: "approveHospitalCode", className: "text-center" },
        { data: "approveLocationCode", className: "text-center" },
        { data: "approveDepartmentCode", className: "text-center" },
        { data: "approveShiftEnd", className: "text-center" },
        { data: "shiftStart", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "locationCode", className: "text-center" },
        { data: "departmentCode1", className: "text-center" },
        { data: "departmentCode2", className: "text-center" },
        { data: "departmentCode3", className: "text-center" },
        { data: "remark", className: "text-center" },
        { data: "realShiftEnd", className: "text-center" },
        { data: "totalRealDuration", className: "text-center" },
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
          title: "วันเดือนปี",
          render: function (data, type, full, meta) {
            return moment(data).format("DD/MM/YYYY");
          },
        },
        {
          targets: 2,
          title: "สถานะ",
          render: function (data, type, full, meta) {
            return `<a class="btn btn-${dutyScheduleSStatusMap[data].state}" style="width: 90px;">${dutyScheduleSStatusMap[data].desc}</a>`;
          },
        },
        {
          targets: 3,
          title: "โรงพยาบาลที่อนุมัติ",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : hospitalMap.get(data).hospitalDesc;
          },
        },
        {
          targets: 4,
          title: "Locationที่อนุมัติ",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : locationMap.get(data).locationDesc;
          },
        },
        {
          targets: 5,
          title: "แผนกที่อนุมัติ",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 6,
          title: "ช่วงเวลาที่อนุมัติ",
          render: function (data, type, full, meta) {
            return full.approveShiftStart == null
              ? "-"
              : full.approveShiftStart + "-" + full.approveShiftEnd;
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
          title: "โรงพยาบาล",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : hospitalMap.get(data).hospitalDesc;
          },
        },
        {
          targets: 9,
          title: "Location",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : locationMap.get(data).locationDesc;
          },
        },
        {
          targets: 10,
          title: "แผนกลำดับที่ 1",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 11,
          title: "แผนกลำดับที่ 2",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 12,
          title: "แผนกลำดับที่ 3",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 13,
          title: "หมายเหตุ",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 14,
          title: "ช่วงเวลาที่เข้างาน",
          render: function (data, type, full, meta) {
            return full.realShiftStart == null
              ? "-"
              : full.realShiftStart + "-" + full.realShiftEnd;
          },
        },
        {
          targets: 15,
          title: "จำนวนชั่วโมงที่เข้างาน",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 16,
          title: "แก้ไข",
          render: function (data, type, full, meta) {
            return full.status == dutyScheduleSStatusConstant.Wait
              ? `<a class="btn btn-outline-dark btn-circle btn-sm edit-button" id="addEducation"><i class="fas fa-pencil-alt"></i></a>`
              : "-";
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
        // let contractNo = $(this).attr("contractNo");
        let rowIndex = table.row($(this).closest("tr")).index();
        let data = table.row($(this).closest("tr")).data();
        currentRow = $(this).closest("tr");
        currentDutyScheduleId = data.dutyScheduleId;

        $("#dutyDateEditModal")
          .val(
            isDateTime(data.dutyDate)
              ? moment(data.dutyDate).format("DD/MM/YYYY")
              : data.dutyDate
          )
          .change();
        $("#shiftStartEditModal").val(data.shiftStart);
        $("#shiftEndEditModal").val(data.shiftEnd);
        $("#hospitalCodeEditModal").val(data.hospitalCode).change();
        $("#locationCodeEditModal").val(data.locationCode).change();
        $("#departmentCode1EditModal").val(data.departmentCode1).change();
        $("#departmentCode2EditModal").val(data.departmentCode2).change();
        $("#departmentCode3EditModal").val(data.departmentCode3).change();
        $("#remarkEditModal").val(data.remark);
        $("#statusCodeModal").val(data.status);

        $("#editScheduleModal").modal();
      });

      $("#editScheduleBtnModal").on("click", function () {
        let dutyDate = $("#dutyDateEditModal").val();
        let shiftStart = $("#shiftStartEditModal").val();
        let shiftEnd = $("#shiftEndEditModal").val();
        let hospitalCode = parseInt($("#hospitalCodeEditModal").val());
        let locationCode = parseInt($("#locationCodeEditModal").val());
        let departmentCode1 = parseInt($("#departmentCode1EditModal").val());
        let departmentCode2 = parseInt($("#departmentCode2EditModal").val());
        let departmentCode3 = parseInt($("#departmentCode3EditModal").val());
        let remark = $("#remarkEditModal").val();
        let status = $("#statusCodeModal").val();

        let objadddata = {
          dutyDate: dutyDate,
          shiftStart: shiftStart,
          shiftEnd: shiftEnd,
          hospitalCode: hospitalCode,
          locationCode: locationCode,
          departmentCode1: departmentCode1,
          departmentCode2: departmentCode2,
          departmentCode3: departmentCode3,
          remark: remark,
          dutyScheduleId: currentDutyScheduleId,
          status: status,
        };
        isValidate = 0;

        if (objadddata["dutyDate"] == "" || objadddata["dutyDate"] == null) {
          modalEdit
            .find(`.div-input-dutyDateEditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-dutyDateEditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ`);
          isValidate = 1;
        } else {
          $(`.div-input-dutyDateEditModal .form-control`).removeClass(
            isInvalidClass
          );
        }

        if (
          objadddata["shiftStart"] == "" ||
          objadddata["shiftStart"] == null
        ) {
          modalEdit
            .find(`.div-input-shiftStartEditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-shiftStartEditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ`);
          isValidate = 1;
        } else {
          $(`.div-input-shiftStartEditModal .form-control`).removeClass(
            isInvalidClass
          );
        }

        if (objadddata["shiftEnd"] == "" || objadddata["shiftEnd"] == null) {
          modalEdit
            .find(`.div-input-shiftEndEditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-shiftEndEditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ`);
          isValidate = 1;
        } else {
          $(`.div-input-shiftEndEditModal .form-control`).removeClass(
            isInvalidClass
          );
        }

        if (
          objadddata["hospitalCode"] == "" ||
          objadddata["hospitalCode"] == null ||
          isNaN(objadddata["hospitalCode"])
        ) {
          modalEdit
            .find(`.div-input-hospitalCodeEditModal .custom-select`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-hospitalCodeEditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ`);

          isValidate = 1;
        } else {
          $(`.div-input-hospitalCodeEditModal .custom-select`).removeClass(
            isInvalidClass
          );
        }

        if (
          objadddata["locationCode"] == "" ||
          objadddata["locationCode"] == null ||
          isNaN(objadddata["locationCode"])
        ) {
          modalEdit
            .find(`.div-input-locationCodeEditModal .custom-select`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-locationCodeEditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ`);

          isValidate = 1;
        } else {
          $(`.div-input-locationCodeEditModal .custom-select`).removeClass(
            isInvalidClass
          );
        }

        if (
          objadddata["departmentCode1"] == "" ||
          objadddata["departmentCode1"] == null ||
          isNaN(objadddata["departmentCode1"])
        ) {
          modalEdit
            .find(`.div-input-departmentCode1EditModal .custom-select`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-departmentCode1EditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ`);

          isValidate = 1;
        } else {
          $(`.div-input-departmentCode1EditModal .custom-select`).removeClass(
            isInvalidClass
          );
        }

        if (isValidate == 1) {
          return;
        }

        console.log(objadddata);

        // table.row(currentRow).data(objadddata).draw();
        let listObj = [];
        listObj.push(objadddata);

        let objData = {
          userId: userData.userId,
          dutyScheduleList: listObj,
        };

        $.ajax({
          url: link + "/api/dutySchedule/update",
          type: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          data: JSON.stringify(objData),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function (res) {
            if (res.status.code == 200) {
              toastr.success("แก้ไขรายการสำเร็จ");
              $("#editScheduleModal").modal("hide");
              LoadDutySchedule();
            } else {
              toastr.error(res.status.message);
            }
          },
          error: function (res) {
            toastr.error("ไม่สามารถแก้ไขรายการได้");
          },
        });
        // $("#editScheduleModal").modal("hide");
      });
    },
    data: function (data) {
      table.clear();
      table.rows.add(data);
      table.draw();
    },
    addData: function (data) {
      //   table.clear();
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

let LoadDutySchedule = function () {
  let objData = {
    dutyDate: $("#beginDate").val(),
    status: $("#statusCode").val(),
  };
  $.ajax({
    url: link + "/api/dutySchedule/searchDutyScheduleForDutyScheduleFormTable",
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
      toastr.error("ไม่สามารถดึงข้อมูลตารางเวรได้");
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
