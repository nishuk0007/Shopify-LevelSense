// Initialize BASE URL


if(false){
  var BASE_URL = "https://dash.level-sense.com/Level-Sense-API/web/app_dev.php";
}else{
  var BASE_URL = "https://dash.level-sense.com/Level-Sense-API/web";
}

$(document).ready(function(){

//LOGIN API
  $(document).on('click', 'input[type="submit"][value="Sign In"]', function(e){
    var obj={};
    e.preventDefault();
    obj['email'] = $("#CustomerEmail").val();
    obj['password'] = $("#CustomerPassword").val();
    $.ajax({
            url: BASE_URL+"/api/v1/login",
            type: 'POST',
            data: JSON.stringify(obj),
            dataType: 'json',
            crossDomain:true,
            async:true,
            contentType: 'application/json; charset=utf-8',
            success: function (result) {
             
              if(result.success && result.isFirstLogin){
                  sweetAlert("Please, reset your password!");
                  showRecoverPasswordForm();return false;
                }
              else if(result.success){
                  window.localStorage.setItem('user-token', result.sessionKey);
                  $("#customer_login").submit();
               }    
              else if(result.success == false){
                  sweetAlert(result.message);
              } 
            },
            error: function (error) {
              err_html = "<div class='note form-error'><p>Sorry, looks like something went wrong. Please correct the following and submit again:</p><ul class='disc'><li>Invalid login credentials.</li></ul></div>";
              $(".form_errors").html(err_html);
            }
        });
  });

//   send OTP
  $(document).on('click', 'input[type="submit"][value="Submit"]', function(e){

    var obj={};
    e.preventDefault();
 
    obj['email'] = $("#RecoverEmail").val();
    $.ajax({
            url: BASE_URL+"/api/v1/otp",
            type: 'POST',
            data: JSON.stringify(obj),
            dataType: 'json',
            crossDomain:true,
            async:true,
            contentType: 'application/json; charset=utf-8',
            success: function (result) {
      		
            if(result.success){
            
              sweetAlert("OTP and forget password url send succeddfully!");
              $(".customer-reset-password-link").submit();
              window.localStorage.setItem('user-token', result.sessionKey);
            }else if(result.success == false){
              sweetAlert(result.message);
            }	
            else{
              sweetAlert("Please resend the OTP and forget password url!");
              showRecoverPasswordForm();return false;
            }
             
            },
            error: function (error) {
              
              console.log("error message")
              sweetAlert("Please resend the OTP and forget password url!");
              showRecoverPasswordForm();return false;
              err_html = "<div class='note form-error'><p>Sorry, looks like something went wrong. Please resend the otp:</p><ul class='disc'><li>Invalid login credentials.</li></ul></div>";
              $(".form_errors").html(err_html);
            }
        });
  });
  
  
  function resend_opt(email){
    
    var obj={};
    
    obj["email"]=email
    
      $.ajax({
            url: BASE_URL+"/api/v1/otp",
            type: 'POST',
            data: JSON.stringify(obj),
            dataType: 'json',
            crossDomain:true,
            async:true,
            contentType: 'application/json; charset=utf-8',
            success: function (result) {
            if(result.success){
              sweetAlert("OTP and forget password url send succeddfully!");
              window.localStorage.setItem('user-token', result.sessionKey);
            }else if(result.success == false){
            	sweetAlert(result.message);
            }
            else{
              sweetAlert("Please resend the OTP and forget password url!");
            }
             
            },
            error: function (error) {
              sweetAlert("Please resend the OTP and forget password url!");
              err_html = "<div class='note form-error'><p>Sorry, looks like something went wrong. Please resend the otp:</p><ul class='disc'><li>Invalid login credentials.</li></ul></div>";
              $(".form_errors").html(err_html);
            }
        }); 
  }
    
  ////OTP resend
    $(document).on('click', '#resend_otp', function(e){ 
      var email = $(this).data('email');
      resend_opt(email);
  });
  
//	REGISTER USER API
    $(document).on('click', 'input[type="submit"][value="Create"]', function(e){
     
      var obj={};
      e.preventDefault();
      obj['firstName'] = $('input[name="customer[first_name]"').val();
      obj['lastName'] = $('input[name="customer[last_name]"').val();
      obj['email'] = $.trim($("input[type='email'").val());
      obj['password'] = $.trim($("input[type='password'").val());
         var form = validate_customr_register_form();
         if (form.valid() === true){
           $.ajax({
               url: BASE_URL+"/api/v1/registerUser",
               type: 'POST',
               data: JSON.stringify(obj),
               dataType: 'json',
               crossDomain:true,
               async:true,
               contentType: 'application/json; charset=utf-8',
               success: function (result) {
                if(result.success){
                  window.localStorage.setItem('user-token', result.sessionKey);
                  $("#create_customer").submit();
                }else if(result.success == false){
                  sweetAlert(result.message);
                }   
               
               },
               error: function (error) {
                  err_html = "<div class='note form-error'><p>Sorry, looks like something went wrong. Please correct the following and submit again:</p><ul class='disc'><li>User with given email already exists.</li></ul></div>";
                  $(".form_errors").html(err_html);
               }
           });
         }
    });

  //   UPDATE PASSWORD API
  $(document).on('click', 'input[type="submit"][value="Reset Password"]', function(e){
    
    var obj={};
    e.preventDefault();
    obj['otp'] = $("#otp").val();
//     obj['email'] = extractEmails($("form p.email").text()).join('').trim();
    obj['password'] = $("#ResetPassword").val();
    obj['SESSIONKEY'] = window.localStorage.getItem('user-token');
      
    var form = validate_customer_reset_form();
    
    //for otp api/v1/resetPassword is used instead of /api/v1/forgotPassword 
    //and for update password when user is login then /api/v1/forgotPassword 
    
    if (form.valid() === true){
      $.ajax({
        url: BASE_URL+"/api/v1/resetPassword",
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        crossDomain:true,
        async:true,
        contentType: 'application/json; charset=utf-8',
        success: function (result) {
          
          if(result.success){
            window.localStorage.setItem('user-token', result.sessionKey);
          	$(".reset_customer_password form").submit();
          }else if (result.success == false){
      		sweetAlert(result.message);
          }
//			code to redirect to the login url again
//           RedirectToLoginForm(); return false;     
          
        },
        error: function (error) {
          
          console.log(error);
          err_html = "<div class='note form-error'><p>Sorry, looks like something went wrong. Please correct the following and submit again:</p><ul class='disc'><li>Password reset error</li></ul></div>";
          $(".form_errors").html(err_html);
        }
      });
    }
  });


//	ACTIVATE USER API - WHEN ADMIN SEND INVITE LINK
    $(document).on('click', 'input[type="submit"][value="Activate Account"]', function(e){
     $(this).closest('form').attr('id', 'activate_customer_password'); //assign id to form
      var obj={};
      e.preventDefault();
      obj['firstName'] = $('input[name="customer[first_name]"]').val();
      obj['lastName'] = $('input[name="customer[last_name]"]').val();
      obj['email'] = $.trim($("input[type='email']").val());
      obj['password'] = $.trim($('input[name="customer[password]"]').val());
      console.log(obj)

          var form = validate_customr_account_activation_form();
           if (form.valid() === true){
             $.ajax({
               url: BASE_URL+"/api/v1/registerUser",
               type: 'POST',
               data: JSON.stringify(obj),
               dataType: 'json',
               crossDomain:true,
               async:true,
               contentType: 'application/json; charset=utf-8',
               success: function (result) {
                 if(result.success){
                   window.localStorage.setItem('user-token', result.sessionKey);
                    
                    $("#activate_customer_password").submit();
                 
                 }else if(result.success == false){
                    sweetAlert(result.message);
                    }      
               },
               error: function (error) {
                  err_html = "<div class='note form-error'><p>Sorry, looks like something went wrong. Please correct the following and submit again:</p><ul class='disc'><li>User with given email already exists.</li></ul></div>";
                  $(".form_errors").html(err_html);
               }
           });
        }
    });
});
  


