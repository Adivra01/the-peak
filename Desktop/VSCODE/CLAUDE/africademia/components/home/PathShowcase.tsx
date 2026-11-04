'use client'

import Link from 'next/link'
import { CSSProperties, PointerEvent, useEffect, useRef } from 'react'

const paths = [
  {
    index: '01',
    label: 'Formations',
    title: 'Une compétence qui produit un vrai résultat.',
    text: 'Choisissez un objectif, avancez avec une méthode claire et repartez avec un livrable que vous pouvez montrer, utiliser ou vendre.',
    href: '/formations',
    cta: 'Explorer les formations',
    proof: ['4 parcours concrets', 'Pratique avant théorie', 'Accessible à votre rythme'],
    className: 'path-card-training',
  },
  {
    index: '02',
    label: 'Incubateur',
    title: 'Une idée transformée en projet crédible.',
    text: 'Clarifiez votre offre, confrontez-la au terrain et construisez les premières fondations d’une activité viable, entouré et guidé.',
    href: '/incubateur',
    cta: 'Découvrir l’incubateur',
    proof: ['Décisions structurées', 'Tests terrain', 'Suivi humain'],
    className: 'path-card-incubator',
  },
]

export default function PathShowcase() {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = stage.getBoundingClientRect()
      const progress = Math.max(-1, Math.min(1, (window.innerHeight * .56 - rect.top - rect.height / 2) / window.innerHeight))
      stage.style.setProperty('--path-scroll', progress.toFixed(3))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - .5) * 2
    const y = ((event.clientY - rect.top) / rect.height - .5) * 2
    event.currentTarget.style.setProperty('--pointer-x', x.toFixed(3))
    event.currentTarget.style.setProperty('--pointer-y', y.toFixed(3))
  }

  const resetPointer = () => {
    stageRef.current?.style.setProperty('--pointer-x', '0')
    stageRef.current?.style.setProperty('--pointer-y', '0')
  }

  return (
    <div
      className="path-stage"
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={resetPointer}
      style={{ '--path-scroll': 0, '--pointer-x': 0, '--pointer-y': 0 } as CSSProperties}
    >
      <div className="path-ambient path-ambient-one" />
      <div className="path-ambient path-ambient-two" />
      <div className="path-grid">
        {paths.map((path, index) => (
          <Link href={path.href} className={`path-card ${path.className}`} key={path.href} style={{ '--path-order': index } as CSSProperties}>
            <div className="path-card-top">
              <span className="path-index">{path.index}</span>
              <span className="path-icon" aria-hidden="true">{index ? '↗' : '✦'}</span>
            </div>
            <div className="path-content">
              <span>{path.label}</span>
              <h3>{path.title}</h3>
              <p>{path.text}</p>
              <ul>{path.proof.map((item) => <li key={item}>{item}</li>)}</ul>
              <span className="text-link">{path.cta} <b aria-hidden="true">→</b></span>
            </div>
          </Link>
        ))}
      </div>
      <div className="path-stage-caption" aria-hidden="true"><span>Apprendre</span><i /><span>Structurer</span><i /><span>Lancer</span></div>
    </div>
  )
}
