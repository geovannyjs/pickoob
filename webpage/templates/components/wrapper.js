const wrapper = (p) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Pickoob e-reader</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="shortcut icon" type="image/png" href="@routes.Assets.versioned("images/favicon.png")">

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

    <a href="/"><img src="/static/images/logo.png" alt="Pickoob e-reader" title="Pickoob e-reader"></a>

    <a href="/books">Books</a>&nbsp;
    <a href="/authors">Authors</a>&nbsp;
    <a href="/shelves">Shelves</a>&nbsp;

    <form method="get"><input type="text" id="search" name="search"> <input formaction="/search" type="submit" id="searchSub" value="Search"></form>

    ${p.content}

    <div>
      <a href="/books">Books</a>&nbsp;
      <a href="/authors">Authors</a>&nbsp;
      <a href="/shelves">Shelves</a>&nbsp;
    </div>

  </body>
</html>
`

module.exports = wrapper