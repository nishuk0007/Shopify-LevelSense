var device_sensors = {
  1:{"sensor_uid":"1","sensor_slug":"cap_sense","sensor_display_name":"Water Level","sensor_display_units":"%","sensor_significance":"1","display_order":"0","device_flag":"1","sensor_message_name":"High Water"},
  2:{"sensor_uid":"2","sensor_slug":"tempc","sensor_display_name":"Temperature","sensor_display_units":"F","sensor_significance":"1","display_order":"1","device_flag":"2","sensor_message_name":"Temperature"},
  3:{"sensor_uid":"3","sensor_slug":"rh","sensor_display_name":"Humidity","sensor_display_units":"%","sensor_significance":"1","display_order":"2","device_flag":"4","sensor_message_name":"Humidity"},
  4:{"sensor_uid":"4","sensor_slug":"battvdc","sensor_display_name":"Battery","sensor_display_units":"V","sensor_significance":"1","display_order":"3","device_flag":"0","sensor_message_name":""},
  5:{"sensor_uid":"5","sensor_slug":"power_good","sensor_display_name":"Power Good","sensor_display_units":"","sensor_significance":"0","display_order":"4","device_flag":"8","sensor_message_name":"Incoming Power Failure"},
  6:{"sensor_uid":"6","sensor_slug":"relay_state","sensor_display_name":"Alarm State","sensor_display_units":"","sensor_significance":"0","display_order":"5","device_flag":"0","sensor_message_name":""},
  7:{"sensor_uid":"7","sensor_slug":"input1","sensor_display_name":"Leak Sensor","sensor_display_units":"","sensor_significance":"0","display_order":"6","device_flag":"16","sensor_message_name":"Leak Sensor Detected Water"},
  8:{"sensor_uid":"8","sensor_slug":"input2","sensor_display_name":"Float Switch","sensor_display_units":"","sensor_significance":"0","display_order":"7","device_flag":"32","sensor_message_name":"Float Switch Activated"},
  11:{"sensor_uid":"11","sensor_slug":"wifi","sensor_display_name":"Wifi Signal","sensor_display_units":"","sensor_significance":"0","display_order":"11","device_flag":"0","sensor_message_name":"Wifi Signal"}
};


if(false){
  var BASE_URL = "https://dash.level-sense.com/Level-Sense-API/web/app_dev.php";
}else{
  var BASE_URL = "https://dash.level-sense.com/Level-Sense-API/web";
}

Array.prototype.getMatchedElementByKey = function(element_key) {
  var i;
  for (i = 0; i < this.length; i++) {
    if (this[i]["time_stamp"] === element_key) {
      return this[i]; //Returns element position, so it exists
    }
  }
  return []; //The element isn't in your array
};

function convert_C_to_F(value){
  // convert to F
  value = parseFloat(value);
  value = parseFloat(((value * (9 / 5)) + 32));

  return value.toFixed(1);
}

function convert_C(value){
  // convert to C to fixed length
  value = parseFloat(value);
  value = parseFloat((value - 32) * (5 / 9));

  return value.toFixed(1);
}

function display_humidity_per(value){
  // show humidity upto one decimal
  if(value){
  value = parseFloat(value);
  return value.toFixed(1);
  }else{
  return ''
  }
}

function cal_siren(siren_state, alarm_silence){
  
  if(alarm_silence > 0){
    return 'Silenced'
  }else{
    if(siren_state > 0){
        return 'ON' 
    }else{
        return 'OFF'
    }
  }
}

function cal_relay(relay_state, alarm_silence){
  
  if(alarm_silence > 0){
    return 'Silenced'
  }else{
    if(relay_state > 0){
        return 'ON' 
    }else{
        return 'OFF'
    }
  }
}


function format_data(device_sensor_uid, value) {
  if (device_sensors[device_sensor_uid] !== undefined) {
    switch (device_sensors[device_sensor_uid]["sensor_slug"]) {
      case "tempc":
        {
          // convert to F
//           value = parseFloat(value);
//           value = parseFloat(((value * (9 / 5)) + 32));
        }
        break;
      case "rh":
        {}
        break;
    }
  } else {
    return Number(value);
  }
  value = parseFloat(value);
  return Number(value.toFixed(parseInt(device_sensors[device_sensor_uid]["sensor_significance"])));
}

function doChart(initialData, temperature_unit) {
  var tempMin = 0, tempMax = 100;
  var voltMin = 0, voltMax = 10;   

  if (initialData.hasOwnProperty("4")) {
    voltMin = 10;
    voltMax = 0;
    jQuery.each(initialData["4"], function (i, row) {
      if (row[1] < voltMin) {
        voltMin = row[1];
      }

      if (row[1] > voltMax) {
        voltMax = row[1];
      }
    });
      
    voltMin *= 0.95;  //Set min and max bounds to 5%
    voltMax *= 1.05;  //Set min and max bounds to 5%
  }
  
  if (initialData.hasOwnProperty("2")) {
    tempMin = 99999;
    tempMax = 0;
    jQuery.each(initialData["2"], function (i, row) {
      if (row[1] < tempMin) {
        tempMin = row[1];
      }

      if (row[1] > tempMax) {
        tempMax = row[1];
      }
    });
    
    tempMin *= 0.95;  //Set min and max bounds to 5%
    tempMax *= 1.05;  //Set min and max bounds to 5%
}
    
window.initialData = initialData;
  
    // Create the chart
  jQuery('#graph_area').highcharts('StockChart', {
    chart: {
      backgroundColor: '#FFF',
      margin: [0, 100, 0, 100],
      height: 1500,
      width: 970,
      plotBorderWidth: 0,
      shadow: false,
      plotShadow: false,
      alignTicks: false,
      events: {
        load: function () {
          this.renderer.label('Water Level', this.plotLeft, 65)
              .css({
                color: '#007dcc',
                fontSize: "26px"
              })
              .attr({zIndex: 99})
              .add();
          this.rangeSelector.group.toFront();

          this.renderer.rect(0, 55, this.chartWidth, 280, 0)
              .attr({
                'stroke-width': 1,
                stroke: '#DBDBDB',
                fill: '#F2F2F2',
                zIndex: 0
              }).add();

          this.renderer.label('Temperature & Humidity', this.plotLeft, 730)
              .css({
                color: '#007dcc',
                fontSize: "26px"
              })
              .attr({zIndex: 99})
              .add();

          this.renderer.rect(0, 730, this.chartWidth, 265, 0)
            .attr({
              'stroke-width': 1,
              stroke: '#DBDBDB',
              fill: '#F2F2F2',
              zIndex: 0
            }).add();


          this.renderer.label('Wi-Fi Signal Strength in dBm', this.plotLeft, 400)
              .css({
                color: '#007dcc',
                fontSize: "26px"
              })
              .attr({zIndex: 99})
              .add();

          this.renderer.rect(0, 400, this.chartWidth, 280, 0)
            .attr({
              'stroke-width': 1,
              stroke: '#DBDBDB',
              fill: '#F2F2F2',
              zIndex: 0 
            }).add();          

           //          Battery Voltage Graph
          this.renderer.label('Battery Voltage', this.plotLeft, 1050)
              .css({
                color: '#007dcc',
                fontSize: "26px"
              })
              .attr({zIndex: 99})
              .add();

          this.renderer.rect(0, 1050 , this.chartWidth, 280, 0)
              .attr({
                'stroke-width': 1,
                stroke: '#DBDBDB',
                fill: '#F2F2F2',
                zIndex: 0
              }).add();

       this.reflow();
        }
      }
    },
    credits: {
      enabled: false
    },
//     rangeSelector: {
//       buttons: [{
//         count: 1,
//         type: 'hour',
//         text: '1Hr',
//       },
//       {
//         count: 2,
//         type: 'hour',
//         text: '2Hr'
//       }, {
//         count: 4,
//         type: 'hour',
//         text: '4Hr'
//       }, {
//         count: 24,
//         type: 'hour',
//         text: '1dy'
//       }, {
//         count: 7,
//         type: 'day',
//         text: '1w'
//       }, {
//         type: 'all',
//         text: 'All'
//       }],
//       inputEnabled: false,
//       selected: 2,
//       buttonPosition: {
//         x: 100,
//         y: 10,
//       },
//     },
   
    tooltip: {
      formatter: function() {
       	
        var s = Highcharts.dateFormat("%a %b %e %Y %I:%M%p", new Date(this.x));
		
        jQuery.each(this.points, function() {
          var value = '';
          if (this.series.name == 'Alarm') {
            if (this.y == 0) {
              value = 'Off';
            } else if (this.y == 1) {
              value = 'On';
            } else {
                value = Highcharts.numberFormat(this.y, 1);
            }   
          } else if (this.series.name == 'Leak Sensor') {
            if (this.y < 600) {
                value = 'Wet';
            } else {
                value = 'Dry';
            }
          } else if (this.series.name == 'Float Switch') {
            if (this.y < 600) {
                value = 'Up';
            } else {
                value = 'Down';
            }
          } else {
            value = Highcharts.numberFormat(this.y, 1);
          }

          s += '<br/>' + this.series.name + ': <b>' + value + '</b>';
        });

        return s;
      }
    },
    legend: {
      enabled: true,
      y: -100
    },
    navigator: {
//       top: 300,
//       height: 60,
      enabled: false,
    },
    
//     xAxis: {
//       type: 'datetime',
//       offset: 15,
//       useHTML: true,
//       top: 415,
//       opposite: true,
//       labels: {
//         formatter: function() {
//           return Highcharts.dateFormat("<br />%I:%M%p<br />%b %e", new Date(this.value));
//         }
//       }
//     },
    
    

    yAxis: [
      // Water level title
      { 
        id: device_sensors[1].sensor_uid,
        labels: {
          enabled: true,
          style: {fontSize: '16px', color: '#007dcc',},  //Josh 4-20
          formatter: function() {
            return this.value + '%';
           },
        },
        title: {
          text: "Average Water Level & Alarm State",
          align: "high",
          offset: -50,
          rotation: 0,
          x: 185,
          y: -11,
          style: {
            color: '#000000',
            fontSize: '14px'
          }
        },
        minorTickLength: 5,
        minorTickColor: '#000000',
        minorTickWidth: 0,
        tickPixelInterval: 30,
        opposite: false,
        lineColor: '#5a5a5a',
        lineWidth: 1,
        min: 0,
        max: 125,
        top: 120,
        height: 180,
      },

      // Alarm relay
      {
        id: device_sensors[6].sensor_uid,  //Alarm Relay
        labels: {
          enabled: true,
          style: {fontSize: '14px'},  //Josh 4-20
          formatter: function() {
            if (this.value == 0) {
              return 'Off';
            } else if (this.value == 1) {
              return 'On';
            }
            return this.value;
          }
        },
        title: {
          text: device_sensors[6].sensor_display_name + " " + device_sensors[6].sensor_display_units, //Alarm Relay
          style: {
            color: "#FF0000",
            fontSize: '18px' //Josh 4-20
          }
        },
        minorTickLength: 5,
        minorTickColor: '#5a5a5a',
        minorTickWidth: 1,
        minorTickInterval: 1,
        endOnTick: 1,
        gridLineWidth: 0,
        opposite: true,
        lineColor: '#5a5a5a',
        lineWidth: 1,
        min: 0,
        max: 2,
        allowDecimals: false,
        top: 120,
        height: 180,
        offset: 0
      },

      // Temperature
      {
        id: device_sensors[2].sensor_uid,  //Temp
        labels: {
          enabled: true,
          style: {fontSize: '16px', color: '#007dcc'},  //Josh 4-20
          formatter: function() {
            if( temperature_unit == "C"){
    	        return this.value + '°C';
            }
            else { 	
                return this.value + '°F';
            }
           
	      },
        },
        title: {
          text: "Average Temperature & Humidity",
          align: "high",
          offset: -50,
          rotation: 0,
          x: 180, //148, //Josh 3-24
          y: -13,
          style: {
            color: '#000000',
            fontSize: '14px' //Josh 3-24
          }
        },
        min: tempMin,
        max: tempMax,
        tickInterval: 2.50,
        minorTickLength: 5,
        minorTickColor: '#000000',
        minorTickWidth: 1,
        minorTickInterval: 10,
        minorGridLineColor: null,
        opposite: false,
        lineColor: '#5a5a5a',
        lineWidth: 1,

        top: 790,
        height: 180,
        offset: 0,
      },
      // Humidity
      {
        id: device_sensors[3].sensor_uid, //Humidity
        labels: {
          enabled: true,
          style: {fontSize: '16px', color:"#000000"},  //Josh 4-20
          formatter: function() {
            return this.value + '%';
           },
        },
        title: {
            text: 'Humidity',
            style: {fontSize: '16px',},
        },
//         min: 30,
//         max:40,
        tickInterval: 0.1,
        endOnTick: 20,
        minorTickLength: 5,
        minorTickColor: '#000000',
        minorTickWidth: 1,
        minorTickInterval: 5,
        opposite: true,
        lineColor: '#000',
        lineWidth: 1,
        top: 790,
        height: 180,
        offset: 0
      },

      // Wifii
      {
        id: device_sensors[11].sensor_uid,  
        labels: {
          enabled: true,
          style: {fontSize: '16px', color: '#007dcc'},  //Josh 4-20
          formatter: function() {
            return this.value + ' dbm';
           },
        },
        
//         title: {
//             text: 'Signal in decibels(db)',
//              style: {fontSize: '14px'}
//         },
        minorTickLength: 5,
        minorTickColor: '#000000',
        minorTickWidth: 1,
        minorTickInterval: 10,
        minorGridLineColor: null,
        opposite: false,
        lineColor: '#5a5a5a',
        lineWidth: 1,
        min: -100,
        max: -30,
        top: 440,
        height: 180,
        offset: 0,
      },

      
      // Battery Voltage
      {
        id: device_sensors[4].sensor_uid,  
        labels: {
          enabled: true,
          style: {fontSize: '16px', color: '#007dcc'},  //Josh 4-20
          formatter: function() {
              return this.value + ' V';
              },
          },
        
        title: {
          text: "Battery voltage Graph",
          align: "high",
          offset: -50,
          rotation: 0,
          x: 100, //148, //Josh 3-24
          y: -5,
          style: {
            color: '#000000',
            fontSize: '14px' //Josh 3-24
          }
        },

        minorTickLength: 5,
        minorTickColor: '#000000',
        minorTickWidth: 1,
        tickInterval: 0.1,
        minorTickInterval: 10,
        minorGridLineColor: null,
        opposite: false,
        lineColor: '#5a5a5a',
        lineWidth: 1,
        min: voltMin, 
        max: voltMax, 
        top: 1100,
        height: 180,
        offset: 0,
      },                                  
    ]
      ,
      
    exporting: {
      enabled: false
    },
      
    series: [
      {
        yAxis: device_sensors[1].sensor_uid,  //Water
        //name: device_sensors[1].sensor_display_name,
        data: initialData["1"],
        type: 'area',
        fillOpacity: .1,
        showInLegend: false,
        marker: {
          enabled: false,
          radius: 3
        },
        color: "#007dcc",
        fillColor: "#3297d6",
        tooltip: {
          "valueDecimals": 0,
        }
      },
      
        {
        yAxis: device_sensors[2].sensor_uid, //Temp
        name: device_sensors[2].sensor_display_name,
        data: initialData["2"],
        type: 'area',
        fillOpacity: .1,
        marker: {
          enabled: false,
          radius: 3
        },
        color: "#007dcc",
        fillColor: "#3297d6",
        tooltip: {
          "valueDecimals": 1
        }
      },
      {
        yAxis: device_sensors[3].sensor_uid, //Humidity
        name: device_sensors[3].sensor_display_name,
        data: initialData["3"],
        type: 'area',
        fillOpacity: .1,
        marker: {
          enabled: false,
          radius: 3
        },
        color: "#5a5a5a",
        tooltip: {
          "valueDecimals": 1
        }
      },
      {
        yAxis: device_sensors[11].sensor_uid, //Wifi
        name: device_sensors[11].sensor_display_name,
        data: initialData["11"],
        type: 'spline',
        fillOpacity: .1,
        marker: {
          enabled: false,
          radius: 3
        },
        color: "#00FF00", 
        fillColor: "#3297d6",
        tooltip: {
          "valueDecimals": 1
        }
      },
                                   
      //  Battery Voltage Y-axis measurement                           
       {
        yAxis: device_sensors[4].sensor_uid, //Battery Voltage
        name: device_sensors[4].sensor_display_name,
        data: initialData["4"],
        type: 'spline',       
        fillOpacity: .1,
        marker: {
           enabled: false,
           radius: 3
        },
        color: "#FE6406", 
        fillColor: "#3297d6",
        tooltip: {
          "valueDecimals": 1
        }
      },                            

       //  Alarm Relay ON / OFF                         
       {
        yAxis: device_sensors[6].sensor_uid, //Alarm 
        name: device_sensors[6].sensor_display_name,
        data: initialData["6"],
        type: 'spline',       
        fillOpacity: .1,
        marker: {
           enabled: false,
           radius: 3
        },
        color: "#FE2406", 
        fillColor: "#3297d6",
        tooltip: {
          "valueDecimals": 1
        }
      },                                            
       ]
  });
  jQuery('#graph_area').highcharts();
}
  
