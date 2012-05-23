<?php 
  $db = $_GET['db'];
if($_GET['data']) {
  header('Cache-Control: no-cache, must-revalidate');
  header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
  header('Content-type: application/json');
  if(file_exists("data/$db.json")) {
    $data = file_get_contents("data/$db.json");

    print $data;
    exit;
  }
  else {
    print '{}';
    exit;
  }
}
if($data = $_POST['data']) {
  file_put_contents("data/$db.json", json_encode($data));
  exit;
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>HIA DB <?php print $_GET['db']?></title>
  <meta name="description" content="HIA site" />
  <script src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'></script>
  <script src = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js'></script>
  <script src = 'aspot/lib/aspot.js'></script>
  <script src = 'hai.js'></script>
  <link rel="stylesheet" href = 'hai.css'></link>
  <link rel="stylesheet" href = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/themes/base/jquery-ui.css'></link>
  <link rel="stylesheet" href = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/themes/ui-lightness/jquery-ui.css'></link>
</head>
<body>
  <header>
    <input type='button' value = 'Save' id ='save' />
  </header>
<section></section>
</body>
</html>
<script>
dbname = '<?php print $_GET['db']?>';
$(function() {
  var db = {};
  $.getJSON("index.php?db="+dbname+"&data=true", function(data) {
    $("section:not(.processed)").each(function() {
      db = aspot.localDB(data)
      console.log(data);
      $(this).html(hai(db).html());
      $(this).addClass("processed");
    });
  });
  $("#save").click(function(e) {
    console.log(db.store);
    var out = Object.keys(db.store).map(function(key) { var i = db.store[key]; return {subject:i.subject, predicate:i.predicate, object:i.object}});
    $.post("index.php?db="+dbname, {data:out})
  });
}
);
</script>
