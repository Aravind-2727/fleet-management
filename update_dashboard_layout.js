#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of all page files that need to be updated
const pagesToUpdate = [
  'src/app/advances/page.js',
  'src/app/dashboard/page.js',
  'src/app/expenses/page.js',
  'src/app/payments/page.js',
  'src/app/reports/page.js',
  'src/app/settings/page.js',
  'src/app/settlements/page.js',
  'src/app/trips/page.js',
  'src/app/trips-management/page.js',
];

// Function to update a page file to use DashboardLayout
function updatePageFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file already imports DashboardLayout
  if (content.includes('DashboardLayout')) {
    console.log(`✓ ${filePath} already uses DashboardLayout`);
    return;
  }
  
  // Check if the file has its own Sidebar and Header
  const hasSidebar = content.includes('import Sidebar from');
  const hasHeader = content.includes('import Header from');
  
  if (!hasSidebar && !hasHeader) {
    console.log(`✓ ${filePath} does not have Sidebar/Header - no changes needed`);
    return;
  }
  
  // Replace the component structure
  let updatedContent = content;
  
  // Replace the component export
  updatedContent = updatedContent.replace(
    /export default function \w+\(.*?\) {/,
    'export default function DashboardPage({ user, onLogout }) {'
  );
  
  // Replace the function body to use DashboardLayout
  const dashboardLayoutWrapper = `
export default function DashboardPage({ user, onLogout }) {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <OriginalComponent />
    </DashboardLayout>
  );
}

// Original component (to be replaced)
OriginalComponent = () => {
  return <div>{/* Original component content */}</div>;
}`;
  
  // For now, let's just add a comment to indicate what needs to be done
  console.log(`⚠️ ${filePath} needs manual update to use DashboardLayout`);
}

// Process all pages
console.log('=== Updating pages to use DashboardLayout ===\n');

pagesToUpdate.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    updatePageFile(pagePath);
  } else {
    console.log(`❌ ${pagePath} does not exist`);
  }
});

console.log('\n=== Summary ===');
console.log('All pages need to be manually updated to use DashboardLayout.');
console.log('The DashboardLayout should wrap all page components.');
console.log('This will ensure consistent sidebar and header across all authenticated pages.');