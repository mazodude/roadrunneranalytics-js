/*
	RoadRunner Analytics v0.2

	todo:
		* test on all browsers and/or devices
		* run this through a js obfuscator

	notes:
		* cookies should start with __rr
		* need to make it crossbrowser
		* need to have no libraries (ie jquery)
		* http://www.w3.org/TR/access-control/#user-agent-security

	Cookies:
		__rrrv = return visitor
		__rrfs = first seen
		__rrsc = session cookie

	Return Vars: (ones sent back to server)
		__rrsi = UID
		__rrsd = Dimensions
			__rrwh = width of HTML document
			__rrhh = height of HTML document
			__rrwv = width of browser viewport
			__rrhv = height of browser viewport
			__rrws = width of screen
			__rrhs = height of screen
		__rrst = Title
		__rrss = Secure
		__rrsl = Lang
		__rrsu = URL
		__rrso = Loadtime
		__rrsa = Account
		__rrsm = TimeStamp

*/
window.onload = function(){
	var NewUid;
	var uid;
	var userAgent;
	var screenWidth;
	var screenHeight;
	var htmlWidth;
	var htmlHeight;
	var viewWidth;
	var viewHeight;
	var loadTime;
	var pageTitle;
	var httpsOn;
	var userLang;
	var currURL;
	var currDate = new Date();
	var submitURL = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.mattandceri.info/dish.php';

	//Call the script
	getInfo();

	/*
		This will execute all the functions and submit the
		info back to the server
	*/
	function getInfo(){
		/*
			__rrsi = UID
			__rrsd = Dimensions
			__rrst = Title
			__rrss = Secure
			__rrsl = Lang
			__rrsu = URL
			__rrso = Loadtime
			__rrsa = Account
			__rrsm = TimeStamp
			__rrsh = Hits this session
		*/
		//run all functions here
		// var dismess = 'This page runs the Analytics js. Check your cookies.';
		// document.getElementById("output").innerHTML = dismess;
		setupCookies();
		var out = {
			'__rrsi':uid,
			'__rrsd':getDimensions(),
			'__rrst':getPageTitle(),
			'__rrss':checkHttps(),
			'__rrsl':getLang(),
			'__rrsu':getURL(),
			'__rrso':getLoadTime(),
			'__rrsa':_gaq,
			'__rrsm':currDate.getTime(),
			'__rrsh':getSessionHits()
		};
		sendData(out);
	}

	/*
		Get url of the current page
	*/
	function getURL(){
		currURL = window.location;
		return currURL;
	}

	/*
		Get the dimensions of the html,users screen and browser viewport
	*/
	function getDimensions(){
		/*
			__rrwh = width of HTML document
			__rrhh = height of HTML document
			__rrwv = width of browser viewport
			__rrhv = height of browser viewport
			__rrws = width of screen
			__rrhs = height of screen
		*/
		htmlWidth = window.innerWidth; // returns width of HTML document
		htmlHeight = window.innerHeight; // returns height of HTML document
		var viewport = getViewport();
		viewWidth = viewport[0];   // returns width of browser viewport
		viewHeight = viewport[1];   // returns height of browser viewport
		screenHeight = screen.height;   // returns width of screen
		screenWidth = screen.width;   // returns height of screen
		return {'__rrwh':htmlWidth,'__rrhh':htmlHeight,'__rrwv':viewWidth,
			'__rrhv':viewHeight,'__rrws':screenWidth,'__rrhs':screenHeight};
	}

	/*
		Helper function for getDimensions()
		This will get the viewport of the page
	*/
	function getViewport() {

		var viewPortWidth;
		var viewPortHeight;

		// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
		if (typeof window.innerWidth != 'undefined') {
			viewPortWidth = window.innerWidth;
			viewPortHeight = window.innerHeight;
			return [viewPortWidth, viewPortHeight];
		}

		// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
		else if (typeof document.documentElement != 'undefined'
		&& typeof document.documentElement.clientWidth !=
		'undefined' && document.documentElement.clientWidth != 0) {
			viewPortWidth = document.documentElement.clientWidth;
			viewPortHeight = document.documentElement.clientHeight;
			return [viewPortWidth, viewPortHeight];
		}

		// older versions of IE
		else {
			viewPortWidth = document.getElementsByTagName('body')[0].clientWidth;
			viewPortHeight = document.getElementsByTagName('body')[0].clientHeight;
		}
		return [viewPortWidth, viewPortHeight];
	}

	/*
		Get the load time of the page
	*/
	function getLoadTime(){
		// Need to check if the browser supports it
		if(!window.performance){
			//Not supported
			loadTime = '';
		}else{
			loadTime = window.performance.timing.domContentLoadedEventEnd-window.performance.timing.navigationStart;
		}
		return loadTime;
	}

	/*
		Get the current page title
	*/
	function getPageTitle(){
		pageTitle = document.title;
		return pageTitle;
	}

	/*
		Get the browsers lang
	*/
	function getLang(){
		userLang = window.navigator.userLanguage || window.navigator.language;
		return userLang;
	}

	/*
		Function for checking the cookies are right
		making them if they are missing
		and not making any if cookies are disabled
	*/
	function setupCookies(){
		/*
		Cookies:
		__rrrv 
			2 years from set/update
			Used to distinguish users and sessions
		__rrfs
			30 mins from set/update
			Used to determine new sessions/visits
		__rrsc 
			End of browser session

		Need to check here if there is already a uid from a previous session
		NewUid will be used if no previous session was found

		__rrfs should also include a hit counter.
			separate with a dot.
		*/
		// var cookiesEnabled = (navigator.cookieEnabled)? true : false;
		var cookiesEnabled = true;
		if(cookiesEnabled){
			var hits = 0;
			var twoyears = new Date();
			twoyears.setFullYear(twoyears.getFullYear() + 2);
			var thirtymins = new Date();
			thirtymins.setMinutes(thirtymins.getMinutes() + 30);

			if(getCookie('__rrrv')==""){
				//No two year cookie
				if(getCookie('__rrfs')==""){
					// No cookies to work off
					hits = 1;
					NewUid = 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					    return v.toString(16);
					});;
					uid = NewUid;
					uid2 = NewUid+"."+hits;
				} else {
					// We have the 30min cookie
					uid2 = getCookie('__rrfs');
					var res = uid2.split(".");
					uid = res[0];
					hits = parseInt(res[1])+1;
					uid2 = uid+"."+hits;
				}
			} else {
				//Two year cookie is there
				uid = getCookie('__rrrv');
				if(getCookie('__rrfs')==""){
					//30 min cookie is gone though
					hits = 1;
					uid2 = uid+"."+hits;
				} else {
					//30 min cookie is ok
					//increment the hits
					uid2 = getCookie('__rrfs');
					var res = uid2.split(".");
					hits = parseInt(res[1])+1;
					uid2 = uid+"."+hits;
				}
			}
			makeCookie('__rrrv',uid,twoyears,0);
			makeCookie('__rrfs',uid2,thirtymins,0);
			makeCookie('__rrsc',uid,'',0);
		} else {
			uid = NewUid;
		}
	}

	/*
		User the session cookies to see how many pages
		have been viewed this session
	*/
	function getSessionHits(){
		var cookie = getCookie('__rrfs');
		if(cookie!=""){
			var res = cookie.split(".");
			hits = parseInt(res[1]);
			return hits;
		} else {
			return 0;
		}
	}

	/*
		Returns all the browser cookies
	*/
	function getAllCookies(){
		var cookies = document.cookie;
		return cookies;
	}

	/*
		Get only a cookie we are interested in
	*/
	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		
		for(var i=0; i<ca.length; i++) {
	  		//can't use trim as IE6-8 don't support it
	  		var c = ca[i].replace(/^\s+|\s+$/g, '');
	  		
	  		if (c.indexOf(name)==0) 
	  			return c.substring(name.length,c.length);
	  	}
		
		return "";
	}

	/*
		Easy way of making a browser cookie
	*/
	function makeCookie(cname, cvalue, timestring, secure){
		var expires,secured;
		if (timestring!='') { expires = ";expires="+timestring; } else { expires = ''; }
		if (secure) { secured = ';secure'; } else { secured = ''; }
		document.cookie=cname + "=" + cvalue + expires + ";path=/"+secured;
	}

	/*
		Check if the connection is over https or http
	*/
	function checkHttps(){
		httpsOn = ('https:' == document.location.protocol ? 1 : 0);
		return httpsOn;
	}

	/*
		This will send a GET request back to our server with all the data
	*/
	function sendData(out){
		var statPost=new ajaxRequest();
		statPost.onreadystatechange=function(){
			if (statPost.readyState==4){
				if (statPost.status==200 || window.location.href.indexOf("http")==-1){
					//For production we don't want this
					// document.getElementById("output").innerHTML=statPost.responseText;
				}
				else{
					// An error has occured making the request
				}
			}
		};
		var parameters = makeParams(out);
		statPost.open("GET", submitURL+"?"+parameters, true);
		statPost.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		statPost.send();
	}

	/*
		Setting up a crossbrowser ajax request
	*/
	function ajaxRequest(){
		var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"]; //activeX versions to check for in IE
		if (window.ActiveXObject){ //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
			for (var i=0; i<activexmodes.length; i++){
				try{
					return new ActiveXObject(activexmodes[i]);
				}
				catch(e){
					//suppress error
				}
			}
		}
		else if (window.XMLHttpRequest) // if Mozilla, Safari etc
			return new XMLHttpRequest();
		else
			return false;
	}

	/*
		turns an array into paramaters for the GET request
		eg array('id':1,'test':'test') to:
		id=1&test=test
	*/
	function makeParams(out){
		var serialiseObject = function(obj) {
		    var pairs = [];
		    for (var prop in obj) {
		        if (typeof prop == "object" && !obj.hasOwnProperty(prop)) {
		            continue;
		        }
		        if (Object.prototype.toString.call(obj[prop]) == '[object Object]') {
		            pairs.push(serialiseObject(obj[prop]));
		            continue;
		        }
		        pairs.push(prop + '=' + obj[prop]);
		    }
		    return pairs.join('&');
		};
		// return encodeURIComponent(serialiseObject(out));
		return serialiseObject(out);
	}
};