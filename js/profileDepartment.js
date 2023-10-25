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
let isValidate = 0;

let hospitalMap = new Map();
let hospitalMaster;
let locationMap = new Map();
let locationMaster;
let departmentMap = new Map();
let departmentMaster;
let titleMap = new Map();
let titleMaster;
let positionMap = new Map();
let positionMaster;
let educationalQualificationMap = new Map();
let educationalQualificationMaster;
let experienceTypeMap = new Map();
let experienceTypeMaster;
let educationCount = 0;
let educationIdList = [];
let experienceCount = 0;
let experienceIdList = [];
let courseCount = 0;
let courseIdList = [];
let userData;

let userRoleConstant = {
  User: "U",
  Admin: "A",
  Department: "D",
};

let DocumentTypeCode = {
  Other: 0,
  TrainingCourse: 1,
  IDCardCopy: 2,
  ProfessionalLicenseCopy: 3,
  ProfileImg: 4,
};

$(document).ready(function () {
  let setupDataDefered = $.Deferred();
  // LoadDutyFile();
  SetupData.init(setupDataDefered);
  sessionStorage.setItem("test", "12356");

  $.when(setupDataDefered).done(function (success) {
    if (!success) {
      return;
    }

    renderPage();
  });
});
let SetupData = (function () {
  let loadTitle = function (defered) {
    $.ajax({
      url: link + "/api/title/list",
      type: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: function (res) {
        if (res.status.code == 200) {
          titleMaster = res.data;
          for (let data of res.data) {
            titleMap.set(data.titleCode, data);
          }
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูลคำนำหน้าได้", "Error");
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูลคำนำหน้าได้", "Error");
      },
    });
  };

  let loadEducationalQualification = function (defered) {
    $.ajax({
      url: link + "/api/educationalQualification/list",
      type: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
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
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      success: function (res) {
        if (res.status.code == 200) {
          experienceTypeMaster = res.data;
          for (let data of res.data) {
            experienceTypeMap.set(data.positionCode, data);
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
          //   positionMaster = res.data;
          //   for (let data of res.data) {
          //     positionMap.set(data.positionCode, data);
          //   }
          $("#version").html("Version " + userData.version);
          if (
            userData.dutyScheduleList != null &&
            userData.dutyScheduleList.length > 0
          ) {
            $("#notifyCount").html(1);
            $("#notifyDropdown")
              .append(`<a class="dropdown-item d-flex align-items-center" href="employeeAppraisalForm.html?from=notification">
              <div class="mr-3">
                <div class="icon-circle" style="background-color: #0f6641">
                  <i class="fas fa-user text-white"></i>
                </div>
              </div>
              <div>
                <div class="small text-gray-500">${userData.notifyDateString}</div>
                <span class="font-weight-bold"
                  >มีผู้ใช้ที่ยังไม่ได้รับการประเมิน ${userData.dutyScheduleList.length} รายการ</span
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
  return {
    init: function (defered) {
      let titleDefered = $.Deferred();
      let positionDefered = $.Deferred();
      let educationalQualificationDefered = $.Deferred();
      let experienceTypeDefer = $.Deferred();
      let userProfileDefered = $.Deferred();
      let hospitalDefered = $.Deferred();
      let locationDefered = $.Deferred();
      let departmentDefered = $.Deferred();
      loadTitle(titleDefered);
      loadPosition(positionDefered);
      loadEducationalQualification(educationalQualificationDefered);
      loadExperienceType(experienceTypeDefer);
      loadUserData(userProfileDefered);
      loadHospital(hospitalDefered);
      loadLocation(locationDefered);
      loadDepartment(departmentDefered);

      $.when(
        titleDefered,
        positionDefered,
        educationalQualificationDefered,
        experienceTypeDefer,
        userProfileDefered,
        hospitalDefered,
        locationDefered,
        departmentDefered
      ).done(function (
        titleResult,
        positionDefered,
        educationalQualificationResult,
        experienceTypeResult,
        userProfileResult,
        hospitalResult,
        locationResult,
        departmentResult
      ) {
        if (
          titleResult &&
          positionDefered &&
          educationalQualificationResult &&
          experienceTypeResult &&
          userProfileResult &&
          hospitalResult &&
          locationResult &&
          departmentResult
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
  $("#profileImg").attr(
    "src",
    `${link}/api/document/avatar/${userData.userId}`
  );

  $("#navProfileImg").attr(
    "src",
    `${link}/api/document/avatar/${userData.userId}`
  );

  $.each(hospitalMaster, function (i, item) {
    $("select[name=hospitalCode]").append(
      $("<option>", {
        value: item.hospitalCode,
        text: item.hospitalDesc,
      })
    );
  });

  // $.each(locationMaster, function (i, item) {
  //   $("select[name=locationCode]").append(
  //     $("<option>", {
  //       value: item.locationCode,
  //       text: item.locationDesc,
  //     })
  //   );
  // });

  // $.each(departmentMaster, function (i, item) {
  //   $("select[name=departmentCode]").append(
  //     $("<option>", {
  //       value: item.departmentCode,
  //       text: item.departmentDesc,
  //     })
  //   );
  // });

  $(".alert").hide();

  $("#firstName").val(userData.firstName);
  $("#lastName").val(userData.lastName);
  $("#agencyNo").val(userData.agencyNo);
  $("#email").val(userData.email);
  $("#phone").val(userData.phone);

  $("#navHospitalCode").html(
    hospitalMap.get(userData.hospitalCode).hospitalDesc
  );

  $("#navLocationCode").html(
    locationMap.get(userData.locationCode).locationDesc
  );

  $("#navDepartmentCode").html(
    departmentMap.get(userData.departmentCode).departmentDesc
  );
  $("#hospitalCode").val(userData.hospitalCode).change();
  $("#locationCode").val(userData.locationCode).change();
  $("#departmentCode").val(userData.departmentCode).change();
};

$("#hospitalCode").on("change", function () {
  $("#locationCode")
    .empty()
    .append("<option selected disabled hidden>กรุณาเลือก</option>");

  $("#departmentCode")
    .empty()
    .append("<option selected disabled hidden>กรุณาเลือก</option>");

  $.each(locationMaster, function (i, item) {
    $("select[name=locationCode]").append(
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
    .append("<option selected disabled hidden>กรุณาเลือก</option>");

  $.each(
    departmentMaster.filter(
      (e) =>
        e.hospitalCode == $("#hospitalCode").val() &&
        e.locationCode == $("#locationCode").val()
    ),
    function (i, item) {
      $("select[name=departmentCode]").append(
        $("<option>", {
          value: item.departmentCode,
          text: item.departmentDesc,
        })
      );
    }
  );
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
      }
    });
  }
});

$("#editProfile").on("click", function () {
  $("#changeProfileImage").trigger("click");
});

let renderSelectElement = function (
  target,
  data,
  key,
  value,
  initialValue = 0,
  defaultKey = null,
  defaultValue = null
) {
  target.empty();
  target.selectpicker("refresh");
  if (defaultKey != null) {
    target.append(new Option(defaultValue, defaultKey));
  }
  for (let d of data) {
    target.append(new Option(d[value], d[key]));
  }
  if (initialValue != 0) {
    target.val(initialValue);
  }
  target.selectpicker("refresh");
};

function removeItemEducation(value) {
  educationIdList = jQuery.grep(educationIdList, function (item) {
    return item != value;
  });

  let elementId = "education" + value;
  const element = document.getElementById(elementId);
  element.remove();
}

function removeItemExperience(value) {
  experienceIdList = jQuery.grep(experienceIdList, function (item) {
    return item != value;
  });

  let elementId = "experience" + value;
  const element = document.getElementById(elementId);
  element.remove();
}

function removeItemCourse(value) {
  courseIdList = jQuery.grep(courseIdList, function (item) {
    return item != value;
  });

  let elementId = "course" + value;
  const element = document.getElementById(elementId);
  element.remove();
}

$("#submitRegister").on("click", function () {
  isValidate = 0;

  let firstName = $("#firstName").val();
  let lastName = $("#lastName").val();
  let agencyNo = $("#agencyNo").val();
  let email = $("#email").val();
  let phone = $("#phone").val();
  let hospitalCode = $("#hospitalCode").val();
  let locationCode = $("#locationCode").val();
  let departmentCode = $("#departmentCode").val();

  let objadddata = {
    userId: userData.userId,
    firstName: firstName,
    lastName: lastName,
    agencyNo: agencyNo,
    email: email,
    phone: phone,
    hospitalCode: hospitalCode,
    locationCode: locationCode,
    departmentCode: departmentCode,
  };

  if (objadddata["firstName"] == "" || objadddata["firstName"] == null) {
    $(`.div-input-firstName .form-control`).addClass(isInvalidClass);
    $(`.div-input-firstName .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    scrollToElement($(`.div-input-firstName .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-firstName .form-control`).removeClass(isInvalidClass);
  }

  //   if (objadddata["lastName"] == "" || objadddata["lastName"] == null) {
  //     $(`.div-input-lastName .form-control`).addClass(isInvalidClass);
  //     $(`.div-input-lastName .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
  //     scrollToElement($(`.div-input-lastName .form-control`));
  //     isValidate = 1;
  //   } else {
  //     $(`.div-input-lastName .form-control`).removeClass(isInvalidClass);
  //   }

  if (objadddata["agencyNo"] == "" || objadddata["agencyNo"] == null) {
    $(`.div-input-agencyNo .form-control`).addClass(isInvalidClass);
    $(`.div-input-agencyNo .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    scrollToElement($(`.div-input-agencyNo .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-agencyNo .form-control`).removeClass(isInvalidClass);
  }

  if (objadddata["email"] == "" || objadddata["email"] == null) {
    $(`.div-input-email .form-control`).addClass(isInvalidClass);
    $(`.div-input-email .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    scrollToElement($(`.div-input-email .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-email .form-control`).removeClass(isInvalidClass);
  }

  if (
    objadddata["phone"] == "" ||
    objadddata["phone"] == null ||
    objadddata["phone"].length > 10
  ) {
    $(`.div-input-phone .form-control`).addClass(isInvalidClass);
    $(`.div-input-phone .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    scrollToElement($(`.div-input-phone .form-control`));
    isValidate = 1;
  } else if (isNaN(Number(objadddata["phone"]))) {
    $(`.div-input-phone .form-control`).addClass(isInvalidClass);
    $(`.div-input-phone .${validationErrorMessageClass}`).html(
      `ไม่สามารถมีตัวอักษรได้`
    );
    scrollToElement($(`.div-input-phone .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-phone .form-control`).removeClass(isInvalidClass);
  }

  if (
    objadddata["hospitalCode"] == "" ||
    objadddata["hospitalCode"] == null ||
    isNaN(objadddata["hospitalCode"])
  ) {
    $(`.div-input-hospitalCode .custom-select`).addClass(isInvalidClass);
    $(`.div-input-hospitalCode .${validationErrorMessageClass}`).html(
      `กรุณาระบุ`
    );

    isValidate = 1;
  } else {
    $(`.div-input-hospitalCode .custom-select`).removeClass(isInvalidClass);
  }

  if (
    objadddata["locationCode"] == "" ||
    objadddata["locationCode"] == null ||
    isNaN(objadddata["locationCode"])
  ) {
    $(`.div-input-locationCode .custom-select`).addClass(isInvalidClass);
    $(`.div-input-locationCode .${validationErrorMessageClass}`).html(
      `กรุณาระบุ`
    );

    isValidate = 1;
  } else {
    $(`.div-input-locationCode .custom-select`).removeClass(isInvalidClass);
  }

  if (
    objadddata["departmentCode"] == "" ||
    objadddata["departmentCode"] == null ||
    isNaN(objadddata["departmentCode"])
  ) {
    $(`.div-input-departmentCode .custom-select`).addClass(isInvalidClass);
    $(`.div-input-departmentCode .${validationErrorMessageClass}`).html(
      `กรุณาระบุ`
    );

    isValidate = 1;
  } else {
    $(`.div-input-departmentCode .custom-select`).removeClass(isInvalidClass);
  }
  console.log(objadddata);

  if (isValidate == 1) {
    return;
  }

  $.ajax({
    url: link + "/api/user/updatedepartment",
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: JSON.stringify(objadddata),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        toastr.success("บันทึกสำเร็จสำเร็จ");
      } else {
        toastr.error(res.status.message);
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถบันทึกได้");
    },
  });
});

function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $("#profileImg").attr("src", e.target.result).width(100).height(100);
    };

    reader.readAsDataURL(input.files[0]);
  }
}

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
