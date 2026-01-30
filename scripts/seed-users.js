// Seed script to create demo users
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://ptitarara:ptitarara@cluster0.xaaw1k7.mongodb.net/SecHomMap?retryWrites=true&w=majority&appName=Cluster0';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'management', 'maintenance'], default: 'student' },
  hostel: { type: String },
  block: { type: String },
  floor: { type: String },
  room: { type: String },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  karmaScore: { type: Number, default: 0 },
  badges: [String],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
}, { timestamps: true });

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', userSchema);

    const hashedPassword = await bcrypt.hash('password123', 12);

    const demoUsers = [
      {
        email: 'student@demo.com',
        password: hashedPassword,
        name: 'Demo Student',
        role: 'student',
        hostel: 'Boys Hostel A',
        block: 'A',
        floor: '2',
        room: '201',
        isActive: true,
        isVerified: true,
        karmaScore: 50,
        badges: ['early-adopter'],
        notificationPreferences: { email: true, push: true, sms: false },
      },
      {
        email: 'admin@demo.com',
        password: hashedPassword,
        name: 'Demo Admin',
        role: 'management',
        hostel: 'Main Office',
        block: 'Admin',
        floor: '1',
        room: '101',
        isActive: true,
        isVerified: true,
        karmaScore: 100,
        badges: ['admin'],
        notificationPreferences: { email: true, push: true, sms: true },
      },
      {
        email: 'staff@demo.com',
        password: hashedPassword,
        name: 'Demo Staff',
        role: 'maintenance',
        hostel: 'Maintenance Block',
        block: 'M',
        floor: 'G',
        room: 'G01',
        isActive: true,
        isVerified: true,
        karmaScore: 75,
        badges: ['top-performer'],
        notificationPreferences: { email: true, push: true, sms: false },
      },
    ];

    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`User ${userData.email} already exists, updating...`);
        await User.updateOne({ email: userData.email }, userData);
      } else {
        await User.create(userData);
        console.log(`Created user: ${userData.email}`);
      }
    }

    console.log('\\nDemo users created/updated successfully!');
    console.log('\\nLogin Credentials:');
    console.log('Student: student@demo.com / password123');
    console.log('Admin: admin@demo.com / password123');
    console.log('Staff: staff@demo.com / password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
