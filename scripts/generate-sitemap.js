/**
 * Dynamic Sitemap Generator for Electroo Buddy
 * 
 * This script generates an XML sitemap including dynamic routes from the database
 * Run with: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// Base URL configuration
const BASE_URL = 'https://electroobuddy.com';

// Static routes with their metadata
const staticRoutes = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/services', changefreq: 'weekly', priority: '0.9' },
  { loc: '/products', changefreq: 'daily', priority: '0.9' },
  { loc: '/about', changefreq: 'monthly', priority: '0.8' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
  { loc: '/projects', changefreq: 'weekly', priority: '0.8' },
  { loc: '/booking', changefreq: 'monthly', priority: '0.7' },
  { loc: '/track-booking', changefreq: 'monthly', priority: '0.6' },
  { loc: '/faq', changefreq: 'weekly', priority: '0.7' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.5' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.5' },
];

// Helper function to format date
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Generate URL entry
function generateUrlEntry(route) {
  const today = new Date();
  
  return `  <url>
    <loc>${BASE_URL}${route.loc}</loc>
    <lastmod>${formatDate(today)}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
}

// Main sitemap generation function
async function generateSitemap() {
  console.log('🚀 Generating sitemap...');
  
  // Start XML structure
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;

  // Add static routes
  console.log('📄 Adding static routes...');
  staticRoutes.forEach(route => {
    sitemap += generateUrlEntry(route) + '\n';
  });

  // Note: For dynamic routes (products, services, projects),
  // you would fetch these from your Supabase database here
  // Example placeholder for dynamic content:
  
  /*
  try {
    // Fetch dynamic products
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true);
    
    if (products && products.length > 0) {
      products.forEach(product => {
        sitemap += generateUrlEntry({
          loc: `/products/${product.slug}`,
          changefreq: 'weekly',
          priority: '0.7',
          lastmod: product.updated_at
        }) + '\n';
      });
    }

    // Fetch dynamic services
    const { data: services } = await supabase
      .from('services')
      .select('slug, updated_at')
      .eq('is_active', true);
    
    if (services && services.length > 0) {
      services.forEach(service => {
        sitemap += generateUrlEntry({
          loc: `/services/${service.slug}`,
          changefreq: 'weekly',
          priority: '0.8'
        }) + '\n';
      });
    }
  } catch (error) {
    console.error('Error fetching dynamic routes:', error);
  }
  */

  // Close XML
  sitemap += '</urlset>\n';

  // Write to file
  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap, 'utf8');
  
  console.log('✅ Sitemap generated successfully!');
  console.log(`📍 Saved to: ${outputPath}`);
  console.log(`📊 Total routes: ${staticRoutes.length}`);
}

// Run the generator
generateSitemap().catch(console.error);
