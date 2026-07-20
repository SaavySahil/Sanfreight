import { redirect } from "next/navigation";

// The real jobs-listing page linked from the site's nav/footer is /en/career.
// This route existed before that page was wired to the API — keep it as a
// redirect so any old bookmarks/links to /en/job-offers still land somewhere
// useful instead of showing a second, redundant listing.
export default function JobsPageRedirect() {
  redirect("/en/career");
}
