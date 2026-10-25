import { navigation } from "@/app/navigation";
import { AlertBand } from "@/components/alert-band";
import { Placeholder } from "@/components/placeholder";
import { TopBar } from "@/components/top-bar";

/* The site's pages, under the bar and over the footer. The lesson view sits
   outside this group, filling the screen with its own app bar. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TopBar {...navigation} />
      <AlertBand />
      {children}
      <Placeholder
        as="footer"
        name="Footer"
        height={520}
        note="Always dark · link columns, a contact panel with Discord and GitHub, the legal row and the wordmark"
        className="mt-auto"
      />
    </>
  );
}
