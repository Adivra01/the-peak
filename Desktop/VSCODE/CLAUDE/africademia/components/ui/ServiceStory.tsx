'use client'

import { CSSProperties, useEffect, useRef, useState } from 'react'

type Stage = {
  label: string
  title: string
  text: string
}

type ServiceStoryProps = {
  eyebrow: string
  title: string
  intro: string
  stages: [Stage, Stage, Stage]
  ctaHref: string
  ctaLabel: string
  tone?: 'terra' | 'forest'
}

export default function ServiceStory({ eyebrow, title, intro, stages, ctaHref, ctaLabel, tone = 'terra' }: ServiceStoryProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const range = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.max(0, Math.min(1, -rect.top / range))
      section.style.setProperty('--story-progress', progress.toFixed(3))
      setActive(Math.min(2, Math.floor(progress * 3)))
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

  return (
    <section ref={sectionRef} className={`service-story service-story-${tone}`} style={{ '--story-progress': 0 } as CSSProperties}>
      <div className="shell service-story-grid">
        <div className="service-story-sticky">
          <span className="section-number">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{intro}</p>
          <div className="story-orbit" aria-hidden="true">
            <i /><b>{`0${active + 1}`}</b><span>→</span>
          </div>
        </div>
        <div className="story-panels">
          {stages.map((stage, index) => (
            <article className={active === index ? 'is-active' : ''} key={stage.label}>
              <div className="story-panel-index">0{index + 1}</div>
              <span>{stage.label}</span>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
              {index === 2 && <a className="button button-primary" href={ctaHref}>{ctaLabel} <b aria-hidden="true">↗</b></a>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
