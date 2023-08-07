let LawAddressCustomerTypeConstant = {
  Customer: "C",
  Guarantor: "G",
};

var SelectElement = (function () {
  return {
    init: function (
      target,
      data,
      key,
      value,
      initialValue = 0,
      defaultKey = null,
      defaultValue = null
    ) {
      target.selectpicker();
      target.empty();
      if (defaultKey != null) {
        target.append(new Option(defaultValue, defaultKey));
      }
      for (let d of data) {
        target.append(new Option(d[value], d[key]));
      }
      target.selectpicker("refresh");
      if (initialValue != 0) {
        target.val(initialValue);
      }
      target.selectpicker("refresh");
    },
    withActiveStatus: function (
      target,
      data,
      key,
      value,
      initialValue = 0,
      defaultKey = null,
      defaultValue = null
    ) {
      target.selectpicker();
      target.empty();
      if (defaultKey != null) {
        target.append(new Option(defaultValue, defaultKey));
      }
      for (let d of data) {
        if (d["active"] == 1) {
          target.append(new Option(d[value], d[key]));
        }
      }
      target.selectpicker("refresh");
      if (initialValue != 0) {
        target.val(initialValue);
      }
      target.selectpicker("refresh");
    },
    initByMapMasterData: function (
      target,
      data,
      key,
      value,
      initialValue = 0,
      defaultKey = null,
      defaultValue = null,
      separator = " "
    ) {
      target.selectpicker();
      target.empty();
      if (defaultKey != null) {
        target.append(new Option(defaultValue, defaultKey));
      }
      for (let keyData of data.keys()) {
        let values = [];
        if (Array.isArray(value)) {
          values = value;
        } else {
          values = [value];
        }
        let desc = "";
        for (let i = 0; i < values.length; i++) {
          if (i == values.length - 1) {
            desc += data.get(keyData)[values[i]];
          } else {
            desc += data.get(keyData)[values[i]] + separator;
          }
        }
        target.append(new Option(desc, data.get(keyData)[key]));
      }
      target.selectpicker("refresh");
      if (initialValue != 0) {
        target.val(initialValue);
      }
      target.selectpicker("refresh");
    },
    initUserSelect2ByMapMasterData: function (
      target,
      data,
      key,
      value,
      initialValue = 0,
      defaultKey = null,
      defaultValue = null
    ) {
      target.empty();
      if (defaultKey != null) {
        target.append(new Option(defaultValue, defaultKey));
      }
      for (let keyData of data.keys()) {
        target.append(
          new Option(
            data.get(keyData)["firstName"] +
              " " +
              data.get(keyData)["lastName"],
            data.get(keyData)[key]
          )
        );
      }
      if (initialValue != 0) {
        target.val(initialValue);
      }
      target.select2({
        matcher: this.matchSelect2,
      });
    },
    withActiveStatusByMapMasterData: function (
      target,
      data,
      key,
      value,
      initialValue = 0,
      defaultKey = null,
      defaultValue = null,
      separator = " : ",
      filterKey = "active",
      filterValue = 1,
      enableDisableDefault = false
    ) {
      target.selectpicker();
      target.empty();
      let defaultKeys = [];
      let defaultValues = [];
      if (defaultKey != null) {
        if (Array.isArray(defaultKey)) {
          defaultKeys = defaultKey;
          defaultValues = defaultValue;
        } else {
          defaultKeys = [defaultKey];
          defaultValues = [defaultValue];
        }
      }
      for (let i = 0; i < defaultKeys.length; i++) {
        if (
          data.get(defaultKeys[i]) == null ||
          data.get(defaultKeys[i])[filterKey] != filterValue
        ) {
          let disabled = "";
          if (
            enableDisableDefault &&
            (data.get(defaultKeys[i]) == null ||
              data.get(defaultKeys[i])[filterKey] != filterValue)
          ) {
            disabled = "disabled";
          }
          target.append(
            `<option value="${defaultKeys[i]}" ${disabled}>${defaultValue}</option>`
          );
        }
      }

      for (let keyData of data.keys()) {
        if (data.get(keyData)[filterKey] == filterValue) {
          let values = [];
          if (Array.isArray(value)) {
            values = value;
          } else {
            values = [value];
          }
          let desc = "";
          for (let i = 0; i < values.length; i++) {
            if (i == values.length - 1) {
              desc += data.get(keyData)[values[i]];
            } else {
              desc += data.get(keyData)[values[i]] + separator;
            }
          }
          target.append(new Option(desc, data.get(keyData)[key]));
        }
      }
      if (
        initialValue != null &&
        initialValue != 0 &&
        initialValue != "0" &&
        initialValue != ""
      ) {
        let initialValues = [];
        if (Array.isArray(initialValue)) {
          initialValues = initialValue;
        } else {
          initialValues = [initialValue];
        }
        let renderValues = [];
        target.selectpicker("val", initialValues);
      }
      target.selectpicker("refresh");
    },
    withActiveStatusAndMultipleValuesByMapMasterData: function (
      target,
      data,
      key,
      values,
      separator = "",
      initialValue = 0,
      defaultKey = null,
      defaultValue = null
    ) {
      target.selectpicker();
      target.empty();
      if (defaultKey != null) {
        target.append(new Option(defaultValue, defaultKey));
      }
      for (let keyData of data.keys()) {
        if (data.get(keyData).active == 1) {
          let obj = data.get(keyData);
          let value = "";
          for (let i = 0; i < values.length; i++) {
            if (i == values.length - 1) {
              value += obj[values[i]];
            } else {
              value += obj[values[i]] + separator;
            }
          }
          target.append(new Option(value, keyData));
        }
      }
      target.selectpicker("refresh");
      if (initialValue != 0 && initialValue != "0" && initialValue != "") {
        target.val(initialValue);
      }
      target.selectpicker("refresh");
    },
    renderUserWithActiveStatus: function (target, data, key, initialValue = 0) {
      target.selectpicker();
      target.empty();
      for (let d of data) {
        if (d["active"] == 1) {
          target.append(
            new Option(d["firstName"] + " " + d["lastName"], d[key])
          );
        }
      }
      target.selectpicker("refresh");
      if (initialValue != 0 && initialValue != "0" && initialValue != "") {
        target.val(initialValue);
      }
      target.selectpicker("refresh");
    },
    renderUser: function (target, data, key, initialValue = 0) {
      target.selectpicker();
      target.empty();
      for (let d of data) {
        target.append(new Option(d["firstName"] + " " + d["lastName"], d[key]));
      }
      target.selectpicker("refresh");
      if (initialValue != 0) {
        target.val(initialValue);
      }
      target.selectpicker("refresh");
    },
    matchSelect2: function (params, data) {
      if ($.trim(params.term) === "") {
        return data;
      }

      if (typeof data.text === "undefined") {
        return null;
      }

      if (
        data.text.indexOf(params.term) > -1 ||
        data.id.indexOf(params.term) > -1
      ) {
        var modifiedData = $.extend({}, data, true);
        // modifiedData.text += ' (matched)';
        return modifiedData;
      }

      return null;
    },
    initSelect2ByMapMasterData: function (
      target,
      data,
      key,
      value,
      initialValue = 0,
      defaultKey = null,
      defaultValue = null
    ) {
      target.empty();
      if (defaultKey != null) {
        target.append(new Option(defaultValue, defaultKey));
      }
      for (let keyData of data.keys()) {
        target.append(
          new Option(data.get(keyData)[value], data.get(keyData)[key])
        );
      }
      if (initialValue != 0) {
        target.val(initialValue);
      }
      target.select2({
        matcher: this.matchSelect2,
      });
    },
    initSelect2ByMapMasterDataWithMultipleValues: function (
      target,
      data,
      key,
      values,
      initialValue = 0,
      defaultKey = null,
      defaultValue = null
    ) {
      target.empty();
      if (defaultKey != null) {
        target.append(new Option(defaultValue, defaultKey));
      }
      for (let keyData of data.keys()) {
        let d = data.get(keyData);
        let text = "";
        for (let i = 0; i < values.length; i++) {
          if (i == values.length - 1) {
            text += d[values[i]];
          } else {
            text += d[values[i]] + ": ";
          }
        }
        target.append(new Option(text, d[key]));
      }
      if (initialValue != 0) {
        target.val(initialValue);
      }
      target.select2({
        matcher: this.matchSelect2,
      });
    },
    initMultipleByMapMasterData: function (
      target,
      data,
      key,
      value,
      initialValue = 0,
      defaultKey = null,
      defaultValue = null
    ) {
      if (!target.is("multiple")) {
        target.attr("multiple", "");
      }
      target.selectpicker();
      target.empty();
      target.change(function () {
        let checkSelectAllValue = $(this)
          .val()
          .some((s) => s === "-1");
        let checkCurrentSelect = $(this).attr("currentSelect");
        let listValueSelectAll = [];
        if (checkCurrentSelect) {
          if (!checkSelectAllValue) {
            $(this).val([]);
            $(this).selectpicker("refresh");
          } else {
            if (
              $(this).find("option[value!='-1']").length !==
              $(this)
                .val()
                .filter((s) => s !== "-1").length
            ) {
              $(this).val(
                $(this)
                  .val()
                  .filter((s) => s !== "-1")
              );
              $(this).selectpicker("refresh");
            }
          }
          $(this).removeAttr("currentSelect");
        } else {
          if (checkSelectAllValue) {
            $(this)
              .find("option")
              .each(function () {
                listValueSelectAll.push($(this).val());
              });
            $(this).val(listValueSelectAll);
            $(this).selectpicker("refresh");
            $(this).attr("currentSelect", true);
            $(this)
              .siblings("button.dropdown-toggle")
              .find("div.filter-option-inner-inner")
              .text($(this).find("option[value='-1']").text());
          } else {
            if (
              $(this).find("option[value!='-1']").length ===
              $(this)
                .val()
                .filter((s) => s !== "-1").length
            ) {
              $(this)
                .find("option")
                .each(function () {
                  listValueSelectAll.push($(this).val());
                });
              $(this).val(listValueSelectAll);
              $(this).selectpicker("refresh");
              $(this).attr("currentSelect", true);
              $(this)
                .siblings("button.dropdown-toggle")
                .find("div.filter-option-inner-inner")
                .text($(this).find("option[value='-1']").text());
            }
          }
        }
      });
      if (defaultKey != null) {
        let defaultOptionSelect = new Option(defaultValue, defaultKey);
        defaultOptionSelect.setAttribute("data-tokens", defaultKey);
        target.append(defaultOptionSelect);
      }
      for (let keyData of data.keys()) {
        let optionSelect = new Option(
          data.get(keyData)[value],
          data.get(keyData)[key]
        );
        optionSelect.setAttribute("data-tokens", data.get(keyData)[key]);
        target.append(optionSelect);
      }
      target.selectpicker("refresh");
      if (initialValue != 0) {
        target.val(initialValue);
      }
      target.change();
    },
    dynamicInit: function (
      target,
      data,
      key,
      valueFunction,
      initialValue = null,
      defaultKey = null,
      defaultValue = null
    ) {
      target.selectpicker();
      target.empty();
      if (defaultKey != null) {
        target.append(new Option(defaultValue, defaultKey));
      }
      for (let d of data) {
        let value = valueFunction(d);
        target.append(new Option(value, d[key]));
      }
      target.selectpicker("refresh");
      if (initialValue != null) {
        target.val(initialValue);
      }
      target.selectpicker("refresh");
    },
    renderCustomer: function (target, data, key, initialValue = 0) {
      target.selectpicker();
      target.empty();
      for (let d of data) {
        target.append(new Option(d["firstname"] + " " + d["lastname"], d[key]));
      }
      target.selectpicker("refresh");
      if (initialValue != 0) {
        target.val(initialValue);
      }
      target.selectpicker("refresh");
    },
  };
})();
