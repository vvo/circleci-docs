---
---

// compiles an object of parameters relevant for analytics event tracking.
// takes an optional DOM element and uses additional information if present.
window.analyticsTrackProps = function (el) {
  var trackOpts = {
    path:      document.location.pathname,
    url:       document.location.href,
    referrer:  document.referrer,
    title:     document.title
  };

  var userLogin = window.userData && window.userData['login'];
  if (userLogin) {
    trackOpts['user'] = userLogin;
  }

  if (el) {
    var text = $.trim($(el).text());
    if (text) {
      trackOpts['cta_text'] = text;
    }
  }

  return trackOpts;
};

// amplitude.getSessionId wrapper with reference guard
var getSessionId = function () {
  if (!window.amplitude || !amplitude.getSessionId) {
    return -1;
  }
  return amplitude.getSessionId();
};

var setCookieMinutes = function (name, value, path, expiration) {
  // expiration is set in minutes
  var date = new Date();
  date.setMinutes(date.getMinutes() + expiration);
  date = date.toUTCString();

  document.cookie = name + "=" + value + "; path=" + path + "; expires=" + date;
};

// analytics.track wrapper
var trackEvent = function (name, properties, options, callback) {
  if (!window.analytics) {
    return;
  }

  analytics.track(name, properties, options, function () {
    setCookieMinutes("amplitude-session-id", getSessionId(), '/', 30);
    if (callback) {
      callback();
    }
  });
};

// analytics tracking for CTA button clicks
window.addEventListener('load', function () {
  var buttons = Array.from(document.querySelectorAll('[data-analytics-action]'));

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var action = this.getAttribute('data-analytics-action');
      if (!action) { return; }
      trackEvent(action, analyticsTrackProps(this));
    });
  });
});


$( document ).ready(function() {

	// Allow navigation to slide open and close on small devices
	$("#nav-button").click(function(){
		event.preventDefault();

		$("#nav-button").toggleClass("open");
		$("nav.sidebar").toggleClass("open");
	});

	// Give article headings direct links to anchors
	$("article h2, article h3, article h4, article h5, article h6").filter("[id]").each(function () {
		$(this).append('<a href="#' + $(this).attr("id") + '"><i class="fa fa-link"></i></a>');
	});
	$("article h2, article h3, article h4, article h5, article h6").filter("[id]").hover(function () {
		$(this).find("i").toggle();
	});

	$.getJSON("/api/v1/me").done(function (userData) {
		analytics.identify(userData['analytics_id']);
	});

    // Initialize navgoco sidebar menus with default options
    $("#mysidebar").navgoco({
      caretHtml: '',
      accordion: false,
      openClass: 'active', // open
      save: true,
      cookie: {
        name: 'navgoco',
        expires: false,
        path: '/'
      },
      slide: {
        duration: 400,
        easing: 'swing'
      }
    });
    // By default, open everything. 
    // This is a brute force approach to fix things being collapsed by default
    // TODO: make this more elegant
    $("#mysidebar").navgoco('toggle', true);  

    $("#collapseAll").click(function(e) {
      e.preventDefault();
      $("#mysidebar").navgoco('toggle', false);
    });

    $("#expandAll").click(function(e) {
      e.preventDefault();
      $("#mysidebar").navgoco('toggle', true);
    });
    // End navgoco sidebar menu options
});
