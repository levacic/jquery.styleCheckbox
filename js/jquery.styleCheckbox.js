/**
 * A simple jQuery plugin for styling checkboxes.
 * @author Miloš Levačić <milos@levacic.net>
 * @version 1.0.1
 */

( function( $ ) {
	/**
	 * The default classes that will be applied to the replacement element(s).
	 * Can be overriden at call time, to enable applying different styles to
	 * different elements in the page.
	 * @type {Object}
	 */
	var _settings = {
		replacementClass: "styled-checkbox",
		focusClass: "styled-checkbox-focus",
		activeClass: "styled-checkbox-active",
		checkedClass: "styled-checkbox-checked"
	};

	/**
	 * The number of elements that this plugin is bound to. Ideally, we
	 * shouldn't need this, but we're counting just in case, so when the last
	 * "destroy" call gets made, we will unbind all our namespaced events from
	 * the DOM.
	 * @type {Number}
	 */
	var _boundElements = 0;

	/**
	 * The left mouse button code (used for checking `event.which`).
	 * @type {Number}
	 */
	var MOUSEBUTTON_LEFT = 1;

	/**
	 * The spacebar key code (used for checking `event.keyCode`).
	 * @type {Number}
	 */
	var KEY_SPACE = 32;

	/**
	 * This function returns a replacement element for the input passed to it,
	 * complete with all the necessary events bound.
	 *
	 * Side-effects are events bound to the document, as well as to the label
	 * associated with the input (if one exists). These events are unbound when
	 * the plugin is destroyed for the particular element. The events are
	 * namespaced with `.styledCheckbox`, so as to be able to safely unbind the
	 * events without interfering with other code.
	 * @param  {Object} settings
	 * @param  {Object} original A jQuery object for the original input
	 * @return {Object}          A jQuery object for the replacement element
	 */
	var getReplacement = function( settings, original ) {
		/**
		 * The replacement element. We're using a `<div>`, but anything else
		 * should be able to work, with the proper styling.
		 * @type {Object}
		 */
		var replacement = $( "<div/>" );

		/**
		 * The current state of the checkbox (`true` for checked, `false` for
		 * unchecked).
		 * @type {Boolean}
		 */
		var state = original.is( "[checked]" );

		/**
		 * Whether the mouse button is currently pressed down on the replacement
		 * element. See the documentation for `removeActive()` for an
		 * explanation about why this is needed.
		 * @type {Boolean}
		 */
		var mouseIsDown = false;

		/**
		 * The associated `<label>` for the original checkbox, if one exists.
		 * @type {Object}
		 */
		var label;

		/**
		 * This is a jQuery object containing the replacement element, and, if
		 * one exists, the label associated with the original checkbox. We are
		 * using it so as to be able to more easily refer to all elements that
		 * need to have events bound to them.
		 * @type {Object}
		 */
		var clickHandlerElements;

		/**
		 * This function is needed in the case that a user presses the mouse
		 * button on our replacement element, but then drags the cursor away
		 * from it, before releasing the button. In this situation, the "click"
		 * event won't fire, so we need to remove our "active" state class. We
		 * will bind this function to the document.
		 *
		 * This can lead to bugs in case some other page element has a function
		 * bound to the `mouseup` event, which stops the event's propagation to
		 * the document, but there is really no other way to solve this problem
		 * within this plugin, so in that situation, the problematic function
		 * should be rewritten, if possible.
		 * @return {Void}
		 */
		var removeActive = function() {
			if ( mouseIsDown ) {
				replacement.removeClass( settings.activeClass );

				mouseIsDown = false;
			}
		};

		replacement.addClass( settings.replacementClass );

		/**
		 * Store a reference to the `removeActive()` function, so we can unbind
		 * it later, if needed.
		 */
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
		 * element, and the associated label, if we can find one - we're gonna
		 * try and find it according to our input's "id" and the label's "for"
		 * attributes, because this is the only valid and correct way of
		 * actually associating a label with its input.
		 *
		 * Note (2013-06-02): The above comment is *wrong*, as there is another
		 * completely valid way to associate a label with a form element -
		 * nesting the element itself within the label. This is a problem, which
		 * will be addressed in a later version of this plugin, as the current
		 * strategy of binding events to the label and the checkbox will likely
		 * cause problems with double events firing. This approach needs some
		 * work, and perhaps it can be fixed by analyzing the `event.target` in
		 * each of the functions.
		 */
		if ( original.is( "[id]" ) && original.attr( "id" ) ) {
			label = $( "label[for=\"" + original.attr( "id" ) + "\"]" );
			replacement.data( "label", label );
		} else {
			label = $();
		}

		clickHandlerElements = replacement;
		clickHandlerElements = clickHandlerElements.add( label );

		clickHandlerElements
			.on( "mousedown.styledCheckbox", function( event ) {
				/**
				 * The plugin will only react to the left mouse button.
				 */
				if ( event.which === MOUSEBUTTON_LEFT ) {
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
			.on( "keydown.styledCheckbox", function( event ) {
				if ( event.keyCode === KEY_SPACE ) {
					replacement.addClass( settings.activeClass );
				}
			})
			.on( "keyup.styledCheckbox", function( event ) {
				if ( event.keyCode === KEY_SPACE ) {
					replacement
						.removeClass( settings.activeClass )
						.click();
				}
			});

		$( document ).on( "mouseup.styledCheckbox", removeActive );

		++_boundElements;

		return replacement;
	};

	/**
	 * Available plugin methods.
	 * @type {Object}
	 */
	var methods = {
		/**
		 * Initializes the plugin on the element in which's context it was
		 * called.
		 * @param  {Object} options An object of optional overrides to the
		 *                          default classes.
		 * @return {Object}         The original element, to enable method
		 *                          chaining.
		 */
		init: function( options ) {
			/**
			 * The default settings, merged with any options passed through the
			 * initialization call.
			 * @type {Object}
			 */
			var settings = $.extend( {}, _settings, options );

			return this.each( function() {
				/**
				 * We need `$( this )` in multiple places, so we're caching it
				 * here, to prevent jQuery from resolving the object multiple
				 * times.
				 * @type {Object}
				 */
				var _this = $( this );

				/**
				 * Whether the element upon which the plugin was called is
				 * actually an `<input type="checkbox">`.
				 * @type {Boolean}
				 */
				var isAnInputCheckbox = _this.is( "input:checkbox" );

				/**
				 * Whether the element upon which the plugin was called has
				 * already been replaced with our replacement element.
				 * @type {Boolean}
				 */
				var hasReplacement = _this.data( "replacement" );

				/**
				 * The replacement element which will be injected into the DOM
				 * instea of the original element.
				 */
				var replacement;

				if ( ! isAnInputCheckbox || hasReplacement ) {
					return;
				}

				replacement = getReplacement( settings, _this );

				/**
				 * Hide the original input element, and insert our replacement
				 * in its place.
				 */
				_this
					.css( "display", "none" )
					.data( "replacement", replacement );

				replacement.insertAfter( _this );
			});
		},

		/**
		 * Deactivates the plugin on the element upon which this method was
		 * called.
		 * @return {Object} The original element, to enable method chaining.
		 */
		destroy: function() {
			return this.each( function() {
				/**
				 * We need `$( this )` in multiple places, so we're caching it
				 * here, to prevent jQuery from resolving the object multiple
				 * times.
				 * @type {Object}
				 */
				var _this = $( this );

				/**
				 * The replacement element, if one exists.
				 * @type {Object|undefined}
				 */
				var replacement = _this.data( "replacement" );

				/**
				 * Whether the element upon which the plugin was called is
				 * actually an `<input type="checkbox">`.
				 * @type {Boolean}
				 */
				var isAnInputCheckbox = _this.is( "input:checkbox" );

				/**
				 * The `removeActive()` handler function bound to the document.
				 * See that function's documentation for an explanation about
				 * why we need it.
				 */
				var removeActive;

				/**
				 * The `<label>` associated with this element, if one exists.
				 */
				var label;

				/**
				 * If this element is not an input:checkbox, or no replacement
				 * exists for this element, skip it.
				 */
				if ( ! isAnInputCheckbox || ! replacement ) {
					return;
				}

				/**
				 * Restore the original element, including its tabindex (if one
				 * existed prior to creating the replacement).
				 */
				_this
					.css( "display", "" )
					.removeData( "replacement" );

				if ( replacement.is( "[tabindex]" ) ) {
					_this.attr( "tabindex", replacement.attr( "tabindex" ) );
				}

				/**
				 * We need a reference to our handler function, so we can unbind
				 * it from the document.
				 */
				removeActive = replacement.data( "removeActiveHandler" );

				$( document ).off( "mouseup.styledCheckbox", removeActive );

				/**
				 * Unbind all the plugin's events from the associated label, if
				 * one exists.
				 */
				label = replacement.data( "label" );

				if ( label ) {
					$( label ).off( ".styledCheckbox" );
				}

				/**
				 * Final cleanup; remove the replacement from the DOM, and if
				 * there are no more replacement elements active, unbind all the
				 * plugin's events from the document (if we've done everything
				 * right so far, this shouldn't be needed at all, but we're
				 * placing it here just in case).
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
	 * @see http://docs.jquery.com/Plugins/Authoring#Plugin_Methods
	 * @param  [method]
	 * @return {Object} The original jQuery object the plugin was called on
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
