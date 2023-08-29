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
let positionMap = new Map();
let positionMaster;
let currentRow;
let currentDutyScheduleId;

let approveStatusMasters = [
  { statusCode: 0, statusDesc: "ยังไม่อนุมัติ" },
  { statusCode: 1, statusDesc: "อนุมัติแล้ว" },
];

let userLevelMaster = [
  { userLevelCode: 1, userLevelDesc: "1" },
  { userLevelCode: 2, userLevelDesc: "2" },
];

let approveStatusMap = {
  0: { desc: "ยังไม่อนุมัติ", state: "secondary" },
  1: { desc: "อนุมัติแล้ว", state: "success" },
};

let dutyScheduleStatusMasters = [
  { statusCode: "N", statusDesc: "Normal" },
  { statusCode: "A", statusDesc: "Approve" },
  { statusCode: "C", statusDesc: "Cancel" },
  { statusCode: "O", statusDesc: "Off" },
];

let dutyScheduleSStatusMap = {
  N: { desc: "Normal", state: "secondary" },
  A: { desc: "Approve", state: "success" },
  C: { desc: "Cancel", state: "danger" },
  O: { desc: "Off", state: "warning" },
  null: { desc: "New", state: "primary" },
};

let dutyScheduleSStatusConstant = {
  Normal: "N",
  Approve: "A",
  Cancel: "C",
  Off: "O",
};

let dutyScheduleStatusMastersForUserUpdate = [
  { statusCode: "N", statusDesc: "Normal" },
  //   { statusCode: "A", statusDesc: "Approve" },
  { statusCode: "C", statusDesc: "Cancel" },
  //   { statusCode: "O", statusDesc: "Off" },
];

let userRoleMasters = [
  { userRoleCode: "U", userRoleDesc: "User" },
  { userRoleCode: "A", userRoleDesc: "Admin" },
  { userRoleCode: "D", userRoleDesc: "Department" },
];

let userRoleMap = {
  U: { desc: "User", state: "secondary" },
  A: { desc: "Admin", state: "success" },
  D: { desc: "Department", state: "danger" },
  // null: { desc: "New", state: "primary" },
};

let userRoleConstant = {
  User: "U",
  Admin: "A",
  Department: "D",
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
          let userData = res.data;
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
  //   CreateDatatable.adjust();
  LoadDutySchedule();
  $("#beginDate").datepicker({
    format: "dd/mm/yyyy",
    autoclose: true,
    todayHighlight: true,
    todayBtn: true,
  });

  $.each(positionMaster, function (i, item) {
    $("select[name=positionCode]").append(
      $("<option>", {
        value: item.positionCode,
        text: item.positionDesc,
      })
    );
  });

  $.each(userRoleMasters, function (i, item) {
    $("select[name=userRole]").append(
      $("<option>", {
        value: item.userRoleCode,
        text: item.userRoleDesc,
      })
    );
  });
  $.each(approveStatusMasters, function (i, item) {
    $("select[name=statusCode]").append(
      $("<option>", {
        value: item.statusCode,
        text: item.statusDesc,
      })
    );
  });

  $.each(userLevelMaster, function (i, item) {
    $("select[name=userLevelCode]").append(
      $("<option>", {
        value: item.userLevelCode,
        text: item.userLevelDesc,
      })
    );
  });

  $.each(approveStatusMasters, function (i, item) {
    $("select[name=isApprove]").append(
      $("<option>", {
        value: item.statusCode,
        text: item.statusDesc,
      })
    );
  });
};

$("#sidebarToggle").on("click", function () {
  CreateDatatable.adjust();
});

