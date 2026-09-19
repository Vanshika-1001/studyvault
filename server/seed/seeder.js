const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

const User = require('../models/User');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const PYQ = require('../models/PYQ');
const Resource = require('../models/Resource');
const PracticeSession = require('../models/PracticeSession');

const {
  semestersData,
  subjectsData,
  pyqsDBMSData,
  sampleResourcesData,
} = require('./seedData');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/studyvault'
    );
    console.log(`[MongoDB Connected for Seeder]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Seeder Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Semester.deleteMany();
    await Subject.deleteMany();
    await PYQ.deleteMany();
    await Resource.deleteMany();
    await PracticeSession.deleteMany();

    console.log('Seeding Semesters (1 to 8)...');
    await Semester.insertMany(semestersData);

    console.log('Seeding Core CSE Subjects...');
    const createdSubjects = await Subject.insertMany(subjectsData);

    // Find DBMS subject ID
    const dbmsSubject = createdSubjects.find((s) => s.code === 'CS501');
    const osSubject = createdSubjects.find((s) => s.code === 'CS502');

    console.log('Seeding PYQs for DBMS...');
    const formattedPYQs = pyqsDBMSData.map((item) => ({
      ...item,
      subject: dbmsSubject._id,
      semester: 5,
    }));
    const createdPYQs = await PYQ.insertMany(formattedPYQs);

    console.log('Seeding Resources for DBMS...');
    const formattedResources = sampleResourcesData.map((res) => ({
      ...res,
      subject: dbmsSubject._id,
    }));
    const createdResources = await Resource.insertMany(formattedResources);

    console.log('Creating Admin and Student accounts...');
    // Create Admin
    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'Admin User',
      email: (process.env.ADMIN_EMAIL || 'admin@studyvault.edu').toLowerCase(),
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
      branch: 'CSE',
      semester: 5,
    });

    // Create Student with initial bookmarks
    const studentUser = await User.create({
      name: 'Rohan Sharma',
      email: 'student@studyvault.edu',
      password: 'Student@12345',
      role: 'student',
      branch: 'CSE',
      semester: 5,
      bookmarks: [
        {
          itemType: 'PYQ',
          itemId: createdPYQs[0]._id,
        },
        {
          itemType: 'PYQ',
          itemId: createdPYQs[1]._id,
        },
        {
          itemType: 'Resource',
          itemId: createdResources[0]._id,
        },
      ],
    });

    console.log('Creating initial sample practice session for student...');
    await PracticeSession.create({
      user: studentUser._id,
      subject: dbmsSubject._id,
      unit: 3,
      difficulty: 'Medium',
      questions: [
        {
          question: createdPYQs[0]._id,
          userStatus: 'correct',
          markedForRevision: false,
        },
        {
          question: createdPYQs[5]._id,
          userStatus: 'correct',
          markedForRevision: false,
        },
        {
          question: createdPYQs[12]._id,
          userStatus: 'incorrect',
          markedForRevision: true,
        },
      ],
      score: 2,
      totalQuestions: 3,
      accuracy: 67,
      timeTaken: 185,
    });

    console.log('====================================================');
    console.log('>>> SUCCESS: StudyVault Database Seeded Successfully!');
    console.log('====================================================');
    console.log('Accounts created:');
    console.log(`  Admin:   ${adminUser.email} / (Password: Admin@12345)`);
    console.log(`  Student: ${studentUser.email} / (Password: Student@12345)`);
    console.log(`Semesters: ${semestersData.length}`);
    console.log(`Subjects:  ${createdSubjects.length}`);
    console.log(`PYQs:      ${createdPYQs.length}`);
    console.log(`Resources: ${createdResources.length}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Semester.deleteMany();
    await Subject.deleteMany();
    await PYQ.deleteMany();
    await Resource.deleteMany();
    await PracticeSession.deleteMany();
    console.log('>>> All StudyVault data destroyed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Destroy Error]: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
