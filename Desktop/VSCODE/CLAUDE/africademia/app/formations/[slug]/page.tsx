import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFormation } from '@/lib/data'
import { getFormationWithDatabase } from '@/lib/formation-repository'
import { whatsappUrl } from '@/lib/whatsapp'
import Reveal from '@/components/ui/Reveal'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const formation = getFormation(params.slug)
  return formation ? { title: formation.title, description: formation.description } : {}
}

export default async function FormationDetailPage({ params }: { params: { slug: string } }) {
  const formation = await getFormationWithDatabase(params.slug)
  if (!formation) notFound()

  const contactHref = whatsappUrl(`Bonjour Africademia, je souhaite m’inscrire à la formation « ${formation.title} » (${formation.price || 'tarif à confirmer'}). Pouvez-vous m’indiquer la prochaine étape ?`)

  return (
    <>
      <section className="detail-hero">
        <div className="detail-backdrop" style={{ backgroundImage: `linear-gradient(90deg, rgba(15,10,7,.97), rgba(15,10,7,.6)), url(${formation.image})` }} />
        <div className="detail-grain" />
        <div className="shell detail-hero-inner">
          <Link href="/formations" className="back-link">← Retour aux formations</Link>
          <div className="detail-hero-copy">
            <span className="eyebrow light-eyebrow"><i /> {formation.category}</span>
            <h1>{formation.title}</h1>
            <p>{formation.longDescription}</p>
          </div>
          <div className="detail-meta">
            <span><small>Format</small>{formation.format}</span>
            <span><small>Durée</small>{formation.duration}</span>
            <span><small>Niveau</small>{formation.level}</span>
          </div>
        </div>
        <span className="scroll-cue">Défiler <i /></span>
      </section>

      <div className="detail-marquee" aria-hidden="true">
        <div><span>APPRENDRE</span><i>✦</i><span>PRATIQUER</span><i>✦</i><span>CRÉER</span><i>✦</i><span>LANCER</span><i>✦</i><span>APPRENDRE</span><i>✦</i><span>PRATIQUER</span></div>
      </div>

      <section className="section promise-section">
        <div className="shell promise-grid">
          <Reveal><span className="section-number">01 — LA PROMESSE</span></Reveal>
          <Reveal delay={100}>
            <h2>{formation.promise}</h2>
            <p>{formation.description}</p>
          </Reveal>
        </div>
      </section>

      <section className="section program-section">
        <div className="shell">
          <Reveal className="section-title-row">
            <div><span className="section-number">02 — LE PROGRAMME</span><h2>Une progression claire, étape par étape.</h2></div>
            <p>Chaque module produit une décision, une compétence ou un livrable utile au projet final.</p>
          </Reveal>
          <div className="module-timeline">
            {formation.modules.map((module, index) => (
              <Reveal className="module-row" delay={index * 70} key={module.title}>
                <span className="module-number">0{index + 1}</span>
                <div><h3>{module.title}</h3><p>{module.description}</p></div>
                <span className="module-arrow">↘</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section learning-section">
        <div className="shell learning-grid">
          <Reveal className="learning-heading">
            <span className="section-number light-number">03 — CE QUE VOUS SAUREZ FAIRE</span>
            <h2>Des acquis que vous pourrez vraiment utiliser.</h2>
          </Reveal>
          <div className="learning-list">
            {formation.learnings.map((learning, index) => (
              <Reveal className="learning-item" delay={index * 70} key={learning}>
                <span>{String(index + 1).padStart(2, '0')}</span><p>{learning}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section fit-section">
        <div className="shell fit-grid">
          <Reveal>
            <span className="section-number">04 — POUR QUI ?</span>
            <h2>Ce parcours est fait pour vous si…</h2>
          </Reveal>
          <div className="fit-cards">
            {formation.audience.map((profile, index) => (
              <Reveal className="fit-card" delay={index * 90} key={profile}>
                <span>0{index + 1}</span><p>{profile}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section included-section">
        <div className="shell included-card">
          <Reveal>
            <span className="section-number light-number">05 — INCLUS DANS LE PARCOURS</span>
            <h2>Tout ce qu’il faut pour avancer.</h2>
          </Reveal>
          <div className="included-list">
            {formation.included.map((item, index) => (
              <Reveal delay={index * 60} key={item}><span>✓</span><p>{item}</p></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="shell faq-layout">
          <Reveal><span className="section-number">06 — QUESTIONS FRÉQUENTES</span><h2>Avant de vous lancer.</h2></Reveal>
          <div className="faq-list">
            {formation.faq.map((item, index) => (
              <Reveal delay={index * 60} key={item.question}>
                <details><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="enrollment-section">
        <div className="shell enrollment-grid">
          <Reveal>
            <span className="section-number light-number">PRÊT À COMMENCER ?</span>
            <h2>Votre prochain projet peut commencer ici.</h2>
          </Reveal>
          <Reveal className="enrollment-panel" delay={100}>
            <span>Votre résultat</span>
            <h3>{formation.outcome}</h3>
            <div className="price-line"><small>Tarif</small><strong>{formation.price || 'Bientôt disponible'}</strong></div>
            <a href={contactHref} target="_blank" rel="noreferrer" className="button button-light full-button">
              Nous écrire sur WhatsApp <span>↗</span>
            </a>
            <small>Inscription accompagnée directement sur WhatsApp · +226 69 65 66 10</small>
          </Reveal>
        </div>
      </section>
    </>
  )
}