$("#generalSearch").on("click", function () {
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
        { data: "firstName", className: "text-center" },
        { data: "role", className: "text-center" },
        { data: "positionCode", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "locationCode", className: "text-center" },
        { data: "departmentCode", className: "text-center" },
        { data: "active", className: "text-center" },
        { data: "insertDateTime", className: "text-center" },
        { data: "isApprove", className: "text-center" },
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
          title: "ชื่อ",
          render: function (data, type, full, meta) {
            return (
              full.firstName +
              " " +
              (full.lastName == null ? "" : full.lastName)
            );
          },
        },
        {
          targets: 2,
          title: "UserRole",
          render: function (data, type, full, meta) {
            return userRoleMap[data].desc;
          },
        },
        {
          targets: 3,
          title: "ตำแหน่ง",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data) || data == 0
              ? "-"
              : positionMap.get(data).positionDesc;
          },
        },
        {
          targets: 4,
          title: "โรงพยาบาล",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : hospitalMap.get(data).hospitalDesc;
          },
        },
        {
          targets: 5,
          title: "Location",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : locationMap.get(data).locationDesc;
          },
        },
        {
          targets: 6,
          title: "แผนก",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? "-"
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 7,
          title: "สถานะ",
          render: function (data, type, full, meta) {
            if (data == 0) {
              return `<i class="fa fa-circle"></i>`;
            } else {
              return `<i class="fa fa-circle text-success"></i>`;
            }
          },
        },
        {
          targets: 8,
          title: "วันที่ลงทะเบียน",
          render: function (data, type, full, meta) {
            return isDateTime(data) ? moment(data).format("DD/MM/YYYY") : data;
          },
        },
        {
          targets: 9,
          title: "สถานะการอนุมัติ",
          render: function (data, type, full, meta) {
            return approveStatusMap[data].desc;
          },
        },
        {
          targets: 10,
          title: "แก้ไข",
          render: function (data, type, full, meta) {
            return `<a class="btn btn-outline-dark btn-circle btn-sm edit-button" id="addEducation"><i class="fas fa-pencil-alt"></i></a>`;
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

        console.log(data);
        $("#profileImg").attr(
          "src",
          `https://localhost:7063/api/document/avatar/${data.userId}`
        );

        $("#firstName").html(
          '<strong class="text-gray-900">ชื่อ:  </strong>' +
            data.firstName +
            " " +
            (data.lastName == null ? "" : data.lastName)
        );
        if (data.role == userRoleConstant.User) {
          $("#positionDescModal").html(
            '<strong class="text-gray-900">ตำแหน่ง:  </strong>' +
              positionMap.get(data.positionCode).positionDesc
          );

          $("#email").html(
            '<strong class="text-gray-900">Email:  </strong>' + data.email
          );
          $("#phone").html(
            '<strong class="text-gray-900">โทรศัพท์:  </strong>' + data.phone
          );
          $("#lineId").html(
            '<strong class="text-gray-900">Line ID:  </strong>' + data.lineID
          );
          $("#insertDateTime").html(
            '<strong class="text-gray-900">วันที่ลงทะเบียน:  </strong>' +
              moment(data.insertDateTime).format("DD/MM/YYYY")
          );

          $("#vendorNo").val(data.vendorNo);

          $("#userLevelCode").val(data.userLevelCode);
        }
        $("#isApprove").val(data.isApprove);
        $("#activeStatusEdit").prop("checked", data.active == 0 ? false : true);

        modalEdit.modal();
      });

      $("#editScheduleBtnModal").on("click", function () {
        // $.ajax({
        //   url: "https://localhost:7063/api/dutySchedule/update",
        //   type: "POST",
        //   headers: {
        //     Authorization: "Bearer " + localStorage.getItem("token"),
        //   },
        //   data: JSON.stringify(objData),
        //   contentType: "application/json; charset=utf-8",
        //   dataType: "json",
        //   success: function (res) {
        //     if (res.status.code == 200) {
        //       toastr.success("แก้ไขรายการสำเร็จ");
        //       $("#editScheduleModal").modal("hide");
        //       LoadDutySchedule();
        //     } else {
        //       toastr.error(res.status.message);
        //     }
        //   },
        //   error: function (res) {
        //     toastr.error("ไม่สามารถแก้ไขรายการได้");
        //   },
        // });
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

let LoadDutySchedule = function () {
  let objData = {
    insertDate: $("#beginDate").val(),
    status: parseInt($("#statusCode").val()),
    role: $("#userRole").val(),
    positionCode: parseInt($("#positionCode").val()),
  };
  $.ajax({
    url: "https://localhost:7063/api/User/userManagement",
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
  const timestamp = Date.parse(dutyDate);

  if (!isNaN(timestamp)) {
    return true;
  }

  return false;
};

$("#logoutConfirm").on("click", function () {
  localStorage.clear();
  window.location.href = "login.html";
});
