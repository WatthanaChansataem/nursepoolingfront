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
let currentDutyScheduleRequestId;
let isValidate = 0;
let positionMap = new Map();
let positionMaster;
let userData;

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
          if (userData.role != userRoleConstant.Department) {
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

  $("#dutyDateModal")
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

  $.each(positionMaster, function (i, item) {
    $("select[name=positionCodeModal]").append(
      $("<option>", {
        value: item.positionCode,
        text: item.positionDesc,
      })
    );
  });

  $.each(positionMaster, function (i, item) {
    $("select[name=positionCodeEditModal]").append(
      $("<option>", {
        value: item.positionCode,
        text: item.positionDesc,
      })
    );
  });

  //   $.each(dutyScheduleStatusMastersForUserUpdate, function (i, item) {
  //     $("select[name=statusCodeModal]").append(
  //       $("<option>", {
  //         value: item.statusCode,
  //         text: item.statusDesc,
  //       })
  //     );
  //   });

  $("#dutyDateEditModal")
    .datepicker({
      format: "dd/mm/yyyy",
      autoclose: true,
      todayHighlight: true,
      todayBtn: true,
    })
    .datepicker("setDate", new Date());

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
    $("select[name=departmentCodeModal]").append(
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

  $("#navHospitalCode").html(
    hospitalMap.get(userData.hospitalCode).hospitalDesc
  );

  $("#navLocationCode").html(
    locationMap.get(userData.locationCode).locationDesc
  );

  $("#navDepartmentCode").html(
    departmentMap.get(userData.departmentCode).departmentDesc
  );
  LoadDutyScheduleRequest();
};

$("#generalSearch").on("click", function () {
  LoadDutyScheduleRequest();
});

$("#addSchedule").on("click", function () {
  $(`.div-input-dutyDateModal .form-control`).removeClass(isInvalidClass);
  $(`.div-input-positionCodeModal .custom-select`).removeClass(isInvalidClass);

  $("#addScheduleModal").modal();
});

$("#addScheduleBtnModal").on("click", function () {
  let dutyDate = $("#dutyDateModal").val();
  let hospitalCode = parseInt($("#hospitalCodeModal").val());
  let locationCode = parseInt($("#locationCodeModal").val());
  let departmentCode = parseInt($("#departmentCodeModal").val());
  let positionCode = parseInt($("#positionCodeModal").val());
  let requestNumber1 = parseInt($("#requestNumber1Modal").val());
  let requestNumber2 = parseInt($("#requestNumber2Modal").val());
  let requestNumber3 = parseInt($("#requestNumber3Modal").val());
  let requestNumber4 = parseInt($("#requestNumber4Modal").val());
  let requestNumber5 = parseInt($("#requestNumber5Modal").val());
  let requestNumber6 = parseInt($("#requestNumber6Modal").val());
  let requestNumber7 = parseInt($("#requestNumber7Modal").val());
  let requestNumber8 = parseInt($("#requestNumber8Modal").val());
  let shiftStart = $("#shiftStartModal").val();
  let shiftEnd = $("#shiftEndModal").val();
  let requestNumberOther = parseInt($("#requestNumberOtherModal").val());
  let remark = $("#remarkModal").val();
  let active = $("#activeStatus").is(":checked") ? 1 : 0;

  let objadddata = {
    dutyDate: dutyDate,
    hospitalCode: hospitalCode,
    locationCode: locationCode,
    departmentCode: departmentCode,
    positionCode: positionCode,
    requestNumber1: requestNumber1,
    requestNumber2: requestNumber2,
    requestNumber3: requestNumber3,
    requestNumber4: requestNumber4,
    requestNumber5: requestNumber5,
    requestNumber6: requestNumber6,
    requestNumber7: requestNumber7,
    requestNumber8: requestNumber8,
    shiftStart: shiftStart,
    shiftEnd: shiftEnd,
    requestNumberOther: requestNumberOther,
    remark: remark,
    active: active,
  };
  console.log(objadddata);
  isValidate = 0;

  if (objadddata["dutyDate"] == "" || objadddata["dutyDate"] == null) {
    modal
      .find(`.div-input-dutyDateModal .form-control`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-dutyDateModal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ`);
    isValidate = 1;
  } else {
    $(`.div-input-dutyDateModal .form-control`).removeClass(isInvalidClass);
  }

  if (
    objadddata["positionCode"] == "" ||
    objadddata["positionCode"] == null ||
    isNaN(objadddata["positionCode"])
  ) {
    modal
      .find(`.div-input-positionCodeModal .custom-select`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-positionCodeModal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ`);

    isValidate = 1;
  } else {
    $(`.div-input-positionCodeModal .custom-select`).removeClass(
      isInvalidClass
    );
  }

  if (
    objadddata["hospitalCode"] == "" ||
    objadddata["hospitalCode"] == null ||
    isNaN(objadddata["hospitalCode"])
  ) {
    modal
      .find(`.div-input-hospitalCodeModal .custom-select`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-hospitalCodeModal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ`);

    isValidate = 1;
  } else {
    $(`.div-input-hospitalCodeModal .custom-select`).removeClass(
      isInvalidClass
    );
  }

  if (
    objadddata["locationCode"] == "" ||
    objadddata["locationCode"] == null ||
    isNaN(objadddata["locationCode"])
  ) {
    modal
      .find(`.div-input-locationCodeModal .custom-select`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-locationCodeModal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ`);

    isValidate = 1;
  } else {
    $(`.div-input-locationCodeModal .custom-select`).removeClass(
      isInvalidClass
    );
  }

  if (
    objadddata["departmentCode"] == "" ||
    objadddata["departmentCode"] == null ||
    isNaN(objadddata["departmentCode"])
  ) {
    modal
      .find(`.div-input-departmentCodeModal .custom-select`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-departmentCodeModal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ`);

    isValidate = 1;
  } else {
    $(`.div-input-departmentCodeModal .custom-select`).removeClass(
      isInvalidClass
    );
  }

  if (
    objadddata["requestNumber1"] < 0 ||
    objadddata["requestNumber1"] == null ||
    isNaN(objadddata["requestNumber1"])
  ) {
    modal
      .find(`.div-input-requestNumber1Modal .form-control`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-requestNumber1Modal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ และต้องไม่ติดลบ`);
    isValidate = 1;
  } else {
    modal
      .find(`.div-input-requestNumber1Modal .form-control`)
      .removeClass(isInvalidClass);
  }

  if (
    objadddata["requestNumber2"] < 0 ||
    objadddata["requestNumber2"] == null ||
    isNaN(objadddata["requestNumber2"])
  ) {
    modal
      .find(`.div-input-requestNumber2Modal .form-control`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-requestNumber2Modal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ และต้องไม่ติดลบ`);
    isValidate = 1;
  } else {
    modal
      .find(`.div-input-requestNumber2Modal .form-control`)
      .removeClass(isInvalidClass);
  }

  if (
    objadddata["requestNumber3"] < 0 ||
    objadddata["requestNumber3"] == null ||
    isNaN(objadddata["requestNumber3"])
  ) {
    modal
      .find(`.div-input-requestNumber3Modal .form-control`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-requestNumber3Modal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ และต้องไม่ติดลบ`);
    isValidate = 1;
  } else {
    modal
      .find(`.div-input-requestNumber3Modal .form-control`)
      .removeClass(isInvalidClass);
  }

  if (
    objadddata["requestNumber4"] < 0 ||
    objadddata["requestNumber4"] == null ||
    isNaN(objadddata["requestNumber4"])
  ) {
    modal
      .find(`.div-input-requestNumber4Modal .form-control`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-requestNumber4Modal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ และต้องไม่ติดลบ`);
    isValidate = 1;
  } else {
    modal
      .find(`.div-input-requestNumber4Modal .form-control`)
      .removeClass(isInvalidClass);
  }

  if (
    objadddata["requestNumber5"] < 0 ||
    objadddata["requestNumber5"] == null ||
    isNaN(objadddata["requestNumber5"])
  ) {
    modal
      .find(`.div-input-requestNumber5Modal .form-control`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-requestNumber5Modal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ และต้องไม่ติดลบ`);
    isValidate = 1;
  } else {
    modal
      .find(`.div-input-requestNumber5Modal .form-control`)
      .removeClass(isInvalidClass);
  }

  if (
    objadddata["requestNumber6"] < 0 ||
    objadddata["requestNumber6"] == null ||
    isNaN(objadddata["requestNumber6"])
  ) {
    modal
      .find(`.div-input-requestNumber6Modal .form-control`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-requestNumber6Modal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ และต้องไม่ติดลบ`);
    isValidate = 1;
  } else {
    modal
      .find(`.div-input-requestNumber6Modal .form-control`)
      .removeClass(isInvalidClass);
  }

  if (
    objadddata["requestNumber7"] < 0 ||
    objadddata["requestNumber7"] == null ||
    isNaN(objadddata["requestNumber7"])
  ) {
    modal
      .find(`.div-input-requestNumber7Modal .form-control`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-requestNumber7Modal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ และต้องไม่ติดลบ`);
    isValidate = 1;
  } else {
    modal
      .find(`.div-input-requestNumber7Modal .form-control`)
      .removeClass(isInvalidClass);
  }

  if (
    objadddata["requestNumber8"] < 0 ||
    objadddata["requestNumber8"] == null ||
    isNaN(objadddata["requestNumber8"])
  ) {
    modal
      .find(`.div-input-requestNumber8Modal .form-control`)
      .addClass(isInvalidClass);
    modal
      .find(`.div-input-requestNumber8Modal .${validationErrorMessageClass}`)
      .html(`กรุณาระบุ และต้องไม่ติดลบ`);
    isValidate = 1;
  } else {
    modal
      .find(`.div-input-requestNumber8Modal .form-control`)
      .removeClass(isInvalidClass);
  }

  if (isValidate == 1) {
    return;
  }

  //   let listObj = [];
  //   listObj.push(objadddata);
  //   CreateDatatable.addData(listObj);

  //   let objData = {
  //     dutyScheduleList: listObj,
  //   };

  $.ajax({
    url: "https://localhost:7063/api/dutyScheduleRequest/create",
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: JSON.stringify(objadddata),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        toastr.success("บันทึกสำเร็จ");
        $("#addScheduleModal").modal("hide");
        LoadDutyScheduleRequest();
      } else {
        toastr.error(res.status.message);
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถบันทึกได้");
    },
  });
});

