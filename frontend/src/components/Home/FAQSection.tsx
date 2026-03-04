'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: "What services do you offer?",
        answer: "We provide comprehensive CRM solutions, custom software development, and growth-oriented consulting services designed to scale your business operations."
    },
    {
        question: "How can your services help my business grow?",
        answer: "Our platform streamlines your sales pipeline, automates repetitive tasks, and provides actionable insights through advanced analytics, allowing your team to focus on closing deals and accelerating growth."
    },
    {
        question: "Do you offer custom solutions?",
        answer: "Yes, we understand that every business is unique. We offer tailor-made solutions and flexible integrations to ensure our platform perfectly fits your specific workflow."
    },
    {
        question: "How do I get started?",
        answer: "Getting started is simple. You can hop on a free call with our team by clicking the 'Message Now' button in the section above, and we'll guide you through the next steps."
    },
    {
        question: "What is your pricing structure?",
        answer: "Our pricing is transparent and scales with your business needs. We offer flexible plans designed to accelerate your growth, starting with options that fit businesses of all sizes."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="bg-black text-white py-24 md:py-32 px-4 flex justify-center border-t border-neutral-900">
            <div className="max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Frequently Asked Questions</h2>
                    <p className="text-neutral-400 text-lg md:text-xl">Everything you need to know about our product and services.</p>
                </motion.div>

                <div className="flex flex-col gap-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                            key={index}
                            className="border border-neutral-800 rounded-2xl bg-neutral-950 overflow-hidden hover:border-white hover:bg-white hover:text-black transition-all duration-300 group"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                aria-expanded={openIndex === index}
                            >
                                <span className="text-lg font-medium pr-8">{faq.question}</span>
                                <span className="text-neutral-400 group-hover:text-black shrink-0 bg-neutral-900 group-hover:bg-neutral-200 p-2 rounded-full transition-colors">
                                    {openIndex === index ? (
                                        <Minus className="w-5 h-5" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                </span>
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-6 pt-0 text-neutral-400 group-hover:text-neutral-600 leading-relaxed text-lg transition-colors">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