function log_detail_device(result){
  var record="";

  jQuery("#alarm_log_records").val();
  $(".log-history").text("");
  $('#current_page').val(result.deviceLogList.PAGING.CURRENT_PAGE);
  $('#show_per_page').val(result.deviceLogList.PAGING.RESULTS_PER_PAGE);
  $('#total_pages').val(result.deviceLogList.PAGING.TOTAL_PAGES);
  
  if (typeof result.deviceLogList.LIST[0] !== 'undefined' && result.deviceLogList.LIST[0] !== null) {
    $('#device_id').val(result.deviceLogList.LIST[0].deviceId);
  }else{
    $('#device_id').text('');
  }
  
  $('#previous_page').val(result.deviceLogList.PAGING.PREV_PAGE);
  $('#next_page').val(result.deviceLogList.PAGING.NEXT_PAGE);
  
  jQuery.each(result.deviceLogList.LIST, function(i, v){

//     record = "<div class='grid__item one-half'>Id</div><div class='grid__item one-half'><strong>"+v.id+"</strong></div>\
//       <div class='grid__item one-half'>Device Id</div><div class='grid__item one-half wordbreak '><strong>"+v.deviceId+"</strong></div>\
//       <div class='grid__item one-half'>Event</div><div class='grid__item one-half'><strong>"+v.event+"</strong></div>\
//       <div class='grid__item one-half'>Event Time</div><div class='grid__item one-half wordbreak'>"+v.eventTime+"</div>\
//       <div class='grid__item one-half'>Log Type</div><div class='grid__item one-half wordbreak '>"+v.logType+"</div>\
//       <div class='grid__item one-half'>To</div><div class='grid__item one-half wordbreak '>"+v.to+"</div>\
//       <div class='grid__item one-half'>Message</div><div class='grid__item one-half wordbreak '>"+v.message+"</div><hr>";
    
    
    record = "<div class='Alarm-Logs alarm-log-record'>\
                <div class='grid-details'>\
        <div class='grid__item one-half'>Time</div><div class='grid__item one-half wordbreak'><strong>"+v.eventTime+"</strong></div>\
        <br>\
    </div>\
    <div class='grid-details'>\
        <div class='grid__item one-half'>To</div><div class='grid__item one-half wordbreak '><strong>"+v.to+"</strong></div><br>\
    </div>\
    <div class='grid-details'>\
        <div class='grid__item one-half'>Notification Type:</div><div class='grid__item one-half wordbreak'>"+v.logType+"</div><br>\
    </div>\
    <div class='grid-details'>\
        <div class='grid__item one-half'>Message</div><div class='grid__item one-half wordbreak '>\
        "+v.message+"</div>\
    </div>\
              </div>";
    
    $(".log-history").append(record); 
  });
}

function isEmpty(val){
  return (val === undefined || val == null || val == '' || val.length <= 0) ? true : false;
}

function set_cell_providers(selected_option='', user_id='', device_id=''){
  var provider_options = "";
  
  if (typeof(selected_option) === "undefined") 
  { 
    selected_option = ""; 
  }
  else{
    jQuery.each(cell_providers, function(i, v){
      if(selected_option == v.providerCode){
        provider_options += '<option value='+v.providerCode+' selected>'+v.provider+'</option>';
      }else{
        provider_options += '<option value='+v.providerCode+'>'+v.provider+'</option>';
      }
    });
  }

  if(user_id.length > 0){
    jQuery("#service_provider"+user_id+"").html(provider_options);
    $("select[data-userid="+device_id+"]").html(provider_options);
    
//     jQuery("#service_provider_voice"+user_id+"").html(provider_options);
//     $("select[data-userid="+device_id+"]").html(provider_options);
    
//     jQuery(".service_provider"+user_id+"").html(provider_options);
//     $("select[data-userid="+device_id+"]").html(provider_options);

  }else{
    jQuery("#service_provider").html(provider_options);
    jQuery("#service_provider_select").html(provider_options);
    jQuery("#service_provider_voice").html(provider_options);
    jQuery(".service_provider").html(provider_options);
    jQuery(".service_provider_voice").html(provider_options);
    jQuery(".service_provider_text").html(provider_options);
    
  }
}

function get_all_contacts(){
  $.ajax({
    url: BASE_URL+"/api/v1/getContactList",
    type: 'POST',
    dataType: 'json',
    crossDomain:true,
    async:true,
    headers: {
      'SESSIONKEY': window.localStorage.getItem('user-token')
    },
    contentType: 'application/json; charset=utf-8',
    success: function (result) {
      if(result.contactList === undefined){}
      else{
        update_contact_list(result.contactList)
        }
      },
    error: function (error) {
      sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
    },beforeSend: function() {
      $('.loader').css('display', 'block');
    },complete: function(){
      $('.loader').css('display', 'none');
    }
  });
}

