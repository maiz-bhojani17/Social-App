import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix for Windows & ISP DNS blocking MongoDB Atlas SRV query (querySrv ECONNREFUSED)
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // DNS fallback if environment restricts custom resolvers
}

export const connectDB = async () => {
  // Return early if already connected (vital for serverless & fast response)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  let uri = process.env.MONGO_URI;

  if (!uri || uri.includes('<db_password>')) {
    console.warn('\n⚠️ [DATABASE WARNING]: MONGO_URI in .env contains "<db_password>".');
    console.warn('⚠️ Please replace "<db_password>" with your actual MongoDB Atlas password.');
    console.warn('⚠️ Attempting fallback to local MongoDB instance (mongodb://127.0.0.1:27017/socialapp)...\n');
    uri = 'mongodb://127.0.0.1:27017/socialapp';
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // Detailed helpful guidance for SRV errors
    if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
      console.warn('\n💡 [DNS RESOLUTION ADVICE]:');
      console.warn('Your local Wi-Fi / ISP DNS is blocking MongoDB SRV records.');
      console.warn('1. Check MongoDB Atlas -> Network Access -> IP Access List: Ensure "0.0.0.0/0" (Allow from anywhere) is Active.');
      console.warn('2. Or switch Wi-Fi / Hotspot or use Google DNS (8.8.8.8) on your Windows network adapter.\n');
    } else {
      console.error('💡 Tip: Please check your MONGO_URI and password in "server/.env".\n');
    }
  }
};