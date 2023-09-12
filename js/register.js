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
      url: "http://10.104.10.243:8082/api/title/list",
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
      url: "http://10.104.10.243:8082/api/educationalQualification/list",
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
      url: "http://10.104.10.243:8082/api/experienceType/list",
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
      url: "http://10.104.10.243:8082/api/position/list",
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
  return {
    init: function (defered) {
      let titleDefered = $.Deferred();
      let positionDefered = $.Deferred();
      let educationalQualificationDefered = $.Deferred();
      let experienceTypeDefer = $.Deferred();
      loadTitle(titleDefered);
      loadPosition(positionDefered);
      loadEducationalQualification(educationalQualificationDefered);
      loadExperienceType(experienceTypeDefer);

      $.when(
        titleDefered,
        positionDefered,
        educationalQualificationDefered,
        experienceTypeDefer
      ).done(function (
        titleResult,
        positionDefered,
        educationalQualificationResult,
        experienceTypeResult
      ) {
        if (
          titleResult &&
          positionDefered &&
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
  $("#professionalLicenseExpireDate").datepicker({
    format: "dd/mm/yyyy",
    autoclose: true,
    todayHighlight: true,
    todayBtn: true,
  });

  $("#dateOfBirth").datepicker({
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
  $.each(titleMaster, function (i, item) {
    $("select[name=titleCode]").append(
      $("<option>", {
        value: item.titleCode,
        text: item.titleDesc,
      })
    );
  });

  //   $("select[name=titleCode]").val(2);
  $("#addEducation").trigger("click");
  $("#addExperience").trigger("click");
  $("#addCourse").trigger("click");
};
$("#dateOfBirth").on("change", function () {
  $("#age").html(ageCalculator($("#dateOfBirth").val()));
});
$("#professionalLicenseExpireDate").on("change", function () {
  console.log("ca");
});
$("#titleCode").on("change", function () {
  if ($(this).val() == 4) {
    $(".div-input-titleOther").show();
  } else {
    $(".div-input-titleOther").hide();
  }
});

$("input[name=iDCardCopy]").on("change", function () {
  $(".iDCardCopyLabel").html($(this)[0].files[0].name);
  let changeElement = $("input[name=iDCardCopy]");
  var uploadata = new FormData();
  uploadata.append("documentName", changeElement[0].files[0].name);
  uploadata.append("document", changeElement[0].files[0]);
  uploadata.append("documentTypeCode", DocumentTypeCode.IDCardCopy);

  let defer = $.Deferred();
  upLoadFile(uploadata, defer);
  $.when(defer).done(function (result) {
    if (result) {
      resData = result;
      changeElement.attr("documentId", resData.documentId);
    }
  });
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

$("input[name=professionalLicenseCopy]").on("change", function () {
  $(".professionalLicenseCopyLabel").html(
    $("input[name=professionalLicenseCopy]")[0].files[0].name
  );
  let changeElement = $("input[name=professionalLicenseCopy]");
  var uploadata = new FormData();
  uploadata.append("documentName", changeElement[0].files[0].name);
  uploadata.append("document", changeElement[0].files[0]);
  uploadata.append(
    "documentTypeCode",
    DocumentTypeCode.ProfessionalLicenseCopy
  );

  let defer = $.Deferred();
  upLoadFile(uploadata, defer);
  $.when(defer).done(function (result) {
    if (result) {
      resData = result;
      changeElement.attr("documentId", resData.documentId);
    }
  });
});

$("#addEducation").on("click", function () {
  educationCount++;
  educationIdList.push(educationCount);
  $("#collapseCardEducation").append(`
    <div class="card-body" id="education${educationCount}">
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
                            <a
                                class="btn btn-danger btn-circle btn-sm"
                                id="removeEducation" onclick = "removeItemEducation(${educationCount})"
                            >
                                <i class="fas fa-times"></i>
                            </a>
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
    <div class="card-body" id="experience${experienceCount}">
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
                            <a
                            class="btn btn-danger btn-circle btn-sm"
                            id="removeExperience"
                            onclick="removeItemExperience(${experienceCount})"
                            >
                            <i class="fas fa-times"></i>
                            </a>
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
    <div class="card-body" id="course${courseCount}">
                          <div class="form-group row">
                            <div class="col-sm-8 div-input-trainingCourseDesc${courseCount}">
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                id="trainingCourseDesc${courseCount}"
                                placeholder="ชื่อคอร์สอบรม"
                              />
                              <div
                                class="invalid-feedback validation-error-message"
                              ></div>
                              <span class="form-text text-muted"></span>
                            </div>
                            <div class="col-sm-4 div-input-trainingYear${courseCount}">
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                name="trainingYear"
                                id="trainingYear${courseCount}"
                                placeholder="ปีที่อบรม"
                              />
                              <div
                                class="invalid-feedback validation-error-message"
                              ></div>
                              <span class="form-text text-muted"></span>
                            </div>
                          </div>
                          <div class="form-group row">
                          <div class="col-sm-8 div-input-formFileSm${courseCount}">
                            <input class="documentInput" id="formFileSm${courseCount}" name="formFileSm${courseCount}" onchange="changeItemCourse(${courseCount})" type="file" style="line-height: 1em;" />
                            <div
                                class="invalid-feedback validation-error-message"
                              ></div>
                              <span class="form-text text-muted"></span>
                          </div>
                          <div class="col-sm-2">
                            <a
                                class="btn btn-danger btn-circle btn-sm"
                                id="removeCourse" onclick = "removeItemCourse(${courseCount})"
                            >
                                <i class="fas fa-times"></i>
                            </a>
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

function changeItemCourse(value) {
  let changeElement = $(`input[name=formFileSm${value}]`);
  var uploadata = new FormData();
  uploadata.append("documentName", changeElement[0].files[0].name);
  uploadata.append("document", changeElement[0].files[0]);
  uploadata.append("documentTypeCode", DocumentTypeCode.TrainingCourse);

  let defer = $.Deferred();
  upLoadFile(uploadata, defer);
  $.when(defer).done(function (result) {
    if (result) {
      resData = result;
      changeElement.attr("documentId", resData.documentId);
    }
  });
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

    let obj = {
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

    let obj = {
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

    let obj = {
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

    if (
      obj["documentId"] == "" ||
      obj["documentId"] == null ||
      isNaN(obj["documentId"])
    ) {
      $(`.div-input-formFileSm${courseCount} .documentInput`).addClass(
        isInvalidClass
      );
      $(
        `.div-input-formFileSm${courseCount} .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      isValidate = 1;
    } else {
      $(`.div-input-formFileSm${courseCount} .documentInput`).removeClass(
        isInvalidClass
      );
    }

    courseSubmit.push(obj);
  }
  console.log(courseSubmit);

  console.log(localStorage.getItem("test"));

  // console.log($(`#pdpaCheck`).is(":checked"));
  let pdpaCheck = $(`#pdpaCheck`).is(":checked");
  if (pdpaCheck) {
    $(".alert").hide();

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

    let userName = $(`#userName`).val();
    let password = $(`#password`).val();
    let repeatPassword = $(`#repeatPassword`).val();

    let profileDocumentId = parseInt(
      $("input[name=changeProfileImage]").attr("documentId")
    );

    let iDCardCopyDocumentId = parseInt(
      $("input[name=iDCardCopy]").attr("documentId")
    );

    let professionalLicenseCopyDocumentId = parseInt(
      $("input[name=professionalLicenseCopy]").attr("documentId")
    );
    let professionalLicenseExpireDate = $(
      `#professionalLicenseExpireDate`
    ).val();

    let dateOfBirth = $(`#dateOfBirth`).val();

    let titleOther = $("#titleOther").val();

    let objadddata = {
      titleCode: titleCode,
      titleOther: titleOther,
      firstName: firstName,
      lastName: lastName,
      identityCardId: identityCardId,
      email: email,
      phone: phone,
      lineID: lineID,
      workplace: workplace,
      positionCode: positionCode,
      userName: userName,
      password: password,
      repeatPassword: repeatPassword,
      employeeNo: employeeNo,
      vendorNo: vendorNo,
      educations: educationSubmit,
      experiences: experienceSubmit,
      trainingCourses: courseSubmit,
      profileDocumentId: profileDocumentId,
      iDCardCopyDocumentId: iDCardCopyDocumentId,
      professionalLicenseCopyDocumentId: professionalLicenseCopyDocumentId,
      professionalLicenseExpireDate: professionalLicenseExpireDate,
      dateOfBirth: dateOfBirth,
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
      isValidate = 1;
    } else {
      $(`.div-input-userName .form-control`).removeClass(isInvalidClass);
    }

    let pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+!.=])[a-zA-Z0-9@#$%^&+!.=]{8,}$/;
    let isValid = pattern.test(objadddata["password"]);

    // if (isValid) {
    //   alert("Password is valid.");
    // } else {
    //   alert("Password is not valid.");
    // }

    if (!isValid) {
      $(`.div-input-password .form-control`).addClass(isInvalidClass);
      $(`.div-input-password .${validationErrorMessageClass}`).html(
        `ต้องมีอักษรตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว มีอักษรตัวพิมพ์ใหญ่อย่างน้อยหนึ่งตัว มีตัวเลขอย่างน้อยหนึ่งตัว มีอักขระพิเศษ @#$%^&+!.= อย่างน้อยหนึ่งตัว และมีความยาวอย่างน้อย 8 ตัวอักษร`
      );
      isValidate = 1;
    } else {
      $(`.div-input-password .form-control`).removeClass(isInvalidClass);
    }

    if (objadddata["repeatPassword"] != objadddata["password"]) {
      $(`.div-input-repeatPassword .form-control`).addClass(isInvalidClass);
      $(`.div-input-repeatPassword .${validationErrorMessageClass}`).html(
        `รหัสผ่านไม่ตรงกัน`
      );
      isValidate = 1;
    } else {
      $(`.div-input-repeatPassword .form-control`).removeClass(isInvalidClass);
    }

    if (
      objadddata["titleCode"] == "" ||
      objadddata["titleCode"] == null ||
      isNaN(objadddata["titleCode"])
    ) {
      $(`.div-input-titleCode .custom-select`).addClass(isInvalidClass);
      $(`.div-input-titleCode .${validationErrorMessageClass}`).html(
        `กรุณาระบุ`
      );
      isValidate = 1;
    } else {
      $(`.div-input-titleCode .custom-select`).removeClass(isInvalidClass);
    }

    if (
      objadddata["profileDocumentId"] == "" ||
      objadddata["profileDocumentId"] == null ||
      isNaN(objadddata["profileDocumentId"])
    ) {
      $(`.div-input-profileDocumentId .small`).addClass(isInvalidClass);
      $(`.div-input-profileDocumentId .${validationErrorMessageClass}`).html(
        `กรุณาระบุรูปโปรไฟล์`
      );
      isValidate = 1;
    } else {
      $(`.div-input-profileDocumentId .small`).removeClass(isInvalidClass);
    }

    if (
      objadddata["titleCode"] == 4 &&
      (objadddata["titleOther"] == "" || objadddata["titleOther"] == null)
    ) {
      $(`.div-input-titleOther .form-control`).addClass(isInvalidClass);
      $(`.div-input-titleOther .${validationErrorMessageClass}`).html(
        `กรุณาระบุ`
      );
      isValidate = 1;
    } else {
      $(`.div-input-titleOther .form-control`).removeClass(isInvalidClass);
    }

    if (objadddata["firstName"] == "" || objadddata["firstName"] == null) {
      $(`.div-input-firstName .form-control`).addClass(isInvalidClass);
      $(`.div-input-firstName .${validationErrorMessageClass}`).html(
        `กรุณาระบุ`
      );
      isValidate = 1;
    } else {
      $(`.div-input-firstName .form-control`).removeClass(isInvalidClass);
    }

    if (objadddata["lastName"] == "" || objadddata["lastName"] == null) {
      $(`.div-input-lastName .form-control`).addClass(isInvalidClass);
      $(`.div-input-lastName .${validationErrorMessageClass}`).html(
        `กรุณาระบุ`
      );
      isValidate = 1;
    } else {
      $(`.div-input-lastName .form-control`).removeClass(isInvalidClass);
    }

    if (objadddata["identityCardId"].length != 13) {
      $(`.div-input-identityCardId .form-control`).addClass(isInvalidClass);
      $(`.div-input-identityCardId .${validationErrorMessageClass}`).html(
        `ต้องเป็นเลข 13 หลักเท่านั้น`
      );
      isValidate = 1;
    } else if (isNaN(Number(objadddata["identityCardId"]))) {
      $(`.div-input-identityCardId .form-control`).addClass(isInvalidClass);
      $(`.div-input-identityCardId .${validationErrorMessageClass}`).html(
        `ไม่สามารถมีตัวอักษรได้`
      );
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
        isValidate = 1;
      } else {
        $(`.div-input-identityCardId .form-control`).removeClass(
          isInvalidClass
        );
      }
    }

    if (objadddata["email"] == "" || objadddata["email"] == null) {
      $(`.div-input-email .form-control`).addClass(isInvalidClass);
      $(`.div-input-email .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
      isValidate = 1;
    } else {
      $(`.div-input-email .form-control`).removeClass(isInvalidClass);
    }

    if (
      objadddata["phone"] == "" ||
      objadddata["phone"] == null ||
      objadddata["phone"].length != 10
    ) {
      $(`.div-input-phone .form-control`).addClass(isInvalidClass);
      $(`.div-input-phone .${validationErrorMessageClass}`).html(
        `กรุณาระบุเบอร์โทรศัพท์ไม่เกิน 10 หลัก`
      );
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

    if (objadddata["lineID"] == "" || objadddata["lineID"] == null) {
      $(`.div-input-lineID .form-control`).addClass(isInvalidClass);
      $(`.div-input-lineID .${validationErrorMessageClass}`).html(`กรุณาระบุ`);
      isValidate = 1;
    } else {
      $(`.div-input-lineID .form-control`).removeClass(isInvalidClass);
    }

    if (objadddata["workplace"] == "" || objadddata["workplace"] == null) {
      $(`.div-input-workplace .form-control`).addClass(isInvalidClass);
      $(`.div-input-workplace .${validationErrorMessageClass}`).html(
        `กรุณาระบุ`
      );
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
      isValidate = 1;
    } else {
      $(`.div-input-positionCode .custom-select`).removeClass(isInvalidClass);
    }

    if (isNaN(objadddata["iDCardCopyDocumentId"])) {
      $(`.div-input-iDCardCopy .form-control`).addClass(isInvalidClass);
      $(`.div-input-iDCardCopy .${validationErrorMessageClass}`).html(
        `กรุณาระบุ`
      );
      isValidate = 1;
    } else {
      $(`.div-input-iDCardCopy .form-control`).removeClass(isInvalidClass);
    }

    if (isNaN(objadddata["professionalLicenseCopyDocumentId"])) {
      $(`.div-input-professionalLicenseCopy .form-control`).addClass(
        isInvalidClass
      );
      $(
        `.div-input-professionalLicenseCopy .${validationErrorMessageClass}`
      ).html(`กรุณาระบุ`);
      isValidate = 1;
    } else {
      $(`.div-input-professionalLicenseCopy .form-control`).removeClass(
        isInvalidClass
      );
    }

    if (objadddata["positionCode"] == 1) {
      if (
        objadddata["professionalLicenseExpireDate"] == "" ||
        objadddata["professionalLicenseExpireDate"] == null
      ) {
        $(`.div-input-professionalLicenseExpireDate .form-control`).addClass(
          isInvalidClass
        );
        $(
          `.div-input-professionalLicenseExpireDate .${validationErrorMessageClass}`
        ).html(`กรุณาระบุ`);
        isValidate = 1;
      } else {
        $(`.div-input-professionalLicenseExpireDate .form-control`).removeClass(
          isInvalidClass
        );
      }
    } else {
      $(`.div-input-professionalLicenseExpireDate .form-control`).removeClass(
        isInvalidClass
      );
    }

    if (objadddata["dateOfBirth"] == "" || objadddata["dateOfBirth"] == null) {
      $(`.div-input-dateOfBirth .form-control`).addClass(isInvalidClass);
      $(`.div-input-dateOfBirth .${validationErrorMessageClass}`).html(
        `กรุณาระบุ`
      );
      isValidate = 1;
    } else {
      $(`.div-input-dateOfBirth .form-control`).removeClass(isInvalidClass);
    }

    if (isValidate == 1) {
      return;
    }
    $.ajax({
      url: "http://10.104.10.243:8082/api/user/create",
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
  } else {
    $(".alert").show();
  }
  // FileUpload
  // if ($("input[name=fieldcreditcontrolzone]")[0].files.length > 0) {
  //   console.log($("input[name=fieldcreditcontrolzone]")[0].files[0]);
  //   var data = new FormData();
  //   data.append(
  //     "documentName",
  //     $("input[name=fieldcreditcontrolzone]")[0].files[0].name
  //   );
  //   data.append(
  //     "document",
  //     $("input[name=fieldcreditcontrolzone]")[0].files[0]
  //   );
  //   // data.append("documentId", document.documentId);

  // } else {
  // }
});

let LoadDutyFile = function () {
  $.ajax({
    url: "http://10.104.10.243:8082/api/document/list",
    type: "GET",
    success: function (res) {
      if (res.status.code == 200) {
        console.log(res.data);
        $("#fileName").html(res.data[0].fileName);
        // var refFileUpload = $("#refFileUpload");
        // refFileUpload.attr("href", res.data[0].contentType + res.data[0].content);
      } else {
        toastr.error("ไม่สามารถดึงข้อมูลเอกสารได้", "Error");
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถดึงข้อมูลเอกสารได้", "Error");
    },
  });
};

let upLoadFile = function (uploadFileData, defer) {
  $.ajax({
    url: "http://10.104.10.243:8082/api/document/create",
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

let upLoadFileWithContent = function (uploadFileData, defer) {
  $.ajax({
    url: "http://10.104.10.243:8082/api/document/createWithContent",
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
