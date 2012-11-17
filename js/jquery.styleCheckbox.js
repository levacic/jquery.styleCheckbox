/**
 * A simple jQuery plugin for styling checkboxes.
 *
 * @author Miloš Levačić <milos@levacic.net>
 * @version 1.0
 */

;( function( $ ) {
	var _settings = {
			replacementClass: "styled-checkbox",
			focusClass: "styled-checkbox-focus",
			activeClass: "styled-checkbox-active",
			checkedClass: "styled-checkbox-checked"
		},
		_boundElements = 0,
		MOUSEBUTTON_LEFT = 1,

		/**
		 * This function returns a replacement element for the input passed to
		 * it, complete with all the necessary events bound.
		 *
		 * Side-effects are events bound to the document, as well as the label
		 * associated with the input (if one exists). These events are unbound
		 * when the plugin is destroyed for the particular element. The events
		 * are namespaced with .styledCheckbox, so as not to interfere with
		 * other plugins.
		 *
		 * @param  {object} settings
		 * @param  {object} original A jQuery object for the original input
		 * @return {object}          A jQuery object for the replacement element
		 */
		getReplacement = function( settings, original ) {
			var replacement = $( "<div/>" ),
				state = original.is( "[checked]" ),
				mouseIsDown = false,
				label,
				clickHandlerElements,

				/**
				 * This function is needed in the case that a user presses the
				 * mouse button on our replacement element, but then drags the
				 * cursor away from it, before releasing the button. In this
				 * situation, the "click" event won't fire, so we need to remove
				 * our * "active" state class. We will bind this function to the
				 * document.
				 */
				removeActive = function() {
					if ( mouseIsDown ) {
						replacement.removeClass( settings.activeClass );

						mouseIsDown = false;
					}
				};

			replacement.addClass( settings.replacementClass );
			replacement.data( "removeActiveHandler", removeActive );

			/**
			 * Set the initial checked state for our replacement.
			 */
			if ( state ) {
				replacement.addClass( settings.checkedClass );
			}

			/**
			 * If the original element has a tabindex, transfer it to our
			 * replacement.
			 */
			if ( original.is( "[tabindex]" ) ) {
				replacement.attr( "tabindex", original.attr( "tabindex" ) );
				original.removeAttr( "tabindex" );
			}

			/**
			 * We will try to bind our handler functions to both the replacement
			 * element, and the associated label, if we can find one - we're
			 * gonna try and find it according to our input's "id" and the
			 * label's "for" attributes, because this is the only valid and
			 * correct way of actually associating a label with its input.
			 */
			if ( original.is( "[id]" ) && original.attr( "id" ) ) {
				label = $( 'label[for="' + original.attr( "id" ) + '"]' );
				replacement.data( "label", label );
			} else {
				label = $();
			}

			clickHandlerElements = replacement;
			clickHandlerElements = clickHandlerElements.add( label );

			clickHandlerElements
				.on( "mousedown.styledCheckbox", function( e ) {
					/**
					 * The plugin will only react to the left mouse button.
					 */
					if ( e.which === MOUSEBUTTON_LEFT ) {
						replacement.addClass( settings.activeClass );

						mouseIsDown = true;
					}
				})
				.on( "click.styledCheckbox", function() {
					replacement.removeClass( settings.activeClass );

					if ( state ) {
						state = false;
						original.removeAttr( "checked" );
						replacement.removeClass( settings.checkedClass );
					} else {
						state = true;
						original.attr( "checked", "checked" );
						replacement.addClass( settings.checkedClass );
					}
				})
				.on( "focusin.styledCheckbox", function() {
					replacement.addClass( settings.focusClass );
				})
				.on( "focusout.styledCheckbox", function() {
					replacement.removeClass( settings.focusClass );
				})
				.on( "keydown.styledCheckbox", function( e ) {
					if ( e.keyCode === 32 ) {
						replacement.addClass( settings.activeClass );
					}
				})
				.on( "keyup.styledCheckbox", function( e ) {
					if ( e.keyCode === 32 ) {
						replacement
							.removeClass( settings.activeClass )
							.click();
					}
				});

			$( document ).on( "mouseup.styledCheckbox", removeActive );

			++_boundElements;

			return replacement;
		},

		methods = {

			init: function( options ) {
				var settings = $.extend( {}, _settings, options );

				return this.each( function() {
					var _this = $( this ),
						isAnInputCheckbox = _this.is( "input:checkbox" ),
						hasReplacement = _this.data( "replacement" ),
						replacement;

					if ( ! isAnInputCheckbox || hasReplacement ) {
						return;
					}

					replacement = getReplacement( settings, _this );

					/**
					 * Hide the original input element, and insert our
					 * replacement in its place.
					 */
					_this
						.css( "display", "none" )
						.data( "replacement", replacement );

					replacement.insertAfter( _this );
				});
			},

			destroy: function() {
				return this.each( function() {
					var replacement = $( this ).data( "replacement" ),
						isAnInputCheckbox = $( this ).is( "input:checkbox" ),
						removeActive;

					if ( ! $( this ).is( "input:checkbox" ) ) {
						return;
					}

					/**
					 * If this element is not an input:checkbox, or no
					 * replacement exists for this element, skip it.
					 */
					if ( ! isAnInputCheckbox || ! replacement ) {
						return;
					}

					/**
					 * Restore the original element, including its tabindex (if
					 * one existed prior to creating the replacement).
					 */
					$( this )
						.css( "display", "" )
						.removeData( "replacement" );

					if ( replacement.is( "[tabindex]" ) ) {
						$( this ).attr( "tabindex", replacement.attr( "tabindex" ) );
					}

					/**
					 * We need a reference to our handler function, so we can
					 * unbind it from the document.
					 */
					removeActive = replacement.data( "removeActiveHandler" );

					$( document ).off( "mouseup.styledCheckbox", removeActive );

					/**
					 * Unbind all the plugin's events from the associated label,
					 * if one exists.
					 */
					label = replacement.data( "label" );

					if ( label ) {
						$( label ).off( ".styledCheckbox" );
					}

					/**
					 * Final cleanup; remove the replacement from the DOM, and
					 * if there are no more replacement elements active, unbind
					 * all the plugin's events from the document (if we've done
					 * everything right so far, this shouldn't be needed at all,
					 * but we're placing it here just in case).
					 */
					replacement.remove();

					--_boundElements;

					if ( ! _boundElements ) {
						$( document ).off( "mouseup.styledCheckbox" );
					}
				});
			}

		};

	/**
	 * The public interface for the plugin is designed according to jQuery's
	 * Plugin Authoring guidelines.
	 *
	 * @see http://docs.jquery.com/Plugins/Authoring#Plugin_Methods
	 *
	 * @param  [method]
	 * @return {object} The original jQuery object the plugin was called on
	 */
	$.fn.styleCheckbox = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
		} else if ( typeof method === "object" || !method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( "Method " + method + " does not exist on jQuery.styleCheckbox" );
		}
	};

})( jQuery );

