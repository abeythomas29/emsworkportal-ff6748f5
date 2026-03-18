export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-foreground bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 18, 2026</p>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          Esoteric Mineral Solutions ("we", "our", or "us") operates the EMS Internal Portal. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">2. Information We Collect</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li><strong>Personal Information:</strong> Name, email address, phone number, employee ID, department, date of birth, and profile photo.</li>
          <li><strong>Attendance Data:</strong> Check-in/check-out times, work hours, and location data related to attendance.</li>
          <li><strong>Leave Records:</strong> Leave requests, leave balances, and approval history.</li>
          <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers for security purposes.</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>To manage employee attendance, leave, and work hour tracking.</li>
          <li>To authenticate and authorize access to the portal.</li>
          <li>To communicate important company updates and policy changes.</li>
          <li>To generate reports for HR and management purposes.</li>
          <li>To improve the functionality and user experience of the application.</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">4. Data Sharing & Disclosure</h2>
        <p className="text-muted-foreground leading-relaxed">
          We do not sell, trade, or rent your personal information to third parties. Your data may be shared with authorized management and HR personnel within the organization for operational purposes. We may disclose information if required by law or to protect the rights and safety of our employees and organization.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">5. Data Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          We implement industry-standard security measures including encryption, secure authentication, and role-based access controls to protect your personal information. However, no method of electronic transmission or storage is 100% secure.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">6. Children's Privacy</h2>
        <p className="text-muted-foreground leading-relaxed">
          This application is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete such information promptly.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">7. Your Rights</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Access and review your personal data stored in the system.</li>
          <li>Request correction of inaccurate information.</li>
          <li>Request deletion of your data, subject to legal and operational requirements.</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Continued use of the application after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">9. Contact Us</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions about this Privacy Policy, please contact the HR department at Esoteric Mineral Solutions.
        </p>
      </section>
    </div>
  );
}
