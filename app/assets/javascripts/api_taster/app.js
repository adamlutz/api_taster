var ApiTaster = {

  disableSubmitButton: function() {
    $("#submit-api").attr("disabled", true);
  },

  enableSubmitButton: function() {
    $("#submit-api").attr("disabled", false);
  },

  disableUrlParams: function() {
    $("fieldset[ref=url-params] input").prop("disabled", true);
  },

  enableUrlParams: function() {
    $("fieldset[ref=url-params] input").prop("disabled", false);
  },

  detectContentType: function(response) {
    var contentType = response.getResponseHeader("Content-Type");
    var detectedContentType = null

    if (contentType.match(/application\/json/)) {
       detectedContentType = 'json';
    }

    return detectedContentType;
  },


  fillInInfoTab: function($tab, xhr) {
    // $tab.find('.status td.value').text(xhr.status + " " + xhr.statusText);
    // $tab.find('.headers td.value').text(xhr.getAllResponseHeaders());

    // timeTaken = ApiTaster.lastRequest.endTime - ApiTaster.lastRequest.startTime
    // $tab.find('.time td.value').text(timeTaken + " ms");

    // if (ApiTaster.detectContentType(xhr) === 'json')
    // {
    //   $tab.find('.result td.value').text(JSON.stringify(JSON.parse(xhr.responseText), null, 2));
    // }
  },

  // fillInInfoTab: function($tab, xhr) {
  //   $tab.find('.status td.value').text(xhr.status + " " + xhr.statusText);
  //   $tab.find('.headers td.value').text(xhr.getAllResponseHeaders());

  //   timeTaken = ApiTaster.lastRequest.endTime - ApiTaster.lastRequest.startTime
  //   $tab.find('.time td.value').text(timeTaken + " ms");
  // },

  getSubmitUrl: function($form) {
    var baseUrl = $form.attr('action');
    var matches = baseUrl.match(/\:[^\/]+/g)

    if (matches) {
      for(var a = 0; a < matches.length; a++) {
        var match = matches[a];
        var str = match.substr(1);

        var $input = $form.find(
          'input[name="' + str + '"],input[name="[api_taster_url_params]' + str + '"]'
        );

        if ($input.length > 0) {
          baseUrl = baseUrl.replace(match, $input.val());
        }
      }
    }

    return baseUrl;
  },

  // Added by gajanan
  serializeForm: function()
  {
      var o = {};
      var a = $form.serializeArray();
      $.each(a, function() {
          if (o[this.name] !== undefined) {
              if (!o[this.name].push) {
                  o[this.name] = [o[this.name]];
              }
              o[this.name].push(this.value || '');
          } else {
              o[this.name] = this.value || '';
          }
      });
      return o;
  }

};

$.fn.extend({

  enableNavTabsFor: function(contentElement) {
    var $container = $(this);

    $container.find("ul.nav-tabs a").click(function() {
      $link = $(this);
      $li =  $link.parent();

      $li.addClass("active").siblings().removeClass("active");

      $container.find(contentElement).hide();
      $container.find(contentElement + "[ref=" + $link.attr("id") + "]").show();
      return false;
    });
  },

  showNavTab: function(name) {
    $response = $(this);
    $response.find("ul.nav-tabs li").removeClass("active");
    $response.find("ul.nav-tabs li a#response-" + name).parent().show().addClass("active");

    $response.find("pre").hide();

    return $response.find("pre[ref=response-" + name + "]").show();
  },

  displayOnlySelectedParamsFieldset: function() {
    $("fieldset", this).hide();
    $("fieldset[ref=" + $("ul.nav-tabs li.active a").attr("id") + "]", this).show();
  }

});

jQuery(function($) {
  $("#list-api-div a").click(function(e) {
    e.preventDefault();

    $(this).parent().siblings().removeClass("active");
    $(this).parent().addClass("active");

    $("#show-api-div .div-container").load(this.href, function() {
      prettyPrint();

      $("#show-api-div form").enableNavTabsFor("fieldset");
      $("#show-api-div form").displayOnlySelectedParamsFieldset();

      $("#show-api-div form").submit(onSubmit);
      $("#show-api-response-div").enableNavTabsFor("pre");
    });
  });

  function onSubmit(e) {
    $form = $(e.target);
    ApiTaster.disableSubmitButton();
    ApiTaster.disableUrlParams();
    $("#req-json").val('');

    var submit_type = $("#submit-type").val();

    window.ajax = $.ajax({
      url: ApiTaster.getSubmitUrl($form),
      type: $form.attr('method'),
      data: $form.serialize(),
      dataType: submit_type
    }).complete(onComplete);

    ApiTaster.lastRequest = {};
    ApiTaster.lastRequest.startTime = Date.now();

    return false;
  }

  function onComplete(xhr, status) {
    ApiTaster.lastRequest.endTime = Date.now();
    ApiTaster.enableSubmitButton();
    ApiTaster.enableUrlParams();

    if ($("#show-api-response-div:visible").length == 0) {
      $("#show-api-response-div").slideDown(100);
    }

    // ApiTaster.fillInInfoTab(
    //   $("#show-api-response-div").showNavTab("json"),
    //   xhr
    // );
    // $tab.find('.status td.value').text(xhr.status + " " + xhr.statusText);
    // $tab.find('.headers td.value').text(xhr.getAllResponseHeaders());

    // timeTaken = ApiTaster.lastRequest.endTime - ApiTaster.lastRequest.startTime
    // $tab.find('.time td.value').text(timeTaken + " ms");

     $("#show-api-response-div").showNavTab("json").text(

          xhr.status + " " + xhr.statusText + "\r" + "\r" +
          xhr.getAllResponseHeaders() + "\r" +
          JSON.stringify(JSON.parse(xhr.responseText), null, 2)

        );

    // switch (ApiTaster.detectContentType(xhr)) {
    //   case "json":
    //     $("#show-api-response-div").showNavTab("json").text(
    //       JSON.stringify(JSON.parse(xhr.responseText), null, 2)
    //     );
    //     break;
    // }

    //$("#show-api-response-div pre[ref=response-raw]").text(xhr.responseText);

    $("#req-json").val(JSON.stringify(ApiTaster.serializeForm()));

    prettyPrint();
  }
});
