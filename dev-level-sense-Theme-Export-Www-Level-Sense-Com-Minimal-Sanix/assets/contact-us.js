$(document).ready(function(){
  $(document).on("click", "#contactFormSubmit", function(e){
    e.preventDefault();
    
    var form = validate_form();
    if (form.valid() === true){
      form.submit();
    }
  });
});

function validate_form() {
  var form = jQuery("#contact_form");
  form.validate({
    errorElement: 'span',
    errorClass: 'help-block',
    highlight: function(element, errorClass, validClass) {
      jQuery(element).closest('.form-group').addClass("has-error");
    },
    unhighlight: function(element, errorClass, validClass) {
      jQuery(element).closest('.form-group').removeClass("has-error");
    },
    rules: {
      'contact[name]': {
        required: true,
      },
      'contact[email]': {
        required: true,
        minlength: 3,
      },
      'contact[phone]': {
        required: true,
      },
      'contact[body]': {
        required: true,
      }
    },
    errorPlacement: function(error, element) {
      error.insertBefore(element);
    },
    messages: {
      'contact[name]': {
        required: "*Name required",
      },
      'contact[email]': {
        required: "*Email required",
      },
      'contact[phone]': {
        required: "*Phone required",
      },
      'contact[body]': {
        required: "*Message required",
      },
    }
  });
  return form;
}