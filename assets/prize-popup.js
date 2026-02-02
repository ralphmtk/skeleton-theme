/**
 * Prize Popup JavaScript
 * Handles popup display, form submission, and user interactions
 */

(function() {
  'use strict';

  const CONFIG = {
    API_BASE_URL: 'https://main-inbound-automation.vercel.app/api/contact',
    BRAND: 'zengaz',
    BRAND_NAME: 'Zengaz',
    STORAGE_KEY: 'zengaz_popup_shown',
  };

  const PopupManager = {
    state: {
      userType: null,
      delaySeconds: 2,
      showOnce: true,
    },

    $(id) {
      return document.getElementById(id);
    },

    capitalize(str) {
      if (!str) return '';
      return str.replace(/\b\w/g, (char) => char.toUpperCase());
    },

    show(element) {
      if (typeof element === 'string') element = this.$(element);
      if (element) element.style.display = 'block';
    },

    hide(element) {
      if (typeof element === 'string') element = this.$(element);
      if (element) element.style.display = 'none';
    },

    showView(viewToShow) {
      this.hide('zengaz-popup-user-type-view');
      this.hide('zengaz-popup-form-view');
      this.hide('zengaz-popup-success-view');
      this.hide('zengaz-popup-business-success-view');
      this.show(viewToShow);
    },

    setFormFieldsDisabled(disabled) {
      const fields = ['popupFirstName', 'popupLastName', 'popupEmail', 'popupPhone', 'popupCountry', 'zengaz-popup-back-btn'];
      fields.forEach((id) => {
        const field = this.$(id);
        if (field) field.disabled = disabled;
      });

      const radioButtons = document.querySelectorAll('input[name="user_type"]');
      radioButtons.forEach((radio) => (radio.disabled = disabled));

      const form = this.$('zengaz-popup-form');
      const submitButton = form?.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = disabled;

      if (form) {
        form.style.opacity = disabled ? '0.6' : '1';
        form.style.pointerEvents = disabled ? 'none' : 'auto';
      }
    },

    init() {
      this.loadSettings();
      this.loadCountries();
      this.setupEventListeners();
      this.setupNameCapitalization();
      this.schedulePopup();
    },

    loadSettings() {
      // Get settings from section
      const popupSection = document.querySelector('[data-section-type="prize-popup"]');
      if (popupSection) {
        const delayAttr = popupSection.getAttribute('data-delay-seconds');
        const showOnceAttr = popupSection.getAttribute('data-show-once');

        if (delayAttr) this.state.delaySeconds = parseInt(delayAttr, 10);
        if (showOnceAttr) this.state.showOnce = showOnceAttr === 'true';
      }
    },

    schedulePopup() {
      // Check if popup should be shown
      if (this.state.showOnce && sessionStorage.getItem(CONFIG.STORAGE_KEY)) {
        console.log('[Popup] Already shown in this session');
        return;
      }

      // Show popup after delay
      const delay = this.state.delaySeconds * 1000;
      setTimeout(() => {
        this.showPopup();
      }, delay);
    },

    async loadCountries() {
      const countrySelect = this.$('popupCountry');
      if (!countrySelect) return;

      const countries = [
        'Afghanistan', 'Albania', 'Antarctica', 'Åland Islands', 'Algeria', 'American Samoa',
        'Andorra', 'Angola', 'Anguilla', 'Antigua and Barbuda', 'Aruba', 'Asia/Pacific Region',
        'Azerbaijan', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Bahamas', 'Bahrain',
        'Bangladesh', 'Barbados', 'Belgium', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
        'Botswana', 'Bouvet Island', 'Brazil', 'Caribbean Netherlands', 'Belize', 'Solomon Islands',
        'Brunei', 'Bulgaria', 'Burundi', 'Belarus', 'Bermuda', 'Cambodia', 'Cayman Islands',
        'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Cuba', 'Curaçao',
        'Sri Lanka', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands',
        'Colombia', 'Comoros', 'Congo', 'Democratic Republic of the Congo', 'Cook Islands',
        'Costa Rica', 'Croatia', 'Cyprus', 'Czech Republic', 'Benin', 'Denmark', 'Dominica',
        'Dominican Republic', 'Ecuador', 'El Salvador', 'Equatorial Guinea', 'Ethiopia',
        'Eritrea', 'Estonia', 'Europe', 'South Georgia and the South Sandwich Islands', 'Fiji',
        'Finland', 'France', 'Falkland Islands', 'Faroe Islands', 'French Polynesia',
        'French Southern and Antarctic Lands', 'Djibouti', 'Gabon', 'Georgia', 'Gambia',
        'Germany', 'Ghana', 'Greenland', 'Guadeloupe', 'Guernsey', 'Kiribati', 'Greece',
        'Grenada', 'Guam', 'Guatemala', 'Guinea', 'Guyana', 'French Guiana', 'Gibraltar',
        'Haiti', 'Heard Island and McDonald Islands', 'Vatican City', 'Honduras', 'Hungary',
        'Hong Kong', 'Isle of Man', 'Iran', 'Jersey', 'Macau', 'Martinique', 'Montserrat',
        'Myanmar (Burma)', 'North Korea', 'Palestine', 'Puerto Rico', 'Réunion',
        'Saint Barthélemy', 'Saint Martin', 'Sint Maarten', 'South Sudan', 'Sudan', 'Syria',
        'Taiwan', 'Turks and Caicos Islands', 'U.S. Virgin Islands', 'Iceland', 'India',
        'Indonesia', 'Iraq', 'Ireland', 'Israel', 'Italy', 'British Indian Ocean Territory',
        "Cote d'Ivoire", 'Jamaica', 'Japan', 'Kazakhstan', 'Jordan', 'Kenya', 'South Korea',
        'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Lesotho', 'Latvia', 'Liberia',
        'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia',
        'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Monaco',
        'Mongolia', 'Moldova', 'Montenegro', 'Morocco', 'Mozambique', 'Oman', 'Namibia', 'Nauru',
        'Nepal', 'Netherlands', 'New Caledonia', 'Vanuatu', 'Netherlands Antilles', 'New Zealand',
        'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'Norway',
        'Northern Mariana Islands', 'United States Minor Outlying Islands', 'Micronesia',
        'Marshall Islands', 'Palau', 'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
        'Philippines', 'Pitcairn Islands', 'Poland', 'Portugal', 'Guinea-Bissau', 'East Timor',
        'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Helena', 'Saint Kitts and Nevis',
        'Saint Lucia', 'Saint Pierre and Miquelon', 'Saint Vincent and the Grenadines',
        'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Svalbard and Jan Mayen',
        'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Vietnam',
        'Western Sahara', 'Slovenia', 'Somalia', 'South Africa', 'Zimbabwe', 'Spain', 'Suriname',
        'Swaziland', 'Sweden', 'Switzerland', 'Tajikistan', 'Thailand', 'Togo', 'Tokelau',
        'Tonga', 'Trinidad and Tobago', 'United Arab Emirates', 'Tunisia', 'Türkiye',
        'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'Macedonia (FYROM)', 'Egypt',
        'United Kingdom', 'Tanzania', 'United States', 'Burkina Faso', 'Uruguay', 'Uzbekistan',
        'Venezuela', 'British Virgin Islands', 'Wallis and Futuna', 'Samoa', 'Yemen', 'Zambia',
        'Canary Islands',
      ];

      // Sort countries alphabetically
      countries.sort();

      countries.forEach((country) => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
      });
    },

    setupNameCapitalization() {
      const firstNameInput = this.$('popupFirstName');
      const lastNameInput = this.$('popupLastName');

      if (firstNameInput) {
        firstNameInput.addEventListener('input', () => {
          const start = firstNameInput.selectionStart;
          const end = firstNameInput.selectionEnd;
          firstNameInput.value = this.capitalize(firstNameInput.value);
          firstNameInput.setSelectionRange(start, end);
        });
      }

      if (lastNameInput) {
        lastNameInput.addEventListener('input', () => {
          const start = lastNameInput.selectionStart;
          const end = lastNameInput.selectionEnd;
          lastNameInput.value = this.capitalize(lastNameInput.value);
          lastNameInput.setSelectionRange(start, end);
        });
      }
    },

    setupEventListeners() {
      const closeButton = this.$('zengaz-popup-close');
      const backButton = this.$('zengaz-popup-back-btn');
      const businessSuccessCloseButton = this.$('zengaz-business-success-close-btn');
      const popupForm = this.$('zengaz-popup-form');
      const popupOverlay = this.$('zengaz-popup-overlay');

      if (closeButton) closeButton.addEventListener('click', () => this.hidePopup());
      if (businessSuccessCloseButton) businessSuccessCloseButton.addEventListener('click', () => this.hidePopup());

      if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
          if (event.target === popupOverlay) this.hidePopup();
        });
      }

      // Handle user type selection
      document.querySelectorAll('input[name="user_type"]').forEach((radio) => {
        radio.addEventListener('change', () => {
          this.state.userType = radio.value;
          this.hide('zengaz-user-type-error');
          this.updateFormText();
          this.showView('zengaz-popup-form-view');
        });
      });

      if (backButton) backButton.addEventListener('click', () => this.showView('zengaz-popup-user-type-view'));

      if (popupForm) {
        popupForm.addEventListener('submit', (event) => this.handleSubmit(event));

        // Real-time validation on blur
        const formInputs = popupForm.querySelectorAll('input, select');
        formInputs.forEach((input) => {
          input.addEventListener('blur', () => {
            const label = input.previousElementSibling;
            if (!input.value || !input.value.trim()) {
              input.classList.add('is-invalid');
              if (label) label.classList.add('is-invalid');
            } else {
              input.classList.remove('is-invalid');
              if (label) label.classList.remove('is-invalid');
            }

            // Email validation
            if (input.id === 'popupEmail' && input.value && input.value.trim()) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(input.value)) {
                input.classList.add('is-invalid');
                if (label) label.classList.add('is-invalid');
              }
            }
          });

          // Remove validation on input if field becomes valid
          input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid') && input.value && input.value.trim()) {
              input.classList.remove('is-invalid');
              const label = input.previousElementSibling;
              if (label) label.classList.remove('is-invalid');
            }
          });
        });
      }
    },

    updateFormText() {
      const consumerFormText = this.$('zengaz-popup-form-text-consumer');
      const businessFormText = this.$('zengaz-popup-form-text-business');

      if (this.state.userType === 'Consumer') {
        this.show(consumerFormText);
        this.hide(businessFormText);
      } else {
        this.hide(consumerFormText);
        this.show(businessFormText);
      }
    },

    showPopup() {
      const popupOverlay = this.$('zengaz-popup-overlay');
      if (popupOverlay) {
        popupOverlay.style.display = 'flex';

        // Lock body scroll
        document.body.classList.add('popup-open');

        // Mark as shown in session storage
        if (this.state.showOnce) {
          sessionStorage.setItem(CONFIG.STORAGE_KEY, 'true');
        }
      }
    },

    hidePopup() {
      const popupOverlay = this.$('zengaz-popup-overlay');
      if (popupOverlay) {
        popupOverlay.style.display = 'none';

        // Unlock body scroll
        document.body.classList.remove('popup-open');
      }
    },

    validateForm() {
      const fields = [
        { id: 'popupFirstName', label: this.$('popupFirstName')?.previousElementSibling },
        { id: 'popupLastName', label: this.$('popupLastName')?.previousElementSibling },
        { id: 'popupEmail', label: this.$('popupEmail')?.previousElementSibling },
        { id: 'popupPhone', label: this.$('popupPhone')?.previousElementSibling },
        { id: 'popupCountry', label: this.$('popupCountry')?.previousElementSibling },
      ];

      let isValid = true;
      let firstInvalidField = null;

      fields.forEach(({ id, label }) => {
        const field = this.$(id);
        if (!field) return;

        // Remove previous validation states
        field.classList.remove('is-invalid');
        if (label) label.classList.remove('is-invalid');

        // Validate field
        if (!field.value || !field.value.trim()) {
          isValid = false;
          field.classList.add('is-invalid');
          if (label) label.classList.add('is-invalid');
          if (!firstInvalidField) firstInvalidField = field;
        }

        // Email validation
        if (id === 'popupEmail' && field.value && field.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value)) {
            isValid = false;
            field.classList.add('is-invalid');
            if (label) label.classList.add('is-invalid');
            if (!firstInvalidField) firstInvalidField = field;
          }
        }
      });

      if (!isValid && firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return isValid;
    },

    async handleSubmit(event) {
      event.preventDefault();

      // Validate form
      if (!this.validateForm()) {
        return;
      }

      const submitButton = this.$('zengaz-popup-form').querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      const errorHolder = this.$('zengaz-popup-error');

      this.setFormFieldsDisabled(true);
      submitButton.textContent = 'Processing...';
      this.hide(errorHolder);

      const formData = {
        action: 'popup',
        brand: CONFIG.BRAND,
        type: this.state.userType,
        firstName: this.$('popupFirstName').value,
        lastName: this.$('popupLastName').value,
        email: this.$('popupEmail').value,
        phone: this.$('popupPhone').value,
        country: this.$('popupCountry').value,
      };

      try {
        const response = await fetch(CONFIG.API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'An unexpected error occurred.');
        }

        if (result.coupon_code) {
          const couponCodeHolder = this.$('zengaz-coupon-code-display');
          if (couponCodeHolder) couponCodeHolder.textContent = result.coupon_code;
          this.showView('zengaz-popup-success-view');
        } else {
          this.showView('zengaz-popup-business-success-view');
        }
      } catch (error) {
        console.error('[Popup] Submission error:', error);
        if (errorHolder) {
          errorHolder.textContent = error.message;
          this.show(errorHolder);
        }
      } finally {
        this.setFormFieldsDisabled(false);
        submitButton.textContent = originalButtonText;
      }
    },
  };

  // Initialize popup when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      PopupManager.init();
    });
  } else {
    PopupManager.init();
  }
})();
