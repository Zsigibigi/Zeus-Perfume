import ZeusEffects from '../components/ZeusEffects';
import zeusImg from '../assets/img/zeus.webp';
import pharaonImg from '../assets/img/pharaon.webp';

export default function Home() {
  return (
    <>
        <svg className="svg-defs" aria-hidden="true" focusable="false">
          <symbol id="i-bolt" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 2 4.5 13.5h6.2L9.5 22l10-12.2h-6.4L13.5 2Z"/></symbol>
          <symbol id="i-bag" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z M9 10V6.5a3 3 0 0 1 6 0V10"/></symbol>
          <symbol id="i-left" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7"/></symbol>
          <symbol id="i-right" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></symbol>
          <symbol id="i-up" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M12 20V5M6 11l6-6 6 6"/></symbol>
          <symbol id="i-swipe" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 7h6M6 4 3 7l3 3M21 7h-6M18 4l3 3-3 3M10 21l-2.6-4.4a1.5 1.5 0 0 1 2.6-1.5l1 1.6V9.5a1.5 1.5 0 0 1 3 0V14l3.2.7a2 2 0 0 1 1.5 2.3L18 21"/></symbol>
        </svg>

        <canvas className="fx" id="fx" aria-hidden="true"></canvas>
        <div className="flash" id="flash" aria-hidden="true"></div>
        <div className="cursor" id="cursor" aria-hidden="true"><i className="cursor__ring"></i><i className="cursor__dot"></i></div>
        <div className="toast" id="toast" role="status" aria-live="polite">
          <span className="toast__icon"><svg><use href="#i-bolt"/></svg></span><span className="toast__msg"></span>
        </div>

        <header className="nav" id="nav">
          <a className="logo" href="#top" aria-label="ZEUS – az oldal teteje"><svg aria-hidden="true"><use href="#i-bolt"/></svg>ZEUS</a>
          <div className="nav__tools">
            <button className="icon-btn" id="soundBtn" type="button" aria-pressed="false" aria-label="Mennydörgés hang be/ki">
              <span className="bars" aria-hidden="true"><i></i><i></i><i></i></span>
            </button>
            <a className="icon-btn" href="#kollekcio" aria-label="Kosár">
              <svg aria-hidden="true"><use href="#i-bag"/></svg><span className="badge" id="badge">0</span>
            </a>
          </div>
        </header>

        <main>
          {/* ===================== HERO + INTRO ===================== */}
          <section className="hero" id="top" aria-label="ZEUS parfüm">
            <div className="hero__clouds" id="clouds" aria-hidden="true"></div>
            <canvas className="hero__sky" id="heroSky" aria-hidden="true"></canvas>
            <div className="hero__dark" aria-hidden="true"></div>
            <div className="hero__embers" id="embers" aria-hidden="true"></div>

            <div className="hero__inner" id="heroInner">
              <div className="hero__rays" aria-hidden="true"></div>
              <h1 className="hero__title">
                <span className="sr-only">ZEUS – Az istenek illata</span>
                <span className="hero__letters" id="heroLetters" aria-hidden="true"><span className="hl">Z</span><span className="hl">E</span><span className="hl">U</span><span className="hl">S</span><span className="hero__glow" id="heroGlow">ZEUS</span></span>
              </h1>
              <div className="hero__ring" aria-hidden="true">
                <svg viewBox="0 0 500 500">
                  <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(217,178,90,.35)" strokeWidth="8" strokeDasharray="1.2 9.27"/>
                  <circle cx="250" cy="250" r="242" fill="none" stroke="rgba(217,178,90,.28)" strokeWidth=".8"/>
                  <path id="ringPath" d="M250,250 m-226,0 a226,226 0 1,1 452,0 a226,226 0 1,1 -452,0" fill="none"/>
                  <text><textPath href="#ringPath" textLength="1410" lengthAdjust="spacing">ΖΕΥΣ · AZ ISTENEK ILLATA · EAU DE PARFUM · ΖΕΥΣ · AZ OLÜMPOSZ URA · </textPath></text>
                </svg>
              </div>
              <div className="hero__bottle">
                <div className="b3d m-zeus" id="heroBottle" data-src={zeusImg.src} data-label="Zeus parfümösüveg – húzd oldalra a forgatáshoz, koppints rá a villámhoz"></div>
              </div>
            </div>

            <div className="intro-fx" aria-hidden="true">
              <p className="intro-greek">ΖΕΥΣ</p>
              <div className="intro-line" id="introLine"><i></i><i></i></div>
            </div>

            <p className="hero__hint" aria-hidden="true"><svg><use href="#i-swipe"/></svg>Forgasd az ujjaddal</p>

            <div className="hero__ui">
              <div className="hero__copy">
                <p className="eyebrow">Eau de Parfum</p>
                <p className="hero__tag">Az istenek illata. <em>Erő, amit érezni.</em></p>
              </div>
              <div className="hero__buy">
                <p className="price"><b>51 600 Ft</b><span>100 ml</span></p>
                <div className="hero__btns">
                  <button className="btn btn--gold" type="button" data-add="zeus">
                    <span className="btn__txt"><svg aria-hidden="true"><use href="#i-bolt"/></svg>Kosárba</span>
                    <span className="btn__done" aria-hidden="true">A kosárban!</span>
                  </button>
                  <a className="btn btn--ghost" href="#kollekcio">Kollekció</a>
                </div>
              </div>
            </div>
          </section>

          {/* ===================== FUTÓSZALAG ===================== */}
          <div className="marquee" aria-hidden="true">
            <div className="marquee__track">
              <div className="marquee__set">
                <span className="mq mq--fill">Zeus<svg><use href="#i-bolt"/></svg></span>
                <span className="mq mq--line">Pharaon<svg><use href="#i-bolt"/></svg></span>
                <span className="mq mq--fill">Az istenek illata<svg><use href="#i-bolt"/></svg></span>
                <span className="mq mq--line">Olümposz<svg><use href="#i-bolt"/></svg></span>
                <span className="mq mq--fill">Nílus<svg><use href="#i-bolt"/></svg></span>
                <span className="mq mq--line">Arany<svg><use href="#i-bolt"/></svg></span>
              </div>
              <div className="marquee__set">
                <span className="mq mq--fill">Zeus<svg><use href="#i-bolt"/></svg></span>
                <span className="mq mq--line">Pharaon<svg><use href="#i-bolt"/></svg></span>
                <span className="mq mq--fill">Az istenek illata<svg><use href="#i-bolt"/></svg></span>
                <span className="mq mq--line">Olümposz<svg><use href="#i-bolt"/></svg></span>
                <span className="mq mq--fill">Nílus<svg><use href="#i-bolt"/></svg></span>
                <span className="mq mq--line">Arany<svg><use href="#i-bolt"/></svg></span>
              </div>
            </div>
          </div>

          {/* ===================== KOLLEKCIÓ ===================== */}
          <section className="collection" id="kollekcio" data-product="zeus">
            <div className="col-bg col-bg--zeus" aria-hidden="true"></div>
            <div className="col-bg col-bg--pharaon" aria-hidden="true"></div>

            <div className="container col-grid">
              <header className="col-head">
                <p className="eyebrow">A kollekció</p>
                <h2 className="h2 slam" data-slam="">Válaszd ki <span className="gold">az istened</span></h2>
                <div className="tabs" role="tablist" aria-label="Parfüm kiválasztása">
                  <span className="tabs__ink" aria-hidden="true"></span>
                  <button type="button" role="tab" id="tab-zeus" aria-selected="true" aria-controls="info" data-product="zeus">Zeus</button>
                  <button type="button" role="tab" id="tab-pharaon" aria-selected="false" aria-controls="info" data-product="pharaon" tabIndex="-1">Pharaon</button>
                </div>
              </header>

              <div className="stage" id="stage" data-reveal="zoom">
                <div className="stage__deco stage__deco--zeus" aria-hidden="true">
                  <svg viewBox="0 0 400 400" fill="none" stroke="rgba(247,210,130,.2)" strokeWidth="1.2">
                    <circle cx="200" cy="200" r="192"/>
                    <circle cx="200" cy="200" r="150" strokeDasharray="2 8"/>
                    <path d="M222 38 118 222h74l-32 142 136-206h-84l42-120Z" stroke="rgba(247,210,130,.28)"/>
                  </svg>
                </div>
                <div className="stage__deco stage__deco--pharaon" aria-hidden="true">
                  <svg viewBox="0 0 400 400" fill="none" stroke="rgba(160,185,255,.26)" strokeWidth="1.2">
                    <path d="M200 40 372 340H28Z"/>
                    <path d="M200 40 250 340M200 40 150 340M85 240h230M57 290h286M114 190h172M143 140h114" stroke="rgba(160,185,255,.14)"/>
                    <circle cx="200" cy="40" r="22" stroke="rgba(247,210,130,.4)"/>
                    <path d="M200 6v12M200 62v12M166 40h12M222 40h12M176 16l8 8M216 56l8 8M176 64l8-8M216 24l8-8" stroke="rgba(247,210,130,.35)"/>
                  </svg>
                </div>
                <div className="stage__rings" aria-hidden="true"><i></i><i></i><i></i></div>
                <div className="stage__slot is-active" data-product="zeus">
                  <div className="b3d m-zeus" data-src={zeusImg.src} data-label="Zeus parfümösüveg – húzd oldalra a forgatáshoz"></div>
                </div>
                <div className="stage__slot" data-product="pharaon">
                  <div className="b3d m-pharaon" data-src={pharaonImg.src} data-label="Pharaon parfümösüveg – húzd oldalra a forgatáshoz"></div>
                </div>
                <button className="stage__arrow stage__arrow--prev" type="button" data-step="-1" aria-label="Előző parfüm"><svg aria-hidden="true"><use href="#i-left"/></svg></button>
                <button className="stage__arrow stage__arrow--next" type="button" data-step="1" aria-label="Következő parfüm"><svg aria-hidden="true"><use href="#i-right"/></svg></button>
                <p className="stage__hint">Húzd a palackot · koppints rá</p>
              </div>

              <div className="info" id="info" role="tabpanel" aria-labelledby="tab-zeus">
                <p className="info__kicker" id="pKicker">Az Olümposz ura</p>
                <h3 className="info__name" id="pName">Zeus</h3>
                <p className="info__desc" id="pDesc">Napfényes borostyán, vadvirágméz és szafrán – aranyló, meleg erő, amely órákon át ragyog a bőrön.</p>
                <div className="notes" id="notes" data-reveal="">
                  <div className="notes__row"><span>Fejjegyek</span><ul className="chips" data-tier="top"></ul></div>
                  <div className="notes__row"><span>Szívjegyek</span><ul className="chips" data-tier="heart"></ul></div>
                  <div className="notes__row"><span>Alapjegyek</span><ul className="chips" data-tier="base"></ul></div>
                </div>
                <div className="buy">
                  <p className="price"><b id="pPrice">51 600 Ft</b><span>100 ml · Eau de Parfum</span></p>
                  <button className="btn btn--gold btn--xl" type="button" id="addBtn">
                    <span className="btn__txt"><svg aria-hidden="true"><use href="#i-bolt"/></svg>Kosárba teszem</span>
                    <span className="btn__done" aria-hidden="true">A kosárban!</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="meander" aria-hidden="true"></div>
          <div className="footer__in">
            <a className="logo" href="#top"><svg aria-hidden="true"><use href="#i-bolt"/></svg>ZEUS</a>
            <p>Zeus &amp; Pharaon · Eau de Parfum · 100 ml</p>
            <p>© 2026 ZEUS Parfüm</p>
            <button className="to-top" type="button" id="toTop">Vissza fel<svg aria-hidden="true"><use href="#i-up"/></svg></button>
          </div>
        </footer>

      <ZeusEffects />
    </>
  );
}
