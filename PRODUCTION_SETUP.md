# 🚀 Production Setup Guide

This guide will help you deploy your QR Menu SaaS application to production with all the necessary services configured.

## 📋 **Prerequisites**

Before deploying, you'll need accounts with these services:

1. **Supabase** (Database & Authentication)
2. **Cloudinary** (Image Storage)
3. **Resend** (Email Service)
4. **Vercel** (Hosting - recommended)

## 🗄️ **Step 1: Setup Supabase Database**

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### Run Database Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the content from `supabase-schema.sql`
4. Click **Run** to create all tables and policies

### Get API Keys
1. Go to **Settings** > **API**
2. Copy these values:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

## ☁️ **Step 2: Setup Cloudinary**

### Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to your dashboard

### Get API Keys
1. Copy these values from your dashboard:
   - `Cloud Name` → `CLOUDINARY_CLOUD_NAME`
   - `API Key` → `CLOUDINARY_API_KEY`
   - `API Secret` → `CLOUDINARY_API_SECRET`

### Create Upload Preset
1. Go to **Settings** > **Upload**
2. Click **Add upload preset**
3. Set preset name to `qr-menu-saas`
4. Set **Signing Mode** to `Unsigned`
5. Set **Folder** to `qr-menu-saas`
6. Save the preset

## 📧 **Step 3: Setup Resend Email**

### Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Go to **API Keys**

### Get API Key
1. Click **Create API Key**
2. Name it `QR Menu SaaS Production`
3. Copy the key → `RESEND_API_KEY`

### Verify Domain (Optional but Recommended)
1. Go to **Domains**
2. Add your domain
3. Follow DNS verification steps
4. Update `EMAIL_FROM` to use your domain

## 🚀 **Step 4: Deploy to Vercel**

### Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository

### Configure Environment Variables
Add these environment variables in Vercel dashboard:

```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-32-character-string
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM="QR Menu SaaS <noreply@yourdomain.com>"
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=qr-menu-saas
NODE_ENV=production
```

### Deploy
1. Click **Deploy**
2. Wait for deployment to complete
3. Your app will be live at `https://your-app.vercel.app`

## 🔧 **Step 5: Configure Custom Domain (Optional)**

### Add Domain in Vercel
1. Go to your project in Vercel
2. Click **Settings** > **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

### Update Environment Variables
1. Update `NEXT_PUBLIC_APP_URL` to your custom domain
2. Update `EMAIL_FROM` if using custom domain
3. Redeploy the application

## ✅ **Step 6: Test Your Production App**

### Test Basic Functionality
1. Visit your deployed app
2. Register a new account
3. Check email for verification
4. Create a test menu
5. Generate QR code
6. Scan QR code to view menu
7. Check analytics

### Test Email Delivery
1. Register with a real email address
2. Check spam folder if needed
3. Verify email verification works
4. Test password reset (if implemented)

## 📊 **Step 7: Monitor & Analytics**

### Supabase Monitoring
1. Check **Database** > **Tables** for data
2. Monitor **Auth** > **Users** for registrations
3. Use **SQL Editor** for custom queries

### Vercel Analytics
1. Enable Vercel Analytics in project settings
2. Monitor performance and usage
3. Check function logs for errors

### Cloudinary Usage
1. Monitor storage usage in dashboard
2. Check transformation usage
3. Optimize images if needed

## 🔒 **Security Checklist**

- ✅ Environment variables are secure
- ✅ Supabase RLS policies are enabled
- ✅ API keys are not exposed in frontend
- ✅ HTTPS is enabled (automatic with Vercel)
- ✅ Security headers are configured
- ✅ Email verification is working

## 🎯 **Performance Optimization**

### Vercel Optimizations
- Images are automatically optimized
- Static assets are cached
- Functions are serverless

### Database Optimizations
- Indexes are created for common queries
- RLS policies are optimized
- Connection pooling is handled by Supabase

### Cloudinary Optimizations
- Images are automatically compressed
- Responsive images are generated
- CDN delivery is global

## 💰 **Cost Estimation**

### Free Tier Limits
- **Supabase**: 500MB database, 50MB file storage
- **Cloudinary**: 25 credits/month (≈25k images)
- **Resend**: 3,000 emails/month
- **Vercel**: 100GB bandwidth, 1000 serverless functions

### Paid Plans (when needed)
- **Supabase Pro**: $25/month (8GB database)
- **Cloudinary Plus**: $89/month (100k transformations)
- **Resend Pro**: $20/month (50k emails)
- **Vercel Pro**: $20/month (unlimited bandwidth)

## 🚨 **Troubleshooting**

### Common Issues

**Database Connection Errors**
- Check Supabase URL and keys
- Verify RLS policies
- Check network connectivity

**Image Upload Failures**
- Verify Cloudinary credentials
- Check upload preset configuration
- Monitor Cloudinary usage limits

**Email Not Sending**
- Verify Resend API key
- Check domain verification
- Monitor email limits

**Deployment Failures**
- Check build logs in Vercel
- Verify environment variables
- Check for TypeScript errors

### Getting Help
1. Check Vercel function logs
2. Monitor Supabase logs
3. Check browser console for errors
4. Review this documentation
5. Check service status pages

## 🔄 **Maintenance**

### Regular Tasks
- Monitor usage across all services
- Update dependencies monthly
- Review security policies
- Backup database (Supabase handles this)
- Monitor performance metrics

### Scaling Considerations
- Database connection limits
- Serverless function timeouts
- Image storage costs
- Email sending limits

---

## 🎉 **You're Live!**

Your QR Menu SaaS application is now running in production with:
- ✅ Real database with Supabase
- ✅ Cloud image storage with Cloudinary  
- ✅ Email service with Resend
- ✅ Global deployment with Vercel
- ✅ Ready for real users and payments

**Next Steps:**
1. Set up monitoring and alerts
2. Implement payment system (Stripe)
3. Add advanced analytics
4. Consider multi-tenancy features

Need help? Check the troubleshooting section or create an issue in the repository.
