import { Link, useSearchParams } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { IconArrow } from "../components/Icons";

/** Retour de la page de paiement ABMCY Core Payment. La confirmation
 * définitive (paiement reçu) est envoyée par e-mail par la plateforme dès
 * que le paiement est validé — cette page remercie le client. */
export default function PaiementConfirme() {
  const [params] = useSearchParams();
  const orderNumber = params.get("commande");

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center">
      <Reveal>
        <span className="mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-cognac-500 text-cognac-600">
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path className="check-path" d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <p className="eyebrow mt-8">Merci pour votre commande</p>
        <h1 className="font-display mt-3 text-5xl font-semibold text-cocoa-900 sm:text-6xl">
          Paiement transmis
        </h1>
        <p className="mt-5 text-[15.5px] leading-relaxed text-cocoa-700">
          {orderNumber ? (
            <>
              Votre commande <strong className="font-semibold text-cocoa-900">{orderNumber}</strong> est enregistrée.{" "}
            </>
          ) : null}
          Dès que votre paiement est validé, vous recevez une confirmation par e-mail, et l'atelier vous
          contacte pour la suite. Si vous avez choisi l'acompte, le reste se règle à la livraison — par lien de
          paiement ou en espèces, comme vous préférez.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/espace-client" className="btn-primary">
            Suivre ma commande <IconArrow size={15} />
          </Link>
          <Link to="/boutique" className="btn-ghost">
            Continuer mes achats
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
