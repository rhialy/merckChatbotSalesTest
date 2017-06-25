const express = require('express')
const jquery = require('jquery')
const app = express()

app.get('/', function (req, res) {
  function addAuth(xhr) {
      var id = 'h30263';
      var pass = 'Merck2017!';
      var tok = id + ':' + pass;
      var hash = btoa(tok);
      xhr.setRequestHeader("Authorization", 'Basic ' + hash);
  }
  var test = $.ajax({
      type: 'GET',
      url: 'https://test-merckserono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Individual_API(9000000000020127)/IndividualAddress_API',
      dataType: 'json',
      beforeSend: addAuth
  });
  res.send("Ergebniss ist: " + test);
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
