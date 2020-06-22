const wrapper = require('../components/wrapper')


const view = (b) => {
  let content = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
<script src="http://futurepress.github.io/epub.js/dist/epub.js"></script>

<style>

#viewer.spreads {
  width: 900px;
  height: 600px;
  box-shadow: 0 0 4px #ccc;
  border-radius: 5px;
  padding: 0;
  /*position: relative;*/
  margin: 10px auto;
  background: white url('ajax-loader.gif') center center no-repeat;
  top: calc(50vh - 400px);
}

#viewer.spreads .epub-view > iframe {
    background: white;
}

#viewer.scrolled {
  overflow: hidden;
  width: 800px;
  margin: 0 auto;
  position: relative;
  background: url('ajax-loader.gif') center center no-repeat;

}

#viewer.scrolled .epub-container {
  background: white;
  box-shadow: 0 0 4px #ccc;
  margin: 10px;
  padding: 20px;
}

#viewer.scrolled .epub-view > iframe {
    background: white;
}

#prev {
  left: 0;
}

#next {
  right: 0;
}

#toc {
  display: block;
  margin: 10px auto;
}

@media (min-width: 1000px) {
  #viewer.spreads:after {
    position: absolute;
    width: 1px;
    border-right: 1px #000 solid;
    height: 90%;
    z-index: 1;
    left: 50%;
    margin-left: -1px;
    top: 5%;
    opacity: .15;
    box-shadow: -2px 0 15px rgba(0, 0, 0, 1);
    content:  "";
  }

  #viewer.spreads.single:after {
    display: none;
  }

  #prev {
    left: 40px;
  }

  #next {
    right: 40px;
  }
}

.arrow {
  position: fixed;
  top: 50%;
  margin-top: -32px;
  font-size: 64px;
  color: #E2E2E2;
  font-family: arial, sans-serif;
  font-weight: bold;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  text-decoration: none;
}

.navlink {
  margin: 14px;
  display: block;
  text-align: center;
  text-decoration: none;
  color: #ccc;
}

.arrow:hover, .navlink:hover {
  color: #777;
}

.arrow:active, .navlink:hover {
  color: #000;
}

#book-wrapper {
  width: 480px;
  height: 640px;
  overflow: hidden;
  border: 1px solid #ccc;
  margin: 28px auto;
  background: #fff;
  border-radius: 0 5px 5px 0;
  position: absolute;
}

#book-viewer {
  width: 480px;
  height: 660px;
  margin: -30px auto;
  -moz-box-shadow:      inset 10px 0 20px rgba(0,0,0,.1);
  -webkit-box-shadow:   inset 10px 0 20px rgba(0,0,0,.1);
  box-shadow:           inset 10px 0 20px rgba(0,0,0,.1);
}

#book-viewer iframe {
  padding: 40px 40px;
}

#controls {
  position: absolute;
  bottom: 16px;
  left: 50%;
  width: 400px;
  margin-left: -200px;
  text-align: center;
  display: none;
}

#controls > input[type=range] {
    width: 400px;
}

#navigation {
  width: 400px;
  height: 100vh;
  position: absolute;
  overflow: auto;
  top: 0;
  left: 0;
  background: #777;
  -webkit-transition: -webkit-transform .25s ease-out;
  -moz-transition: -moz-transform .25s ease-out;
  -ms-transition: -moz-transform .25s ease-out;
  transition: transform .25s ease-out;

}

#navigation.fixed {
  position: fixed;
}

#navigation h1 {
  width: 200px;
  font-size: 16px;
  font-weight: normal;
  color: #fff;
  margin-bottom: 10px;
}

#navigation h2 {
  font-size: 14px;
  font-weight: normal;
  color: #B0B0B0;
  margin-bottom: 20px;
}

#navigation ul {
  padding-left: 36px;
  margin-left: 0;
  margin-top: 12px;
  margin-bottom: 12px;
  width: 340px;
}

#navigation ul li {
  list-style: decimal;
  margin-bottom: 10px;
  color: #cccddd;
  font-size: 12px;
  padding-left: 0;
  margin-left: 0;
}

#navigation ul li a {
  color: #ccc;
  text-decoration: none;
}

#navigation ul li a:hover {
  color: #fff;
  text-decoration: underline;
}

#navigation ul li a.active {
  color: #fff;
}