function update_contact_list(contactList){
  jQuery.each(contactList, function(i, v){
      setTimeout(function(){
      var html_str = '';
        
      if(v.email.trim().length > 0){
        contact_name = v.firstName + " " + v.lastName;
      
        html_str = "<li class = 'grid email-type contact_"+v.id+"'>\
                <a href='#accordion-panel-"+v.id+"' class='device-accordian' data-id='"+v.id+"'><span><i class='fa fa-envelope' aria-hidden='true'></i> "+ contact_name +"</span> <span class='control-icon'><i class='fa fa-plus'></i><i class='fa fa-minus'></i></span></a>\
                  <div id='accordion-panel-"+v.id+"' class='contact-list'>\
                    <div class='accordion-content'>\
                    <form class='accordian_form' id='list_conatct_id'>\
                      <div class='row'>\
                        <div class='column width-3 pd-none'>\
                          <h5><label for='contact_name'>Name</label></h5>\
                        </div>\
                        <div class='column width-9'>\
                          <input type='text' class='form-control cont-name' id='contact_name' name='contact_name' placeholder='Enter your name' value="+ contact_name +">\
                        </div>\
                     </div>\
                     <div class='clear'></div>";
        html_str += "<div class='row' id='email_contact_list'>\
          <div class='column width-3 pd-none'>\
            <h5><label for='email_address'>Email Address</label></h5>\
          </div>\
          <div class='column width-9'>\
            <input type='email' class='form-control' id='email_address' name='email_address' placeholder='Enter your email' value="+v.email+">\
          </div>\
        </div>\
        <div class='clear'></div>\
        <div class='row'>\
          <div class=''  id ='conatct_type_content'>\
                  <div class=''>\
                    <div class='column width-4'>\
                          <div class='form-group'>\
                              <h5><label for=''>Change Contact Type</label></h5>\
                              <select class='form-control select-type-change-"+v.id+"' id='select_type_change' name='select_contact'>\
                                <option value=''>select type</option>\
                                <option value='contact_email'>Email</option>\
                                <option value='text_msg'>Text Message</option>\
                                <option value='voice'>Voice</option>\
                              </select>\
                          </div>\
                    </div>\
                  </div>\
               <div class='' id='temp_voice'>\
                      <div class='column width-4'>\
                          <div class='form-group'>\
                              <h5><label for='mobile'>Cell Phone Number</label></h5>\
                              <input type='text' class='form-control' id='change_mobile_voice' name='contact_mobile_voice' placeholder='+1 1234567890'>\
						      <span class='help-block'>Please Enter Phone Number with country code, do not use dashes.</span>\
                          </div>\
                      </div>\
                      <div class='column width-4'>\
                          <div class='form-group'>\
                              <h5><label for=''>Service Provider</label></h5>\
                              <select class='form-control service_provider_voice' data-voiceid="+v.id+" id='service_provider'>\
                                  <option value=''>Select your Cellular Provider </option>\
                              </select>\
                          </div>\
                      </div>\
               </div>\
               <div class='' id='temp_text'>\
                      <div class='column width-4'>\
                          <div class='form-group'>\
                              <h5><label for='mobile'>Cell Phone Number</label></h5>\
                              <input type='text' class='form-control' data-textid="+v.id+" id='change_mobile_text' name='contact_mobile_text' placeholder='+1 1234567890'>\
						<span class='help-block'>Please Enter Phone Number with country code, do not use dashes.</span>\
						</div>\
                      </div>\
                      <div class='column width-4'>\
                          <div class='form-group'>\
                              <h5><label for=''>Service Provider</label></h5>\
                              <select class='form-control service_provider_text' data-textid="+v.id+" id='service_provider'>\
                                  <option value=''>Select your Cellular Provider </option>\
                              </select>\
                          </div>\
                      </div>\
               </div>\
               <div class ='column width-6' id='temp_email'><div class='form-group'>\
                    <h5><label for='email_address'>Email Address</label></h5>\
                    <input type='email' class='form-control' id='email_address_id' name='email' placeholder='Enter your email'>\
               </div></div>\
          </div>\
          <div class='column width-12 pd-none'>\
            <div class='chckbox'>";
        if(v.enableStatus){
          html_str += "<input type='checkbox' checked id='enableStatus' data-status-id="+v.id+">";
          
        }else{
          html_str += "<input type='checkbox' id='enableStatus' data-status-id="+v.id+">";
        }
        html_str += "<span id ='contact_type_checked'><i class='fa fa-check'></i></span> Enable \
                </div>\
              </div>\
            </div>";
        
        html_str += "<div class='desave-sec'>"
        
        html_str += "<button class= 'btn btn-primary test-email-contact-btn' id= 'test' data-id="+v.id+">Test</button>";
         
        html_str +="<button input='submit' class='btn btn-primary notify-btn save-update-btn' data-id="+v.id+">Save</button>\
                      <button class='btn btn-primary notify-btn delete-btn' data-id="+v.id+">Delete</button>\
                    </div>\
               </div></div></li>";
        $("div.accordion ul").append(html_str);

        var sendDataTimeout = function(){
          if(v.emailActive){
          $(".select-type-change-"+v.id+"").val('contact_email');
          }
           else if(v.smsActive){
              $(".select-type-change-"+v.id+"").val('text_msg');
          }else if (v.voiceActive){
              $(".select-type-change-"+v.id+"").val('voice');
          }else{
              $(".select-type-change-"+v.id+"").val('');
          }
        }
        setTimeout(sendDataTimeout, 200);
        set_cell_providers(v.cellProvider,v.userId, v.id);
        set_cell_providers(); 
      }
      
      else{
        contact_name = v.firstName + " " + v.lastName;
        html_str = "<li class='grid email-type contact_"+v.id+"'>\
                <a href='#accordion-panel-"+v.id+"' class='device-accordian' data-id='"+v.id+"'>\
                    <span><i class='fa fa-mobile' aria-hidden='true'></i> "+ contact_name +"</span> <span class='control-icon'><i class='fa fa-plus'></i><i class='fa fa-minus'></i></span></a>\
                  <div id='accordion-panel-"+v.id+"' class='contact-list>\
                    <div class='accordion-content'>\
                    <form class='accordian_form' id='list_conatct_id'>\
                      <div class='row'>\
                        <div class='column width-3 pd-none'>\
                          <h5><label for='contact_name'>Name</label></h5>\
                        </div>\
                        <div class='column width-9'>\
                          <input type='text' class='form-control cont-name' id='contact_name' name='contact_name' placeholder='Enter your name' value="+ contact_name +">\
                        </div>\
                     </div>\
                     <div class='clear'></div>";
        html_str += "<div class='row'>\
            <div class='column width-3 pd-none'>\
              <h5><label for='mobile_no'>Cell Phone Number</label></h5>\
            </div>\
            <div class='column width-9'>\
              <input type='number' class='form-control' id='mobile' name='mobile_no' placeholder='Enter your mobile no' value="+v.mobile+">\
			  <span class='help-block'>Write country code, do not use dashes.</span>\
            </div>\
          </div>\
          <div class='clear'></div>\
          <div class='row' id='service_prov'>\
            <div class='column width-3'>\
                    <h5><label for='mobile_no'>Service Provider</label></h5>\
                </div>\
                <div class='column width-9'>\
                    <select class='form-control' id='service_provider_select' data-userid="+v.id+">\
                    </select>\
                </div>\
          </div>\
          <div class='clear'></div>\
          <div class='row'>\
            <div class=''  id ='conatct_type_content'>\
                  <div class='column width-4'>\
                      <div class='form-group'>\
                          <h5><label for=''>Change Contact Type</label></h5>\
                          <select class='form-control select-type-change-"+v.id+"' id='select_type_change' name='select_contact'>\
                            <option value=''>select type</option>\
                            <option value='voice'>Voice</option>\
                            <option value='text_msg'>Text Message</option>\
                            <option value='contact_email'>Email</option>\
                          </select>\
                      </div>\
                  </div>\
               <div class='' id='temp_voice'>\
                      <div class='column width-4'>\
                          <div class='form-group'>\
                              <h5><label for='mobile'>Cell Phone Number</label></h5>\
                              <input type='text' class='form-control' id='change_mobile_voice' name='contact_mobile_voice' placeholder='+1 1234567890 Do not use dashes'>\
								<span class='help-block'>Please Enter Phone Number with country code, do not use dashes.</span>\
                          </div>\
                      </div>\
                      <div class='column width-4'>\
                          <div class='form-group'>\
                              <h5><label for=''>Service Provider</label></h5>\
                              <select class='form-control service_provider_voice' data-voiceid="+v.id+" id='service_provider'>\
                                  <option value=''>Select your Cellular Provider </option>\
                              </select>\
                          </div>\
                      </div>\
               </div>\
               <div class='' id='temp_text'>\
                      <div class='column width-4'>\
                          <div class='form-group'>\
                              <h5><label for='mobile'>Cell Phone Number</label></h5>\
                              <input type='text' class='form-control' id='change_mobile_text' name='contact_mobile_text' placeholder='+1 1234567890 Do not use dashes'>\
							  <span class='help-block'>Please Enter Phone Number with country code, do not use dashes.</span>\
                          </div>\
                      </div>\
                      <div class='column width-4'>\
                          <div class='form-group'>\
                              <h5><label for=''>Service Provider</label></h5>\
                              <select class='form-control service_provider_text' data-textid="+v.id+" id='service_provider'>\
                                  <option value=''>Select your Cellular Provider </option>\
                              </select>\
                          </div>\
                      </div>\
               </div>\
                <div class ='column width-6' id='temp_email'>\
                        <div class='form-group'>\
                            <h5><label for='email_address'>Email Address</label></h5>\
                            <input type='email' class='form-control' id='email_address_id' name='email' placeholder='Enter your email'>\
                        </div>\
                </div>\
            </div>\
            </div>";
        if(v.enableStatus){
        html_str += "<div class='column width-6 pd-none'>\
              <div class='chckbox'>\
            <input type='checkbox' checked id='enableStatus' data-status-id="+v.id+">";
        }else{
          html_str += "<div class='column width-6 pd-none'>\
              <div class='chckbox'>\
            <input type='checkbox' id='enableStatus' data-status-id="+v.id+">";
        
        
        }
        
        html_str += "<span id= 'contact_type_checked'><i class='fa fa-check'></i></span> Enable \
                </div>\
              </div>\
            </div>";
        html_str += "<div class='desave-sec'>"
        
        html_str += "<button class= 'btn btn-primary test-sms-contact-btn' id='test' data-id="+v.id+">Test</button>";             
        
        html_str += "<button input='submit' class='btn btn-primary notify-btn save-update-btn' data-id="+v.id+">Save</button>\
                      <button class='btn btn-primary notify-btn delete-btn' data-id="+v.id+">Delete</button>\
                    </div>\
                </div>\
            </form>\
          </div></li>";
        $("div.accordion ul").append(html_str);
       
        var sendDataTimeout = function(){
          if(v.smsActive){
              $(".select-type-change-"+v.id+"").val('text_msg');
          }else if (v.voiceActive){
              $(".select-type-change-"+v.id+"").val('voice');
          }else{
              $(".select-type-change-"+v.id+"").val('');
          }
        }
        setTimeout(sendDataTimeout, 300);
        set_cell_providers();
        set_cell_providers(v.cellProvider,v.userId, v.id); 
      }
    },500);
    
    set_cell_providers(v.cellProvider,v.userId, v.id);
  });
}

function country_records(){
  
  $.ajax({
    url: BASE_URL+"/api/v1/getCountryList",
    type: 'GET',
    dataType: 'json',
    crossDomain:true,
    async:true,
    headers: {
      'SESSIONKEY': window.localStorage.getItem('user-token')
    },
    contentType: 'application/json; charset=utf-8',
    success: function (result) {
    
     if(result.countryList === '' || result.countryList === undefined){
       
     }
      else {
      $.each( result.countryList, function( key, value ) {
        $('.select-country').append($("<option></option>").attr("value",value.id) .text(value.name)); 
      });
      }
    },
    error: function (error) {
      sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
    }
  });
}

function device_records(){
  $.ajax({
    url: BASE_URL+"/api/v1/getDeviceList",
    type: 'GET',
    dataType: 'json',
    crossDomain:true,
    async:true,
    headers: {
      'SESSIONKEY': window.localStorage.getItem('user-token')
    },
    contentType: 'application/json; charset=utf-8',
    success: function (result) {
      if(result.deviceList === undefined){

      }
      else{
      	display_device_records(result);
      }
      },
    error: function (error) {
      sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
    }
  });
}


function display_device_records(result){

  $.each( result.deviceList, function( key, value ) {
    var active;
    var device_state;
    if (value.deviceState == "0"){
        device_state = '<span class="device-state-normal">NORMAL</span>';   
    }
    else{
        device_state = '<span class="device-state-alarm-offline">"ALARM"</span>';
    }
    if(value.checkinFailCount == "0"){
        active = '<span class="device-active-online">ONLINE<span>';
    }
    else{
      active = '<span class="device-state-alarm-offline">OFFLINE</span>';
    }
    $(".list-devices tr:last").after(
      "<tr id=d-"+value.id+" data-did="+value.id+">\
        <td>"+ value.displayName +"<br><h6>STATUS:</h6>"+device_state+"<br>"+active+"</td>\
        <td>\
          <a href='#lightbox-edit-device' class='btn btn-primary edit-device-details tool-tip' title='Edit device' data-tipped-options='position: 'top'' data-id="+value.id+">\
            <i class='fa fa-pencil-square-o'></i>\
          </a>\
        </td>\
        <td>\
          <a href='#lightbox-edit-device-alarm' class='btn btn-primary edit-device-details-alarm tool-tip' title='Notification Settings' data-tipped-options='position: 'top'' data-id="+value.id+">\
            <i class='fa fa-bell'></i>\
          </a>\
        </td>\
        <td>\
          <button class='btn btn-primary removebtn tool-tip delete-device' title='Remove device' data-tipped-options='position: 'top'' data-id="+value.id+">\
            <i class='fa fa-close'></i>\
          </button>\
        </td>\
        <td>\
          <a href='#lightbox-logs' class='btn btn-primary device-stats tool-tip' title='Show device statistics' data-tipped-options='position: 'top'' data-id="+value.id+">\
            <i class='fa fa-area-chart'></i>\
          </a>\
        </td>\
        <td>\
          <a href='#lightbox-alarm-log' class='btn btn-primary log-details tool-tip' title='Device logs' data-tipped-options='position: 'top''>\
            <i class='fa fa-history'></i>\
          </a>\
        </td>\
      </tr>"
    );
  });
}

var deviceDetailInfo = {};

function setFormValueDevice(result){
  $("#wifi_signal_status").text("");
  $('#checkin_interval_dropdown').text("");
  $('#update_interval_dropdown').text("");
  $("#displayNameInput").val(result['displayName']);
  $("#macAddressInput").val(result["mac"]);
  $("#form_devicedetail_id").val(result['id']);
  $("#sirenStateInput").val(result['sirenState']);
  $("#relayStateInput").val(result['relayState']);
  $("#firmwareVersionInput").val(result['deviceFirmware']);
//   $('#lastCheckinInput').val(result["lastCheckinTime"].date)
  $('#lastCheckinInput').val(result["lastCheckinTime"]);
  $('#subscriptionExpirationInput').val(result["deviceSubscriptionDate"]);
  
  $('#siren_on_off').html(cal_siren(result["sirenState"]), result["alarmSilence"]);
  $('#relay_on_off').html(cal_relay(result["relayState"]), result["alarmSilence"]);  
  
  $.each(result["deviceData"], function(key, value){
        
    if(value["sensorSlug"] == 'rssi'){
      $('#signal_strength').val(value["value"]);

      var signalValue = parseFloat(value["value"]);
      if (signalValue > (-50)){
        $('#wifi_signal_status').append("<span class = 'signal-excellent' >Excellent</span>"); 
      }
      if (signalValue <=(-50) && signalValue >(-60) ){      
        $('#wifi_signal_status').append("<span class = 'signal-good'>Good</span>");
      }
      if (signalValue <=(-60) && signalValue >(-70)){
        $('#wifi_signal_status').append("<span class = 'signal-fair'>Fair</span>");
      }
      if (signalValue <= (-70)){
        $('#wifi_signal_status').append("<span class='signal-poor'>Poor</span>");
      }  
    }
  });
      
  var deviceConfig = result['deviceConfig'];
  $.each( deviceConfig, function( key, value ) {
    if(value['configKey'] == 'update_interval'){
      $("#update_interval_dropdown").val(value['configVal']);
    }else if(value['configKey'] == 'checkin_interval'){
      $("#checkin_interval_dropdown").val(value['configVal']);
    }
  });
 
  var checkinetrval = result['deviceConfigMeta'].checkin_interval;
  $.each(checkinetrval, function(key, value){
    $('#checkin_interval_dropdown').append('<option value='+value["value"]+'>'+value["label"]+'</option>');
    if(value.defaultStatus){ 
      $('#checkin_interval_dropdown').val(value["value"]);
    }
  });
  
  var updateinetrval = result['deviceConfigMeta'].update_interval;
  $.each(updateinetrval, function(key, value){
    $('#update_interval_dropdown').append('<option value='+value["value"]+'>'+value["label"]+'</option>');
    if(value.defaultStatus){ 
      $('#update_interval_dropdown').val(value["value"]);
    }
  });
}

