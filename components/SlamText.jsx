import { Fragment } from 'react';

// Betűkre bontott, „becsapódó” cím. A betűket már a szerver rendereli,
// így a React és a lib/zeus.js nem nyúl ugyanahhoz a DOM-hoz.
// parts: [{ text: 'Válaszd ki ' }, { text: 'az istened', className: 'gold' }]
export default function SlamText({ as: Tag = 'h2', className, parts }) {
  let i = 0;
  const label = parts.map(p => p.text).join('').replace(/\s+/g, ' ').trim();
  const words = text =>
    text.split(/(\s+)/).filter(Boolean).map((part, k) => {
      if (/^\s+$/.test(part)) return ' ';
      return (
        <span className="sw" aria-hidden="true" key={k}>
          {[...part].map(ch => {
            const n = i++;
            return <span className="sc" style={{ '--i': n }} key={n}>{ch}</span>;
          })}
        </span>
      );
    });

  return (
    <Tag className={`${className} slam`} data-slam="">
      <span className="sr-only">{label}</span>
      {parts.map((p, k) =>
        p.className
          ? <span className={p.className} key={k}>{words(p.text)}</span>
          : <Fragment key={k}>{words(p.text)}</Fragment>
      )}
    </Tag>
  );
}
