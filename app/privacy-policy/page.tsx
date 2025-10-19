import React from 'react';
import Navbar from '@/app/components/NavbarComponent';
import Footer from '@/app/components/Footer';
import { Shield, Lock, Eye, Database, UserCheck, Mail, Globe, AlertCircle, FileText, ExternalLink, MessageSquare, Copyright } from 'lucide-react';

export default function PrivacyPolicy() {
    const lastUpdated = "October 18, 2025";

    type SectionItem = {
        text: string;
        subtitle?: string;
    };

    type Section = {
        icon: React.ReactNode;
        title: string;
        content: SectionItem[];
    };

    const sections: Section[] = [
        {
            icon: <FileText className="w-6 h-6" />,
            title: "Acceptance of Terms",
            content: [
                {
                    text: "By browsing or using RedditRev.com, you acknowledge that you've read, understood, and accepted these Terms and Policies, including our Privacy Policy. If you do not agree with any section, please do not use this website."
                }
            ]
        },
        {
            icon: <Eye className="w-6 h-6" />,
            title: "Purpose of This Website",
            content: [
                {
                    text: "RedditRev.com is committed to offering in-depth product reviews, comparisons, and buying guides to help users make smarter purchasing decisions. Some of our content may contain affiliate links, primarily from Amazon. Our aim is to deliver reliable, helpful, and unbiased information."
                }
            ]
        },
        {
            icon: <ExternalLink className="w-6 h-6" />,
            title: "Affiliate Disclosure",
            content: [
                {
                    text: "RedditRev.com participates in the Amazon Associates Program. This means we may earn a small commission when you click on certain links and make a purchase at no extra cost to you. These commissions help keep the site running and allow us to continue creating valuable content."
                }
            ]
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: "Review Process",
            content: [
                {
                    text: "Our product reviews are the result of independent research, team analysis, and careful evaluation. We prioritize objectivity and transparency. However, we acknowledge that individual experiences may vary, and results are not guaranteed."
                }
            ]
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: "User Contributions",
            content: [
                {
                    text: "Visitors are welcome to leave comments and feedback across RedditRev.com. By engaging with the site, you agree to adhere to our Community Guidelines. We reserve the right to remove any content that violates these standards or is considered inappropriate."
                }
            ]
        },
        {
            icon: <Copyright className="w-6 h-6" />,
            title: "Copyright & Intellectual Property",
            content: [
                {
                    text: "All materials published on RedditRev.com — including text, images, logos, and graphics — are protected by copyright and intellectual property laws. Reproduction, redistribution, or republishing of any content without prior written permission is strictly prohibited."
                }
            ]
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: "Privacy Policy",
            content: [
                {
                    text: "We value your privacy. Please review our Privacy Policy to understand how your personal information is collected, used, and protected. By continuing to use RedditRev.com, you are consenting to these practices."
                }
            ]
        },
        {
            icon: <AlertCircle className="w-6 h-6" />,
            title: "Disclaimers",
            content: [
                {
                    text: "RedditRev.com is not responsible for the content, accuracy, or availability of any third-party websites linked from our platform."
                },
                {
                    text: "We do not endorse or guarantee the quality or reliability of any products or services linked through affiliate partnerships."
                },
                {
                    text: "All content on RedditRev.com is provided for informational purposes only and should not be treated as professional advice. Always consult with a qualified expert for specific recommendations."
                }
            ]
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: "Updates to Terms and Policies",
            content: [
                {
                    text: "We may update these Terms and Policies from time to time. All changes will be posted here on RedditRev.com. It's your responsibility to review this page periodically to stay informed of any updates."
                }
            ]
        },
        {
            icon: <Mail className="w-6 h-6" />,
            title: "Contact Us",
            content: [
                {
                    text: "Have questions, suggestions, or concerns? We'd love to hear from you. Email us at: contact@redditrev.com"
                }
            ]
        }
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white">
                {/* Header */}
                <div className="bg-gradient-to-b from-white to-white border-b border-[#FF5F1F]/30">
                    <div className="max-w-4xl mx-auto px-6 py-16">
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-[#FF5F1F]/10 p-4 rounded-full">
                                <Shield className="w-12 h-12 text-[#FF5F1F]" />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold text-black text-center mb-4">
                            Terms & <span className="text-[#FF5F1F]">Policies</span>
                        </h1>
                        <p className="text-gray-700 text-center text-lg">
                            Welcome to RedditRev.com. Please read through these terms and policies before using our site.
                        </p>
                        <p className="text-gray-500 text-center text-sm mt-4">
                            Last Updated: {lastUpdated}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-6 py-12">
                    {/* Introduction */}
                    <div className="mb-12 p-6 bg-[#FF5F1F]/5 rounded-xl border border-[#FF5F1F]/30">
                        <p className="text-gray-800 leading-relaxed">
                            We&apos;re glad you&apos;re here! Before you start exploring our content, please take a moment to read through the following terms and policies. By accessing or using RedditRev.com, you agree to abide by these guidelines. If you do not agree with any part of them, we kindly request that you discontinue using the site.
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl border border-[#FF5F1F]/30 overflow-hidden hover:border-[#FF5F1F] transition-all duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="bg-[#FF5F1F]/10 p-3 rounded-lg text-[#FF5F1F] flex-shrink-0">
                                            {section.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-black mb-4">
                                                {section.title}
                                            </h2>
                                            <div className="space-y-4">
                                                {section.content.map((item, idx) => (
                                                    <div key={idx}>
                                                        {item.subtitle && (
                                                            <h3 className="text-lg font-semibold text-[#FF5F1F] mb-2">
                                                                {item.subtitle}
                                                            </h3>
                                                        )}
                                                        <p className="text-gray-800 leading-relaxed">
                                                            {item.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-700 mb-6">
                            Have questions, suggestions, or concerns?
                        </p>
                        <a
                            href="mailto:contact@redditrev.com"
                            className="bg-[#FF5F1F] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#e85618] transition-colors inline-flex items-center gap-2"
                        >
                            <Mail className="w-5 h-5" />
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}