// $("#submit").off("click");
// $("#submit").on("click", function () {
//   let data = CreateDatatable.getData().filter((e) => e.status == null);
//   if (data.length > 0) {
//     let objData = {
//       dutyScheduleList: data,
//     };

//     $.ajax({
//       url: "https://localhost:7063/api/dutySchedule/create",
//       type: "POST",
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("token"),
//       },
//       data: JSON.stringify(objData),
//       contentType: "application/json; charset=utf-8",
//       dataType: "json",
//       success: function (res) {
//         if (res.status.code == 200) {
//           LoadDutyScheduleRequest();
//           toastr.success("บันทึกสำเร็จ");
//         } else {
//           toastr.error(res.status.message);
//         }
//       },
//       error: function (res) {
//         toastr.error("ไม่สามารถบันทึกได้");
//       },
//     });
//   } else {
//     toastr.error("ไม่พบรายการเวรใหม่");
//   }
// });

// $("#hospitalCode").on("change", function () {
//   LoadDutyScheduleRequest();
// });
// $("#locationCode").on("change", function () {
//   LoadDutyScheduleRequest();
// });
// $("#departmentCode").on("change", function () {
//   LoadDutyScheduleRequest();
// });
// $("#positionCode").on("change", function () {
//   LoadDutyScheduleRequest();
// });
// $("#beginDate").on("change", function () {
//   LoadDutyScheduleRequest();
// });

