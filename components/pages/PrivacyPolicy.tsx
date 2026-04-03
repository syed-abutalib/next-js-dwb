"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Shield, 
  Eye, 
  Database, 
  Cookie, 
  Mail, 
  Globe, 
  Lock, 
  Share2,
  FileText,
  Users,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Heart,
  Award,
  Sparkles,
  ShieldCheck,
  Fingerprint,
  Zap,
  BookOpen,
  Briefcase,
  Gamepad2,
  DollarSign
} from "lucide-react";

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const PrivacyPolicy = () => {
  const lastUpdated = "March 22, 2026";

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardHover = {
    whileHover: { 
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        {/* Animated gradients */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        ></motion.div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-all group"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
            >
              <Shield className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">Your Privacy Matters</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Privacy Policy
            </motion.h1>
            <motion.p 
              className="text-xl text-white/80 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We care about your information at Daily World Blog. This policy tells you how we gather, 
              use, and keep your information safe on our daily blog platform.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Navigation Cards */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {[
            { href: "#information", icon: Database, title: "Gathering Information", desc: "What we collect", color: "indigo" },
            { href: "#usage", icon: Eye, title: "How We Use Your Information", desc: "How we use data", color: "purple" },
            { href: "#cookies", icon: Globe, title: "Services from Other Companies", desc: "How we work", color: "pink" },
            { href: "#rights", icon: Users, title: "Keeping data safe", desc: "How we secure data", color: "blue" }
          ].map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <item.icon className={`w-6 h-6 text-${item.color}-600 mb-2 group-hover:scale-110 transition-transform duration-300`} />
              <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </motion.a>
          ))}
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 mb-8 border border-indigo-100"
        >
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Shield className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Commitment to Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                We care about your information at Daily World Blog. This policy tells you how we gather, 
                use, and keep your information safe on our daily blog platform.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Information We Collect */}
        <motion.div 
          id="information" 
          className="scroll-mt-24 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center"
            >
              <Database className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Gathering Information</h2>
          </div>
          
          <div className="space-y-6">
            <motion.div 
              whileHover={{ y: -3 }}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Direct Information
              </h3>
              <p className="text-gray-600 mb-4">
                When you interact with our website, we may collect:
              </p>
              <ul className="space-y-2 text-gray-600">
                {[
                  "Email address - when you subscribe to our newsletter",
                  "Name - when you comment or contact us",
                  "Browser information - to optimize your experience"
                ].map((item, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              whileHover={{ y: -3 }}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Data that is done automatically
              </h3>
              <p className="text-gray-600">
                We utilise cookies and analytics to keep track of how well our site is doing, just like other current blogs do. 
                This includes your IP address, the sort of browser you use, and the items you read the most, like GTA VI updates 
                or finance guides.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* How We Use Information */}
        <motion.div 
          id="usage" 
          className="scroll-mt-24 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center"
            >
              <Eye className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How We Use Your Information</h2>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              { icon: Share2, title: "Communication", desc: "To send out our daily 'Pulse' newsletter.", color: "indigo" },
              { icon: FileText, title: "Content Improvement", desc: "To make your experience more personal (for example, by displaying more Gaming material if that's what you're most interested in).", color: "purple" },
              { icon: Lock, title: "Security", desc: "To keep spam and online dangers away from our site.", color: "pink" },
              { icon: AlertCircle, title: "Legal Compliance", desc: "To comply with applicable laws and regulations.", color: "blue" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <item.icon className={`w-8 h-8 text-${item.color}-600 mb-3`} />
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Services from Other Companies */}
        <motion.div 
          id="cookies" 
          className="scroll-mt-24 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center"
            >
              <Globe className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Services from Other Companies</h2>
          </div>
          
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <p className="text-gray-600">
              We work with reliable service providers that meet the 2026 standard for email delivery and site analytics. 
              We do not sell, rent, or transfer your personal information to any 3rd party.
            </p>
          </motion.div>
        </motion.div>

        {/* Your Rights & Choices */}
        <motion.div 
          id="rights" 
          className="scroll-mt-24 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center"
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Your Rights & Choices</h2>
          </div>
          
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">You Have The Right To:</h3>
                <ul className="space-y-2">
                  {[
                    "Access your personal data",
                    "Request correction of inaccurate data",
                    "Request deletion of your data",
                    "Opt-out of marketing communications"
                  ].map((item, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">How to Exercise Your Rights:</h3>
                <p className="text-gray-600 text-sm mb-3">
                  To exercise any of these rights, please contact us at:
                </p>
                <motion.a 
                  href="mailto:info@dailyworldblog.com" 
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  info@dailyworldblog.com
                </motion.a>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Data Security */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center"
            >
              <Lock className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Keeping data safe</h2>
          </div>
          
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <p className="text-gray-600 mb-4">
              To keep your data safe, we use encryption that is common in the industry. But keep in mind that no way of sending things over the internet is completely safe.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Lock, text: "SSL/TLS Encryption" },
                { icon: Shield, text: "Firewall Protection" },
                { icon: Database, text: "Secure Data Storage" },
                { icon: Eye, text: "Regular Security Audits" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <item.icon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Changes to Policy */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Changes to This Policy</h2>
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <p className="text-gray-600">
              We may update this privacy policy from time to time to reflect changes in our practices 
              or for legal reasons. We will notify you of any material changes by posting the new 
              policy on this page. We encourage you to review this policy periodically.
            </p>
          </motion.div>
        </motion.div>

        {/* Terms and Conditions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 mb-8 border border-indigo-100"
        >
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Terms and Conditions</h3>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  You agree to the following terms when you use Daily World Blog. Please read them very carefully.
                </p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    Who owns the content
                  </h4>
                  <p>
                    All of the text, images, and original research on Daily World Blog, like our 
                    "10 Simple Ways To Reduce Cybersecurity Risks In Small Businesses" and 
                    "Resident Evil Requiem 9 Revealed The Most Anticipated Horror Game", are the Daily World Blog's intellectual property. 
                    You can share links to our content, but you can't copy it completely without giving us credit and a link back.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-purple-600" />
                    Disclaimer of Information
                  </h4>
                  <div className="space-y-2">
                    <p><span className="font-medium text-gray-700">Finance & Business:</span> Our articles about important budgeting ideas and the most common financial mistakes to avoid are only for educational purposes. We are not licensed to give financial advice.</p>
                    <p><span className="font-medium text-gray-700">Tech and Gaming:</span> We give verifiable dates as of March 2026; developers can adjust the release dates of products like Marvel's Wolverine.</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-600" />
                    Comments and Behaviour of Users
                  </h4>
                  <p>We help people learn in our neighbourhood. We have the right to delete any comments that are:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                    <li>Promotional or "Spam" messages, such as links to sites that aren't yours.</li>
                    <li>Hateful, abusive, or unfair.</li>
                    <li>Intruding on the privacy of other readers.</li>
                  </ul>
                  <p className="mt-2">We never utilise AI to write our articles. All of our content is original and well-researched.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Links to Other Sites
                  </h4>
                  <p>
                    Our blog often connects to outside sites like GameSpot, IGN, healthcare websites, or official government financial sites. 
                    We are not responsible for the safety or content of these other websites.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Limiting Liability
                  </h4>
                  <p>
                    The Daily World Blog is not responsible for any money lost or missed "pre-order" windows that happen because of the material on this site. 
                    Use the information we give you every day as a starting point for your own research.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white relative overflow-hidden"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
          />
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-90 relative z-10" />
          <h2 className="text-2xl font-bold mb-3 relative z-10">Have Questions?</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto relative z-10">
            If you have any questions about this privacy policy or how we handle your data, 
            please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <motion.a
              href="mailto:info@dailyworldblog.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Mail className="w-5 h-5" />
              info@dailyworldblog.com
            </motion.a>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500/20 border border-white/30 text-white rounded-xl font-semibold hover:bg-indigo-500/30 transition-all"
              >
                Contact Form
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;
