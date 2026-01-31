import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

// Set longer timeout for the entire test suite
jest.setTimeout(60000);

// Before all tests, start the in-memory MongoDB server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'test'
    },
    binary: {
      downloadDir: './mongodb-binaries',
    }
  });
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
}, 120000); // 2 minute timeout for beforeAll

// After each test, clear the database
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// After all tests, close connections and stop the server
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
