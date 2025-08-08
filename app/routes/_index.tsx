import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getUser } from "~/lib/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Summarizer - Housenumbers" },
    { name: "description", content: "AI-powered text summarization platform" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user) {
    return redirect('/dashboard');
  }
  return redirect('/login');
}

export default function Index() {
  // This should never render as the loader always redirects
  return null;
}