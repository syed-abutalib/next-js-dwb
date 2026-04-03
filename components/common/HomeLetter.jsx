import axios from "axios";
import { motion } from "framer-motion";
import React from "react";
import toast from "react-hot-toast";
import { apiUrl } from "./Config";
import { Heart, Sparkles, Star } from "lucide-react";

const scaleIn = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};
const HomeLetter = () => {
  const [email, setEmail] = React.useState("");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const response = await axios.post(`${apiUrl}/newsletter/subscribe`, {
        email: email,
      });

      if (response.data.success) {
        setIsSubscribed(true);
        setEmail("");
        toast.success(response.data.message || "Successfully subscribed!");
        setTimeout(() => setIsSubscribed(false), 3000);
      } else {
        toast.error(response.data.message || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          toast.error(err.msg);
        });
      } else {
        toast.error("Failed to subscribe. Please try again later.");
      }
    }
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={scaleIn}
      className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-center relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
          <Star className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">
            PREMIUM CONTENT
          </span>
        </div>
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Join Our Community
        </h3>
        <p className="text-blue-100 mb-8 max-w-lg mx-auto text-lg">
          Get exclusive access to premium articles, early updates, and community
          discussions.
        </p>
        <form
          onSubmit={handleSubscribe}
          className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your best email"
            className="flex-1 px-6 py-4 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            required
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isSubscribed ? (
              <>
                <span className="inline-flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-current" />
                  Subscribed!
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Get Access
              </>
            )}
          </motion.button>
        </form>
        <p className="text-white/70 text-sm mt-4">
          Join 10,000+ readers who get our weekly digest
        </p>
      </div>
    </motion.div>
  );
};

export default HomeLetter;
