jQuery(document).ready(function($) {

	// Ajax add to cart
	$(document).on('click', '.wft_add_to_cart_button', function() {

		// AJAX add to cart request
		var $thisbutton = $(this);

		if ($thisbutton.is('.product_type_simple, .product_type_downloadable, .product_type_virtual')) {

			if (!$thisbutton.attr('data-product_id')) {
				return true;
			}

			$('#ajax_loader').show();

			$thisbutton.removeClass('added');
			$thisbutton.addClass('loading');

			var data = {
				action: 		'wft_woocommerce_add_to_cart',
				product_id: 	$thisbutton.attr('data-product_id'),
				quantity:       $thisbutton.attr('data-quantity'),
				context:		'frontend'
			};

			// Trigger event
			$('body').trigger( 'adding_to_cart', [ $thisbutton, data ] );

			// Ajax action
			$.post( woocommerce_params.ajax_url, data, function( response ) {

				if ( ! response ) {
					$('#ajax_loader').hide();
					return;
				}

				var this_page = window.location.toString();

				this_page = this_page.replace( 'add-to-cart', 'added-to-cart' );

				if ( response.error && response.product_url ) {
					window.location = response.product_url;
					return;
				}

				// Redirect to cart option
				if ( woocommerce_params.cart_redirect_after_add == 'yes' ) {

					window.location = woocommerce_params.cart_url;
					return;

				} else {

					$thisbutton.removeClass('loading');

					fragments = response.fragments;
					cart_hash = response.cart_hash;

					// Block fragments class
					if ( fragments ) {
						$.each(fragments, function(key, value) {
							$(key).addClass('updating');
						});
					}

					// Block widgets and fragments
					$('.shop_table.cart, .updating, .cart_totals').fadeTo('400', '0.6').block({
						message: null,
						overlayCSS: {
							background: 'transparent url(' + woocommerce_params.ajax_loader_url + ') no-repeat center',
							backgroundSize: '16px 16px',
							opacity: 0.6
						}
					} );

					// Changes button classes
					$thisbutton.addClass('added');

					// View cart text
					if ( $thisbutton.parent().find('.added_to_cart').size() == 0 ) {

						$('#ajax_loader').hide();
						$('#ajax_message .inside').empty().html(successfullyAdded);
						$('#ajax_message').show().delay(3000).fadeOut('slow');
					}

					// Replace fragments
					if ( fragments ) {
						$.each(fragments, function(key, value) {
							$(key).replaceWith(value);
						});
					}

					if ( response.cart_count ) {
						$('.widget_shopping_cart .badge.badge-inverse').empty().text(response.cart_count);
					}

					// Unblock
					$('.widget_shopping_cart, .updating').stop(true).css('opacity', '1').unblock();

					// Cart page elements
					$('.shop_table.cart').load( this_page + ' .shop_table.cart:eq(0) > *', function() {

						$("div.quantity:not(.buttons_added), td.quantity:not(.buttons_added)").addClass('buttons_added').append('<input type="button" value="+" id="add1" class="plus" />').prepend('<input type="button" value="-" id="minus1" class="minus" />');

						$('.shop_table.cart').stop(true).css('opacity', '1').unblock();

						$('body').trigger('cart_page_refreshed');
					});

					$('.cart_totals').load( this_page + ' .cart_totals:eq(0) > *', function() {
						$('.cart_totals').stop(true).css('opacity', '1').unblock();
					});

					// Trigger event so themes can refresh other areas
					$('body').trigger( 'added_to_cart', [ fragments, cart_hash ] );
				}
				$('#ajax_loader').hide();
			});

			return false;

		} else {
			return true;
		}

	});

});