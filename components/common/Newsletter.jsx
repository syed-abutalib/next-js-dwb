import axios from "axios";
import { motion } from "framer-motion";
import React from "react";
import { apiUrl } from "./Config";
import toast from "react-hot-toast";
import { ArrowUpRight, Heart, Sparkles } from "lucide-react";

const Newsletter = () => {
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-center relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-4">
          <Sparkles className="w-3 h-3 text-white" />
          <span className="text-xs font-semibold text-white">NEWSLETTER</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">Stay Updated</h3>
        <p className="text-blue-100 text-sm mb-4">
          Get the latest articles delivered to your inbox.
        </p>
        <form className="space-y-3" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm"
            required
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-4 py-3 bg-white text-blue-600 font-bold rounded-xl hover:shadow-xl transition-all duration-300 text-sm"
          >
            {isSubscribed ? (
              <>
                <span className="inline-flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-current" />
                  Subscribed!
                </span>
              </>
            ) : (
              <>Subscribe</>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default Newsletter;
