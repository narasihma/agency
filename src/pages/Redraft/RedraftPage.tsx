import ActionButton from "@/components/ActionButton";
import { REDRAFT, REDRAFT_ASSETS as A } from "@/data/redraft.ts";
import "./RedraftPage.css";

const ICON_BUTTONS = [
  { icon: A.iconChat, label: "Chat with us", accent: true },
  { icon: A.iconSound, label: "Sound" },
  { icon: A.iconUser, label: "Account" },
  { icon: A.iconMenu, label: "Menu" },
];

/** Redraft preview (/redraft/): the "Redraft" group from the Figma file, built as a page */
export default function RedraftPage() {
  const { hero, approach, process, work, footer } = REDRAFT;

  return (
    <>
      {/* outside .redraft-page: its container query would pin these fixed layers to it instead of the window */}
      <div className="rd-paper" style={{ "--texture": `url(${A.texture})` }} aria-hidden="true" />
      <div className="rd-grain" aria-hidden="true">
        <div className="rd-grain__layer" style={{ "--grain": `url(${A.grain})` }} />
      </div>

      <div id="top" className="redraft-page">
        <header className="rd-hero">
          <div className="rd-hero__bar">
            <a className="rd-hero__logo" href="#top" aria-label={REDRAFT.brand}>
              <img src={A.logo} alt="" width={61} height={45} />
            </a>
            <nav className="rd-hero__actions" aria-label="Quick actions">
              {ICON_BUTTONS.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  className={`rd-icon-button${b.accent ? " rd-icon-button--accent" : ""}`}
                  aria-label={b.label}
                >
                  <img src={b.icon} alt="" width={24} height={24} />
                </button>
              ))}
            </nav>
          </div>

          <h1 className="rd-hero__headline">
            {hero.headline} <span className="rd-muted">{hero.headlineMuted}</span>
          </h1>

          <div className="rd-hero__offer">
            <p className="rd-hero__price">
              <span className="rd-hero__from">{hero.priceFrom}</span>
              <span className="rd-hero__amount">
                {hero.price} <span className="rd-hero__period">{hero.pricePeriod}</span>
              </span>
            </p>
            <div className="rd-ctas">
              <ActionButton variant="primary" arrow={A.arrowOnAccent} {...REDRAFT.primaryCta} />
              <ActionButton variant="ghost" arrow={A.arrow} {...REDRAFT.secondaryCta} />
            </div>
          </div>

          <img
            className="rd-hero__wordmark"
            src={A.wordmark}
            alt={REDRAFT.brand}
            width={1312}
            height={259}
          />
        </header>

        <main>
          <section className="rd-approach" aria-label="Our approach">
            <div className="rd-glass rd-approach__intro">
              <div className="rd-approach__team">
                {REDRAFT.team.map((p) => (
                  <img key={p.name} src={p.avatar} alt={p.name} width={48} height={48} />
                ))}
              </div>
              <h2 className="rd-approach__title">
                {approach.title}{" "}
                <span className="rd-approach__title-muted">{approach.titleMuted}</span>
              </h2>
              <p className="rd-approach__body">{approach.body}</p>
              <ActionButton variant="outline" arrow={A.arrow} {...approach.cta} />
            </div>

            <ul className="rd-approach__benefits">
              {approach.benefits.map((b) => (
                <li key={b.title} className="rd-glass rd-benefit">
                  <div className="rd-benefit__text">
                    <p className="rd-benefit__copy">
                      <strong>{b.title}</strong>
                      <span>{b.description}</span>
                    </p>
                    <span className="rd-benefit__number">{b.number}</span>
                  </div>
                  <img
                    className="rd-benefit__chart"
                    src={A.chart}
                    alt=""
                    width={193}
                    height={152}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className="rd-process" aria-labelledby="rd-process-title">
            <div className="rd-process__card">
              <div className="rd-intro">
                <p className="rd-eyebrow">{process.eyebrow}</p>
                <h2 id="rd-process-title" className="rd-h1">
                  {process.title}{" "}
                  <span className="rd-process__title-muted">{process.titleMuted}</span>
                </h2>
              </div>

              <ol className="rd-timeline">
                {process.days.map((d) => (
                  <li key={d.date} className={`rd-day${d.label ? " rd-day--milestone" : ""}`}>
                    <span className="rd-day__label">{d.label ?? " "}</span>
                    <span className="rd-day__date">{d.date}</span>
                  </li>
                ))}
              </ol>

              <ol className="rd-steps">
                {process.steps.map((s) => (
                  <li key={s.label} className="rd-step">
                    <span className="rd-step__label">{s.label}</span>
                    <h3 className="rd-step__title">{s.title}</h3>
                    <p className="rd-step__body">{s.body}</p>
                  </li>
                ))}
              </ol>

              <p className="rd-process__closing">
                <span className="rd-process__closing-muted">{process.closingMuted}</span>{" "}
                {process.closing} <span className="rd-warm">{process.closingAccent}</span>.
              </p>
            </div>
          </section>

          <section id="work" className="rd-work" aria-labelledby="rd-work-title">
            <div className="rd-intro rd-work__intro">
              <p className="rd-eyebrow">{work.eyebrow}</p>
              <h2 id="rd-work-title" className="rd-h1">
                {work.title} <span className="rd-muted">{work.titleMuted}</span>
              </h2>
            </div>
            <ul className="rd-work__grid">
              {work.projects.map((p) => (
                <li key={p.image} className="rd-work__item">
                  <img src={p.image} alt={p.alt} width={1328} height={876} loading="lazy" />
                </li>
              ))}
              <li className="rd-work__item rd-work__slot">
                <img src={A.emptySlot} alt="" width={40} height={40} />
                <span className="rd-work__slot-title">{work.slotTitle}</span>
                <span className="rd-work__slot-date">{work.slotDate}</span>
              </li>
            </ul>
          </section>
        </main>

        <footer id="contact" className="rd-footer">
          <div className="rd-footer__main">
            <div className="rd-footer__pitch">
              <p className="rd-footer__pitch-text">
                <span className="rd-muted">{footer.pitchMuted}</span> {footer.pitch}
              </p>
              <div className="rd-ctas">
                <ActionButton variant="primary" arrow={A.arrowOnAccent} {...REDRAFT.primaryCta} />
                <ActionButton variant="ghost" arrow={A.arrow} {...REDRAFT.secondaryCta} />
              </div>
            </div>

            <div className="rd-footer__nav">
              <div className="rd-footer__links">
                {[footer.explore, footer.legal].map((group) => (
                  <nav key={group.title} className="rd-footer__group" aria-label={group.title}>
                    <p className="rd-footer__group-title">{group.title}</p>
                    <ul>
                      {group.links.map((l) => (
                        <li key={l.label}>
                          <a href={l.href}>{l.label}</a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
              <div className="rd-footer__meta">
                <button type="button" className="rd-footer__language">
                  {footer.language}
                  <img src={A.caret} alt="" width={16} height={16} />
                </button>
                <ul className="rd-footer__team">
                  {REDRAFT.team.map((p) => (
                    <li key={p.name}>
                      <img src={p.footerAvatar} alt={p.name} width={48} height={48} />
                      <img
                        className="rd-footer__badge"
                        src={A.linkedIn}
                        alt=""
                        width={16}
                        height={16}
                      />
                    </li>
                  ))}
                  <li>
                    <img src={A.teamMark} alt={REDRAFT.brand} width={48} height={48} />
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="rd-footer__bar">
            <span>{footer.copyright}</span>
          </div>
        </footer>
      </div>
    </>
  );
}
