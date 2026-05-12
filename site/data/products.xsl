<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes" encoding="UTF-8"/>

  <xsl:template match="/cakeshop">
    <html lang="ru">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Тортики от Юлии — XML-каталог</title>
        <link rel="stylesheet" href="../css/style.css"/>
      </head>
      <body>
        <header class="page-header">
          <div class="container">
            <h1><xsl:value-of select="info/name"/></h1>
            <p><xsl:value-of select="info/description"/></p>
          </div>
        </header>
        <main class="container">
          <section class="xml-products">
            <h2>Каталог изделий (XML+XSL)</h2>
            <div class="product-grid">
              <xsl:for-each select="products/product">
                <article class="product-card">
                  <h3><xsl:value-of select="name"/></h3>
                  <p class="product-price"><xsl:value-of select="price"/> <xsl:value-of select="price/@currency"/></p>
                  <p class="product-weight"><xsl:value-of select="weight"/> <xsl:value-of select="weight/@unit"/></p>
                  <p class="product-desc"><xsl:value-of select="description"/></p>
                  <div class="product-tags">
                    <xsl:for-each select="tags/tag">
                      <span class="tag"><xsl:value-of select="."/></span>
                    </xsl:for-each>
                  </div>
                </article>
              </xsl:for-each>
            </div>
          </section>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
