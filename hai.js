hai = function(db) {
  var that = {}
  that.db = db;
  that.datum = function(object) {
    return this.datumBranch(this.db.datum(object));
  }
  that.datumBranch = function(DBDatum) {
    var that = {};
    that.main = this;
    that.DBdatum = DBDatum
    that.fieldset = $("<fieldset><legend>"+DBDatum.value+"<a class='expand'>expand</a></legend><div class ='predicate'></div></fieldset>");
    that.fieldset.data('datum', that);
    that.autocomplete = function(val) {
      return this.main.db.load({}).map(function(trip) { return trip.predicate});
    }
    that.expand = function() {
      var detach = false;
      if($(this.fieldset).find("#add").length) {
        detach = $("#add")
        detach.detach();
      }
      $(this.fieldset).children("div").html("");
      var datum = this
      datum.DBdatum.attrs().forEach(function(attr) {
        datum.DBdatum.attr(attr).forEach(function(odatum) {
          var predicate = datum.generate(odatum);
          datum.fieldset.children("div").append(predicate.fieldset);
          predicate.fieldset.children("div").append(datum.main.datumBranch(odatum).fieldset);
        });
      });
      if(detach) {
        this.fieldset.children("div").append(detach);
      }
    }
    that.add = function(predicate) {
      return this.generate(this.DBdatum.attr(predicate).new());
    }
    that.generate = function(datum) {
      var that = {};
      that.main = this.main;
      that.DBdatum = datum;
      that.fieldset = $("<fieldset><legend>"+datum.trip.predicate+"</legend><div class ='object'></div></fieldset>");
      that.fieldset.data('datum', that);
      that.add = function(object) { 
        this.DBdatum.value = object;
        return this.main.datumBranch(this.DBdatum);
      }
      that.autocomplete = function(val) {
        return this.main.db.load({predicate:this.DBdatum.trip.predicate}).map(function(trip) { return trip.object});
      };
      return that;
    }
    return that;
  }
  return that;
}(aspot.localDB());



$(function() {
  var resize = function() {
    $('div:not(".predicate") > fieldset > legend').each(function() {
        $(this).css('height', 'auto')
      $(this).css('height', $(this).parent().height()-25);
    });
  };
  var entry = function(value, isPredicate) {
    var fs = $("<fieldset><legend>"+value+"</legend><div></div></fieldset>");
    if(typeof isPredicate !== 'undefined' && isPredicate)  {
      fs.children("div").addClass("object");
    }
    else {
      fs.addClass("temp");
      fs.children("div").addClass("predicate");
    }
    return fs;
  }

  $('#add input').keydown(function(e) {
    var fs = $(this).closest("fieldset");
    var is_subject = !($(fs).is(".predicate > fieldset") ||$(fs).is(".object > fieldset"))

    var moveright = function() {
      var place = next(fs);
      place.append($(fs));
      if(place.closest("fieldset").hasClass("predicate")) {
        $(fs).removeClass("predicate");
      }
      else {
        $(fs).addClass("predicate");
      }
      resize();
    }
    //right
    if(e.which == 39) {
      if($(this).val() != '') {
        var newfs = is_subject ?
          hai.datum($(this).val()).fieldset :
          fs.closest("div").closest("fieldset").data("datum").add($(this).val()).fieldset;
          

        //var newfs = entry($(this).val(), $(this).is("div.predicate > fieldset > legend > textarea"));
        $(this).val('');
        fs.before(newfs);
        $(fs).prev().children("div").append(fs);
      }
      else {
        if($(fs).prev().children("div").hasClass("object")) {
          $(fs).prev().children("div").children("fieldset").last().children("div").append(fs);
        }
        else {
          $(fs).prev().children("div").append(fs);
        }
      }
      
    }
    else if (e.which == 38) {
      if($(this).val() == '') {
        var branch = $(fs);
        while(!branch.prev().length) {
          if(branch.closest("div").parent().length) {
            branch = branch.closest("div").parent();
          }
          else {
            break;
          }
        }
        branch.prev().find("div").last().append(fs);
      }
    }
    else if (e.which == 40) {
      if($(this).val() == '') {
        var branch = $(fs);
        while(!branch.next().length) {
          if(branch.closest("div").parent().length) {
            branch = branch.closest("div").parent();
          }
          else {
            break;
          }
        }
        if(branch.next().length) {
          branch = branch.next();
          while(branch.find("div").first().length) {
            branch = branch.find("div").first()
          }
        }
        else {
          branch = branch.children("div");
        }
        branch.append(fs);
      }
    }
    else if (e.which == 37) {
      if($(this).val() == '') {
        if($(fs).closest("div:not(.predicate)").closest("div.predicate").length) {
          $(fs).closest("div:not(.predicate)").closest("div.predicate").append(fs);
        }
        else {
        $(fs).closest("div:not(.predicate)").closest("div").append(fs);
        }
      }
      else {
        if(!$(this).is("div.predicate > fieldset > legend > input")) {
          var newfs = entry($(this).val(), false);
          fs.before(newfs);
        }
        $(this).val('');
        $(fs).closest("div.predicate").append(fs);
      }
      
      
    }
    else if (e.which == 8 && $(this).val() == '') {
      var replace = fs.parent().closest("fieldset");
      $(this).val(replace.children("legend").html() + ' ');
      replace.replaceWith(fs);
    }
    $(this).focus();
    resize();
  }).keyup(function (e) {
    $('.object >fieldset.temp > legend').each(function(e) {
      var trip = {}
      trip.subject = $(this).closest("div").closest("fieldset").closest("div").prev().html();
      trip.predicate = $(this).closest("div").prev().html();
      trip.object = $(this).html();
      $(this).parent().removeClass('temp');

    });
  });
  resize();
  $("#save").click(function(e) {
    $("<textarea>" +JSON.stringify(hai.db.store)+"</textarea>").dialog();
  });
  $("#load").click(function(e) {
    var a = $("<div><textarea></textarea><input type='button' value ='load'/></div>");
    a.find("input").click(function (e) {
      hai.db.store = JSON.parse($(this).prev().val());
      a.dialog("close");
    });
    a.dialog();

  });
  $('#add input')
  .autocomplete({
    source:function(request, response) {
      console.log(request.term);
      datum = $("#add").closest('div').closest('fieldset').data('datum');
      response(datum.autocomplete(request.term));
    }
  });
  $("#search").keydown(function(e) {
    if (e.which == 13) {
      var add = $("#add");
      var subjects = $("#data >fieldset>div.subject");
      add.detach();
      subjects.html("");
      hai.db.query($(this).val()).forEach(function(datum) {
        subjects.append(hai.datumBranch(datum).fieldset);
      });
      subjects.append(add);
    }
  });
  $(document).on("click", ".expand", function(e) {
    $(this).closest("fieldset").data("datum").expand();
  });
}
);

