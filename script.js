window.addEventListener("load",()=>{setTimeout(()=>document.getElementById("loader").classList.add("done"),500)});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
const menu=document.querySelector(".menu-toggle"), links=document.querySelector(".nav-links");
menu.addEventListener("click",()=>links.classList.toggle("open"));
links.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")));
function tick(){const target=new Date("2026-10-31T11:00:00+05:30").getTime(), now=Date.now(), diff=Math.max(0,target-now);const values={days:Math.floor(diff/86400000),hours:Math.floor(diff%86400000/3600000),minutes:Math.floor(diff%3600000/60000),seconds:Math.floor(diff%60000/1000)};Object.entries(values).forEach(([id,v])=>document.getElementById(id).textContent=String(v).padStart(2,"0"));if(diff===0)document.querySelector(".countdown-inner h2").textContent="Today is the day!";}
tick();setInterval(tick,1000);

// Scroll progress bar
const progressBar = document.querySelector(".scroll-progress");
function updateProgress(){
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const amount = max > 0 ? (window.scrollY / max) * 100 : 0;
  if(progressBar) progressBar.style.width = amount + "%";
}
window.addEventListener("scroll", updateProgress, {passive:true});
updateProgress();

// A quick, subtle transition wipe when moving between major sections.
const wipe = document.querySelector(".page-wipe");
document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener("click",()=>{
    if(!wipe) return;
    wipe.classList.remove("play");
    void wipe.offsetWidth;
    wipe.classList.add("play");
  });
});

// Tiny lift-and-glow effect for the main hero button on pointer devices.
document.querySelectorAll(".magnetic-button").forEach(button=>{
  button.addEventListener("pointermove",event=>{
    if(window.matchMedia("(pointer: coarse)").matches) return;
    const rect=button.getBoundingClientRect();
    const x=(event.clientX-rect.left-rect.width/2)*.08;
    const y=(event.clientY-rect.top-rect.height/2)*.12;
    button.style.transform=`translate(${x}px,${y}px)`;
  });
  button.addEventListener("pointerleave",()=>button.style.transform="");
});

// Animate countdown numbers when they change.
document.querySelectorAll(".countdown strong").forEach(el=>{
  const observer=new MutationObserver(()=>{
    el.classList.remove("tick");
    void el.offsetWidth;
    el.classList.add("tick");
  });
  observer.observe(el,{childList:true,characterData:true,subtree:true});
});

// Gallery: staggered entrance, subtle pointer tilt, and full-screen photo viewer.
(() => {
  const items = [...document.querySelectorAll(".gallery-item")];
  if (!items.length) return;

  items.forEach(item => item.classList.add("gallery-enter"));

  if ("IntersectionObserver" in window) {
    const galleryObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("gallery-shown");
          galleryObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -35px 0px" });
    items.forEach(item => galleryObserver.observe(item));
  } else {
    items.forEach(item => item.classList.add("gallery-shown"));
  }

  // Keep the tilt subtle and only enable it for mouse/trackpad users.
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(item => {
      item.classList.add("gallery-tilting");
      item.addEventListener("pointermove", event => {
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 5;
        const rotateX = (0.5 - y) * 5;
        item.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
        const img = item.querySelector("img");
        if (img) img.style.transform = `scale(1.075) translate(${(x-.5)*-8}px, ${(y-.5)*-8}px)`;
      });
      item.addEventListener("pointerleave", () => {
        item.style.transform = "";
        const img = item.querySelector("img");
        if (img) img.style.transform = "";
      });
    });
  }

  const photos = items.map(item => {
    const img = item.querySelector("img");
    return img ? { src: img.currentSrc || img.src, alt: img.alt || "Wedding gallery photo",
      caption: item.querySelector("figcaption")?.textContent?.trim() || img.alt || "" } : null;
  }).filter(Boolean);
  if (!photos.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Wedding photo gallery");
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close photo viewer">×</button>
    <button class="lightbox-prev" type="button" aria-label="Previous photo">‹</button>
    <figure style="margin:0;max-width:100%;text-align:center">
      <img alt="" />
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
    <button class="lightbox-next" type="button" aria-label="Next photo">›</button>`;
  document.body.appendChild(lightbox);

  const bigImg = lightbox.querySelector("img");
  const caption = lightbox.querySelector(".lightbox-caption");
  let current = 0;
  let previousFocus = null;

  function showPhoto(index) {
    current = (index + photos.length) % photos.length;
    bigImg.style.opacity = "0";
    bigImg.style.transform = "translateY(12px) scale(.98)";
    window.setTimeout(() => {
      bigImg.src = photos[current].src;
      bigImg.alt = photos[current].alt;
      caption.textContent = photos[current].caption;
      bigImg.onload = () => {
        bigImg.style.opacity = "";
        bigImg.style.transform = "";
      };
      if (bigImg.complete) {
        bigImg.style.opacity = "";
        bigImg.style.transform = "";
      }
    }, 100);
  }
  function openPhoto(index) {
    previousFocus = document.activeElement;
    showPhoto(index);
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox-close").focus();
  }
  function closePhoto() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }

  items.forEach((item, index) => {
    const img = item.querySelector("img");
    if (!img) return;
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `Open photo ${index + 1} in gallery`);
    img.addEventListener("click", () => openPhoto(index));
    img.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPhoto(index);
      }
    });
  });
  lightbox.querySelector(".lightbox-close").addEventListener("click", closePhoto);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showPhoto(current - 1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => showPhoto(current + 1));
  lightbox.addEventListener("click", event => { if (event.target === lightbox) closePhoto(); });
  document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closePhoto();
    if (event.key === "ArrowLeft") showPhoto(current - 1);
    if (event.key === "ArrowRight") showPhoto(current + 1);
  });
})();

