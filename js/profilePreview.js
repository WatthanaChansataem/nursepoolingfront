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
let userIdPreview;
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
  CertificateDiplomaCopy: 5,
};

$(document).ready(function () {
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
    let urlParams = new URLSearchParams(window.location.search);
    userIdPreview = parseInt(urlParams.get("userId"));
    $.ajax({
      url: link + "/api/user/previewProfile",
      type: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      data: JSON.stringify((obj = { userId: userIdPreview })),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (res) {
        if (res.status.code == 200) {
          userData = res.data;
          $("#version").html("Version " + userData.version);
          $("#currentUserName").html(userData.previewFirstName);
          if (userData.previewUserRole != userRoleConstant.Admin) {
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
      let titleDefered = $.Deferred();
      let positionDefered = $.Deferred();
      let educationalQualificationDefered = $.Deferred();
      let experienceTypeDefer = $.Deferred();
      let userProfileDefered = $.Deferred();
      loadTitle(titleDefered);
      loadPosition(positionDefered);
      loadEducationalQualification(educationalQualificationDefered);
      loadExperienceType(experienceTypeDefer);
      loadUserData(userProfileDefered);

      $.when(
        titleDefered,
        positionDefered,
        educationalQualificationDefered,
        experienceTypeDefer,
        userProfileDefered
      ).done(function (
        titleResult,
        positionDefered,
        educationalQualificationResult,
        experienceTypeResult,
        userProfileResult
      ) {
        if (
          titleResult &&
          positionDefered &&
          educationalQualificationResult &&
          experienceTypeResult &&
          userProfileResult
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
    `${link}/api/document/avatar/${userData.previewUserId}`
  );

  let docIDCardCopy = userData.documentList.filter(
    (e) => e.documentTypeCode == DocumentTypeCode.IDCardCopy
  )[0];
  let docProfessionalLicenseCopy = userData.documentList.filter(
    (e) => e.documentTypeCode == DocumentTypeCode.ProfessionalLicenseCopy
  )[0];
  let docCertificateDiplomaCopy = userData.documentList.filter(
    (e) => e.documentTypeCode == DocumentTypeCode.CertificateDiplomaCopy
  )[0];

  if (docIDCardCopy != null) {
    $("#refFileUploadIDCardCopy").attr(
      "href",
      `${link}/api/document/getFile/${docIDCardCopy.documentId}`
    );
    $("#fileNameIDCardCopy").html(docIDCardCopy.documentName);
    $("input[name=iDCardCopy]").attr("documentId", docIDCardCopy.documentId);
  }

  if (docProfessionalLicenseCopy != null) {
    $("#refFileUploadProfessionalLicenseCopy").attr(
      "href",
      `${link}/api/document/getFile/${docProfessionalLicenseCopy.documentId}`
    );
    $("#fileNameProfessionalLicenseCopy").html(
      docProfessionalLicenseCopy.documentName
    );
    $("input[name=professionalLicenseCopy]").attr(
      "documentId",
      docProfessionalLicenseCopy.documentId
    );
  }

  if (docCertificateDiplomaCopy != null) {
    $("#refFileUploadcertificateDiplomaCopy").attr(
      "href",
      `${link}/api/document/getFile/${docCertificateDiplomaCopy.documentId}`
    );
    $("#fileNamecertificateDiplomaCopy").html(
      docCertificateDiplomaCopy.documentName
    );
    $("input[name=certificateDiplomaCopy]").attr(
      "documentId",
      docCertificateDiplomaCopy.documentId
    );
  }

  // console.log(docIDCardCopy);
  // console.log(docProfessionalLicenseCopy);

  $(".alert").hide();
  //   renderSelectElement(
  //     $("select[name=titleCode]"),
  //     titleMaster,
  //     "titleCode",
  //     "titleDesc"
  //   );
  //   <option selected disabled>
  //     Choose one
  //   </option>;
  $.each(positionMaster, function (i, item) {
    $("select[name=positionCode]").append(
      $("<option>", {
        value: item.positionCode,
        text: item.positionDesc,
      })
    );
  });
  $.each(titleMaster, function (i, item) {
    $("select[name=titleCode]").append(
      $("<option>", {
        value: item.titleCode,
        text: item.titleDesc,
      })
    );
  });

  $("#titleCode").val(userData.titleCode);
  if (userData.titleCode == 4) {
    $("#titleOther").show();
    $("#titleOther").val(userData.titleOther);
  }
  $("#firstName").val(userData.firstName);
  $("#lastName").val(userData.lastName);
  $("#identityCardId").val(userData.identityCardId);
  $("#email").val(userData.email);
  $("#phone").val(userData.phone);
  $("#lineID").val(userData.lineID);
  $("#workplace").val(userData.workplace);
  $("#positionCode").val(userData.positionCode);
  $("#employeeNo").val(userData.employeeNo);
  $("#vendorNo").val(userData.vendorNo);

  $("#professionalLicenseExpireDate").val(
    isDateTime(userData.professionalLicenseExpireDate)
      ? moment(userData.professionalLicenseExpireDate).format("DD/MM/YYYY")
      : userData.professionalLicenseExpireDate
  );

  $("#dateOfBirth").val(
    isDateTime(userData.dateOfBirth)
      ? moment(userData.dateOfBirth).format("DD/MM/YYYY")
      : userData.dateOfBirth
  );
  if (isDateTime(userData.dateOfBirth)) {
    $("#age").html(
      ageCalculator(moment(userData.dateOfBirth).format("DD/MM/YYYY"))
    );
  }

  renderEducation(userData.educationList);
  renderExperience(userData.experienceList);
  renderTrainingCourse(userData.trainingCourseList);
};

$("input[name=iDCardCopy]").on("change", function () {
  let changeElement = $("input[name=iDCardCopy]");
  var uploadata = new FormData();
  uploadata.append("documentName", changeElement[0].files[0].name);
  uploadata.append("document", changeElement[0].files[0]);
  uploadata.append("documentTypeCode", DocumentTypeCode.IDCardCopy);
  if (changeElement[0].files[0].size > maximumSize) {
    toastr.error("ไฟล์มีขนาดใหญ่เกินไป");
  } else {
    $(".iDCardCopyLabel").html($(this)[0].files[0].name);
    let defer = $.Deferred();
    upLoadFile(uploadata, defer);
    $.when(defer).done(function (result) {
      if (result) {
        resData = result;
        changeElement.attr("documentId", resData.documentId);
      }
    });
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
      }
    });
  }
});

$("input[name=professionalLicenseCopy]").on("change", function () {
  let changeElement = $("input[name=professionalLicenseCopy]");
  var uploadata = new FormData();
  uploadata.append("documentName", changeElement[0].files[0].name);
  uploadata.append("document", changeElement[0].files[0]);
  uploadata.append(
    "documentTypeCode",
    DocumentTypeCode.ProfessionalLicenseCopy
  );
  if (changeElement[0].files[0].size > maximumSize) {
    toastr.error("ไฟล์มีขนาดใหญ่เกินไป");
  } else {
    $(".professionalLicenseCopyLabel").html(
      $("input[name=professionalLicenseCopy]")[0].files[0].name
    );
    let defer = $.Deferred();
    upLoadFile(uploadata, defer);
    $.when(defer).done(function (result) {
      if (result) {
        resData = result;
        changeElement.attr("documentId", resData.documentId);
      }
    });
  }
});

$("#addEducation").on("click", function () {
  educationCount++;
  educationIdList.push(educationCount);
  $("#collapseCardEducation").append(`
      <div class="card-body" id="education${educationCount}" educationCode="0">
                            <div class="form-group row">
                              <div class="col-sm-4 div-input-educationalQualificationCode${educationCount}">
                                <select
                                  class="custom-select custom-select-sm educationalQualificationCode"
                                  name="educationalQualificationCode${educationCount}"
                                  id="educationalQualificationCode${educationCount}"
                                  data-size="4"
                                >
                                  <option selected disabled>วุฒิการศึกษา</option>
                                </select>
                                <div
                                  class="invalid-feedback validation-error-message"
                                ></div>
                                <span class="form-text text-muted"></span>
                              </div>
                              <div class="col-sm-4 div-input-majorCode${educationCount}">
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  id="majorCode${educationCount}"
                                  placeholder="สาขา"
                                />
                                <div
                                  class="invalid-feedback validation-error-message"
                                ></div>
                                <span class="form-text text-muted"></span>
                              </div>
                              <div class="col-sm-4 div-input-graduationYear${educationCount}">
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  name="graduationYear"
                                  id="graduationYear${educationCount}"
                                  placeholder="ปีที่จบการศึกษา"
                                />
                                <div
                                  class="invalid-feedback validation-error-message"
                                ></div>
                                <span class="form-text text-muted"></span>
                              </div>
                            </div>
                            <div class="form-group row">
                              <div class="col-sm-6 div-input-university${educationCount}">
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  name="university"
                                  id="university${educationCount}"
                                  placeholder="มหาวิทยาลัย"
                                />
                                <div
                                  class="invalid-feedback validation-error-message"
                                ></div>
                                <span class="form-text text-muted"></span>
                              </div>
                              
                            </div>
                          </div>
      `);

  let datepickerID = "graduationYear" + educationCount;
  $("#" + datepickerID).datepicker({
    format: "yyyy",
    startView: "years",
    viewMode: "years",
    minViewMode: "years",
    autoclose: true, //to close picker once year is selected
  });

  $.each(educationalQualificationMaster, function (i, item) {
    $("select[name=educationalQualificationCode" + educationCount + "]").append(
      $("<option>", {
        value: item.educationalQualificationCode,
        text: item.educationalQualificationDesc,
      })
    );
  });
});

$("#addExperience").on("click", function () {
  experienceCount++;
  experienceIdList.push(experienceCount);
  $("#collapseCardExperience").append(`
      <div class="card-body" id="experience${experienceCount}" experienceCode="0">
                            <div class="form-group row">
                              <div class="col-sm-3 div-input-experienceTypeCode${experienceCount}">
                                <select
                                  class="custom-select custom-select-sm experienceTypeCode"
                                  name="experienceTypeCode${experienceCount}"
                                  id="experienceTypeCode${experienceCount}"
                                  data-size="4"
                                >
                                  <option selected disabled>หมวดหมู่</option>
                                </select>
                                <div
                                  class="invalid-feedback validation-error-message"
                                ></div>
                                <span class="form-text text-muted"></span>
                              </div>
                              <div class="col-sm-3 div-input-positionCode${experienceCount}">
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  name="positionCode${experienceCount}"
                                  id="positionCode${experienceCount}"
                                  placeholder="ตำแหน่ง"
                                />
                                <div
                                  class="invalid-feedback validation-error-message"
                                ></div>
                                <span class="form-text text-muted"></span>
                              </div>
                              <div class="col-sm-3 div-input-beginYear${experienceCount}">
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  name="beginYear"
                                  id="beginYear${experienceCount}"
                                  placeholder="ปีที่เริ่ม"
                                />
                                <div
                                  class="invalid-feedback validation-error-message"
                                ></div>
                                <span class="form-text text-muted"></span>
                              </div>
                              <div class="col-sm-3 div-input-endYear${experienceCount}">
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  name="endYear"
                                  id="endYear${experienceCount}"
                                  placeholder="ปีที่สิ้นสุด"
                                />
                                <div
                                  class="invalid-feedback validation-error-message"
                                ></div>
                                <span class="form-text text-muted"></span>
                              </div>
                            </div>
                            <div class="form-group row">
                              <div class="col-sm-11">
                              <textarea
                                  type="text"
                                  class="form-control form-control-sm"
                                  name="experienceDetail"
                                  id="experienceDetail${experienceCount}"
                                  placeholder="รายละเอียด"
                              ></textarea>
                              </div>
                              
                            </div>
                          </div>
      `);

  $("#" + "beginYear" + experienceCount).datepicker({
    format: "yyyy",
    startView: "years",
    viewMode: "years",
    minViewMode: "years",
    autoclose: true,
  });

  $("#" + "endYear" + experienceCount).datepicker({
    format: "yyyy",
    startView: "years",
    viewMode: "years",
    minViewMode: "years",
    autoclose: true,
  });

  // $.each(positionMaster, function (i, item) {
  //   $("select[name=positionCode" + experienceCount + "]").append(
  //     $("<option>", {
  //       value: item.positionCode,
  //       text: item.positionDesc,
  //     })
  //   );
  // });

  $.each(experienceTypeMaster, function (i, item) {
    $("select[name=experienceTypeCode" + experienceCount + "]").append(
      $("<option>", {
        value: item.experienceTypeCode,
        text: item.experienceTypeDesc,
      })
    );
  });
});

$("#addCourse").on("click", function () {
  courseCount++;
  courseIdList.push(courseCount);
  $("#collapseCardCourse").append(`
      <div class="card-body" id="course${courseCount}" trainingCourseCode="0">
                            <div class="form-group row">
                              <div class="col-sm-8">
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  id="trainingCourseDesc${courseCount}"
                                  placeholder="ชื่อคอร์สอบรม"
                                />
                              </div>
                              <div class="col-sm-4">
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  name="trainingYear"
                                  id="trainingYear${courseCount}"
                                  placeholder="ปีที่อบรม"
                                />
                              </div>
                            </div>
                            <div class="form-group row">
                            <div class="col-sm-8">
                            </div>
                            <div class="col-sm-2">
                             
                            </div>
                             
                            </div>
                          </div>
      `);
  $("#" + "trainingYear" + courseCount).datepicker({
    format: "yyyy",
    startView: "years",
    viewMode: "years",
    minViewMode: "years",
    autoclose: true,
  });
});

// $("#editProfile").on("click", function () {
//   $("#changeProfileImage").trigger("click");
// });

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

function changeItemCourse(value) {
  let changeElement = $(`input[name=formFileSm${value}]`);
  var uploadata = new FormData();
  uploadata.append("documentName", changeElement[0].files[0].name);
  uploadata.append("document", changeElement[0].files[0]);
  uploadata.append("documentTypeCode", DocumentTypeCode.TrainingCourse);
  if (changeElement[0].files[0].size > maximumSize) {
    toastr.error("ไฟล์มีขนาดใหญ่เกินไป");
  } else {
    let defer = $.Deferred();
    upLoadFile(uploadata, defer);
    $.when(defer).done(function (result) {
      if (result) {
        resData = result;
        changeElement.attr("documentId", resData.documentId);
      }
    });
  }
}

$("#submitRegister").on("click", function () {
  let educationSubmit = [];
  let experienceSubmit = [];
  let courseSubmit = [];
  isValidate = 0;

  for (let i = 0; i < educationIdList.length; i++) {
    let educationCount = educationIdList[i];
    let educationalQualificationCode = parseInt(
      $(`#educationalQualificationCode${educationCount}`).val()
    );
    let majorCode = $(`#majorCode${educationCount}`).val();
    let graduationYear = parseInt($(`#graduationYear${educationCount}`).val());
    let university = $(`#university${educationCount}`).val();

    let educationCode = parseInt(
      $(`#education${educationCount}`).attr("educationCode")
    );

    let obj = {
      educationCode,
      educationalQualificationCode,
      majorCode,
      graduationYear,
      university,
    };

    if (
      obj["educationalQualificationCode"] == "" ||
      obj["educationalQualificationCode"] == null ||
      isNaN(obj["educationalQualificationCode"])
    ) {
      $(
        `.div-input-educationalQualificationCode${educationCount} .custom-select`
      ).addClass(isInvalidClass);
      $(
        `.div-input-educationalQualificationCode${educationCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      scrollToElement(
        $(
          `.div-input-educationalQualificationCode${educationCount} .custom-select`
        )
      );
      isValidate = 1;
    } else {
      $(
        `.div-input-educationalQualificationCode${educationCount} .custom-select`
      ).removeClass(isInvalidClass);
    }

    if (obj["majorCode"] == "" || obj["majorCode"] == null) {
      $(`.div-input-majorCode${educationCount} .form-control`).addClass(
        isInvalidClass
      );
      $(
        `.div-input-majorCode${educationCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      scrollToElement($(`.div-input-majorCode${educationCount} .form-control`));
      isValidate = 1;
    } else {
      $(`.div-input-majorCode${educationCount} .form-control`).removeClass(
        isInvalidClass
      );
    }

    if (
      obj["graduationYear"] == "" ||
      obj["graduationYear"] == null ||
      isNaN(obj["graduationYear"])
    ) {
      $(`.div-input-graduationYear${educationCount} .form-control`).addClass(
        isInvalidClass
      );
      $(
        `.div-input-graduationYear${educationCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      scrollToElement(
        $(`.div-input-graduationYear${educationCount} .form-control`)
      );
      isValidate = 1;
    } else {
      $(`.div-input-graduationYear${educationCount} .form-control`).removeClass(
        isInvalidClass
      );
    }

    if (obj["university"] == "" || obj["university"] == null) {
      $(`.div-input-university${educationCount} .form-control`).addClass(
        isInvalidClass
      );
      $(
        `.div-input-university${educationCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      scrollToElement(
        $(`.div-input-university${educationCount} .form-control`)
      );
      isValidate = 1;
    } else {
      $(`.div-input-university${educationCount} .form-control`).removeClass(
        isInvalidClass
      );
    }

    educationSubmit.push(obj);
  }

  console.log(educationSubmit);

  for (let i = 0; i < experienceIdList.length; i++) {
    let experienceCount = experienceIdList[i];

    let experienceTypeCode = parseInt(
      $(`#experienceTypeCode${experienceCount}`).val()
    );
    let positionCode = $(`#positionCode${experienceCount}`).val();
    let beginYear = $(`#beginYear${experienceCount}`).val();
    let endYear = $(`#endYear${experienceCount}`).val();
    let experienceDetail = $(`#experienceDetail${experienceCount}`).val();

    let experienceCode = parseInt(
      $(`#experience${experienceCount}`).attr("experienceCode")
    );

    let obj = {
      experienceCode,
      experienceTypeCode,
      positionCode,
      beginYear,
      endYear,
      experienceDetail,
    };

    if (
      obj["experienceTypeCode"] == "" ||
      obj["experienceTypeCode"] == null ||
      isNaN(obj["experienceTypeCode"])
    ) {
      $(
        `.div-input-experienceTypeCode${experienceCount} .custom-select`
      ).addClass(isInvalidClass);
      $(
        `.div-input-experienceTypeCode${experienceCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      scrollToElement(
        $(`.div-input-experienceTypeCode${experienceCount} .custom-select`)
      );
      isValidate = 1;
    } else {
      $(
        `.div-input-experienceTypeCode${experienceCount} .custom-select`
      ).removeClass(isInvalidClass);
    }

    if (obj["positionCode"] == "" || obj["positionCode"] == null) {
      $(`.div-input-positionCode${experienceCount} .form-control`).addClass(
        isInvalidClass
      );
      $(
        `.div-input-positionCode${experienceCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      isValidate = 1;
      scrollToElement(
        $(`.div-input-positionCode${experienceCount} .form-control`)
      );
    } else {
      $(`.div-input-positionCode${experienceCount} .form-control`).removeClass(
        isInvalidClass
      );
    }

    if (
      obj["beginYear"] == "" ||
      obj["beginYear"] == null ||
      isNaN(obj["beginYear"])
    ) {
      $(`.div-input-beginYear${experienceCount} .form-control`).addClass(
        isInvalidClass
      );
      $(
        `.div-input-beginYear${experienceCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      scrollToElement(
        $(`.div-input-beginYear${experienceCount} .form-control`)
      );
      isValidate = 1;
    } else {
      $(`.div-input-beginYear${experienceCount} .form-control`).removeClass(
        isInvalidClass
      );
    }

    if (
      obj["endYear"] == "" ||
      obj["endYear"] == null ||
      isNaN(obj["endYear"])
    ) {
      $(`.div-input-endYear${experienceCount} .form-control`).addClass(
        isInvalidClass
      );
      $(
        `.div-input-endYear${experienceCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      scrollToElement($(`.div-input-endYear${experienceCount} .form-control`));
      isValidate = 1;
    } else {
      $(`.div-input-endYear${experienceCount} .form-control`).removeClass(
        isInvalidClass
      );
    }

    experienceSubmit.push(obj);
  }
  console.log(experienceSubmit);

  for (let i = 0; i < courseIdList.length; i++) {
    let courseCount = courseIdList[i];

    let trainingCourseDesc = $(`#trainingCourseDesc${courseCount}`).val();
    let trainingYear = parseInt($(`#trainingYear${courseCount}`).val());
    let documentId = parseInt(
      $(`input[name=formFileSm${courseCount}]`).attr("documentId")
    );

    let trainingCourseCode = parseInt(
      $(`#course${courseCount}`).attr("trainingCourseCode")
    );

    let obj = {
      trainingCourseCode: trainingCourseCode,
      trainingCourseDesc: trainingCourseDesc,
      trainingYear: trainingYear,
      documentId: documentId,
    };

    if (obj["trainingCourseDesc"] == "" || obj["trainingCourseDesc"] == null) {
      $(`.div-input-trainingCourseDesc${courseCount} .form-control`).addClass(
        isInvalidClass
      );
      $(
        `.div-input-trainingCourseDesc${courseCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      isValidate = 1;
    } else {
      $(
        `.div-input-trainingCourseDesc${courseCount} .form-control`
      ).removeClass(isInvalidClass);
    }

    if (
      obj["trainingYear"] == "" ||
      obj["trainingYear"] == null ||
      isNaN(obj["trainingYear"])
    ) {
      $(`.div-input-trainingYear${courseCount} .form-control`).addClass(
        isInvalidClass
      );
      $(
        `.div-input-trainingYear${courseCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      isValidate = 1;
    } else {
      $(`.div-input-trainingYear${courseCount} .form-control`).removeClass(
        isInvalidClass
      );
    }
    courseSubmit.push(obj);
  }
  console.log(courseSubmit);

  let iDCardCopyDocumentId = parseInt(
    $("input[name=iDCardCopy]").attr("documentId")
  );

  let professionalLicenseCopyDocumentId = parseInt(
    $("input[name=professionalLicenseCopy]").attr("documentId")
  );

  let titleCode = parseInt($("#titleCode").val());
  let firstName = $("#firstName").val();
  let lastName = $("#lastName").val();
  let identityCardId = $("#identityCardId").val();
  let email = $("#email").val();
  let phone = $("#phone").val();
  let lineID = $("#lineID").val();
  let workplace = $("#workplace").val();
  let positionCode = parseInt($("#positionCode").val());
  let employeeNo = $(`#employeeNo`).val();
  let vendorNo = $(`#vendorNo`).val();

  let deleteEducations = $.grep(userData.educationList, function (o) {
    return !$.map(educationSubmit, function (n) {
      return n.educationCode;
    }).includes(o.educationCode);
  });

  let deleteExperiences = $.grep(userData.experienceList, function (o) {
    return !$.map(experienceSubmit, function (n) {
      return n.experienceCode;
    }).includes(o.experienceCode);
  });

  let deleteTrainingCourses = $.grep(userData.trainingCourseList, function (o) {
    return !$.map(courseSubmit, function (n) {
      return n.trainingCourseCode;
    }).includes(o.trainingCourseCode);
  });

  let objadddata = {
    userId: userData.userId,
    titleCode: titleCode,
    firstName: firstName,
    lastName: lastName,
    identityCardId: identityCardId,
    email: email,
    phone: phone,
    lineID: lineID,
    workplace: workplace,
    positionCode: positionCode,
    employeeNo: employeeNo,
    vendorNo: vendorNo,
    educations: educationSubmit,
    experiences: experienceSubmit,
    trainingCourses: courseSubmit,
    iDCardCopyDocumentId: iDCardCopyDocumentId,
    professionalLicenseCopyDocumentId: professionalLicenseCopyDocumentId,
    deleteTrainingCourses: deleteTrainingCourses,
    deleteEducations: deleteEducations,
    deleteExperiences: deleteExperiences,
  };
  // console.log(objadddata);
  if (
    objadddata["titleCode"] == "" ||
    objadddata["titleCode"] == null ||
    isNaN(objadddata["titleCode"])
  ) {
    $(`.div-input-titleCode .custom-select`).addClass(isInvalidClass);
    $(`.div-input-titleCode .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    scrollToElement($(`.div-input-titleCode .custom-select`));
    isValidate = 1;
  } else {
    $(`.div-input-titleCode .custom-select`).removeClass(isInvalidClass);
  }

  if (objadddata["firstName"] == "" || objadddata["firstName"] == null) {
    $(`.div-input-firstName .form-control`).addClass(isInvalidClass);
    $(`.div-input-firstName .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    scrollToElement($(`.div-input-firstName .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-firstName .form-control`).removeClass(isInvalidClass);
  }

  if (objadddata["lastName"] == "" || objadddata["lastName"] == null) {
    $(`.div-input-lastName .form-control`).addClass(isInvalidClass);
    $(`.div-input-lastName .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    scrollToElement($(`.div-input-lastName .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-lastName .form-control`).removeClass(isInvalidClass);
  }

  if (objadddata["identityCardId"].length != 13) {
    $(`.div-input-identityCardId .form-control`).addClass(isInvalidClass);
    $(`.div-input-identityCardId .${validationErrorMessageClass}`).html(
      `ต้องเป็นเลข 13 หลักเท่านั้น`
    );
    scrollToElement($(`.div-input-identityCardId .form-control`));
    isValidate = 1;
  } else if (isNaN(Number(objadddata["identityCardId"]))) {
    $(`.div-input-identityCardId .form-control`).addClass(isInvalidClass);
    $(`.div-input-identityCardId .${validationErrorMessageClass}`).html(
      `ไม่สามารถมีตัวอักษรได้`
    );
    scrollToElement($(`.div-input-identityCardId .form-control`));
    isValidate = 1;
  } else {
    let sum = 0;
    let num;
    let lastNum = Number(
      objadddata["identityCardId"].slice(
        objadddata["identityCardId"].length - 1,
        objadddata["identityCardId"].length
      )
    );
    for (let i = 0; i < objadddata["identityCardId"].length - 1; i++) {
      num = Number(objadddata["identityCardId"].slice(i, i + 1));
      sum = sum + num * (13 - i);
    }
    let checkNum = 11 - (sum % 11);
    if (lastNum != checkNum % 10) {
      $(`.div-input-identityCardId .form-control`).addClass(isInvalidClass);
      $(`.div-input-identityCardId .${validationErrorMessageClass}`).html(
        `เลขที่บัตรไม่ถูกต้อง`
      );
      scrollToElement($(`.div-input-identityCardId .form-control`));
      isValidate = 1;
    } else {
      $(`.div-input-identityCardId .form-control`).removeClass(isInvalidClass);
    }
  }

  if (objadddata["email"] == "" || objadddata["email"] == null) {
    $(`.div-input-email .form-control`).addClass(isInvalidClass);
    $(`.div-input-email .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    scrollToElement($(`.div-input-email .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-email .form-control`).removeClass(isInvalidClass);
  }

  if (objadddata["phone"] == "" || objadddata["phone"] == null) {
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

  if (objadddata["lineID"] == "" || objadddata["lineID"] == null) {
    $(`.div-input-lineID .form-control`).addClass(isInvalidClass);
    $(`.div-input-lineID .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    scrollToElement($(`.div-input-lineID .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-lineID .form-control`).removeClass(isInvalidClass);
  }

  if (objadddata["workplace"] == "" || objadddata["workplace"] == null) {
    $(`.div-input-workplace .form-control`).addClass(isInvalidClass);
    $(`.div-input-workplace .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
    scrollToElement($(`.div-input-workplace .form-control`));
    isValidate = 1;
  } else {
    $(`.div-input-workplace .form-control`).removeClass(isInvalidClass);
  }

  if (
    objadddata["positionCode"] == "" ||
    objadddata["positionCode"] == null ||
    isNaN(objadddata["positionCode"])
  ) {
    $(`.div-input-positionCode .custom-select`).addClass(isInvalidClass);
    $(`.div-input-positionCode .${validationErrorMessageClass}`).html(
      `กรุณาระบุ`
    );
    scrollToElement($(`.div-input-positionCode .custom-select`));
    isValidate = 1;
  } else {
    $(`.div-input-positionCode .custom-select`).removeClass(isInvalidClass);
  }

  $.ajax({
    url: link + "/api/user/update",
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

let upLoadFile = function (uploadFileData, defer) {
  $.ajax({
    url: link + "/api/document/create",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: uploadFileData,
    dataType: "json",
    contentType: false,
    processData: false,
    success: function (res) {
      if (res.status.code == 200) {
        // toastr.success("บันทึกไฟล์สำเร็จ");
        defer.resolve(res.data);
      } else {
        toastr.error(res.status.message);
        defer.resolve(false);
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถบันทึกไฟล์ได้");
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

let renderEducation = function (educationList) {
  for (let data of educationList) {
    educationCount++;
    educationIdList.push(educationCount);
    $("#collapseCardEducation").append(`
        <div class="card-body" id="education${educationCount}" educationCode="${data.educationCode}">
                              <div class="form-group row">
                                <div class="col-sm-4 div-input-educationalQualificationCode${educationCount}">
                                  <select
                                    class="custom-select custom-select-sm educationalQualificationCode"
                                    name="educationalQualificationCode${educationCount}"
                                    id="educationalQualificationCode${educationCount}"
                                    data-size="4"
                                    disabled
                                  >
                                    <option selected disabled>วุฒิการศึกษา</option>
                                  </select>
                                  <div
                                    class="invalid-feedback validation-error-message"
                                  ></div>
                                  <span class="form-text text-muted"></span>
                                </div>
                                <div class="col-sm-4 div-input-majorCode${educationCount}">
                                  <input
                                    type="text"
                                    class="form-control form-control-sm"
                                    id="majorCode${educationCount}"
                                    placeholder="สาขา"
                                    disabled
                                  />
                                  <div
                                    class="invalid-feedback validation-error-message"
                                  ></div>
                                  <span class="form-text text-muted"></span>
                                </div>
                                <div class="col-sm-4 div-input-graduationYear${educationCount}">
                                  <input
                                    type="text"
                                    class="form-control form-control-sm"
                                    name="graduationYear"
                                    id="graduationYear${educationCount}"
                                    placeholder="ปีที่จบการศึกษา"
                                    disabled
                                  />
                                  <div
                                    class="invalid-feedback validation-error-message"
                                  ></div>
                                  <span class="form-text text-muted"></span>
                                </div>
                              </div>
                              <div class="form-group row">
                                <div class="col-sm-6 div-input-university${educationCount}">
                                  <input
                                    type="text"
                                    class="form-control form-control-sm"
                                    name="university"
                                    id="university${educationCount}"
                                    placeholder="มหาวิทยาลัย"
                                    disabled
                                  />
                                  <div
                                    class="invalid-feedback validation-error-message"
                                  ></div>
                                  <span class="form-text text-muted"></span>
                                </div>
                               
                              </div>
                            </div>
        `);

    let datepickerID = "graduationYear" + educationCount;
    $("#" + datepickerID).datepicker({
      format: "yyyy",
      startView: "years",
      viewMode: "years",
      minViewMode: "years",
      autoclose: true, //to close picker once year is selected
    });

    $.each(educationalQualificationMaster, function (i, item) {
      $(
        "select[name=educationalQualificationCode" + educationCount + "]"
      ).append(
        $("<option>", {
          value: item.educationalQualificationCode,
          text: item.educationalQualificationDesc,
        })
      );
    });

    $("select[name=educationalQualificationCode" + educationCount + "]").val(
      data.educationalQualificationCode
    );
    $("#majorCode" + educationCount).val(data.majorCode);
    $("#graduationYear" + educationCount).val(data.graduationYear);
    $("#university" + educationCount).val(data.university);
  }
};

let renderExperience = function (experienceList) {
  for (let data of experienceList) {
    experienceCount++;
    experienceIdList.push(experienceCount);
    $("#collapseCardExperience").append(`
        <div class="card-body" id="experience${experienceCount}" experienceCode="${data.experienceCode}">
                              <div class="form-group row">
                                <div class="col-sm-3 div-input-experienceTypeCode${experienceCount}">
                                  <select
                                    class="custom-select custom-select-sm experienceTypeCode"
                                    name="experienceTypeCode${experienceCount}"
                                    id="experienceTypeCode${experienceCount}"
                                    data-size="4"
                                    disabled
                                  >
                                    <option selected disabled>หมวดหมู่</option>
                                  </select>
                                  <div
                                    class="invalid-feedback validation-error-message"
                                  ></div>
                                  <span class="form-text text-muted"></span>
                                </div>
                                <div class="col-sm-3 div-input-positionCode${experienceCount}">
                                  <input
                                    type="text"
                                    class="form-control form-control-sm"
                                    name="positionCode${experienceCount}"
                                    id="positionCode${experienceCount}"
                                    placeholder="ตำแหน่ง"
                                    disabled
                                  />
                                  <div
                                    class="invalid-feedback validation-error-message"
                                  ></div>
                                  <span class="form-text text-muted"></span>
                                </div>
                                <div class="col-sm-3 div-input-beginYear${experienceCount}">
                                  <input
                                    type="text"
                                    class="form-control form-control-sm"
                                    name="beginYear"
                                    id="beginYear${experienceCount}"
                                    placeholder="ปีที่เริ่ม"
                                    disabled
                                  />
                                  <div
                                    class="invalid-feedback validation-error-message"
                                  ></div>
                                  <span class="form-text text-muted"></span>
                                </div>
                                <div class="col-sm-3 div-input-endYear${experienceCount}">
                                  <input
                                    type="text"
                                    class="form-control form-control-sm"
                                    name="endYear"
                                    id="endYear${experienceCount}"
                                    placeholder="ปีที่สิ้นสุด"
                                    disabled
                                  />
                                  <div
                                    class="invalid-feedback validation-error-message"
                                  ></div>
                                  <span class="form-text text-muted"></span>
                                </div>
                              </div>
                              <div class="form-group row">
                                <div class="col-sm-11">
                                <textarea
                                    type="text"
                                    class="form-control form-control-sm"
                                    name="experienceDetail"
                                    id="experienceDetail${experienceCount}"
                                    placeholder="รายละเอียด"
                                    disabled
                                ></textarea>
                                </div>
                                
                              </div>
                            </div>
        `);

    $("#" + "beginYear" + experienceCount).datepicker({
      format: "yyyy",
      startView: "years",
      viewMode: "years",
      minViewMode: "years",
      autoclose: true,
    });

    $("#" + "endYear" + experienceCount).datepicker({
      format: "yyyy",
      startView: "years",
      viewMode: "years",
      minViewMode: "years",
      autoclose: true,
    });

    $.each(experienceTypeMaster, function (i, item) {
      $("select[name=experienceTypeCode" + experienceCount + "]").append(
        $("<option>", {
          value: item.experienceTypeCode,
          text: item.experienceTypeDesc,
        })
      );
    });
    $("select[name=experienceTypeCode" + experienceCount + "]").val(
      data.experienceTypeCode
    );
    $("#positionCode" + experienceCount).val(data.positionCode);
    $("#beginYear" + experienceCount).val(data.beginYear);
    $("#endYear" + experienceCount).val(data.endYear);
    $("#experienceDetail" + experienceCount).val(data.experienceDetail);
  }
};
let renderTrainingCourse = function (trainingCourseList) {
  for (let data of trainingCourseList) {
    courseCount++;
    courseIdList.push(courseCount);
    $("#collapseCardCourse").append(`
        <div class="card-body" id="course${courseCount}" trainingCourseCode="${data.trainingCourseCode}">
                              <div class="form-group row">
                                <div class="col-sm-8">
                                  <input
                                    type="text"
                                    class="form-control form-control-sm"
                                    id="trainingCourseDesc${courseCount}"
                                    placeholder="ชื่อคอร์สอบรม"
                                    disabled
                                  />
                                </div>
                                <div class="col-sm-4">
                                  <input
                                    type="text"
                                    class="form-control form-control-sm"
                                    name="trainingYear"
                                    id="trainingYear${courseCount}"
                                    placeholder="ปีที่อบรม"
                                    disabled
                                  />
                                </div>
                              </div>
                              <div class="form-group row">
                              <div class="col-sm-8">
                              </div>
  
                              <a
                                  href="${link}/api/document/getFile/${data.documentId}"
                                  target="_blank"
                                  id="refFileUpload"
                                  ><i
                                  class="fa flaticon2-file-1 kt-font-primary"
                                  id="fileName"
                                  >${data.documentName}</i
                              ></a>
                              
                              <div class="col-sm-2">
                                
                              </div>
  
                              
                              </div>
                            </div>
        `);
    $("#" + "trainingYear" + courseCount).datepicker({
      format: "yyyy",
      startView: "years",
      viewMode: "years",
      minViewMode: "years",
      autoclose: true,
    });
    $("#trainingCourseDesc" + courseCount).val(data.trainingCourseDesc);
    $("#trainingYear" + courseCount).val(data.trainingYear);
  }
};

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

let isDateTime = function (dutyDate) {
  // Try to parse the date string
  const timestamp = Date.parse(dutyDate);

  // Check if the parsing was successful and not NaN
  if (!isNaN(timestamp)) {
    return true;
  }

  return false;
};

function ageCalculator(dob) {
  var dobParts = dob.split("/");

  var parts = dob.split("/");
  var date = new Date(parts[2], parts[1] - 1, parts[0]); // months are zero-based

  var currentDate = new Date();

  if (date > currentDate) {
    $(`.div-input-dateOfBirth .form-control`).addClass(isInvalidClass);
    $(`.div-input-dateOfBirth .${validationErrorMessageClass}`).html(
      `วันเกิดต้องไม่มากกว่าวันที่ปัจจุบัน`
    );
    $("#dateOfBirth").datepicker("setDate", new Date());
    return;
  } else {
    $(`.div-input-dateOfBirth .form-control`).removeClass(isInvalidClass);
  }

  if (dobParts.length !== 3) {
    toastr.error("รูปแบบวันที่ไม่ถูกต้อง");
    return;
  }

  var dob = new Date(
    parseInt(dobParts[2]), // Year
    parseInt(dobParts[1]) - 1, // Month (zero-based)
    parseInt(dobParts[0]) // Day
  );
  var currentDate = new Date();

  var years = currentDate.getFullYear() - dob.getFullYear();
  var months = currentDate.getMonth() - dob.getMonth();
  var days = currentDate.getDate() - dob.getDate();

  if (months < 0 || (months === 0 && days < 0)) {
    years--;
    months += 12;
  }

  if (days < 0) {
    var daysInLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    ).getDate();
    months--;
    days += daysInLastMonth;
  }

  return "อายุ: " + years + " ปี " + months + " เดือน " + days + " วัน";
}
