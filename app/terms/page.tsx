import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms of Service | APSTGA',
  description: 'Terms of Service for the APSTGA Membership Website',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ borderBottom: '4px solid #c9a227', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: 28, color: '#063d20', margin: '0 0 16px' }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: '#555', margin: '0' }}>Arunachal Pradesh Small Tea Growers Association</p>
      </div>

      <div style={{ lineHeight: 1.6, color: '#333' }}>
        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>1. Acceptance of Terms</h2>
        <p>By accessing and using the APSTGA website (the "Service"), you agree to be bound by these Terms of Service ("Terms"), including those referenced or hyperlinked herein. If you disagree with any part of the Terms, you may not access the Service.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>2. Membership</h2>
        <h3 style={{ marginTop: '8px' }}>2.1 Eligibility</h3>
        <p>Membership is open to small tea growers residing in Arunachal Pradesh who are engaged in tea cultivation and meet the association's criteria for membership.</p>
        <h3 style={{ marginTop: '8px' }}>2.2 Membership Application</h3>
        <p>All membership applications are subject to review and approval by the APSTGA Executive Committee. The Committee reserves the right to accept or reject any application at its discretion.</p>
        <h3 style={{ marginTop: '8px' }}>2.3 Membership Fees</h3>
        <p>Members are required to pay annual membership fees as determined by the Executive Committee from time to time. Failure to pay fees may result in suspension or cancellation of membership.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>3. Membership ID Cards</h2>
        <p>The APSTGA membership ID card is the property of the Association and is issued to approved members upon payment of applicable fees. The ID card must be carried by members when representing the association. Members are responsible for the safekeeping of their ID cards and must report lost or stolen cards immediately.</p>
        <p>ID cards are valid for one membership year (currently 4 years from date of issue) and must be renewed upon expiry.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>4. Use of Service</h2>
        <p>You agree to use the Service lawfully and in accordance with these Terms. You specifically agree not to:</p>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Upload, post, or transmit any content that is unlawful, harmful, defamatory, obscene, or infringing on any third party's rights</li>
          <li>Transmit any viruses, worms, or other malicious code</li>
          <li>Attempt to gain unauthorized access to any part of the Service or to any server connected to the Service</li>
          <li>Interfuse with the Service or any related services, including by any means of hacking, password "mining", or other illegitimate means</li>
          <li>Violate any applicable laws or regulations</li>
        </ul>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>5. Intellectual Property</h2>
        <p>The Service and its original content, features, and functionality are owned by APSTGA and are protected by international copyright, trademark, patent, trade secret and other intellectual property laws. The Service is protected by copyright as a collective work and/or compilation under Indian and other copyright laws. The compilation of all content on the Service is the exclusive property of APSTGA and protected by copyright law.</p>
        <p>The APSTGA logo, name, and associated names, marks, designs and slogans are the trademarks of APSTGA. All other trademarks not owned by APSTGA are the property of their respective owners.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>6. Termination</h2>
        <p>APSTGA may terminate your access to the Service at any time, without notice, for any reason or no reason, including if you breach the Terms. Upon termination, your right to use the Service will immediately cease. If you wish to terminate your own account, you may discontinue using the Service.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>7. Disclaimer</h2>
        <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any representations or warranties of any kind, either express or implied. APSTGA and its suppliers or licensors make no representations or warranties about the reliability, availability, performance, completeness, or timeliness of the Service or any information, software, products, or services obtained through the Service.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>8. Limitation of Liability</h2>
        <p>To the maximum extent permitted by applicable law, APSTGA shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or other intangible losses, resulting from (i) your access to or use of the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; or (iv) unauthorized access, use, or alteration of your transmissions or content.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>9. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflicts of law principles. Any dispute arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts located in Arunachal Pradesh, India.</p>

        <h2 style={{ color: '#0a5a2e', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginTop: '24px' }}>10. Contact</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
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