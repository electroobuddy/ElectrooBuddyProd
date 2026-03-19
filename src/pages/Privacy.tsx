import Section from "@/components/Section";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const Privacy = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

      .privacy-hero {
        position: relative;
        padding: 96px 0 80px;
        overflow: hidden;
        background: hsl(var(--background));
        text-align: center;
        font-family: 'DM Sans', sans-serif;
      }

      .ph-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(hsl(var(--primary) / 0.035) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--primary) / 0.035) 1px, transparent 1px);
        background-size: 60px 60px;
        mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
      }

      .ph-glow {
        position: absolute;
        top: -80px; left: 50%;
        transform: translateX(-50%);
        width: 500px; height: 350px;
        background: radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%);
        pointer-events: none;
      }

      .ph-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 18px;
        border: 1px solid hsl(var(--border) / 0.3);
        border-radius: 100px;
        background: hsl(var(--primary) / 0.06);
        margin-bottom: 20px;
        font-size: 12px;
        font-weight: 600;
        color: hsl(var(--secondary));
        letter-spacing: 1px;
        text-transform: uppercase;
        font-family: 'Barlow Condensed', sans-serif;
      }

      .ph-title {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: clamp(44px, 6vw, 76px);
        font-weight: 900;
        line-height: 0.93;
        color: hsl(var(--foreground));
        text-transform: uppercase;
        letter-spacing: -1px;
      }

      .ph-title span {
        background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--electric-yellow-light)) 50%, hsl(var(--electric-blue-dark)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .ph-sub {
        color: hsl(var(--muted-foreground) / 0.5);
        font-size: 14px;
        margin-top: 14px;
        max-width: 340px;
        margin-left: auto;
        margin-right: auto;
      }

      /* Privacy content */
      .privacy-content-wrap {
        max-width: 900px;
        margin: 0 auto;
        font-family: 'DM Sans', sans-serif;
      }

      .privacy-section {
        margin-bottom: 48px;
      }

      .privacy-section:last-child {
        margin-bottom: 0;
      }

      .privacy-h1 {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: 32px;
        font-weight: 800;
        text-transform: uppercase;
        color: hsl(var(--foreground));
        margin-bottom: 16px;
        letter-spacing: 0.5px;
      }

      .privacy-h2 {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: 26px;
        font-weight: 700;
        text-transform: uppercase;
        color: hsl(var(--foreground));
        margin: 32px 0 16px;
        letter-spacing: 0.4px;
      }

      .privacy-h3 {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: 22px;
        font-weight: 700;
        text-transform: uppercase;
        color: hsl(var(--foreground));
        margin: 24px 0 12px;
        letter-spacing: 0.3px;
      }

      .privacy-h4 {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: hsl(var(--foreground));
        margin: 20px 0 10px;
        letter-spacing: 0.3px;
      }

      .privacy-meta {
        font-size: 14px;
        color: hsl(var(--muted-foreground) / 0.6);
        margin-bottom: 24px;
        line-height: 1.8;
      }

      .privacy-intro {
        font-size: 15px;
        color: hsl(var(--muted-foreground) / 0.7);
        line-height: 1.8;
        margin-bottom: 20px;
      }

      .privacy-list {
        list-style: none;
        padding-left: 0;
        margin: 16px 0;
      }

      .privacy-list li {
        position: relative;
        padding-left: 28px;
        margin-bottom: 12px;
        font-size: 14px;
        color: hsl(var(--muted-foreground) / 0.7);
        line-height: 1.7;
      }

      .privacy-list li::before {
        content: '•';
        position: absolute;
        left: 8px;
        color: hsl(var(--secondary));
        font-weight: bold;
        font-size: 18px;
      }

      .privacy-sub-list {
        list-style: none;
        padding-left: 24px;
        margin: 12px 0;
      }

      .privacy-sub-list li {
        position: relative;
        padding-left: 20px;
        margin-bottom: 8px;
        font-size: 14px;
        color: hsl(var(--muted-foreground) / 0.6);
        line-height: 1.6;
      }

      .privacy-sub-list li::before {
        content: '-';
        position: absolute;
        left: 0;
        color: hsl(var(--secondary) / 0.6);
        font-weight: normal;
      }

      .privacy-email-link {
        color: hsl(var(--secondary));
        text-decoration: none;
        font-weight: 500;
        transition: opacity 0.2s;
      }

      .privacy-email-link:hover {
        opacity: 0.75;
        text-decoration: underline;
      }

      .privacy-note-box {
        margin-top: 48px;
        padding: 24px 28px;
        background: hsl(var(--primary) / 0.04);
        border: 1px solid hsl(var(--border) / 0.3);
        border-radius: 14px;
        font-size: 13px;
        color: hsl(var(--muted-foreground) / 0.6);
        line-height: 1.7;
      }

      .privacy-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 14px;
      }

      .privacy-table th {
        background: hsl(var(--primary) / 0.08);
        color: hsl(var(--foreground));
        font-weight: 700;
        text-align: left;
        padding: 12px;
        border: 1px solid hsl(var(--border) / 0.3);
      }

      .privacy-table td {
        padding: 12px;
        border: 1px solid hsl(var(--border) / 0.3);
        color: hsl(var(--muted-foreground) / 0.7);
      }

      .privacy-table tr:nth-child(even) {
        background: hsl(var(--primary) / 0.02);
      }

      .privacy-contact-box {
        background: hsl(var(--card));
        border: 1px solid hsl(var(--border) / 0.3);
        border-radius: 14px;
        padding: 24px;
        margin-top: 24px;
      }

      .privacy-contact-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        font-size: 14px;
        color: hsl(var(--muted-foreground) / 0.7);
      }

      .privacy-contact-item a {
        color: hsl(var(--secondary));
        text-decoration: none;
        font-weight: 500;
      }

      .privacy-contact-item a:hover {
        text-decoration: underline;
      }
    `}</style>

    {/* Hero */}
    <section className="privacy-hero">
      <div className="ph-grid" />
      <div className="ph-glow" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="ph-badge"><ShieldCheck size={12} /> Legal</div>
          <h1 className="ph-title">Privacy <span>Policy</span></h1>
          <p className="ph-sub">Last updated: December 27, 2019</p>
        </motion.div>
      </div>
    </section>

    <Section>
      <div className="privacy-content-wrap">
        {/* Introduction */}
        <div className="privacy-section">
          <h1 className="privacy-h1">Electroobuddy Privacy Notices</h1>
          <p className="privacy-meta">
            Electroobuddy Corp ("Electroobuddy," "we" or "us") provides its users ("Users," "you" or "your") with a rich collection of resources and information, including, without limitation, the display of search results and services. Electroobuddy takes your privacy seriously and has created this Privacy Policy ("Privacy Policy") to help you understand how we collect, use and share your personal information and to assist you in exercising the privacy rights available to you.
          </p>
          <p className="privacy-intro">
            This Privacy Policy applies to personal information processed by us in our business, including on our websites, mobile applications, and other online offerings (collectively, the "Services").
          </p>
          <p className="privacy-intro">
            This Policy applies to all of our operating divisions, subsidiaries, and affiliates, as well as any additional division, subsidiary, or affiliate that we may subsequently form.
          </p>
        </div>

        {/* Section I */}
        <div className="privacy-section">
          <h2 className="privacy-h2">I. PERSONAL INFORMATION WE COLLECT</h2>
          <p className="privacy-intro">We may collect the following categories of information from users of our Services:</p>
          
          <h3 className="privacy-h3">Information from Interacting with our Services</h3>
          <p className="privacy-intro">
            When you access the Services, we may collect certain information automatically such as your Internet protocol (IP) address, user settings, MAC address, cookie identifiers, mobile carrier, mobile advertising and other unique identifiers, details about your browser, operating system or device, location information, Internet service provider, pages that you visit before, during and after using the Services, information about the links you click, and other information about how you use the Services. Information we collect may be associated with accounts and other devices.
          </p>
          <p className="privacy-intro">
            In addition, we may automatically collect data regarding your use of our Services, including the types of content you interact with and the frequency and duration of your activities. We may combine your information with information that other people provide when they use our Services, including information about you when they tag you.
          </p>

          <h3 className="privacy-h3">Information You Provide to Us</h3>
          <p className="privacy-intro"><strong>Your Communications with Us.</strong> We collect personal information from you such as email address, phone number, or mailing address when you request information about our Services, request customer or technical support, or otherwise communicate with us.</p>
          <ul className="privacy-list">
            <li><strong>Account Creation:</strong> We may now or in the future allow Users to create accounts. If you choose to sign up for a User account, we may collect your name, email address, username, and password.</li>
            <li><strong>Contacts:</strong> The contacts stored on your mobile device or tablet computer if you choose to provide access.</li>
            <li><strong>Surveys:</strong> We may contact you to participate in surveys. If you decide to participate, you may be asked to provide certain information which may include personal information.</li>
            <li><strong>Social Media Content:</strong> We may offer forums, blogs, or social media pages. Any content you provide on these channels will be considered "public" and is not subject to privacy protections.</li>
          </ul>

          <h3 className="privacy-h3">Information Collected Automatically or From Others</h3>
          <p className="privacy-intro">
            <strong>Cookies, Pixel Tags/Web Beacons, Analytics Information, and Interest-Based Advertising technologies.</strong> We, as well as third parties that provide content, advertising, or other functionality on the Services, may use cookies, pixel tags, local storage, and other technologies ("Technologies") to automatically collect information through the Services. Technologies are essentially small data files placed on your computer, tablet, mobile phone, or other devices that allow us and our partners to record certain pieces of information whenever you visit or interact with our Services.
          </p>
          <ul className="privacy-sub-list">
            <li><strong>Cookies:</strong> Cookies are small text files placed in visitors' computer browsers to store their preferences. Most browsers allow you to block and delete cookies. However, if you do that, the Services may not work properly.</li>
            <li><strong>Pixel Tags/Web Beacons:</strong> A pixel tag (also known as a web beacon) is a piece of code embedded in the Services that collects information about users' engagement on that web page. The use of a pixel allows us to record, for example, that a user has visited a particular web page or clicked on a particular advertisement.</li>
          </ul>
          <p className="privacy-intro">
            <strong>Analytics.</strong> We may also use Google Analytics and other service providers to collect information regarding visitor behavior and visitor demographics on our Services. For more information about Google Analytics, please visit www.google.com/policies/privacy/partners/. You can opt out of Google's collection and processing of data generated by your use of the Services by going to http://tools.google.com/dlpage/gaoptout.
          </p>
          <p className="privacy-intro">
            We may collect and use this analytics information together with your personal information to build a broader profile of our individual Users so that we can serve you better.
          </p>
          <p className="privacy-intro">
            <strong>Information from Other Sources.</strong> We may obtain information about you from other sources, including through third party services and organizations to supplement information provided by you. For example, if you access our Services through a third-party application, such as an app store, a third-party login service, or a social networking site, we may collect information about you from that third-party application that you have made public via your privacy settings. Information we collect through these services may include your name, your user identification number, your user name, location, gender, birth date, email, profile picture, and your contacts stored in that service. This supplemental information allows us to verify information that you have provided to us and to enhance our ability to provide you with information about our business, products, and Services.
          </p>
        </div>

        {/* Section II */}
        <div className="privacy-section">
          <h2 className="privacy-h2">II. HOW WE USE YOUR INFORMATION</h2>
          <p className="privacy-intro">We use your information for a variety of purposes, including to:</p>
          
          <h3 className="privacy-h3">Fulfill our contract with you and provide you with our Services, such as:</h3>
          <ul className="privacy-list">
            <li>Managing your information and accounts;</li>
            <li>Providing access to certain areas, functionalities, and features of our Services;</li>
            <li>Communicating with you about your account, activities on our Services and policy changes;</li>
            <li>If you provide your phone number and contact names stored on your mobile device or tablet computer, storing and using this information for purposes of identifying and informing you of those contacts who have also registered to use the services, along with such users' full names and user names;</li>
            <li>Undertaking activities to verify or maintain the quality or safety of a service or device;</li>
            <li>Processing your financial information and other payment methods for products or Services purchased;</li>
            <li>Providing advertising, analytics and marketing services;</li>
            <li>Providing Services on behalf of our customers, such as maintaining or servicing accounts, providing customer service, and verifying customer information; and</li>
            <li>Processing applications and transactions.</li>
          </ul>

          <h3 className="privacy-h3">Analyze and improve our Services pursuant to our legitimate interest, such as:</h3>
          <ul className="privacy-list">
            <li>Detecting security incidents, protecting against malicious, deceptive, fraudulent or illegal activity, and prosecuting those responsible for that activity;</li>
            <li>Measuring interest and engagement in our Services and short-term, transient use, such as contextual customization of ads;</li>
            <li>Undertaking research for technological development and demonstration;</li>
            <li>Researching and developing products, services, marketing or security procedures to improve their performance, resilience, reliability or efficiency;</li>
            <li>Improving, upgrading or enhancing our Services or device or those of our Providers;</li>
            <li>Developing new products and Services;</li>
            <li>Ensuring internal quality control;</li>
            <li>Verifying your identity and preventing fraud;</li>
            <li>Debugging to identify and repair errors that impair existing intended functionality;</li>
            <li>Enforcing our terms and policies; and</li>
            <li>Complying with our legal obligations, protecting your vital interest, or as may be required for the public good.</li>
          </ul>

          <h3 className="privacy-h3">Provide you with additional content and Services, such as:</h3>
          <ul className="privacy-list">
            <li>Furnishing you with newsletters, customized materials about offers, products, and Services that may be of interest, including new content or Services, via email or push notifications from our website;</li>
            <li>Auditing relating to interactions, transactions and other compliance activities; and</li>
            <li>Other purposes you consent to, are notified of, or are disclosed when you provide personal information.</li>
          </ul>

          <h3 className="privacy-h3">Automated profiling</h3>
          <p className="privacy-intro">
            We may use technologies considered automated decision making or profiling. We will not make automated decisions about you that would significantly affect you, unless such a decision is necessary as part of a contract we have with you, we have your consent, or we are permitted by law to use such technology. You may escalate any concerns you have by contacting us below.
          </p>

          <h3 className="privacy-h3">Use De-identified and Aggregated Information</h3>
          <p className="privacy-intro">
            We may use personal information and other data about you to create de-identified and aggregated information, such as de-identified demographic information, de-identified location information, information about the computer or device from which you access our Services, or other analyses we create.
          </p>

          <h3 className="privacy-h3">Process Information on Behalf of Our Customers</h3>
          <p className="privacy-intro">
            Our customers may choose to use our Services to process certain data of their own, which may contain personal information. The data that we process through our Services is processed by us on behalf of our customer, and our privacy practices will be governed by the contracts that we have in place with our customers, not this Privacy Policy.
          </p>
          <p className="privacy-intro">
            If you have any questions or concerns about how such data is handled or would like to exercise your rights, you should contact the person or entity who has contracted with us to use the Service to process this data. Our customers control the personal information in these cases and determine the security settings within the account, its access controls and credentials. We will, however, provide assistance to our customers to address any concerns you may have, in accordance with the terms of our contract with them.
          </p>

          <h3 className="privacy-h3">How We Use Automatic Collection Technologies</h3>
          <p className="privacy-intro">
            We, as well as third parties that provide content, advertising, or other functionality on the Services, may use cookies, pixel tags, local storage, and other technologies to automatically collect information through the Services. Our uses of these Technologies fall into the following general categories:
          </p>
          <ul className="privacy-list">
            <li><strong>Operationally Necessary.</strong> This includes Technologies that allow you access to our Services, applications, and tools that are required to identify irregular site behavior, prevent fraudulent activity and improve security or that allow you to make use of our functionality;</li>
            <li><strong>Performance Related.</strong> We may use Technologies to assess the performance of our Services, including as part of our analytic practices to help us understand how our visitors use the Services;</li>
            <li><strong>Functionality Related.</strong> We may use Technologies that allow us to offer you enhanced functionality when accessing or using our Services. This may include identifying you when you sign into our Services or keeping track of your specified preferences, interests, or past items viewed;</li>
            <li><strong>Advertising or Targeting Related.</strong> We may use first party or third-party Technologies to deliver content, including ads relevant to your interests, on our Services or on third party sites.</li>
          </ul>

          <h3 className="privacy-h3">Cross-Device Tracking</h3>
          <p className="privacy-intro">
            Your browsing activity may be tracked across different websites and different devices or apps. For example, we may attempt to match your browsing activity on your mobile device with your browsing activity on your laptop. To do this our technology partners may share data, such as your browsing patterns, geo-location and device identifiers, and will match the information of the browser and devices that appear to be used by the same person.
          </p>

          <h3 className="privacy-h3">Notice Regarding Third Party Websites, Social Media Platforms and Software Development Kits</h3>
          <p className="privacy-intro">
            The Services may contain links to other websites, and other websites may reference or link to our website or other Services. These other websites are not controlled by us. We encourage our users to read the privacy policies of each website and application with which they interact. We do not endorse, screen or approve and are not responsible for the privacy practices or content of such other websites or applications. Visiting these other websites or applications is at your own risk.
          </p>
          <p className="privacy-intro">
            Our Services may include publicly accessible blogs, forums, social media pages, and private messaging features. By using such Services, you assume the risk that the personal information provided by you may be viewed and used by third parties for any number of purposes. In addition, social media buttons such as Google, Facebook, or Twitter (that might include widgets such as the "share this" button or other interactive mini-programs) may be on our site. These features may collect your IP address, which page you are visiting on our site, and may set a cookie to enable the feature to function properly. These social media features are either hosted by a third party or hosted directly on our site. Your interactions with these features apart from your visit to our site are governed by the privacy policy of the company providing it.
          </p>
          <p className="privacy-intro">
            We may use third party APIs and software development kits ("SDKs") as part of the functionality of our Services. APIs and SDKs may allow third parties including analytics and advertising partners to collect your personal information for various purposes including to provide analytics services and content that is more relevant to you. For more information about our use of APIs and SDKs, please contact us as set forth below.
          </p>
        </div>

        {/* Section III */}
        <div className="privacy-section">
          <h2 className="privacy-h2">III. DISCLOSING YOUR INFORMATION</h2>
          <p className="privacy-intro">Except as provided in this Policy, we do not share, disclose or sell your personal information. We may disclose personal information as follows:</p>
          <ul className="privacy-list">
            <li><strong>Service Providers.</strong> We may share any personal information we collect about you with our third-party service providers. The categories of service providers to whom we entrust personal information include: IT and related services; information and services; payment processors; customer service providers; and vendors to support the provision of the Services.</li>
            <li><strong>Business Partners.</strong> We may provide personal information to business partners with whom we jointly offer products or services. In such cases, our business partner's name will appear along with ours.</li>
            <li><strong>Affiliates.</strong> We may share personal information with our affiliated companies.</li>
            <li><strong>Advertising Partners.</strong> Through our Services, we may allow third party advertising partners to set Technologies and other tracking tools to collect information regarding your activities and your device (e.g., your IP address, mobile identifiers, page(s) visited, location, time of day). We may also combine and share such information and other information (such as demographic information and past purchase history) with third party advertising partners.</li>
            <li><strong>Disclosures to Protect Us or Others.</strong> We may access, preserve, and disclose any information we store associated with you to external parties if we, in good faith, believe doing so is required or appropriate to: comply with law enforcement or national security requests and legal process, such as a court order or subpoena; protect your, our or others' rights, property, or safety; enforce our policies or contracts; collect amounts owed to us; or assist with an investigation or prosecution of suspected or actual illegal activity.</li>
            <li><strong>Disclosure in the Event of Merger, Sale, or Other Asset Transfers.</strong> If we are involved in a merger, acquisition, financing due diligence, reorganization, bankruptcy, receivership, purchase or sale of assets, or transition of service to another provider, then your information may be sold or transferred as part of such a transaction, as permitted by law and/or contract.</li>
            <li><strong>International Data Transfers.</strong> You agree that all information processed by us may be transferred, processed, and stored anywhere in the world, including but not limited to, the United States or other countries, which may have data protection laws that are different from the laws where you live. We have taken appropriate safeguards to require that your personal information will remain protected and require our third-party service providers and partners to have appropriate safeguards as well. Further details can be provided upon request.</li>
          </ul>
        </div>

        {/* Section IV */}
        <div className="privacy-section">
          <h2 className="privacy-h2">IV. YOUR CHOICES</h2>
          <p className="privacy-intro"><strong>General.</strong> You have certain choices about your personal information. Where you have consented to the processing of your personal information, you may withdraw that consent at any time and prevent further processing by contacting us as described below. Even if you opt out, we may still collect and use non-personal information regarding your activities on our Services and for other legal purposes as described above.</p>
          
          <h3 className="privacy-h3">Email and Telephone Communications</h3>
          <p className="privacy-intro">
            If you receive an unwanted email from us, you can use the unsubscribe link found at the bottom of the email to opt out of receiving future emails. Note that you will continue to receive transaction-related emails regarding products or Services you have requested. We may also send you certain non-promotional communications regarding us and our Services, and you will not be able to opt out of those communications (e.g., communications regarding the Services or updates to our Terms or this Privacy Policy).
          </p>
          <p className="privacy-intro">
            We process requests to be placed on do-not-mail, do-not-phone and do-not-contact lists as required by applicable law.
          </p>

          <h3 className="privacy-h3">Mobile Devices</h3>
          <p className="privacy-intro">
            We may send you push notifications through our mobile application. You may at any time opt-out from receiving these types of communications by changing the settings on your mobile device. We may also collect location-based information if you use our mobile applications. You may opt-out of this collection by changing the settings on your mobile device.
          </p>

          <h3 className="privacy-h3">"Do Not Track"</h3>
          <p className="privacy-intro">
            Do Not Track ("DNT") is a privacy preference that users can set in certain web browsers. Please note that we do not respond to or honor DNT signals or similar mechanisms transmitted by web browsers.
          </p>

          <h3 className="privacy-h3">Cookies and Interest-Based Advertising</h3>
          <p className="privacy-intro">
            You may stop or restrict the placement of Technologies on your device or remove them by adjusting your preferences as your browser or device permits. The online advertising industry also provides websites from which you may opt out of receiving targeted ads from data partners and other advertising partners that participate in self-regulatory programs. You can access these and learn more about targeted advertising and consumer choice and privacy, at www.networkadvertising.org/managing/opt_out.asp, http://www.youronlinechoices.eu/, https://youradchoices.ca/choices/, and www.aboutads.info/choices/. To separately make choices for mobile apps on a mobile device, you can download DAA's AppChoices application from your device's app store. Alternatively, for some devices you may use your device's platform controls in your settings to exercise choice.
          </p>
          <p className="privacy-intro">
            Please note you must separately opt out in each browser and on each device. Advertisements on third party websites that contain the AdChoices link may have been directed to you based on information collected by advertising partners over time and across websites. These advertisements provide a mechanism to opt out of the advertising partners' use of this information for interest-based advertising purposes.
          </p>

          <h3 className="privacy-h3">Your Privacy Rights</h3>
          <p className="privacy-intro">
            In accordance with applicable law, you may have the right to:
          </p>
          <ul className="privacy-list">
            <li><strong>Access to/Portability of Personal Data</strong> about you consistent with legal requirements. In addition, you may have the right in some cases to receive or have your electronic Personal Data transferred to another party.</li>
            <li><strong>Request Correction</strong> of your personal information where it is inaccurate or incomplete. In some cases, we may provide self-service tools that enable you to update your personal information or we may refer you to the controller of your personal information who is able to make the correction.</li>
            <li><strong>Request Deletion</strong> of your personal information, subject to certain exceptions prescribed by law.</li>
            <li><strong>Request restriction of or object to</strong> processing of your personal information, including the right to opt in or opt out of the sale of your Personal Data to third parties, if applicable, where such requests are permitted by law.</li>
          </ul>
          <p className="privacy-intro">
            If you would like to exercise any of these rights, please contact us as set forth below. We will process such requests in accordance with applicable laws. To protect your privacy, we will take steps to verify your identity before fulfilling your request.
          </p>
        </div>

        {/* Section V */}
        <div className="privacy-section">
          <h2 className="privacy-h2">V. DATA RETENTION</h2>
          <p className="privacy-intro">
            We store the personal information we receive as described in this Privacy Policy for as long as you use our Services or as necessary to fulfill the purpose(s) for which it was collected, provide our Services, resolve disputes, establish legal defenses, conduct audits, pursue legitimate business purposes, enforce our agreements, and comply with applicable laws.
          </p>
        </div>

        {/* Section VI */}
        <div className="privacy-section">
          <h2 className="privacy-h2">VI. SECURITY OF YOUR INFORMATION</h2>
          <p className="privacy-intro">
            We take steps to ensure that your information is treated securely and in accordance with this Privacy Policy. Unfortunately, no system is 100% secure, and we cannot ensure or warrant the security of any information you provide to us. To the fullest extent permitted by applicable law, we do not accept liability for unintentional disclosure.
          </p>
          <p className="privacy-intro">
            By using the Services or providing personal information to us, you agree that we may communicate with you electronically regarding security, privacy, and administrative issues relating to your use of the Services. If we learn of a security system's breach, we may attempt to notify you electronically by posting a notice on the Services, by mail or by sending an e-mail to you.
          </p>
        </div>

        {/* Section VII */}
        <div className="privacy-section">
          <h2 className="privacy-h2">VII. CHILDREN'S INFORMATION</h2>
          <p className="privacy-intro">
            The Services are not directed to children under 17 (or other age as required by local law), and we do not knowingly collect personal information from children. If you learn that your child has provided us with personal information without your consent, you may contact us as set forth below. If we learn that we have collected any personal information in violation of applicable law, we will promptly take steps to delete such information and terminate the child's account.
          </p>
        </div>

        {/* Section VIII - California Privacy Laws */}
        <div className="privacy-section">
          <h2 className="privacy-h2">VIII. OTHER PROVISIONS</h2>
          
          <h3 className="privacy-h3">CALIFORNIA PRIVACY LAWS</h3>
          
          <h4 className="privacy-h4">"Shine the Light"</h4>
          <p className="privacy-intro">
            Users who are California residents have the right to request and obtain from us once a year, free of charge, a list of the Third Parties to whom we have disclosed their Personal Information (if any) for their direct marketing purposes in the prior calendar year, as well as the type of Personal Information disclosed to those parties.
          </p>

          <h4 className="privacy-h4">California Consumer Privacy Act ("CCPA")</h4>
          <p className="privacy-intro">
            The CCPA requires us to disclose the categories of personal information about consumers that we have disclosed for business purposes or sold, as that term is defined under the CCPA, in the past 12 months and to provide a mechanism to opt out of the sale of personal information.
          </p>
          <p className="privacy-intro">
            For a list of the categories of personal information we have disclosed about consumers for a business purpose in the past 12 months, please see below.
          </p>

          <table className="privacy-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Identifiers</strong></td>
                <td>A real name, alias, postal address, unique personal identifier, online identifier, Internet Protocol address, email address, account name, or other similar identifiers</td>
              </tr>
              <tr>
                <td><strong>Commercial information</strong></td>
                <td>Records of personal property, products or services purchased, obtained, or considered, or other purchasing or consuming histories or tendencies</td>
              </tr>
              <tr>
                <td><strong>Geolocation data</strong></td>
                <td>Physical location or movements</td>
              </tr>
              <tr>
                <td><strong>Internet or other electronic network activity</strong></td>
                <td>Browsing history, search history, information on a consumer's interaction with an internet website, application, or advertisement</td>
              </tr>
            </tbody>
          </table>

          <h4 className="privacy-h4">Personal Information Sold</h4>
          <p className="privacy-intro">
            For a list of the categories of personal information we have sold about consumers for a business purpose in the past 12 months:
          </p>

          <table className="privacy-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Identifiers</strong></td>
                <td>A real name, alias, postal address, unique personal identifier, online identifier, Internet Protocol address, email address, account name, or other similar identifiers</td>
              </tr>
              <tr>
                <td><strong>Commercial information</strong></td>
                <td>Records of personal property, products or services purchased, obtained, or considered, or other purchasing or consuming histories or tendencies</td>
              </tr>
              <tr>
                <td><strong>Internet or other electronic network activity</strong></td>
                <td>Browsing history, search history, information on a consumer's interaction with an internet website, application, or advertisement</td>
              </tr>
              <tr>
                <td><strong>Geolocation data</strong></td>
                <td>Physical location or movements</td>
              </tr>
              <tr>
                <td><strong>Inferences drawn from other personal information</strong></td>
                <td>Profile reflecting a consumer's preferences, characteristics, psychological trends, predispositions, behavior, attitudes, intelligence, abilities, and aptitudes</td>
              </tr>
            </tbody>
          </table>

          <p className="privacy-intro">
            To opt out of the sale of your personal information, as that term is defined under the CCPA, please contact us. Please note that you must separately opt out on each browser and each device. Additionally, if you clear your browser's cache, a new visitorId will be created for that browser and you will need to submit a new 'Do not sell' request.
          </p>

          <h4 className="privacy-h4">Supervisory Authority</h4>
          <p className="privacy-intro">
            If you are located in the European Economic Area or the UK, you have the right to lodge a complaint with a supervisory authority if you believe our processing of your personal information violates applicable law.
          </p>

          <h4 className="privacy-h4">Changes to Our Privacy Policy</h4>
          <p className="privacy-intro">
            We may revise this Privacy Policy from time to time in our sole discretion. If there are any material changes to this Privacy Policy, we will notify you as required by applicable law. You understand and agree that you will be deemed to have accepted the updated Privacy Policy if you continue to use the Services after the new Privacy Policy takes effect.
          </p>
        </div>

        {/* Contact Section */}
        <div className="privacy-section">
          <h2 className="privacy-h2">IX. CONTACT US</h2>
          <p className="privacy-intro">
            If you have any questions about our privacy practices or this Privacy Policy, or if you wish to submit a request to exercise your rights as detailed in this Privacy Policy, please contact us at:
          </p>
          
          <div className="privacy-contact-box">
            <div className="privacy-contact-item">
              <strong>Electroobuddy</strong>
            </div>
            <div className="privacy-contact-item">
              📍 <a href="https://goo.gl/maps/vXm1SiPr6QECoqbH7" target="_blank" rel="noopener noreferrer">05 Nagziri Dewas Road Ujjain (456010)</a>
            </div>
            <div className="privacy-contact-item">
              📞 <a href="tel:+917000395039">+91 7000395039</a>
            </div>
            <div className="privacy-contact-item">
              ✉️ <a href="mailto:electroobuddy@gmail.com">electroobuddy@gmail.com</a>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="privacy-note-box">
          <p>
            This policy was last updated in 2019. By using our services, you agree to the collection and use of information as described above. We reserve the right to update this policy at any time. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
          </p>
        </div>
      </div>
    </Section>
  </>
);

export default Privacy;