function extractEmails (text){
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

function validate_customr_register_form() {
  var form = jQuery("#create_customer");
  form.validate({
    errorElement: 'div',
    errorClass: 'errors',
    highlight: function(element, errorClass, validClass) {
      jQuery(element).addClass("has-error");
    },
    unhighlight: function(element, errorClass, validClass) {
      jQuery(element).removeClass("has-error");
    },
    rules: {
      "customer[first_name]": {
        required: true,
      },
      "customer[last_name]": {
        required: true,
      },
      "customer[email]": {
        required: true,
        email: true
      },
      "customer[password]": {
        required: true,
        minlength: 5
      },
    },
    errorPlacement: function(error, element) {
      error.insertAfter(element);
    },
    messages: {
      "customer[first_name]": {
        required: "First name is required",
      },
      "customer[last_name]": {
        required: "Last name is required",
      },
      "customer[email]": {
        required: "Email is required",
      },
      "customer[password]" : {
        required: "Password is required",
        minlength: "Password is too short (minimum is 5 characters)",
      },
    }
  });
  return form;
}

function validate_customer_reset_form() {
  var form = jQuery(".reset_customer_password form");
  form.validate({
    errorElement: 'div',
    errorClass: 'errors',
    highlight: function(element, errorClass, validClass) {
      jQuery(element).addClass("has-error");
    },
    unhighlight: function(element, errorClass, validClass) {
      jQuery(element).removeClass("has-error");
    },
    rules: {
      "customer[password]": {
        required: true,
        minlength: 5
      },
      "customer[password_confirmation]": {
        equalTo: "#ResetPassword",
      },
    },
    errorPlacement: function(error, element) {
      error.insertAfter(element);
    },
    messages: {
      "customer[password]": {
        required: "Password is required.",
        minlength: "Password is too short (minimum is 5 characters)",
      },
      "customer[password_confirmation]" : {
        equalTo: "Password should be same.",
      },
    }
  });
  return form;
}

//Account activation validate form
function validate_customr_account_activation_form() {
	
  var form = jQuery("#activate_customer_password");
  form.validate({
    errorElement: 'div',
    errorClass: 'errors',
    highlight: function(element, errorClass, validClass) {
      jQuery(element).addClass("has-error");
    },
    unhighlight: function(element, errorClass, validClass) {
      jQuery(element).removeClass("has-error");
    },
    rules: {
      "customer[first_name]": {
        required: true,
      },
      "customer[last_name]": {
        required: true,
      },
      "customer[email]": {
        required: true,
      },
      "customer[password]": {
        required: true,
        minlength: 5
      },
      "customer[password_confirmation]": {
        equalTo: "#CustomerPassword",
      },

    },
    errorPlacement: function(error, element) {
      error.insertAfter(element);

    },
    messages: {
      "customer[first_name]": {
        required: "First name is required",
      },
      "customer[last_name]": {
        required: "Last name is required",
      },
      "customer[email]": {
        required: "Email is required",
      },
      "customer[password]" : {
        required: "Password is required",
        minlength: "Password is too short (minimum is 5 characters)",
      },
      "customer[password_confirmation]" : {
        equalTo: "Password should be same.",
      },

    }
  });
  return form;
}
