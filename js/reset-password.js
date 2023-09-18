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
let token;

$(document).ready(function () {
  let urlParams = new URLSearchParams(window.location.search);
  token = urlParams.get("token");
  //   console.log(token);
});

$("#resetPasswordButton").on("click", function () {
  let password = $(`#password`).val();
  let repeatPassword = $(`#repeatPassword`).val();

  let objData = {
    password: password,
    repeatPassword: repeatPassword,
  };
  isValidate = 0;

  let pattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+!.=])[a-zA-Z0-9@#$%^&+!.=]{8,}$/;
  let isValid = pattern.test(objData["password"]);

  if (!isValid) {
    $(`.div-input-password .form-control`).addClass(isInvalidClass);
    $(`.div-input-password .${validationErrorMessageClass}`).html(
      `ต้องมีอักษรตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว มีอักษรตัวพิมพ์ใหญ่อย่างน้อยหนึ่งตัว มีตัวเลขอย่างน้อยหนึ่งตัว มีอักขระพิเศษ @#$%^&+!.= อย่างน้อยหนึ่งตัว และมีความยาวอย่างน้อย 8 ตัวอักษร`
    );
    isValidate = 1;
  } else {
    $(`.div-input-password .form-control`).removeClass(isInvalidClass);
  }

  if (objData["repeatPassword"] != objData["password"]) {
    $(`.div-input-repeatPassword .form-control`).addClass(isInvalidClass);
    $(`.div-input-repeatPassword .${validationErrorMessageClass}`).html(
      `รหัสผ่านไม่ตรงกัน`
    );
    isValidate = 1;
  } else {
    $(`.div-input-repeatPassword .form-control`).removeClass(isInvalidClass);
  }

  if (isValidate == 1) {
    return;
  }

  $.ajax({
    url: link + "/api/User/updateResetPassword",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    data: JSON.stringify(objData),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (res) {
      if (res.status.code == 200) {
        window.location.href = "login.html";
      } else {
        toastr.error(res.status.message);
      }
    },
    error: function (res) {
      toastr.error("ไม่สามารถ ResetPassword ได้");
    },
  });
});
