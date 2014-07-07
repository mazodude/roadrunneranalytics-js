Road Runner Analytics-js
======================
This is the javascript only for the analytics project

Example:

	<script type="text/javascript">
	  var _gaq = _gaq || [];
	  _gaq.push(['RR-0001-01']);

	  (function() {
	    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	    ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'example.com/stats.php';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();
	</script>