function setFormValue(result){
  
  
//   To hide the temperature in cecius on pageload for device alarm config
  $("#temp_in_c").hide()
  $("#power_label").text("");
  $("#current_water_level").text("");
  
  $("#temperature_relay").val("");
  $("#temperature_relay").prop('checked', false);
  $("#temperature_siren").val("");
  $("#temperature_siren").prop('checked', false);
  $("#temperature_email").val("");
  $("#temperature_email").prop('checked', false);
  $("#temperature_text").val("");
  $("#temperature_text").prop('checked', false);
  $("#temperature_voice").val("");
  $("#temperature_voice").prop('checked', false);
  
  $("#humidity_relay").val("");
  $("#humidity_relay").prop('checked', false);
  $("#humidity_siren").val("");
  $("#humidity_siren").prop('checked', false);
  $("#humidity_text").val("");
  $("#humidity_text").prop('checked', false);
  $("#humidity_voice").val("");
  $("#humidity_voice").prop('checked', false);
  $("#humidity_email").val("");
  $("#humidity_email").prop('checked', false);
  
  $("#power_relay").val("");
  $("#power_relay").prop('checked', false);
  $("#power_siren").val("");
  $("#power_siren").prop('checked', false);
  $("#power_email").val("");
  $("#power_email").prop('checked', false);
  $("#power_text").val("");
  $("#power_text").prop('checked', false);
  $("#power_voice").val("");
  $("#power_voice").prop('checked', false);
  
  $("#leak_sensor_relay").val("");
  $("#leak_sensor_relay").prop('checked', false);
  $("#leak_sensor_siren").val("");
  $("#leak_sensor_siren").prop('checked', false);
  $("#leak_sensor_email").val("");
  $("#leak_sensor_email").prop('checked', false);
  $("#leak_sensor_voice").val("");
  $("#leak_sensor_voice").prop('checked', false);
  $("#leak_sensor_text").val("");
  $("#leak_sensor_text").prop('checked', false);
 
  $("#float_switch_relay").val("");
  $("#float_switch_relay").prop('checked', false);
  $("#float_switch_siren").val("");
  $("#float_switch_siren").prop('checked', false);
  $("#float_switch_email").val("");
  $("#float_switch_email").prop('checked', false);
  $("#float_switch_voice").val("");
  $("#float_switch_voice").prop('checked', false);
  $("#float_switch_text").val("");
  $("#float_switch_text").prop('checked', false);
 
//   var pumpCalCycle = result["pumpCalibrateCycles"]
//   if (pumpCalCycle >=5){
//      $("#pump_cycle").val(pumpCalCycle);
//   }else{
//      $("#pump_cycle").text("Water Level Data Will Begin To Display After 5 Pump Cycles");
//   }
  
  $("#form_device_id").val(result['id']);
  var sensorLimit = result["sensorLimit"];
  $.each( sensorLimit, function(key, value){
    if(value["sensorSlug"] == "tempc"){
      $("#temperature_container").show();
//       $("#temperature_name").val(value["sensorDisplayName"]);
      $("#temperature_min").val(value["lcl"]);
      $("#temperature_max").val(value["ucl"]);

      if(value["currentValue"] != "") {
		
        //set default temperature in "F"
        if(value["sensorDisplayUnits"] == 'F' ) {
          $('#current_temperature').html('<option value="F">Temperature in Fahrenheit </option> '+
            ' <option value="C">Temperature in Celsius</option>')
			          
          $("#current_temperature_in_f").html(value["currentValue"]);
          $('#temp_in_f').show();
          $('#temp_in_c').hide();

        }
        
		//set default temperature in "C"	
        else{
          $('#current_temperature').html('<option value="C">Temperature in Celsius</option> '+
            ' <option value="F">Temperature in Fahrenheit </option> ')
          
          $("#current_temperature_in_c").html(value["currentValue"]);
          $('#temp_in_c').show();
          $('#temp_in_f').hide();

        }
        
         // $("#current_temperature_in_f").html(convert_C_to_F(value["currentValue"]));
         // $("#current_temperature_in_c").html(convert_C(value["currentValue"]));
         // $("#current_temperature_in_c").html(value["currentValue"]);

      }else{
        $("#current_temperature_in_f").html("None");
        $("#current_temperature_in_c").html("None");
      }
        
//       $(".display_unit").html(value["sensorDisplayUnits"]);
      
      if(value["relay"] == 2){
        
        $("#temperature_relay").prop('checked', true);
        $("#temperature_relay").val(value["relay"]);
      }
      if(value["siren"] == 1){
        $("#temperature_siren").prop('checked', true);
        $("#temperature_siren").val(value["siren"]);
      }
      if(value["email"] == 1){
        $("#temperature_email").prop('checked', true);
        $("#temperature_email").val(value["email"]);
      }
      if(value["text"] == 1){
        $("#temperature_text").prop('checked', true);
        $("#temperature_text").val(value["text"]);
      }
      if(value["voice"] == 1){
        $("#temperature_voice").prop('checked', true);
        $("#temperature_voice").val(value["voice"]);
      }
    };

    if(value["sensorSlug"] == "rh"){
      $("#humidity_container").show();
      $("#humidity_min").val(value["lcl"]);
      $("#humidity_max").val(value["ucl"]);
//       $("#humidity_name").val(value["sensorDisplayName"]);
      $("#current_humidity").html(display_humidity_per(value["currentValue"]));
      
      if(value["relay"] == 2){
        $("#humidity_relay").prop('checked', true);
        $("#humidity_relay").val(value["relay"]);
      }
      if(value["siren"] == 1){
        $("#humidity_siren").prop('checked', true);
        $("#humidity_siren").val(value["siren"]);
      }
      if(value["email"] == 1){
        $("#humidity_email").prop('checked', true);
        $("#humidity_email").val(value["email"]);
      }
      if(value["text"] == 1){
        $("#humidity_text").prop('checked', true);
        $("#humidity_text").val(value["text"]);
      }
      if(value["voice"] == 1){
        $("#humidity_voice").prop('checked', true);
        $("#humidity_voice").val(value["voice"]);
      }
    };

    if(value["sensorSlug"] == "power_good"){
      $("#power_container").show();
//       $("#power_label").val(value["currentValue"]);
//       $("#power_name").val(value["sensorDisplayName"]);
      if(value["isAlarm"] == true){
        $("#power_label").append('<span class="signal-poor">'+value["currentValue"]+'</span>');        
      }else{
        $("#power_label").append('<span class="signal-excellent">'+value["currentValue"]+'</span>');
      }
       
      if(value["relay"] == 2){
        $("#power_relay").prop('checked', true);
        $("#power_relay").val(value["relay"]);
      }
      if(value["siren"] == 1){
        $("#power_siren").prop('checked', true);
        $("#power_siren").val(value["siren"]);
      }
      if(value["email"] == 1){
        $("#power_email").prop('checked', true);
        $("#power_email").val(value["email"]);
      }
      if(value["text"] == 1){
        $("#power_text").prop('checked', true);
        $("#power_text").val(value["text"]);
      }
      if(value["voice"] == 1){
        $("#power_voice").prop('checked', true);
        $("#power_voice").val(value["voice"]);
      }
    }
    
    if(value["sensorSlug"] == "input1"){
      $("#leak_sensor_container").show();
      $("#leak_sensor_name").val(value['sensorDisplayName']);
//       if(value["currentValue"] == 'Open'){
//       $("#leak_sensor_label").text(value['currentValue']);
//       $("#leak_sensor_dropdown").val("open");
//       }else{
//       $("#leak_sensor_label").text(value['currentValue']);
//       $("#leak_sensor_dropdown").val("close");
//       }
      
      if(value["ucl"] != 65535){
        $("#leak_sensor_dropdown").val("open");
        $("#leak_sensor_label").text("Open");
      }
      if(value["lcl"] !=65535){
        $("#leak_sensor_dropdown").val("close");
        $("#leak_sensor_label").text("Close");
      } 
      if(value["relay"] == 2){
        $("#leak_sensor_relay").prop('checked', true);
        $("#leak_sensor_relay").val(value["relay"]);
      }
      if(value["siren"] == 1){
        $("#leak_sensor_siren").prop('checked', true);
        $("#leak_sensor_siren").val(value["siren"]);
      }
      if(value["email"] == 1){
        $("#leak_sensor_email").prop('checked', true);
        $("#leak_sensor_email").val(value["email"]);
      }
      if(value["text"] == 1){
        $("#leak_sensor_text").prop('checked', true);
        $("#leak_sensor_text").val(value["text"]);
      }
      if(value["voice"] == 1){
        $("#leak_sensor_voice").prop('checked', true);
        $("#leak_sensor_voice").val(value["voice"]);
      }
    }
    
    if(value["sensorSlug"] == "input2"){
      $("#float_switch_container").show();
      $("#float_switch_name").val(value['sensorDisplayName']);
      $("#float_switch_label").text(value['currentValue']);
//       if(value["currentValue"] == 'Open'){
//       $("#float_switch_label").text(value['currentValue']);
//       $("#float_switch_dropdown").val("open");
//       }else{
//       $("#float_switch_label").text(value['currentValue']);
//       $("#float_switch_dropdown").val("close");
//       }

      if(value["ucl"] != 65535){
        $("#float_switch_dropdown").val("open");
        $("#float_switch_label").text("Open");
      } 
      if(value["lcl"] !=65535){
        $("#float_switch_dropdown").val("close");
        $("#float_switch_label").text("Close");
      } 
      if(value["relay"] == 2){
        $("#float_switch_relay").prop('checked', true);
        $("#float_switch_relay").val(value["relay"]);
      }
      if(value["siren"] == 1){
        $("#float_switch_siren").prop('checked', true);
        $("#float_switch_siren").val(value["siren"]);
      }
      if(value["email"] == 1){
        $("#float_switch_email").prop('checked', true);
        $("#float_switch_email").val(value["email"]);
      }
      if(value["text"] == 1){
        $("#float_switch_text").prop('checked', true);
        $("#float_switch_text").val(value["text"]);
      }
      if(value["voice"] == 1){
        $("#float_switch_voice").prop('checked', true);
        $("#float_switch_voice").val(value["voice"]);
      }
    }
    
    if(value["sensorSlug"] == "cap_sense"){
      $("#water_level_container").show();
//       $('#water_level_name').val(value["sensorDisplayName"]);
      if(value["isAlarm"] == true){
        $("#current_water_level").append('<span class="signal-poor">'+value["currentValue"]+'</span>');
      }else{
        $("#current_water_level").append('<span>'+value["currentValue"]+'</span>');
      }
    }
  });
  
  var sensor_limit = result["sensorLimitMeta"];
  $('#pump_cycle').text(sensor_limit.cap_sense);
//   var deviceData = result["deviceData"];
//   $.each( deviceData, function( key, value ) {
//     if(value["sensorSlug"] == "tempc"){
//       $("#current_temperature_in_f").html(convert_C_to_F(value["value"]));
//       $("#current_temperature_in_c").html(convert_C(value["value"]));
//     }
//     if(value["sensorSlug"] == "rh"){
//       $("#current_humidity").html(display_humidity_per(value["value"]));  
//     }
//     if(value["sensorSlug"] == "cap_sense"){
//       $("#current_water_level").html(value["value"]);  
//     }
//     if(value["sensorSlug"] == "power_good"){
//       if(parseInt(value["value"]) == 1){
//         $("#power_label").text("Ok");
//       }else{
//         $("#power_label").text("Fault");
//       }
//     }
//   }); 
}

function searchSlug(dataArray, slug){
  rtn_val = {}
  $.each(dataArray, function(kk,vv){
    if(vv["sensorSlug"] == slug){
      rtn_val = vv
    }
  });
  return rtn_val;
}

