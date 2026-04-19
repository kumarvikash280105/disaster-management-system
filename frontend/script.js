$(document).ready(function () {
  const API_BASE =
    window.location.protocol.startsWith('http')
      ? `${window.location.origin}/api`
      : 'http://localhost:5000/api';

  const storageKey = 'cdmsCurrentUser';

  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form-wrap');
  const passwordToggles = document.querySelectorAll('.password-toggle');
  const authMessage = document.getElementById('authMessage');
  const userStatus = document.getElementById('userStatus');
  const accountDropdown = document.getElementById('accountDropdown');
  const accountDropdownHead = document.getElementById('accountDropdownHead');
  const loginNavLink = document.getElementById('loginNavLink');
  const signupNavLink = document.getElementById('signupNavLink');
  const logoutBtn = document.getElementById('logoutBtn');
  const reportingAccess = document.getElementById('reportingAccess');
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
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
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');
  const newsletterForm = document.getElementById('newsletterForm');
  const donationForm = document.getElementById('donationForm');
  const donationStatus = document.getElementById('donationStatus');
  const donationList = document.getElementById('donationList');
  const donationCount = document.getElementById('donationCount');
  const totalRaised = document.getElementById('totalRaised');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || 'null');
    } catch (error) {
      return null;
    }
  }

  function setCurrentUser(user) {
    localStorage.setItem(storageKey, JSON.stringify(user));
  }

  function clearCurrentUser() {
    localStorage.removeItem(storageKey);
  }

  function formatCurrency(amount) {
    return `INR ${Number(amount || 0).toLocaleString('en-IN')}`;
  }

  function normalizePhone(value) {
    return (value || '').replace(/\D/g, '');
  }

  function showStatus(element, message, isSuccess = true) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('d-none', 'success-state', 'error-state');
    element.classList.add(isSuccess ? 'success-state' : 'error-state');
  }

  async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Request failed.');
    }

    return data;
  }

  function canSubmitReports(user) {
    if (!user) return false;
    if (user.role === 'Citizen') return true;
    return user.status === 'approved';
  }

  function updateAccessState() {
    const currentUser = getCurrentUser();

    if (userStatus) {
      userStatus.textContent = currentUser
        ? `${currentUser.name}${currentUser.status === 'pending' ? ' (Pending)' : ''}`
        : 'Login / Signup';
    }

    if (logoutBtn) {
      logoutBtn.classList.toggle('d-none', !currentUser);
    }

    if (accountDropdownHead) {
      accountDropdownHead.textContent = currentUser ? 'Signed in account' : 'Quick access';
    }

    if (loginNavLink) {
      loginNavLink.classList.toggle('d-none', !!currentUser);
    }

    if (signupNavLink) {
      signupNavLink.classList.toggle('d-none', !!currentUser);
    }

    if (accountDropdown && !currentUser) {
      accountDropdown.classList.add('d-none');
    }

    if (!authMessage) return;

    if (currentUser) {
      const reportingEnabled = canSubmitReports(currentUser);
      authMessage.textContent = reportingEnabled
        ? `Logged in as ${currentUser.name}. You can now submit incident reports.`
        : `Logged in as ${currentUser.name}. Your profile is awaiting validation before operational access.`;
      authMessage.classList.add('success-state');

      if (reportingAccess) {
        reportingAccess.textContent = reportingEnabled
          ? 'Reporting Enabled'
          : 'Validation Pending';
      }
      if (reportSubmitBtn) {
        reportSubmitBtn.disabled = !reportingEnabled;
        reportSubmitBtn.textContent = reportingEnabled
          ? 'Submit Report'
          : 'Awaiting Validation';
      }
      if (insightRole) insightRole.textContent = currentUser.role || 'Citizen';
      if (accountState) {
        accountState.textContent = reportingEnabled ? 'Access Granted' : 'Pending Approval';
      }
      if (profileType) profileType.textContent = currentUser.role || 'Citizen';
      if (coverageArea) coverageArea.textContent = currentUser.location || 'Assigned Area';
      if (updateMode) {
        updateMode.textContent =
          currentUser.role === 'Authority' ? 'Authority Alerts' : 'Citizen Alerts';
      }
      if (reportAccessState) {
        reportAccessState.textContent = reportingEnabled ? 'Open' : 'Restricted';
      }
    } else {
      authMessage.textContent = 'Please login or signup to start reporting incidents.';
      authMessage.classList.remove('success-state');

      if (reportingAccess) reportingAccess.textContent = 'Login Required';
      if (reportSubmitBtn) {
        reportSubmitBtn.disabled = false;
        reportSubmitBtn.textContent = 'Submit Report';
      }
      if (insightRole) insightRole.textContent = 'Guest';
      if (accountState) accountState.textContent = 'Awaiting Login';
      if (profileType) profileType.textContent = 'Visitor';
      if (coverageArea) coverageArea.textContent = 'Community Wide';
      if (updateMode) updateMode.textContent = 'General Alerts';
      if (reportAccessState) reportAccessState.textContent = 'Locked';
    }
  }

  function renderIncidentCard(incident) {
    return `
      <div class="report-item">
        <div class="report-meta">
          <span class="severity-chip ${incident.severity.toLowerCase()}">${incident.severity}</span>
          <span>${incident.type}</span>
          <span>Reported by ${incident.reporterName}</span>
        </div>
        <h5>${incident.title} - ${incident.location}</h5>
        <p>${incident.description}</p>
      </div>
    `;
  }

  function renderValidationCard(user) {
    return `
      <div class="validation-item">
        <div>
          <h5>${user.name}</h5>
          <p>${user.role} • ${user.location}</p>
        </div>
        <button class="btn btn-sm btn-premium validate-btn" data-id="${user._id}" data-name="${user.name}">Validate</button>
      </div>
    `;
  }

  function renderUpdateCard(update) {
    return `
      <div class="update-card" data-location="${update.location}" data-type="${update.emergencyType}">
        <span>${update.location} • ${update.emergencyType}</span>
        <p>${update.message}</p>
      </div>
    `;
  }

  function renderDonationCard(donation) {
    const createdAt = new Date(donation.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return `
      <div class="report-item">
        <div class="report-meta">
          <span class="severity-chip medium">${formatCurrency(donation.amount)}</span>
          <span>${donation.purpose}</span>
          <span>${createdAt}</span>
        </div>
        <h5>${donation.donorName}</h5>
        <p>Contribution recorded for ${donation.purpose}.</p>
      </div>
    `;
  }

  async function loadIncidents() {
    if (!reportList) return;

    try {
      const data = await apiRequest('/incidents');
      reportList.innerHTML = data.incidents.map(renderIncidentCard).join('');
      if (reportCount) {
        reportCount.textContent = `${data.incidents.length} Reports`;
      }
    } catch (error) {
      reportList.innerHTML = '<div class="report-item"><p>Unable to load reports right now.</p></div>';
      if (reportCount) reportCount.textContent = 'Unavailable';
    }
  }

  async function loadValidationQueue() {
    if (!validationList) return;

    try {
      const data = await apiRequest('/validations');
      validationList.innerHTML = data.pendingAuthorities.length
        ? data.pendingAuthorities.map(renderValidationCard).join('')
        : '<div class="report-item"><p>No pending authority validations.</p></div>';
      if (pendingValidationCount) {
        pendingValidationCount.textContent = `${data.pendingAuthorities.length} Pending`;
      }
    } catch (error) {
      validationList.innerHTML = '<div class="report-item"><p>Validation queue unavailable.</p></div>';
      if (pendingValidationCount) pendingValidationCount.textContent = 'Unavailable';
    }
  }

  async function loadUpdates(location = '', emergencyType = 'All') {
    if (!updatesFeed) return;

    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (emergencyType) params.set('emergencyType', emergencyType);

    try {
      const data = await apiRequest(`/updates?${params.toString()}`);
      updatesFeed.innerHTML = data.updates.length
        ? data.updates.map(renderUpdateCard).join('')
        : '<div class="report-item"><p>No matching updates found.</p></div>';
    } catch (error) {
      updatesFeed.innerHTML = '<div class="report-item"><p>Updates could not be loaded.</p></div>';
    }
  }

  async function loadDonations() {
    if (!donationList) return;

    try {
      const data = await apiRequest('/donations');
      donationList.innerHTML = data.donations.length
        ? data.donations.map(renderDonationCard).join('')
        : '<div class="report-item"><p>No donations recorded yet.</p></div>';
      if (donationCount) donationCount.textContent = `${data.donations.length} Entries`;
      if (totalRaised) totalRaised.textContent = formatCurrency(data.totalRaised);
    } catch (error) {
      donationList.innerHTML = '<div class="report-item"><p>Donation feed unavailable.</p></div>';
      if (donationCount) donationCount.textContent = 'Unavailable';
    }
  }

  AOS.init({
    duration: 800,
    once: true,
    offset: 50,
  });

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
      const hash = this.hash;
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

  if (document.getElementById('typed-hero')) {
    new Typed('#typed-hero', {
      strings: ['Responding to Crisis.', 'Rebuilding Lives.', 'Your Support Saves.'],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 2000,
      loop: true,
    });
  }

  authTabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const target = this.dataset.authTarget;
      authTabs.forEach((button) => button.classList.remove('active'));
      authForms.forEach((form) => form.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  passwordToggles.forEach((toggle) => {
    toggle.addEventListener('click', function () {
      const targetId = this.dataset.togglePassword;
      const input = document.getElementById(targetId);
      if (!input) return;
      const makeVisible = input.type === 'password';
      input.type = makeVisible ? 'text' : 'password';
      this.textContent = makeVisible ? 'Hide' : 'Show';
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const authTarget = urlParams.get('auth');
  if (authTarget && authTabs.length) {
    const desiredTarget = authTarget === 'signup' ? 'signupFormWrap' : 'loginFormWrap';
    const desiredTab = document.querySelector(`[data-auth-target="${desiredTarget}"]`);
    if (desiredTab) {
      desiredTab.click();
    }
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const signupPassword = $('#signupPassword').val().trim();
      const signupConfirmPassword = $('#signupConfirmPassword').val().trim();
      const signupEmail = $('#signupEmail').val().trim().toLowerCase();
      const signupPhone = normalizePhone($('#signupPhone').val());

      if (signupPassword !== signupConfirmPassword) {
        showStatus(authMessage, 'Password and confirm password do not match.', false);
        return;
      }

      if (!emailRegex.test(signupEmail)) {
        showStatus(authMessage, 'Please enter a valid email address.', false);
        return;
      }

      if (!phoneRegex.test(signupPhone)) {
        showStatus(authMessage, 'Phone number must be exactly 10 digits.', false);
        return;
      }

      try {
        const data = await apiRequest('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            role: $('#signupRole').val(),
            name: $('#signupName').val().trim(),
            email: signupEmail,
            phone: signupPhone,
            location: $('#signupLocation').val().trim(),
            password: signupPassword,
          }),
        });

        setCurrentUser(data.user);
        signupForm.reset();
        updateAccessState();
        showStatus(authMessage, data.message, true);
        await loadValidationQueue();
      } catch (error) {
        showStatus(authMessage, error.message, false);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const identifier = $('#loginIdentifier').val().trim();
      const normalizedPhone = normalizePhone(identifier);
      const usingEmail = identifier.includes('@');

      if (usingEmail && !emailRegex.test(identifier.toLowerCase())) {
        showStatus(authMessage, 'Please enter a valid email address.', false);
        return;
      }

      if (!usingEmail && !phoneRegex.test(normalizedPhone)) {
        showStatus(authMessage, 'Phone number must be exactly 10 digits.', false);
        return;
      }

      try {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            identifier: usingEmail ? identifier.toLowerCase() : normalizedPhone,
            password: $('#loginPassword').val().trim(),
          }),
        });

        setCurrentUser(data.user);
        loginForm.reset();
        updateAccessState();
        showStatus(authMessage, data.message, true);
      } catch (error) {
        showStatus(authMessage, error.message, false);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      clearCurrentUser();
      updateAccessState();

      if (authMessage) {
        showStatus(authMessage, 'You have been logged out successfully.', true);
      }

      if (reportMessage) {
        reportMessage.classList.add('d-none');
      }
    });
  }

  if (userStatus && accountDropdown) {
    userStatus.addEventListener('click', function (event) {
      event.stopPropagation();
      accountDropdown.classList.toggle('d-none');
    });

    accountDropdown.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    document.addEventListener('click', function () {
      accountDropdown.classList.add('d-none');
    });
  }

  if (incidentReportForm) {
    incidentReportForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const currentUser = getCurrentUser();

      if (!currentUser) {
        showStatus(reportMessage, 'Login or signup first to submit an incident report.', false);
        document.getElementById('access-report')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (!canSubmitReports(currentUser)) {
        showStatus(reportMessage, 'Your account is awaiting validation. Reporting is temporarily locked.', false);
        return;
      }

      try {
        const data = await apiRequest('/incidents', {
          method: 'POST',
          body: JSON.stringify({
            title: $('#incidentTitle').val().trim(),
            type: $('#incidentType').val(),
            location: $('#incidentLocation').val().trim(),
            severity: $('#incidentSeverity').val(),
            description: $('#incidentDescription').val().trim(),
            reporterId: currentUser.id,
          }),
        });

        incidentReportForm.reset();
        showStatus(reportMessage, data.message, true);
        await loadIncidents();
      } catch (error) {
        showStatus(reportMessage, error.message, false);
      }
    });
  }

  if (validationList) {
    validationList.addEventListener('click', async function (event) {
      const button = event.target.closest('.validate-btn');
      if (!button) return;

      try {
        const data = await apiRequest(`/validations/${button.dataset.id}/approve`, {
          method: 'PATCH',
        });
        showStatus(validationMessage, data.message, true);

        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === data.user._id) {
          setCurrentUser({ ...currentUser, status: 'approved' });
          updateAccessState();
        }

        await loadValidationQueue();
      } catch (error) {
        showStatus(validationMessage, error.message, false);
      }
    });
  }

  if (updateFilterForm) {
    updateFilterForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      await loadUpdates(
        $('#updateLocation').val().trim(),
        $('#updateEmergencyType').val()
      );
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const contactEmail = $('#contactEmail').val().trim().toLowerCase();

      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;

      if (!emailRegex.test(contactEmail)) {
        showStatus(contactStatus, 'Please enter a valid email address.', false);
        submitButton.textContent = 'Send Message';
        submitButton.disabled = false;
        return;
      }

      try {
        const data = await apiRequest('/contacts', {
          method: 'POST',
          body: JSON.stringify({
            name: $('#contactName').val().trim(),
            email: contactEmail,
            subject: $('#contactSubject').val().trim(),
            message: $('#contactMessageInput').val().trim(),
          }),
        });

        contactForm.reset();
        showStatus(contactStatus, data.message, true);
      } catch (error) {
        showStatus(contactStatus, error.message, false);
      } finally {
        submitButton.textContent = 'Send Message';
        submitButton.disabled = false;
      }
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const submitButton = newsletterForm.querySelector('button[type="submit"]');
      const newsletterEmail = $('#newsletterEmail').val().trim().toLowerCase();

      submitButton.textContent = 'Saving...';
      submitButton.disabled = true;

      if (!emailRegex.test(newsletterEmail)) {
        alert('Please enter a valid email address.');
        submitButton.textContent = 'Subscribe';
        submitButton.disabled = false;
        return;
      }

      try {
        const data = await apiRequest('/subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            email: newsletterEmail,
          }),
        });

        alert(data.message);
        newsletterForm.reset();
      } catch (error) {
        alert(error.message);
      } finally {
        submitButton.textContent = 'Subscribe';
        submitButton.disabled = false;
      }
    });
  }

  if (donationForm) {
    donationForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const submitButton = donationForm.querySelector('button[type="submit"]');
      const donorEmail = $('#donorEmail').val().trim().toLowerCase();
      const donorPhone = normalizePhone($('#donorPhone').val());

      submitButton.textContent = 'Processing...';
      submitButton.disabled = true;

      if (!emailRegex.test(donorEmail)) {
        showStatus(donationStatus, 'Please enter a valid email address.', false);
        submitButton.textContent = 'Donate Now';
        submitButton.disabled = false;
        return;
      }

      if (!phoneRegex.test(donorPhone)) {
        showStatus(donationStatus, 'Phone number must be exactly 10 digits.', false);
        submitButton.textContent = 'Donate Now';
        submitButton.disabled = false;
        return;
      }

      try {
        const data = await apiRequest('/donations', {
          method: 'POST',
          body: JSON.stringify({
            donorName: $('#donorName').val().trim(),
            email: donorEmail,
            phone: donorPhone,
            amount: Number($('#donationAmount').val()),
            purpose: $('#donationPurpose').val(),
            message: $('#donationMessage').val().trim(),
          }),
        });

        donationForm.reset();
        showStatus(donationStatus, data.message, true);
        await loadDonations();
      } catch (error) {
        showStatus(donationStatus, error.message, false);
      } finally {
        submitButton.textContent = 'Donate Now';
        submitButton.disabled = false;
      }
    });
  }

  VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
    max: 15,
    speed: 400,
    glare: true,
    'max-glare': 0.5,
  });

  function animateCounter(element) {
    const $element = $(element);
    const countTo = $element.attr('data-count');
    $({ countNum: $element.text() }).animate(
      {
        countNum: countTo,
      },
      {
        duration: 2000,
        easing: 'swing',
        step: function () {
          $element.text(Math.floor(this.countNum));
        },
        complete: function () {
          const finalVal = this.countNum
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          $element.text(finalVal);
        },
      }
    );
  }

  const statsSection = $('#stats');
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
      { offset: '75%' }
    );
  }

  if (document.querySelector('.glightbox')) {
    GLightbox({ selector: '.glightbox' });
  }

  if (document.querySelector('.testimonials-slider')) {
    new Swiper('.testimonials-slider', {
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
  }

  const scrollTopBtn = $('#scrollTopBtn');
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

  updateAccessState();
  loadIncidents();
  loadValidationQueue();
  loadUpdates();
  loadDonations();
});
