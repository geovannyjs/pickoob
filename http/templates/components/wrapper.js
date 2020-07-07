const menu = require('./menu')


/*
<link rel="canonical" href="https://www.amazon.com/Saint-X-Alexis-Schaitkin-ebook/dp/B07N67P3TP">

<meta name="keywords" content="ebook,Schaitkin, Alexis,Saint X: A Novel,Celadon Books,560101 Celadon Books HC,Coming of Age,FICTION,FICTION / Coming of Age,FICTION / Family Life / Siblings,FICTION / Thrillers / Crime,FICTION / Women,Family Life,Family secrets,Fiction-Thriller,Fiction/City Life,Fiction/Coming of Age,Fiction/Crime,Fiction/Disaster,Fiction/Family Life - Siblings,Fiction/Literary,Fiction/Mystery &amp; Detective - General,Fiction/Psychological,Fiction/Thrillers - Domestic,Fiction/Urban,Fiction/Women,GENERAL,General Adult,Life change events,Literary,Murder - Investigation,Psychological fiction,Siblings,Sisters - Death,Thrillers (Fiction),United States,Women,psychological drama; domestic suspense; domestic noir; suspense thriller; family tragedies; missing persons; family vacation; murder mystery stories; new york city; literary fiction for women; highbrow literary fiction; caribbean; suspenseful novel; exotic novels; best beach reads; women mystery authors; female suspense authors,Coming of Age,FICTION / Coming of Age,FICTION / Family Life / Siblings,FICTION / Thrillers / Crime,FICTION / Women,Fiction/City Life,Fiction/Coming of Age,Fiction/Crime,Fiction/Disaster,Fiction/Family Life - Siblings,Fiction/Literary,Fiction/Mystery &amp; Detective - General,Fiction/Psychological,Fiction/Thrillers - Domestic,Fiction/Urban,Fiction/Women,Literary,Women">

*/

const wrapper = (p) => {

  let title = (p.title ? p.title + ' @ ' : '') + 'Pickoob - thousands of free e-books'
  let description = p.description || 'A great collection of public domain and free books in EPUB format that you can read online or download to your device.'

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>

      <meta charset="utf-8">
      <meta http-equiv="content-type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

      <meta name="title" content="${title}">
      <meta name="description" content="${description}">

      <title>${title}</title>

      <link rel="shortcut icon" type="image/png" href="/static/images/favicon.ico">
      <link rel="stylesheet" media="screen" href="/static/css/pickoob.css">

      <link rel="stylesheet" href="/static/css/purecss/pure-min.css">
      <link rel="stylesheet" href="/static/css/purecss/grids-responsive-min.css">

      <!-- Google Tag Manager -->
      <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-PWJQNRQ');</script>
      <!-- End Google Tag Manager -->

    </head>
    <body>

      <!-- Google Tag Manager (noscript) -->
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PWJQNRQ"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
      <!-- End Google Tag Manager (noscript) -->

      <div id="pickoob-header">

        <a href="/" title="Pickoob - thousands of free e-books"><img src="/static/images/logo.png" alt="Pickoob - thousands of free e-books" title="Pickoob - thousands of free e-books" class="logo"></a>

        ${menu}

        <form action="/search" class="search" class="search">
          <input type="text" id="search" name="search">
          <input type="submit" value="Search">
        </form>

      </div>

      <div id="pickoob-content">
        ${p.content}
      </div>

      <div id="pickoob-footer">
        
        ${menu}

        <br><br>
        &copy; 2020 Pickoob - thousands of free e-books. All Rights Reserved.

      </div>

    </body>
  </html>
  `
}

module.exports = wrapper