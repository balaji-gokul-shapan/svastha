export default function EarIllustration() {
  return (
    <svg
      viewBox="0 0 180 180"
      className="size-32 text-primary"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="90"
        cy="90"
        r="76"
        className="fill-primary/5"
      />

      <path
        d="M110 130C110 147 96 157 82 157C66 157 56 146 56 131C56 116 63 108 68 99C73 90 72 79 72 71C72 54 83 42 99 42C118 42 131 57 131 76C131 92 122 100 115 109C111 114 110 120 110 130Z"
        className="stroke-primary"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M103 77C108 70 106 62 99 59C91 56 84 62 84 71C84 83 94 86 94 97C94 107 84 111 84 123"
        className="stroke-primary/60"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <circle
        cx="84"
        cy="128"
        r="6"
        className="fill-primary/20 stroke-primary"
        strokeWidth="3"
      />

      <path
        d="M84 128C91 126 96 130 99 137"
        className="stroke-primary/50"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}