#navigation #cover {
  display: block;
  margin: 24px auto;
}

#navigation #closer {
  position: absolute;
  top: 0;
  right: 0;
  padding: 12px;
  color: #cccddd;
  width: 24px;
}

#navigation.closed {
  -webkit-transform: translate(-400px, 0);
  -moz-transform: translate(-400px, 0);
  -ms-transform: translate(-400px, 0);
}

svg {
  display: block;
}

.close-x {
  stroke: #cccddd;
  fill: transparent;
  stroke-linecap: round;
  stroke-width: 5;
}

.close-x:hover {
  stroke: #fff;
}

#opener {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px;
  stroke: #E2E2E2;
  fill: #E2E2E2;

}

#opener:hover {
  stroke: #777;
  fill: #777;
}

</style>

<h1>${b.title}</h1>
issued: ${b.issued}<br>
rights: ${b.rights}<br><br>

<select id="toc"></select>
<div id="viewer" class="spreads"></div>
<a id="prev" href="#prev" class="arrow">‹</a>
<a id="next" href="#next" class="arrow">›</a>

<script>
  var params = URLSearchParams && new URLSearchParams(document.location.search.substring(1));
  var url = params && params.get("url") && decodeURIComponent(params.get("url"));
  var currentSectionIndex = (params && params.get("loc")) ? params.get("loc") : undefined;

  // Load the opf
  var book = ePub(url || "https://s3.amazonaws.com/moby-dick/moby-dick.epub");
  var rendition = book.renderTo("viewer", {
    width: "100%",
    height: 600,
    spread: "always"
  });

  rendition.display(currentSectionIndex);

  book.ready.then(() => {

    var next = document.getElementById("next");

    next.addEventListener("click", function(e){
      book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
      e.preventDefault();
    }, false);

    var prev = document.getElementById("prev");
    prev.addEventListener("click", function(e){
      book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
      e.preventDefault();
    }, false);

    var keyListener = function(e){

      // Left Key
      if ((e.keyCode || e.which) == 37) {
        book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
      }

      // Right Key
      if ((e.keyCode || e.which) == 39) {
        book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
      }

    };

    rendition.on("keyup", keyListener);
    document.addEventListener("keyup", keyListener, false);

  })

  var title = document.getElementById("title");

  rendition.on("rendered", function(section){
    var current = book.navigation && book.navigation.get(section.href);

    if (current) {
      var $select = document.getElementById("toc");
      var $selected = $select.querySelector("option[selected]");
      if ($selected) {
        $selected.removeAttribute("selected");
      }

      var $options = $select.querySelectorAll("option");
      for (var i = 0; i < $options.length; ++i) {
        let selected = $options[i].getAttribute("ref") === current.href;
        if (selected) {
          $options[i].setAttribute("selected", "");
        }
      }
    }

  });

  rendition.on("relocated", function(location){
    console.log(location);

    var next = book.package.metadata.direction === "rtl" ?  document.getElementById("prev") : document.getElementById("next");
    var prev = book.package.metadata.direction === "rtl" ?  document.getElementById("next") : document.getElementById("prev");

    if (location.atEnd) {
      next.style.visibility = "hidden";
    } else {
      next.style.visibility = "visible";
    }

    if (location.atStart) {
      prev.style.visibility = "hidden";
    } else {
      prev.style.visibility = "visible";
    }

  });

  rendition.on("layout", function(layout) {
    let viewer = document.getElementById("viewer");

    if (layout.spread) {
      viewer.classList.remove('single');
    } else {
      viewer.classList.add('single');
    }
  });

  window.addEventListener("unload", function () {
    console.log("unloading");
    this.book.destroy();
  });

  book.loaded.navigation.then(function(toc){
    var $select = document.getElementById("toc"),
        docfrag = document.createDocumentFragment();

    toc.forEach(function(chapter) {
      var option = document.createElement("option");
      option.textContent = chapter.label;
      option.setAttribute("ref", chapter.href);

      docfrag.appendChild(option);
    });

    $select.appendChild(docfrag);

    $select.onchange = function(){
      var index = $select.selectedIndex,
        url = $select.options[index].getAttribute("ref");
      rendition.display(url);
      return false;
    };

  });

</script>

  `
  return wrapper({ content })
}

module.exports = view