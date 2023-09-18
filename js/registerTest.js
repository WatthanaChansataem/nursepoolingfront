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
let educationCount = 0;
let educationIdList = [];
let experienceCount = 0;
let experienceIdList = [];
let courseCount = 0;
let courseIdList = [];

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

  let loadPosition = function (defered) {
    $.ajax({
      url: link + "/api/position/list",
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
      loadTitle(titleDefered);
      loadPosition(positionDefered);

      $.when(titleDefered, positionDefered).done(function (
        titleResult,
        positionDefered
      ) {
        if (titleResult && positionDefered) {
          defered.resolve(true);
        } else {
          defered.resolve(false);
        }
      });
    },
  };
})();

let renderPage = function () {
  //   renderSelectElement(
  //     $("select[name=titleCode]"),
  //     titleMaster,
  //     "titleCode",
  //     "titleDesc"
  //   );
  //   <option selected disabled>
  //     Choose one
  //   </option>;
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

$("#addEducation").on("click", function () {
  educationCount++;
  educationIdList.push(educationCount);
  $("#collapseCardEducation").append(`
    <div class="card-body" id="education${educationCount}">
                          <div class="form-group row">
                            <div class="col-sm-4">
                              <select
                                class="custom-select custom-select-sm educationalQualificationCode"
                                name="educationalQualificationCode"
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
                                name="experienceTypeCode"
                                id="experienceTypeCode${experienceCount}"
                                data-size="4"
                              >
                                <option selected disabled>หมวดหมู่</option>
                              </select>
                            </div>
                            <div class="col-sm-3">
                              <select
                                class="custom-select custom-select-sm positionCode"
                                name="positionCode${experienceCount}"
                                id="positionCode${experienceCount}"
                                data-size="4"
                              >
                                <option selected disabled>ตำแหน่ง</option>
                              </select>
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

  $.each(positionMaster, function (i, item) {
    $("select[name=positionCode" + experienceCount + "]").append(
      $("<option>", {
        value: item.positionCode,
        text: item.positionDesc,
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
                                id="majorCode${courseCount}"
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
                            <input class="" id="formFileSm${courseCount}" type="file" style="line-height: 1em;" />
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

$("#submitRegister").on("click", function () {
  let educationSubmit = [];
  let experienceSubmit = [];
  let courseSubmit = [];

  for (let i = 0; i < educationIdList.length; i++) {
    let educationCount = educationIdList[i];
    let educationalQualificationCode = $(
      `#educationalQualificationCode${educationCount}`
    ).val();
    let majorCode = $(`#majorCode${educationCount}`).val();
    let graduationYear = $(`#graduationYear${educationCount}`).val();
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

    let educationalQualificationCode = $(
      `#educationalQualificationCode${educationCount}`
    ).val();
    let majorCode = $(`#majorCode${educationCount}`).val();
    let graduationYear = $(`#graduationYear${educationCount}`).val();
    let university = $(`#university${educationCount}`).val();

    let obj = {
      educationalQualificationCode,
      majorCode,
      graduationYear,
      university,
    };
    experienceSubmit.push(obj);
  }
  console.log(experienceSubmit);

  for (let i = 0; i < courseIdList.length; i++) {
    let courseCount = courseIdList[i];

    // let majorCode = $(`#majorCode${courseCount}`).val();
    // let graduationYear = $(`#graduationYear${courseCount}`).val();
    // let formFileSm = $(`#formFileSm1`).files[0];

    // let obj = {
    //   formFileSm,
    // };
    // courseSubmit.push(obj);
  }
  console.log(courseSubmit);

  let testfile = $("#testFile").files[0];
  console.log(testfile);

  toastr.error("Something went wrong!", "Error");
});
