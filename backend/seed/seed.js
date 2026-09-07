require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { officer, citizens, complaintTemplates } = require('./seedData');

const DAY_MS = 1000 * 60 * 60 * 24;

async function destroy() {
  await connectDB();
  await Complaint.deleteMany();
  await User.deleteMany();
  console.log('[Seed] All users and complaints removed.');
  await mongoose.connection.close();
  process.exit(0);
}

async function seed() {
  await connectDB();

  console.log('[Seed] Clearing existing users and complaints...');
  await Complaint.deleteMany();
  await User.deleteMany();

  console.log('[Seed] Creating officer account...');
  const officerDoc = await User.create(officer);

  console.log(`[Seed] Creating ${citizens.length} citizen accounts...`);
  const citizenDocs = [];
  for (const citizen of citizens) {
    // Sequential creation (not Promise.all) so the pre-save password
    // hashing hook runs cleanly for each document.
    // eslint-disable-next-line no-await-in-loop
    const doc = await User.create(citizen);
    citizenDocs.push(doc);
  }

  console.log(`[Seed] Creating ${complaintTemplates.length} demo complaints...`);
  for (const template of complaintTemplates) {
    const createdAt = new Date(Date.now() - template.daysAgo * DAY_MS);
    const author = citizenDocs[template.citizenIndex];
    const upvoterIds = (template.upvoterIndexes || []).map((i) => citizenDocs[i]._id);

    const complaintData = {
      title: template.title,
      description: template.description,
      category: template.category,
      area: template.area,
      status: template.status,
      createdBy: author._id,
      creatorName: author.name,
      creatorEmail: author.email,
      upvotes: upvoterIds.length,
      upvotedBy: upvoterIds,
      officerRemark: template.officerRemark || '',
      createdAt,
      updatedAt: createdAt,
      feedbackPending: false,
      feedbackGiven: false,
      feedbackRating: null,
      feedbackComment: '',
    };

    if (template.status === 'resolved') {
      // Simulate the resolution happening a few days after filing.
      const resolvedAt = new Date(createdAt.getTime() + Math.min(template.daysAgo - 1, 3) * DAY_MS);
      complaintData.updatedAt = resolvedAt;

      if (template.feedback) {
        complaintData.feedbackGiven = true;
        complaintData.feedbackPending = false;
        complaintData.feedbackRating = template.feedback.rating;
        complaintData.feedbackComment = template.feedback.comment;
      } else {
        complaintData.feedbackPending = true;
      }
    }

    // eslint-disable-next-line no-await-in-loop
    await Complaint.create(complaintData);
  }

  console.log('[Seed] Done!');
  console.log('----------------------------------------');
  console.log('Demo accounts:');
  console.log(`  Officer -> email: ${officer.email} | password: ${officer.password}`);
  citizens.forEach((c) => {
    console.log(`  Citizen -> email: ${c.email} | password: ${c.password}`);
  });
  console.log('----------------------------------------');

  await mongoose.connection.close();
  process.exit(0);
}

if (process.argv.includes('--destroy')) {
  destroy().catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  });
} else {
  seed().catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  });
}
