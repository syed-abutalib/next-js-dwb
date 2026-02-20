import Dashboard from "@/components/account/Profile";
import RequireAuth from "@/components/common/RequireAuth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account Dashboard | Daily World Blog",
    robots: {
        index: false,
        follow: false,
    },
};

export default function page() {
    return <RequireAuth><Dashboard /></RequireAuth>;
}
