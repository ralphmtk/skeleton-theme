/**
 * Contact Form JavaScript
 * Handles form display, validation, and submission
 */

(function() {
  'use strict';

  // Get config from data attributes
  var contactSection = document.querySelector('.contact');
  if (!contactSection) return;

  var apiUrl = contactSection.dataset.apiUrl || '';
  var countriesUrl = contactSection.dataset.countriesUrl || '';

  // Add class to body when contact section is present
  document.body.classList.add('has-contact-page');

  // Form overlay functionality
  var listItems = document.querySelectorAll('.contact__list-item');
  var formOverlay = document.querySelector('.contact__form-overlay');
  var contactRight = document.querySelector('.contact__right');
  var formShells = document.querySelectorAll('.contact__form-shell');
  var currentFormType = null;

  function showForm(type, clickedItem) {
    // Remove active state from all list items
    listItems.forEach(function(item) {
      item.classList.remove('is-active');
    });

    // Add active state to clicked item
    if (clickedItem) {
      clickedItem.classList.add('is-active');
    }

    // Hide all form shells
    formShells.forEach(function(shell) {
      shell.classList.remove('is-active');
    });

    // Show the appropriate form
    if (type === 'distributor') {
      var distributorForm = document.querySelector('.contact__form-shell--distributor');
      if (distributorForm) {
        distributorForm.classList.add('is-active');
        // Reset to step 1
        var steps = distributorForm.querySelectorAll('.contact__form-step');
        steps.forEach(function(step) {
          step.classList.remove('is-active');
        });
        var step1 = distributorForm.querySelector('.contact__form-step--1');
        if (step1) {
          step1.classList.add('is-active');
        }
        // Reset form
        var form = distributorForm.querySelector('form');
        if (form) {
          form.reset();
          clearValidationErrors(form);
        }
      }
    } else if (type === 'retailer') {
      var retailerForm = document.querySelector('.contact__form-shell--retailer');
      if (retailerForm) {
        retailerForm.classList.add('is-active');
        // Reset to step 1
        var steps = retailerForm.querySelectorAll('.contact__form-step');
        steps.forEach(function(step) {
          step.classList.remove('is-active');
        });
        var step1 = retailerForm.querySelector('.contact__form-step--1');
        if (step1) {
          step1.classList.add('is-active');
        }
        // Reset form
        var form = retailerForm.querySelector('form');
        if (form) {
          form.reset();
          clearValidationErrors(form);
        }
      }
    } else if (type === 'consumer') {
      var consumerForm = document.querySelector('.contact__form-shell--consumer');
      if (consumerForm) {
        consumerForm.classList.add('is-active');
        // Reset to step 1
        var steps = consumerForm.querySelectorAll('.contact__form-step');
        steps.forEach(function(step) {
          step.classList.remove('is-active');
        });
        var step1 = consumerForm.querySelector('.contact__form-step--1');
        if (step1) {
          step1.classList.add('is-active');
        }
        // Reset form
        var form = consumerForm.querySelector('form');
        if (form) {
          form.reset();
          clearValidationErrors(form);
          // Hide other textarea
          var otherRow = consumerForm.querySelector('.contact__form-row--other-textarea');
          if (otherRow) {
            otherRow.style.display = 'none';
          }
          var otherTextarea = consumerForm.querySelector('#consumerOtherDetails');
          if (otherTextarea) {
            otherTextarea.removeAttribute('required');
            otherTextarea.classList.remove('is-invalid');
          }
        }
      }
    } else if (type === 'other') {
      var otherForm = document.querySelector('.contact__form-shell--other');
      if (otherForm) {
        otherForm.classList.add('is-active');
        // Reset to step 1
        var steps = otherForm.querySelectorAll('.contact__form-step');
        steps.forEach(function(step) {
          step.classList.remove('is-active');
        });
        var step1 = otherForm.querySelector('.contact__form-step--1');
        if (step1) {
          step1.classList.add('is-active');
        }
        // Reset form
        var form = otherForm.querySelector('form');
        if (form) {
          form.reset();
          clearValidationErrors(form);
        }
      }
    }

    // Show overlay
    formOverlay.classList.add('is-active');
    contactRight.classList.add('has-overlay');
    currentFormType = type;

    // Scroll to form on mobile
    if (window.innerWidth <= 1023 && formOverlay) {
      setTimeout(function() {
        // Get header height
        var header = document.querySelector('header') || document.querySelector('.header');
        var headerHeight = header ? header.offsetHeight : 0;
        var offset = headerHeight + 20; // Header height + padding
        
        // Get form position
        var formRect = formOverlay.getBoundingClientRect();
        var scrollPosition = window.pageYOffset + formRect.top - offset;
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

  function hideForm() {
    formOverlay.classList.remove('is-active');
    contactRight.classList.remove('has-overlay');
    currentFormType = null;

    // Remove active state from all list items
    listItems.forEach(function(item) {
      item.classList.remove('is-active');
    });

    // Reset all forms
    formShells.forEach(function(shell) {
      shell.classList.remove('is-active');
      var form = shell.querySelector('form');
      if (form) {
        form.reset();
        clearValidationErrors(form);
      }
    });
  }

  function clearValidationErrors(form) {
    var inputs = form.querySelectorAll('.contact__form-input, .contact__form-select, .contact__form-textarea');
    inputs.forEach(function(input) {
      input.classList.remove('is-invalid');
      input.removeAttribute('data-touched');
    });
    var wrappers = form.querySelectorAll('.contact__form-select-wrapper');
    wrappers.forEach(function(wrapper) {
      wrapper.classList.remove('is-invalid');
    });
  }

  function toggleFormSubmittingState(form, isSubmitting) {
    var controls = form.querySelectorAll('input, select, textarea, button:not(.contact__form-close)');
    controls.forEach(function(control) {
      if (isSubmitting) {
        control.setAttribute('data-temp-disabled', 'true');
        control.disabled = true;
      } else if (control.hasAttribute('data-temp-disabled')) {
        control.removeAttribute('data-temp-disabled');
        control.disabled = false;
      }
    });
  }

  function validateField(field, forceShow) {
    var isValid = field.checkValidity();
    var wrapper = field.closest('.contact__form-select-wrapper');
    var isTouched = field.hasAttribute('data-touched') || forceShow;
    
    // For textarea, also check if it's empty when required
    if (field.tagName === 'TEXTAREA' && field.hasAttribute('required')) {
      if (!field.value.trim()) {
        isValid = false;
      }
    }
    
    if (!isValid && isTouched) {
      field.classList.add('is-invalid');
      if (wrapper) {
        wrapper.classList.add('is-invalid');
      }
    } else {
      field.classList.remove('is-invalid');
      if (wrapper) {
        wrapper.classList.remove('is-invalid');
      }
    }
    return isValid;
  }

  function validateStep(step) {
    var isValid = true;
    var requiredFields = step.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(function(field) {
      // Force show errors when validating the whole step
      if (!validateField(field, true)) {
        isValid = false;
      }
    });

    return isValid;
  }

  if (listItems.length && formOverlay && contactRight) {
    // Handle list item clicks
    listItems.forEach(function(item) {
      item.addEventListener('click', function() {
        var type = item.getAttribute('data-type');
        showForm(type, item);
      });
    });

    // Handle close buttons
    var closeButtons = document.querySelectorAll('.contact__form-close');
    closeButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        hideForm();
      });
    });

    // Handle Next buttons
    var nextButtons = document.querySelectorAll('.contact__form-next');
    nextButtons.forEach(function(nextButton) {
      nextButton.addEventListener('click', function() {
        var activeShell = document.querySelector('.contact__form-shell.is-active');
        if (!activeShell) return;

        var currentStep = activeShell.querySelector('.contact__form-step.is-active');
        if (!currentStep) return;

        // Validate current step
        if (!validateStep(currentStep)) {
          // Scroll to first invalid field
          var firstInvalid = currentStep.querySelector('.is-invalid');
          if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus();
          }
          return;
        }

        // Move to next step
        currentStep.classList.remove('is-active');
        var nextStep = activeShell.querySelector('.contact__form-step--2');
        if (nextStep) {
          nextStep.classList.add('is-active');
          nextStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Handle form submission
    var distributorForm = document.querySelector('#contactFormDistributor');
    if (distributorForm) {
      distributorForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate step 2 (though it has no required fields)
        var step2 = this.querySelector('.contact__form-step--2');
        if (step2) {
          var isValid = true;
          // No required fields in step 2, so just proceed

          if (isValid) {
            // Collect form data
            var data = collectFormData(this, 'distributor');
            submitForm(data, this);
          }
        }
      });
    }

    // Handle retailer form submission
    var retailerForm = document.querySelector('#contactFormRetailer');
    if (retailerForm) {
      retailerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate step 2 (though it has no required fields)
        var step2 = this.querySelector('.contact__form-step--2');
        if (step2) {
          var isValid = true;
          // No required fields in step 2, so just proceed

          if (isValid) {
            // Collect form data
            var data = collectFormData(this, 'retailer');
            submitForm(data, this);
          }
        }
      });
    }

    // Handle consumer form submission
    var consumerForm = document.querySelector('#contactFormConsumer');
    if (consumerForm) {
      // Handle "Other" option toggle
      var consumerHelpSelect = consumerForm.querySelector('#consumerHelp');
      var otherTextareaRow = consumerForm.querySelector('.contact__form-row--other-textarea');
      var otherTextarea = consumerForm.querySelector('#consumerOtherDetails');
      
      if (consumerHelpSelect && otherTextareaRow && otherTextarea) {
        consumerHelpSelect.addEventListener('change', function() {
          if (this.value === 'Other') {
            otherTextareaRow.style.display = 'grid';
            otherTextarea.setAttribute('required', 'required');
          } else {
            otherTextareaRow.style.display = 'none';
            otherTextarea.removeAttribute('required');
            otherTextarea.value = '';
            otherTextarea.classList.remove('is-invalid');
          }
        });
      }

      consumerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate the form
        var step1 = this.querySelector('.contact__form-step--1');
        if (step1) {
          // Check if "Other" is selected and textarea is required
          if (consumerHelpSelect && consumerHelpSelect.value === 'Other') {
            if (!otherTextarea.value.trim()) {
              otherTextarea.classList.add('is-invalid');
              otherTextarea.setAttribute('data-touched', 'true');
              otherTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
              otherTextarea.focus();
              return;
            } else {
              otherTextarea.classList.remove('is-invalid');
            }
          }

          if (!validateStep(step1)) {
            // Scroll to first invalid field
            var firstInvalid = step1.querySelector('.is-invalid');
            if (firstInvalid) {
              firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
              firstInvalid.focus();
            }
            return;
          }

          // Collect form data
          var data = collectFormData(this, 'consumer');
          submitForm(data, this);
        }
      });
    }

    // Handle other form submission
    var otherForm = document.querySelector('#contactFormOther');
    if (otherForm) {
      otherForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate the form
        var step1 = this.querySelector('.contact__form-step--1');
        if (step1) {
          if (!validateStep(step1)) {
            // Scroll to first invalid field
            var firstInvalid = step1.querySelector('.is-invalid');
            if (firstInvalid) {
              firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
              firstInvalid.focus();
            }
            return;
          }

          // Collect form data
          var data = collectFormData(this, 'other');
          submitForm(data, this);
        }
      });
    }

    function collectFormData(form, userType) {
      var inputs = form.querySelectorAll('input, select, textarea');
      var data = { type: userType };

      inputs.forEach(function(input) {
        // Skip disabled inputs or inputs without names
        if (input.disabled || !input.name) return;

        if (input.type === 'checkbox') {
          // Handle checkboxes - create array
          if (!data[input.name]) {
            data[input.name] = [];
          }
          if (input.checked) {
            data[input.name].push(input.value);
          }
        } else if (input.type === 'radio') {
          // Handle radio buttons - only if checked
          if (input.checked) {
            data[input.name] = input.value;
          }
        } else {
          // Handle regular inputs
          data[input.name] = input.value;
        }
      });

      // Convert checkbox arrays to semicolon-separated strings (as expected by backend)
      Object.keys(data).forEach(function(key) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          data[key] = data[key].join('; ');
        } else if (Array.isArray(data[key]) && data[key].length === 0) {
          // Remove empty arrays
          delete data[key];
        }
      });

      return data;
    }

    function submitForm(data, form) {
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      toggleFormSubmittingState(form, true);

      if (!apiUrl) {
        console.error('API URL is not configured');
        alert('Configuration error: API URL missing');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        toggleFormSubmittingState(form, false);
        return;
      }

      // Add brand parameter to match backend expectations
      var payload = {
        brand: 'zengaz',
        ...data
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      .then(function(response) { return response.json(); })
      .then(function(result) {
        if (result.success) {
          var responseHtml = '';
          
          // Check for consumer response with specific content
          if (result.consumerResponse) {
            responseHtml = 
              '<div class="contact__success-message">' +
                '<div class="contact__success-icon">' +
                  '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle cx="32" cy="32" r="32" fill="#4CAF50"/>' +
                    '<path d="M20 32L28 40L44 24" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
                  '</svg>' +
                '</div>' +
                '<h3 class="contact__form-step-title" style="margin-bottom: 1.5rem;">Here is the info you requested:</h3>' +
                '<div class="contact__response-content" style="font-size: 1.1rem; line-height: 1.6;">' +
                  result.consumerResponse +
                '</div>' +
                '<button type="button" class="contact__form-close" onclick="location.reload()" style="margin-top: 2rem;">Close</button>' +
              '</div>';
          } else {
            // Generic thank you message for all other user types
            responseHtml = 
              '<div class="contact__success-message">' +
                '<div class="contact__success-icon">' +
                  '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle cx="32" cy="32" r="32" fill="#4CAF50"/>' +
                    '<path d="M20 32L28 40L44 24" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
                  '</svg>' +
                '</div>' +
                '<h3 class="contact__form-step-title" style="margin-bottom: 1rem;">Thank You!</h3>' +
                '<p class="contact__success-text" style="font-size: 1.1rem; line-height: 1.6; color: #555; margin-bottom: 0.5rem;">' +
                  'Your message has been submitted successfully.' +
                '</p>' +
                '<p class="contact__success-subtext" style="font-size: 1rem; color: #777;">' +
                  'A member of our team will be in touch with you shortly.' +
                '</p>' +
                '<button type="button" class="contact__form-close" onclick="location.reload()" style="margin-top: 2rem;">Close</button>' +
              '</div>';
          }
          
          form.innerHTML = responseHtml;
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          alert('Something went wrong. Please try again.');
          console.error('Submission error:', result);
        }
      })
      .catch(function(error) {
        console.error('Error:', error);
        alert('Network error. Please try again later.');
      })
      .finally(function() {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        toggleFormSubmittingState(form, false);
      });
    }

    // Real-time validation
    var allForms = document.querySelectorAll('.contact__form');
    allForms.forEach(function(form) {
      var inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(function(input) {
        // Mark as touched on blur
        input.addEventListener('blur', function() {
          this.setAttribute('data-touched', 'true');
          validateField(this);
        });

        // Re-validate on input if already invalid
        input.addEventListener('input', function() {
          if (this.hasAttribute('data-touched') && this.classList.contains('is-invalid')) {
            validateField(this);
          }
        });

        // Mark as touched on change (for selects)
        input.addEventListener('change', function() {
          this.setAttribute('data-touched', 'true');
          validateField(this);
        });
      });
    });

    // Close overlay when clicking outside the form
    formOverlay.addEventListener('click', function(e) {
      if (e.target === formOverlay) {
        hideForm();
      }
    });
  }

  // Load and populate country dropdowns
  (function() {
    if (!countriesUrl) return;
    
    // Load countries from external file
    var script = document.createElement('script');
    script.src = countriesUrl;
    script.onload = function() {
      if (typeof countries !== 'undefined' && Array.isArray(countries)) {
        // Find all country select elements
        var countrySelects = document.querySelectorAll('select[name="country"]');
        countrySelects.forEach(function(select) {
          // Clear existing options except the first "Select a country" option
          var firstOption = select.querySelector('option[value=""]');
          select.innerHTML = '';
          if (firstOption) {
            select.appendChild(firstOption);
          } else {
            var defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a country';
            select.appendChild(defaultOption);
          }
          
          // Populate with countries from the array
          countries.forEach(function(country) {
            var option = document.createElement('option');
            option.value = country; // Use exact country name as value (matches HubSpot)
            option.textContent = country;
            select.appendChild(option);
          });
        });
      }
    };
    document.head.appendChild(script);
  })();
})();

