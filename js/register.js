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
            educationalQualificationMap.set(data.positionCode, data);
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
};

$("input[name=iDCardCopy]").on("change", function () {
  $(".iDCardCopyLabel").html($("input[name=iDCardCopy]")[0].files[0].name);
});

$("input[name=professionalLicenseCopy]").on("change", function () {
  $(".professionalLicenseCopyLabel").html(
    $("input[name=professionalLicenseCopy]")[0].files[0].name
  );
});

$("#addEducation").on("click", function () {
  educationCount++;
  educationIdList.push(educationCount);
  $("#collapseCardEducation").append(`
    <div class="card-body" id="education${educationCount}">
                          <div class="form-group row">
                            <div class="col-sm-4">
                              <select
                                class="custom-select custom-select-sm educationalQualificationCode"
                                name="educationalQualificationCode${educationCount}"
                                id="educationalQualificationCode${educationCount}"
                                data-size="4"
                              >
                                <option selected disabled>วุฒิการศึกษา</option>
                              </select>
                            </div>
                            <div class="col-sm-4">
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                id="majorCode${educationCount}"
                                placeholder="สาขา"
                              />
                            </div>
                            <div class="col-sm-4">
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                name="graduationYear"
                                id="graduationYear${educationCount}"
                                placeholder="ปีที่จบการศึกษา"
                              />
                            </div>
                          </div>
                          <div class="form-group row">
                            <div class="col-sm-6">
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                name="university"
                                id="university${educationCount}"
                                placeholder="มหาวิทยาลัย"
                              />
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
                            <div class="col-sm-3">
                              <select
                                class="custom-select custom-select-sm experienceTypeCode"
                                name="experienceTypeCode${experienceCount}"
                                id="experienceTypeCode${experienceCount}"
                                data-size="4"
                              >
                                <option selected disabled>หมวดหมู่</option>
                              </select>
                            </div>
                            <div class="col-sm-3">
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                name="positionCode${experienceCount}"
                                id="positionCode${experienceCount}"
                                placeholder="ตำแหน่ง"
                              />
                            </div>
                            <div class="col-sm-3">
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                name="beginYear"
                                id="beginYear${experienceCount}"
                                placeholder="ปีที่เริ่ม"
                              />
                            </div>
                            <div class="col-sm-3">
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                name="endYear"
                                id="endYear${experienceCount}"
                                placeholder="ปีที่สิ้นสุด"
                              />
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
                            <input class="" id="formFileSm${courseCount}" name="formFileSm${courseCount}" onchange="changeItemCourse(${courseCount})" type="file" style="line-height: 1em;" />
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
  let changeElement = $(`input[name=formFileSm${courseCount}]`);
  console.log("changeItemCourse:", changeElement[0].files[0].name);
  // changeElement.html(
  //   changeElement[0].files[0].name
  // );
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
      console.log(resData);
      console.log(changeElement.attr("documentId"));
    }
  });
  // upLoadFile(uploadata);
}

$("#submitRegister").on("click", function () {
  let educationSubmit = [];
  let experienceSubmit = [];
  let courseSubmit = [];

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
    courseSubmit.push(obj);
  }
  console.log(courseSubmit);

  console.log(sessionStorage.getItem("test"));

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

    let objadddata = {
      titleCode: titleCode,
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
      employeeNo: employeeNo,
      vendorNo: vendorNo,
      educations: educationSubmit,
      experiences: experienceSubmit,
      trainingCourses: courseSubmit,
    };

    console.log(objadddata);
    $.ajax({
      url: "https://localhost:7063/api/user/create",
      type: "POST",
      data: JSON.stringify(objadddata),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (res) {
        if (res.status.code == 200) {
          toastr.success("ลงทะเบียนสำเร็จ");
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
    url: "https://localhost:7063/api/document/list",
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
    url: "https://localhost:7063/api/document/create",
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

let upLoadFileTest = function (uploadFileData) {
  return "upload";
};
