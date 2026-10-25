import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Privacy Policy | APSTGA',
  description: 'Privacy Policy for the APSTGA Membership Website',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ borderBottom: '4px solid #c9a227', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: 28, color: '#063d20', margin: '0 0 16px' }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: '#555', margin: '0' }}>Arunachal Pradesh Small Tea Growers Association</p>
      </div>

      <div style={{ lineHeight: 1.6, color: '#333' }}>
        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>1. Introduction</h2>
        <p>This Privacy Policy explains how the Arunachal Pradesh Small Tea Growers Association ("APSTGA", "we", "our", "us") collects, uses, discloses, and safeguards the information of users of the APSTGA website (the "Service").</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>2. Information We Collect</h2>
        <h3 style={{ marginTop: '8px' }}>2.1 Personal Data Collected</h3>
        <p>When you register as a grower member or use our services, we may collect the following personal data:</p>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Full name and father's name</li>
          <li>Date of birth (DOB)</li>
          <li>Gender</li>
          <li>Mobile phone number</li>
          <li>Email address</li>
          <li>Postal address (village, district, state)</li>
          <li>Aadhaar number (unique identification)</li>
          <li>PAN card number</li>
          <li>Bank account details (name, branch, IFSC code, account number)</li>
          <li>Photographs (passport-style photos, garden photos)</li>
          <li>Tea garden name and area</li>
          <li>Plantation year</li>
          <li>Organic certification status</li>
          <li>Tea variety grown</li>
          <li>Emergency contact information</li>
        </ul>

        <h3 style={{ marginTop: '8px' }}>2.2 Automatically Collected Data</h3>
        <p>We automatically collect certain information when you interact with our Service, including:</p>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>IP address and device information</li>
          <li>Browser type and version</li>
          <li>Pages visited and time spent on each page</li>
          <li>Referral sources</li>
          <li>Usage patterns and statistics</li>
        </ul>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>3. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>To register and manage your APSTGA membership</li>
          <li>To generate and provide membership ID cards</li>
          <li>To send administrative communications (notices, updates, events)</li>
          <li>To process payments and membership fees</li>
          <li>To improve our services and website</li>
          <li>To comply with legal and regulatory requirements</li>
          <li>To protect the rights, property, or safety of APSTGA, our members, or others</li>
        </ul>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>4. Information Sharing and Disclosure</h2>
        <p>We may share your information in the following circumstances:</p>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>With authorized government agencies as required by law</li>
          <li>With service providers who perform functions on our behalf (e.g., ID card generation, hosting)</li>
          <li>When we believe disclosure is necessary to comply with the law, respond to legal requests, or protect our rights</li>
          <li>With your consent or at your direction</li>
        </ul>
        <p>We do NOT sell your personal information to third parties.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>5. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Access your personal data and request corrections</li>
          <li>Request deletion of your personal data</li>
          <li>Withdraw consent at any time</li>
          <li>Receive your data in a structured, commonly used format</li>
          <li>lodge a complaint with the relevant data protection authority</li>
        </ul>
        <p>To exercise these rights, contact us at: aruntea1999@gmail.com</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>7. Cookies</h2>
        <p>We may use cookies and similar tracking technologies to enhance your experience, analyze usage, and serve targeted advertisements. You can control cookie preferences through your browser settings.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>8. Links to Other Sites</h2>
        <p>Our Service may contain links to third-party sites that are not operated by us. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>9. Changes to This Privacy Policy</h2>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>10. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <p style={{ margin: '16px 0' }}>
          <strong>Arunachal Pradesh Small Tea Growers Association</strong><br />
          Jollang, Itanagar, near central jail, Arunachal Pradesh 791113<br />
          Email: <a href="mailto:aruntea1999@gmail.com">aruntea1999@gmail.com</a><br />
          Phone: +91 6002453543
        </p>
      </div>
    </div>
  );
}