jQuery(document).ready(function(){
  
  $(document).on('click', '.claim-device',function(e){
    e.preventDefault();
    $('#claim_device').show();
    $.fancybox({
      maxWidth  : 970,
      maxHeight : 600,
      fitToView : false,
      width     : '100%',
      height    : '100%',
      autoSize  : false,
      closeClick  : false,
      openEffect  : 'none',
      closeEffect : 'none',
      href : '#lightbox-claimdevice',
      beforeClose: function() {
      }
    });
  });
  

  $(document).on('click', '.notify-popup',function(e){
    e.preventDefault();
    $("div.accordion ul").text("");
    $('#accordian_form').show();
    $('.new-contact').hide();
    $('#contact-name').hide();
   
    get_all_contacts();
 
    $.fancybox({
      maxWidth  : 970,
      maxHeight : 700,
      fitToView : false,
      width     : '100%',
      height    : '100%',
      autoSize  : false,
      closeClick  : false,
      openEffect  : 'none',
      closeEffect : 'none',
      href        : '#lightbox-notifypopup',
    });
  });
  
  $(document).on('click','.device-accordian',function(e){
    e.preventDefault();
    var dev_id = $(this).attr('data-id');
    if($("div.accordion ul").find("[data-id = "+dev_id+"]").parent("li").hasClass("active")){
      $("div.accordion ul").find("[data-id = "+dev_id+"]").parent("li").removeClass("active");
      $('.accordion ul li.active').find('#temp_email').hide()
      $('.accordion ul li.active').find('#temp_voice').hide()
      $('.accordion ul li.active').find('#temp_text').hide()
      $('.accordion ul li.active').find('#test').hide()

    }else{
      $("div.accordion ul li").removeClass("active");
      $("div.accordion ul").find("[data-id = "+dev_id+"]").parent("li").addClass("active");
      $('.accordion ul li.active').find('#temp_email').hide()
      $('.accordion ul li.active').find('#temp_voice').hide()
      $('.accordion ul li.active').find('#temp_text').hide()
      $('.accordion ul li.active').find('#test').hide()
    }
    
  $('.accordian_form').each(function() {   // <- selects every <form> on page
    $(this).validate({        // <- initialize validate() on each form
                errorElement: 'span',
                rules: {
                    email_address: {
                      required: false,
                      pattern: "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum|in)"
                    },
                    email: {
                      required: false,
                      pattern: "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum|in)"
                    },
                    contact_name: {
                      required: false,
                    },
                    contact_mobile: {
                      required:false,
                      number:true,
                      minlength:10,
                      maxlength:12  
                    },
                    contact_mobile_text:{
                      required:false,
                      number:true,
                      minlength:10,
                      maxlength:12 
                  },
                    contact_mobile_voice:{
                      required:false,
                      number:true,
                      minlength:10,
                      maxlength:12, 
                  },

                },
                messages: {
                  email_address: {
                    required: "Please enter the valid email !",
                    pattern: "Please enter a valid email address"
                  },
                  email: {
                    required: "Please enter the valid email !",
                    pattern: "Please enter a valid email address"
                  },
                  contact_name: {
                    required: "Please enter name first !"
                  },
                  contact_mobile:{
                    number: "Please enter number only",
                    minlength: "Enter minimum 10 digit without country code"
                  
                  },
                  contact_mobile_text:{
                    number: "Please enter number only",
                    minlength: "Enter minimum 10 digit without country code"
                  
                  },
                  contact_mobile_voice:{
                    number: "Please enter number only",
                    minlength: "Enter minimum 10 digit without country code"
                  
                  }
                }        
        });
    });     
  });

//On click of this, graph data for week
  $(document).on('click', '#week', function(e){
    var obj={};
    $('#today').removeClass('graph-button');
    $('#week').addClass('graph-button');
    
    obj["dateRange"] = 'week';
    obj["limit"]= '50000';
    obj["deviceId"] = $('#graph_data_range').val();     
    graph_data(obj);
  }); 
  
//On click of this, graph data for today
  $(document).on('click', '#today', function(e){
    $('#week').removeClass('graph-button');
    $('#today').addClass('graph-button');
    var obj={};
    obj["dateRange"] = 'today';
    obj["limit"]= '50000';
    obj["deviceId"] = $('#graph_data_range').val();
    
    graph_data(obj);
    
  });
  
  
  // On click first time on device static , graph data for today will get by default
  $(document).on('click', '.device-stats', function(e){
    
    e.preventDefault();
    var dev_id =parseInt($(this).closest('tr').attr('data-did'));
    
    $('#today').addClass('graph-button');
    $("#cal_id").val(dev_id);
    $("#graph_data_range").val(dev_id);
    var obj ={};
    obj['limit'] = 50000;
    obj['deviceId'] = dev_id;
    obj['dateRange'] = 'today'; 
    graph_data(obj);

  });
  
  //fetching data for graph [view chart]
  function graph_data(obj){
    
    jQuery('#graph_area').text("");
	var temperature_unit = ""
    var temp_dev_id = obj["deviceId"]
    var date_range = obj["dateRange"]   
    $.ajax({
      dataType: "json",
      url: BASE_URL+ "/api/v1/getDeviceDataList",
      type: 'POST',
      data: JSON.stringify(obj),
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token'),
      },
      contentType: 'application/json; charset=utf-8',
      success: function(result) {
        
        if (!$.trim(result.deviceDataList.LIST)){
         
          if(date_range =='today'){
              console.log(temp_dev_id);
              var obj ={};
              obj['limit'] = 50000;
              obj['deviceId'] = temp_dev_id;
              obj['dateRange'] = 'week'; 
       
              graph_data(obj);
            }
        
        }else{
        var get_device_data_list = [];
//         $("#today").val("");
          if(result.metaData != "" ){
          	temperature_unit = result.metaData['sensorDisplayUnits']
          }
        if (result.deviceDataList.LIST !=""){
      
          $(result.deviceDataList.LIST).each(function(index, value) {
            if (get_device_data_list.length == 0) {
              get_device_data_list.push({
                'time_stamp' : value.timeStamp.toString(),
                'row': [{
                  'sensor_uid' : value.sensorId,
                  'value' : value.value,
                }]
              })
            }else{
              var matchedObject = get_device_data_list.getMatchedElementByKey(value.timeStamp.toString());

              if (matchedObject.length == 0) {
                get_device_data_list.push({
                  'time_stamp' : value.timeStamp.toString(),
                  'row': [{
                    ' ' : value.value,
                  }]
                })
              }else{

                matchedObject["row"].push({
                  'sensor_uid' : value.sensorId,
                  'value' : value.value,
                });
              }
            }
          });
        }
    
//         Add wifi realted hardcode data
//         var max = 100;
//         var min = 1;
        
//         for(var index = 0; index < get_device_data_list.length; index ++) {

//           var value = Math.floor(Math.random() * (max - min + 1)) + min;
//           get_device_data_list[index].row.push({'sensor_uid': 11, 'value': value});
        
//         }

        get_device_data_list = get_device_data_list.sort(function(a, b) {           
          return b.time_stamp - a.time_stamp;
        });

        var data_series = -1;
      
        var data = get_device_data_list;
        Highcharts.setOptions({
          global: {
            useUTC: false
          }
        });
        if (typeof(data) == "object") {
          if (data == null || data === undefined || data.length < 1 || data[0].time_stamp == null || data[0].time_stamp == undefined) {
            // do nothing.
          } else {
            // the initial graph datata.
            var initialData = {
              "1": [],
              "2": [],
              "3": [],
              "6": [],
              "4": [],
              "7": [],
              "8": [],
              "11": []
            };
		
            // update the graph.
            if (data_series < 1) {
              data_series = 1;
              // build the initial graph
              var newData = data;
              newData.reverse();
              for (i in newData){
                var now = new Date(newData[i].time_stamp * 1000);
                var row = newData[i].row;
                for (n in row){
                  var point = row[n];
                  if (initialData[point.sensor_uid] === undefined) {
                    continue;
                  }
                  initialData[point.sensor_uid].push([now.getTime(), format_data(point.sensor_uid, point.value)]);
                }
              }
              console.log(initialData, '!!!!!!')
				
              doChart(initialData, temperature_unit);
             
            } else {    
              var newData = data;
              newData.reverse();
              var chart = jQuery('#graph_area').highcharts();
              
              // append new data
              for (i in newData) {
                var now = new Date(newData[i].time_stamp * 1000);
                var row = newData[i].row;
                for (n in rowform_device_id) {
                  var point = row[n];
                  //skip variables that were not in the origin data.
                  if (initialData[point.sensor_uid] === undefined) {
                    continue;
                  }

                  var series_idx = 0;
                  if (point.sensor_uid == 2) {
                    series_idx = 1;
                  } else if (point.sensor_uid == 3) {
                    series_idx = 2;
                  } else if (point.sensor_uid == 6) {
                    series_idx = 3;
                  } else if (point.sensor_uid == 4) {
                    series_idx = 4;
                  }

                  chart.series[series_idx].addPoint([now.getTime(), format_data(point.sensor_uid, point.value)]);
                }
              }
            }
          }
          for (i in data) {
            if (i == "last_checkin_time") {
              if (data[i] < 1) {
                jQuery('#' + i).html("Has Not Checked In");
              } else {
                jQuery('#' + i).html(Highcharts.dateFormat("%a %b %e %Y %I:%M%p", new Date(data[i])));
              }
              continue;
            } else if (i == "relay_state" || i == "siren_state") {
              if (data[i] > 0) {
                data[i] = "On";
              } else {
                data[i] = "Off"
              }

              if (i == "siren_state" && data['alarm_silence'] > 0) {
                data[i] = "Silenced";
              }
            }
            jQuery('#' + i).html(data[i]);
          }

          // set device state for limits.
          var device_state = data['device_state'];
          if (device_state < 1) {
   
            jQuery('.row_sensor_limit').removeClass("isAlarm");
          } else {
            jQuery('.row_sensor_limit').each(function() {
              if (jQuery(this).data("device_flag") < 1) {
                return true;
              }

              if ((device_state & jQuery(this).data("device_flag")) > 0) {
                jQuery(this).addClass("isAlarm");
              } else {
                jQuery(this).removeClass("isAlarm");
              }
            });
          }
        } else {
         
          // DO NOTHING
        } 
      }
        
        
        $.fancybox({
          maxWidth  : 1050,
          maxHeight : 700,
          fitToView : false,
          width     : '100%',
          height    : '100%',
          autoSize  : false,
          closeClick  : false,
          openEffect  : 'none',
          closeEffect : 'none',
          href        : '#lightbox-logs',
          beforeClose: function() {
          }
        });
      }, beforeSend: function() {
        $('.loader').css('display', 'block');
      }, complete: function(){
        
        $('.loader').css('display', 'none');
      }
    })
   
  }

  jQuery('.ToLocalTime').each(function() {
    jQuery(this).html(Highcharts.dateFormat("%a %b %e %Y %I:%M%p", new Date(jQuery(this).data("gmt"))));
  });
    
  $(document).on('click', '.log-details', function(e){
    e.preventDefault();
    var obj = {};
    obj['deviceId'] = parseInt($(this).closest('tr').attr('data-did'));
    obj['limit'] = 25;
    obj['currentPage'] = 1;
    alarm_log(obj);
  });
 
  
$(document).on('click', '#next', function(e){
    e.preventDefault();

    var obj = {};
    obj['deviceId'] = $('#device_id').val()
    obj['limit'] = 25;
    obj['currentPage']= $('#next_page').val()
    obj['RESULTS_PER_PAGE']= 25;        
    alarm_log(obj);
  });
  
  $(document).on('click', '#previous', function(e){
    e.preventDefault();
    var obj = {};
    obj['deviceId'] = $('#device_id').val()
    obj['limit'] = 25;
    obj['currentPage']= $('#previous_page').val()
    obj['RESULTS_PER_PAGE']= 25;
    alarm_log(obj);
  });
  
  function alarm_log(obj){
    $.ajax({
      url: BASE_URL+"/api/v1/getDeviceLogList",
      type: 'POST',
      data: JSON.stringify(obj),
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
        log_detail_device(result);
          
        $.fancybox({
          maxWidth  : 970,
          maxHeight : 700,
          fitToView : false,
          width     : '100%',
          height    : '100%',
          autoSize  : false,
          closeClick  : false,
          openEffect  : 'none',
          closeEffect : 'none',
          href        : '#lightbox-alarm-log',
          beforeClose: function() {
          }
        });
        $(".fancybox-inner").scroll(function(){
          var divh = $(this);
          if (divh[0].scrollHeight - divh.scrollTop() == divh.height()){
          }   
        });
        
        },beforeSend: function() {
          $('.loader').css('display', 'block');
        },complete: function(){
          $('.loader').css('display', 'none');
        },
        error: function (error) {
          sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
        }
      });  
  }

  $(".fancybox-inner").scroll(function(){
    var divh = $(this);
    if (divh[0].scrollHeight - divh.scrollTop() == divh.height())
    {
      console.log("Reached the bottom!");
    }   
  });

//   $(document).on('click', '.log-details', function(e){
//     e.preventDefault();
//  var win = $(window);
//     var obj = {};
//     obj['id'] = $(this).data('id');
    
//     alarm_log(obj);
//   });
  
  $(document).on('click','.personal-info',function(e){
    e.preventDefault();
    $("#personal-info").css('display','block');
    $("label.error").css('display','block');
    
    $.ajax({
      url: BASE_URL+"/api/v1/getUser",
      type: 'POST',
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
        $("#first_name").val(result.user.firstName);
        $("#last_name").val(result.user.lastName);
        $("#email").val(result.user.email);
        $("#address").val(result.user.address);
        $("#city").val(result.user.city);
        $("#postal_code").val(result.user.zipcode);   
        
        $("#select_country option").each(function() {
          if($(this).text() == result.user.country) {
            $(this).attr('selected', 'selected'); 
            $(this).trigger("change");
          }
        });
   
        //For run this after completing current ajax
        $(document).ajaxSuccess(function() {
          $("#state option").each(function() {
            if($(this).text() == result.user.state) {
              $(this).attr('selected', 'selected');
            }
          });
        });
        $("#hidden_id").val(result.user.id);       
      },beforeSend: function() {
        $('.loader').css('display', 'block');
      },complete: function(){
        $('.loader').css('display', 'none');
      },error: function (error) {
        sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
      }
    });
    
    var obj = {};
    $.fancybox({
      maxWidth  : 970,
      maxHeight : 700,
      fitToView : false,
      width     : '100%',
      height    : '100%',
      autoSize  : false,
      closeClick  : false,
      openEffect  : 'none',
      closeEffect : 'none',
      href        : '#personal-information',
      beforeClose : function() {
      },
    });
  });

  $(document).on('click', '.claim-device-btn', function(e){
    if($('#claim_device').valid()){
      var obj={};
      e.preventDefault();

      color_codes = [];
      color_codes[0] = $(".power").find('option:selected').val();
      color_codes[1] = $(".cloud").find('option:selected').val();
      color_codes[2] = $(".calibrate").find('option:selected').val();
      color_codes[3] = $(".alarm").find('option:selected').val();

      obj['codes'] = color_codes;

      $.ajax({
        url: BASE_URL+"/api/v1/claimDevice",
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        crossDomain:true,
        async:true,
        headers: {
          'SESSIONKEY': window.localStorage.getItem('user-token')
        },
        contentType: 'application/json; charset=utf-8',
        success: function (result) {
          if((result.errorId == "102") && (result.success == false)){
            sweetAlert("Your codes cannot be found.", "Please Try again!", "error");       
          }else{
//             swal("Claimed!", "Device claimed successfully!", "success");
            swal({ 
              title: "Claimed!",
               text: "Device claimed successfully!",
                type: "success" 
              },
              function(){
                location.reload();
            });
          }
        },
        error: function (error) {
          sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
        }
      });
    }else{
      e.preventDefault();    
    }
  });

  $(document).on("click",".notify-add-btn",function(){
    $(".new-contact").show();
    $("#contact-name").show();
    $("#new-contact").find('.test-email-sms').find('#test_email').hide();
    $("#new-contact").find('.test-email-sms').find('#test_sms').hide();
    $('#contact_name').text('');
    $('.new-contact #contact-name').find('#contact_name').val('')
    $(".new-contact").find("#contact_type").val('');
    $("#contact_email").find("#email_address_id").val('');
    $('#text_msg').find('#mobile').val('')
    $('#voice').find('#mobile_voice').val('');
    
  });
  
