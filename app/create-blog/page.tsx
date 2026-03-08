import CreatePost from "@/components/account/CreatePost";
import RequireAuth from "@/components/common/RequireAuth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Blog | Daily World Blog",
    robots: {
        index: false,
        follow: false,
    },
};

export default function page() {
    return <RequireAuth><CreatePost /></RequireAuth>;
}
