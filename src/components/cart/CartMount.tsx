import { getFullSiteData } from "@/lib/data-store";
import { CartDrawer } from "./CartDrawer";

// Server component: resolves the store's WhatsApp number from site settings
// (admin-controlled) and hands it to the client-side cart drawer.
export async function CartMount() {
  let phone = "923001234567";
  try {
    const { social, settings } = await getFullSiteData();
    phone = social?.whatsapp || settings?.phone1 || settings?.phone2 || phone;
  } catch {
    /* fall back to the default number */
  }
  return <CartDrawer phone={phone} />;
}
