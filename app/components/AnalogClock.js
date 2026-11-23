export default function AnalogClock({ parts, className = "" }) {
  const { h, m, s } = parts;
  const secDeg = s * 6;
  const minDeg = m * 6 + s * 0.1;
  const hourDeg = (h % 12) * 30 + m * 0.5;

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="นาฬิกาแบบเข็ม">
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />

      {Array.from({ length: 60 }).map((_, i) => {
        const major = i % 5 === 0;
        return (
          <line
            key={i}
            x1="100"
            x2="100"
            y1={major ? 9 : 12}
            y2={major ? 19 : 16}
            stroke="currentColor"
            strokeOpacity={major ? 0.8 : 0.35}
            strokeWidth={major ? 2.5 : 1}
            transform={`rotate(${i * 6} 100 100)`}
          />
        );
      })}

      {Array.from({ length: 12 }).map((_, i) => {
        const n = i + 1;
        const a = (n / 12) * Math.PI * 2;
        return (
          <text
            key={n}
            x={100 + Math.sin(a) * 70}
            y={100 - Math.cos(a) * 70}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="15"
            fontWeight="500"
            fill="currentColor"
            opacity="0.85"
          >
            {n}
          </text>
        );
      })}

      <line x1="100" y1="100" x2="100" y2="58" stroke="currentColor" strokeWidth="5" strokeLinecap="round" transform={`rotate(${hourDeg} 100 100)`} />
      <line x1="100" y1="100" x2="100" y2="36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${minDeg} 100 100)`} />
      <line x1="100" y1="114" x2="100" y2="26" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" transform={`rotate(${secDeg} 100 100)`} />
      <circle cx="100" cy="100" r="5" fill="#ef4444" />
      <circle cx="100" cy="100" r="2" fill="#fff" />
    </svg>
  );
}