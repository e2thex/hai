hai = function(db) {
  var that = {}
  that.db = db;
  that.resize = function() {
    $(this.html).find('object > trail > trail_value, subject > trail > trail_value').each(function() {
        $(this).css('height', 'auto')
      $(this).css('height', $(this).parent().height()-25);
    });
  };

  that.html = function() {
    hai = this;
    var hai_html = $(
      "<hai>" +
      "<hia-header>" +
      "  <label for ='search'>Search </label><input id='search'></input>" +
      "</hia-header>" +
      "<hai-data>" +
      "  <trail><subject class = 'hai-trail-collection'>" +
      "    <trail id = 'add' class = 'add'><trail_value><input></input></trail_value></trail>" +
      "  </subject></trail>" +
      "</hai-data>" +
      "</hai>"
    );

    hai_html.find(".add input").bind("save", function(e) {
      var fs = $(this).closest("trail");
      var is_subject = !($(fs).is("predicate > trail") ||$(fs).is("object > trail"))
      var newfs = is_subject ?
        hai.datum($(this).val()).trail :
        fs.closest(".hai-trail-collection").closest("trail").data("datum").add($(this).val()).trail;
      $(this).val('');
      fs.before(newfs);
    });
    // move down the 
    hai_html.find(".add input").bind("moveToEndOfPrevious", function(e) {
      var fs = $(this).closest("trail");
      var branch = $(fs);
      while(!branch.prev().length) {
        if(branch.closest(".hai-trail-collection").parent().length) {
          branch = branch.closest(".hai-trail-collection").parent();
        }
        else {
          break;
        }
      }
      branch.prev().find(".hai-trail-collection").last().append(fs);
      fs.closest("hai").data("hai").resize();
      fs.find("input").focus();
    });
    // move down the trail
    hai_html.find(".add input").bind("moveToParent", function(e) {
      var fs = $(this).closest("trail");
      if($(fs).closest(".hai-trail-collection").is("object")) {
        //can not move down trail from object need to remove pedicate first
        return;
      }
      $(fs).parent().closest("trail").closest(".hai-trail-collection:not(object)").append(fs);
      fs.closest("hai").data("hai").resize();
      fs.find("input").focus();
    });
    //move up the trail
    hai_html.find(".add input").bind("moveToLastChild", function(e) {
      var fs = $(this).closest("trail");
      $(fs).prev().children(".hai-trail-collection").children().last().children(".hai-trail-collection").append(fs);
      fs.closest("hai").data("hai").resize();
      fs.find("input").focus();
    });

    hai_html.find(".add input").bind("moveToEndOfNext", function(e) {
      var fs = $(this).closest("trail");
      var branch = $(fs);
      while(!branch.next().length) {
        if(branch.closest(".hai-trail-collection").parent().length) {
          branch = branch.closest(".hai-trail-collection").parent();
        }
        else {
          break;
        }
      }
      if(branch.next().length) {
        branch = branch.next();
        while(branch.find(".hai-trail-collection").first().length) {
          branch = branch.find(".hai-trail-collection").first()
        }
      }
      else {
        branch = branch.children(".hai-trail-collection");
      }
      branch.append(fs);
      fs.closest("hai").data("hai").resize();
      fs.find("input").focus();
    });
    hai_html.find(".add input").bind("editParent", function(e) {
      var fs = $(this).closest("trail");
      var replace = fs.parent().closest("trail");
      $(this).val(replace.children("trail_value").contents().first().text() + ' ');
      replace.replaceWith(fs);
    });
    hai_html.find(".add input").keyup(function(e) {
      if($(this).val().match(/  $/)) {
        $(this).val($(this).val().replace(/  $/,''));
        $(this).trigger("save");
        $(this).trigger("moveToEndOfPrevious");
      }
    });
    hai_html.find(".add input").keydown(function(e) {
      if($(this).val().match(/^$/)) {
        if(e.which == 13) { //enter
          $(this).trigger("moveToParent");
        }
        if(e.which == 37) { //left arrow
          $(this).trigger("moveToParent");
        }
        if(e.which == 39) { //right arrow
          $(this).trigger("moveToLastChild");
        }
        if(e.which == 38) { //up arrow
          $(this).trigger("moveToEndOfPrevious");
        }
        if(e.which == 40) { //down arrow
          $(this).trigger("moveToEndOfNext");
        }
        if(e.which == 8) { //down arrow
          $(this).trigger("editParent");
        }
      }
      console.log(e.which);
    });
    hai_html.find('#add input').autocomplete({
      source:function(request, response) {
        datum = $("#add").closest('.hai-trail-collection').closest('trail').data('datum');
        response(datum.autocomplete(request.term));
      }
    });
    hai_html.find("#search").keydown(function(e) {
      if (e.which == 13) { //return
        var add = $(this).closest("hai").find("#add");
        var subjects = $(this).closest('hai').find("trail>subject");
        add.detach();
        subjects.html("");
        try {
        hai.db.query($(this).val()).forEach(function(datum) {
          subjects.append(hai.datumBranch(datum).trail);
        });
        }
        catch (e) {
          subjects.append("<error>"+e.message+"</error>");
        }
        subjects.append(add);
      }
    });
    $(document).on("click", ".expand", function(e) {
      $(this).closest("trail").data("datum").expand();
    });
    $(document).on("click", ".add-new", function(e) {
      var add = $(this).closest("hai").find("#add");
      $(this).closest("trail").children(".hai-trail-collection").append(add);
      hai.resize();
      add.focus();
    });
    $(document).on("keyup", ".expand, .add-new", function(e) {
      var add = $(this).closest("hai").find("#add");
      add.focus();
    });
    $(document).on("keypress", ".expand, .add-new", function(e) {
      $(this).trigger('click');

    })


    hai_html.data("hai",this);
    this.html = hai_html;
    return hai_html;
  }

  that.datum = function(object) {
    return this.datumBranch(this.db.datum(object));
  }
  that.datumBranch = function(DBDatum) {
    var that = {};
    that.main = this;
    that.DBdatum = DBDatum
    that.trail = $("<trail><trail_value>"+DBDatum.value+"<div><a tabindex = 0 class='expand'>expand</a><a tabindex = 0 class='add-new'>add</a></div></trail_value><predicate class ='hai-trail-collection'></predicate></trail>");
    that.trail.data('datum', that);
    that.autocomplete = function(val) {
      return this.main.db.load({}).map(function(trip) { return trip.predicate});
    }
    that.expand = function() {
      var detach = false;
      if($(this.trail).find("#add").length) {
        detach = $("#add")
        detach.detach();
      }
      $(this.trail).children(".hai-trail-collection").html("");
      var datum = this
      datum.DBdatum.attrs().forEach(function(attr) {
        datum.DBdatum.attr(attr).forEach(function(odatum) {
          var predicate = datum.generate(odatum);
          datum.trail.children(".hai-trail-collection").append(predicate.trail);
          predicate.trail.children(".hai-trail-collection").append(datum.main.datumBranch(odatum).trail);
        });
      });
      if(detach) {
        this.trail.children(".hai-trail-collection").append(detach);
      }
      this.main.resize();
    }
    that.add = function(predicate) {
      return this.generate(this.DBdatum.attr(predicate).new());
    }
    that.generate = function(datum) {
      var that = {};
      that.main = this.main;
      that.DBdatum = datum;
      that.trail = $("<trail><trail_value>"+datum.trip.predicate+"</trail_value><object class = 'hai-trail-collection'></object></trail>");
      that.trail.data('datum', that);
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
};

