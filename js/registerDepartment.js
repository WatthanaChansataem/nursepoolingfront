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

let DocumentTypeCode = {
  Other: 0,
  TrainingCourse: 1,
  IDCardCopy: 2,
  ProfessionalLicenseCopy: 3,
  ProfileImg: 4,
};

$(document).ready(function () {
  let setupDataDefered = $.Deferred();
  SetupData.init(setupDataDefered);
  localStorage.setItem("test", "12356");

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
      url: "https://localhost:7063/api/title/list",
      type: "GET",
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

  let loadPosition = function (defered) {
    $.ajax({
      url: "https://localhost:7063/api/position/list",
      type: "GET",
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

  let loadHospital = function (defered) {
    $.ajax({
      url: "https://localhost:7063/api/hospital/list",
      type: "GET",
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
      success: function (res) {
        if (res.status.code == 200) {
          departmentMaster = res.data;
          for (let data of res.data) {
            departmentMap.set(data.departmentCode, data);
          }
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูลแผนกได้", "Error");
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูลแผนกได้", "Error");
      },
    });
  };
  return {
    init: function (defered) {
      let titleDefered = $.Deferred();
      let positionDefered = $.Deferred();
      let educationalQualificationDefered = $.Deferred();
      let experienceTypeDefer = $.Deferred();
      let hospitalDefered = $.Deferred();
      let locationDefered = $.Deferred();
      let departmentDefered = $.Deferred();
      loadTitle(titleDefered);
      loadPosition(positionDefered);
      loadEducationalQualification(educationalQualificationDefered);
      loadExperienceType(experienceTypeDefer);
      loadHospital(hospitalDefered);
      loadLocation(locationDefered);
      loadDepartment(departmentDefered);

      $.when(
        titleDefered,
        positionDefered,
        educationalQualificationDefered,
        experienceTypeDefer,
        hospitalDefered,
        locationDefered,
        departmentDefered
      ).done(function (
        titleResult,
        positionDefered,
        educationalQualificationResult,
        experienceTypeResult,
        hospitalResult,
        locationResult,
        departmentResult
      ) {
        if (
          titleResult &&
          positionDefered &&
          educationalQualificationResult &&
          experienceTypeResult &&
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

  let defer = $.Deferred();
  upLoadFileWithContent(uploadata, defer);
  $.when(defer).done(function (result) {
    if (result) {
      resData = result;
      changeElement.attr("documentId", resData.documentId);
    }
  });
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
  let agencyNo = $("#agencyNo").val();
  let email = $("#email").val();
  let phone = $("#phone").val();
  let contractPerson = $("#contractPerson").val();
  let userName = $(`#userName`).val();
  let password = $(`#password`).val();
  let repeatPassword = $(`#repeatPassword`).val();
  let hospitalCode = $("#hospitalCode").val();
  let locationCode = $("#locationCode").val();
  let departmentCode = $("#departmentCode").val();
  let profileDocumentId = parseInt(
    $("input[name=changeProfileImage]").attr("documentId")
  );

  let objadddata = {
    firstName: firstName,
    agencyNo: agencyNo,
    email: email,
    phone: phone,
    contractPerson: contractPerson,
    userName: userName,
    password: password,
    repeatPassword: repeatPassword,
    profileDocumentId: profileDocumentId,
    hospitalCode: hospitalCode,
    locationCode: locationCode,
    departmentCode: departmentCode,
  };
  console.log(objadddata);

  if (
    objadddata["userName"] == "" ||
    objadddata["userName"] == null ||
    objadddata["userName"].length <= 8
  ) {
    $(`.div-input-userName .form-control`).addClass(isInvalidClass);
    $(`.div-input-userName .${validationErrorMessageClass}`).html(
      `กรุณาระบุ UserName ให้มีความยาว 8 ตัวอักษรขึ้นไป`
    );
    // scrollToElement($(`.div-input-userName .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-userName .form-control`).removeClass(isInvalidClass);
  }

  let pattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+!.=])[a-zA-Z0-9@#$%^&+!.=]{8,}$/;
  let isValid = pattern.test(objadddata["password"]);

  if (!isValid) {
    $(`.div-input-password .form-control`).addClass(isInvalidClass);
    $(`.div-input-password .${validationErrorMessageClass}`).html(
      `ต้องมีอักษรตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว มีอักษรตัวพิมพ์ใหญ่อย่างน้อยหนึ่งตัว มีตัวเลขอย่างน้อยหนึ่งตัว มีอักขระพิเศษ @#$%^&+!.= อย่างน้อยหนึ่งตัว และมีความยาวอย่างน้อย 8 ตัวอักษร`
    );
    // scrollToElement($(`.div-input-password .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-password .form-control`).removeClass(isInvalidClass);
  }

  if (objadddata["repeatPassword"] != objadddata["password"]) {
    $(`.div-input-repeatPassword .form-control`).addClass(isInvalidClass);
    $(`.div-input-repeatPassword .${validationErrorMessageClass}`).html(
      `รหัสผ่านไม่ตรงกัน`
    );
    // scrollToElement($(`.div-input-repeatPassword .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-repeatPassword .form-control`).removeClass(isInvalidClass);
  }

  if (objadddata["firstName"] == "" || objadddata["firstName"] == null) {
    $(`.div-input-firstName .form-control`).addClass(isInvalidClass);
    $(`.div-input-firstName .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    // scrollToElement($(`.div-input-firstName .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-firstName .form-control`).removeClass(isInvalidClass);
  }

  if (objadddata["agencyNo"] == "" || objadddata["agencyNo"] == null) {
    $(`.div-input-agencyNo .form-control`).addClass(isInvalidClass);
    $(`.div-input-agencyNo .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    // scrollToElement($(`.div-input-agencyNo .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-agencyNo .form-control`).removeClass(isInvalidClass);
  }

  if (objadddata["email"] == "" || objadddata["email"] == null) {
    $(`.div-input-email .form-control`).addClass(isInvalidClass);
    $(`.div-input-email .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    // scrollToElement($(`.div-input-email .form-control`));
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
    $(`.div-input-phone .${validationErrorMessageClass}`).html(
      `กรุณาระบุเบอร์โทรศัพท์ไม่เกิน 10 หลัก`
    );
    // scrollToElement($(`.div-input-phone .form-control`));
    isValidate = 1;
  } else if (isNaN(Number(objadddata["phone"]))) {
    $(`.div-input-phone .form-control`).addClass(isInvalidClass);
    $(`.div-input-phone .${validationErrorMessageClass}`).html(
      `ไม่สามารถมีตัวอักษรได้`
    );
    isValidate = 1;
  } else {
    $(`.div-input-phone .form-control`).removeClass(isInvalidClass);
  }

  if (
    objadddata["contractPerson"] == "" ||
    objadddata["contractPerson"] == null
  ) {
    $(`.div-input-contractPerson .form-control`).addClass(isInvalidClass);
    $(`.div-input-contractPerson .${validationErrorMessageClass}`).html(
      `กรุณาระบุ`
    );
    isValidate = 1;
  } else {
    $(`.div-input-contractPerson .form-control`).removeClass(isInvalidClass);
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
    // scrollToElement($(`.div-input-hospitalCode .custom-select`));
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
    // scrollToElement($(`.div-input-locationCode .custom-select`));
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
    // scrollToElement($(`.div-input-departmentCode .custom-select`));
    isValidate = 1;
  } else {
    $(`.div-input-departmentCode .custom-select`).removeClass(isInvalidClass);
  }

  if (isValidate == 1) {
    return;
  }
  $.ajax({
    url: "https://localhost:7063/api/user/createdepartment",
    type: "POST",
    data: JSON.stringify(objadddata),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        toastr.success("ลงทะเบียนสำเร็จ");
        window.location.href = "login.html";
      } else {
        toastr.error(res.status.message);
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถลงทะเบียนได้");
    },
  });
});

let upLoadFileWithContent = function (uploadFileData, defer) {
  $.ajax({
    url: "https://localhost:7063/api/document/createWithContent",
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

function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $("#profileImg").attr("src", e.target.result).width(100).height(100);
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function showPassword() {
  let element = document.getElementById("password");
  if (element.type === "password") {
    element.type = "text";
  } else {
    element.type = "password";
  }
}

let scrollToElement = function (element) {
  let windowHeight = $(window).height();
  let offset = element.offset().top;
  let scrollOffset = offset - windowHeight / 2;
  $("html, body").animate({ scrollTop: scrollOffset }, 1000);
};
