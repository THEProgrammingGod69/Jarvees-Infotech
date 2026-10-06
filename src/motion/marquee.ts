/**
 * `[data-marquee]` rows are rendered once on the server; the seamless loop
 * needs a second copy to scroll in behind the first. Cloning it here keeps
 * the duplicate out of the HTML and the hydration payload. The clone is
 * aria-hidden (a screen reader hears each item once) and inert.
 */
export function cloneMarquees(): () => void {
  const added: Element[] = [];
  document.querySelectorAll<HTMLElement>("[data-marquee] .marquee-track").forEach((track) => {
    const first = track.firstElementChild;
    if (!first || track.children.length > 1) return;
    const copy = first.cloneNode(true) as HTMLElement;
    copy.setAttribute("aria-hidden", "true");
    copy.inert = true;
    track.appendChild(copy);
    added.push(copy);
  });
  return () => added.forEach((el) => el.remove());
}
