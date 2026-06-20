/**
 * Soft horizontal color bands painted above the solid background but behind
 * everything else (-z-20). This gives the glass components something textured
 * to blur — a flat background color shows no visible frosting. NameBackground
 * sits above this (-z-10), so glass cards blur both the bands and the names.
 *
 * The bands drift slowly sideways; see `.gradient-backdrop` in globals.css.
 */
export default function GradientBackdrop() {
  return (
    <div
      aria-hidden
      className="gradient-backdrop fixed inset-0 -z-20 pointer-events-none"
    />
  );
}
