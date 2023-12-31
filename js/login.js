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
let from;
let urlParams;
$(document).ready(function () {
  urlParams = new URLSearchParams(window.location.search);
  from = urlParams.get("from");
  if (from == "registration") {
    toastr.success("ลงทะเบียนสำเร็จ");
  }

  if (from == "reset-password") {
    toastr.success("Reset รหัสผ่านสำเร็จ กรุณา Login อีกครั้ง");
  }

  if (from == "qrcode" && localStorage.getItem("token") != null) {
    window.location.href = `stampTimeAttendance.html?hospitalCode=${urlParams.get(
      "hospitalCode"
    )}&locationCode=${urlParams.get(
      "locationCode"
    )}&departmentCode=${urlParams.get("departmentCode")}&time=${urlParams.get(
      "time"
    )}`;
  }

  let setupDataDefered = $.Deferred();
  SetupData.init(setupDataDefered);
  localStorage.setItem("test", "12356");

  $.when(setupDataDefered).done(function (success) {
    if (!success) {
      return;
    }
  });
});

$("#loginButton").on("click", function () {
  let userName = $(`#userName`).val();
  let password = $(`#password`).val();
  let rememberMe = $(`#rememberMe`).is(":checked");
  let objData = {
    userName: userName,
    password: password,
    rememberMe: rememberMe,
  };
  $("#loginButton").addClass("disabled");
  $("#loginSpinner").show();
  $.ajax({
    url: link + "/api/user/login",
    type: "POST",
    data: JSON.stringify(objData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        $("#loginSpinner").hide();
        localStorage.setItem("token", res.data.token);
        if (from == "qrcode") {
          window.location.href = `stampTimeAttendance.html?hospitalCode=${urlParams.get(
            "hospitalCode"
          )}&locationCode=${urlParams.get(
            "locationCode"
          )}&departmentCode=${urlParams.get(
            "departmentCode"
          )}&time=${urlParams.get("time")}`;
        } else {
          window.location.href = res.data.appRoleMenu;
        }
        $("#loginButton").removeClass("disabled");
      } else {
        $("#loginSpinner").hide();
        $("#loginButton").removeClass("disabled");
        toastr.error(res.status.message);
      }
    },
    error: function (res) {
      $("#loginSpinner").hide();
      $("#loginButton").removeClass("disabled");
      toastr.error("ไม่สามารถ Login ได้", "Error");
    },
  });
});

function showPassword() {
  let element = document.getElementById("password");
  if (element.type === "password") {
    element.type = "text";
  } else {
    element.type = "password";
  }
}

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
