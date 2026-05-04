$(document).ready(function () {
  const API_BASE =
    window.location.protocol.startsWith('http')
      ? `${window.location.origin}/api`
      : 'http://localhost:5000/api';

  const storageKey = 'cdmsCurrentUser';

  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form-wrap');
  const authSwitchLinks = document.querySelectorAll('.auth-switch-link');
  const authMessage = document.getElementById('authMessage');
  const openAuthModal = document.getElementById('openAuthModal');
  const openAdminModal = document.getElementById('openAdminModal');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const authModalShell = document.getElementById('authModalShell');
  const authModalBackdrop = document.getElementById('authModalBackdrop');
  const authPopupTriggers = document.querySelectorAll('.auth-popup-trigger');
  const loginModeButtons = document.querySelectorAll('.login-mode-btn');
  const adminLoginHint = document.getElementById('adminLoginHint');
  const userStatus = document.getElementById('userStatus');
  const accountDropdown = document.getElementById('accountDropdown');
  const accountDropdownHead = document.getElementById('accountDropdownHead');
  const loginNavLink = document.getElementById('loginNavLink');
  const signupNavLink = document.getElementById('signupNavLink');
  const logoutBtn = document.getElementById('logoutBtn');
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
  const adminWorkbench = document.getElementById('adminWorkbench');
  const adminIncidentList = document.getElementById('adminIncidentList');
  const adminIncidentMessage = document.getElementById('adminIncidentMessage');
  const adminIncidentCount = document.getElementById('adminIncidentCount');
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
  const demoUsersKey = 'cdmsDemoUsers';
  const demoIncidentsKey = 'cdmsDemoIncidents';
  const demoSeededKey = 'cdmsDemoSeeded';
  let pendingResetOtp = '';
  let pendingResetIdentifier = '';
  let selectedLoginMode = 'user';

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

  function getDemoUsers() {
    try {
      return JSON.parse(localStorage.getItem(demoUsersKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveDemoUsers(users) {
    localStorage.setItem(demoUsersKey, JSON.stringify(users));
  }

  function getDemoIncidents() {
    try {
      return JSON.parse(localStorage.getItem(demoIncidentsKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveDemoIncidents(incidents) {
    localStorage.setItem(demoIncidentsKey, JSON.stringify(incidents));
  }

  function createDemoId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizeDemoUser(user) {
    const resolvedId = user.id || user._id || createDemoId('user');
    return {
      ...user,
      id: resolvedId,
      _id: resolvedId,
    };
  }

  function findDemoUser(identifier) {
    const normalizedValue = (identifier || '').trim().toLowerCase();
    const normalizedPhone = normalizePhone(identifier);

    return getDemoUsers().find((user) => {
      const emailMatch = (user.email || '').toLowerCase() === normalizedValue;
      const phoneMatch = normalizePhone(user.phone) === normalizedPhone;
      return emailMatch || phoneMatch;
    });
  }

  function upsertDemoUser(user) {
    const normalizedUser = normalizeDemoUser(user);
    const users = getDemoUsers();
    const index = users.findIndex(
      (entry) =>
        entry.email === normalizedUser.email ||
        entry.phone === normalizedUser.phone ||
        entry.id === normalizedUser.id ||
        entry._id === normalizedUser._id
    );
    if (index >= 0) {
      users[index] = { ...users[index], ...normalizedUser };
    } else {
      users.push(normalizedUser);
    }
    saveDemoUsers(users);
    return normalizedUser;
  }

  function ensureDemoSeedData() {
    if (localStorage.getItem(demoSeededKey) === 'true') {
      return;
    }

    const adminUser = normalizeDemoUser({
      role: 'Admin',
      name: 'System Admin',
      email: 'admin@cdms.in',
      phone: '9999999999',
      location: 'Central Command',
      password: 'admin123',
      status: 'approved',
    });

    const demoCitizen = normalizeDemoUser({
      role: 'Citizen',
      name: 'Demo User',
      email: 'user@cdms.in',
      phone: '9876543210',
      location: 'Riverside',
      password: 'user123',
      status: 'approved',
    });

    const demoAuthority = normalizeDemoUser({
      role: 'Authority',
      name: 'Relief Officer',
      email: 'authority@cdms.in',
      phone: '9876501234',
      location: 'District Control Room',
      password: 'authority123',
      status: 'pending',
    });

    saveDemoUsers([adminUser, demoCitizen, demoAuthority]);

    saveDemoIncidents([
      {
        _id: createDemoId('incident'),
        title: 'Water entered houses near Riverside Colony',
        type: 'Flood',
        location: 'Riverside Colony',
        severity: 'High',
        description: 'Residents are asking for evacuation help and dry ration support.',
        status: 'Approved',
        approvalStatus: 'approved',
        progressPercent: 55,
        adminNote: 'Relief team dispatched and evacuation vans are on the way.',
        reportedBy: demoCitizen.id,
        reporterName: demoCitizen.name,
        reporterRole: demoCitizen.role,
        updatedByAdminName: adminUser.name,
        createdAt: new Date().toISOString(),
      },
      {
        _id: createDemoId('incident'),
        title: 'Need first-aid support at relief camp',
        type: 'Medical Emergency',
        location: 'Hill View',
        severity: 'Low',
        description: 'Minor injuries reported and volunteers need medicine stock.',
        status: 'Submitted',
        approvalStatus: 'pending',
        progressPercent: 15,
        adminNote: 'Awaiting admin review and medical team assignment.',
        reportedBy: demoCitizen.id,
        reporterName: demoCitizen.name,
        reporterRole: demoCitizen.role,
        updatedByAdminName: '',
        createdAt: new Date().toISOString(),
      },
    ]);

    localStorage.setItem(demoSeededKey, 'true');
  }

  function listDemoIncidentsForViewer(currentUser) {
    const incidents = getDemoIncidents().sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    if (!currentUser) {
      return incidents.slice(0, 20);
    }

    if (currentUser.role === 'Admin') {
      return incidents;
    }

    return incidents.filter((incident) => incident.reportedBy === currentUser.id);
  }

  function createDemoIncident(payload, currentUser) {
    const incidents = getDemoIncidents();
    const incident = {
      _id: createDemoId('incident'),
      title: payload.title,
      type: payload.type,
      location: payload.location,
      severity: payload.severity,
      description: payload.description,
      status: 'Submitted',
      approvalStatus: 'pending',
      progressPercent: 10,
      adminNote: 'Submitted by user and waiting for admin review.',
      reportedBy: currentUser.id,
      reporterName: currentUser.name,
      reporterRole: currentUser.role,
      updatedByAdminName: '',
      createdAt: new Date().toISOString(),
    };

    incidents.unshift(incident);
    saveDemoIncidents(incidents);
    return incident;
  }

  function approveDemoAuthority(authorityId) {
    const users = getDemoUsers();
    const index = users.findIndex((user) => user.id === authorityId || user._id === authorityId);
    if (index === -1) {
      throw new Error('Authority profile not found.');
    }

    users[index] = { ...users[index], status: 'approved' };
    saveDemoUsers(users);
    return users[index];
  }

  function updateDemoIncident(incidentId, payload, adminUser) {
    const incidents = getDemoIncidents();
    const index = incidents.findIndex((incident) => incident._id === incidentId);
    if (index === -1) {
      throw new Error('Incident not found.');
    }

    incidents[index] = {
      ...incidents[index],
      approvalStatus: payload.approvalStatus,
      status: payload.status,
      progressPercent: Number(payload.progressPercent),
      adminNote: payload.adminNote.trim(),
      updatedByAdminName: adminUser.name,
    };
    saveDemoIncidents(incidents);
    return incidents[index];
  }

  function formatCurrency(amount) {
    return `INR ${Number(amount || 0).toLocaleString('en-IN')}`;
  }

  function getRoleLabel(role) {
    if (role === 'Citizen') return 'User';
    return role || 'Guest';
  }

  function normalizePhone(value) {
    return (value || '').replace(/\D/g, '');
  }

  function limitPhoneLikeInput(input) {
    if (!input) return;

    input.addEventListener('input', function () {
      const rawValue = this.value || '';
      const looksLikePhone = /^[\d\s()+-]+$/.test(rawValue);

      if (!looksLikePhone) {
        return;
      }

      const digitsOnly = normalizePhone(rawValue).slice(0, 10);
      this.value = digitsOnly;
    });
  }

  function showStatus(element, message, isSuccess = true) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('d-none', 'success-state', 'error-state');
    element.classList.add(isSuccess ? 'success-state' : 'error-state');
  }

  function setLoginMode(mode = 'user') {
    selectedLoginMode = mode === 'admin' ? 'admin' : 'user';
    loginModeButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.loginMode === selectedLoginMode);
    });

    if (adminLoginHint) {
      adminLoginHint.classList.toggle('d-none', selectedLoginMode !== 'admin');
    }

    if (selectedLoginMode === 'admin') {
      $('#loginIdentifier').attr('placeholder', 'Enter admin email');
      $('#loginIdentifier').val('admin@cdms.in');
      $('#loginPassword').val('admin123');
    } else {
      $('#loginIdentifier').attr('placeholder', 'Enter your email or 10-digit phone number');
      $('#loginIdentifier').val('');
      $('#loginPassword').val('');
    }
  }

  function switchAuthTab(target) {
    authTabs.forEach((button) => button.classList.toggle('active', button.dataset.authTarget === target));
    authForms.forEach((form) => form.classList.remove('active'));
    const targetForm = document.getElementById(target);
    if (targetForm) {
      targetForm.classList.add('active');
    }
  }

  function resetForgotPasswordState() {
    pendingResetOtp = '';
    pendingResetIdentifier = '';
    if (demoOtpBox) demoOtpBox.classList.add('d-none');
    if (otpVerificationForm) {
      otpVerificationForm.classList.add('d-none');
      otpVerificationForm.reset();
    }
    if (forgotPasswordForm) {
      forgotPasswordForm.reset();
    }
  }

  function openForgotPasswordPanel() {
    switchAuthTab('forgotPasswordWrap');
    if (authMessage) {
      showStatus(authMessage, 'Registered email ya phone number dalo. Demo OTP yahin show hoga.', true);
    }
  }

  function showAuthModal(target = 'loginFormWrap') {
    if (!authModalShell) return;
    authModalShell.classList.remove('d-none');
    document.body.classList.add('modal-open');
    setTimeout(() => {
      if (target !== 'forgotPasswordWrap') {
        resetForgotPasswordState();
      }
      switchAuthTab(target);
      if (target === 'loginFormWrap') {
        setLoginMode(selectedLoginMode);
      }
    }, 0);
  }

  function hideAuthModal() {
    if (!authModalShell) return;
    authModalShell.classList.add('d-none');
    document.body.classList.remove('modal-open');
    resetForgotPasswordState();
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
    if (user.role === 'Admin') return false;
    if (user.role === 'Citizen') return true;
    return user.status === 'approved';
  }

  function updateAccessState() {
    const currentUser = getCurrentUser();
    const isAdmin = currentUser?.role === 'Admin';

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

    if (adminWorkbench) {
      adminWorkbench.classList.toggle('d-none', !isAdmin);
    }

    if (!authMessage) return;

    if (currentUser) {
      const reportingEnabled = canSubmitReports(currentUser);
      authMessage.textContent = isAdmin
        ? `Logged in as ${currentUser.name}. Admin workbench unlocked for approvals and progress updates.`
        : reportingEnabled
          ? `Logged in as ${currentUser.name}. You can now submit incident reports.`
          : `Logged in as ${currentUser.name}. Your profile is awaiting validation before operational access.`;
      authMessage.classList.add('success-state');

      if (reportingAccess) {
        reportingAccess.textContent = isAdmin
          ? 'Admin Oversight'
          : reportingEnabled
          ? 'Reporting Enabled'
          : 'Validation Pending';
      }
      if (reportSubmitBtn) {
        reportSubmitBtn.disabled = isAdmin || !reportingEnabled;
        reportSubmitBtn.textContent = isAdmin
          ? 'Admin Cannot Submit User Report'
          : reportingEnabled
          ? 'Submit Report'
          : 'Awaiting Validation';
      }
      if (insightRole) insightRole.textContent = getRoleLabel(currentUser.role);
      if (accountState) {
        accountState.textContent = isAdmin
          ? 'Admin Control'
          : reportingEnabled
            ? 'Access Granted'
            : 'Pending Approval';
      }
      if (profileType) profileType.textContent = getRoleLabel(currentUser.role);
      if (coverageArea) coverageArea.textContent = currentUser.location || 'Assigned Area';
      if (updateMode) {
        updateMode.textContent = isAdmin
          ? 'Admin Alerts'
          : currentUser.role === 'Authority'
            ? 'Authority Alerts'
            : 'User Alerts';
      }
      if (reportAccessState) {
        reportAccessState.textContent = isAdmin
          ? 'Admin Review'
          : reportingEnabled
            ? 'Open'
            : 'Restricted';
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
          <span>${incident.approvalStatus || 'pending'}</span>
        </div>
        <h5>${incident.title} - ${incident.location}</h5>
        <p>${incident.description}</p>
        <p><strong>Status:</strong> ${incident.status || 'Submitted'} • <strong>Progress:</strong> ${incident.progressPercent ?? 0}%</p>
        ${incident.adminNote ? `<p><strong>Admin Note:</strong> ${incident.adminNote}</p>` : ''}
      </div>
    `;
  }

  function renderAdminIncidentCard(incident) {
    const selectedApproval = incident.approvalStatus || 'pending';
    const selectedStatus = incident.status || 'Submitted';
    const progress = Number(incident.progressPercent ?? 0);

    return `
      <div class="admin-incident-card" data-incident-id="${incident._id}">
        <div class="admin-incident-top">
          <div>
            <h4>${incident.title}</h4>
            <p>${incident.description}</p>
          </div>
          <span class="severity-chip ${incident.severity.toLowerCase()}">${incident.severity}</span>
        </div>
        <div class="admin-incident-meta">
          <span class="admin-meta-chip">${incident.type}</span>
          <span class="admin-meta-chip">${incident.location}</span>
          <span class="admin-meta-chip">By ${incident.reporterName}</span>
          <span class="admin-meta-chip">${getRoleLabel(incident.reporterRole)}</span>
        </div>
        <div class="admin-incident-grid">
          <div>
            <label class="auth-label">Approval</label>
            <select class="form-control admin-approval-select">
              <option value="pending" ${selectedApproval === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="approved" ${selectedApproval === 'approved' ? 'selected' : ''}>Approved</option>
              <option value="rejected" ${selectedApproval === 'rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
          <div>
            <label class="auth-label">Progress Status</label>
            <select class="form-control admin-status-select">
              <option value="Submitted" ${selectedStatus === 'Submitted' ? 'selected' : ''}>Submitted</option>
              <option value="Approved" ${selectedStatus === 'Approved' ? 'selected' : ''}>Approved</option>
              <option value="In Progress" ${selectedStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Resolved" ${selectedStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>
              <option value="Rejected" ${selectedStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
          <div>
            <label class="auth-label">Progress %</label>
            <input type="number" class="form-control admin-progress-input" min="0" max="100" value="${progress}">
          </div>
          <div>
            <label class="auth-label">Admin Note</label>
            <textarea class="form-control admin-note-input" placeholder="Write admin action, approval reason, or next step">${incident.adminNote || ''}</textarea>
          </div>
        </div>
        <div class="admin-progress-line">
          <div class="progress"><div class="progress-bar bg-success" style="width: ${progress}%"></div></div>
          <div class="admin-progress-copy">
            <span>Current progress</span>
            <strong>${progress}%</strong>
          </div>
        </div>
        <div class="d-grid mt-3">
          <button type="button" class="btn btn-premium admin-save-incident-btn">Save Approval & Progress</button>
        </div>
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
      const currentUser = getCurrentUser();
      const query = currentUser ? `?viewerId=${encodeURIComponent(currentUser.id)}` : '';
      const data = await apiRequest(`/incidents${query}`);
      reportList.innerHTML = data.incidents.map(renderIncidentCard).join('');
      if (reportCount) {
        reportCount.textContent = `${data.incidents.length} Reports`;
      }
    } catch (error) {
      const currentUser = getCurrentUser();
      const incidents = listDemoIncidentsForViewer(currentUser);
      reportList.innerHTML = incidents.length
        ? incidents.map(renderIncidentCard).join('')
        : '<div class="report-item"><p>No reports available yet.</p></div>';
      if (reportCount) reportCount.textContent = `${incidents.length} Reports`;
    }
  }

  async function loadValidationQueue() {
    if (!validationList) return;

    try {
      const currentUser = getCurrentUser();
      const query = currentUser?.role === 'Admin' ? `?adminId=${encodeURIComponent(currentUser.id)}` : '';
      const data = await apiRequest(`/validations${query}`);
      validationList.innerHTML = data.pendingAuthorities.length
        ? data.pendingAuthorities.map(renderValidationCard).join('')
        : '<div class="report-item"><p>No pending authority validations.</p></div>';
      if (pendingValidationCount) {
        pendingValidationCount.textContent = `${data.pendingAuthorities.length} Pending`;
      }
    } catch (error) {
      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== 'Admin') {
        validationList.innerHTML = '<div class="report-item"><p>Login as admin to review authority approvals.</p></div>';
        if (pendingValidationCount) pendingValidationCount.textContent = 'Admin Only';
        return;
      }

      const pendingAuthorities = getDemoUsers().filter(
        (user) => user.role === 'Authority' && user.status === 'pending'
      );
      validationList.innerHTML = pendingAuthorities.length
        ? pendingAuthorities.map(renderValidationCard).join('')
        : '<div class="report-item"><p>No pending authority validations.</p></div>';
      if (pendingValidationCount) pendingValidationCount.textContent = `${pendingAuthorities.length} Pending`;
    }
  }

  async function loadAdminWorkbench() {
    if (!adminIncidentList) return;

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'Admin') {
      adminIncidentList.innerHTML = '';
      return;
    }

    try {
      const data = await apiRequest(`/incidents?viewerId=${encodeURIComponent(currentUser.id)}`);
      adminIncidentList.innerHTML = data.incidents.length
        ? data.incidents.map(renderAdminIncidentCard).join('')
        : '<div class="report-item"><p>No user reports available for admin action yet.</p></div>';
      if (adminIncidentCount) {
        adminIncidentCount.textContent = `${data.incidents.length} Reports`;
      }
    } catch (error) {
      const incidents = listDemoIncidentsForViewer(currentUser);
      adminIncidentList.innerHTML = incidents.length
        ? incidents.map(renderAdminIncidentCard).join('')
        : '<div class="report-item"><p>No user reports available for admin action yet.</p></div>';
      if (adminIncidentCount) adminIncidentCount.textContent = `${incidents.length} Reports`;
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

  authSwitchLinks.forEach((switcher) => {
    switcher.addEventListener('click', function () {
      switchAuthTab(this.dataset.authTarget);
    });
  });

  loginModeButtons.forEach((button) => {
    button.addEventListener('click', function () {
      setLoginMode(this.dataset.loginMode);
    });
  });

  document.querySelectorAll('.password-toggle').forEach((toggle) => {
    toggle.addEventListener('click', function () {
      const targetId = this.dataset.togglePassword;
      const input = document.getElementById(targetId);
      if (!input) return;
      const makeVisible = input.type === 'password';
      input.type = makeVisible ? 'text' : 'password';
      this.textContent = makeVisible ? 'Hide' : 'Show';
    });
  });

  limitPhoneLikeInput(document.getElementById('signupPhone'));
  limitPhoneLikeInput(document.getElementById('forgotIdentifier'));
  limitPhoneLikeInput(document.getElementById('loginIdentifier'));

  if (openAuthModal) {
    openAuthModal.addEventListener('click', function () {
      setLoginMode('user');
      showAuthModal('loginFormWrap');
    });
  }

  if (openAdminModal) {
    openAdminModal.addEventListener('click', function () {
      setLoginMode('admin');
      showAuthModal('loginFormWrap');
    });
  }

  authPopupTriggers.forEach((trigger) => {
    trigger.addEventListener('click', function () {
      if (this.id === 'openAuthModal' || this.id === 'openAdminModal') {
        return;
      }
      if (this.id !== 'openAdminModal') {
        setLoginMode('user');
      }
      showAuthModal(this.dataset.authOpen || 'loginFormWrap');
    });
  });

  if (loginNavLink) {
    loginNavLink.addEventListener('click', function (event) {
      if (!window.location.pathname.endsWith('/report.html') && !window.location.pathname.endsWith('report.html')) {
        return;
      }
      event.preventDefault();
      setLoginMode('user');
      showAuthModal('loginFormWrap');
    });
  }

  if (signupNavLink) {
    signupNavLink.addEventListener('click', function (event) {
      if (!window.location.pathname.endsWith('/report.html') && !window.location.pathname.endsWith('report.html')) {
        return;
      }
      event.preventDefault();
      setLoginMode('user');
      showAuthModal('signupFormWrap');
    });
  }

  if (closeAuthModal) {
    closeAuthModal.addEventListener('click', hideAuthModal);
  }

  if (authModalBackdrop) {
    authModalBackdrop.addEventListener('click', hideAuthModal);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && authModalShell && !authModalShell.classList.contains('d-none')) {
      hideAuthModal();
    }
  });

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
        upsertDemoUser({ ...data.user, password: signupPassword });
        signupForm.reset();
        updateAccessState();
        showStatus(authMessage, data.message, true);
        hideAuthModal();
        await loadValidationQueue();
        await loadIncidents();
        await loadAdminWorkbench();
      } catch (error) {
        const fallbackUser = {
          id: createDemoId('user'),
          role: $('#signupRole').val(),
          name: $('#signupName').val().trim(),
          email: signupEmail,
          phone: signupPhone,
          location: $('#signupLocation').val().trim(),
          password: signupPassword,
          status: $('#signupRole').val() === 'Authority' ? 'pending' : 'approved',
        };
        const normalizedFallbackUser = upsertDemoUser(fallbackUser);
        setCurrentUser(normalizedFallbackUser);
        signupForm.reset();
        updateAccessState();
        showStatus(authMessage, 'Demo account created successfully. Ab aapka account local demo mode me bhi ready hai.', true);
        hideAuthModal();
        await loadIncidents();
        await loadValidationQueue();
        await loadAdminWorkbench();
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

        if (selectedLoginMode === 'admin' && data.user.role !== 'Admin') {
          showStatus(authMessage, 'Ye admin account nahi hai. User login use karo.', false);
          return;
        }

        if (selectedLoginMode === 'user' && data.user.role === 'Admin') {
          showStatus(authMessage, 'Admin account ke liye Admin Login use karo.', false);
          return;
        }

        setCurrentUser(data.user);
        upsertDemoUser({ ...data.user, password: $('#loginPassword').val().trim() });
        loginForm.reset();
        updateAccessState();
        showStatus(authMessage, data.message, true);
        hideAuthModal();
        await loadIncidents();
        await loadValidationQueue();
        await loadAdminWorkbench();
      } catch (error) {
        const demoUser = findDemoUser(identifier);
        const password = $('#loginPassword').val().trim();

        if (!demoUser) {
          showStatus(authMessage, error.message || 'Account not found. Please signup first.', false);
          return;
        }

        if (demoUser.password !== password) {
          showStatus(authMessage, 'Password not matched. Forgot Password se reset kar lo.', false);
          return;
        }

        if (selectedLoginMode === 'admin' && demoUser.role !== 'Admin') {
          showStatus(authMessage, 'Ye admin account nahi hai. Admin Login ke liye admin credentials use karo.', false);
          return;
        }

        if (selectedLoginMode === 'user' && demoUser.role === 'Admin') {
          showStatus(authMessage, 'Admin account ke liye Admin Login use karo.', false);
          return;
        }

        setCurrentUser(demoUser);
        loginForm.reset();
        updateAccessState();
        showStatus(authMessage, 'Demo login successful.', true);
        hideAuthModal();
        await loadIncidents();
        await loadValidationQueue();
        await loadAdminWorkbench();
      }
    });
  }

  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', function () {
      openForgotPasswordPanel();
    });
  }

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', function () {
      resetForgotPasswordState();
      switchAuthTab('loginFormWrap');
      showStatus(authMessage, 'Login panel ready. Reset password ke baad naya password use karo.', true);
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const identifier = $('#forgotIdentifier').val().trim();
      const demoUser = findDemoUser(identifier);

      if (!demoUser) {
        showStatus(authMessage, 'Is email ya phone number se koi demo account nahi mila. Pehle signup karo.', false);
        return;
      }

      pendingResetIdentifier = identifier;
      pendingResetOtp = String(Math.floor(100000 + Math.random() * 900000));
      if (demoOtpValue) demoOtpValue.textContent = pendingResetOtp;
      if (demoOtpBox) demoOtpBox.classList.remove('d-none');
      if (otpVerificationForm) otpVerificationForm.classList.remove('d-none');
      showStatus(authMessage, 'Demo OTP generate ho gaya. Niche dikh raha OTP enter karke password reset karo.', true);
    });
  }

  if (otpVerificationForm) {
    otpVerificationForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!pendingResetOtp || !pendingResetIdentifier) {
        showStatus(authMessage, 'Pehle demo OTP generate karo.', false);
        return;
      }

      const enteredOtp = $('#otpCode').val().trim();
      const newPassword = $('#resetPassword').val().trim();
      const confirmPassword = $('#resetConfirmPassword').val().trim();

      if (enteredOtp !== pendingResetOtp) {
        showStatus(authMessage, 'OTP galat hai. Demo OTP box me jo code hai wahi dalo.', false);
        return;
      }

      if (newPassword.length < 6) {
        showStatus(authMessage, 'New password kam se kam 6 characters ka hona chahiye.', false);
        return;
      }

      if (newPassword !== confirmPassword) {
        showStatus(authMessage, 'New password aur confirm password match nahi kar rahe.', false);
        return;
      }

      const users = getDemoUsers();
      const targetIndex = users.findIndex((user) => {
        const emailMatch = (user.email || '').toLowerCase() === pendingResetIdentifier.toLowerCase();
        const phoneMatch = normalizePhone(user.phone) === normalizePhone(pendingResetIdentifier);
        return emailMatch || phoneMatch;
      });

      if (targetIndex === -1) {
        showStatus(authMessage, 'Demo account missing hai. Dobara signup karke try karo.', false);
        return;
      }

      users[targetIndex] = { ...users[targetIndex], password: newPassword };
      saveDemoUsers(users);
      setCurrentUser(users[targetIndex]);
      resetForgotPasswordState();
      switchAuthTab('loginFormWrap');
      showStatus(authMessage, 'Password reset successful. Ab naya password use karke login ho gaya hai.', true);
      hideAuthModal();
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

      loadIncidents();
      loadValidationQueue();
      loadAdminWorkbench();
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
        await loadAdminWorkbench();
      } catch (error) {
        showStatus(reportMessage, error.message, false);
        try {
          createDemoIncident(
            {
              title: $('#incidentTitle').val().trim(),
              type: $('#incidentType').val(),
              location: $('#incidentLocation').val().trim(),
              severity: $('#incidentSeverity').val(),
              description: $('#incidentDescription').val().trim(),
            },
            currentUser
          );
          incidentReportForm.reset();
          showStatus(reportMessage, 'Incident report demo mode me submit ho gaya. Admin ab ise review kar sakta hai.', true);
          await loadIncidents();
          await loadAdminWorkbench();
        } catch (demoError) {
          showStatus(reportMessage, demoError.message, false);
        }
      }
    });
  }

  if (validationList) {
    validationList.addEventListener('click', async function (event) {
      const button = event.target.closest('.validate-btn');
      if (!button) return;
      const currentUser = getCurrentUser();

      try {
        const data = await apiRequest(`/validations/${button.dataset.id}/approve`, {
          method: 'PATCH',
          body: JSON.stringify({
            adminId: currentUser?.id,
          }),
        });
        showStatus(validationMessage, data.message, true);

        if (currentUser && currentUser.id === data.user._id) {
          setCurrentUser({ ...currentUser, status: 'approved' });
          updateAccessState();
        }

        await loadValidationQueue();
        await loadAdminWorkbench();
      } catch (error) {
        try {
          const approvedUser = approveDemoAuthority(button.dataset.id);
          showStatus(validationMessage, `${approvedUser.name} approved in demo mode.`, true);
          await loadValidationQueue();
          await loadAdminWorkbench();
        } catch (demoError) {
          showStatus(validationMessage, demoError.message || error.message, false);
        }
      }
    });
  }

  if (adminIncidentList) {
    adminIncidentList.addEventListener('click', async function (event) {
      const button = event.target.closest('.admin-save-incident-btn');
      if (!button) return;

      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== 'Admin') {
        showStatus(adminIncidentMessage, 'Only admin can update report approvals and progress.', false);
        return;
      }

      const card = button.closest('.admin-incident-card');
      const incidentId = card?.dataset.incidentId;
      if (!card || !incidentId) return;

      const approvalStatus = card.querySelector('.admin-approval-select')?.value;
      const status = card.querySelector('.admin-status-select')?.value;
      const progressPercent = Number(card.querySelector('.admin-progress-input')?.value || 0);
      const adminNote = card.querySelector('.admin-note-input')?.value || '';

      try {
        const data = await apiRequest(`/incidents/${incidentId}/admin-update`, {
          method: 'PATCH',
          body: JSON.stringify({
            adminId: currentUser.id,
            approvalStatus,
            status,
            progressPercent,
            adminNote,
          }),
        });

        showStatus(adminIncidentMessage, data.message, true);
        await loadIncidents();
        await loadAdminWorkbench();
      } catch (error) {
        try {
          updateDemoIncident(
            incidentId,
            {
              approvalStatus,
              status,
              progressPercent,
              adminNote,
            },
            currentUser
          );
          showStatus(adminIncidentMessage, 'Incident progress demo mode me save ho gaya.', true);
          await loadIncidents();
          await loadAdminWorkbench();
        } catch (demoError) {
          showStatus(adminIncidentMessage, demoError.message || error.message, false);
        }
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

  ensureDemoSeedData();
  updateAccessState();
  setLoginMode('user');
  loadIncidents();
  loadValidationQueue();
  loadAdminWorkbench();
  loadUpdates();
  loadDonations();
});
