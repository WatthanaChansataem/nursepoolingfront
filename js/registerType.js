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

$(document).ready(function () {
  let setupDataDefered = $.Deferred();
  SetupData.init(setupDataDefered);

  $.when(setupDataDefered).done(function (success) {
    if (!success) {
      return;
    }
  });
});

$("#registerTypeDepartmentImage").on("click", function () {
  window.location.href = "registerDepartment.html";
});
$("#registerTypeDepartmentText").on("click", function () {
  window.location.href = "registerDepartment.html";
});

$("#registerTypeUserImage").on("click", function () {
  window.location.href = "register.html";
});
$("#registerTypeUserText").on("click", function () {
  window.location.href = "register.html";
});
let renderPage = function () {};

let SetupData = (function () {
  let loadUserData = function (defered) {
    $.ajax({
      url: link + "/api/user/version",
      type: "GET",
      success: function (res) {
        if (res.status.code == 200) {
          let userData = res.data;
          $("#version").html("Version " + userData.version);
          defered.resolve(true);
        } else {
          defered.resolve(false);
          toastr.error("ไม่สามารถดึงข้อมูลเวอร์ชันได้", "Error");
        }
      },
      error: function (res) {
        defered.resolve(false);
        toastr.error("ไม่สามารถดึงข้อมูลเวอร์ชันได้", "Error");
      },
    });
  };
  return {
    init: function (defered) {
      let loadUserDefer = $.Deferred();
      loadUserData(loadUserDefer);

      $.when(loadUserDefer).done(function (loadUserResult) {
        if (loadUserResult) {
          defered.resolve(true);
        } else {
          defered.resolve(false);
        }
      });
    },
  };
})();
