import { notFound } from "next/navigation";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { getBrandMedia } from "@/lib/queries/brand-media";
import { MediaGallery } from "./media-gallery";

export default async function MediaAdminPage() {
  const scope = await getAdminScope();
  if (scope.kind === "none") notFound();

  const items = await getBrandMedia(scope);
  const showsMultipleBrands = scope.kind === "super" && !scope.brand;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
          Galería
        </h1>
        <p className="mt-1 text-[0.875rem] text-muted-foreground">
          Subí imágenes y videos, o agregá un link de YouTube/Vimeo. Después copiá la URL para
          pegarla en posts, páginas o foros.
        </p>
      </div>

      <MediaGallery
        initialMedia={items}
        brandId={scope.brand?.id ?? null}
        showsMultipleBrands={showsMultipleBrands}
      />
    </div>
  );
}
