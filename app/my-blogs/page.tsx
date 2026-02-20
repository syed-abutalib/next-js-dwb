import MyBlogs from "@/components/account/MyBlogs";
import RequireAuth from "@/components/common/RequireAuth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Blogs | Daily World Blog",
    robots: {
        index: false,
        follow: false,
    },
};

export default function page() {
    return <RequireAuth><MyBlogs /></RequireAuth>;
}
