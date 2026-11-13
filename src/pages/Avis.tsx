import { useEffect, useState, type ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ABMCYApiError, createReview, getOrder, uploadFabricPhoto } from "../services/abmcy";
import { MaskLines, Reveal } from "../components/Reveal";
import { IconArrow, IconCheck, IconUpload } from "../components/Icons";

/** Page d'avis : la boutique envoie ce lien à une cliente après sa
 * commande (bouton « Demander un avis » du tableau de bord). Trois gestes :
 * des étoiles, quelques mots, une photo si elle veut. L'avis n'est publié
 * sur le site qu'une fois validé par la boutique. */

const WORDS = ["", "Déçue", "Moyen", "Bien", "Très bien", "J'adore"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Star({ on }: { on: boolean }) {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.5 1.2 6.4L12 17.3l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8L12 2.8z"
        fill={on ? "#c08a45" : "none"}
        stroke={on ? "#a87437" : "#c9ae7e"}
        strokeWidth="1.3"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
    </svg>
  );
}

export default function Avis() {
  const { orderId } = useParams();
  const validOrder = orderId && UUID.test(orderId) ? orderId : undefined;
  const [firstName, setFirstName] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!validOrder) return;
    let cancelled = false;
    getOrder(validOrder)
      .then((o) => {
        if (cancelled) return;
        setFirstName((o.customer_name || "").trim().split(/\s+/)[0] || "");
        setOrderNumber(o.order_number || "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [validOrder]);

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Choisissez une photo (image).");
      return;
    }
    setError(null);
    setPhotoUrl(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    setUploading(true);
    try {
      const r = await uploadFabricPhoto(f);
      setPhotoUrl(r.url);
    } catch (err) {
      setPreview(null);
      setError(err instanceof ABMCYApiError ? err.message : "La photo n'est pas partie. Réessayez.");
    } finally {
      setUploading(false);
    }
  };

  const send = async () => {
    if (rating === 0) {
      setError("Touchez les étoiles pour donner votre note.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      await createReview({
        order_id: validOrder,
        rating,
        comment: comment.trim(),
        photo_urls: photoUrl ? [photoUrl] : [],
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof ABMCYApiError && err.status !== 500
          ? err.message
          : "Votre avis n'est pas parti. Vérifiez votre connexion et réessayez."
      );
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-cocoa-800 text-cognac-300">
          <IconCheck size={38} />
        </span>
        <p className="eyebrow mt-8">Merci{firstName ? `, ${firstName}` : ""}</p>
        <p className="font-display mt-3 text-5xl leading-[0.98] font-semibold text-cocoa-900">
          Votre avis est <em className="text-cognac-600">bien reçu</em>.
        </p>
        <p className="mx-auto mt-5 max-w-md text-[15.5px] leading-relaxed text-cocoa-700">
          Il compte beaucoup pour l&rsquo;atelier. Il apparaîtra sur le site une fois lu par la maison.
        </p>
        <Link to="/boutique" className="btn-primary mt-9">
          Voir les nouveautés <IconArrow size={15} />
        </Link>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <div className="mx-auto max-w-xl px-5 pt-12 pb-10">
      <p className="eyebrow text-center">Votre avis{orderNumber ? ` · commande ${orderNumber}` : ""}</p>
      <MaskLines
        className="font-display mt-3 text-center text-5xl leading-[0.98] font-semibold text-cocoa-900 sm:text-6xl"
        lines={[
          <>{firstName ? `${firstName}, votre` : "Votre"} tenue</>,
          <>
            vous <em className="text-cognac-600">plaît</em> ?
          </>,
        ]}
      />
      <Reveal delay={200}>
        <p className="mx-auto mt-5 max-w-md text-center text-[15.5px] leading-relaxed text-cocoa-700">
          Une minute suffit. Votre avis aide d&rsquo;autres clientes à choisir, et l&rsquo;atelier à faire encore mieux.
        </p>
      </Reveal>

      <div className="mt-10 rounded-[34px] border border-sand-300/80 bg-sand-50/80 p-6 shadow-[0_30px_70px_-40px_rgba(60,42,27,0.5)] sm:p-9">
        {/* 1 — la note */}
        <p className="label text-center">Votre note</p>
        <div className="flex justify-center gap-1" role="radiogroup" aria-label="Note sur 5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className={`cursor-pointer rounded-full p-1 transition-transform duration-300 hover:scale-110 active:scale-95 ${
                n <= shown ? "scale-105" : ""
              }`}
            >
              <Star on={n <= shown} />
            </button>
          ))}
        </div>
        <p className="font-display mt-2 h-8 text-center text-2xl text-cognac-600 italic">{WORDS[shown]}</p>

        {/* 2 — quelques mots */}
        <label className="label mt-7" htmlFor="avis-mot">
          Quelques mots (facultatif)
        </label>
        <textarea
          id="avis-mot"
          className="field min-h-28 resize-y"
          maxLength={1000}
          placeholder="La coupe, le tissu, l'accueil, la livraison…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* 3 — une photo */}
        <p className="label mt-7">Une photo de vous dans la tenue (facultatif)</p>
        <div className="flex items-center gap-4">
          {preview && (
            <img
              src={preview}
              alt="Votre photo"
              className={`h-24 w-20 rounded-2xl border border-sand-300 object-cover ${uploading ? "opacity-50" : ""}`}
            />
          )}
          <label className={`btn-ghost !px-6 !py-3.5 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
            <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
            <IconUpload size={16} /> {uploading ? "Envoi…" : preview ? "Changer la photo" : "Ajouter une photo"}
          </label>
        </div>
        <p className="mt-2 text-[12.5px] text-cocoa-500">
          Elle n&rsquo;est montrée sur le site que si la maison la publie avec votre avis.
        </p>

        {error && (
          <p className="mt-6 rounded-3xl border border-cognac-500/30 bg-cognac-500/10 px-5 py-3.5 text-sm text-cognac-700">{error}</p>
        )}

        <button
          onClick={send}
          disabled={sending || uploading}
          className="btn-primary mt-7 w-full disabled:cursor-wait disabled:opacity-70"
        >
          {sending ? "Envoi…" : "Envoyer mon avis"} <IconArrow size={15} />
        </button>
      </div>
    </div>
  );
}
