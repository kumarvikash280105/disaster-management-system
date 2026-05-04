const Incident = require('../models/Incident');
const Update = require('../models/Update');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function seedDefaults() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await User.findOne({ role: 'Admin' });
  if (!adminUser) {
    await User.create({
      role: 'Admin',
      name: 'System Admin',
      email: 'admin@cdms.in',
      phone: '9999999999',
      location: 'Central Command',
      passwordHash,
      status: 'approved',
    });
  }

  const userCount = await User.countDocuments();
  if (userCount === 1) {
    await User.insertMany([
      {
        role: 'Citizen',
        name: 'Demo Citizen',
        email: 'citizen@cdms.in',
        phone: '9876543210',
        location: 'Riverside',
        passwordHash,
        status: 'approved',
      },
      {
        role: 'Authority',
        name: 'Rohit Sharma',
        email: 'rohit.authority@cdms.in',
        phone: '9876501234',
        location: 'District Control Room',
        passwordHash,
        status: 'pending',
      },
      {
        role: 'Authority',
        name: 'Anita Verma',
        email: 'anita.authority@cdms.in',
        phone: '9876505678',
        location: 'Medical Response Unit',
        passwordHash,
        status: 'pending',
      },
    ]);
  }

  const updateCount = await Update.countDocuments();
  if (updateCount === 0) {
    await Update.insertMany([
      {
        location: 'Riverside',
        emergencyType: 'Flood',
        message: 'Evacuation support active and relief vans expected within 25 minutes.',
      },
      {
        location: 'Central Market',
        emergencyType: 'Road Block',
        message: 'Road clearance team deployed. Alternate diversion route shared with traffic police.',
      },
      {
        location: 'Hill View',
        emergencyType: 'Medical Emergency',
        message: 'First-aid unit moved to community school camp. Medicine refill dispatched.',
      },
    ]);
  }

  const incidentCount = await Incident.countDocuments();
  if (incidentCount === 0) {
    const reporter = await User.findOne({ email: 'citizen@cdms.in' });
    if (reporter) {
      await Incident.insertMany([
        {
          title: 'Water entered houses near Riverside Colony',
          type: 'Flood',
          location: 'Riverside Colony',
          severity: 'High',
          description: 'Residents are asking for evacuation help and dry ration support.',
          status: 'Approved',
          approvalStatus: 'approved',
          progressPercent: 55,
          adminNote: 'Relief team dispatched and evacuation vans are on the way.',
          updatedByAdminName: 'System Admin',
          reportedBy: reporter._id,
          reporterName: reporter.name,
          reporterRole: reporter.role,
        },
        {
          title: 'Tree fallen on main road after heavy wind',
          type: 'Road Block',
          location: 'Central Market',
          severity: 'Medium',
          description: 'Traffic is stuck and ambulance movement is becoming difficult.',
          status: 'In Progress',
          approvalStatus: 'approved',
          progressPercent: 70,
          adminNote: 'Road clearance team is working with traffic support.',
          updatedByAdminName: 'System Admin',
          reportedBy: reporter._id,
          reporterName: reporter.name,
          reporterRole: reporter.role,
        },
        {
          title: 'Need first-aid support at relief camp',
          type: 'Medical Emergency',
          location: 'Hill View',
          severity: 'Low',
          description: 'Minor injuries reported and volunteers need medicine stock.',
          status: 'Submitted',
          approvalStatus: 'pending',
          progressPercent: 15,
          adminNote: 'Awaiting admin review and medical unit assignment.',
          updatedByAdminName: 'System Admin',
          reportedBy: reporter._id,
          reporterName: reporter.name,
          reporterRole: reporter.role,
        },
      ]);
    }
  }
}

module.exports = seedDefaults;
