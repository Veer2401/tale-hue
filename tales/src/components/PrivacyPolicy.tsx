'use client';

import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export default function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-blue-200 text-lg">
            Last updated: November 7, 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-blue-100">
          {/* Introduction */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to TaleHue</h2>
            <p className="leading-relaxed">
              TaleHue is an AI-powered social platform that transforms your thoughts and ideas into stunning visual stories. 
              We are committed to protecting your privacy and ensuring transparency about how we collect, use, and protect your data.
            </p>
          </section>

          {/* What is TaleHue */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">About TaleHue</h2>
            <p className="leading-relaxed mb-4">
              TaleHue is a creative social platform where users can:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Create short stories (up to 150 characters) that come to life with AI-generated images</li>
              <li>Share their visual stories with a vibrant community</li>
              <li>Interact with other creators through likes and comments</li>
              <li>Explore trending content and discover inspiring stories</li>
              <li>Build their creative portfolio with unique AI-powered visuals</li>
            </ul>
          </section>

          {/* Data Collection */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">What Data We Collect</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-blue-200 mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address (for authentication)</li>
                  <li>Display name (chosen by you)</li>
                  <li>Profile photo (optional)</li>
                  <li>Bio (optional)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-200 mb-2">Content You Create</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Story text (up to 150 characters)</li>
                  <li>AI-generated images associated with your stories</li>
                  <li>Comments on stories</li>
                  <li>Likes and interactions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-200 mb-2">Usage Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Stories you create and publish</li>
                  <li>Stories you like or comment on</li>
                  <li>Profile views and interactions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-200 mb-2">Local Storage</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Draft stories (saved locally on your device)</li>
                  <li>Generated images (temporarily stored to preserve your work)</li>
                  <li>Authentication tokens (for keeping you signed in)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and maintain the TaleHue platform</li>
              <li>To generate AI-powered images based on your story prompts</li>
              <li>To display your content to other users in the community</li>
              <li>To enable social features (likes, comments, following)</li>
              <li>To improve our AI generation models and platform features</li>
              <li>To enforce our content moderation policies</li>
              <li>To communicate important updates about the service</li>
            </ul>
          </section>

          {/* Content Moderation */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Content Moderation</h2>
            
            <div className="space-y-4">
              <p className="leading-relaxed">
                We are committed to maintaining a safe, respectful, and creative environment for all users. 
                TaleHue employs automated content moderation to ensure community standards are upheld.
              </p>

              <div>
                <h3 className="text-xl font-semibold text-blue-200 mb-2">Automated Filtering</h3>
                <p className="leading-relaxed mb-2">
                  Our platform automatically scans story content before AI image generation to detect and block:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Inappropriate language and profanity</li>
                  <li>Sexual or adult content</li>
                  <li>Violence and graphic content</li>
                  <li>Hate speech and discriminatory language</li>
                  <li>Drug-related content</li>
                  <li>Other harmful or offensive material</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-200 mb-2">How It Works</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Content is checked in real-time before image generation</li>
                  <li>If inappropriate content is detected, you'll receive a clear warning message</li>
                  <li>No images are generated for flagged content</li>
                  <li>You can modify your story and try again with appropriate content</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-200 mb-2">Our Standards</h3>
                <p className="leading-relaxed">
                  We believe in fostering creativity while maintaining respect. Content that violates our 
                  community standards will not be published. Repeated violations may result in account restrictions.
                </p>
              </div>
            </div>
          </section>

          {/* Data Storage */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Data Storage & Security</h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                Your data is stored securely using industry-standard practices:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Firebase/Firestore:</strong> User accounts, stories, and interactions are stored in Google's secure cloud infrastructure</li>
                <li><strong>Encrypted Authentication:</strong> Your login credentials are encrypted and never stored in plain text</li>
                <li><strong>Local Storage:</strong> Draft content is stored only on your device for your convenience</li>
                <li><strong>AI Processing:</strong> Story prompts are sent to AI services (Pollinations, Gemini) only for image generation</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Data Sharing</h2>
            <div className="space-y-4">
              <p className="leading-relaxed mb-2">
                We share your data only in limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Public Content:</strong> Stories you publish are visible to all TaleHue users</li>
                <li><strong>AI Services:</strong> Story prompts are sent to third-party AI providers (Pollinations Flux Pro, Google Gemini) for image generation</li>
                <li><strong>Service Providers:</strong> We use Firebase/Google Cloud for hosting and authentication</li>
                <li><strong>Legal Requirements:</strong> We may disclose data if required by law</li>
              </ul>
              <p className="leading-relaxed mt-4 text-blue-200">
                <strong>We never sell your personal data to third parties.</strong>
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data and stories</li>
              <li>Edit or delete your stories at any time</li>
              <li>Update your profile information</li>
              <li>Delete your account and associated data</li>
              <li>Export your content</li>
              <li>Opt out of certain data collection practices</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
            <p className="leading-relaxed">
              TaleHue is intended for users aged 13 and above. We do not knowingly collect personal information 
              from children under 13. If we discover that a child under 13 has provided us with personal information, 
              we will delete such information immediately.
            </p>
          </section>

          {/* Updates to Policy */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. When we make changes, we will update the 
              "Last updated" date at the top of this page. We encourage you to review this policy periodically 
              to stay informed about how we protect your data.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-blue-950/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy or how we handle your data, please contact us 
              through the app or via email. We're committed to addressing your concerns and maintaining transparency.
            </p>
          </section>

          {/* Footer */}
          <div className="text-center pt-8 pb-4">
            <p className="text-blue-300 font-medium">
              Thank you for being part of the TaleHue community! �
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
