// "use client";

// export function MaleStudentIcon({
//   className = "h-4 w-4",
// }) {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 36 32"
//       className={className}
//       fill="none"
//       aria-hidden="true"
//     >
//       <path d="M0 0h36v32H0z" fill="none" />

//       <path
//         fill="currentColor"
//         d="M22.22 20.726a.49.49 0 0 0-.425.155a.5.5 0 0 0-.126.435c.276 1.45 1.205 3.44 4.057 4.679c.338.146.86.26 1.522.403c2.478.536 6.622 1.434 7.64 5.232a.5.5 0 0 0 .967-.26c-1.177-4.387-5.872-5.404-8.395-5.95c-.584-.127-1.089-.236-1.336-.344c-1.714-.744-2.821-1.848-3.301-3.286c4.762.354 6.918-1.543 7.013-1.629a.5.5 0 0 0-.088-.805C27 17.786 27 12.361 27 10.318C27 4.605 23.152.076 18.219.005l-.141-.003h-.001C13.072.03 9 4.564 9 10.11c0 2.043 0 7.469-2.748 9.038a.503.503 0 0 0-.06.829c.138.107 3.188 2.441 6.941 1.732c-.502 1.378-1.594 2.438-3.258 3.161c-.241.105-.721.22-1.277.352c-2.54.604-7.269 1.729-8.453 6.147a.5.5 0 0 0 .967.259c1.029-3.844 5.217-4.839 7.718-5.435c.627-.149 1.122-.267 1.444-.406c2.852-1.239 3.78-3.229 4.057-4.679a.5.5 0 0 0-.159-.467a.5.5 0 0 0-.482-.104c-2.707.852-5.208-.32-6.301-.97C10 17.381 10 12.35 10 10.11c0-4.997 3.626-9.083 8.12-9.11l.106.006C22.658 1.069 26 5.072 26 10.318c0 2.241 0 7.283 2.622 9.469c-.903.516-2.962 1.351-6.402.939"
//       />
//     </svg>
//   );
// }

// export function FemaleStudentIcon({
//   className = "h-4 w-4",
// }) {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 36 32"
//       className={className}
//       fill="none"
//       aria-hidden="true"
//     >
//       <path d="M0 0h36v32H0z" fill="none" />

//       <path
//         fill="currentColor"
//         d="M.5 31.983a.503.503 0 0 0 .612-.354c1.03-3.843 5.216-4.839 7.718-5.435c.627-.149 1.122-.267 1.444-.406c2.85-1.237 3.779-3.227 4.057-4.679a.5.5 0 0 0-.165-.473c-1.484-1.281-2.736-3.204-3.526-5.416a.5.5 0 0 0-.103-.171c-1.045-1.136-1.645-2.337-1.645-3.294c0-.559.211-.934.686-1.217a.5.5 0 0 0 .243-.408C10.042 5.036 13.67 1.026 18.12 1l.107.007c4.472.062 8.077 4.158 8.206 9.324a.5.5 0 0 0 .178.369c.313.265.459.601.459 1.057c0 .801-.427 1.786-1.201 2.772a.5.5 0 0 0-.084.158c-.8 2.536-2.236 4.775-3.938 6.145a.5.5 0 0 0-.178.483c.278 1.451 1.207 3.44 4.057 4.679c.337.146.86.26 1.523.403c2.477.536 6.622 1.435 7.639 5.232a.5.5 0 0 0 .966-.26c-1.175-4.387-5.871-5.404-8.393-5.95c-.585-.127-1.09-.236-1.336-.344c-1.86-.808-3.006-2.039-3.411-3.665c1.727-1.483 3.172-3.771 3.998-6.337c.877-1.14 1.359-2.314 1.359-3.317c0-.669-.216-1.227-.644-1.663C27.189 4.489 23.19.076 18.227.005l-.149-.002c-4.873.026-8.889 4.323-9.24 9.83c-.626.46-.944 1.105-.944 1.924c0 1.183.669 2.598 1.84 3.896c.809 2.223 2.063 4.176 3.556 5.543c-.403 1.632-1.55 2.867-3.414 3.676c-.241.105-.721.22-1.277.352c-2.541.604-7.269 1.729-8.453 6.147a.5.5 0 0 0 .354.612"
//       />
//     </svg>
//   );
// }
"use client";

// Universal Mars (♂) / Venus (♀) symbols — recognizable worldwide without
// relying on stereotyped hairstyles or clothing. Stroke-based, 24x24
// viewBox, currentColor — same conventions as lucide-react icons, so these
// sit naturally next to any other icon already used in the app.
//
// Because they're vector paths, they render pixel-crisp at any size,
// including on 4K/5K displays — there's no separate "4K version" needed
// for an SVG; that concept only applies to raster formats like PNG/JPEG.

export function MaleStudentIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="14" r="5.5" />
      <line x1="13.9" y1="10.1" x2="19" y2="5" />
      <polyline points="14.5,5 19,5 19,9.5" />
    </svg>
  );
}

export function FemaleStudentIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="5.5" />
      <line x1="12" y1="13.5" x2="12" y2="21" />
      <line x1="8.5" y1="18" x2="15.5" y2="18" />
    </svg>
  );
}