$("#sidebarToggle").on("click", function () {
  CreateDatatable.adjust();
});

$("#locationCodeModal").on("change", function () {
  $("#timeDiv").show();
  if ($(this).val() == locationCodeConstant.OPD) {
    modal.find(`.ipd_div .form-control`).val(0);
    $(".ipd_div").hide();
    $(".opd_div").show();
  } else if ($(this).val() == locationCodeConstant.IPD) {
    $(".ipd_div").show();
    modal.find(`.opd_div .form-control`).val(0);
    $(".opd_div").hide();
  } else {
    $(".opd_div").show();
    $(".ipd_div").show();
  }
});

$("#locationCodeEditModal").on("change", function () {
  //   console.log("change");
  // $("#timeDiv").show();
  if ($(this).val() == locationCodeConstant.OPD) {
    $("#editScheduleModal").find(`.ipd_editdiv .form-control`).val(0);
    $(".ipd_editdiv").hide();
    $(".opd_editdiv").show();
  } else if ($(this).val() == locationCodeConstant.IPD) {
    $(".ipd_editdiv").show();
    $("#editScheduleModal").find(`.opd_editdiv .form-control`).val(0);
    $(".opd_editdiv").hide();
  } else {
    $(".opd_editdiv").show();
    $(".ipd_editdiv").show();
  }
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
        { data: "dutyDate", className: "text-center" },
        { data: "hospitalCode", className: "text-center" },
        { data: "locationCode", className: "text-center" },
        { data: "departmentCode", className: "text-center" },
        { data: "positionCode", className: "text-center" },
        { data: "requestNumber1", className: "text-center" },
        { data: "requestNumber2", className: "text-center" },
        { data: "requestNumber3", className: "text-center" },
        { data: "requestNumber4", className: "text-center" },
        { data: "requestNumber5", className: "text-center" },
        { data: "requestNumber6", className: "text-center" },
        { data: "requestNumber7", className: "text-center" },
        { data: "requestNumber8", className: "text-center" },
        { data: "positionCode", className: "text-center" },
        { data: "active", className: "text-center" },
        { data: "remark", className: "text-center" },
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
            return isDateTime(data) ? moment(data).format("DD/MM/YYYY") : data;
          },
        },
        {
          targets: 2,
          title: "โรงพยาบาล",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : hospitalMap.get(data).hospitalDesc;
          },
        },
        {
          targets: 3,
          title: "Location",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : locationMap.get(data).locationDesc;
          },
        },
        {
          targets: 4,
          title: "แผนก",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : departmentMap.get(data).departmentDesc;
          },
        },
        {
          targets: 5,
          title: "ตำแหน่ง",
          render: function (data, type, full, meta) {
            return data == null || isNaN(data)
              ? ""
              : positionMap.get(data).positionDesc;
          },
        },
        {
          targets: 6,
          title: "07.00-15.00",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 7,
          title: "15.00-23.00",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 8,
          title: "23.00-07.00",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 9,
          title: "07.00-19.00",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 10,
          title: "19.00-07.00",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 11,
          title: "08.00-16.00",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 12,
          title: "08.00-20.00",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 13,
          title: "09.00-17.00",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 14,
          title: "อื่นๆ",
          render: function (data, type, full, meta) {
            return (
              full.shiftStart +
              "-" +
              full.shiftEnd +
              ": " +
              full.requestNumberOther
            );
          },
        },

        {
          targets: 15,
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
          targets: 16,
          title: "หมายเหตุ",
          render: function (data, type, full, meta) {
            return data;
          },
        },
        {
          targets: 17,
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
        currentDutyScheduleRequestId = data.dutyScheduleRequestId;
        $("#dutyDateEditModal")
          .val(
            isDateTime(data.dutyDate)
              ? moment(data.dutyDate).format("DD/MM/YYYY")
              : data.dutyDate
          )
          .change();
        $("#hospitalCodeEditModal").val(data.hospitalCode);
        $("#locationCodeEditModal").val(data.locationCode).trigger("change");
        $("#departmentCodeEditModal").val(data.departmentCode);
        $("#positionCodeEditModal").val(data.positionCode);
        $("#requestNumber1EditModal").val(data.requestNumber1);
        $("#requestNumber1EditModal").attr(
          "dutyScheduleRequestItemId1",
          data.dutyScheduleRequestItemId1
        );
        $("#requestNumber2EditModal").val(data.requestNumber2);
        $("#requestNumber2EditModal").attr(
          "dutyScheduleRequestItemId2",
          data.dutyScheduleRequestItemId2
        );
        $("#requestNumber3EditModal").val(data.requestNumber3);
        $("#requestNumber3EditModal").attr(
          "dutyScheduleRequestItemId3",
          data.dutyScheduleRequestItemId3
        );
        $("#requestNumber4EditModal").val(data.requestNumber4);
        $("#requestNumber4EditModal").attr(
          "dutyScheduleRequestItemId4",
          data.dutyScheduleRequestItemId4
        );
        $("#requestNumber5EditModal").val(data.requestNumber5);
        $("#requestNumber5EditModal").attr(
          "dutyScheduleRequestItemId5",
          data.dutyScheduleRequestItemId5
        );
        $("#requestNumber6EditModal").val(data.requestNumber6);
        $("#requestNumber6EditModal").attr(
          "dutyScheduleRequestItemId6",
          data.dutyScheduleRequestItemId6
        );
        $("#requestNumber7EditModal").val(data.requestNumber7);
        $("#requestNumber7EditModal").attr(
          "dutyScheduleRequestItemId7",
          data.dutyScheduleRequestItemId7
        );
        $("#requestNumber8EditModal").val(data.requestNumber8);
        $("#requestNumber8EditModal").attr(
          "dutyScheduleRequestItemId8",
          data.dutyScheduleRequestItemId8
        );
        $("#shiftStartEditModal").val(data.shiftStart);
        $("#shiftStartEditModal").val(data.shiftStart);
        $("#shiftEndEditModal").val(data.shiftEnd);
        $("#requestNumberOtherEditModal").val(data.requestNumberOther);
        $("#requestNumberOtherEditModal").attr(
          "dutyScheduleRequestItemIdOther",
          data.dutyScheduleRequestItemIdOther
        );
        $("#remarkEditModal").val(data.remark);
        $("#activeStatusEdit").prop("checked", data.active == 0 ? false : true);
        $("#editScheduleModal").modal();
      });

      $("#editScheduleBtnModal").on("click", function () {
        let dutyDate = $("#dutyDateEditModal").val();
        let hospitalCode = parseInt($("#hospitalCodeEditModal").val());
        let locationCode = parseInt($("#locationCodeEditModal").val());
        let departmentCode = parseInt($("#departmentCodeEditModal").val());
        let positionCode = parseInt($("#positionCodeEditModal").val());
        let requestNumber1 = parseInt($("#requestNumber1EditModal").val());
        let requestNumber2 = parseInt($("#requestNumber2EditModal").val());
        let requestNumber3 = parseInt($("#requestNumber3EditModal").val());
        let requestNumber4 = parseInt($("#requestNumber4EditModal").val());
        let requestNumber5 = parseInt($("#requestNumber5EditModal").val());
        let requestNumber6 = parseInt($("#requestNumber6EditModal").val());
        let requestNumber7 = parseInt($("#requestNumber7EditModal").val());
        let requestNumber8 = parseInt($("#requestNumber8EditModal").val());
        let shiftStart = $("#shiftStartEditModal").val();
        let shiftEnd = $("#shiftEndEditModal").val();
        let requestNumberOther = parseInt(
          $("#requestNumberOtherEditModal").val()
        );
        let remark = $("#remarkEditModal").val();
        let active = $("#activeStatusEdit").is(":checked") ? 1 : 0;

        let dutyScheduleRequestItemId1 = parseInt(
          $("#requestNumber1EditModal").attr("dutyScheduleRequestItemId1")
        );
        let dutyScheduleRequestItemId2 = parseInt(
          $("#requestNumber2EditModal").attr("dutyScheduleRequestItemId2")
        );
        let dutyScheduleRequestItemId3 = parseInt(
          $("#requestNumber3EditModal").attr("dutyScheduleRequestItemId3")
        );
        let dutyScheduleRequestItemId4 = parseInt(
          $("#requestNumber4EditModal").attr("dutyScheduleRequestItemId4")
        );
        let dutyScheduleRequestItemId5 = parseInt(
          $("#requestNumber5EditModal").attr("dutyScheduleRequestItemId5")
        );
        let dutyScheduleRequestItemId6 = parseInt(
          $("#requestNumber6EditModal").attr("dutyScheduleRequestItemId6")
        );
        let dutyScheduleRequestItemId7 = parseInt(
          $("#requestNumber7EditModal").attr("dutyScheduleRequestItemId7")
        );
        let dutyScheduleRequestItemId8 = parseInt(
          $("#requestNumber8EditModal").attr("dutyScheduleRequestItemId8")
        );
        let dutyScheduleRequestItemIdOther = parseInt(
          $("#requestNumberOtherEditModal").attr(
            "dutyScheduleRequestItemIdOther"
          )
        );
        let objadddata = {
          dutyDate: dutyDate,
          hospitalCode: hospitalCode,
          locationCode: locationCode,
          departmentCode: departmentCode,
          positionCode: positionCode,
          requestNumber1: requestNumber1,
          requestNumber2: requestNumber2,
          requestNumber3: requestNumber3,
          requestNumber4: requestNumber4,
          requestNumber5: requestNumber5,
          requestNumber6: requestNumber6,
          requestNumber7: requestNumber7,
          requestNumber8: requestNumber8,
          shiftStart: shiftStart,
          shiftEnd: shiftEnd,
          requestNumberOther: requestNumberOther,
          remark: remark,
          dutyScheduleRequestId: currentDutyScheduleRequestId,
          active: active,
          dutyScheduleRequestItemId1: dutyScheduleRequestItemId1,
          dutyScheduleRequestItemId2: dutyScheduleRequestItemId2,
          dutyScheduleRequestItemId3: dutyScheduleRequestItemId3,
          dutyScheduleRequestItemId4: dutyScheduleRequestItemId4,
          dutyScheduleRequestItemId5: dutyScheduleRequestItemId5,
          dutyScheduleRequestItemId6: dutyScheduleRequestItemId6,
          dutyScheduleRequestItemId7: dutyScheduleRequestItemId7,
          dutyScheduleRequestItemId8: dutyScheduleRequestItemId8,
          dutyScheduleRequestItemIdOther: dutyScheduleRequestItemIdOther,
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
          objadddata["positionCode"] == "" ||
          objadddata["positionCode"] == null ||
          isNaN(objadddata["positionCode"])
        ) {
          modalEdit
            .find(`.div-input-positionCodeEditModal .custom-select`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-positionCodeEditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ`);

          isValidate = 1;
        } else {
          $(`.div-input-positionCodeEditModal .custom-select`).removeClass(
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
          objadddata["departmentCode"] == "" ||
          objadddata["departmentCode"] == null ||
          isNaN(objadddata["departmentCode"])
        ) {
          modalEdit
            .find(`.div-input-departmentCodeEditModal .custom-select`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-departmentCodeEditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ`);

          isValidate = 1;
        } else {
          $(`.div-input-departmentCodeEditModal .custom-select`).removeClass(
            isInvalidClass
          );
        }

        if (
          objadddata["requestNumber1"] < 0 ||
          objadddata["requestNumber1"] == null ||
          isNaN(objadddata["requestNumber1"])
        ) {
          modalEdit
            .find(`.div-input-requestNumber1EditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-requestNumber1EditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ และต้องไม่ติดลบ`);
          isValidate = 1;
        } else {
          modalEdit
            .find(`.div-input-requestNumber1EditModal .form-control`)
            .removeClass(isInvalidClass);
        }

        if (
          objadddata["requestNumber2"] < 0 ||
          objadddata["requestNumber2"] == null ||
          isNaN(objadddata["requestNumber2"])
        ) {
          modalEdit
            .find(`.div-input-requestNumber2EditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-requestNumber2EditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ และต้องไม่ติดลบ`);
          isValidate = 1;
        } else {
          modalEdit
            .find(`.div-input-requestNumber2EditModal .form-control`)
            .removeClass(isInvalidClass);
        }

        if (
          objadddata["requestNumber3"] < 0 ||
          objadddata["requestNumber3"] == null ||
          isNaN(objadddata["requestNumber3"])
        ) {
          modalEdit
            .find(`.div-input-requestNumber3EditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-requestNumber3EditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ และต้องไม่ติดลบ`);
          isValidate = 1;
        } else {
          modalEdit
            .find(`.div-input-requestNumber3EditModal .form-control`)
            .removeClass(isInvalidClass);
        }

        if (
          objadddata["requestNumber4"] < 0 ||
          objadddata["requestNumber4"] == null ||
          isNaN(objadddata["requestNumber4"])
        ) {
          modalEdit
            .find(`.div-input-requestNumber4EditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-requestNumber4EditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ และต้องไม่ติดลบ`);
          isValidate = 1;
        } else {
          modalEdit
            .find(`.div-input-requestNumber4EditModal .form-control`)
            .removeClass(isInvalidClass);
        }

        if (
          objadddata["requestNumber5"] < 0 ||
          objadddata["requestNumber5"] == null ||
          isNaN(objadddata["requestNumber5"])
        ) {
          modalEdit
            .find(`.div-input-requestNumber5EditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-requestNumber5EditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ และต้องไม่ติดลบ`);
          isValidate = 1;
        } else {
          modalEdit
            .find(`.div-input-requestNumber5EditModal .form-control`)
            .removeClass(isInvalidClass);
        }

        if (
          objadddata["requestNumber6"] < 0 ||
          objadddata["requestNumber6"] == null ||
          isNaN(objadddata["requestNumber6"])
        ) {
          modalEdit
            .find(`.div-input-requestNumber6EditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-requestNumber6EditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ และต้องไม่ติดลบ`);
          isValidate = 1;
        } else {
          modalEdit
            .find(`.div-input-requestNumber6EditModal .form-control`)
            .removeClass(isInvalidClass);
        }

        if (
          objadddata["requestNumber7"] < 0 ||
          objadddata["requestNumber7"] == null ||
          isNaN(objadddata["requestNumber7"])
        ) {
          modalEdit
            .find(`.div-input-requestNumber7EditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-requestNumber7EditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ และต้องไม่ติดลบ`);
          isValidate = 1;
        } else {
          modalEdit
            .find(`.div-input-requestNumber7EditModal .form-control`)
            .removeClass(isInvalidClass);
        }

        if (
          objadddata["requestNumber8"] < 0 ||
          objadddata["requestNumber8"] == null ||
          isNaN(objadddata["requestNumber8"])
        ) {
          modalEdit
            .find(`.div-input-requestNumber8EditModal .form-control`)
            .addClass(isInvalidClass);
          modalEdit
            .find(
              `.div-input-requestNumber8EditModal .${validationErrorMessageClass}`
            )
            .html(`กรุณาระบุ และต้องไม่ติดลบ`);
          isValidate = 1;
        } else {
          modalEdit
            .find(`.div-input-requestNumber8EditModal .form-control`)
            .removeClass(isInvalidClass);
        }

        if (isValidate == 1) {
          return;
        }

        // console.log(objadddata);

        $.ajax({
          url: "https://localhost:7063/api/dutyScheduleRequest/update",
          type: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          data: JSON.stringify(objadddata),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function (res) {
            if (res.status.code == 200) {
              toastr.success("แก้ไขรายการสำเร็จ");
              $("#editScheduleModal").modal("hide");
              LoadDutyScheduleRequest();
            } else {
              toastr.error(res.status.message);
            }
          },
          error: function (res) {
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

let LoadDutyScheduleRequest = function () {
  let dutyDate = $("#beginDate").val();
  let hospitalCode = parseInt($("#hospitalCode").val());
  let locationCode = parseInt($("#locationCode").val());
  let departmentCode = parseInt($("#departmentCode").val());
  let positionCode = parseInt($("#positionCode").val());

  let objData = {
    dutyDate: dutyDate,
    hospitalCode: hospitalCode,
    locationCode: locationCode,
    departmentCode: departmentCode,
    positionCode: positionCode,
  };
  $.ajax({
    url: "https://localhost:7063/api/dutyScheduleRequest/searchDutyScheduleRequest",
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
