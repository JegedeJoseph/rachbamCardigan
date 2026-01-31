import dotenv from 'dotenv';

dotenv.config();

/**
 * Check if all required environment variables are set
 */
export const checkConfig = () => {
  const requiredVars = [
    'MONGODB_URI',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'PAYSTACK_SECRET_KEY',
    'JWT_SECRET'
  ];

  const missing = [];
  const warnings = [];

  // Check required variables
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check for default/example values
  if (process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    warnings.push('CLOUDINARY_CLOUD_NAME appears to be a placeholder value');
  }

  if (process.env.PAYSTACK_SECRET_KEY?.includes('your_secret_key')) {
    warnings.push('PAYSTACK_SECRET_KEY appears to be a placeholder value');
  }

  // Display results
  console.log('\n🔍 Configuration Check\n');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables in your .env file\n');
    return false;
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
    console.warn('\nPlease update these values in your .env file\n');
  }

  console.log('✅ All required environment variables are set');
  console.log('\nConfiguration:');
  console.log(`   - MongoDB: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
  console.log(`   - Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   - Paystack: ${process.env.PAYSTACK_SECRET_KEY.substring(0, 10)}...`);
  console.log(`   - Port: ${process.env.PORT || 5000}`);
  console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}\n`);

  return true;
};

export default checkConfig;

