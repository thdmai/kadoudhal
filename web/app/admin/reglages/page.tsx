import { adminIconMap } from "@/components/admin/admin-icons";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { UploadLimitsForm } from "@/components/admin/upload-limits-form";
import { getSiteSettings } from "@/lib/admin/settings";
import {
  ABSOLUTE_MAX_AUDIO_MB,
  ABSOLUTE_MAX_COVER_MB,
  ABSOLUTE_MAX_HOME_IMAGE_MB,
} from "@/lib/admin/upload-limits";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function AdminSettingsPage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.admin.settings;
  const settings = await getSiteSettings();

  return (
    <>
      <AdminTopbar
        title={t.title}
        subtitle={t.subtitle}
        icon={<adminIconMap.reglages className="size-5" />}
      />
      <main className="px-5 py-6 lg:px-8">
        <UploadLimitsForm
          maxAudioMb={settings.maxAudioMb}
          maxCoverMb={settings.maxCoverMb}
          maxHomeImageMb={settings.maxHomeImageMb}
          coranKinds={settings.coranKinds.join(",")}
          publishByDefault={settings.publishByDefault}
          absoluteMaxAudioMb={ABSOLUTE_MAX_AUDIO_MB}
          absoluteMaxCoverMb={ABSOLUTE_MAX_COVER_MB}
          absoluteMaxHomeImageMb={ABSOLUTE_MAX_HOME_IMAGE_MB}
        />
      </main>
    </>
  );
}
