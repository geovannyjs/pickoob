const menu = require('./menu')

const wrapper = (p) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Pickoob e-reader</title>

    <meta charset="utf-8">
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    
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

      <a href="/" title="Pickoob e-reader"><img src="/static/images/logo.png" alt="Pickoob e-reader" title="Pickoob e-reader" class="logo"></a>

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
      &copy; 2020 Pickoob e-reader. All Rights Reserved.

    </div>

  </body>
</html>
`

module.exports = wrapper