//   $(document).on('click', '#temperature_relay', function(){
//     $("#temperature_relay").prop('checked', true);
//     $("#temperature_relay").val("2");
// //     $("#temperature_email").prop('checked', false);
// //     $("#temperature_siren").prop('checked', false);
// //     $("#temperature_voice").prop('checked', false);   
//   });
  
   $(document).ready(function() {
     
    //Teperature
     $(this).on('click', '[name="temp_relay"]', function(){
          if($("#temperature_relay").attr('value') =='2'){
              $("#temperature_relay").prop('checked', false)
              $("#temperature_relay").val("");
          }else{
              $("#temperature_relay").prop('checked', true);
              $("#temperature_relay").val("2");
          }
        });
     
     $(this).on('click', '[name="temp_text"]', function(){
          if($("#temperature_text").attr('value') =='1'){
              $("#temperature_text").prop('checked', false)
              $("#temperature_text").val("");
          }else{
              $("#temperature_text").prop('checked', true);
              $("#temperature_text").val("1");
          }
        });
     
     $(this).on('click', '[name="temp_voice"]', function(){
          if($("#temperature_voice").attr('value') =='1'){
              $("#temperature_voice").prop('checked', false)
              $("#temperature_voice").val("");
          }else{
              $("#temperature_voice").prop('checked', true);
              $("#temperature_voice").val("1");
          }
        });
    
     $(this).on('click', '[name="temp_email"]', function(){
          if($("#temperature_email").attr('value') =='1'){
              $("#temperature_email").prop('checked', false)
              $("#temperature_email").val("");
          }else{
              $("#temperature_email").prop('checked', true);
              $("#temperature_email").val("1");
          }
        });
     
     $(this).on('click', '[name="temp_siren"]', function(){
          if($("#temperature_siren").attr('value') =='1'){
              $("#temperature_siren").prop('checked', false)
              $("#temperature_siren").val("");
          }else{
              $("#temperature_siren").prop('checked', true);
              $("#temperature_siren").val("1");
          }
        });

        //Humidity
     $(this).on('click', '[name="hum_relay"]', function(){
          if($("#humidity_relay").attr('value') =='2'){
              $("#humidity_relay").prop('checked', false)
              $("#humidity_relay").val("");
          }else{
              $("#humidity_relay").prop('checked', true);
              $("#humidity_relay").val("2");
          }
        });
     
     $(this).on('click', '[name="hum_text"]', function(){
          if($("#humidity_text").attr('value') =='1'){
              $("#humidity_text").prop('checked', false)
              $("#humidity_text").val("");
          }else{
              $("#humidity_text").prop('checked', true);
              $("#humidity_text").val("1");
          }
        });
     
     $(this).on('click', '[name="hum_voice"]', function(){
          if($("#humidity_voice").attr('value') =='1'){
              $("#humidity_voice").prop('checked', false)
              $("#humidity_voice").val("");
          }else{
              $("#humidity_voice").prop('checked', true);
              $("#humidity_voice").val("1");
          }
        });
    
     $(this).on('click', '[name="hum_email"]', function(){
          if($("#humidity_email").attr('value') =='1'){
              $("#humidity_email").prop('checked', false)
              $("#humidity_email").val("");
          }else{
              $("#humidity_email").prop('checked', true);
              $("#humidity_email").val("1");
          }
        });
     
     $(this).on('click', '[name="hum_siren"]', function(){
          if($("#humidity_siren").attr('value') =='1'){
              $("#humidity_siren").prop('checked', false)
              $("#humidity_siren").val("");
          }else{
              $("#humidity_siren").prop('checked', true);
              $("#humidity_siren").val("1");
          }
        });
     
     //Power
     $(this).on('click', '[name="pow_relay"]', function(){
          if($("#power_relay").attr('value') =='2'){
              $("#power_relay").prop('checked', false)
              $("#power_relay").val("");
          }else{
              $("#power_relay").prop('checked', true);
              $("#power_relay").val("2");
          }
        });
     
     $(this).on('click', '[name="pow_text"]', function(){
          if($("#power_text").attr('value') =='1'){
              $("#power_text").prop('checked', false)
              $("#power_text").val("");
          }else{
              $("#power_text").prop('checked', true);
              $("#power_text").val("1");
          }
        });
     
     $(this).on('click', '[name="pow_voice"]', function(){
          if($("#power_voice").attr('value') =='1'){
              $("#power_voice").prop('checked', false)
              $("#power_voice").val("");
          }else{
              $("#power_voice").prop('checked', true);
              $("#power_voice").val("1");
          }
        });
    
     $(this).on('click', '[name="pow_email"]', function(){
          if($("#power_email").attr('value') =='1'){
              $("#power_email").prop('checked', false)
              $("#power_email").val("");
          }else{
              $("#power_email").prop('checked', true);
              $("#power_email").val("1");
          }
        });
     
     $(this).on('click', '[name="pow_siren"]', function(){
          if($("#power_siren").attr('value') =='1'){
              $("#power_siren").prop('checked', false)
              $("#power_siren").val("");
          }else{
              $("#power_siren").prop('checked', true);
              $("#power_siren").val("1");
          }
        });

     
     //Leak Sensor
  
     $(this).on('click', '[name="leak_relay"]', function(){
          if($("#leak_sensor_relay").attr('value') =='2'){
              $("#leak_sensor_relay").prop('checked', false)
              $("#leak_sensor_relay").val("");
          }else{
              $("#leak_sensor_relay").prop('checked', true);
              $("#leak_sensor_relay").val("2");
          }
        });
     
     $(this).on('click', '[name="leak_text"]', function(){
       
          if($("#leak_sensor_text").attr('value') =='1'){
              $("#leak_sensor_text").prop('checked', false)
              $("#leak_sensor_text").val("");
          }else{
              $("#leak_sensor_text").prop('checked', true);
              $("#leak_sensor_text").val("1");
          }
    
        });
     
     $(this).on('click', '[name="leak_voice"]', function(){
          if($("#leak_sensor_voice").attr('value') =='1'){
              $("#leak_sensor_voice").prop('checked', false)
              $("#leak_sensor_voice").val("");
          }else{
              $("#leak_sensor_voice").prop('checked', true);
              $("#leak_sensor_voice").val("1");
          }
        });
    
     $(this).on('click', '[name="leak_email"]', function(){
          if($("#leak_sensor_email").attr('value') =='1'){
              $("#leak_sensor_email").prop('checked', false)
              $("#leak_sensor_email").val("");
          }else{
              $("#leak_sensor_email").prop('checked', true);
              $("#leak_sensor_email").val("1");
          } 
        });
     
     $(this).on('click', '[name="leak_siren"]', function(){
          if($("#leak_sensor_siren").attr('value') =='1'){
              $("#leak_sensor_siren").prop('checked', false)
              $("#leak_sensor_siren").val("");
          }else{
              $("#leak_sensor_siren").prop('checked', true);
              $("#leak_sensor_siren").val("1");
          }
        });
     
     
     //Float Switch Sensor
     $(this).on('click', '[name="float_relay"]', function(){
          if($("#float_switch_relay").attr('value') =='2'){
              $("#float_switch_relay").prop('checked', false)
              $("#float_switch_relay").val("");
          }else{
              $("#float_switch_relay").prop('checked', true);
              $("#float_switch_relay").val("2");
          }
        });
     
     $(this).on('click', '[name="float_text"]', function(){
       
          if($("#float_switch_text").attr('value') =='1'){
              $("#float_switch_text").prop('checked', false)
              $("#float_switch_text").val("");
          }else{
              $("#float_switch_text").prop('checked', true);
              $("#float_switch_text").val("1");
          }
        });
     
     $(this).on('click', '[name="float_voice"]', function(){
          if($("#float_switch_voice").attr('value') =='1'){
              $("#float_switch_voice").prop('checked', false)
              $("#float_switch_voice").val("");
          }else{
              $("#float_switch_voice").prop('checked', true);
              $("#float_switch_voice").val("1");
          }
        });
    
     $(this).on('click', '[name="float_email"]', function(){
          if($("#float_switch_email").attr('value') =='1'){
              $("#float_switch_email").prop('checked', false)
              $("#float_switch_email").val("");
          }else{
              $("#float_switch_email").prop('checked', true);
              $("#float_switch_email").val("1");
          }
        });
     
     $(this).on('click', '[name="float_siren"]', function(){
          if($("#float_switch_siren").attr('value') =='1'){
              $("#float_switch_siren").prop('checked', false)
              $("#float_switch_siren").val("");
          }else{
              $("#float_switch_siren").prop('checked', true);
              $("#float_switch_siren").val("1");
          }
        });     
   });

  
  $('#contact_type').on('change', function(){
    var formId = $(this).val();//get form id to show
    $('#voice').hide();
    $('#contact_email').hide();
    $('#text_msg').hide();
    
    $(formId).show(); //find form by its id in cached forms and show.
    
    if(formId=='#contact_email'){
      $("#new-contact").find('.test-email-sms').find('#test_sms').hide();
      $("#new-contact").find('.test-email-sms').find('#test_email').show();
    }
    if(formId=='#text_msg'){
      $("#new-contact").find('.test-email-sms').find('#test_email').hide();
      $("#new-contact").find('.test-email-sms').find('#test_sms').show();
    }
    if(formId=='#voice'){
    $("#new-contact").find('.test-email-sms').find('#test_email').hide();
    $("#new-contact").find('.test-email-sms').find('#test_sms').hide();  
    }
  });

 $('#current_temperature').on('change', function(){
    var current_temp = $(this).val();
    var currentValue = ''
    
    if(current_temp == "C"){
        $('#temp_in_c').show();
        $('#temp_in_f').hide();
        currentValue = $("#current_temperature_in_f").text()    
        $("#current_temperature_in_c").text(convert_C(currentValue));

      //        $("#current_temperature_in_f").html(convert_C_to_F(currentValue));           
      //        $('#current_temperature option[value="fahrenheit"]').text("Choose degree: Temperature in Fahrenheit");

    }else{
        $('#temp_in_f').show();
        $('#temp_in_c').hide();

        currentValue = $("#current_temperature_in_c").text()    
        $("#current_temperature_in_f").text(convert_C_to_F(currentValue));

      //       $('#current_temperature option[value="celsius"]').text("Choose degree: Temperature in Celsius");
    }
  })

  
  $(document).on('change','#select_type_change', function(){
  
    var select_type = $(this).val();
    if (select_type == 'text_msg'){
      $('.accordion ul li.active').find('#temp_email').hide()
      $('.accordion ul li.active').find('#temp_voice').hide()
      $('.accordion ul li.active').find('#temp_text').show()
      $('.accordion ul li.active').find('#test').show()
      
//       record = '<div class="" id="temp">\
//                  <div class="column width-4">\
//                          <div class="form-group">\
//                          <h5><label for="mobile">Cell Phone Number</label></h5>\
//                              <input type="text" class="form-control" id="mobile" name="contact_mobile" placeholder="90 Do not use dashes">\
//                          </div>\
//                  </div>\
//                  <div class="column width-4">\
//                          <div class="form-group">\
//                          <h5><label for="service_provider">Service Provider</label></h5>\
//                          <select class="form-control" id="service_provider_voice_contact">\
//                              <option value="">Select your Cellular Provider </option>\
//                          </select>\
//                          </div>\
//                  </div>\
//               </div>';

//       $('#conatct_type_content').append(record); 
    }else if(select_type=='voice'){
      $('.accordion ul li.active').find('#temp_email').hide()
      $('.accordion ul li.active').find('#temp_text').hide()
      $('.accordion ul li.active').find('#test').hide()
      $('.accordion ul li.active').find('#temp_voice').show()
      
//         record = '<div class="" id="temp">\
//               <div class="column width-4">\
//                   <div class="form-group">\
//                       <h5><label for="mobile">Cell Phone Number</label></h5>\
//                       <input type="text" class="form-control" id="mobile" name="contact_mobile" placeholder="90 Do not use dashes">\
//                   </div>\
//               </div>\
//               <div class="column width-4">\
//                   <div class="form-group">\
//                       <h5><label for="service_provider">Service Provider</label></h5>\
//                       <select class="form-control" id="service_provider_voice_contact">\
//                           <option value="">Select your Cellular Provider </option>\
//                       </select>\
//                   </div>\
//               </div>\
//        </div>';
      
//       $('#conatct_type_content').append(record);
    }else{
    
      $('.accordion ul li.active').find('#temp_text').hide()
      $('.accordion ul li.active').find('#temp_voice').hide()
      $('.accordion ul li.active').find('#temp_email').show()
      $('.accordion ul li.active').find('#test').show()
      
//       record = '<div class ="column width-6" id="email_temp"><div class="form-group">\
//                  <h5><label for="email_address">Email Address</label></h5>\
//                  <input type="email" class="form-control" id="email_address_id" name="email" placeholder="Enter your email">\
//               </div></div>';
//       $('#conatct_type_content').append(record);
    }
  });
  
  
  $(document).on('click', '.create_contact', function(e) {
    // TODO : VALIDATIONS ON CONTACT FORM
//     $("#contact_name").text('');
//     $('#email_address_id').text('');  
    var formId = $('#contact_type').val()
    if ($('#contact-name').valid()) {
      if ($(formId).valid()) {
        var parent_obj = $("#new-contact");
        var obj = {};
        e.preventDefault();

        obj['firstName'] = parent_obj.find("input#contact_name").val().split(' ')[0];
        obj['lastName'] = parent_obj.find("input#contact_name").val().split(' ')[1];
        obj['mobile'] = "";
        obj['cellProvider'] = "";
        obj['email'] = "";
        obj['emailActive'] = "0";
        obj['smsActive'] = "0";
        obj['voiceActive']="0";
        obj['defaultStatus'] = "0";
        obj['enableStatus'] = "0";

        if (parent_obj.find('select#contact_type').val() == "#contact_email") {
          obj['emailActive'] = "1";
          obj['email'] = parent_obj.find('input#email_address_id').val();
          if (obj['email'].length > 0 && parent_obj.find("input#contact_enabled").is(':checked')) {
            obj['enableStatus'] = "1";
          } else {
            obj['enableStatus'] = "0";
          }
        } 
        else if(parent_obj.find('select#contact_type').val() == "#text_msg"){
          obj['smsActive'] = "1";
          obj['mobile'] = parent_obj.find("input#mobile").val();
          obj['cellProvider'] = parent_obj.find("select#service_provider").val();
          if (parent_obj.find('input#contact_enabled').is(':checked')) {
            obj['enableStatus'] = "1";
          } else {
            obj['enableStatus'] = "0";
          }
        }
        else if(parent_obj.find('select#contact_type').val() == "#voice"){
          obj['voiceActive']="1";
          obj['mobile'] = parent_obj.find("input#mobile_voice").val();
          obj['cellProvider'] = parent_obj.find("select#service_provider_voice").val();
          if (parent_obj.find('input#contact_enabled').is(':checked')) {
            obj['enableStatus'] = "1";
          } else {
            obj['enableStatus'] = "0";
          } 
        }
     
        console.log(obj);
        $.ajax({
          url: BASE_URL + "/api/v1/addContact",
          type: 'POST',
          data: JSON.stringify(obj),
          dataType: 'json',
          crossDomain: true,
          async: true,
          headers: {
            'SESSIONKEY': window.localStorage.getItem('user-token')
          },
          contentType: 'application/json; charset=utf-8',
          success: function(result) {
            swal("Added!", "Contact added successfully!", "success");
            $(".notify-popup").click();//For reloading notification page
            $(".new-contact").hide();//For hiding add contact form after submit the form
            $("#contact-name").hide();
          },
          error: function(error) {
            sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
          }
        });
      } else {
        e.preventDefault();
      }
    } else {
      e.preventDefault();
    }
  });

  $(document).on('click', '#contact_type_checked', function(e){

    if($('.accordion ul li.active').find('#enableStatus').prop('checked')){
        $('.accordion ul li.active').find('#enableStatus').prop('checked', false);
    }else{
        $('.accordion ul li.active').find('#enableStatus').prop('checked', true);   
    }
  });
  
  $(document).on('click', '#create_contact_en', function(e){

  if($('#contact_enabled').prop('checked')){
      $('#contact_enabled').prop('checked', false);
  }else{
      $('#contact_enabled').prop('checked', true);   
    }
  });
  
  // editContact i.e update the conatct type
    $(document).on('click', '.save-update-btn', function(e){
    // TODO : VALIDATIONS ON CONTACT FORM
    var parent_obj = $(".contact_"+$(this).attr('data-id'));
    var obj={};

    e.preventDefault();
      
    obj['id'] = $(this).attr('data-id');
    obj['mobile'] = '';
    obj['cellProvider'] = '';
    obj['smsActive'] = '0';
    obj['emailActive'] = '0';
    obj['voiceActive'] = '0';
    obj['enableStatus'] = '0';
    obj['email'] = '';
    obj['firstName'] = parent_obj.find('input#contact_name').val().split(' ')[0];
    obj['lastName'] = parent_obj.find('input#contact_name').val().split(' ')[1];
    
    var type = parent_obj.find('#select_type_change').val()
    
    if(type=='text_msg'){   
      obj['mobile'] = parent_obj.find('input#change_mobile_text').val()
//       obj['cellProvider'] = parent_obj.find('.accordion ul li.active').find('select#service_provider').val();
      obj['cellProvider'] = $(this).closest('li.active').find('select.service_provider_text').val();
      obj['smsActive'] = '1';
      obj['emailActive'] = '0';
      obj['voiceActive'] = '0';
    
    }else if(type=='voice'){   
      obj['mobile'] = parent_obj.find('input#change_mobile_voice').val()
      obj['cellProvider'] = $(this).closest('li.active').find('select.service_provider_voice').val();
      obj['smsActive'] = '0';
      obj['emailActive'] = '0';
      obj['voiceActive'] = '1';
      
    }else if(type=='contact_email'){
      obj['email'] = parent_obj.find('input#email_address_id').val()
      obj['smsActive'] = '0';
      obj['emailActive'] = '1';
      obj['voiceActive'] = '0';  
    }else{
      swal("Please select the contact type to update");
      $(".notify-popup").click();    
    }
      
    if($(this).closest('li.active').find('#enableStatus').prop('checked')){
      
      obj['enableStatus'] = '1';
    }else{
        obj['enableStatus'] = '0';
    }

//       else{
    
//      if(parent_obj.find("input#email_address").val()){
//           obj['email'] = parent_obj.find("input#email_address").val()
      
//          }
//         if(parent_obj.find("input#mobile_voice").val() || parent_obj.find("input#mobile").val()){
//           obj['voice'] = parent_obj.find("input#mobile_voice").val();
//           obj['mobile'] = parent_obj.find("input#mobile").val();
//           obj['cellProvider'] = parent_obj.find("select#service_provider_select").val();
//          }
//     }   
    
//     if(parent_obj.find('input#smsActive').prop('checked')){
//         obj['smsActive'] = "1";
        
//      }else{
//         obj['smsActive'] = "0";
//       }
    
//     if(parent_obj.find('input#emailActive').prop('checked')){
//         obj['emailActive'] = "1";
//      }else{
//         obj['emailActive'] = "0";
//       }

//     if(parent_obj.find('input#voiceActive').prop('checked')){
//         obj['voiceActive'] = "1";
//     }else{
//         obj['voiceActive'] = "0";
//     }
    
//     if(parent_obj.find('input#smsActive').prop('checked')){
//       obj['mobile'] = parent_obj.find("input#mobile").val();
//       obj['cellProvider'] = parent_obj.find("select#service_provider_select").val();
//       if(parent_obj.find('input#smsActive').prop('checked')){
//         obj['smsActive'] = "1";
//       }else{
//         obj['smsActive'] = "0";
//       }
//     }else if(parent_obj.find('input#emailActive').prop('checked')) {
      
//       obj['email'] = parent_obj.find("input#email_address").val();
      
//       if(parent_obj.find('input#emailActive').prop('checked')){
//         obj['emailActive'] = "1";
//       }else{
//         obj['emailActive'] = "0";
//       }
//     }else{
//       obj['voice'] = parent_obj.find("input#mobile_voice").val();
//       if(parent_obj.find('input#voiceActive').prop('checked')){
//         obj['voiceActive'] = "1";
//       }else{
//         obj['voiceActive'] = "0";
//       }
//     }

    $.ajax({
      url: BASE_URL+"/api/v1/editContact",
      type: 'POST',
      data: JSON.stringify(obj),
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
        swal("Added!", "Contact updated successfully!", "success");
        $(".notify-popup").click(); // For reloading page after Save
      },
      error: function (error) {
        sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
      }
    });
  });

  // delete contact  
  $(document).on('click', '.delete-btn', function(e) {
    e.preventDefault();

    var obj = {};
    obj['id'] = $(this).attr('data-id');

    swal({
      title: "Are You Sure You Want To Delete This Device?",
      text: "All Data Will Be Lost!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
      closeOnConfirm: false
    },
    function() {
      $.ajax({
        url: BASE_URL + "/api/v1/deleteContact",
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        crossDomain: true,
        async: true,
        headers: {
          'SESSIONKEY': window.localStorage.getItem('user-token')
        },
        contentType: 'application/json; charset=utf-8',
        success: function(result) {
          swal("Deleted!", "Successfully delete contact!", "success");
          $(".notify-popup").click(); // For reloading page after delete
        },
        error: function(error) {
          sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
        }
      });
    });
  });

  $(document).on('change', '.select-country', function(){
    if($.isNumeric($(this).val())){
      var obj={};
      obj['countryId'] = $(this).val();
      
      $.ajax({
        url: BASE_URL+"/api/v1/getStateList",
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        crossDomain:true,
        async:true,
        headers: {
          'SESSIONKEY': window.localStorage.getItem('user-token')
        },
        contentType: 'application/json; charset=utf-8',
        success: function (result) {
          $('.country-state').empty();
          $.each( result.stateList, function( key, value ) {
            $('.country-state').append($("<option></option>").attr("value",value.id) .text(value.name)); 
          });
        },
        error: function (error) {
          sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
        }
      });
    }
  });

  $(document).on('click', '.edit-device-details', function(e){
    e.preventDefault();
   
    var obj = {};
    obj['id'] = $(this).data('id');    
    $.ajax({
      url: BASE_URL+"/api/v2/getDevice",
      type: 'POST',
      data: JSON.stringify(obj),
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
        deviceDetailInfo = result['device'];
        setFormValueDevice(deviceDetailInfo);
        $.fancybox({
          maxWidth  : 970,
          maxHeight : 700,
          fitToView : false,
          width     : '100%',
          height    : '100%',
          autoSize  : false,
          closeClick  : false,
          openEffect  : 'none',
          closeEffect : 'none',
          href        : '#lightbox-edit-device',
          beforeClose: function() {
          }
        });
      },
      error: function (error) {
        sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
      },beforeSend: function() {
        $('.loader').css('display', 'block');
      },complete: function(){
        $('.loader').css('display', 'none');
      }
    });
  });

  //Alarm Setting 
  $(document).on('click', '.edit-device-details-alarm', function(e){
    e.preventDefault();
    var obj = {};
    obj['id'] = $(this).data('id');
//   request for device alarm congif, prior this api was "/api/v1/getDevice" instead of "/api/v2/getAlarmConfig"
    $.ajax({
      url: BASE_URL+"/api/v2/getAlarmConfig",
      type: 'POST',
      data: JSON.stringify(obj),
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
     	
        deviceDetailInfo = result['device'];
        
        setFormValue(deviceDetailInfo);
        
        $.fancybox({
          maxWidth  : 970,
          maxHeight : 700,
          fitToView : false,
          width     : '100%',
          height    : '100%',
          autoSize  : false,
          closeClick  : false,
          openEffect  : 'none',
          closeEffect : 'none',
          href        : '#lightbox-edit-device-alarm',
          beforeClose: function() {
          }
        });
      },
      error: function (error) {
        sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
      },beforeSend: function() {
        $('.loader').css('display', 'block');
      },complete: function(){
        $('.loader').css('display', 'none');
      }
    });
  });


  $(document).on('click','.edit-device-info',function(event){
    event.preventDefault();
    
    var form_list ={}
    var obj = {"deviceConfig" : [], "sirenState" : "0", "relayState" : "0", "deviceConfigMeta" : []};
    
    obj["id"] = $("#form_devicedetail_id").val();
    var form_data = $("#edit_device_form_part1").serializeArray();
    
    $.each( form_data, function( key, value ) {
      if(value["name"] == "displayName"){
        obj["displayName"] = value["value"];
      }
      if(value["name"] == "update_interval"){
        obj["deviceConfig"].push({ "configKey": value["name"],"configVal": value["value"]})
//         obj["deviceConfigMeta"].push({ "configKey": value["name"],"configVal": value["value"]})
      }
      if(value["name"] == "checkin_interval"){
        obj["deviceConfig"].push({ "configKey": value["name"],"configVal": value["value"]})
      }
      if(value["name"] == "sirenState"){
        obj[value["name"]] = value["value"];
      }
      if(value["name"] == "relayState"){
        obj[value["name"]] = value["value"];
      }
    });
    
    $.ajax({
      url: BASE_URL+"/api/v1/editDevice",
      type: 'POST',
      data: JSON.stringify(obj),
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
        
        console.log("done...");
        $.fancybox.close();
        swal("Success!", "Device configuration has been updated!", "success");
        location.reload();
      },
      error: function (error) {
        sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
      }
    })
    return false;
  });

 //save update Alarm setting
  $(document).on('click','.edit-device-info-alarm',function(event){
    event.preventDefault();
    var obj = {"sensorLimit" : []};
    obj["id"] = $("#form_device_id").val();
    var form_data = $("#edit_device_form_part2").serializeArray();
    var form_list = {};
    $.each(form_data, function(k,v){
      form_list[v["name"]] = v["value"]
    });
    var tempc = {"sensorSlug": "tempc","lcl": "0", "ucl": "0", "relay": 0, "siren": 0, "email": 0, "voice":0, "text":0, "sensorDisplayUnits":"" };
    var rh = {"sensorSlug": "rh","lcl": "0", "ucl": "0", "relay": 0, "siren": 0, "email": 0, "voice":0, "text":0};
    var power_good = {"sensorSlug": "power_good", "relay": 0, "siren": 0, "email": 0, "voice":0, "text":0};
    var input1 = {"sensorSlug": "input1", "relay": 0, "siren": 0, "email": 0, "voice":0, "text":0, "sensorDisplayName":"","currentValue":""};
    var input2 = {"sensorSlug": "input2", "relay": 0, "siren": 0, "email": 0, "voice":0, "text":0,"sensorDisplayName":"", "currentValue":""};
    
    $.each(form_list, function( key, value ) {
      if(key == "current_temperature"){
        tempc["sensorDisplayUnits"] = value;
      }
      if(key == "temperature_lcl"){
        tempc["lcl"] =  value;
      }
      if(key == "temperature_ucl"){
        tempc["ucl"] =  value;
      }
      if(key == "temperature_relay"){
        tempc["relay"] =  value;
      }
      if(key == "temperature_siren"){
        tempc["siren"] =  value;
      }
      if(key == "temperature_email"){
        tempc["email"] =  value;
      }
      if(key == "temperature_voice"){
        tempc["voice"] =  value;
      }
      if(key == "temperature_text"){
        tempc["text"] =  value;
      }
      
      if(key == "humidity_lcl"){
        rh["lcl"] =  value;
      }
      if(key == "humidity_ucl"){
        rh["ucl"] =  value;
      }
      if(key == "humidity_relay"){
        rh["relay"] =  value;
      }
      if(key == "humidity_siren"){
        rh["siren"] =  value;
      }
      if(key == "humidity_email"){
        rh["email"] =  value;
      }
      if(key=="humidity_voice"){
        rh["voice"] = value;
      }
      if(key=="humidity_text"){
        rh["text"] = value;
      }
      
      if(key == "power_relay"){
        power_good["relay"] =  value;
      }
      if(key == "power_siren"){
        power_good["siren"] =  value;
      }
      if(key == "power_email"){
        power_good["email"] =  value;
      }
      if(key == "power_voice"){
        power_good["voice"] = value;
      }
      if(key == "power_text"){
        power_good["text"] = value;
      }
     
      if(key == "leak_sensor_relay"){
        input1["relay"] =  value;
      }
      if(key == "leak_sensor_siren"){
        input1["siren"] =  value;
      }
      if(key == "leak_sensor_email"){
        input1["email"] =  value;
      }
      if(key == "leak_sensor_voice"){
        input1["voice"] = value;
      }
      if(key == "leak_sensor_text"){
        input1["text"] = value;
      }
      if(key == "leak_sensor_label"){
        input1["sensorDisplayName"] =value;
      }
      if(key == "leak_sensor"){
        if(value == "open"){
          input1["lcl"] =  65535;
          input1["ucl"] =  700;
        }else{
          input1["lcl"] =  700;
          input1["ucl"] =  65535;
        }
      }
      
      if(key == "float_switch_relay"){
        input2["relay"] =  value;
      }
      if(key == "float_switch_siren"){
        input2["siren"] =  value;
      }
      if(key == "float_switch_email"){
        input2["email"] =  value;
      }
      if(key == "float_switch_voice"){
        input2["voice"] = value;
      }
      if(key == "float_switch_text"){
        input2["text"] = value;
      }
      if(key == "float_switch_label"){
        input2["sensorDisplayName"] = value;
      }
      if(key == "float_switch"){
        if(value == "open"){
          input2["lcl"] =  65535;
          input2["ucl"] =  700;
        }else{
          input2["lcl"] =  700;
          input2["ucl"] =  65535;
        }
      }
    });
    
    obj["sensorLimit"].push(tempc);
    obj["sensorLimit"].push(rh);
    obj["sensorLimit"].push(power_good);
    obj["sensorLimit"].push(input1);
    obj["sensorLimit"].push(input2);
    
    $.ajax({
      url: BASE_URL+"/api/v1/editDevice",
      type: 'POST',
      data: JSON.stringify(obj),
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
        $.fancybox.close();
        
        swal("Success!", "Device configuration has been updated!", "success");
        location.reload();  
      },
      error: function (error) {
        sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
      }
    })
  });

  //==================DELETE DEVICES=====================================//

  $(document).on('click','.delete-device', function(e){
    var device_id =($(this).data('id'));
    var obj = {};
    obj['id'] = $(this).data('id');
    
    swal({
      title: "Are You Sure You Want To Delete This Device?",
      text: "All Data And History Will Be Lost, This Cannot Be Undone",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
      closeOnConfirm: false
    },
    function(){
      $.ajax({
        url: BASE_URL+"/api/v1/deleteDevice",
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        crossDomain:true,
        async:true,
        headers: {
          'SESSIONKEY': window.localStorage.getItem('user-token'),
        },
        contentType: 'application/json; charset=utf-8',
        success: function(result) {
          console.log(result);
        $('table.list-devices tr#d-'+device_id+'').remove()
          swal("Success!", "Device deleted successfully!", "success");
        },
        error: function (error) {
          sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
        }
      })
    });
  });

  //==================END DELETE DEVICES=================================//


  $(window).load(function(){
    $('.loader').fadeOut("slow");
  })


  //======================== Personal Informatiion submit form ==============//

  $(document).on('submit', '#personal-info', function(e){
    e.preventDefault();
    var obj = {};
    obj["id"] = $("#hidden_id").val();
    obj["firstName"] = $("#first_name").val();
    obj["lastName"] = $("#last_name").val();
    obj["email"] = $("#email").val();
    obj["address"] = $("#address").val();
    obj["city"] = $("#city").val();
    obj["zipcode"] = $("#postal_code").val();
    obj["country"] = $("#select_country option:selected").text();
    obj["state"] = $("#state option:selected").text();
    
    $.ajax({
      url: BASE_URL+"/api/v1/editUser",
      type: 'POST',
      data: JSON.stringify(obj),
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
        console.log("done...");
        $.fancybox.close();
        swal("Success!", "Personal Information has been updated!", "success");
        location.reload();
      },
      error: function (error) {
        sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
      }
    })
    
    return false;
  });
  //======================== Persnal Information End form ===================//
  
  //======================== Reset Calibration Button =======================//
    
   $(document).on('click', '.reset-cal', function(e){
      e.preventDefault();
      var obj = {};
      obj['id'] = $("#cal_id").val();

    $.ajax({
      url: BASE_URL+"/api/v1/resetCalibration",
      type: 'POST',
      data: JSON.stringify(obj),
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
        console.log("Success");
      obj["dateRange"] = "today";
      obj["limit"]= '50000';
      obj["deviceId"] = $('#graph_data_range').val();     
      graph_data(obj);

        },error: function (error) {
          sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
        }
      });
  });
