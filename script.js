$(document).ready(function () {
  // --- Initialize AOS (Animate on Scroll) ---
  AOS.init({
    duration: 800,
    once: true,
    offset: 50,
  });

  // --- 1. Navbar ---
  $(window).scroll(function () {
    if ($(this).scrollTop() > 50) {
      $('#mainNavbar').addClass('scrolled').removeClass('navbar-dark');
    } else {
      $('#mainNavbar').removeClass('scrolled').addClass('navbar-dark');
    }
  });

  $('.navbar-toggler').click(function () {
    $(this).toggleClass('open');
  });

  $('.navbar-nav a').on('click', function (event) {
    if (this.hash !== '') {
      event.preventDefault();
      var hash = this.hash;
      $('html, body').animate(
        {
          scrollTop: $(hash).offset().top - 80,
        },
        800
      );
    }
    if ($('.navbar-toggler').is(':visible')) {
      $('.navbar-collapse').collapse('hide');
      $('.navbar-toggler').removeClass('open');
    }
  });

  // --- 2. Hero Section ---
  // Initialize Typed.js
  var typed = new Typed('#typed-hero', {
    strings: [
      'Responding to Crisis.',
      'Rebuilding Lives.',
      'Your Support Saves.',
    ],
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 2000,
    loop: true,
  });

  // --- 3. Access + Reporting ---
  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form-wrap');
  const authMessage = document.getElementById('authMessage');
  const userStatus = document.getElementById('userStatus');
  const reportingAccess = document.getElementById('reportingAccess');
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const otpVerificationForm = document.getElementById('otpVerificationForm');
  const demoOtpBox = document.getElementById('demoOtpBox');
  const demoOtpValue = document.getElementById('demoOtpValue');
  const incidentReportForm = document.getElementById('incidentReportForm');
  const reportMessage = document.getElementById('reportMessage');
  const reportList = document.getElementById('reportList');
  const reportCount = document.getElementById('reportCount');
  const reportSubmitBtn = document.getElementById('reportSubmitBtn');
  const pendingValidationCount = document.getElementById('pendingValidationCount');
  const validationMessage = document.getElementById('validationMessage');
  const validationList = document.getElementById('validationList');
  const updateFilterForm = document.getElementById('updateFilterForm');
  const updatesFeed = document.getElementById('updatesFeed');
  const insightRole = document.getElementById('insightRole');
  const accountState = document.getElementById('accountState');
  const profileType = document.getElementById('profileType');
  const coverageArea = document.getElementById('coverageArea');
  const updateMode = document.getElementById('updateMode');
  const reportAccessState = document.getElementById('reportAccessState');
  let pendingResetOtp = '';
  let pendingResetIdentity = '';

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('cdmsCurrentUser') || 'null');
  }

  function getRegisteredUser() {
    return JSON.parse(localStorage.getItem('cdmsRegisteredUser') || 'null');
  }

  function setCurrentUser(user) {
    localStorage.setItem('cdmsCurrentUser', JSON.stringify(user));
  }

  function showAuthPanel(target) {
    authTabs.forEach((btn) => {
      const isSelected = btn.dataset.authTarget === target;
      btn.classList.toggle('active', isSelected);
    });
    authForms.forEach((form) => form.classList.remove('active'));
    const panel = document.getElementById(target);
    if (panel) panel.classList.add('active');
  }

  function openForgotPassword() {
    showAuthPanel('forgotPasswordWrap');
    accountState.textContent = 'Password Recovery';
    profileType.textContent = 'OTP Verification';
    authMessage.textContent = 'Enter your registered email or phone number to receive a demo OTP.';
    authMessage.classList.remove('success-state');
  }

  function openLoginPanel() {
    showAuthPanel('loginFormWrap');
    if (!getCurrentUser()) {
      accountState.textContent = 'Awaiting Login';
      profileType.textContent = 'Visitor';
    }
  }

  function updateAccessState() {
    const currentUser = getCurrentUser();
    if (currentUser) {
      authMessage.textContent = `Logged in as ${currentUser.name}. You can now submit incident reports.`;
      authMessage.classList.add('success-state');
      reportingAccess.textContent = 'Reporting Enabled';
      userStatus.textContent = currentUser.name;
      reportSubmitBtn.textContent = 'Submit Report';
      insightRole.textContent = currentUser.role || 'Citizen';
      accountState.textContent = 'Access Granted';
      profileType.textContent = currentUser.role || 'Citizen';
      coverageArea.textContent = currentUser.location || 'Assigned Area';
      updateMode.textContent = `${currentUser.role || 'Citizen'} Alerts`;
      reportAccessState.textContent = 'Open';
    } else {
      authMessage.textContent = 'Please login or signup to start reporting incidents.';
      authMessage.classList.remove('success-state');
      reportingAccess.textContent = 'Login Required';
      userStatus.textContent = 'Guest Mode';
      reportSubmitBtn.textContent = 'Submit Report';
      insightRole.textContent = 'Guest';
      accountState.textContent = 'Awaiting Login';
      profileType.textContent = 'Visitor';
      coverageArea.textContent = 'Community Wide';
      updateMode.textContent = 'General Alerts';
      reportAccessState.textContent = 'Locked';
    }
  }

  authTabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const target = this.dataset.authTarget;
      showAuthPanel(target);
      if (target === 'signupFormWrap') {
        accountState.textContent = 'Creating Account';
        profileType.textContent = 'New User';
      } else if (!getCurrentUser()) {
        accountState.textContent = 'Awaiting Login';
        profileType.textContent = 'Visitor';
      }
    });
  });

  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const user = {
        role: $('#signupRole').val(),
        name: $('#signupName').val().trim(),
        email: $('#signupEmail').val().trim(),
        phone: $('#signupPhone').val().trim(),
        location: $('#signupLocation').val().trim(),
        password: $('#signupPassword').val(),
      };

      if (!user.name || !user.email || !user.role || !user.password) return;
      localStorage.setItem('cdmsRegisteredUser', JSON.stringify(user));
      setCurrentUser(user);
      signupForm.reset();
      updateAccessState();

      if (user.role === 'Authority' && validationList) {
        const card = document.createElement('div');
        card.className = 'validation-item';
        card.innerHTML = `
          <div>
            <h5>${user.name}</h5>
            <p>${user.role} • ${user.location || 'Local Unit'}</p>
          </div>
          <button class="btn btn-sm btn-premium validate-btn" data-name="${user.name}">Validate</button>
        `;
        validationList.appendChild(card);
        refreshValidationCount();
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const savedUser = getRegisteredUser();
      const identity = $('#loginEmail').val().trim();
      const password = $('#loginPassword').val();

      if (!savedUser) {
        authMessage.textContent = 'No account found yet. Please signup first.';
        authMessage.classList.remove('success-state');
        return;
      }

      const identityMatched =
        savedUser.email === identity || savedUser.phone === identity;

      if (!identityMatched) {
        authMessage.textContent = 'Email or phone number not matched. Please use registered details.';
        authMessage.classList.remove('success-state');
        return;
      }

      if (savedUser.password !== password) {
        authMessage.textContent = 'Password not matched. Use Forgot Password to reset with demo OTP.';
        authMessage.classList.remove('success-state');
        return;
      }

      setCurrentUser(savedUser);
      loginForm.reset();
      updateAccessState();
    });
  }

  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', openForgotPassword);
  }

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', function () {
      pendingResetOtp = '';
      pendingResetIdentity = '';
      demoOtpBox.classList.add('d-none');
      otpVerificationForm.classList.add('d-none');
      forgotPasswordForm.reset();
      otpVerificationForm.reset();
      openLoginPanel();
      authMessage.textContent = 'Please login or signup to start reporting incidents.';
      authMessage.classList.remove('success-state');
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const savedUser = getRegisteredUser();
      const identity = $('#forgotIdentity').val().trim();

      if (!savedUser) {
        authMessage.textContent = 'No registered account found. Please signup first.';
        authMessage.classList.remove('success-state');
        return;
      }

      const identityMatched =
        savedUser.email === identity || savedUser.phone === identity;

      if (!identityMatched) {
        authMessage.textContent = 'Entered email or phone number is not registered.';
        authMessage.classList.remove('success-state');
        return;
      }

      pendingResetIdentity = identity;
      pendingResetOtp = String(Math.floor(100000 + Math.random() * 900000));
      demoOtpValue.textContent = pendingResetOtp;
      demoOtpBox.classList.remove('d-none');
      otpVerificationForm.classList.remove('d-none');
      authMessage.textContent = 'Demo OTP generated successfully. Enter OTP and set your new password.';
      authMessage.classList.add('success-state');
    });
  }

  if (otpVerificationForm) {
    otpVerificationForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const savedUser = getRegisteredUser();
      const enteredOtp = $('#otpCode').val().trim();
      const newPassword = $('#newPassword').val();
      const confirmPassword = $('#confirmPassword').val();

      if (!savedUser || !pendingResetOtp || !pendingResetIdentity) {
        authMessage.textContent = 'Please generate a demo OTP first.';
        authMessage.classList.remove('success-state');
        return;
      }

      if (enteredOtp !== pendingResetOtp) {
        authMessage.textContent = 'Invalid OTP. Please enter the demo OTP shown below.';
        authMessage.classList.remove('success-state');
        return;
      }

      if (newPassword.length < 4) {
        authMessage.textContent = 'New password must be at least 4 characters long.';
        authMessage.classList.remove('success-state');
        return;
      }

      if (newPassword !== confirmPassword) {
        authMessage.textContent = 'New password and confirm password do not match.';
        authMessage.classList.remove('success-state');
        return;
      }

      const updatedUser = { ...savedUser, password: newPassword };
      localStorage.setItem('cdmsRegisteredUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      pendingResetOtp = '';
      pendingResetIdentity = '';
      forgotPasswordForm.reset();
      otpVerificationForm.reset();
      demoOtpBox.classList.add('d-none');
      otpVerificationForm.classList.add('d-none');
      openLoginPanel();
      updateAccessState();
      authMessage.textContent = 'Password reset successful. You are now logged in with the new password.';
      authMessage.classList.add('success-state');
    });
  }

  if (incidentReportForm) {
    incidentReportForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const currentUser = getCurrentUser();

      if (!currentUser) {
        reportMessage.textContent = 'Login or signup first to submit an incident report.';
        reportMessage.classList.remove('d-none', 'success-state');
        authMessage.textContent = 'Please login first, then submit the report.';
        authMessage.classList.remove('success-state');
        document.getElementById('access-report').scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const title = $('#incidentTitle').val().trim();
      const type = $('#incidentType').val();
      const location = $('#incidentLocation').val().trim();
      const severity = $('#incidentSeverity').val();
      const description = $('#incidentDescription').val().trim();

      const reportHtml = `
        <div class="report-item">
          <div class="report-meta">
            <span class="severity-chip ${severity.toLowerCase()}">${severity}</span>
            <span>${type}</span>
            <span>Reported by ${currentUser.name}</span>
          </div>
          <h5>${title} - ${location}</h5>
          <p>${description}</p>
        </div>
      `;

      reportList.insertAdjacentHTML('afterbegin', reportHtml);
      const totalReports = reportList.querySelectorAll('.report-item').length;
      reportCount.textContent = `${totalReports} Reports`;
      reportMessage.textContent = 'Incident report submitted successfully and added to the live reporting list.';
      reportMessage.classList.remove('d-none');
      reportMessage.classList.add('success-state');
      incidentReportForm.reset();
    });
  }

  function refreshValidationCount() {
    if (!validationList || !pendingValidationCount) return;
    const count = validationList.querySelectorAll('.validate-btn').length;
    pendingValidationCount.textContent = `${count} Pending`;
  }

  if (validationList) {
    validationList.addEventListener('click', function (e) {
      const button = e.target.closest('.validate-btn');
      if (!button) return;
      const currentUser = getCurrentUser();
      const actor = currentUser?.role === 'Authority' ? currentUser.name : 'Admin';
      button.closest('.validation-item').remove();
      refreshValidationCount();
      validationMessage.textContent = `${button.dataset.name} validated successfully by ${actor}.`;
      validationMessage.classList.remove('d-none');
      validationMessage.classList.add('success-state');
    });
  }

  if (updateFilterForm) {
    updateFilterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const locationValue = $('#updateLocation').val().trim().toLowerCase();
      const typeValue = $('#updateEmergencyType').val();
      const cards = updatesFeed.querySelectorAll('.update-card');
      let visible = 0;

      cards.forEach((card) => {
        const matchLocation =
          !locationValue || card.dataset.location.toLowerCase().includes(locationValue);
        const matchType = typeValue === 'All' || card.dataset.type === typeValue;
        const show = matchLocation && matchType;
        card.style.display = show ? 'block' : 'none';
        if (show) visible += 1;
      });

      if (visible === 0) {
        validationMessage.textContent = 'No matching updates found for the selected location and emergency type.';
        validationMessage.classList.remove('d-none', 'success-state');
      }
    });
  }

  updateAccessState();
  refreshValidationCount();

  // --- 4. Services Section ---
  // Initialize Vanilla-Tilt.js
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
    max: 15,
    speed: 400,
    glare: true,
    'max-glare': 0.5,
  });

  // --- 5. Statistics / Counter ---
  function animateCounter(element) {
    var $this = $(element);
    var countTo = $this.attr('data-count');
    $({ countNum: $this.text() }).animate(
      {
        countNum: countTo,
      },
      {
        duration: 2000,
        easing: 'swing',
        step: function () {
          $this.text(Math.floor(this.countNum));
        },
        complete: function () {
          let finalVal = this.countNum
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          $this.text(finalVal);
        },
      }
    );
  }

  var statsSection = $('#stats');
  if (statsSection.length) {
    statsSection.waypoint(
      function (direction) {
        if (direction === 'down') {
          $('.counter').each(function () {
            $(this).attr('data-count', $(this).text().replace(/,/g, ''));
            $(this).text('0');
            animateCounter(this);
          });
          this.destroy();
        }
      },
      {
        offset: '75%',
      }
    );
  }

  // --- 7. Gallery / Media ---
  const lightbox = GLightbox({ selector: '.glightbox' });

  // --- 9. Testimonials ---
  var swiper = new Swiper('.testimonials-slider', {
    loop: true,
    grabCursor: true,
    spaceBetween: 30,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });

  // --- Contact Form ---
  $('#contactForm').on('submit', function (e) {
    e.preventDefault();
    // A more modern feedback approach
    const btn = $(this).find('button[type="submit"]');
    btn.text('Sending...').prop('disabled', true);
    setTimeout(() => {
      btn.text('Message Sent!').css('background', '#28a745');
      setTimeout(() => {
        this.reset();
        btn.text('Send Message').prop('disabled', false).css('background', '');
      }, 2000);
    }, 1000);
  });

  // --- Scroll to Top Button ---
  var scrollTopBtn = $('#scrollTopBtn');
  $(window).scroll(function () {
    if ($(window).scrollTop() > 300) {
      scrollTopBtn.fadeIn();
    } else {
      scrollTopBtn.fadeOut();
    }
  });

  scrollTopBtn.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });
});
