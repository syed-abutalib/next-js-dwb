import EditPost from "@/components/account/EditPost";
import RequireAuth from "@/components/common/RequireAuth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Blog | Daily World Blog",
    robots: {
        index: false,
        follow: false,
    },
};

export default function page() {
    return <RequireAuth><EditPost /></RequireAuth>;
}
