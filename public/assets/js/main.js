/*
	Hielo by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
*/

var settings = {

	banner: {

		// Indicators (= the clickable dots at the bottom).
			indicators: true,

		// Transition speed (in ms)
		// For timing purposes only. It *must* match the transition speed of "#banner > article".
			speed: 1500,

		// Transition delay (in ms)
			delay: 5000,

		// Parallax intensity (between 0 and 1; higher = more intense, lower = less intense; 0 = off)
			parallax: 0.25

	}

};

(function($) {

	skel.breakpoints({
		xlarge:	'(max-width: 1680px)',
		large:	'(max-width: 1280px)',
		medium:	'(max-width: 980px)',
		small:	'(max-width: 736px)',
		xsmall:	'(max-width: 480px)'
	});

	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = (skel.vars.browser == 'ie' || skel.vars.mobile) ? function() { return $(this) } : function(intensity) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.25;

		$this.each(function() {

			var $t = $(this),
				on, off;

			on = function() {

				$t.css('background-position', 'center 100%, center 100%, center 0px');

				$window
					.on('scroll._parallax', function() {

						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

						$t.css('background-position', 'center ' + (pos * (-1 * intensity)) + 'px');

					});

			};

			off = function() {

				$t
					.css('background-position', '');

				$window
					.off('scroll._parallax');

			};

			skel.on('change', function() {

				if (skel.breakpoint('medium').active)
					(off)();
				else
					(on)();

			});

		});

		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function() {
				$window.trigger('scroll');
			});

		return $(this);

	};

	/**
	 * Custom banner slider for Slate.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._slider = function(options) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._slider(options);

			return $this;

		}

		// Vars.
			var	current = 0, pos = 0, lastPos = 0,
				slides = [], indicators = [],
				$indicators,
				$slides = $this.children('article'),
				intervalId,
				isLocked = false,
				i = 0;

		// Turn off indicators if we only have one slide.
			if ($slides.length == 1)
				options.indicators = false;

		// Functions.
			$this._switchTo = function(x, stop) {

				if (isLocked || pos == x)
					return;

				isLocked = true;

				if (stop)
					window.clearInterval(intervalId);

				// Update positions.
					lastPos = pos;
					pos = x;

				// Hide last slide.
					slides[lastPos].removeClass('top');

					if (options.indicators)
						indicators[lastPos].removeClass('visible');

				// Show new slide.
					slides[pos].addClass('visible').addClass('top');

					if (options.indicators)
						indicators[pos].addClass('visible');

				// Finish hiding last slide after a short delay.
					window.setTimeout(function() {

						slides[lastPos].addClass('instant').removeClass('visible');

						window.setTimeout(function() {

							slides[lastPos].removeClass('instant');
							isLocked = false;

						}, 100);

					}, options.speed);

			};

		// Indicators.
			if (options.indicators)
				$indicators = $('<ul class="indicators"></ul>').appendTo($this);

		// Slides.
			$slides
				.each(function() {

					var $slide = $(this),
						$img = $slide.find('img');

					// Slide.
						$slide
							.css('background-image', 'url("' + $img.attr('src') + '")')
							.css('background-position', ($slide.data('position') ? $slide.data('position') : 'center'));

					// Add to slides.
						slides.push($slide);

					// Indicators.
						if (options.indicators) {

							var $indicator_li = $('<li>' + i + '</li>').appendTo($indicators);

							// Indicator.
								$indicator_li
									.data('index', i)
									.on('click', function() {
										$this._switchTo($(this).data('index'), true);
									});

							// Add to indicators.
								indicators.push($indicator_li);

						}

					i++;

				})
				._parallax(options.parallax);

		// Initial slide.
			slides[pos].addClass('visible').addClass('top');

			if (options.indicators)
				indicators[pos].addClass('visible');

		// Bail if we only have a single slide.
			if (slides.length == 1)
				return;

		// Main loop.
			intervalId = window.setInterval(function() {

				current++;

				if (current >= slides.length)
					current = 0;

				$this._switchTo(current);

			}, options.delay);

	};

	$(function() {

		var	$window 	= $(window),
			$body 		= $('body'),
			$header 	= $('#header'),
			$banner 	= $('.banner');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 100);
			});

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

		// Banner.
			$banner._slider(settings.banner);

		// Menu.
			$('#menu')
				.append('<a href="#menu" class="close"></a>')
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'right'
				});

		// Header.
			if (skel.vars.IEVersion < 9)
				$header.removeClass('alt');

			if ($banner.length > 0
			&&	$header.hasClass('alt')) {

				$window.on('resize', function() { $window.trigger('scroll'); });

				$banner.scrollex({
					bottom:		$header.outerHeight(),
					terminate:	function() { $header.removeClass('alt'); },
					enter:		function() { $header.addClass('alt'); },
					leave:		function() { $header.removeClass('alt'); $header.addClass('reveal'); }
				});

			}

	});

	// Contact Form Protection
	$(document).ready(function() {
		var $contactForm = $('#contact-form');
		var $submitButton = $contactForm.find('input[type="submit"]');
		var formSubmissionTime = 0;
		var minSubmissionTime = 3000; // Minimum 3 seconds to fill form
		
		// Track when form becomes visible
		var formVisibleTime = Date.now();
		
		// Add timestamp field for additional protection
		$contactForm.append('<input type="hidden" name="timestamp" value="' + Date.now() + '">');
		
		// Disable submit button initially
		$submitButton.prop('disabled', true);
		
		// Enable submit button after minimum time
		setTimeout(function() {
			$submitButton.prop('disabled', false);
		}, minSubmissionTime);
		
		// Form submission handler
		$contactForm.on('submit', function(e) {
			e.preventDefault(); // Prevent default form submission
			
			var currentTime = Date.now();
			var timeElapsed = currentTime - formVisibleTime;
			
			// Check if enough time has passed
			if (timeElapsed < minSubmissionTime) {
				showMessage('Please take your time filling out the form.', 'error');
				return false;
			}
			
			// Frontend validation
			var email = $('#email').val().trim();
			var message = $('#message').val().trim();
			var name = $('#name').val().trim();
			
			// Clear previous error states
			$('#name, #email, #message').removeClass('error');
			
			// Check if required fields are filled
			if (!name) {
				showMessage('Please enter your name.', 'error');
				$('#name').addClass('error').focus();
				return false;
			}
			
			if (!email) {
				showMessage('Please enter your email address.', 'error');
				$('#email').addClass('error').focus();
				return false;
			}
			
			// Basic email validation
			var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				showMessage('Please enter a valid email address.', 'error');
				$('#email').addClass('error').focus();
				return false;
			}
			
			if (!message) {
				showMessage('Please enter a message.', 'error');
				$('#message').addClass('error').focus();
				return false;
			}
			
			// Check honeypot field
			if ($('#honeypot').val()) {
				showMessage('Invalid submission detected.', 'error');
				return false;
			}
			
			// Disable submit button to prevent double submission
			$submitButton.prop('disabled', true).val('Sending...').addClass('loading');
			
			// Update timestamp
			$('input[name="timestamp"]').val(currentTime);
			
			// Gather form data as JSON
			var formData = {
				name: $('#name').val().trim(),
				email: $('#email').val().trim(),
				message: $('#message').val().trim(),
				honeypot: $('#honeypot').val(),
				timestamp: currentTime
			};
			
			// Send the form data using fetch

			console.log("Form Data: ", formData);

			fetch('https://us-central1-smallblueidea.cloudfunctions.net/sendEmail', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					// Show success message
					showMessage(data.success, 'success');
					// Reset form
					$contactForm[0].reset();
					$submitButton.prop('disabled', true);
					formVisibleTime = Date.now(); // Reset timer
					// Re-enable button after minimum time
					setTimeout(function() {
						$submitButton.prop('disabled', false);
					}, minSubmissionTime);
				} else if (data.error) {
					// Handle error
					console.log('Error:', data.error);
					showMessage(data.error, 'error');
					$submitButton.prop('disabled', false).val('Send Message').removeClass('loading');
				}
			})
			.catch(error => {
				console.error('Error:', error);
				showMessage('There was a problem with your submission. Please try again.', 'error');
				$submitButton.prop('disabled', false).val('Send Message').removeClass('loading');
			});
		});
		
		// Add random delay to form fields to confuse bots
		$contactForm.find('input, textarea').each(function() {
			var $field = $(this);
			var originalName = $field.attr('name');
			
			// Add random attribute to confuse bots
			$field.attr('data-field-id', Math.random().toString(36).substr(2, 9));
			
			// Add event listeners to track human interaction
			$field.on('focus blur input', function() {
				$field.attr('data-interacted', 'true');
			});
			
			// Clear error state when user starts typing
			$field.on('input', function() {
				$(this).removeClass('error');
			});
		});
		
		// Function to show messages
		function showMessage(message, type) {
			// Remove existing message if any
			$('.message-popup').remove();
			
			// Create message popup
			var $popup = $('<div class="message-popup" style="position: fixed; bottom: 20px; right: 20px; padding: 15px 20px; border-radius: 5px; color: white; font-weight: bold; z-index: 10000; max-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">' + message + '</div>');
			
			// Set background color based on message type
			if (type === 'success') {
				$popup.css('background-color', '#4CAF50');
			} else if (type === 'error') {
				$popup.css('background-color', '#f44336');
			}
			
			// Add to page
			$('body').append($popup);
			
			// Animate in
			$popup.hide().fadeIn(300);
			
			// Auto remove after 5 seconds
			setTimeout(function() {
				$popup.fadeOut(300, function() {
					$(this).remove();
				});
			}, 5000);
		}
	});

})(jQuery);