//======================Reset Calibration Button End=====================//
  
//======================Calibration Down Button=====================//
  
    $(document).on('click', '.cal-down', function(e){
      e.preventDefault();
      var obj = {};
      obj['id'] = $("#cal_id").val();
	  obj['value'] = $("#water_level_change").val();

    $.ajax({
      url: BASE_URL+"/api/v1/calDown",
      type: 'POST',
      data: JSON.stringify(obj),
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {        
      console.log("Success") 

      obj["dateRange"] = $('.graph-button').text();
      obj["limit"]= '50000';
      obj["deviceId"] = $('#graph_data_range').val();     
      graph_data(obj);

       
        },error: function (error) {
          sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
        }
      });
  });
//======================Calibration Button End=====================//

//======================Calibration Up Button=====================//
  
    $(document).on('click', '.cal-up', function(e){
      e.preventDefault();
      var obj = {};

      obj['id'] = $("#cal_id").val();
	  obj['value'] = $("#water_level_change").val();
      $.ajax({
      url: BASE_URL+"/api/v1/calUp",
      type: 'POST',
      data: JSON.stringify(obj),
      dataType: 'json',
      crossDomain:true,
      async:true,
      headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
      },
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
      console.log("Success"); 
     
      obj["dateRange"] = $('.graph-button').text();
      obj["limit"]= '50000';
      obj["deviceId"] = $('#graph_data_range').val();     
      graph_data(obj);

        },error: function (error) {
          sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
        }
      });
  });
  
