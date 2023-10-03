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
let userData;
let urlParams;
$(document).ready(function () {
  let setupDataDefered = $.Deferred();
  SetupData.init(setupDataDefered);
  urlParams = new URLSearchParams(window.location.search);
  from = urlParams.get("from");

  $.when(setupDataDefered).done(function (success) {
    if (!success) {
      return;
    }
    stampTimeAttendance();
    $("#preloader").hide();
  });
});

let SetupData = (function () {
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
          $("#currentUserName").html(
            userData.firstName + " " + userData.lastName
          );
          $("#navProfileImg").attr(
            "src",
            `${link}/api/document/avatar/${userData.userId}`
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
  return {
    init: function (defered) {
      let userDataDefered = $.Deferred();
      loadUserData(userDataDefered);

      $.when(userDataDefered).done(function (userDataResult) {
        if (userDataResult) {
          defered.resolve(true);
        } else {
          defered.resolve(false);
        }
      });
    },
  };
})();

$("#logoutConfirm").on("click", function () {
  localStorage.clear();
  window.location.href = "login.html";
});

let stampTimeAttendance = function () {
  let objData = {
    userId: userData.userId,
    hospitalCode: parseInt(urlParams.get("hospitalCode")),
    locationCode: parseInt(urlParams.get("locationCode")),
    departmentCode: parseInt(urlParams.get("departmentCode")),
    timeAttendance: urlParams.get("time"),
  };
  $.ajax({
    url: link + "/api/dutySchedule/stampTimeAttendance",
    type: "POST",
    data: JSON.stringify(objData),
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        $("#attendanceType").html(res.data.status);
        $("#attendanceStatus").html("สำเร็จ");
        $("#crossMarkImg").hide();
        $("#checkImg").show();
      } else {
        $("#attendanceType").html(res.data.status);
        $("#attendanceStatus").html("ไม่สำเร็จ");
        $("#crossMarkImg").show();
        $("#checkImg").hide();
        toastr.error(res.status.message);
      }
    },
    error: function (res) {
      $("#attendanceType").html(res.data.status);
      $("#attendanceStatus").html("ไม่สำเร็จ");
      $("#crossMarkImg").show();
      $("#checkImg").hide();
      toastr.error("ไม่สามารถบันทึกเวลาได้", "Error");
    },
  });
};
