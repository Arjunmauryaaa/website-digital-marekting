import { JsonLd } from "@/components/ui/json-ld";
import { SectionHead } from "@/components/ui/ui";
import { embeds, explainers, isoDuration, VIDEO_UPLOAD_DATE } from "@/content/videos";
import { absoluteUrl } from "@/lib/seo";
import { EmbedList, ExplainerPlayer } from "./video-player";

/** "Digital transformation, in motion": original animated explainers, plus a row for real videos once you have them. */
export function VideoShowcase({ initial = 0 }: { initial?: number }) {
  return (
    <section className="section section--dark" id="videos" aria-labelledby="videos-title">
      <div className="container">
        <SectionHead eyebrow="Digital transformation" title={<>Digital transformation, <em>in motion.</em></>} id="videos-title">
          Three short, silent animations that show how a connected digital presence comes together, from strategy to a website that turns visitors into enquiries.
        </SectionHead>
        <ExplainerPlayer items={explainers} initial={initial} />
        {embeds.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h3 className="h2" style={{ marginBottom: 24 }}>From us</h3>
            <EmbedList items={embeds} />
          </div>
        )}
      </div>
      {explainers.map((v) => (
        <JsonLd
          key={v.slug}
          data={{
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: v.title,
            description: v.description,
            thumbnailUrl: absoluteUrl(`/videos/${v.slug}.jpg`),
            contentUrl: absoluteUrl(`/videos/${v.slug}.mp4`),
            uploadDate: VIDEO_UPLOAD_DATE,
            duration: isoDuration(v.seconds),
            transcript: v.transcript.join(" "),
          }}
        />
      ))}
    </section>
  );
}