//======================Calibration Up Button End=====================//
  
  var cell_providers = [];
  var forms = $('form'); //cache all Forms
  forms.hide(); //hide initial

  // get country list
  country_records();
   device_records();
});

$("#contact_email").show();
if(!isEmpty(window.localStorage.getItem('cell_providers'))){
  cell_providers = JSON.parse(window.localStorage.getItem('cell_providers'));
  set_cell_providers();
}else{
  // GET CELL PROVIDERS
  $.ajax({
    url: BASE_URL+"/api/v1/getCellProviderList",
    type: 'GET',
    dataType: 'json',
    crossDomain:true,
    async:true,
    headers: {
      'SESSIONKEY': window.localStorage.getItem('user-token')
    },
    contentType: 'application/json; charset=utf-8',
    success: function (result) {
      if(result.success){
        window.localStorage.setItem('cell_providers', JSON.stringify(result.cellProviderList));
        cell_providers = JSON.parse(window.localStorage.getItem('cell_providers'));
        set_cell_providers();
      }
      if(result.success == false && result.errorId === '108'){
      	$('#customer_logout_link').click()
      }
    },
    error: function (error) {
      sweetAlert("Oops...", "Something went wrong...Please try again later!", "error");
    }
  });
}


// Below the test is done for new contact

// ==============================TEST EMAIL CONATCT TYPE===========================================

$(document).on('click', '#test_email_contact', function(e){
  e.preventDefault();
  var obj = {};
  obj["email"] = $('.accordion').find('.active').find('#email_address').val()
  test_email(obj);
});

//For new contact
$(document).on('click', '#test_email', function(e){
  e.preventDefault();
  var obj = {};
  obj["email"] = $('#new-contact').find('form#contact_email').find('#email_address_id').val();
  test_email(obj);   
});

// ==============================END EMAIL TEST CONATCT TYPE===========================================


// ==============================TEST SMS CONATCT TYPE===========================================
$(document).on('click', '#test_sms_contact', function(e){
  e.preventDefault();
  var obj = {}
  obj["mobile"] = $('.accordion').find('.active').find('#mobile').val();
  test_mobile(obj);
      
});

//For new contact
$(document).on('click', '#test_sms', function(e){
  e.preventDefault();
  var obj = {}
  obj['mobile'] = $('.new-contact').find('#text_msg').find('#mobile').val();  
  test_mobile(obj);  
});


function test_mobile(obj){

  $.ajax({
    url: BASE_URL+"/api/v1/testSms",
    type: 'POST',
    data: JSON.stringify(obj),
    dataType: 'json',
    crossDomain: true,
    async: true,
    headers: {
        'SESSIONKEY': window.localStorage.getItem('user-token')
        },
    contentType:'application/json; charset=utf-8',
    success:function (result){
      if(result.success){
        sweetAlert("Contact type is successfully verified");
      }else{
        sweetAlert("Not Verified! Please try again");
      }  
    } 
  });

}

// ==============================END SMS TEST CONATCT TYPE===========================================


// Below the test is done for update contact

// ==============================TEST EMAIL CONATCT TYPE===========================================

$(document).on('click', '#test', function(e){
  e.preventDefault();
  var obj = {};
  
  if($('.accordion').find('.active').find('#email_address_id').val() !=''){
    alert("email");
    obj["email"] = $('.accordion').find('.active').find('#email_address_id').val()
  }else if($('.accordion').find('.active').find('#change_mobile_text').val() !=''){
    alert("phone");
    obj["mobile"] = $('.accordion').find('.active').find('#change_mobile_text').val()
//     obj["service_provider"] = $('.accordion').find('.active').find("select#service_provider").val();
  }  
  test_email(obj);  
});

function test_email(obj){
  $.ajax({
    url: BASE_URL+"/api/v1/testMail",
    type: 'POST',
    data: JSON.stringify(obj),
    dataType: 'json',
    crossDomain:true,
    async:true,
    headers: {
      'SESSIONKEY': window.localStorage.getItem('user-token')
    },
    contentType: 'application/json; charset=utf-8',
    success: function (result) {
    if(result.success){
      sweetAlert("Contact type is successfully verified");    
    }else{
      sweetAlert("Not verified!, Please try again");
    }   
    }
  });
}

// ==============================END TEST EMAIL AND VOICE CONATCT TYPE===========================================

