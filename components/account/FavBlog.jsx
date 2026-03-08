import React from "react";
import Layout from "../common/Layout";
import Sidebar from "./Sidebar";
import { HeartIcon } from "@heroicons/react/24/solid";

const FavBlog = () => {
    return (
        <Layout>
            <div className="py-8">
                <div className="container mx-auto px-4 max-w-[1440px]">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <Sidebar />

                        {/* Main Content */}
                        <main className="flex-1">
                            <div className="space-y-6">
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                        Favorite Articles
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <article className="group cursor-pointer">
                                            <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-4">
                                                <img
                                                    src="https://res.cloudinary.com/dgcqtwfbj/image/upload/v1756797702/portrait-4599553_1280_z8vzik.jpg"
                                                    alt="A Relentless Pursuit of Perfection in Product Design"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <button
                                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Remove from favorites logic here
                                                    }}
                                                >
                                                    <HeartIcon className="w-5 h-5 text-red-500" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <span>19 Jan 2024</span>
                                                <span className="text-gray-300">
                                                    •
                                                </span>
                                                <span>Phoenix Baker</span>
                                                <span className="text-gray-300">
                                                    •
                                                </span>
                                                <span>5 min read</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-gray-600">
                                                A Relentless Pursuit of
                                                Perfection in Product Design
                                            </h3>
                                            <p className="text-gray-600 line-clamp-2">
                                                It begins to notice that there
                                                was a sharp contrast between
                                                well-made designs and how they
                                                impacted the overall user
                                                experience. The journey to
                                                perfection in product design is
                                                not just about aesthetics.
                                            </p>
                                        </article>

                                        <article className="group cursor-pointer">
                                            <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-4">
                                                <img
                                                    src="https://res.cloudinary.com/dgcqtwfbj/image/upload/v1756797851/portrait-787522_1280_p6fluq.jpg"
                                                    alt="How to Run a Successful Business With Your Partner"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <button
                                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Remove from favorites logic here
                                                    }}
                                                >
                                                    <HeartIcon className="w-5 h-5 text-red-500" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <span>18 Jan 2024</span>
                                                <span className="text-gray-300">
                                                    •
                                                </span>
                                                <span>Lana Steiner</span>
                                                <span className="text-gray-300">
                                                    •
                                                </span>
                                                <span>3 min read</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-gray-600">
                                                How to Run a Successful Business
                                                With Your Partner
                                            </h3>
                                            <p className="text-gray-600 line-clamp-2">
                                                Starting a business with your
                                                spouse or significant other is
                                                an exciting but challenging
                                                venture. Here's what you need to
                                                know about making it work.
                                            </p>
                                        </article>

                                        <article className="group cursor-pointer">
                                            <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-4">
                                                <img
                                                    src="https://res.cloudinary.com/dgcqtwfbj/image/upload/v1756797987/butterfly-9791233_1280_ys6yeg.jpg"
                                                    alt="Why Food Matters — Disease Prevention & Treatment"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <button
                                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Remove from favorites logic here
                                                    }}
                                                >
                                                    <HeartIcon className="w-5 h-5 text-red-500" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <span>18 Jan 2024</span>
                                                <span className="text-gray-300">
                                                    •
                                                </span>
                                                <span>Lana Steiner</span>
                                                <span className="text-gray-300">
                                                    •
                                                </span>
                                                <span>4 min read</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-gray-600">
                                                Why Food Matters — Disease
                                                Prevention & Treatment
                                            </h3>
                                            <p className="text-gray-600 line-clamp-2">
                                                Eating more plants and less meat
                                                has been tied to a longer life
                                                and a reduced risk of
                                                cardiovascular disease in a new
                                                study. Learn more about the
                                                benefits.
                                            </p>
                                        </article>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FavBlog;
