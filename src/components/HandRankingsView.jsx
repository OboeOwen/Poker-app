const HANDS = [
  {
    rank: 1,
    name: 'Royal Flush',
    cards: '🂡🂮🂭🂫🂪',
    display: 'A K Q J 10 ♠',
    desc: 'The best hand in poker — unbeatable.',
    example: 'A♠ K♠ Q♠ J♠ 10♠',
    top: true,
  },
  {
    rank: 2,
    name: 'Straight Flush',
    cards: '🂩🂨🂧🂦🂥',
    display: '9 8 7 6 5 ♥',
    desc: 'Five consecutive cards of the same suit.',
    example: '9♥ 8♥ 7♥ 6♥ 5♥',
    top: true,
  },
  {
    rank: 3,
    name: 'Four of a Kind',
    cards: '🂡🃁🂱🀡',
    display: 'A A A A',
    desc: 'Four cards of the same rank.',
    example: 'A♠ A♥ A♦ A♣ K♠',
    top: true,
  },
  {
    rank: 4,
    name: 'Full House',
    cards: '🂳🂣🂓',
    display: '3 3 3 + pair',
    desc: 'Three of a kind plus a pair.',
    example: 'K♠ K♥ K♦ Q♠ Q♣',
    top: false,
  },
  {
    rank: 5,
    name: 'Flush',
    cards: '♠♠♠♠♠',
    display: 'Five cards same suit',
    desc: 'Any five cards of the same suit, not in sequence.',
    example: 'A♠ J♠ 8♠ 5♠ 2♠',
    top: false,
  },
  {
    rank: 6,
    name: 'Straight',
    cards: '🂮🂭🂫🂪🂩',
    display: 'A K Q J 10 mixed',
    desc: 'Five consecutive cards of mixed suits.',
    example: '10♠ 9♥ 8♦ 7♣ 6♠',
    top: false,
  },
  {
    rank: 7,
    name: 'Three of a Kind',
    cards: '🂳🂣🂓',
    display: '7 7 7',
    desc: 'Three cards of the same rank.',
    example: '7♠ 7♥ 7♦ K♠ 2♣',
    top: false,
  },
  {
    rank: 8,
    name: 'Two Pair',
    cards: '🂮🃎 🂫🃋',
    display: 'KK + JJ',
    desc: 'Two different pairs.',
    example: 'K♠ K♥ J♦ J♣ 9♠',
    top: false,
  },
  {
    rank: 9,
    name: 'One Pair',
    cards: '🂡🃁',
    display: 'AA',
    desc: 'Two cards of the same rank.',
    example: 'A♠ A♥ K♦ Q♣ 3♠',
    top: false,
  },
  {
    rank: 10,
    name: 'High Card',
    cards: '🂡',
    display: 'Ace high',
    desc: 'No combination — highest card wins.',
    example: 'A♠ J♥ 8♦ 5♣ 2♠',
    top: false,
  },
];

// Unicode playing card suit symbols for visual display
const SUIT_CARDS = {
  'Royal Flush':     { suits: ['♠','♠','♠','♠','♠'], ranks: ['A','K','Q','J','10'] },
  'Straight Flush':  { suits: ['♥','♥','♥','♥','♥'], ranks: ['9','8','7','6','5'] },
  'Four of a Kind':  { suits: ['♠','♥','♦','♣',''], ranks: ['A','A','A','A','K'] },
  'Full House':      { suits: ['♠','♥','♦','♠','♣'], ranks: ['K','K','K','Q','Q'] },
  'Flush':           { suits: ['♠','♠','♠','♠','♠'], ranks: ['A','J','8','5','2'] },
  'Straight':        { suits: ['♠','♥','♦','♣','♠'], ranks: ['10','9','8','7','6'] },
  'Three of a Kind': { suits: ['♠','♥','♦','♠','♣'], ranks: ['7','7','7','K','2'] },
  'Two Pair':        { suits: ['♠','♥','♦','♣','♠'], ranks: ['K','K','J','J','9'] },
  'One Pair':        { suits: ['♠','♥','♦','♣','♠'], ranks: ['A','A','K','Q','3'] },
  'High Card':       { suits: ['♠','♥','♦','♣','♠'], ranks: ['A','J','8','5','2'] },
};

function isRed(suit) {
  return suit === '♥' || suit === '♦';
}

function MiniCards({ handName }) {
  const data = SUIT_CARDS[handName];
  if (!data) return null;

  const showCards = data.suits.filter(Boolean).length;

  return (
    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
      {data.ranks.map((rank, i) => {
        const suit = data.suits[i];
        if (!suit) return null;
        return (
          <div
            key={i}
            style={{
              background: '#fffef8',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '28px',
              height: '36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              lineHeight: 1.1,
              color: isRed(suit) ? '#cc2222' : '#111',
              fontWeight: 700,
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              flexShrink: 0,
            }}
          >
            <span>{rank}</span>
            <span style={{ fontSize: '0.65rem' }}>{suit}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function HandRankingsView() {
  return (
    <div className="rankings-view">
      <div className="rankings-title">
        <h2>♠ Hand Rankings ♠</h2>
        <p>Best hands at the top — highest rank wins</p>
      </div>

      <div className="hand-list">
        {HANDS.map(hand => (
          <div key={hand.rank} className="hand-item">
            <div className={`hand-rank ${hand.top ? 'top' : ''}`}>
              {hand.rank}
            </div>

            <MiniCards handName={hand.name} />

            <div className="hand-info">
              <div className="hand-name">{hand.name}</div>
              <div className="hand-desc">{hand.desc}</div>
              <div className="hand-example">{hand.example}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '0.5rem' }}>
        <div className="section-title">Tiebreaker Rules</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div>• Same hand rank: highest card(s) in hand wins.</div>
          <div>• Pairs / three-of-a-kind: higher ranked set wins.</div>
          <div>• Full house: three-of-a-kind rank compared first.</div>
          <div>• Straight / Flush: highest top card wins.</div>
          <div>• Complete tie: pot is split between players.</div>
          <div>• Ace can be high (A-K-Q-J-10) or low (A-2-3-4-5).</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Quick Tips</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div>• <strong style={{ color: 'var(--text)' }}>Pocket Aces (A♠A♥)</strong> — strongest starting hand.</div>
          <div>• <strong style={{ color: 'var(--text)' }}>Position matters</strong> — acting last gives an information advantage.</div>
          <div>• <strong style={{ color: 'var(--text)' }}>Pot odds</strong> — compare call cost to pot size to decide if it's worth it.</div>
          <div>• <strong style={{ color: 'var(--text)' }}>Bluffing</strong> — only effective when you can tell a believable story.</div>
          <div>• <strong style={{ color: 'var(--text)' }}>Fold equity</strong> — a raise can win even if your hand isn't best.</div>
        </div>
      </div>
    </div>
  );
}
