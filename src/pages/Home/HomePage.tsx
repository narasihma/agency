import ActionButton from "@/components/ActionButton";
import CrumplePaper from "@/components/CrumplePaper";
import MorphLogo from "@/components/MorphLogo";
import { HOME, HOME_ASSETS as A } from "@/data/home.ts";
import "./HomePage.css";

const ICON_BUTTONS = [
  { icon: A.iconChat, label: "Chat with us", accent: true },
  { icon: A.iconSound, label: "Sound" },
  { icon: A.iconUser, label: "Account" },
  { icon: A.iconMenu, label: "Menu" },
];

/** the pile's pieces are drawn a little larger than in their photo */
const PILE_SCALE = 1.2;

/** Home page (/): the "Redraft" group from the Figma file, built as a page */
export default function HomePage() {
  const { hero, approach, process, work, footer } = HOME;

  return (
    <>
      {/* outside .home-page: its container query would pin these fixed layers to it instead of the window */}
      {/* the crumpling sits inside the paper, so it drifts with it */}
      <div className="home-paper" style={{ "--texture": `url(${A.texture})` }} aria-hidden="true">
        <CrumplePaper src={A.paperCrumple} />
      </div>
      <div className="home-grain" aria-hidden="true">
        <div className="home-grain__layer" style={{ "--grain": `url(${A.grain})` }} />
      </div>

      <div id="top" className="home-page">
        <header className="home-hero">
          <div className="home-hero__bar">
            <MorphLogo
              className="home-hero__logo"
              href="#top"
              label={HOME.brand}
              {...A.logoAnimation}
            />
            <nav className="home-hero__actions" aria-label="Quick actions">
              {ICON_BUTTONS.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  className={`home-icon-button${b.accent ? " home-icon-button--accent" : ""}`}
                  aria-label={b.label}
                >
                  <img src={b.icon} alt="" width={24} height={24} />
                </button>
              ))}
            </nav>
          </div>

          <h1 className="home-hero__headline">
            {hero.headline} <span className="home-muted">{hero.headlineMuted}</span>
          </h1>

          <div className="home-hero__offer">
            <p className="home-hero__price">
              <span className="home-hero__from">{hero.priceFrom}</span>
              <span className="home-hero__amount">
                {hero.price} <span className="home-hero__period">{hero.pricePeriod}</span>
              </span>
            </p>
            <div className="home-ctas">
              <ActionButton variant="primary" arrow={A.arrowOnAccent} {...HOME.primaryCta} />
              <ActionButton variant="ghost" arrow={A.arrow} {...HOME.secondaryCta} />
            </div>
          </div>

          <img
            className="home-hero__wordmark"
            src={A.wordmark}
            alt={HOME.brand}
            width={1312}
            height={259}
          />
        </header>

        <main>
          <section className="home-approach" aria-label="Our approach">
            <div className="home-glass home-approach__intro">
              <div className="home-approach__team">
                {HOME.team.map((p) => (
                  <img key={p.name} src={p.avatar} alt={p.name} width={48} height={48} />
                ))}
              </div>
              <h2 className="home-approach__title">
                {approach.title}{" "}
                <span className="home-approach__title-muted">{approach.titleMuted}</span>
              </h2>
              <p className="home-approach__body">{approach.body}</p>
              <ActionButton variant="outline" arrow={A.arrow} {...approach.cta} />
            </div>

            <ul className="home-approach__benefits">
              {approach.benefits.map((b) => (
                <li key={b.title} className="home-glass home-benefit">
                  <div className="home-benefit__text">
                    <p className="home-benefit__copy">
                      <strong>{b.title}</strong>
                      <span>{b.description}</span>
                    </p>
                    <span className="home-benefit__number">{b.number}</span>
                  </div>
                  <img
                    className="home-benefit__chart"
                    src={A.chart}
                    alt=""
                    width={193}
                    height={152}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className="home-process" aria-labelledby="home-process-title">
            <div className="home-process__card">
              <div className="home-intro">
                <p className="home-eyebrow">{process.eyebrow}</p>
                <h2 id="home-process-title" className="home-h1">
                  {process.title}{" "}
                  <span className="home-process__title-muted">{process.titleMuted}</span>
                </h2>
              </div>

              <ol className="home-timeline">
                {process.days.map((d) => (
                  <li key={d.date} className={`home-day${d.label ? " home-day--milestone" : ""}`}>
                    <span className="home-day__label">{d.label ?? " "}</span>
                    <span className="home-day__date">{d.date}</span>
                  </li>
                ))}
              </ol>

              <ol className="home-steps">
                {process.steps.map((s) => (
                  <li key={s.label} className="home-step">
                    <span className="home-step__label">{s.label}</span>
                    <h3 className="home-step__title">{s.title}</h3>
                    <p className="home-step__body">{s.body}</p>
                  </li>
                ))}
              </ol>

              <p className="home-process__closing">
                <span className="home-process__closing-muted">{process.closingMuted}</span>{" "}
                {process.closing} <span className="home-warm">{process.closingAccent}</span>.
              </p>
            </div>
          </section>

          <section id="work" className="home-work" aria-labelledby="home-work-title">
            <div className="home-intro home-work__intro">
              <p className="home-eyebrow">{work.eyebrow}</p>
              <h2 id="home-work-title" className="home-h1">
                {work.title} <span className="home-muted">{work.titleMuted}</span>
              </h2>
            </div>
            <ul className="home-work__grid">
              {work.projects.map((p) => (
                <li key={p.image} className="home-work__item">
                  <img src={p.image} alt={p.alt} width={1328} height={876} loading="lazy" />
                </li>
              ))}
              <li className="home-work__item home-work__slot">
                <img src={A.emptySlot} alt="" width={40} height={40} />
                <span className="home-work__slot-title">{work.slotTitle}</span>
                <span className="home-work__slot-date">{work.slotDate}</span>
              </li>
            </ul>
          </section>
        </main>
      </div>

      {/* the sheet tears off and the desk shows under it: full width, so outside .home-page */}
      <div className="home-desk">
        <div className="home-desk__sheet" aria-hidden="true">
          <img
            src={A.paperSheet.src}
            alt=""
            width={A.paperSheet.width}
            height={A.paperSheet.height}
            loading="lazy"
          />
        </div>
        <div className="home-desk__grain" aria-hidden="true">
          <div className="home-grain__layer" style={{ "--grain": `url(${A.grain})` }} />
        </div>

        <div className="home-page home-desk__footer">
          <footer id="contact" className="home-footer">
            <div className="home-footer__main">
              <div className="home-footer__pitch">
                <p className="home-footer__pitch-text">
                  <span className="home-muted">{footer.pitchMuted}</span> {footer.pitch}
                </p>
                <div className="home-ctas">
                  <ActionButton variant="primary" arrow={A.arrowOnAccent} {...HOME.primaryCta} />
                  <ActionButton variant="ghost" arrow={A.arrow} {...HOME.secondaryCta} />
                </div>
              </div>

              <div className="home-footer__nav">
                <div className="home-footer__links">
                  {[footer.explore, footer.legal].map((group) => (
                    <nav key={group.title} className="home-footer__group" aria-label={group.title}>
                      <p className="home-footer__group-title">{group.title}</p>
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
                <div className="home-footer__meta">
                  <button type="button" className="home-footer__language">
                    {footer.language}
                    <img src={A.caret} alt="" width={16} height={16} />
                  </button>
                  <ul className="home-footer__team">
                    {HOME.team.map((p) => (
                      <li key={p.name}>
                        <img src={p.footerAvatar} alt={p.name} width={48} height={48} />
                        <img
                          className="home-footer__badge"
                          src={A.linkedIn}
                          alt=""
                          width={16}
                          height={16}
                        />
                      </li>
                    ))}
                    <li>
                      <img src={A.teamMark} alt={HOME.brand} width={48} height={48} />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="home-pile" aria-hidden="true">
              <div className="home-pile__frame">
                {A.paperPile.map((p, i) => (
                  <img
                    key={p.src}
                    className="home-pile__piece"
                    src={p.src}
                    alt=""
                    width={p.width}
                    height={p.height}
                    loading="lazy"
                    style={{
                      "--x": p.x - (p.width * PILE_SCALE) / 2,
                      "--bottom": p.bottom,
                      "--w": p.width * PILE_SCALE,
                      "--r": `${p.rotate}deg`,
                      // takes start at different moments, so the pieces don't twitch in unison
                      "--delay": `${-((i * 250) % 750)}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="home-footer__bar">
              <span>{footer.copyright}</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
