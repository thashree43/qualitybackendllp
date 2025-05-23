import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectdb } from "./services/mongoconnect.js";
import Adminroute from "./routes/adminroute.js";
import Clientroute from "./routes/clientroute.js"
import bodyParser from "body-parser";
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

dotenv.config();

console.log("MONGOURL:", process.env.MONGOURL);

connectdb();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ 
    limit: '50mb', 
    extended: true,
    parameterLimit: 50000 
}));

app.use(express.static('public', {
    maxAge: '1d',
    limit: '50mb'
}));

console.log("CLIENT_URL:", process.env.CLIENT_URL);

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    })
);

app.use(cookieParser());
app.use('/api/admin', Adminroute);
app.use('/',Clientroute)

app.get('/sitemap.xml', async (req, res) => {
    try {
      const links = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/about', changefreq: 'monthly', priority: 0.8 },
        { url: '/services', changefreq: 'weekly', priority: 0.9 },
        { url: '/contact', changefreq: 'monthly', priority: 0.7 },
      ];
  
      const blogPosts = [
        { slug: 'seo-strategies' },
        { slug: 'growth-hacking' },
      ];
      blogPosts.forEach(post => {
        links.push({
          url: `/blog/${post.slug}`,
          changefreq: 'weekly',
          priority: 0.9,
        });
      });
  
      res.header('Content-Type', 'application/xml');
      const stream = new SitemapStream({ hostname: 'https://www.ogeraglobal.com' });
      const xml = await streamToPromise(Readable.from(links).pipe(stream));
      res.send(xml.toString());
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  });

console.log(" the port number be this ",process.env.PORT);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at: http://localhost:${port}`);
});