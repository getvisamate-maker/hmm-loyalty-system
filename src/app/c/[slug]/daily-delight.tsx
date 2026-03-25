"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Smile, Coffee, Lightbulb } from "lucide-react";

const delights = [
  { type: "fact", content: "Coffee beans aren't beans. They're fruit pits.", icon: <Lightbulb size={18} /> },
  { type: "joke", content: "Why did the coffee file a police report? It got mugged.", icon: <Smile size={18} /> },
  { type: "quote", content: "But first, coffee.", icon: <Coffee size={18} /> },
  { type: "fact", content: "Espresso has less caffeine per cup than drip coffee.", icon: <Lightbulb size={18} /> },
  { type: "joke", content: "How does a tech guy drink coffee? He installs Java.", icon: <Smile size={18} /> },
  { type: "quote", content: "Life happens. Coffee helps.", icon: <Coffee size={18} /> },
  { type: "fact", content: "Voltaire reportedly drank 50 cups of coffee a day.", icon: <Lightbulb size={18} /> },
  { type: "joke", content: "What do you call a sad coffee? A depresso.", icon: <Smile size={18} /> },
  { type: "quote", content: "Procaffeinating: The tendency to not start anything until you've had a cup of coffee.", icon: <Coffee size={18} /> },
  { type: "fact", content: "The world consumes close to 2.25 billion cups of coffee every day.", icon: <Lightbulb size={18} /> },
  { type: "joke", content: "Why are men like coffee? The best ones are rich, hot, and can keep you up all night.", icon: <Smile size={18} /> },
  { type: "quote", content: "Coffee: because anger management is too expensive.", icon: <Coffee size={18} /> },
  { type: "fact", content: "Finland consumes the most coffee per capita in the world.", icon: <Lightbulb size={18} /> },
  { type: "joke", content: "What's a barista's favorite exercise? The French press.", icon: <Smile size={18} /> },
  { type: "quote", content: "Behind every successful person is a substantial amount of coffee.", icon: <Coffee size={18} /> },
  { type: "fact", content: "A group of pugs is called a grumble.", icon: <Lightbulb size={18} /> },
  { type: "joke", content: "I like my coffee like I like my weekends... short and sweet.", icon: <Smile size={18} /> },
  { type: "quote", content: "May your coffee be strong and your Monday be short.", icon: <Coffee size={18} /> },
  { type: "fact", content: "The first webcam was invented at Cambridge to check the status of a coffee pot.", icon: <Lightbulb size={18} /> },
  { type: "joke", content: "Why did the hipster burn his tongue? He drank his coffee before it was cool.", icon: <Smile size={18} /> },
];

export function DailyDelight() {
  const [delight, setDelight] = useState<typeof delights[0] | null>(null);

  useEffect(() => {
    // Pick a random delight based on the day of the year to be consistent for the day?
    // Or just random for now to keep it fresh on reload? Random is fine.
    const randomDelight = delights[Math.floor(Math.random() * delights.length)];
    setDelight(randomDelight);
  }, []);

  if (!delight) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mt-8 w-full max-w-md mx-auto"
    >
      <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles size={48} className="text-yellow-500" />
        </div>
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            {delight.icon}
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              Daily Delight
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed italic">
              "{delight.content}"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
