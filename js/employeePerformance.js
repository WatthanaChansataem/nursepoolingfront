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
let modal = $("#approveModal");
let endDateGlobal;
let startDateGlobal;
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
let educationalQualificationMap = new Map();
let educationalQualificationMaster;
let experienceTypeMap = new Map();
let experienceTypeMaster;

let dutyScheduleStatusConstant = {
  Wait: "N",
  Approve: "A",
  Cancel: "C",
  Off: "O",
};

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
let userData;
let DocumentTypeCode = {
  Other: 0,
  TrainingCourse: 1,
  IDCardCopy: 2,
  ProfessionalLicenseCopy: 3,
  ProfileImg: 4,
};

$(document).ready(function () {
  CreateDatatable.init();
  CreateDatatableDetail.init();
  readURL = function (input) {};

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

  $.each(userLevelMaster, function (i, item) {
    $("select[name=userLevelCode]").append(
      $("<option>", {
        value: item.userLevelCode,
        text: item.userLevelDesc,
      })
    );
  });

  $("#startDate").datepicker({
    format: "dd/mm/yyyy",
    autoclose: true,
    todayHighlight: true,
    todayBtn: true,
  });
  // .datepicker("setDate", new Date());

  $("#endDate").datepicker({
    format: "dd/mm/yyyy",
    autoclose: true,
    todayHighlight: true,
    todayBtn: true,
  });
  // .datepicker("setDate", new Date());

  $.each(approveStatusMasters, function (i, item) {
    $("select[name=isApprove]").append(
      $("<option>", {
        value: item.statusCode,
        text: item.statusDesc,
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

  $.each(locationMaster, function (i, item) {
    $("select[name=locationCodeEditModal]").append(
      $("<option>", {
        value: item.locationCode,
        text: item.locationDesc,
      })
    );
  });

  $.each(departmentMaster, function (i, item) {
    $("select[name=departmentCodeEditModal]").append(
      $("<option>", {
        value: item.departmentCode,
        text: item.departmentDesc,
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
      //   scrollY: "50vh",
      scrollX: true,
      scrollCollapse: true,
      columns: [
        { data: "", className: "text-center" },
        { data: "firstName", className: "text-center" },
        { data: "role", className: "text-center" },
        { data: "positionCode", className: "text-center" },
        { data: "requestNumber", className: "text-center" },
        { data: "approveNumber", className: "text-center" },
        { data: "realNumber", className: "text-center" },
        { data: "offNumber", className: "text-center" },
        { data: "totalDuration", className: "text-center" },
        { data: "totalApproveDuration", className: "text-center" },
        { data: "totalRealDuration", className: "text-center" },
        { data: "totalOFFDuration", className: "text-center" },
        { data: "averageRatingScore", className: "text-center" },
        { data: "active", className: "text-center" },
        { data: "insertDateTime", className: "text-center" },
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
            if (full.role == userRoleConstant.User) {
              return `<a class="" href="profilePreview.html?userId=${
                full.userId
              }" target="_blank">${full.firstName + " " + full.lastName}</a>`;
            } else {
              return full.firstName;
            }
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
          title: "จำนวนเวรที่ขอ",
          render: function (data, type, full, meta) {
            return data == 0
              ? data
              : `<a  class="btn btn-secondary btn-sm display-button" type="request"> ${data}</i></a>`;
          },
        },
        {
          targets: 5,
          title: "จำนวนเวรที่ได้รับบการอนุมัติ",
          render: function (data, type, full, meta) {
            return data == 0
              ? data
              : `<a  class="btn btn-primary btn-sm display-button" type="approve"> ${data}</i></a>`;
          },
        },
        {
          targets: 6,
          title: "จำนวนเวรที่เข้างาน",
          render: function (data, type, full, meta) {
            return data == 0
              ? data
              : `<a  class="btn btn-success btn-sm display-button" type="real"> ${data}</i></a>`;
          },
        },
        {
          targets: 7,
          title: "จำนวนเวรที่OFF",
          render: function (data, type, full, meta) {
            return data == 0
              ? data
              : `<a  class="btn btn-warning btn-sm display-button" type="off"> ${data}</i></a>`;
          },
        },
        {
          targets: 8,
          title: "จำนวนชั่วโมงที่ขอ",
          render: function (data, type, full, meta) {
            return data == "00:00"
              ? data
              : `<a class="btn btn-secondary btn-sm display-button" type="request">${data}</a>`;
          },
        },
        {
          targets: 9,
          title: "จำนวนชั่วโมงที่ได้รับบการอนุมัติ",
          render: function (data, type, full, meta) {
            return data == "00:00"
              ? data
              : `<a class="btn btn-primary btn-sm display-button" type="approve">${data}</a>`;
          },
        },
        {
          targets: 10,
          title: "จำนวนชั่วโมงที่เข้างาน",
          render: function (data, type, full, meta) {
            return data == "00:00"
              ? data
              : `<a class="btn btn-success btn-sm display-button" type="real">${data}</a>`;
          },
        },
        {
          targets: 11,
          title: "จำนวนชั่วโมงที่OFF",
          render: function (data, type, full, meta) {
            return data == "00:00"
              ? data
              : `<a class="btn btn-warning btn-sm display-button" type="off">${data}</a>`;
          },
        },
        {
          targets: 12,
          title: "คะแนนเฉลี่ย",
          render: function (data, type, full, meta) {
            return data;
          },
        },

        {
          targets: 13,
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
          targets: 14,
          title: "วันที่ลงทะเบียน",
          render: function (data, type, full, meta) {
            return isDateTime(data) ? moment(data).format("DD/MM/YYYY") : data;
          },
        },
        {
          targets: 15,
          title: "รายละเอียด",
          render: function (data, type, full, meta) {
            return `<a class="btn btn-outline-dark btn-circle btn-sm edit-button" id="addEducation"><i class="fas fa-info"></i></a>`;
          },
        },
      ],
    });
  };

  return {
    init: function () {
      initTable1();
      let containerTable = $(table.table().container());

      containerTable.on("click", ".display-button", function () {
        let rowIndex = table.row($(this).closest("tr")).index();
        let data = table.row($(this).closest("tr")).data();
        currentRow = $(this).closest("tr");

        loadUserDateForApproveModal($(this).attr("type"), data);
      });

      containerTable.on("click", ".edit-button", function () {
        let rowIndex = table.row($(this).closest("tr")).index();
        let data = table.row($(this).closest("tr")).data();
        currentRow = $(this).closest("tr");
        $("#profileImg").attr(
          "src",
          `${link}/api/document/avatar/${data.userId}`
        );

        $("#firstName").html(
          '<strong class="text-gray-900">ชื่อ:  </strong>' +
            data.firstName +
            " " +
            (data.lastName == null ? "" : data.lastName)
        );

        if (data.role == userRoleConstant.User) {
          $(".adminDis").hide();
          $(".departmentDis").hide();
          $(".userDis").show();

          $("#previewProfile").attr(
            "href",
            "profilePreview.html?userId=" + data.userId
          );
          $("#positionDescModal").html(
            '<strong class="text-gray-900">ตำแหน่ง:  </strong>' +
              positionMap.get(data.positionCode).positionDesc
          );
          $("#lineId").html(
            '<strong class="text-gray-900">Line ID:  </strong>' + data.lineID
          );

          $("#vendorNo").val(data.vendorNo);

          $("#userLevelCode").val(data.userLevelCode);
        }

        if (data.role == userRoleConstant.Department) {
          $(".adminDis").hide();
          $(".userDis").hide();
          $(".departmentDis").show();

          $("#previewProfile").attr("href", "");

          $("#agencyNo").html(
            '<strong class="text-gray-900">รหัสหน่วยงาน:  </strong>' +
              data.agencyNo
          );

          $("#hospitalCodeEditModal").val(data.hospitalCode);
          $("#locationCodeEditModal").val(data.locationCode);
          $("#departmentCodeEditModal").val(data.departmentCode);
        }
        $("#email").html(
          '<strong class="text-gray-900">Email:  </strong>' + data.email
        );
        let contractPerson =
          data.contractPerson == null ? "-" : data.contractPerson;
        $("#contractPerson").html(
          '<strong class="text-gray-900">ชื่อผู้ติดต่อ:  </strong>' +
            contractPerson
        );
        $("#phone").html(
          '<strong class="text-gray-900">โทรศัพท์:  </strong>' + data.phone
        );
        $("#insertDateTime").html(
          '<strong class="text-gray-900">วันที่ลงทะเบียน:  </strong>' +
            moment(data.insertDateTime).format("DD/MM/YYYY")
        );
        $("#isApprove").val(data.isApprove);
        $("#activeStatusEdit").prop("checked", data.active == 0 ? false : true);

        if (data.role == userRoleConstant.Admin) {
          $(".userDis").hide();
          $(".departmentDis").hide();
          $(".adminDis").show();

          $("#adminName").val(data.firstName);
        }

        modalEdit.find("#editScheduleBtnModal").attr("rowIndex", rowIndex);
        $("#editProfile").attr("userId", data.userId);
        modalEdit.modal();
      });

      $("#editScheduleBtnModal").off("click");
      $("#editScheduleBtnModal").on("click", function () {
        let rowIndex = $(this).attr("rowIndex");
        let rowData = table.row(rowIndex).data();
        let objData = {};
        let vendorNo = $("#vendorNo").val();
        let userLevelCode = parseInt($("#userLevelCode").val());
        let isApprove = parseInt($("#isApprove").val());
        let active = $("#activeStatusEdit").is(":checked") ? 1 : 0;
        let hospitalCode = parseInt($("#hospitalCodeEditModal").val());
        let locationCode = parseInt($("#locationCodeEditModal").val());
        let departmentCode = parseInt($("#departmentCodeEditModal").val());

        if (rowData.role == userRoleConstant.User) {
          objData = {
            userId: rowData.userId,
            vendorNo: vendorNo,
            userLevelCode: userLevelCode,
            isApprove: isApprove,
            active: active,
          };
        }

        if (rowData.role == userRoleConstant.Department) {
          objData = {
            userId: rowData.userId,
            hospitalCode: hospitalCode,
            locationCode: locationCode,
            departmentCode: departmentCode,
            isApprove: isApprove,
            active: active,
          };
        }
        if (rowData.role == userRoleConstant.Admin) {
          objData = {
            userId: rowData.userId,
            firstName: $("#adminName").val(),
          };
        }

        console.log(objData);

        Spinner.activateSpinner($("#editScheduleBtnModal"));
        $.ajax({
          url: link + "/api/User/userManagement",
          type: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          data: JSON.stringify(objData),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function (res) {
            if (res.status.code == 200) {
              Spinner.deactivateSpinner($("#editScheduleBtnModal"));
              toastr.success("แก้ไขรายการสำเร็จ");
              $("#editScheduleModal").modal("hide");
              LoadDutySchedule();
            } else {
              toastr.error(res.status.message);
              Spinner.deactivateSpinner($("#editScheduleBtnModal"));
            }
          },
          error: function (res) {
            Spinner.deactivateSpinner($("#editScheduleBtnModal"));
            toastr.error("ไม่สามารถแก้ไขรายการได้");
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

let LoadDutySchedule = function () {
  let objData = {
    insertDate: $("#beginDate").val(),
    startDate: $("#startDate").val(),
    endDate: $("#endDate").val(),
    positionCode: parseInt($("#positionCode").val()),
  };
  endDateGlobal = $("#endDate").val();
  startDateGlobal = $("#startDate").val();
  $.ajax({
    url: link + "/api/dutySchedule/searchForEmployeePerformance",
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

$("#editProfile").on("click", function () {
  let userId = $(this).attr("userId");
  if (userId == userData.userId) {
    $("#changeProfileImage").trigger("click");
  }
});

$("input[name=changeProfileImage]").on("change", function () {
  let changeElement = $("input[name=changeProfileImage]");
  var uploadata = new FormData();
  uploadata.append("documentName", changeElement[0].files[0].name);
  uploadata.append("document", changeElement[0].files[0]);
  uploadata.append("documentTypeCode", DocumentTypeCode.ProfileImg);
  uploadata.append("insertUserId", userData.userId);
  if (changeElement[0].files[0].size > maximumSize) {
    toastr.error("ไฟล์มีขนาดใหญ่เกินไป");
  } else {
    let defer = $.Deferred();
    upLoadFileWithContent(uploadata, defer);
    $.when(defer).done(function (result) {
      if (result) {
        resData = result;
        changeElement.attr("documentId", resData.documentId);
        location.reload();
      }
    });
  }
});

let upLoadFileWithContent = function (uploadFileData, defer) {
  $.ajax({
    url: link + "/api/document/createWithContent",
    method: "POST",
    data: uploadFileData,
    dataType: "json",
    contentType: false,
    processData: false,
    success: function (res) {
      if (res.status.code == 200) {
        toastr.success("บันทึกสำเร็จ");
        $("#editScheduleModal").modal("hide");
        defer.resolve(res.data);
      } else {
        toastr.error(res.status.message);
        defer.resolve(false);
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถบันทึกได้");
      defer.resolve(false);
    },
  });
};

function showPassword() {
  let element = document.getElementById("password");
  if (element.type === "password") {
    element.type = "text";
  } else {
    element.type = "password";
  }
}

var Spinner = (function () {
  let leftInputSpinnerClass =
    "kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--left kt-spinner--input";
  let spinnerClass =
    "kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light";

  return {
    getSpinnerClass: function () {
      return spinnerClass;
    },
    getLeftInputSpinnerClass: function () {
      return leftInputSpinnerClass;
    },
    activateSpinner: function (buttonElement) {
      buttonElement.addClass(spinnerClass);
      buttonElement.prop("disabled", true);
    },
    deactivateSpinner: function (buttonElement) {
      buttonElement.removeClass(spinnerClass);
      buttonElement.prop("disabled", false);
    },
    activateCenterSpinner: function (buttonElement) {
      buttonElement.addClass(centerSpinnerClass);
      buttonElement.prop("disabled", true);
    },
    deactivateCenterSpinner: function (buttonElement) {
      buttonElement.removeClass(centerSpinnerClass);
      buttonElement.prop("disabled", false);
    },
  };
})();

let loadUserDateForApproveModal = function (type, data) {
  let objData = {
    type: type,
    userId: data.userId,
    endDate: endDateGlobal,
    startDate: startDateGlobal,
  };

  $.ajax({
    url: link + "/api/dutySchedule/searchemployeePerformance",
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
        $("#previewProfile").attr(
          "href",
          "profilePreview.html?userId=" + approvalDetaildata.userId
        );
        // $("#dutyDateDisplayModal").html(
        //   moment(approvalDetaildata.dutyDate).format("DD/MM/YYYY")
        // );
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
      // scrollY: "50vh",
      scrollX: true,
      scrollCollapse: true,
      columns: [
        { data: "", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "locationCode", className: "text-center" },
        { data: "departmentCode1", className: "text-center" },
        { data: "departmentCode2", className: "text-center" },
        { data: "departmentCode3", className: "text-center" },
        { data: "shiftStart", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "status", className: "text-center" },
        { data: "adminRemark", className: "text-center" },
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
          title: "ช่วงเวลา",
          render: function (data, type, full, meta) {
            return full.shiftStart + "-" + full.shiftEnd;
          },
        },
        {
          targets: 7,
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
          targets: 8,
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
          targets: 9,
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
          targets: 10,
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
          targets: 11,
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
          targets: 12,
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
        // {
        //   targets: 13,
        //   title: "แก้ไข",
        //   render: function (data, type, full, meta) {
        //     if (
        //       full.status == dutyScheduleStatusConstant.Off ||
        //       full.status == dutyScheduleStatusConstant.Wait ||
        //       full.status == dutyScheduleStatusConstant.Approve
        //     ) {
        //       if (full.isUpdate == false) {
        //         return `<a class="btn btn-outline-dark btn-circle btn-sm edit-button" id="addEducation"><i class="fas fa-pencil-alt"></i></a>`;
        //       } else {
        //         return `
        //         <a class="btn btn-success btn-circle btn-sm confirm-button"><i class="fas fa-check"></i></a>
        //         <a class="btn btn-danger btn-circle btn-sm cancel-button" ><i class="fas fa-times"></i></a>`;
        //       }
        //     } else {
        //       return "-";
        //     }
        //   },
        // },
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
