<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8" indent="yes"/>
    <xsl:template match="/">
        <html>
            <head>
                <title>网站地图</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h1>网站地图</h1>
                <table>
                    <thead>
                        <tr>
                            <th>URL</th>
                            <th>最后修改时间</th>
                            <th>更新频率</th>
                            <th>优先级</th>
                        </tr>
                    </thead>
                    <tbody>
                        <xsl:for-each select="urlset/url">
                            <tr>
                                <td><xsl:value-of select="loc"/></td>
                                <td><xsl:value-of select="lastmod"/></td>
                                <td><xsl:value-of select="changefreq"/></td>
                                <td><xsl:value-of select="priority"/></td>
                            </tr>
                        </xsl:for-each>
                    </tbody>
                </table>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>