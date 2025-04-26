(() => {
  const stored = localStorage.getItem("skin");
  const getSkin = () => stored || "{{ site.minimal_mistakes_skin }}";
  const nextSkin = getSkin() === "contrast" ? "dark" : "contrast";

  document.documentElement.setAttribute("data-skin", getSkin());

  const btn = document.createElement("button");
  btn.id = "skin-toggle";
  btn.innerText = "🌓";
  btn.style = "position:fixed;bottom:1rem;right:1rem;";
  document.body.appendChild(btn);

  btn.onclick = () => {
    document.documentElement.setAttribute("data-skin", nextSkin);
    localStorage.setItem("skin", nextSkin);
    location.reload();
  };
})();
