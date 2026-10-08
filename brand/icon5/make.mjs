// 최종 앱 아이콘: 재료가 소복이 담긴 뚝배기에 계란이 퐁당 (4차 2-4 + 2-3 뚝배기). node brand/icon5/make.mjs
import { writeFileSync } from 'node:fs'
const C = { acc: '#F5A869', ink: '#F3EEE9', green: '#8CC48A', greenD: '#5E9A62', red: '#EE6A50', carrot: '#F28A3C' }
const defs = `<defs>
  <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2523"/><stop offset="1" stop-color="#171413"/></linearGradient>
  <radialGradient id="glowG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#F5A869" stop-opacity=".32"/><stop offset="1" stop-color="#F5A869" stop-opacity="0"/></radialGradient>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity=".45"/></filter>
</defs>`
const egg = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="17" ry="22" fill="${C.ink}"/><ellipse cx="-5" cy="-8" rx="4" ry="6" fill="#fff" opacity=".8"/></g>`
const tomato = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="18" fill="${C.red}"/><path d="M-9 -16l9 5 9-5-4 9h-10z" fill="${C.green}"/><circle cx="-6" cy="-3" r="4" fill="#fff" opacity=".35"/></g>`
const leaf = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 22C-16 8-14-12 0-24 14-12 16 8 0 22z" fill="${C.green}"/><path d="M0 18V-18" stroke="${C.greenD}" stroke-width="3" stroke-linecap="round"/></g>`
const carrot = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M-9 -16h18l-7 38a2 2 0 0 1-4 0z" fill="${C.carrot}"/><path d="M-5 -16l-4-12M0 -16v-14M5 -16l4-12" stroke="${C.green}" stroke-width="4" stroke-linecap="round"/></g>`
const pot = (x, y, w) => `<g filter="url(#sh)"><rect x="${x - w - 16}" y="${y + 8}" width="22" height="14" rx="7" fill="#4A3830"/><rect x="${x + w - 6}" y="${y + 8}" width="22" height="14" rx="7" fill="#4A3830"/>
  <path d="M${x - w} ${y}h${2 * w}v${w * .3}c0 ${w * .5} ${-w * .4} ${w * .72} ${-w * .7} ${w * .72}h${-w * .6}c${-w * .3} 0 ${-w * .7} ${-w * .22} ${-w * .7} ${-w * .72}z" fill="#5A4134"/>
  <rect x="${x - w - 6}" y="${y - 8}" width="${2 * w + 12}" height="16" rx="8" fill="#6E5243"/>
  <path d="M${x - w * .7} ${y + w * .28}c4 ${w * .3} 16 ${w * .48} 34 ${w * .55}" fill="none" stroke="#8A6553" stroke-opacity=".6" stroke-width="7" stroke-linecap="round"/></g>`

// 재료는 뚝배기보다 먼저 그려서 아랫부분이 테두리 뒤로 숨게 한다
const art = `<circle cx="128" cy="160" r="100" fill="url(#glowG)"/>
  ${egg(130, 62, 1.35)}
  ${leaf(80, 136, 1.15, -40)}${tomato(114, 132, 1.1)}${carrot(158, 130, 1.1, 30)}${leaf(186, 138, 1, 40)}
  ${pot(128, 150, 84)}`
const svg = (bg = true) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>있잖아</title>${defs}${bg ? '<rect width="256" height="256" fill="url(#bgG)"/>' : ''}${art}</svg>`
writeFileSync('brand/app-icon.svg', svg())
writeFileSync('public/favicon.svg', svg())
console.log('ok')
