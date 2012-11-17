;(function( $ ) {
	$( document ).on( "ready", function() {
		$( "input:checkbox" ).styleCheckbox();

		$( "a#demo-checkbox-enable" ).on( "click", function( e ) {
			e.preventDefault();

			$( "input:checkbox:checked" ).styleCheckbox();
		});

		$( "a#demo-checkbox-disable" ).on( "click", function( e ) {
			e.preventDefault();

			$( "input:checkbox:checked" ).styleCheckbox( "destroy" );
		});
	});
}( jQuery ));
