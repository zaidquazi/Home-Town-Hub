import mongoose from 'mongoose';
import { env } from './src/config/env';

async function test() {
  await mongoose.connect(env.MONGODB_URI, { dbName: process.env.DATABASE_NAME || 'hometown-hub' });
  const db = mongoose.connection.db!;
  const collections = await db.listCollections().toArray();
  console.log('Collections in DB:', collections.map(c => c.name));
  
  if (collections.some(c => c.name === 'users')) {
    const users = await db.collection('users').find({}).toArray();
    console.log(`Raw users count: ${users.length}`);
    if (users.length > 0) {
      console.log('Sample user email:', users[0].email, 'username:', users[0].username);
    }
  }
  process.exit(0);
}

test();
